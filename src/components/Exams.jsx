import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider'
import { Link, Navigate } from 'react-router-dom'
import { FiPlus, FiFilter, FiCalendar, FiBookOpen, FiActivity, FiX, FiTrash2, FiCamera, FiArrowRight, FiCheckCircle, FiMoreHorizontal } from "react-icons/fi";
import Swal from 'sweetalert2';
import LoadingPage from './OtherPages.jsx/LoadingPage';
import { motion, AnimatePresence } from 'framer-motion';

function Exams() {
    const { month, year, date, getMonth, notifySuccess } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [firstLoading, setFirstLoading] = useState(true)
    const [allExams, setAllExams] = useState([])
    const [displayExams, setDisplayExams] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/getexams`)
            .then(res => res.json())
            .then(data => {
                setAllExams(data)
                const sortedExams = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setDisplayExams(sortedExams);
                setFirstLoading(false)
            })
    }, []);

    const handleAddExam = e => {
        setLoading(true)
        e.preventDefault()
        const title = e.target.title.value
        const day = e.target.day.value
        const monthValue = e.target.month.value
        const yearValue = e.target.year.value
        const program = e.target.program.value
        const mcqTotal = e.target.mcqTotal.value ? parseInt(e.target.mcqTotal.value) : 0;
        const writenTotal = e.target.writenTotal.value ? parseInt(e.target.writenTotal.value) : 0;
        const batch = e.target.batch.value
        const session = e.target.session.value
        const examDate = `${getMonth(monthValue)} ${day}, ${yearValue}`
        const results = []
        const category = e.target.category.value

        const details = {
            title, day, month: monthValue, year: yearValue, date: examDate, batch, program, session, results, mcqTotal, writenTotal, category
        }

        fetch(`${import.meta.env.VITE_API_URL}/addexam`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(details)
        })
            .then(res => res.json())
            .then(data => {
                if (data.insertedId) {
                    notifySuccess("Exam added successfully")
                    const newExam = { ...details, _id: data.insertedId }
                    setAllExams(prev => [newExam, ...prev])
                    setDisplayExams(prev => [newExam, ...prev])
                    setLoading(false)
                    document.getElementById('add_exam_modal').close()
                    e.target.reset()
                }
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    const handleFilter = e => {
        e.preventDefault()
        const program = e.target.program.value
        const batch = e.target.batch.value
        const session = e.target.session.value
        const day = e.target.day.value
        const monthValue = e.target.month.value
        const yearValue = e.target.year.value

        let filtered = allExams.filter(exam => {
            const matchProgram = !program || exam.program === program;
            const matchBatch = !batch || exam.batch === batch || (batch === 'Universal' && exam.batch === '');
            const matchSession = !session || exam.session === session;
            const matchDay = !day || String(exam.day) === String(day);
            const matchMonth = !monthValue || String(exam.month) === String(monthValue);
            const matchYear = !yearValue || String(exam.year) === String(yearValue);

            return matchProgram && (matchBatch || exam.batch === 'Universal') && matchSession && matchDay && matchMonth && matchYear;
        })
        setDisplayExams(filtered);
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Exam?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Yes, Delete',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl px-6 py-3 font-bold',
                cancelButton: 'rounded-xl px-6 py-3 font-bold'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${import.meta.env.VITE_API_URL}/exam/delete/${id}`, {
                    method: "DELETE"
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.deletedCount) {
                            notifySuccess("Exam removed")
                            setAllExams(prev => prev.filter(exam => exam._id !== id));
                            setDisplayExams(prev => prev.filter(exam => exam._id !== id));
                        }
                    })
            }
        })
    }

    const filterOmrExams = () => {
        const filtered = allExams.filter(exam => exam.mcqTotal > 0);
        setDisplayExams(filtered);
    };

    if (firstLoading) return <LoadingPage />

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20"
        >
            {/* Action Bar */}
            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-10 gap-6'>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                        <FiBookOpen size={24} />
                    </div>
                    <div>
                        <h1 className='font-black text-2xl text-slate-800 tracking-tight'>Examination <span className="text-indigo-600">Hub</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{displayExams.length} Exams scheduled</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={filterOmrExams}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 h-12 bg-white text-slate-600 font-black text-sm rounded-2xl border border-slate-200 hover:border-cyan-200 hover:text-cyan-600 transition-all shadow-sm"
                    >
                        <FiCamera size={18} /> OMR List
                    </button>
                    <button
                        onClick={() => document.getElementById('add_exam_modal').showModal()}
                        className="flex-1 lg:flex-none btn-premium px-8 h-12 font-black text-sm flex items-center justify-center gap-2"
                    >
                        <FiPlus size={20} /> Create New
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <form onSubmit={handleFilter} className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-12">
                <div className="flex items-center gap-2 mb-8 text-slate-800">
                    <FiFilter className="text-indigo-500" />
                    <h2 className="font-black text-lg">Search Exams</h2>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6'>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day</label>
                        <select name='day' className="input-premium w-full h-14 px-4 text-sm">
                            <option value="">All Days</option>
                            {[...Array(31)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Month</label>
                        <select name='month' className="input-premium w-full h-14 px-4 text-sm">
                            <option value="">All Months</option>
                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (<option key={i + 1} value={i + 1}>{m}</option>))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                        <select name='year' className="input-premium w-full h-14 px-4 text-sm">
                            <option value="">All Years</option>
                            {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (<option key={yr} value={yr}>{yr}</option>))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch</label>
                        <select name='batch' className="input-premium w-full h-14 px-4 text-sm">
                            <option value="Universal">Universal</option>
                            <option value={'Olympiad-HSC27'}>Olympiad 27</option>
                            <option value={'Sat 1'}>à¦¶à¦¨à¦¿ à§­à¦Ÿà¦¾ (27)</option>
                            <option value={'Sat 2'}>à¦¶à¦¨à¦¿ à§®à¦Ÿà¦¾</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program</label>
                        <select name='program' className="input-premium w-full h-14 px-4 text-sm">
                            <option value=''>All Programs</option>
                            <option value={'HscPhy'}>HSC Physics</option>
                            <option value={'SscPhy'}>SSC Physics</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full h-14 bg-slate-800 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg shadow-slate-200">Filter</button>
                    </div>
                </div>
            </form>

            {/* Exam Table */}
            <div className="space-y-2">
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="col-span-5">Examination details</div>
                    <div className="col-span-2 text-center">Batch context</div>
                    <div className="col-span-1 text-center">MCQ</div>
                    <div className="col-span-1 text-center">Writ.</div>
                    <div className="col-span-1 text-center">Total</div>
                    <div className="col-span-2 text-right text-rose-500">Actions</div>
                </div>

                <AnimatePresence>
                    {displayExams.map((exam, idx) => (
                        <motion.div
                            key={exam._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className='group relative bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all'
                        >
                            <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-center">
                                <Link to={`/exam/${exam._id}`} className="w-full md:w-auto md:col-span-5 flex items-center justify-between md:justify-start gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <FiCalendar size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5">{exam.date}</p>
                                        </div>
                                    </div>
                                </Link>

                                <div className="w-full md:w-auto md:col-span-2 flex justify-center md:block text-center">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                        {exam.batch || 'Universal'}
                                    </span>
                                </div>

                                <div className="w-full md:w-auto md:col-span-3 flex justify-center gap-8 md:grid md:grid-cols-3 md:gap-4 text-center">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 font-bold block md:hidden mb-1">MCQ</p>
                                        <p className="text-xs font-black text-slate-700">{exam.mcqTotal || '-'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 font-bold block md:hidden mb-1">WRITTEN</p>
                                        <p className="text-xs font-black text-slate-700">{exam.writenTotal || '-'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 font-bold block md:hidden mb-1">TOTAL</p>
                                        <p className="text-sm font-black text-indigo-600">{(exam.mcqTotal || 0) + (exam.writenTotal || 0)}</p>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto md:col-span-2 flex justify-center md:justify-end gap-2 mt-2 md:mt-0">
                                    <Link to={`/exam/${exam._id}`} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl transition-all shadow-sm">
                                        <FiArrowRight size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(exam._id)}
                                        className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all shadow-sm"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {displayExams.length === 0 && (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <FiBookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-black text-slate-400">No exams matched filters</h3>
                    </div>
                )}
            </div>

            {/* Add Exam Modal */}
            <dialog id="add_exam_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-md">
                <div className="modal-box bg-white/90 p-0 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden max-w-2xl">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <button
                            onClick={() => document.getElementById('add_exam_modal').close()}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <FiX size={20} />
                        </button>
                        <FiBookOpen size={32} className="text-cyan-400 mb-4" />
                        <h2 className="text-2xl font-black tracking-tight">Create New Examination</h2>
                        <p className="text-slate-400 text-sm mt-1">Schedule a new test for your students.</p>
                    </div>

                    <form onSubmit={handleAddExam} className="p-8 lg:p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Title <span className="text-rose-500">*</span></label>
                                <input required name='title' type="text" className="input-premium w-full h-14 font-bold" placeholder="e.g. Physics Chapter 3 Quiz" />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Examination Date <span className="text-rose-500">*</span></label>
                                <div className="grid grid-cols-3 gap-3">
                                    <select defaultValue={date} name='day' className="input-premium h-14">
                                        {[...Array(31)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
                                    </select>
                                    <select defaultValue={month} name='month' className="input-premium h-14">
                                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (<option key={i + 1} value={i + 1}>{m}</option>))}
                                    </select>
                                    <select defaultValue={year} name='year' className="input-premium h-14">
                                        {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (<option key={yr}>{yr}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Batch</label>
                                <select name='batch' className="input-premium w-full h-14">
                                    <option value={""}>Universal (All)</option>
                                    <option value={'Olympiad-HSC27'}>Olympiad HSC 27</option>
                                    <option value={'Sat 1'}>à¦¶à¦¨à¦¿ à§­à¦Ÿà¦¾ (HSC 27)</option>
                                    <option value={'Sat 2'}>à¦¶à¦¨à¦¿ à§®à¦Ÿà¦¾</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program</label>
                                <select name='program' className="input-premium w-full h-14">
                                    <option value={'HscPhy'}>HSC Physics</option>
                                    <option value={'SscPhy'}>SSC Physics</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MCQ Total Marks</label>
                                <input name='mcqTotal' type="number" className="input-premium w-full h-14" placeholder="0" />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Written Total Marks</label>
                                <input name='writenTotal' type="number" className="input-premium w-full h-14" placeholder="0" />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select name='category' required className="input-premium w-full h-14">
                                    <option value="Only MCQ">Only MCQ (OMR)</option>
                                    <option value="MCQ & Written">Mixed (OMR + Manual)</option>
                                </select>
                            </div>

                            <input type="hidden" name="session" value="2025" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-premium w-full h-16 flex items-center justify-center gap-3 text-lg font-bold"
                        >
                            {loading ? <span className="loading loading-spinner"></span> : <><FiPlus size={24} /> Schedule Examination</>}
                        </button>
                    </form>
                </div>
            </dialog>
        </motion.div>
    );
}

export default Exams
