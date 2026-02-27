import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Provider';
import { IoCloudDownloadOutline } from "react-icons/io5";

function CustomList() {
    const { notifyFailed, month, year, notifySuccess, role, date } = useContext(AuthContext)
    const [students, setStudents] = useState([])
    const [paymentStatus, setPaymentStatus] = useState('All');
    const [paymentMonth, setPaymentMonth] = useState(month)
    const [paymentYear, setPaymentYear] = useState(year)
    const [attendanceStatus, setAttendanceStatus] = useState('All');
    const [attendanceMonth, setAttendanceMonth] = useState(month)
    const [attendanceYear, setAttendanceYear] = useState(year)
    const [attendancedate, setAttendancedate] = useState(date)
    const [loading, setLoading] = useState(false)


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


    const sortArray = arr => {
        let ar = arr;
        if (ar.length) {
            ar.sort((a, b) => parseInt(a.id) - parseInt(b.id)
            )
            return ar
        }
        else return []
    }




    const handleSearch = async (e) => {
        setLoading(true)
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
                if (program == 'Free') {
                    filteredStudents = filteredStudents.filter(student => student.programs.length == 0)
                }
                else {
                    filteredStudents = filteredStudents.filter(student =>
                        student.programs && student.programs.some(p => p.program === program)
                    )
                }
            }

            // Filter by payment status
            if (paymentStatus === 'Paid') {
                filteredStudents = filteredStudents.filter(student =>
                    student.payments && student.payments.some(payment =>
                        payment.pmonth == paymentMonth && payment.pyear == paymentYear
                    )
                );
            } else if (paymentStatus === 'Unpaid') {
                filteredStudents = filteredStudents.filter(student =>
                    student.payments && !student.payments.some(payment =>
                        payment.pmonth == paymentMonth && payment.pyear == paymentYear
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
                setLoading(false)
            } else {
                notifyFailed('Sorry, no student is found');
                setLoading(false)
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            notifyFailed('An error occurred while fetching data');
            setLoading(false)
        }
    };







    const handleDownload = async () => {
        const sortedStudents = sortArray(students)
        try {

            const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/students', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'

                },
                body: JSON.stringify(sortedStudents)
            })

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
        }
        catch (err) {
            console.log(err)
        }
    }




    return (
        (role == 'CEO' || role == 'Manager') ? <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-xl  text-cyan-500 underline mt-10'>Custom List</h1>
            <form className='mx-auto w-full' onSubmit={handleSearch} >

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-base lg:w-1/4'>Searching Options :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>


                        <div>
                            <p className='font-semibold'>Batch </p>

                            <select name='batch' className="select text-base font-semibold  select-info w-full ">
                                <option value={""}>All</option>



                                <option value={'Olympiad-HSC27'}>Olympiad HSC 27</option>
                                <option value={'Sat 1'}>শনি ৭টা (HSC 27)</option>
                                <option value={'Sat 2'}>শনি ৮টা (নিউ নাইন SSC 28 - HSC 30)</option>
                                <option value={'Sat 3'}>শনি ৯টা (নিউ নাইন SSC 28 - HSC 30)</option>
                                <option value={'Sat 4'}>শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option value={'Sat 5'}>শনি ১১টা - SSC 26 (All Batch) </option>
                                <option value={'Sat 12'}>শনি ১২টা - New Nine (SSC 28 Special Batch) </option>

                                <option value={'Sat 6'}>শনি ২টা (HSC 27)</option>
                                <option value={'Sat 7'}>শনি ৩টা - HSC 27 (New Batch)</option>
                                <option value={'Sat 8'}>শনি ৪টা (SSC 27)</option>
                                <option value={'Sat 9'}>শনি ৫টা - SSC 28 (New Nine)</option>
                                <option value={'Sat 10'}>শনি ৬টা (SSC 28)</option>
                                <option value={'Sat 11'}>শনি ৭ টা ( SSC 27 - HSC 29)</option>
                                <option value={'Sun 1'}>রবি ৭টা (HSC 27)</option>
                                <option value={'Sun 2'}>রবি ৮টা (HSC 26)</option>
                                <option value={'Sun 3'}>রবি ৯টা - HSC 27 (New Batch)</option>
                                <option value={'Sun 4'}>রবি ১০টা (HSC 28)</option>
                                <option value={'Sun 5'}>রবি ১১টা </option>

                                <option value={'Sun 6'}>রবি ২টা (HSC 26) </option>
                                <option value={'Sun 7'}>রবি ৩টা (HSC 27) </option>
                                <option value={'Sun 8'}>রবি ৪টা (HSC 26) </option>
                                <option value={'Sun 9'}>রবি ৫টা (HSC 27) </option>
                                <option value={'Sun 10'}>রবি ৬টা (SSC 27 - HSC 29) </option>
                                <option value={'Sun 11'}>রবি ৭টা - SSC 28 (New Nine) </option>
                                <option>HSC 26 Admission cancel</option>
                                <option>HSC 27 Admission cancel</option>
                                <option>SSC 26 class 10 Admission cancel</option>
                                <option>SSC 27 class 9 Admission cancel</option>
                                <option>Exam Batch HSC 26</option>
                                <option>Exam Batch (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option>Exam Batch (নিউ টেন SSC 26 - HSC 28)</option>
                                <option value={'Olympiad-8'}>Olympiad 8 (ssc 28 - hsc 30)</option>
                                <option value={'Olympiad-9'}>Olympiad 9 (ssc 27 - hsc 29)</option>
                                <option value={'Hsc-27-Marketing'}>Hsc-27 (Marketing)</option>


                                <option>SSC 25 (Physics Olympiad)</option>
                                <option>Class 9 (SSC 27) Phy Champ</option>
                                <option>Class 10 (SSC 26) Phy Champ</option>

                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Program  </p>
                            <select name='program' className="select text-base font-semibold  select-info w-full ">
                                <option value={''}>All</option>
                                <option value={'Free'}>Free Class</option>
                                <option value={'HscPhy'}>HSC Physics</option>
                                <option value={'HscPhyDue'}>HSC Physics Due</option>


                                <option value={'SscPhy'}>SSC Physics</option>
                                <option value={'SscPhyDue'}>SSC Physics Due</option>


                                <option value={'suggestion'}>Suggestion Fee </option>





                            </select>
                        </div>
                        <div>
                            <p className='font-semibold'>Session  </p>
                            <select name='session' className="select text-base font-semibold  select-info w-full ">


                                <option value={""}>All</option>
                                <option>2023</option>
                                <option>2024</option>
                                <option>2025</option>
                                <option>2026</option>
                                <option>2027</option>
                                <option>2028</option>
                                <option>2029</option>
                                <option>2030</option>


                            </select>
                        </div>

                        <div className='lg:col-span-2'>
                            <p className='font-semibold'>Payment Status </p>
                            <select onChange={handleStatusChange} className="select text-base font-semibold  select-info w-full ">


                                <option >All</option>
                                <option>Paid</option>
                                <option>Unpaid</option>



                            </select>
                        </div>

                        {
                            paymentStatus != 'All' && <div>
                                <p className='font-semibold'>Month  </p>
                                <select
                                    onChange={handleMonthChange}
                                    defaultValue={month}
                                    name='month'

                                    className="select text-base font-semibold  select-info w-full"
                                >

                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>
                        }
                        {
                            paymentStatus != 'All' &&
                            <div>
                                <p className='font-semibold'>Year  </p>
                                <select onChange={handleYearChange} defaultValue={year} name='year' className="select text-base font-semibold  select-info w-full ">

                                    <option>2024</option>
                                    <option>2025</option>
                                    <option>2026</option>
                                </select>
                            </div>
                        }
                        <div className='lg:col-span-2'>
                            <p className='font-semibold'>Attendance Status </p>
                            <select onChange={handleAttendanceStatusChange} className="select text-base font-semibold  select-info w-full ">


                                <option >All</option>
                                <option>Present</option>
                                <option>Absent</option>



                            </select>
                        </div>


                        <div className='w-full lg:col-span-2 flex gap-1'>
                            {
                                attendanceStatus != 'All' &&
                                <div className='w-1/3'>
                                    <p className='font-semibold'>date  </p>
                                    <select
                                        onChange={handleAttendancedateChange}
                                        defaultValue={date}
                                        name='adate'

                                        className="select text-base font-semibold  select-info w-full"
                                    >

                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            }
                            {
                                attendanceStatus != 'All' &&
                                <div className='w-1/3'>
                                    <p className='font-semibold'>Month  </p>
                                    <select
                                        onChange={handleAttendanceMonthChange}
                                        defaultValue={month}
                                        name='amonth'

                                        className="select text-base font-semibold  select-info w-full"
                                    >

                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </div>
                            }
                            {
                                attendanceStatus != 'All' &&
                                <div className='w-1/3'>
                                    <p className='font-semibold'>Year  </p>
                                    <select onChange={handleAttendanceYearChange} defaultValue={year} name='ayear' className="select text-base font-semibold  select-info w-full ">

                                        <option>2024</option>
                                        <option>2025</option>
                                        <option>2026</option>
                                    </select>
                                </div>
                            }
                        </div>


                    </div>
                </div>

                <div className='flex mt-10 flex-col w-full lg:flex-row'>
                    <h1 className='font-bold text-base lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-base font-semibold h-11 w-full bg-blue-100  border-2 rounded-xl    btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Find Info"}`} />
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                </div>



            </form>

            {
                students.length ?
                    <div className='text-sky-600 text-center mt-8'>
                        <hr />
                        <p className='text-xl font-semibold'>Total Students Found <span className='font-bold text-red-600 text-2xl border-sky-600 border-2 rounded-full  px-2'>{students.length}</span></p>

                        <button onClick={handleDownload} className='flex items-center justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1 mt-3 w-full hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download</button>

                    </div> : <></>
            }


        </div> : <div className='text-red-600'> You Don't Have Permission</div>
    )
}

export default CustomList