import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../Provider';
import { FiCheckCircle } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import { FaCalendarCheck } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";
import AttendanceCalendar from './AttendanceComponent';

function TakeAttendance({ student, today }) {
    const { month, loggedUser, getMonth, notifySuccess, notifyFailed, year } = useContext(AuthContext);

    const [displayStudent, setDisplayStudent] = useState(null);
    const [present, setPresent] = useState(false);
    const [exam, setExam] = useState({})
    const [lastAttendanceDate, setLastAttendanceDate] = useState("Not Found")
    const [newStudent, setNewStudent] = useState(false)
    const [unpaidMonths, setUnpaidMonths] = useState([])


    useEffect(() => {
        setDisplayStudent(null)
        if (student.payments.length == 0) {
            setNewStudent(true)
        }
        // Check if the student is present today
        const isPresentToday = student.attendances.some(attendance => attendance.date === today);
        setPresent(isPresentToday);
        setDisplayStudent(student)
        const examPayment = student.payments.find(payment => payment.type == "Exam Fee")
        const examLength = student.exams ? student.exams.length : 0;
        if (examLength) setExam(student.exams[examLength - 1])
        if (student.payments.length) {


            const allMonthlyPayments = []
            student.payments.forEach(payment => {
                if (payment.type == "Monthly") {
                    allMonthlyPayments.push(payment)
                }
            })
            if (examPayment && allMonthlyPayments.length == 0) {
                setNewStudent(true)
            }
            const lastMonthlyPayment = allMonthlyPayments[allMonthlyPayments.length - 1]

            let bulb = false;
            const unpaid = []
            const yearArray = [2024, 2025, 2026, 2027, 2028, 2029, 2030]
            if (lastMonthlyPayment) {
                for (let i = 0; i < 7; i++) {

                    for (let j = 1; j <= 12; j++) {


                        if (bulb) {
                            const obj = { month: j, monthName: getMonth(j), year: yearArray[i] }
                            unpaid.push(obj)
                            if (j == parseInt(month) && yearArray[i] == parseInt(year)) {
                                bulb = false
                                setUnpaidMonths(unpaid)
                            }

                        }

                        if (j == parseInt(lastMonthlyPayment.pmonth) && yearArray[i] == parseInt(lastMonthlyPayment.pyear)) {
                            bulb = true
                        }
                    }


                }
                if (parseInt(lastMonthlyPayment.pmonth == parseInt(month) && parseInt(lastMonthlyPayment.pyear == parseInt(year)))) {
                    setUnpaidMonths([])
                }
            }


        }

        const length = student.attendances ? student.attendances.length : 0;
        if (length) setLastAttendanceDate(student.attendances[length - 1].date)
        else (setLastAttendanceDate("Not Found"))
        setDisplayStudent(student)
    }, [student, month, student.attendances, today]);

    const handleAttendance = (e) => {
        e.preventDefault();
        const attendance = { date: today };

        if (present) {
            // Remove attendance
            const updatedAttendances = student.attendances.filter(att => att.date !== today);
            updateStudent({ ...student, attendances: updatedAttendances });
        } else {
            // Add attendance
            updateStudent({ ...student, attendances: [...student.attendances, attendance] });
        }
    };

    const updateStudent = (updatedStudent) => {
        fetch(`https://spoffice-server.vercel.app/addpayment/${updatedStudent.id}`, {
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
                    setPresent(!present); // Toggle present state
                    if (present) {
                        notifyFailed("Attendance removed!");
                    } else {
                        notifySuccess("Attendance marked as present!");
                    }
                }
            });
    };

    return (
        displayStudent? 
        <div>
            <form className='mx-auto w-full' onSubmit={handleAttendance}>
                {/* Student Information */}
                <div className='flex mt-5 flex-col gap-5 lg:flex-row'>
                    <div className='w-full'>

                        <hr />
                        <div className='flex py-3 px-2 items-center my-2 justify-between'>
                            <p className='font-bold text-2xl'>{student.name} <span className='bg-sky-100 text-sky-600 font-semibold text-sm lg:text-base px-4 rounded-xl py-1'>{student.id}</span></p>
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="rounded-full p-1 bg-sky-200 font-semibold">
                                    <BsThreeDotsVertical />
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-gray-100 text-sky-600 font-semibold rounded-box z-[1] w-52 p-2 shadow">
                                    <li><Link to={`/payment/${student.id}`}><FaMoneyBillTransfer /> Payment Entry</Link></li>
                                    <li><Link to={`/students/${student.id}`}><CgProfile /> Profile</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Attendance Status */}
                        <div>
                            <p className='font-semibold flex items-center justify-start gap-1'>
                                <span className='bg-sky-200 font-semibold rounded-xl px-2 text-sm py-1'>Registered</span>
                                {student.programs ? student.programs.map((program, index) => (
                                    <span className='bg-sky-200 font-semibold rounded-xl px-2 text-sm py-1' key={index}>{program.program}</span>
                                )) : <></>}
                            </p>
                            <p className='font-semibold'> Last present in <span className='font-semibold text-sky-600'>{lastAttendanceDate}</span></p>
                            <p className='text-sky-600 flex items-center border rounded-xl my-2 border-sky-600 gap-2 py-1 px-3 font-semibold text-base'><span className='text-green-700 font-bold'></span> Batch : {student.batch}</p>
                            <div className='flex justify-around my-1 mx-10 items-center '>
                                <div className='w-24 lg:w-32  mb-4 '>
                                    <img className='rounded-lg' src={`${student.image ? student.image : '/profile.jpg'}`} alt="Image" />
                                </div>
                                {present ? (
                                    <div className='flex items-center justify-center'>
                                        <button className='py-5 px-2 flex items-center gap-1 flex-col text-xl bg-gray-200 rounded-xl text-green-600 font-bold'>
                                            <FaCalendarCheck /> Present
                                        </button>
                                    </div>
                                ) : (
                                    <div className='flex items-center justify-center'>
                                        <button type='submit' className='py-5 px-2 bg-gray-300 text-xl rounded-xl text-red-600 font-bold'>
                                            Mark <br /> Present
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Status */}

                        {newStudent ? <div className='text-sky-600 text-sm lg:text-base p-1 px-5 text-start border border-sky-600 rounded-lg my-1 font-semibold'>
                            New Student
                        </div> :
                            <div className='p-2 border-sky-400 mt-2 border rounded-lg text-center'>
                                {unpaidMonths.length ? <p className='font-semibold my-2'>Unpaid Months: <span className='text-red-600 font-bold'>{unpaidMonths.length}</span></p> : <p className=' font-semibold text-green-700'>All Payments Clear</p>}
                                <div className={`p-1 text-sm lg:text-base ${unpaidMonths.length && 'h-28'} overflow-auto`}>
                                    {
                                        unpaidMonths.map((unpaid, index) => <div className='border border-red-600 rounded-md my-1 flex justify-center gap-3 items-center text-red-600 font-semibold' key={index}>
                                            <div>{unpaid.monthName}</div>
                                            <div>
                                                {unpaid.year}
                                            </div>
                                        </div>)
                                    }
                                </div>
                            </div>}


                        {exam.title ?
                            <div className='border rounded-xl border-sky-600 py-1 px-5'>
                                <p className='font-semibold my-2 text-sky-700 underline'>Last Result</p>
                                <div>
                                    <p><strong>Title:</strong> {exam.title}</p>
                                    {exam.mcqTotal ? <p><strong>MCQ :</strong> {exam.mcqMarks}/{exam.mcqTotal}</p> : ''}
                                    {exam.writenTotal ? <p><strong>Writen :</strong> {exam.writenMarks}/{exam.writenTotal}</p> : ''}
                                    <p><strong>Total:</strong> {exam.mcqMarks + exam.writenMarks}/{exam.mcqTotal + exam.writenTotal}</p>
                                    <p><strong>Date:</strong> {exam.date}</p>
                                </div>
                            </div> : <><p className='text-red-500 border rounded-xl border-sky-600 py-1 px-5 font-semibold'>No Result found </p></>}
                    </div>
                </div>
            </form>
            <AttendanceCalendar student={displayStudent}></AttendanceCalendar>
        </div> : <div>Loading...</div>
    );
}

export default TakeAttendance;
