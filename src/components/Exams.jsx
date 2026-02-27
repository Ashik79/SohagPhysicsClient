import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider'
import { Link, Navigate, useLoaderData } from 'react-router-dom'
import { IoMdClose } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import LoadingPage from './OtherPages.jsx/LoadingPage';

function Exams() {

    const { month, year, date, getMonth, notifySuccess } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [firstLoading, setFirstLoading] = useState(true)
    const [allExams, setAllExams] = useState([])
    const [displayExams, setDisplayExams] = useState([]);

    useEffect(() => {
        fetch('https://spoffice-server.vercel.app/getexams')
            .then(res => res.json())
            .then(data => {
                setAllExams(data)
                const sortedExams = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setDisplayExams(sortedExams);
                setFirstLoading(false)
            })
    }, []);

    const [navigate, setNavigate] = useState(false)
    const handleAddExam = e => {
        setLoading(true)
        e.preventDefault()
        const title = e.target.title.value
        const day = e.target.day.value
        const month = e.target.month.value
        const year = e.target.year.value
        const program = e.target.program.value
        const mcqTotal = e.target.mcqTotal.value ? parseInt(e.target.mcqTotal.value) : 0;
        const writenTotal = e.target.writenTotal.value ? parseInt(e.target.writenTotal.value) : 0;
        const batch = e.target.batch.value
        const session = e.target.session.value
        const date = `${getMonth(month)} ${day}, ${year}`
        const results = []

        const details = {
            title, day, month, year, date, batch, program, session, results, mcqTotal, writenTotal
        }

        fetch('https://spoffice-server.vercel.app/addexam', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(details)
        })
            .then(res => res.json())
            .then(data => {
                // //console.log(data)
                if (data.insertedId) {
                    notifySuccess("Exam added Successfully")
                    const newDisplay = [...displayExams, details]
                    setDisplayExams(newDisplay)
                    setLoading(false)
                    document.getElementById('my_modal_1').close()
                    setNavigate(true)
                }
            })
        e.target.reset()
    }


    const handleFilter = e => {
        e.preventDefault()
        // //console.log('status changed')
        const program = e.target.program.value
        const batch = e.target.batch.value
        const session = e.target.session.value
        const day = e.target.day.value
        const month = e.target.month.value
        const year = e.target.year.value


        let filtered = allExams.filter(exam => {
            return (!program || exam.program === program) &&
                (!batch || exam.batch === batch) &&
                (!session || exam.session === session) &&
                (!day || exam.day === day) &&
                (!month || exam.month === month) &&
                (!year || exam.year === year)

        })

        // //console.log(filtered)
        setDisplayExams(filtered.reverse())


    }


    const handleDelete = (id) => {

        Swal.fire({
            title: 'Are You Sure?',
            text: 'Do you want to delete the exam?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {

                fetch(`https://spoffice-server.vercel.app/exam/delete/${id}`, {
                    method: "DELETE"
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.deletedCount) {
                            notifySuccess("Successfully Deleted Exam")
                            setDisplayExams(prevExams => prevExams.filter(exam => exam._id !== id));

                        }
                    })
            } else if (result.isDismissed) {
                return
            }
        })




    }

    return (
        !firstLoading ? <div>
            {/* Open the modal using document.getElementById('ID').showModal() method */}
            <div className='flex justify-between items-center'>
                <p className=' font-bold text-xl text-cyan-600 underline lg:text-2xl'>Exam Management</p>
                <button className="btn border-2 border-cyan-600 text-cyan-600 font-bold hover:border-black  hover:text-black" onClick={() => document.getElementById('my_modal_1').showModal()}>Add Exam</button>
            </div>
            {/* add korar modal edit */}
            <dialog id="my_modal_1" className="modal ">
                <div className="modal-box ">
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
                        </form>
                    </div>
                    <form className='mx-auto  w-full' onSubmit={handleAddExam} >


                        {/* students part */}
                        <div className='flex  flex-col '>
                            <h1 className='font-bold text-center underline mb-2 text-xl '>Exam Details </h1>
                            <div className='grid grid-cols-1   gap-3'>


                                <div>
                                    <p className='font-semibold'>Title <span className='text-red-700'>*</span> </p>
                                    <input
                                        required
                                        name='title'
                                        type="text"

                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>
                                <div>
                                    <p className='font-semibold'>Date <span className='text-red-700'>*</span> </p>
                                    <div className='flex justify-between gap-2'>
                                        <div className="mb-4 w-1/3">

                                            <select
                                                defaultValue={date}
                                                name='day'
                                                className="block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                            >

                                                {[...Array(31)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {i + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4 w-1/3">

                                            <select
                                                defaultValue={month}
                                                name='month'

                                                className="block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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

                                        <div className="mb-4 w-1/3">

                                            <select
                                                name='year'
                                                defaultValue={year}
                                                className="p-2 border border-gray-300 rounded w-full"
                                            >
                                                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className='font-semibold'>Batch <span className='text-red-700'>*</span> </p>

                                    <select name='batch' className="select text-lg font-semibold  select-info w-full ">

                                        <option value={""} >All</option>
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
                                    <p className='font-semibold'>Program <span className='text-red-700'>*</span> </p>
                                    <select name='program' className="select text-lg font-semibold  select-info w-full ">

                                        <option value={''}>All</option>
                                        <option value={'HscPhy'}>HSC Physics</option>
                                        <option value={'HscPhyDue'}>HSC Physics Due</option>

                                        <option value={'SscPhy'}>SSC Physics</option>

                                        <option value={'Exam'}>Exam Batch </option>

                                        <option value={'Others'}>Others </option>





                                    </select>
                                </div>
                                <div>
                                    <p className='font-semibold'>Session <span className='text-red-700'>*</span> </p>
                                    <select name='session' className="select text-lg font-semibold  select-info w-full ">

                                        <option >All</option>
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
                                <div>
                                    <p className='font-semibold'>Total MCQ Marks  </p>
                                    <input

                                        name='mcqTotal'
                                        type="text"

                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>
                                <div>
                                    <p className='font-semibold'>Total Written Marks  </p>
                                    <input

                                        name='writenTotal'
                                        type="text"

                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>


                            </div>
                        </div>


                        <div className='flex mt-10 flex-col lg:flex-row'>
                            <h1 className='font-bold text-lg lg:w-1/4'></h1>
                            <div className='lg:w-2/3 text-center'>
                                <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl  h-11  btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? '' : "Add"}`} />
                                <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                            </div>
                        </div>

                    </form>










                </div>
            </dialog>




            {/* Uporer dialog ta modal er part */}

            <div className='mt-2 w-full flex  flex-col lg:flex-row'>
                <p className='font-bold text-lg w-1/3'>Filter Exams :</p>
                <div className='w-full lg:w-2/3'>
                    <form className='' onSubmit={handleFilter}>


                        <div className='flex  flex-col gap-1 '>

                            <div className='grid grid-cols-3 gap-3 font-semibold lg:grid-cols-3'>
                                <div className="mb-4">
                                    <label className="block text-gray-700  font-bold mb-2 ">Day:</label>
                                    <select
                                        defaultValue={""}
                                        name='day'
                                        className="block w-full border-sky-600 bg-white border  rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    >
                                        <option value="">All</option>
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4 ">
                                    <label className="block text-gray-700  font-bold mb-2">Month:</label>
                                    <select
                                        defaultValue={""}
                                        name='month'

                                        className="block w-full bg-white border border-sky-600 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                                <div className="mb-4 w-full">
                                    <label className="block text-gray-700  font-bold mb-2">Year:</label>
                                    <select
                                        name='year'
                                        defaultValue={""}
                                        className="p-2 border border-sky-600 rounded w-full"
                                    > <option value={""}>All</option>
                                        {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>



                            </div>

                            <div className=' w-full flex gap-2 flex-col lg:flex-row'>
                                <div className='w-full lg:w-1/3'>
                                    <p className='font-semibold'>Batch  </p>

                                    <select name='batch' className="select text-lg font-semibold  select-info w-full  ">

                                        <option value={''}>All</option>
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



                                <div className='w-full lg:w-1/3'>
                                    <p className='font-semibold'>Program  </p>
                                    <select name='program' className="select text-lg font-semibold  select-info w-full ">
                                        <option value={''}>All</option>
                                        <option value={'HscPhy'}>HSC Physics</option>
                                        <option value={'HscPhyDue'}>HSC Physics Due</option>

                                        <option value={'SscPhy'}>SSC Physics</option>

                                        <option value={'Exam'}>Exam Batch </option>

                                        <option value={'Others'}>Others </option>




                                    </select>
                                </div>
                                <div className='w-full lg:w-1/3'>
                                    <p className='font-semibold'>Session  </p>
                                    <select name='session' className="select text-lg font-semibold  select-info w-full ">

                                        <option value={''}>All</option>
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

                        <div className='w-full mt-2  flex items-end'>

                            <div className='w-full text-center'>
                                <input className=" text-lg font-semibold border-2   hover:border-black text-sky-600 w-full bg-blue-100  rounded-xl    btn-outline  py-1  px-3  " type='submit' value='Filter' />
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sob Exam dekhai */}

            <div className='flex text-gray-500 font-semibold mt-8 mb-2 w-full'>
                <div className='w-3/5'>
                    <p>NAME</p>
                </div>

                <div className='w-2/5 flex'>
                    <p className='w-1/2'>MCQ</p>
                    <p className='w-1/2'>WRITTEN</p>
                </div>
            </div>

            {
                displayExams.map((exam, index) => <>
                    <div key={index} className='flex w-full cursor-pointer items-center border-b  p-1 border-sky-600 '>
                        <Link className='w-3/5' to={`/exam/${exam._id}`}>
                            <div  >
                                <p className='font-semibold'>{exam.title}</p>
                                <p className='text-sm text-gray-500'>{exam.date}</p>
                            </div>
                        </Link>

                        <Link className='w-2/5' to={`/exam/${exam._id}`}>
                            <div className='  flex text-gray-500 font-semibold'>
                                <p className='w-1/2 ml-6'>{exam.mcqTotal}</p>
                                <p className='w-1/2 ml-10'>{exam.writenTotal}</p>
                            </div>
                        </Link>


                        <a onClick={() => handleDelete(exam._id)} className='flex items-center text-lg gap-1 text-red-600'><MdDeleteForever /></a>


                    </div>
                </>)
            }


            {
                navigate ? <Navigate to={'/exams'}></Navigate> : ''
            }
        </div> :
            <div>
                <LoadingPage></LoadingPage>
            </div>
    )
}

export default Exams