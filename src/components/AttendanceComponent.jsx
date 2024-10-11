// src/components/AttendanceCalendar.jsx
import React, { useState, useEffect } from 'react';
import { getDaysInMonth, startOfMonth, format } from 'date-fns';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const years = [2023, 2024, 2025, 2026]; // Define the range of years

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

    return (
        <div className="p-4">
            <div className="flex mb-4">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="mr-2 p-2 border">
                    {months.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                    ))}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="p-2 border">
                    {years.map((year, index) => (
                        <option key={index} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {dayNames.map((dayName, index) => (
                    <div key={index} className="text-center font-semibold">{dayName}</div>
                ))}
                {Array.from({ length: startDay }).map((_, index) => (
                    <div key={index} className="day-box"></div>
                ))}
                {calendarDays.map(({ date, day }) => {
                    const dateString = format(date, 'd-M-yyyy');
                    
                    const isPresent = attendances.some(attendance => attendance.date == dateString);

                    return (
                        <div
                            key={day}
                            className={`day-box border  p-2 text-center ${isPresent ? 'bg-green-500 text-white' : 'bg-red-300'}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttendanceCalendar;
