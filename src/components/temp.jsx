import React, { useContext, useState } from 'react';
import { AuthContext } from '../Provider';
import { IoCloudDownloadOutline } from "react-icons/io5";

function Download() {
    const { notifyFailed, month, year, notifySuccess, role, date } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('All');
    const [paymentMonth, setPaymentMonth] = useState(month);
    const [paymentYear, setPaymentYear] = useState(year);
    const [attendanceStatus, setAttendanceStatus] = useState('All');
    const [attendanceMonth, setAttendanceMonth] = useState(month);
    const [attendanceYear, setAttendanceYear] = useState(year);
    const [attendancedate, setAttendancedate] = useState(date);

    const handleStatusChange = (event) => {
        setPaymentStatus(event.target.value);
    };

    const handleMonthChange = (event) => {
        setPaymentMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setPaymentYear(event.target.value);
    };

    const handleAttendanceStatusChange = (event) => {
        setAttendanceStatus(event.target.value);
    };

    const handleAttendanceMonthChange = (event) => {
        setAttendanceMonth(event.target.value);
    };

    const handleAttendanceYearChange = (event) => {
        setAttendanceYear(event.target.value);
    };

    const handleAttendancedateChange = (event) => {
        setAttendancedate(event.target.value);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const query = {};
        const batch = e.target.batch.value;
        const program = e.target.program.value;
        const session = e.target.session.value;

        if (batch) query.batch = batch;
        if (session) query.session = session;

        try {
            const res = await fetch('https://spoffice-server.vercel.app/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            let filteredStudents = data;

            // Filter by program
            if (program) {
                filteredStudents = filteredStudents.filter(student =>
                    student.programs.some(p => p.program === program)
                );
            }

            // Filter by payment status
            if (paymentStatus === 'Paid') {
                filteredStudents = filteredStudents.filter(student =>
                    student.payments.some(payment =>
                        payment.pmonth === paymentMonth && payment.pyear === paymentYear
                    )
                );
            } else if (paymentStatus === 'Unpaid') {
                filteredStudents = filteredStudents.filter(student =>
                    !student.payments.some(payment =>
                        payment.pmonth === paymentMonth && payment.pyear === paymentYear
                    )
                );
            }

            // Filter by attendance status
            if (attendanceStatus !== 'All') {
                const targetDate = `${attendancedate}-${attendanceMonth}-${attendanceYear}`;

                filteredStudents = filteredStudents.filter(student =>
                    attendanceStatus === 'Present'
                        ? student.attendances.some(attendance => attendance.date === targetDate)
                        : !student.attendances.some(attendance => attendance.date === targetDate)
                );
            }

            setStudents(filteredStudents);

            if (filteredStudents.length) {
                notifySuccess(`Found ${filteredStudents.length} students`);
            } else {
                notifyFailed('Sorry, no student is found');
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            notifyFailed('An error occurred while fetching data');
        }
    };

    const handleDownload = async () => {
        try {
            const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(students),
            });

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `students.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error('Failed to download Info');
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        role === 'CEO' ? (
            <div>
                <h1 className='text-center lg:text-left md:text-center font-semibold text-2xl text-cyan-500 underline mt-10'>Download</h1>
                <form className='mx-auto w-full' onSubmit={handleSearch}>
                    {/* Searching Options */}
                    <div className='flex mt-2 flex-col lg:flex-row'>
                        <h1 className='font-bold text-lg lg:w-1/4'>Searching Options :</h1>
                        <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>
                            <div>
                                <p className='font-semibold'>Batch</p>
                                <select name='batch' className="select text-lg font-semibold select-info w-full">
                                    <option value="">All</option>
                                    {/* Add other batch options here */}
                                </select>
                            </div>
                            <div>
                                <p className='font-semibold'>Program</p>
                                <select name='program' className="select text-lg font-semibold select-info w-full">
                                    <option value="">All</option>
                                    <option value='HscPhy'>HSC Physics</option>
                                    <option value='HscPhyDue'>HSC Physics Due</option>
                                    {/* Add other program options here */}
                                </select>
                            </div>
                            <div>
                                <p className='font-semibold'>Session</p>
                                <select name='session' className="select text-lg font-semibold select-info w-full">
                                    <option value="">All</option>
                                    {/* Add other session options here */}
                                </select>
                            </div>
                            <div className='lg:col-span-2'>
                                <p className='font-semibold'>Payment</p>
                                <select onChange={handleStatusChange} className="select text-lg font-semibold select-info w-full">
                                    <option>All</option>
                                    <option>Paid</option>
                                    <option>Unpaid</option>
                                </select>
                            </div>
                            {paymentStatus !== 'All' && (
                                <div>
                                    <p className='font-semibold'>Month</p>
                                    <select onChange={handleMonthChange} value={paymentMonth} className="select text-lg font-semibold select-info w-full">
                                        <option value="1">January</option>
                                        {/* Add other months */}
                                    </select>
                                </div>
                            )}
                            {paymentStatus !== 'All' && (
                                <div>
                                    <p className='font-semibold'>Year</p>
                                    <select onChange={handleYearChange} value={paymentYear} className="select text-lg font-semibold select-info w-full">
                                        <option>2024</option>
                                        {/* Add other years */}
                                    </select>
                                </div>
                            )}
                            <div className='lg:col-span-2'>
                                <p className='font-semibold'>Attendance</p>
                                <select onChange={handleAttendanceStatusChange} className="select text-lg font-semibold select-info w-full">
                                    <option>All</option>
                                    <option>Present</option>
                                    <option>Absent</option>
                                </select>
                            </div>
                            {attendanceStatus !== 'All' && (
                                <div className='w-full lg:col-span-2 flex gap-1'>
                                    <div className='w-1/3'>
                                        <p className='font-semibold'>Date</p>
                                        <select onChange={handleAttendancedateChange} value={attendancedate} className="select text-lg font-semibold select-info w-full">
                                            {[...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='w-1/3'>
                                        <p className='font-semibold'>Month</p>
                                        <select onChange={handleAttendanceMonthChange} value={attendanceMonth} className="select text-lg font-semibold select-info w-full">
                                            <option value="1">January</option>
                                            {/* Add other months */}
                                        </select>
                                    </div>
                                    <div className='w-1/3'>
                                        <p className='font-semibold'>Year</p>
                                        <select onChange={handleAttendanceYearChange} value={attendanceYear} className="select text-lg font-semibold select-info w-full">
                                            <option>2024</option>
                                            {/* Add other years */}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='flex mt-10 flex-col w-full lg:flex-row'>
                        <h1 className='font-bold text-lg lg:w-1/4'></h1>
                        <div className='lg:w-2/3 text-center'>
                            <input className="text-lg font-semibold w-full bg-blue-100 border-2 rounded-xl btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value='Find Info' />
                        </div>
                    </div>
                </form>
                <div className='mt-5'>
                    <button onClick={handleDownload} className='btn btn-outline btn-primary'>
                        <IoCloudDownloadOutline className='text-xl' />
                        <span className='ml-2'>Download Data</span>
                    </button>
                </div>
                <div className='overflow-x-auto mt-5'>
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className='border px-4 py-2'>Name</th>
                                <th className='border px-4 py-2'>Batch</th>
                                <th className='border px-4 py-2'>Program</th>
                                <th className='border px-4 py-2'>Session</th>
                                <th className='border px-4 py-2'>Attendance Status</th>
                                <th className='border px-4 py-2'>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className='border px-4 py-2'>{student.name}</td>
                                    <td className='border px-4 py-2'>{student.batch}</td>
                                    <td className='border px-4 py-2'>{student.programs.map(p => p.program).join(', ')}</td>
                                    <td className='border px-4 py-2'>{student.session}</td>
                                    <td className='border px-4 py-2'>
                                        {student.attendances.some(att => att.date === `${attendancedate}-${attendanceMonth}-${attendanceYear}`)
                                            ? 'Present'
                                            : 'Absent'}
                                    </td>
                                    <td className='border px-4 py-2'>
                                        {student.payments.some(payment =>
                                            payment.pmonth === paymentMonth && payment.pyear === paymentYear
                                        ) ? 'Paid' : 'Unpaid'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <p>You do not have permission to access this page.</p>
        )
    );
}

export default Download;
