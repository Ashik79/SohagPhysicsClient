import API_URL from '../apiConfig';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Provider';
import {
    MdClose, MdSettings, MdKey, MdCameraAlt,
    MdAnalytics, MdSms, MdCheckCircle, MdError,
    MdCloudUpload, MdFileDownload, MdSearch
} from 'react-icons/md';
import OmrScanner from './OmrScanner';
import OmrSheetDesigner from './Download/OmrSheetDesigner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * OMR HUB — THE PREMIUM EXAM WORKFLOW
 * 1. Answer Key & Design
 * 2. Pro Scanner (with Universal Identity)
 * 3. Results Management
 * 4. Bulk SMS Notification
 */

const OmrHub = ({ exam, onClose, students }) => {
    const { notifySuccess, notifyFailed } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('design');
    const [answerKey, setAnswerKey] = useState(() => {
        if (exam?.answerKey && Object.keys(exam.answerKey).length > 0) return exam.answerKey;
        const saved = localStorage.getItem(`omr_key_${exam._id}`);
        return saved ? JSON.parse(saved) : {};
    });

    // Batch Scanned Results
    const [scannedResults, setScannedResults] = useState(() => {
        const saved = localStorage.getItem(`omr_results_draft_${exam._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [negativeMarking, setNegativeMarking] = useState(0);
    // activeQuestions: how many of the 60 fixed bubbles to evaluate
    // Valid options: 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
    const VALID_Q_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const snapToValidQ = (n) => VALID_Q_OPTIONS.reduce((prev, cur) => Math.abs(cur - n) < Math.abs(prev - n) ? cur : prev);
    const [activeQuestions, setActiveQuestions] = useState(snapToValidQ(exam?.mcqTotal || 25));

    // Editing states
    const [editingRollId, setEditingRollId] = useState(null);
    const [tempRollValue, setTempRollValue] = useState('');
    const [logoData, setLogoData] = useState(null);

    // ── Fetch Logo for PDFs
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const logoPath = '/logo.png';
                const response = await fetch(logoPath);
                if (!response.ok) return;
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => setLogoData(reader.result);
                reader.readAsDataURL(blob);
            } catch (error) { console.error("Logo fetch error:", error); }
        };
        fetchLogo();
    }, []);

    // Auto-Save to LocalStorage — strip capturedImg to avoid QuotaExceededError
    useEffect(() => {
        try {
            const toStore = scannedResults.map(({ capturedImg, ...rest }) => rest);
            localStorage.setItem(`omr_results_draft_${exam._id}`, JSON.stringify(toStore));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('LocalStorage full — draft not saved.');
            }
        }
    }, [scannedResults, exam._id]);

    const handleClearDraft = () => {
        if (window.confirm("Clear all unsaved results?")) {
            setScannedResults([]);
            localStorage.removeItem(`omr_results_draft_${exam._id}`);
        }
    };

    // Save Answer Key to LocalStorage
    useEffect(() => {
        localStorage.setItem(`omr_key_${exam._id}`, JSON.stringify(answerKey));
    }, [answerKey, exam._id]);

    // --- Identification Logic ---
    const identifyStudent = (roll) => {
        if (!roll) return { roll: 'N/A', name: 'Invalid Roll', batch: '-', phone: '' };
        // Clean roll for comparison (trim and remove leading zeros, but keep '0' as '0')
        const normalize = (r) => String(r || '').trim().replace(/^0+/, '') || '0';
        const cleanRoll = normalize(roll);

        const student = students.find(s => {
            return normalize(s.roll) === cleanRoll || normalize(s.id) === cleanRoll;
        });
        return student || { roll: roll, name: 'Unknown Student', batch: 'Not Found', phone: '' };
    };

    const handleScanComplete = (data) => {
        if (data.type === 'MASTER_KEY') {
            const newKey = data.key; // We use flat key for simplicity in current universal OMR
            setAnswerKey(newKey);
            saveAnswerKeyCloud(newKey);
            return;
        }

        // STRICTION: Reject unknown and invalid rolls immediately
        const student = identifyStudent(data.roll);
        if (data.roll.toString().includes('?')) {
            notifyFailed(`রোল #${data.roll} অসম্পূর্ণ! হাতে লিখে সঠিক রোল দিন।`);
            return;
        }
        if (student.name === 'Unknown Student') {
            notifyFailed(`রোল #${data.roll} ডাটাবেজে নেই! আগে স্টুডেন্ট এড করুন।`);
            return;
        }

        // ── Answer Key completeness check
        const answeredCount = Object.keys(answerKey).length;
        if (answeredCount < activeQuestions) {
            const proceed = window.confirm(
                `⚠️ Answer Key অসম্পূর্ণ!\n\n` +
                `${answeredCount}/${activeQuestions} প্রশ্নের উত্তর দেয়া হয়েছে।\n` +
                `বাকি ${activeQuestions - answeredCount} টি প্রশ্নের উত্তর নেই — ওগুলো "nokey" হিসেবে পাবে।\n\n` +
                `তারপরো scan সাবমিট করতে চাইলে OK ভুলুন।`
            );
            if (!proceed) return;
        }

        // ── Duplicate roll detection (with normalization)
        const normalize = (r) => String(r || '').trim().replace(/^0+/, '') || '0';
        const currentRollNormalized = normalize(data.roll);

        const existingIndex = scannedResults.findIndex(
            r => normalize(r.roll) === currentRollNormalized
        );

        if (existingIndex !== -1) {
            const overwrite = window.confirm(
                `⚠️ Duplicate Scan!\n\nRoll: ${data.roll} ইতিমধ্যে scan করা আছে।\n\n` +
                `পুরনো result override করতে চাইলে OK ভুলুন।`
            );
            if (!overwrite) return;
            // Override the existing entry
            const finalScore = Math.max(0, data.score - (data.wrong * negativeMarking));
            const updatedResult = {
                ...data,
                score: parseFloat(finalScore.toFixed(2)),
                studentName: student.name,
                studentBatch: student.batch,
                studentPhone: student.phone,
                writtenMarks: scannedResults[existingIndex].writtenMarks || 0,
                id: scannedResults[existingIndex].id,
                scanTimestamp: new Date().toISOString()
            };
            setScannedResults(prev => prev.map((r, i) => i === existingIndex ? updatedResult : r));
            notifySuccess(`Updated: ${student.name}`);
            return;
        }

        // ── Normal new scan
        const finalScore = Math.max(0, data.score - (data.wrong * negativeMarking));
        const result = {
            ...data,
            score: parseFloat(finalScore.toFixed(2)),
            studentName: student.name,
            studentBatch: student.batch,
            studentPhone: student.phone,
            writtenMarks: 0,
            id: Date.now() + Math.random(),
            scanTimestamp: new Date().toISOString()
        };
        setScannedResults(prev => [result, ...prev]);
        notifySuccess(`✓ Added to List: ${student.name}`);
    };

    const handleUpdateWritten = (id, marks) => {
        setScannedResults(prev => prev.map(res =>
            res.id === id ? { ...res, writtenMarks: parseFloat(marks) || 0 } : res
        ));
    };

    const handleUpdateRoll = (id, newRoll) => {
        const student = identifyStudent(newRoll);

        if (student.name === 'Unknown Student') {
            notifyFailed(`রোল #${newRoll} ডাটাবেজে পাওয়া যায়নি।`);
            return;
        }

        setScannedResults(prev => prev.map(res =>
            res.id === id ? {
                ...res,
                roll: newRoll,
                studentName: student.name,
                studentBatch: student.batch,
                studentPhone: student.phone
            } : res
        ));
    };

    const saveAnswerKeyCloud = async (customKey) => {
        const keyToSave = customKey || answerKey;
        try {
            const res = await fetch(`${API_URL}/exam/update/${exam._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answerKey: keyToSave,
                    mcqTotal: activeQuestions // also sync the question count
                })
            });
            if (res.ok) {
                notifySuccess("Answer Key saved to Cloud!");
                localStorage.setItem(`omr_key_${exam._id}`, JSON.stringify(keyToSave));
            }
        } catch (e) {
            notifyFailed("Failed to save Key to Cloud");
        }
    };

    const handleSaveAll = async () => {
        if (scannedResults.length === 0) return;
        setIsSaving(true);

        try {
            const formattedBatch = scannedResults.map(res => ({
                id: res.roll.toString(),
                name: res.studentName,
                mcqMarks: res.score,
                writenMarks: res.writtenMarks || 0,
                total: res.score + (res.writtenMarks || 0),
                date: exam.date,
                mcqTotal: exam.mcqTotal,
                writenTotal: exam.writenTotal
            }));

            // Merge Logic: Overwrite existing student result if ID matches, else append
            const existingResults = [...(exam.results || [])];
            const finalResultsMap = new Map();

            // First, load existing results into a map
            existingResults.forEach(r => finalResultsMap.set(r.id, r));

            // Then, overwrite with new batch (this handles updates/merges)
            formattedBatch.forEach(r => finalResultsMap.set(r.id, r));

            const finalResultsArray = Array.from(finalResultsMap.values());

            // 1. Update Exam Collection (Results + Answer Key)
            const examRes = await fetch(`${API_URL}/exam/update/${exam._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    results: finalResultsArray,
                    answerKey: answerKey,
                    mcqTotal: activeQuestions
                })
            });

            if (!examRes.ok) throw new Error("Failed to update exam");

            // 2. Update Student Profiles (Bulk)
            const studentTempResults = formattedBatch.map(res => ({
                id: res.id,
                exams: [{
                    title: exam.title,
                    examId: exam._id,
                    mcqMarks: res.mcqMarks,
                    writenMarks: res.writenMarks,
                    total: res.total,
                    date: exam.date,
                    mcqTotal: exam.mcqTotal,
                    writenTotal: exam.writenTotal,
                    day: exam.day,
                    month: exam.month,
                    year: exam.year
                }]
            }));

            const bulkRes = await fetch(`${API_URL}/addbulkresults`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentTempResults)
            });

            if (bulkRes.ok) {
                notifySuccess(`Successfully saved ${scannedResults.length} results!`);
                setScannedResults([]);
                if (onClose) onClose();
            } else {
                notifyFailed("Failed to update student profiles");
            }
        } catch (error) {
            console.error(error);
            notifyFailed("Error saving results");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Bulk SMS ─────────────────────────────────────────────────────────
    const [isSendingSms, setIsSendingSms] = useState(false);
    const handleSendBulkSms = async () => {
        if (scannedResults.length === 0) return;
        setIsSendingSms(true);
        try {
            const messages = scannedResults
                .filter(r => r.studentPhone)
                .map(r => ({
                    phone: r.studentPhone,
                    message: `Dear Guardian, ${r.studentName} scored ${r.score}/${exam.mcqTotal} in "${exam.title}". Keep it up! -Sohag Physics`
                }));
            if (messages.length === 0) {
                notifyFailed('No phone numbers found for scanned students.');
                return;
            }
            const res = await fetch(`${API_URL}/send-bulk-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });
            if (res.ok) notifySuccess(`SMS sent to ${messages.length} guardians!`);
            else notifyFailed('SMS sending failed. Check API config.');
        } catch {
            notifyFailed('SMS gateway error.');
        } finally {
            setIsSendingSms(false);
        }
    };

    const filteredResults = scannedResults.filter(res =>
        res.roll.toString().includes(searchTerm) ||
        res.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Complete the suite: Professional Excel/Database Export
    const handleExportExcel = () => {
        if (scannedResults.length === 0) return;
        const exportData = scannedResults.map(res => ({
            "Roll Number": res.roll,
            "Student Name": res.studentName,
            "Batch": res.studentBatch,
            "Target Set": res.set,
            "MCQ Score": res.score,
            "Written Marks": res.writtenMarks || 0,
            "Total Score": res.score + (res.writtenMarks || 0),
            "Correct Answers": res.correct,
            "Wrong Answers": res.wrong,
            "Unattempted": res.unattempted,
            "Scan Time": res.scanTimestamp ? new Date(res.scanTimestamp).toLocaleString() : '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "OMR_Results");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, `OMR_${exam.title}_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const tabs = [
        { id: 'design', label: '1. Design & Key', icon: MdSettings },
        { id: 'scan', label: '2. Pro Scanner', icon: MdCameraAlt },
        { id: 'results', label: '3. Results List', icon: MdAnalytics },
        { id: 'analytics', label: '4. Deep Analysis', icon: MdAnalytics },
        { id: 'sms', label: '5. Bulk SMS', icon: MdSms },
    ];

    // --- Improved Student Report Generator (Individual) ---
    const generateStudentReport = (res) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        drawIndividualReport(doc, res);
        doc.save(`Report_${res.roll}_${res.studentName.replace(/\s+/g, '_')}.pdf`);
    };

    const drawIndividualReport = (doc, res) => {
        const pageW = doc.internal.pageSize.width;
        const pageH = doc.internal.pageSize.height;
        const accentColor = [14, 165, 233]; // Sky 500

        // External Border
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.8);
        doc.rect(5, 5, pageW - 10, pageH - 10);
        doc.setLineWidth(0.2);
        doc.rect(7, 7, pageW - 14, pageH - 14);

        // Header Section
        if (logoData) {
            doc.addImage(logoData, 'PNG', pageW / 2 - 15, 12, 30, 30);
        }

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('SOHAG PHYSICS', pageW / 2, 52, { align: 'center' });

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('ACADEMIC EXCELLENCE & DIGITAL OMR SYSTEM', pageW / 2, 58, { align: 'center' });

        doc.setDrawColor(230);
        doc.line(20, 65, pageW - 20, 65);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT PERFORMANCE REPORT', pageW / 2, 75, { align: 'center' });

        // Info Box
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, 82, pageW - 40, 38, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(...accentColor);
        doc.text('STUDENT INFORMATION', 25, 89);

        doc.setTextColor(60);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name:`, 25, 98); doc.setFont('helvetica', 'bold'); doc.text(res.studentName || 'N/A', 55, 98);
        doc.setFont('helvetica', 'normal'); doc.text(`Roll:`, 25, 106); doc.setFont('helvetica', 'bold'); doc.text(res.roll || 'N/A', 55, 106);
        doc.setFont('helvetica', 'normal'); doc.text(`Exam:`, 110, 98); doc.setFont('helvetica', 'bold'); doc.text(exam.title || 'N/A', 135, 98);
        doc.setFont('helvetica', 'normal'); doc.text(`Date:`, 110, 106); doc.setFont('helvetica', 'bold'); doc.text(exam.date || 'N/A', 135, 106);
        doc.setFont('helvetica', 'normal'); doc.text(`Batch:`, 25, 114); doc.setFont('helvetica', 'bold'); doc.text(res.studentBatch || 'N/A', 55, 114);

        // Score Table
        doc.autoTable({
            startY: 128,
            head: [['COMPONENT', 'FULL MARKS', 'OBTAINED', 'PERCENTAGE']],
            body: [
                ['MCQ Assessment', activeQuestions, res.correct, `${((res.correct / activeQuestions) * 100).toFixed(1)}%`],
                ['Grand Total', activeQuestions, res.score, `${((res.score / activeQuestions) * 100).toFixed(1)}%`],
            ],
            theme: 'grid',
            headStyles: { fillColor: accentColor, textColor: 255, halign: 'center' },
            bodyStyles: { halign: 'center', fontSize: 10 },
            columnStyles: { 0: { halign: 'left', cellWidth: 70 } },
            margin: { left: 20, right: 20 }
        });

        // Stats Summary
        const scoreY = doc.lastAutoTable.finalY + 15;
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(20, scoreY, 50, 25, 3, 3, 'F');
        doc.setFontSize(8); doc.setTextColor(21, 128, 61); doc.text('CORRECT', 45, scoreY + 8, { align: 'center' });
        doc.setFontSize(14); doc.text(res.correct.toString(), 45, scoreY + 18, { align: 'center' });

        doc.setFillColor(254, 242, 242);
        doc.roundedRect(80, scoreY, 50, 25, 3, 3, 'F');
        doc.setFontSize(8); doc.setTextColor(185, 28, 28); doc.text('WRONG', 105, scoreY + 8, { align: 'center' });
        doc.setFontSize(14); doc.text(res.wrong.toString(), 105, scoreY + 18, { align: 'center' });

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(140, scoreY, 50, 25, 3, 3, 'F');
        doc.setFontSize(8); doc.setTextColor(100); doc.text('SCORE', 165, scoreY + 8, { align: 'center' });
        doc.setFontSize(14); doc.text(res.score.toString(), 165, scoreY + 18, { align: 'center' });

        // Answers Detail
        if (res.breakdown) {
            doc.autoTable({
                startY: scoreY + 35,
                head: [['Q#', 'YOUR ANS', 'CORRECT KEY', 'RESULT']],
                body: res.breakdown.map(q => [q.qNum, q.detected || '—', q.keyAnswer || '?', q.result.toUpperCase()]),
                theme: 'striped',
                headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
                styles: { fontSize: 8, halign: 'center' },
                margin: { left: 20, right: 20 },
                tableWidth: 'auto'
            });
        }

        // Footer
        const sigY = pageH - 35;
        doc.setDrawColor(200);
        doc.line(30, sigY, 70, sigY);
        doc.setFontSize(8); doc.setTextColor(100);
        doc.text("Guardian's Signature", 50, sigY + 5, { align: 'center' });
        doc.line(140, sigY, 180, sigY);
        doc.text("Authorized Signature", 160, sigY + 5, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(180);
        doc.text(`Generated on ${new Date().toLocaleString()} | Digital Report Card by Sohag Physics Management`, pageW / 2, pageH - 10, { align: 'center' });
    };

    // --- Bulk Reports Generator ---
    const handleBulkReportsPDF = () => {
        if (scannedResults.length === 0) return;
        const doc = new jsPDF('p', 'mm', 'a4');

        scannedResults.forEach((res, i) => {
            if (i > 0) doc.addPage();
            drawIndividualReport(doc, res);
        });

        doc.save(`All_Reports_${exam.title.replace(/\s+/g, '_')}.pdf`);
        notifySuccess(`${scannedResults.length} reports generated successfully.`);
    };

    const handleMeritListPDF = () => {
        if (scannedResults.length === 0) return;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageW = doc.internal.pageSize.width;
        const accentColor = [14, 165, 233];

        if (logoData) {
            try { doc.addImage(logoData, 'PNG', 14, 10, 20, 20); } catch (e) { }
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('SOHAG PHYSICS', pageW / 2, 18, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('PRELIMINARY MERIT LIST (SCANNED BATCH)', pageW / 2, 24, { align: 'center' });
        doc.text(exam.title || 'Exam Results', pageW / 2, 30, { align: 'center' });

        const ranked = [...scannedResults].sort((a, b) => b.score - a.score);
        const headers = [['Pos', 'Roll', 'Name', 'Correct', 'Wrong', 'Score']];
        const rows = ranked.map((r, i) => [i + 1, r.roll, r.studentName, r.correct, r.wrong, r.score]);

        doc.autoTable({
            head: headers,
            body: rows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: accentColor, textColor: 255, halign: 'center' },
            bodyStyles: { halign: 'center', fontSize: 9 },
            columnStyles: { 2: { halign: 'left' } }
        });

        doc.save(`Merit_List_${exam.title.replace(/\s+/g, '_')}.pdf`);
        notifySuccess(`Merit List generated for ${scannedResults.length} students.`);
    };

    // --- Analytics Logic ---
    const getQuestionStats = () => {
        const stats = {};
        const maxQ = Math.max(Number(exam.mcqTotal) || 0, activeQuestions || 0);
        for (let i = 1; i <= maxQ; i++) stats[i] = { correct: 0, wrong: 0, skipped: 0 };

        scannedResults.forEach(res => {
            res.breakdown?.forEach(q => {
                if (stats[q.qNum]) {
                    if (q.result === 'correct') stats[q.qNum].correct++;
                    else if (q.result === 'wrong') stats[q.qNum].wrong++;
                    else stats[q.qNum].skipped++;
                }
            });
        });
        return stats;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 lg:p-6">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-7xl h-[95vh] flex overflow-hidden border border-white/20">

                {/* --- SIDEBAR --- */}
                <div className="w-20 lg:w-64 bg-slate-50 border-r flex flex-col pt-8">
                    <div className="px-6 mb-8 hidden lg:block">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">OMR <span className="text-sky-600">HUB</span></h2>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Premium Workflow</p>
                    </div>

                    <div className="flex-1 space-y-2 px-3">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === tab.id
                                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
                                    : 'text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                <tab.icon size={24} />
                                <span className="hidden lg:block font-bold text-sm">{tab.label}</span>
                                {tab.id === 'results' && scannedResults.length > 0 && (
                                    <span className="ml-auto hidden lg:flex w-5 h-5 bg-amber-400 text-white text-[10px] rounded-full items-center justify-center animate-pulse">
                                        {scannedResults.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="m-6 p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 lg:justify-start justify-center"
                    >
                        <MdClose size={20} />
                        <span className="hidden lg:block font-bold text-sm">Close Hub</span>
                    </button>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">

                    {/* Header Info */}
                    <div className="px-8 py-5 border-b bg-white flex items-center justify-between">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg uppercase">{exam.title}</h3>
                            <div className="flex gap-4 mt-1">
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Batch: {exam.batch}</span>
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Active: {activeQuestions} Q</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${Object.keys(answerKey).length >= activeQuestions ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    Key: {Object.keys(answerKey).length} / {activeQuestions}
                                </span>
                            </div>
                        </div>

                        {activeTab === 'scan' && (
                            <div className="flex items-center gap-4 bg-sky-50 px-4 py-2 rounded-2xl border border-sky-100">
                                <div className="text-right border-r pr-4 border-sky-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Live Queue</p>
                                    <p className="text-sm font-black text-sky-600">{scannedResults.length} Ready</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    <p className="text-xs font-bold text-sky-700">Scanner Engine Active</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Tab Content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50">
                        {activeTab === 'design' && (
                            <div className="p-8 space-y-8">
                                <OmrSheetDesigner
                                    exam={exam}
                                    embedded={true}
                                    answerKey={answerKey}
                                    setAnswerKey={setAnswerKey}
                                    onSaveKey={saveAnswerKeyCloud}
                                    activeQuestions={activeQuestions}
                                    setActiveQuestions={setActiveQuestions}
                                />

                                {/* ── Premium Exam Config Panel ── */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                    <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                        <MdSettings className="text-sky-500" /> Exam Scoring Configuration
                                    </h4>

                                    {/* Live Exam Summary */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-4 text-center">
                                            <p className="text-3xl font-black text-sky-600">{activeQuestions}</p>
                                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-wider mt-1">Active Questions</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-center">
                                            <p className="text-3xl font-black text-emerald-600">{60 - activeQuestions}</p>
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mt-1">Ignored Bubbles</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center">
                                            <p className="text-3xl font-black text-amber-600">{Object.keys(answerKey).length}</p>
                                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider mt-1">Key Answers Set</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Negative Marking (per wrong)</label>
                                            <div className="flex items-center gap-3">
                                                {[0, 0.25, 0.5, 1].map(v => (
                                                    <button
                                                        key={v}
                                                        onClick={() => setNegativeMarking(v)}
                                                        className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${negativeMarking === v
                                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        {v === 0 ? 'OFF' : `-${v}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Scoring Formula</label>
                                            <div className="bg-slate-50 rounded-2xl p-4 border font-mono text-xs text-slate-600">
                                                <span className="text-emerald-600 font-black">Score</span> = Correct × 1
                                                {negativeMarking > 0 && <span className="text-rose-500"> − Wrong × {negativeMarking}</span>}
                                                <br />
                                                <span className="text-sky-500">Max</span> = {activeQuestions} marks
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'scan' && (
                            <div className="h-full flex flex-col p-6">
                                <OmrScanner
                                    exam={{ ...exam, mcqTotal: exam.mcqTotal || 0 }}
                                    onSave={(data) => handleScanComplete(data)}
                                    externalKey={answerKey}
                                    activeQuestions={activeQuestions}
                                    embedded={true}
                                />
                            </div>
                        )}

                        {activeTab === 'results' && (
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-black text-slate-800 text-xl flex items-center gap-2">
                                        <MdAnalytics className="text-sky-500" /> Scanned Batch Results
                                    </h4>

                                    <div className="flex gap-4 items-center">
                                        {scannedResults.length > 0 && (
                                            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">Local Draft Active</p>
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg. Score</p>
                                                <p className="text-2xl font-black text-sky-600">
                                                    {scannedResults.length ? (scannedResults.reduce((acc, curr) => acc + curr.score, 0) / scannedResults.length).toFixed(1) : 0}
                                                </p>
                                            </div>
                                            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Highest</p>
                                                <p className="text-2xl font-black text-emerald-500">
                                                    {scannedResults.length ? Math.max(...scannedResults.map(r => r.score)) : 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Top Performer</p>
                                        <p className="text-lg font-black truncate">{scannedResults.sort((a, b) => b.score - a.score)[0]?.studentName || 'Waiting...'}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-black">{scannedResults.sort((a, b) => b.score - a.score)[0]?.score || 0} <span className="text-sm opacity-60">marks</span></span>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Participation Growth</p>
                                        <div className="flex items-end gap-1 h-12">
                                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                <div key={i} className="flex-1 bg-sky-100 rounded-t-lg transition-all hover:bg-sky-500" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-xs font-black text-sky-600">+12% from last exam</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Data Health</p>
                                        <p className="text-2xl font-black text-slate-800">{scannedResults.filter(r => r.studentName !== 'Unknown Student').length} <span className="text-sm text-slate-400">Verified</span></p>
                                        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-1000"
                                                style={{ width: `${(scannedResults.filter(r => r.studentName !== 'Unknown Student').length / (scannedResults.length || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative group">
                                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search Roll or Name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-bold focus:ring-2 ring-sky-500/20 w-64 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExportExcel}
                                            disabled={scannedResults.length === 0}
                                            className="btn btn-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-none gap-2 rounded-xl capitalize"
                                        >
                                            <MdFileDownload size={18} /> Export Excel
                                        </button>
                                        <button
                                            onClick={handleBulkReportsPDF}
                                            disabled={scannedResults.length === 0}
                                            className="btn btn-sm bg-sky-100 hover:bg-sky-200 text-sky-700 border-none gap-2 rounded-xl capitalize"
                                        >
                                            <MdFileDownload size={18} /> Report PDF
                                        </button>
                                        <button
                                            onClick={handleMeritListPDF}
                                            disabled={scannedResults.length === 0}
                                            className="btn btn-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none gap-2 rounded-xl capitalize"
                                        >
                                            <MdFileDownload size={18} /> Merit List PDF
                                        </button>
                                        <button
                                            onClick={handleClearDraft}
                                            disabled={scannedResults.length === 0}
                                            className="btn btn-sm bg-rose-50 hover:bg-rose-100 text-rose-600 border-none gap-2 rounded-xl capitalize"
                                        >
                                            <MdClose size={18} /> Clear Drafts
                                        </button>
                                        <button
                                            onClick={handleSaveAll}
                                            disabled={isSaving || scannedResults.length === 0}
                                            className="btn btn-sm btn-primary gap-2 rounded-xl capitalize shadow-lg shadow-sky-200"
                                        >
                                            {isSaving ? <span className="loading loading-spinner loading-xs"></span> : <MdCloudUpload size={18} />}
                                            {isSaving ? 'Saving...' : 'Save All to Exam'}
                                        </button>
                                    </div>
                                </div>


                                {scannedResults.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <MdCameraAlt size={32} className="text-slate-300" />
                                        </div>
                                        <p className="font-bold text-slate-400">No results scanned yet. Go to Scanner tab to start.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-widest">
                                                    <th className="py-4 px-6">Roll & Identity</th>
                                                    <th>Score (MCQ)</th>
                                                    {exam.category === 'MCQ & Written' && <th>Written Marks</th>}
                                                    <th>Total</th>
                                                    <th>Batch</th>
                                                    <th>Correct/Wrong</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {filteredResults.map((res) => (
                                                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-12 h-10 bg-sky-100 rounded-xl flex items-center justify-center font-black text-sky-600 text-xs shadow-sm cursor-pointer hover:bg-sky-200 transition-colors"
                                                                    onClick={() => {
                                                                        setEditingRollId(res.id);
                                                                        setTempRollValue(res.roll);
                                                                    }}
                                                                >
                                                                    {editingRollId === res.id ? (
                                                                        <input
                                                                            autoFocus
                                                                            className="w-full h-full bg-transparent text-center outline-none"
                                                                            value={tempRollValue}
                                                                            onChange={(e) => setTempRollValue(e.target.value)}
                                                                            onBlur={() => {
                                                                                handleUpdateRoll(res.id, tempRollValue);
                                                                                setEditingRollId(null);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleUpdateRoll(res.id, tempRollValue);
                                                                                    setEditingRollId(null);
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        res.roll
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-800 text-sm">{res.studentName}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                        <MdCheckCircle size={12} className={res.studentName === 'Unknown Student' ? 'text-amber-500' : 'text-emerald-500'} />
                                                                        {res.studentName === 'Unknown Student' ? 'Unknown' : 'Identity Verified'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p className="font-black text-slate-800">{res.score} <span className="text-slate-300 text-xs font-bold">/ {exam.mcqTotal}</span></p>
                                                        </td>
                                                        {exam.category === 'MCQ & Written' && (
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    value={res.writtenMarks}
                                                                    onChange={(e) => handleUpdateWritten(res.id, e.target.value)}
                                                                    className="w-20 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-sm font-black text-amber-700 focus:outline-none focus:ring-2 ring-amber-500/20"
                                                                    placeholder="Marks"
                                                                />
                                                            </td>
                                                        )}
                                                        <td>
                                                            <p className="font-black text-sky-600">{res.score + (res.writtenMarks || 0)}</p>
                                                        </td>
                                                        <td>
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${res.studentBatch === exam.batch || exam.batch === "" ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {res.studentBatch}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="flex gap-2">
                                                                <span className="text-emerald-500 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded">✓{res.correct}</span>
                                                                <span className="text-red-400 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded">✗{res.wrong}</span>
                                                            </div>
                                                        </td>
                                                        <td className="flex gap-2">
                                                            <button
                                                                onClick={() => generateStudentReport(res)}
                                                                className="btn btn-xs bg-sky-100 hover:bg-sky-200 text-sky-700 border-none gap-1 rounded-lg capitalize group"
                                                            >
                                                                <MdFileDownload size={14} /> Report Card
                                                            </button>
                                                            <button
                                                                onClick={() => setScannedResults(prev => prev.filter(p => p.id !== res.id))}
                                                                className="text-red-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                            >
                                                                <MdClose size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="p-8">
                                <h4 className="font-black text-slate-800 text-2xl mb-8 flex items-center gap-3">
                                    <MdAnalytics className="text-indigo-500" /> Deep Batch Analysis
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Question Difficulty Map */}
                                    <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm">
                                        <p className="font-black text-slate-800 mb-6">Question-wise Accuracy</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(getQuestionStats()).map(([q, stat]) => {
                                                const accuracy = (stat.correct / (scannedResults.length || 1)) * 100;
                                                return (
                                                    <div
                                                        key={q}
                                                        className="w-12 h-16 rounded-xl flex flex-col items-center justify-between p-2 border transition-all hover:scale-110 cursor-help"
                                                        style={{
                                                            backgroundColor: accuracy > 70 ? '#f0fdf4' : accuracy > 40 ? '#fffbeb' : '#fef2f2',
                                                            borderColor: accuracy > 70 ? '#bcf0da' : accuracy > 40 ? '#fde68a' : '#fecaca'
                                                        }}
                                                        title={`Q.${q}: ${accuracy.toFixed(0)}% Accuracy`}
                                                    >
                                                        <span className="text-[10px] font-bold text-slate-400">Q.{q}</span>
                                                        <span className={`text-xs font-black ${accuracy > 70 ? 'text-emerald-600' : accuracy > 40 ? 'text-amber-600' : 'text-red-500'}`}>
                                                            {accuracy.toFixed(0)}%
                                                        </span>
                                                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                                            <div className="bg-current h-full" style={{ width: `${accuracy}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Score Distribution (Bell Curve Simulation) */}
                                    <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm flex flex-col">
                                        <p className="font-black text-slate-800 mb-6">Score Distribution</p>
                                        <div className="flex-1 flex items-end gap-1 min-h-[200px] border-b border-l p-4">
                                            {Array.from({ length: 10 }).map((_, i) => {
                                                const rangeStart = i * 10;
                                                const rangeEnd = (i + 1) * 10;
                                                const count = scannedResults.filter(r => (r.score / exam.mcqTotal * 100) >= rangeStart && (r.score / exam.mcqTotal * 100) < rangeEnd).length;
                                                const height = (count / (scannedResults.length || 1)) * 100;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-gradient-to-t from-indigo-500 to-sky-400 rounded-t-lg transition-all relative group"
                                                        style={{ height: `${Math.max(5, height * 2)}%` }}
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                            {count} Students ({rangeStart}-{rangeEnd}%)
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-2 px-4 text-[10px] font-bold text-slate-400">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sms' && (
                            <div className="p-8 max-w-2xl mx-auto">
                                <div className="bg-white rounded-[2.5rem] shadow-xl border p-10">
                                    <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                        <MdSms size={32} />
                                    </div>
                                    <h4 className="font-black text-slate-900 text-3xl mb-2">Super SMS Gateway</h4>
                                    <p className="text-slate-400 text-sm mb-8 font-medium">Auto-send results to guardians with one click. High-priority delivery enabled.</p>

                                    <div className="space-y-6">
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-sm text-slate-600 leading-relaxed relative">
                                            <div className="absolute -top-3 right-6 bg-white px-3 py-1 border rounded-full text-[10px] font-black uppercase text-sky-500">Live Smart Template</div>
                                            "Dear Guardian, result of <span className="text-sky-600 font-bold">[Student Name]</span> on <span className="font-bold">{exam.title}</span> is Score: <span className="text-emerald-500 font-black">[Score]/{exam.mcqTotal}</span>.
                                            <br /><br />
                                            Keep up the progress! — <span className="font-bold">Sohag Physics</span>"
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Target Delivery</p>
                                                <p className="text-2xl font-black text-emerald-700">{scannedResults.length} Units</p>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Gateway Type</p>
                                                <p className="text-2xl font-black text-blue-700">Non-Masking</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSendBulkSms}
                                            disabled={scannedResults.length === 0 || isSendingSms}
                                            className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg group"
                                        >
                                            {isSendingSms ? (
                                                <span className="loading loading-spinner"></span>
                                            ) : (
                                                <>
                                                    <MdSms size={24} className="group-hover:animate-bounce" />
                                                    Execute Bulk Sending Now
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Powered by BulksmsBD Elite API</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OmrHub;
