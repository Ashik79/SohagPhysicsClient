import API_URL from '../../apiConfig';
import React, { useContext, useState } from 'react'

import { IoCloudDownloadOutline } from "react-icons/io5";
import { AuthContext } from '../../Provider';

function NumberSheet() {
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
            const res = await fetch(`${API_URL}/students`, {
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

            const downloadResponse = await fetch(`${API_URL}/download/students`, {
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
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-xl text-cyan-500 underline mt-10'>Number Sheet</h1>
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
                                <option value={'Sat 1'}>শনি à§­à¦Ÿা (HSC 27)</option>
                                <option value={'Sat 2'}>শনি à§®à¦Ÿা (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 28 - HSC 30)</option>
                                <option value={'Sat 3'}>শনি à§¯à¦Ÿা (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 28 - HSC 30)</option>
                                <option value={'Sat 4'}>শনি à§§à§¦à¦Ÿা (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 27 - HSC 29)</option>
                                <option value={'Sat 5'}>শনি à§§à§§à¦Ÿা - SSC 26 (All Batch) </option>
                                <option value={'Sat 12'}>শনি à§§à§¨à¦Ÿা - New Nine (SSC 28 Special Batch) </option>

                                <option value={'Sat 6'}>শনি à§¨à¦Ÿা (HSC 27)</option>
                                <option value={'Sat 7'}>শনি à§©à¦Ÿা - HSC 27 (New Batch)</option>
                                <option value={'Sat 8'}>শনি à§ªà¦Ÿা (SSC 27)</option>
                                <option value={'Sat 9'}>শনি à§«à¦Ÿা - SSC 28 (New Nine)</option>
                                <option value={'Sat 10'}>শনি à§¬à¦Ÿা (SSC 28)</option>
                                <option value={'Sat 11'}>শনি ৭ à¦Ÿা ( SSC 27 - HSC 29)</option>
                                <option value={'Sun 1'}>রবি à§­à¦Ÿা (HSC 27)</option>
                                <option value={'Sun 2'}>রবি à§®à¦Ÿা (HSC 26)</option>
                                <option value={'Sun 3'}>রবি à§¯à¦Ÿা - HSC 27 (New Batch)</option>
                                <option value={'Sun 4'}>রবি à§§à§¦à¦Ÿা (HSC 28)</option>
                                <option value={'Sun 5'}>রবি à§§à§§à¦Ÿা </option>

                                <option value={'Sun 6'}>রবি à§¨à¦Ÿা (HSC 26) </option>
                                <option value={'Sun 7'}>রবি à§©à¦Ÿা (HSC 27) </option>
                                <option value={'Sun 8'}>রবি à§ªà¦Ÿা (HSC 26) </option>
                                <option value={'Sun 9'}>রবি à§«à¦Ÿা (HSC 27) </option>
                                <option value={'Sun 10'}>রবি à§¬à¦Ÿা (SSC 27 - HSC 29) </option>
                                <option value={'Sun 11'}>রবি à§­à¦Ÿা - SSC 28 (New Nine) </option>
                                <option>HSC 26 Admission cancel</option>
                                <option>HSC 27 Admission cancel</option>
                                <option>SSC 26 class 10 Admission cancel</option>
                                <option>SSC 27 class 9 Admission cancel</option>
                                <option>Exam Batch HSC 26</option>
                                <option>Exam Batch (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 27 - HSC 29)</option>
                                <option>Exam Batch (à¦¨à¦¿à¦‰ à¦Ÿà§‡ন SSC 26 - HSC 28)</option>
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
                        <p className='text-lg font-semibold'>Total Students Found <span className='font-bold text-red-600 text-2xl border-sky-600 border-2 rounded-full  px-2'>{students.length}</span></p>

                        <button onClick={handleDownload} className='flex items-center justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1 mt-3 w-full hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download</button>

                    </div> : <></>
            }


        </div> : <div className='text-red-600'> You Don't Have Permission</div>
    )
}

export default NumberSheet