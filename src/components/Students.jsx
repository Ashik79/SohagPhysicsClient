import API_URL from '../apiConfig';
import React, { useContext, useState, Suspense, lazy } from 'react'
const StudentsList = lazy(() => import('./StudentList'));
import { AuthContext } from '../Provider';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiHash, FiFilter, FiUserCheck } from 'react-icons/fi';

function Students() {
    const { notifyFailed, notifySuccess, role } = useContext(AuthContext)
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)

    const handleSearch = e => {
        setLoading(true)
        e.preventDefault();
        const query = {};
        const id = e.target.id.value
        const name = e.target.name.value;
        const phone = e.target.phone.value;

        if (id) query.id = id;
        if (name) query.name = name;
        if (phone) query.phone = phone;

        if (!query.phone && !query.id && !name) {
            notifyFailed("Please provide at least Name, ID or Phone")
            setLoading(false)
            return
        }

        fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(query)
        })
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    notifyFailed("No results found")
                    setStudents([])
                } else {
                    notifySuccess(`Found ${data.length} students`)
                    setStudents(data)
                }
                setLoading(false)
            })
            .catch(() => {
                notifyFailed("Search failed. Please try again.")
                setLoading(false)
            })
    }

    const inputGroup = (icon, label, name, type = "text", placeholder = "") => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                {icon} {label}
            </label>
            <input
                name={name}
                type={type}
                className="input-premium"
                placeholder={placeholder}
                onWheel={(e) => e.target.blur()}
            />
        </div>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-1 lg:p-4"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <FiSearch className="text-3xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Finder</h1>
                        <p className="text-slate-500 font-semibold">Locate and manage profiles with precision</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs">
                    <FiFilter /> Results Simplified
                </div>
            </div>

            <form onSubmit={handleSearch} className="glass-panel p-6 lg:p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {inputGroup(<FiHash />, "Student ID", "id", "number", "e.g. 12345")}
                    {inputGroup(<FiUser />, "Full Name", "name", "text", "Enter name...")}
                    {inputGroup(<FiUserCheck />, "Phone Number", "phone", "text", "017...")}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-100 pt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-premium px-12 py-5 rounded-2xl w-full sm:w-auto min-w-[240px]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span className="uppercase tracking-widest text-sm font-black">Finding...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 justify-center">
                                <FiSearch className="text-xl" />
                                <span className="uppercase tracking-[0.1em] text-sm font-black text-white">Perform Search</span>
                            </div>
                        )}
                    </button>
                    {students.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setStudents([])}
                            className="px-8 py-5 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Reset Results
                        </button>
                    )}
                </div>
            </form>

            <AnimatePresence>
                {students.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-12 space-y-6"
                    >
                        <div className="flex items-center gap-4 px-6">
                            <div className="h-px flex-1 bg-slate-100"></div>
                            <h2 className="text-xl font-extrabold text-slate-800">
                                Match Summary: <span className="text-indigo-600 ml-2 bg-indigo-50 px-3 py-1 rounded-lg">{students.length} Students</span>
                            </h2>
                            <div className="h-px flex-1 bg-slate-100"></div>
                        </div>
                        <Suspense fallback={<div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Preparing Student Profiles...</div>}>
                            <StudentsList students={students} />
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Students
