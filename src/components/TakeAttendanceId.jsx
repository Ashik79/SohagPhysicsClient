import React, { useContext, useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { AuthContext } from '../Provider';
import { FiCheckCircle, FiXCircle, FiCalendar, FiUser, FiCreditCard, FiMoreVertical, FiArrowLeft, FiClock, FiAward } from "react-icons/fi";
import { motion, AnimatePresence } from 'framer-motion';
import AttendanceCalendar from './AttendanceComponent';
import DueView from './DueView';

function TakeAttendanceId() {
    const student = useLoaderData()
    const { month, loggedUser, getMonth, notifySuccess, notifyFailed, year, date } = useContext(AuthContext);
    const today = `${date}-${month}-${year}`
    const [displayStudent, setDisplayStudent] = useState(student);
    const [present, setPresent] = useState(false);
    const [exam, setExam] = useState({})
    const [lastAttendanceDate, setLastAttendanceDate] = useState("Not Found")

    useEffect(() => {
        const isPresentToday = student.attendances?.some(attendance => attendance.date === today);
        setPresent(isPresentToday);

        const examLength = student.exams ? student.exams.length : 0;
        if (examLength) setExam(student.exams[examLength - 1])

        const length = student.attendances ? student.attendances.length : 0;
        if (length) setLastAttendanceDate(student.attendances[length - 1].date)
        else (setLastAttendanceDate("Not Found"))
    }, [student, month, student.attendances, today]);

    const handleAttendance = (e) => {
        e.preventDefault();
        const attendance = { date: today };

        if (present) {
            const updatedAttendances = student.attendances.filter(att => att.date !== today);
            updateStudent({ ...student, attendances: updatedAttendances });
        } else {
            updateStudent({ ...student, attendances: [...student.attendances, attendance] });
        }
    };

    const updateStudent = (updatedStudent) => {
        fetch(`${import.meta.env.VITE_API_URL}/addpayment/${updatedStudent.id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(updatedStudent)
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount) {
                    setDisplayStudent(updatedStudent);
                    setPresent(!present);
                    notifySuccess(present ? "Attendance removed" : "Attendance marked");
                }
            })
            .catch(err => {
                console.error(err);
                notifyFailed("Failed to update attendance");
            });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-20 max-w-4xl mx-auto"
        >
            <div className="flex items-center justify-between mb-8">
                <Link to="/attendance-batch" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-cyan-600 transition-all shadow-sm">
                    <FiArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm">
                    <FiClock size={16} /> Today: {today}
                </div>
            </div>

            <form onSubmit={handleAttendance} className="space-y-8">
                {/* Main Student Card */}
                <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white"
                                >
                                    <img
                                        className="w-full h-full object-cover"
                                        src={student.image || '/profile.jpg'}
                                        alt={student.name}
                                    />
                                </motion.div>
                                <div className={`absolute -bottom-2 -right-2 p-3 rounded-2xl shadow-lg border-2 border-white text-white ${present ? 'bg-emerald-500' : 'bg-slate-200 text-slate-400'}`}>
                                    <FiCheckCircle size={20} />
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{student.name}</h2>
                                <p className="text-cyan-600 font-bold tracking-widest text-xs uppercase mt-1">ID: {student.id}</p>
                            </div>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex-1 space-y-6 w-full">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-indigo-100">
                                    <FiUser size={12} /> {student.batch}
                                </span>
                                {student.programs?.map((program, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-cyan-100">
                                        <FiActivity size={12} /> {program.program}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-slate-700 font-bold flex items-center gap-2">
                                        <FiCheckCircle className={present ? "text-emerald-500" : "text-slate-300"} />
                                        {present ? "Present Today" : "Not Marked"}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Presence</p>
                                    <p className="text-slate-700 font-bold flex items-center gap-2">
                                        <FiCalendar className="text-cyan-500" />
                                        {lastAttendanceDate}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className={`flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${present
                                            ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                                            : "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
                                        }`}
                                >
                                    {present ? <><FiXCircle size={18} /> Remove Attendance</> : <><FiCheckCircle size={18} /> Mark Present</>}
                                </button>

                                <div className="dropdown dropdown-top md:dropdown-end">
                                    <div tabIndex={0} role="button" className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-cyan-600 transition-all shadow-sm">
                                        <FiMoreVertical size={20} />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu p-3 shadow-2xl bg-white rounded-2xl w-52 mb-2 border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                                        <li className="mb-1">
                                            <Link to={`/payment/${student.id}`} className="rounded-xl flex items-center gap-3 py-3 font-bold text-slate-600 hover:text-cyan-600 hover:bg-cyan-50">
                                                <FiCreditCard size={18} /> Payment Entry
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/students/${student.id}`} className="rounded-xl flex items-center gap-3 py-3 font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                                                <FiUser size={18} /> Full Profile
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Due View */}
                    <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                        <DueView student={student} />
                    </div>

                    {/* Result Card */}
                    <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                <FiAward size={18} />
                            </div>
                            <h3 className="font-black text-slate-800 tracking-tight">Latest Result</h3>
                        </div>

                        {exam.title ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Examination</p>
                                    <p className="text-slate-800 font-bold">{exam.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                        <p className="text-2xl font-black text-indigo-600">
                                            {exam.mcqMarks + exam.writenMarks}
                                            <span className="text-xs text-slate-400 font-bold ml-1">/ {exam.mcqTotal + exam.writenTotal}</span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                        <p className="text-slate-700 font-bold flex items-center gap-2">
                                            <FiCalendar size={14} className="text-slate-400" /> {exam.date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center text-slate-400">
                                <FiAward size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-bold">No results recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {/* Attendance Calendar */}
            <div className="mt-12 bg-white/50 backdrop-blur-xl border border-white/20 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 bg-cyan-100 rounded-xl text-cyan-600">
                        <FiCalendar size={18} />
                    </div>
                    <h3 className="font-black text-slate-800 tracking-tight">Attendance History</h3>
                </div>
                <AttendanceCalendar student={displayStudent} />
            </div>
        </motion.div>
    );
}

export default TakeAttendanceId;
