import React, { useContext, useState } from 'react'
import { AuthContext } from '../Provider';

function Message() {

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
    const [selectedOption, setSelectedOption] = useState('bangla');
    const [divisor, setDivisor] = useState(65)
    const handleOptionChange = e => {
        const value = e.target.value;
        setSelectedOption(value)
        if (value == 'bangla') {

            setDivisor(65)
        }
        else if (value == 'english') {
            setDivisor(155)
        }
    }
    const [messageText, setMessageText] = useState("")

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

    const getWordCount = (text) => {
        // Match words using a regex that handles spaces and line breaks
        return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    };

    const handleSearch = async (e) => {
        setLoading(true)
        e.preventDefault();
        const query = {};
        const id = e.target.id.value;
        const batch = e.target.batch.value;

        const program = e.target.program.value;
        const session = e.target.session.value;


        if (batch) query.batch = batch;
        if (id) query.id = id;
        if (session) query.session = session;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/students`, {
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
                // //console.log(filteredStudents)
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

    const handleKeyUp = e => {
        const text = e.target.value
        setMessageText(text)
    }

    const handleSend = async () => {
        setLoading(true)
        // //console.log('send', messageText)

        try {
            const ids = []
            students.map(student => {
                ids.push(student.id)

            })

            const res = await fetch(`${import.meta.env.VITE_API_URL}/getnumbers`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(ids)
            })

            const data = await res.json()

            const numbers = data.map(d => d.phone)
            const numbersString = numbers.join(',');
            // //console.log(numbersString)

            const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: 'CUOP72nJJHahM30djaQG',
                    senderid: '8809617642567',
                    number: numbersString,
                    message: messageText

                }),
            })
            const result2 = await response2.json();
            // //console.log(result2);
            if (result2.response_code == 202) {

                notifySuccess("SMS Sent Successfully !")

                setLoading(false)

            }
            else if (result2.response_code != 202) {
                notifyFailed(result2.error_message)

                setLoading(false)

            }
        }
        catch (err) {
            console.log(err)
        }
    }
    //just checking

    return (
        (role == 'CEO' || role == 'Manager') ? <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-2xl text-cyan-500 underline mt-10'>Messaging</h1>
            <form className='mx-auto w-full' onSubmit={handleSearch} >

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'>Searching Options :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>
                        <div>
                            <p className='font-semibold'>ID</p>
                            <input
                                onWheel={(e) => e.target.blur()}

                                name='id'
                                type="number"
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>


                        <div>
                            <p className='font-semibold'>Batch </p>

                            <select name='batch' className="select text-lg font-semibold  select-info w-full ">
                                <option value={""}>All</option>



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

                        <div>
                            <p className='font-semibold'>Program  </p>
                            <select name='program' className="select text-lg font-semibold  select-info w-full ">
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
                            <select name='session' className="select text-lg font-semibold  select-info w-full ">


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
                            <p className='font-semibold'>Payment  </p>
                            <select onChange={handleStatusChange} className="select text-lg font-semibold  select-info w-full ">


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

                                    className="select text-lg font-semibold  select-info w-full"
                                >
                                    <option value="">All</option>
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
                            paymentStatus != 'All' && <div>
                                <p className='font-semibold'>Year  </p>
                                <select onChange={handleYearChange} defaultValue={year} name='year' className="select text-lg font-semibold  select-info w-full ">
                                    <option>2024</option>
                                    <option>2025</option>
                                    <option>2026</option>
                                </select>
                            </div>
                        }

                        <div className='lg:col-span-2'>
                            <p className='font-semibold'>Attendance  </p>
                            <select onChange={handleAttendanceStatusChange} className="select text-lg font-semibold  select-info w-full ">


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

                                        className="select text-lg font-semibold  select-info w-full"
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

                                        className="select text-lg font-semibold  select-info w-full"
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
                                    <select onChange={handleAttendanceYearChange} defaultValue={year} name='ayear' className="select text-lg font-semibold  select-info w-full ">

                                        <option>2024</option>
                                        <option>2025</option>
                                        <option>2026</option>
                                    </select>
                                </div>
                            }
                        </div>

                    </div >
                </div >

                <div className='flex mt-10 flex-col w-full lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-lg font-semibold h-11  w-full bg-blue-100  border-2 rounded-xl    btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Find Students"}`} />
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                </div>



            </form >
            {
                students.length ? <>
                    <div className='mt-10 flex flex-col lg:flex-row gap-5'>
                        <div className='w-full lg:w-2/3'>
                            <textarea onKeyUp={handleKeyUp} className='w-full p-2 h-40 rounded-lg border-2 border-sky-600' name="text" ></textarea>
                            <div className='relative -mt-9 text-end pr-4  '>
                                char : <span className='font-semibold text-sky-600'>{messageText.length}</span> || word : <span className='font-semibold text-sky-600'>{getWordCount(messageText)}</span>
                            </div>
                        </div>
                        <div className='w-full lg:w-1/3 flex justify-center flex-col items-start gap-2'>
                            <div className='text-red-600 font-semibold border-2 border-red-600 rounded-lg w-full h-20 lg:h-28 flex flex-col items-center justify-center'>
                                <div className='flex items-center gap-2'>
                                    <p className='text-2xl font-bold text-center border border-sky-600 rounded-full p-2 py-0'>{students.length}</p>
                                    <p>Students will get the SMS</p>
                                </div>
                                <p className='text-sky-600 flex gap-2 items-center text-sm'>Calculation for
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="bangla"
                                                checked={selectedOption === 'bangla'} // Bind the checked property to state
                                                onChange={handleOptionChange}
                                            />
                                            à¦¬à¦¾à¦‚à¦²à¦¾
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="english"
                                                checked={selectedOption === 'english'} // Bind the checked property to state
                                                onChange={handleOptionChange}
                                            />
                                            English
                                        </label>
                                    </div>
                                </p>
                                <div className='flex items-center gap-3'>
                                    <p>Cost: {(Math.ceil(messageText.length / divisor) * 0.35 * students.length).toFixed(2)} TK</p>
                                    <p>Sms Part: {Math.ceil(messageText.length / divisor)} </p>
                                </div>



                            </div>
                            <div className='h-10 border-2 font-bold text-sky-600 hover:bg-slate-400 hover:text-white w-full rounded-lg border-sky-600 text-center '>
                                <button className='my-1 h-11' onClick={handleSend} >{loading ? "" : "Send SMS"}</button>
                                <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                            </div>
                        </div>

                    </div>
                </> : <></>
            }

        </div > : <div className='text-red-600'> You Don't Have Permission</div>
    )
}

export default Message