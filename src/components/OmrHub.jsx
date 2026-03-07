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
    const [activeSet, setActiveSet] = useState('A');

    // Idea 6: Offline Auto-Save to LocalStorage
    useEffect(() => {
        localStorage.setItem(`omr_results_draft_${exam._id}`, JSON.stringify(scannedResults));
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
        // Clean roll for comparison
        const cleanRoll = roll.toString().trim();
        const student = students.find(s => String(s.roll).trim() === cleanRoll || String(s.id).trim() === cleanRoll);
        return student || { roll: roll, name: 'Unknown Student', batch: 'Not Found', phone: '' };
    };

    const handleScanComplete = (data) => {
        if (data.type === 'MASTER_KEY') {
            setAnswerKey(prev => ({ ...prev, [data.set]: data.key }));
            return;
        }

        const student = identifyStudent(data.roll);
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
        notifySuccess(`Scanned: ${student.name}`);
    };

    const handleUpdateWritten = (id, marks) => {
        setScannedResults(prev => prev.map(res =>
            res.id === id ? { ...res, writtenMarks: parseFloat(marks) || 0 } : res
        ));
    };

    const handleSaveAll = async () => {
        if (scannedResults.length === 0) return;
        setIsSaving(true);

        try {
            const formattedResults = scannedResults.map(res => ({
                id: res.roll.toString(),
                name: res.studentName,
                mcqMarks: res.score,
                writenMarks: res.writtenMarks || 0,
                total: res.score + (res.writtenMarks || 0),
                date: exam.date,
                mcqTotal: exam.mcqTotal,
                writenTotal: exam.writenTotal
            }));

            // 1. Update Exam Collection
            const examRes = await fetch(`${import.meta.env.VITE_API_URL}/exam/update/${exam._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: [...(exam.results || []), ...formattedResults] })
            });

            if (!examRes.ok) throw new Error("Failed to update exam");

            // 2. Update Student Profiles (Bulk)
            const studentTempResults = formattedResults.map(res => ({
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

            const bulkRes = await fetch(`${import.meta.env.VITE_API_URL}/addbulkresults`, {
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
            "Scan Time": res.time
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

    // --- Idea 2: Individual Student Achievement Card ---
    const generateStudentReport = (res) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const accentRes = [3, 105, 161]; // Sky 700

        // Header Background
        doc.setFillColor(...accentRes);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('EXAM ACHIEVEMENT REPORT', 105, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`SOHAG PHYSICS — PRO ASSESSMENT SERIES`, 105, 25, { align: 'center' });

        // Student Info
        doc.setTextColor(40);
        doc.setFontSize(12);
        doc.text(`Name: ${res.studentName}`, 20, 50);
        doc.text(`Roll: ${res.roll}`, 20, 57);
        doc.text(`Batch: ${res.studentBatch}`, 20, 64);
        doc.text(`Exam: ${exam.title}`, 190, 50, { align: 'right' });
        doc.text(`Date: ${exam.date}`, 190, 57, { align: 'right' });

        // Score Badge
        doc.setDrawColor(...accentRes);
        doc.setLineWidth(1);
        doc.roundedRect(65, 80, 80, 35, 3, 3, 'S');
        doc.setFontSize(28);
        doc.setTextColor(...accentRes);
        doc.text(`${res.score}`, 105, 102, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`TOTAL SCORE / ${exam.mcqTotal}`, 105, 110, { align: 'center' });

        // Performance Breakdown
        const stats = [
            ['CORRECT', res.correct, 'text-emerald-600'],
            ['WRONG', res.wrong, 'text-rose-600'],
            ['UNATTEMPTED', res.unattempted, 'text-slate-400']
        ];

        let statX = 40;
        stats.forEach(s => {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(s[0], statX, 130, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(50);
            doc.text(s[1].toString(), statX, 138, { align: 'center' });
            statX += 65;
        });

        // Question Table
        const tableData = res.breakdown.map(q => [q.qNum, q.detected || '—', q.keyAnswer || '?', q.result.toUpperCase()]);
        doc.autoTable({
            startY: 150,
            head: [['Q#', 'YOUR ANS', 'CORRECT KEY', 'RESULT']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: accentRes },
            styles: { fontSize: 8, halign: 'center' }
        });

        const authY = doc.autoTable.previous.finalY + 30;
        doc.setDrawColor(200);
        doc.line(140, authY, 190, authY);
        doc.setFontSize(8);
        doc.text('AUTHORIZED SIGNATURE', 165, authY + 5, { align: 'center' });

        doc.save(`Report_${res.roll}_${res.studentName}.pdf`);
    };

    // --- Analytics Logic ---
    const getQuestionStats = () => {
        const stats = {};
        for (let i = 1; i <= exam.mcqTotal; i++) stats[i] = { correct: 0, wrong: 0, skipped: 0 };

        scannedResults.forEach(res => {
            res.breakdown?.forEach(q => {
                if (q.result === 'correct') stats[q.qNum].correct++;
                else if (q.result === 'wrong') stats[q.qNum].wrong++;
                else stats[q.qNum].skipped++;
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
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Target: {exam.mcqTotal} MCQ</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${Object.keys(answerKey).length === exam.mcqTotal ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    Key: {Object.keys(answerKey).length} / {exam.mcqTotal} set
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
                                />

                                {/* Pro Feature: Advanced Config */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                    <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                        <MdSettings className="text-sky-500" /> Advanced Exam Configuration
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Negative Marking</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    step="0.25"
                                                    value={negativeMarking}
                                                    onChange={(e) => setNegativeMarking(parseFloat(e.target.value) || 0)}
                                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-500 outline-none font-bold transition-all"
                                                    placeholder="0.25"
                                                />
                                                <p className="text-xs text-slate-400 font-medium w-48">Deduction per wrong MCQ answer</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Question Set</label>
                                            <div className="flex gap-2">
                                                {['A', 'B', 'C', 'D'].map(set => (
                                                    <button
                                                        key={set}
                                                        onClick={() => setActiveSet(set)}
                                                        className={`flex-1 py-4 rounded-2xl font-black transition-all ${activeSet === set ? 'bg-sky-600 text-white shadow-lg shadow-sky-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        Set {set}
                                                    </button>
                                                ))}
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
                                                                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center font-black text-sky-600 text-xs shadow-sm">
                                                                    {res.roll}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-800 text-sm">{res.studentName}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                        <MdCheckCircle size={12} className="text-emerald-500" /> Identity Verified
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
                                                                <span className="text-emerald-500 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded">âœ“{res.correct}</span>
                                                                <span className="text-red-400 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded">âœ—{res.wrong}</span>
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
