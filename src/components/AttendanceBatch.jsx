import React, { useContext, useState } from 'react'
import StudentsList from './StudentList';
import { AuthContext } from '../Provider';
import Attendance from './Attendance';
import { FiUsers, FiCalendar, FiCheckCircle, FiSearch, FiArrowRight, FiBookOpen, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function AttendanceBatch() {
    const { notifyFailed, notifySuccess, role } = useContext(AuthContext)
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)

    const handleSearch = e => {
        setLoading(true)
        e.preventDefault();
        const query = {};
        const batch = e.target.batch.value;
        const session = e.target.session.value;

        if (batch) query.batch = batch;
        if (session) query.session = session;

        fetch(`${import.meta.env.VITE_API_URL}/students`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(query)
        })
            .then(res => res.json())
            .then(data => {
                if (data.length == 0) {
                    notifyFailed("Sorry, no students found in this batch!")
                    setStudents([])
                } else if (data.length) {
                    setStudents(data)
                }
            })
            .catch(err => {
                console.error(err)
                notifyFailed("Failed to fetch students")
            })
            .finally(() => setLoading(false))
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='pb-20'
        >
            <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <FiCheckCircle size={24} />
                </div>
                <h1 className='font-black text-2xl lg:text-3xl text-slate-800 tracking-tight'>Batch Attendance</h1>
            </div>

            <AnimatePresence mode="wait">
                {!students.length ? (
                    <motion.div
                        key="search-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto"
                    >
                        <form
                            className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 space-y-10"
                            onSubmit={handleSearch}
                        >
                            <div className="text-center space-y-2">
                                <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-3xl mb-2">
                                    <FiUsers size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Batch</h2>
                                <p className="text-slate-500 text-sm">Choose a batch and session to take attendance.</p>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                <div className="space-y-3">
                                    <label className='flex items-center gap-2 font-black text-xs text-slate-500 uppercase tracking-widest ml-1'>
                                        <FiActivity className="text-emerald-500" /> Batch Name
                                    </label>
                                    <select name='batch' className="input-premium w-full h-14 pt-3 text-slate-700 font-bold">
                                        <option value={'Olympiad-HSC27'}>Olympiad HSC 27</option>
                                        <option value={'Sat 1'}>à¦¶à¦¨à¦¿ à§­à¦Ÿà¦¾ (HSC 27)</option>
                                        <option value={'Sat 2'}>à¦¶à¦¨à¦¿ à§®à¦Ÿà¦¾ (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡à¦¨ SSC 28 - HSC 30)</option>
                                        <option value={'Sat 3'}>à¦¶à¦¨à¦¿ à§¯à¦Ÿà¦¾ (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡à¦¨ SSC 28 - HSC 30)</option>
                                        <option value={'Sat 4'}>à¦¶à¦¨à¦¿ à§§à§¦à¦Ÿà¦¾ (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡à¦¨ SSC 27 - HSC 29)</option>
                                        <option value={'Sat 5'}>à¦¶à¦¨à¦¿ à§§à§§à¦Ÿà¦¾ - SSC 26 (All Batch) </option>
                                        <option value={'Sat 12'}>à¦¶à¦¨à¦¿ à§§à§¨à¦Ÿà¦¾ - New Nine (SSC 28 Special Batch) </option>
                                        <option value={'Sat 6'}>à¦¶à¦¨à¦¿ à§¨à¦Ÿà¦¾ (HSC 27)</option>
                                        <option value={'Sat 7'}>à¦¶à¦¨à¦¿ à§©à¦Ÿà¦¾ - HSC 27 (New Batch)</option>
                                        <option value={'Sat 8'}>à¦¶à¦¨à¦¿ à§ªà¦Ÿà¦¾ (SSC 27)</option>
                                        <option value={'Sat 9'}>à¦¶à¦¨à¦¿ à§«à¦Ÿà¦¾ - SSC 28 (New Nine)</option>
                                        <option value={'Sat 10'}>à¦¶à¦¨à¦¿ à§¬à¦Ÿà¦¾ (SSC 28)</option>
                                        <option value={'Sat 11'}>à¦¶à¦¨à¦¿ à§­ à¦Ÿà¦¾ ( SSC 27 - HSC 29)</option>
                                        <option value={'Sun 1'}>à¦°à¦¬à¦¿ à§­à¦Ÿà¦¾ (HSC 27)</option>
                                        <option value={'Sun 2'}>à¦°à¦¬à¦¿ à§®à¦Ÿà¦¾ (HSC 26)</option>
                                        <option value={'Sun 3'}>à¦°à¦¬à¦¿ à§¯à¦Ÿà¦¾ - HSC 27 (New Batch)</option>
                                        <option value={'Sun 4'}>à¦°à¦¬à¦¿ à§§à§¦à¦Ÿà¦¾ (HSC 28)</option>
                                        <option value={'Sun 5'}>à¦°à¦¬à¦¿ à§§à§§à¦Ÿà¦¾ </option>
                                        <option value={'Sun 6'}>à¦°à¦¬à¦¿ à§¨à¦Ÿà¦¾ (HSC 26) </option>
                                        <option value={'Sun 7'}>à¦°à¦¬à¦¿ à§©à¦Ÿà¦¾ (HSC 27) </option>
                                        <option value={'Sun 8'}>à¦°à¦¬à¦¿ à§ªà¦Ÿà¦¾ (HSC 26) </option>
                                        <option value={'Sun 9'}>à¦°à¦¬à¦¿ à§«à¦Ÿà¦¾ (HSC 27) </option>
                                        <option value={'Sun 10'}>à¦°à¦¬à¦¿ à§¬à¦Ÿà¦¾ (SSC 27 - HSC 29) </option>
                                        <option value={'Sun 11'}>à¦°à¦¬à¦¿ à§­à¦Ÿà¦¾ - SSC 28 (New Nine) </option>
                                        <option>HSC 26 Admission cancel</option>
                                        <option>HSC 27 Admission cancel</option>
                                        <option>SSC 26 class 10 Admission cancel</option>
                                        <option>SSC 27 class 9 Admission cancel</option>
                                        <option>Exam Batch HSC 26</option>
                                        <option>Exam Batch (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡à¦¨ SSC 27 - HSC 29)</option>
                                        <option>Exam Batch (à¦¨à¦¿à¦‰ à¦Ÿà§‡à¦¨ SSC 26 - HSC 28)</option>
                                        <option value={'Olympiad-8'}>Olympiad 8 (ssc 28 - hsc 30)</option>
                                        <option value={'Olympiad-9'}>Olympiad 9 (ssc 27 - hsc 29)</option>
                                        <option value={'Hsc-27-Marketing'}>Hsc-27 (Marketing)</option>
                                        <option>SSC 25 (Physics Olympiad)</option>
                                        <option>Class 9 (SSC 27) Phy Champ</option>
                                        <option>Class 10 (SSC 26) Phy Champ</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className='flex items-center gap-2 font-black text-xs text-slate-500 uppercase tracking-widest ml-1'>
                                        <FiCalendar className="text-emerald-500" /> Academic Session
                                    </label>
                                    <select name='session' className="input-premium w-full h-14 pt-3 text-slate-700 font-bold">
                                        <option value={""}>All Sessions</option>
                                        {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                                            <option key={yr}>{yr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className="btn-premium w-full h-16 flex items-center justify-center gap-3 text-lg font-bold group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner"></span>
                                        <span>Searching...</span>
                                    </div>
                                ) : (
                                    <>
                                        <FiSearch size={24} />
                                        <span>Load Student List</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="attendance-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-start mb-6">
                            <button
                                onClick={() => setStudents([])}
                                className="btn btn-ghost rounded-xl flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors"
                            >
                                <FiArrowRight className="rotate-180" /> Select Different Batch
                            </button>
                        </div>
                        <Attendance students={students}></Attendance>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default AttendanceBatch
