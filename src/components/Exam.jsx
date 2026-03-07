import React, { useContext, useEffect, useState } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { FiX, FiPlus, FiCamera, FiDownload, FiFileText, FiTrash2, FiSend, FiUser, FiCalendar, FiBookOpen, FiActivity, FiAward, FiBarChart2, FiArrowLeft, FiChevronLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { AuthContext } from '../Provider';
import * as XLSX from 'xlsx';
import OmrScanner from './OmrScanner';
import ExamPDFExport from './ExamPDFExport';
import OmrSheetDesigner from './Download/OmrSheetDesigner';
import OmrHub from './OmrHub';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

function Exam() {
    const { notifySuccess, notifyFailed, getMonth, loggedUser, today } = useContext(AuthContext);
    const [exam, setExam] = useState(useLoaderData())
    const { title, session, batch, program, date, results: examResults, mcqTotal, writenTotal, day, month, year } = exam;
    const [published, setPublished] = useState(exam.published)

    const tarikh = `${day} ${getMonth(month)}, ${year}`
    const [displayResults, setDisplayResults] = useState(examResults)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPdf, setShowPdf] = useState(false)
    const [showOmrHub, setShowOmrHub] = useState(false)
    const [students, setStudents] = useState([])
    const [rankedResults, setRankedResults] = useState([]);

    useEffect(() => {
        if (!displayResults || displayResults.length === 0) {
            setRankedResults([]);
            return;
        }

        const sortedResults = [...displayResults].sort((a, b) => {
            const totalA = (Number(a.mcqMarks) || 0) + (Number(a.writenMarks) || 0);
            const totalB = (Number(b.mcqMarks) || 0) + (Number(b.writenMarks) || 0);
            return totalB - totalA;
        });

        let rank = 1;
        let previousTotal = (Number(sortedResults[0].mcqMarks) || 0) + (Number(sortedResults[0].writenMarks) || 0);

        const withMerit = sortedResults.map((result, index) => {
            const currentTotal = (Number(result.mcqMarks) || 0) + (Number(result.writenMarks) || 0);
            if (currentTotal < previousTotal) {
                rank = index + 1;
            }
            previousTotal = currentTotal;
            return { ...result, merit: rank, total: currentTotal };
        });

        setRankedResults(withMerit);
    }, [displayResults]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/students`)
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(err => console.error("Error fetching students:", err));
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(rankedResults.length / itemsPerPage);
    const currentResults = rankedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAddResult = async (e) => {
        setLoading(true)
        e.preventDefault();
        const id = e.target.id.value;
        const examId = exam._id
        const mcqMarks = e.target.mcqMarks.value ? parseFloat(e.target.mcqMarks.value) : 0;
        const writenMarks = e.target.writenMarks.value ? parseFloat(e.target.writenMarks.value) : 0;
        const total = mcqMarks + writenMarks;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/student/${id}`);
            const data = await res.json();

            if (!data.id) {
                notifyFailed("Student not found");
                setLoading(false)
                return;
            }

            const name = data.name;
            const result = { id, mcqMarks, writenMarks, total, name, date, mcqTotal, writenTotal };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/exam/addresult/${exam._id}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(result),
            });

            if (response.status === 400) {
                notifyFailed("Duplicate result found");
                setLoading(false)
            } else if (response.status === 200) {
                notifySuccess("Result added successfully");
                setLoading(false)
                e.target.reset()
                setDisplayResults([...displayResults, result])
            } else {
                notifyFailed("Failed to add result");
                setLoading(false)
            }

            const resultForStudent = { title, examId, mcqMarks, writenMarks, total, date, mcqTotal, writenTotal, day, month, year }
            data.exams.push(resultForStudent)
            await fetch(`${import.meta.env.VITE_API_URL}/addresult/${id}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data)
            })
        } catch (error) {
            console.error("Error adding result:", error);
            setLoading(false)
        }
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const downloadResponse = await fetch(`${import.meta.env.VITE_API_URL}/download/examresults`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(rankedResults)
            });

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                saveAs(blob, `${title}_Results.xlsx`);
                notifySuccess("Excel exported");
            } else {
                throw new Error('Export failed');
            }
        } catch (err) {
            console.error(err);
            notifyFailed("Export failed");
        } finally {
            setLoading(false);
        }
    }

    const handlePublish = async () => {
        setLoading(true)
        const ids = displayResults.map(result => result.id)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/getnumbers`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(ids)
            })

            const data = await res.json()
            const messages = data.map(num => {
                const result = displayResults.find(res => res.id == num.id)
                return {
                    to: `${num.phone}`,
                    message: `Hey ${num.name},\nResult for: ${title}\nDate: ${tarikh}\nMCQ: ${result.mcqMarks}/${mcqTotal}\nWritten: ${result.writenMarks}/${writenTotal}\nTotal: ${result.total}/${mcqTotal + writenTotal}\nMerit: ${result.merit}\nSohag Physics`
                }
            })

            const response2 = await fetch('https://bulksmsbd.net/api/smsapimany', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: 'CUOP72nJJHahM30djaQG',
                    senderid: '8809617642567',
                    messages: messages
                }),
            })
            const result2 = await response2.json();

            if (result2.response_code == 202) {
                const pubData = { published: { status: true, date: today, publishedBy: loggedUser } }
                await fetch(`${import.meta.env.VITE_API_URL}/exam/update/${exam._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pubData)
                });
                setPublished(pubData.published)
                notifySuccess("Results published via SMS!")
            } else {
                notifyFailed("SMS service error");
            }
        } catch (error) {
            console.error(error)
            notifyFailed("Publication failed");
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Delete Result?',
            text: "This will remove result from both exam and student records.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Yes, Delete'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/student/${id}`)
                let student = await response.json()

                const filteredResults = exam.results.filter(result => parseInt(result.id) != parseInt(id))
                const updateData = { ...exam, results: filteredResults }
                student.exams = student.exams.filter(res => res.examId != exam._id)

                const res = await fetch(`${import.meta.env.VITE_API_URL}/deleteresult/${exam._id}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(updateData)
                })
                const dat = await res.json()
                if (dat.modifiedCount) {
                    setDisplayResults(filteredResults)
                    notifySuccess("Result removed")
                }
                await fetch(`${import.meta.env.VITE_API_URL}/addresult/${id}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(student)
                })
            }
        })
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
            {/* Header / Action Bar */}
            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10 gap-8'>
                <div className="flex items-center gap-5">
                    <Link to="/exams" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className='font-black text-2xl text-slate-800 tracking-tight'>{title}</h1>
                        <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                            <FiCalendar size={14} /> {tarikh}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={handlePublish}
                        disabled={loading || published?.status}
                        className={`h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${published?.status
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5"
                            }`}
                    >
                        <FiSend size={16} /> {published?.status ? "Published" : "Publish Results"}
                    </button>
                    <button
                        onClick={() => setShowOmrHub(true)}
                        className="h-12 px-6 bg-white text-cyan-600 border border-cyan-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-50 transition-all shadow-sm"
                    >
                        <FiCamera size={16} /> OMR Hub
                    </button>
                    <button
                        onClick={() => document.getElementById('add_result_modal').showModal()}
                        className="h-12 px-6 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-sm"
                    >
                        <FiPlus size={16} /> Add Result
                    </button>
                    <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="h-12 w-12 bg-white border border-slate-100 rounded-2xl text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-all shadow-sm">
                            <FiDownload size={20} />
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-3 shadow-2xl bg-white rounded-2xl w-52 mt-2 border border-slate-100 border-white/20 z-20">
                            <li><button onClick={handleDownload} className="rounded-xl flex items-center gap-3 py-3 font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"><FiFileText size={18} /> Excel Report</button></li>
                            <li><button onClick={() => setShowPdf(true)} className="rounded-xl flex items-center gap-3 py-3 font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600"><FiFileText size={18} /> PDF Export</button></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
                {[
                    { label: "Batch", val: batch, icon: FiUser, color: "indigo" },
                    { label: "Program", val: program, icon: FiActivity, color: "cyan" },
                    { label: "MCQ Marks", val: mcqTotal, icon: FiAward, color: "amber" },
                    { label: "Writ. Marks", val: writenTotal, icon: FiBarChart2, color: "rose" },
                    { label: "Total Entries", val: displayResults?.length, icon: FiCheckCircle, color: "emerald" },
                    { label: "Session", val: session, icon: FiBookOpen, color: "slate" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                        <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl w-fit mb-4`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-lg font-black text-slate-800 truncate">{stat.val || '-'}</p>
                    </div>
                ))}
            </div>

            {/* Results Table */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-black text-xl text-slate-800 tracking-tight">Merit List</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Page {currentPage} / {totalPages}</p>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all"
                        >
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="pb-4 pl-4 w-16">Rank</th>
                                <th className="pb-4 pl-4">Student</th>
                                <th className="pb-4 text-center">MCQ</th>
                                <th className="pb-4 text-center">Written</th>
                                <th className="pb-4 text-center">Total</th>
                                <th className="pb-4 text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentResults.map((result, idx) => (
                                <motion.tr
                                    key={result.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="group hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="py-5 pl-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${result.merit === 1 ? "bg-amber-100 text-amber-600" :
                                            result.merit === 2 ? "bg-slate-200 text-slate-600" :
                                                result.merit === 3 ? "bg-orange-100 text-orange-600" : "text-slate-400"
                                            }`}>
                                            {result.merit}
                                        </div>
                                    </td>
                                    <td className="py-5 pl-4">
                                        <p className="font-bold text-slate-800">{result.name}</p>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{result.id}</p>
                                    </td>
                                    <td className="py-5 text-center font-bold text-slate-600">{result.mcqMarks} <span className="text-[10px] text-slate-300">/ {mcqTotal}</span></td>
                                    <td className="py-5 text-center font-bold text-slate-600">{result.writenMarks} <span className="text-[10px] text-slate-300">/ {writenTotal}</span></td>
                                    <td className="py-5 text-center font-black text-indigo-600 text-lg">{(result.mcqMarks || 0) + (result.writenMarks || 0)}</td>
                                    <td className="py-5 text-right pr-4">
                                        <button
                                            onClick={() => handleDelete(result.id)}
                                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals & Components */}
            <dialog id="add_result_modal" className="modal backdrop-blur-md">
                <div className="modal-box bg-white/90 p-0 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-white relative">
                        <button onClick={() => document.getElementById('add_result_modal').close()} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                            <FiX size={20} />
                        </button>
                        <h2 className="text-2xl font-black tracking-tight">Manual Result Entry</h2>
                        <p className="text-indigo-100 text-sm mt-1">Directly record a student's score.</p>
                    </div>
                    <form onSubmit={handleAddResult} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
                            <input required name='id' type="text" className="input-premium h-14 w-full pt-4" placeholder="Enter Roll/ID" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MCQ Score (Max {mcqTotal})</label>
                                <input name='mcqMarks' type="number" step="any" className="input-premium h-14 w-full pt-4" placeholder="0.0" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Written Score (Max {writenTotal})</label>
                                <input name='writenMarks' type="number" step="any" className="input-premium h-14 w-full pt-4" placeholder="0.0" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-premium w-full h-16 text-lg font-bold">
                            {loading ? <span className="loading loading-spinner"></span> : "Confirm Result Entry"}
                        </button>
                    </form>
                </div>
            </dialog>

            {showPdf && <ExamPDFExport exam={exam} results={rankedResults} onClose={() => setShowPdf(false)} />}
            {showOmrHub && <OmrHub exam={exam} students={students} onClose={() => setShowOmrHub(false)} />}
        </motion.div>
    );
}

export default Exam;
