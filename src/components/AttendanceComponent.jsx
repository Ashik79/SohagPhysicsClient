import React, { useState, useEffect } from 'react';
import { getDaysInMonth, startOfMonth, format } from 'date-fns';
import { FiCalendar, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const years = [2023, 2024, 2025, 2026, 2027];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AttendanceCalendar = ({ student }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [attendances, setAttendances] = useState([]);

    useEffect(() => {
        if (student && student.attendances) {
            setAttendances(student.attendances);
        }
    }, [student]);

    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    const startDay = startOfMonth(new Date(selectedYear, selectedMonth)).getDay();

    const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
        return {
            date: new Date(selectedYear, selectedMonth, index + 1),
            day: index + 1
        };
    });

    const stats = {
        present: calendarDays.filter(d => attendances.some(a => a.date === format(d.date, 'd-M-yyyy'))).length,
        total: calendarDays.length
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                        <FiCalendar size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Attendance Registry</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Presence Analysis: {stats.present}/{stats.total} Days</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-black text-slate-500 shadow-sm outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-black text-slate-500 shadow-sm outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all"
                    >
                        {years.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-slate-50/50 p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                <div className="grid grid-cols-7 gap-3 mb-6">
                    {dayNames.map((dayName, index) => (
                        <div key={index} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{dayName}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: startDay }).map((_, index) => (
                        <div key={index} className="aspect-square"></div>
                    ))}
                    {calendarDays.map(({ date, day }) => {
                        const dateString = format(date, 'd-M-yyyy');
                        const isPresent = attendances.some(attendance => attendance.date === dateString);
                        const isToday = format(new Date(), 'd-M-yyyy') === dateString;

                        return (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                key={day}
                                className={`
                                    aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 border
                                    ${isPresent
                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-100 shadow-sm'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-teal-200'}
                                    ${isToday && !isPresent ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
                                `}
                            >
                                <span className={`text-sm font-black ${isPresent ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                                {isPresent && <FiCheckCircle size={10} className="mt-1 opacity-50" />}
                                {!isPresent && date < new Date() && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-emerald-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-white border border-slate-100 ring-2 ring-teal-500 ring-offset-1"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
