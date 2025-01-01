import React, { useContext, useEffect, useState } from 'react'
import { Link, Navigate, useLoaderData } from 'react-router-dom'
import { AuthContext } from '../Provider'
import ProgramList from './ProgramList'
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";


function ProgramEntry() {
    const user = useLoaderData()
    const { month, date, year, loggedUser, notifySuccess, role, notifyFailed } = useContext(AuthContext)

    const [displayUser, setDisplayUser] = useState(user)
    const [loading, setLoading] = useState(false)

    const [disabled, setDisabled] = useState(false)
    const handleSelect = e => {
        console.log('s')
        setDisabled(true)
        setTimeout(() => {
            setDisabled(false)
        }, 500)
    }

    const [navigate, setNavigate] = useState(false)
    const [programStatus, setProgramStatus] = useState('regular')

    const handleProgramChanged = (e) => {
        const program = e.target.value
        if (program == 'HscPhy' || program == 'SscPhy') {
            setProgramStatus('regular')
        }
        else if (program == 'Exam' || program == 'Others' || program == 'PBC') {
            setProgramStatus('admission')
        }
        else if (program == 'ExamDue' || program == 'HscPhyDue' || program == 'OthersDue' || program == 'HscPhyDue' || program == 'SscPhyDue' || program == 'MonthlyDue') {
            setProgramStatus('due')
        }

    }



    console.log(user)
    const { name, id, } = user;




    const handleProgramAdd = async (event) => {
        event.preventDefault();
        const id = user.id;
        setLoading(true)

        const payDate = `${date}-${month}-${year}`;
        const ptaken = loggedUser;
        if (!ptaken) {
            notifyFailed("Taker name not Loaded, Please refresh!");
            setLoading(false);
            return;
        }
        const program = event.target.program.value;

        //Agei joined ache kina 
        const alreadyPaid = user.programs.some(pro =>
            pro.program == program
        );

        if (alreadyPaid) {
            notifyFailed("Already enrolled in this program !");
            setLoading(false);
            return;
        }


        try {
            if (programStatus == 'regular') {
                const noteFee = parseInt(event.target.noteFee.value) || 0;
                const examFee = parseInt(event.target.examFee.value) || 0;

                const notePayment =
                {
                    type: "Note Fee",
                    id: id,
                    pamount: noteFee,
                    ptaken: loggedUser,
                    payDate: payDate,
                    year: year,
                    date: date,
                    month: month,
                    program,
                    name
                }
                const examPayment =
                {
                    type: "Exam Fee",
                    id: id,
                    pamount: examFee,
                    ptaken: loggedUser,
                    payDate: payDate,
                    year: year,
                    date: date,
                    month: month,
                    program,
                    name
                }

                user.payments.push(notePayment)
                user.payments.push(examPayment)



                const monthlyAmount = parseInt(event.target.monthlyAmount.value)
                user.monthlyAmount = monthlyAmount
                const type = 'regular';
                const Fee = noteFee + examFee
                const programData = {
                    program, monthlyAmount, type, payDate, Fee
                }
                user.programs.push(programData)

                const res = await fetch(`https://spoffice-server.vercel.app/addpayment/${id}`, {
                    method: 'PUT',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(user)

                })

                const resData = await res.json()
                if (resData.modifiedCount) {

                    const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            api_key: 'CUOP72nJJHahM30djaQG',
                            senderid: '8809617642567',
                            number: user.phone,
                            message: `Successfully enrolled program ${program}\nStudent ID: ${id}\nName: ${name}\nPaid Amount:${Fee}\nEnrolled by: ${loggedUser}\nSohag Physics`

                        }),
                    })
                    const result2 = await response2.json();
                    console.log(result2);
                    if (result2.response_code == 202) {

                        setLoading(false)
                        notifySuccess("Program Added successfully !")
                        setDisplayUser(user)
                    }
                }
            }



            else if (programStatus == 'admission') {
                const type = 'Program Fee'
                const pamount = parseInt(event.target.programFee.value) || 0;
                const pdata = {
                    id, type, pamount, payDate, ptaken, date, month, year, program, name
                }

                user.payments.push(pdata)
                const Fee = pamount;


                const programData = {
                    program, Fee, payDate
                }

                user.programs.push(programData)

                const res = await fetch(`https://spoffice-server.vercel.app/addpayment/${id}`, {
                    method: 'PUT',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(user)

                })

                const resData = await res.json()
                if (resData.modifiedCount) {

                    const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            api_key: 'CUOP72nJJHahM30djaQG',
                            senderid: '8809617642567',
                            number: user.phone,
                            message: `Successfully enrolled program ${program}\nStudent ID: ${id}\nName: ${name}\nPaid Amount:${Fee}\nEnrolled by: ${loggedUser}\nSohag Physics`

                        }),
                    })
                    const result2 = await response2.json();
                    console.log(result2);
                    if (result2.response_code == 202) {

                        setLoading(false)
                        notifySuccess("Program Added successfully !")
                        setDisplayUser(user)
                    }
                }
            }
            else if (programStatus == 'due') {
                const type = 'Program Fee Due'
                const pamount = parseInt(event.target.duePaid.value) || 0;
                const pdata = {
                    id, type, pamount, payDate, ptaken, date, month, year, program, name
                }

                user.payments.push(pdata)
                const Fee = pamount;
                const note = event.target.dueNote.value;
                const due = event.target.due.value;
                if (program == 'HscPhyDue') {
                    user.monthlyAmount = 800;
                }
                const programData = {
                    program, Fee, payDate, due, note
                }

                user.programs.push(programData)

                const res = await fetch(`https://spoffice-server.vercel.app/addpayment/${id}`, {
                    method: 'PUT',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(user)

                })

                const resData = await res.json()
                if (resData.modifiedCount) {
                    // setLoading(false)
                    // notifySuccess("Program Added successfully !")
                    // setDisplayUser(user)
                    const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            api_key: 'CUOP72nJJHahM30djaQG',
                            senderid: '8809617642567',
                            number: user.phone,
                            message: `Successfully enrolled program ${program}\nStudent ID: ${id}\nName: ${name}\nPaid Amount:${Fee}\nDue Amount:${due}\nEnrolled by: ${loggedUser}`

                        }),
                    })
                    const result2 = await response2.json();
                    console.log(result2);
                    if (result2.response_code == 202) {

                        setLoading(false)
                        notifySuccess("Program Added successfully !")
                        setDisplayUser(user)
                    }
                }
            }
        }
        catch (err) {
            console.log(err)
        }


    };






    return (
        <div>
            <div className='mx-auto flex mt-2 flex-col gap-5 lg:flex-row w-full' >

                {/* students part */}

                <div className='lg:w-2/5'>
                    <h1 className='font-bold text-2xl '>Program Entry :</h1>

                    <div className='flex py-3 px-2 items-center my-2 justify-between'>
                        <p className='font-bold text-3xl'>{name} <span className='bg-sky-100 text-sky-500 font-semibold text-xl px-4 rounded-xl py-1'>{id}</span></p>
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="rounded-full p-1 bg-sky-200  font-semibold"><BsThreeDotsVertical /></div>
                            <ul onClick={() => { handleSelect() }} tabIndex={0} className={`dropdown-content ${disabled ? 'hidden' : ''} menu bg-sky-100 text-sky-600 font-semibold rounded-box z-[1] w-52 p-2 shadow `}>
                                <li className=''><Link to={`/payment/${user.id}`}> <FaMoneyBillTransfer /> Payment Entry</Link></li>
                                <li><Link to={`/students/${user.id}`}><CgProfile /> Profile</Link></li>

                            </ul>
                        </div>
                    </div>
                    <ProgramList className='' student={displayUser}></ProgramList>



                </div>

                <form className='w-full  lg:w-full' onSubmit={handleProgramAdd}>
                    <div className='grid grid-cols-1  lg:w-full  gap-3'>



                        <div>
                            <p className='font-semibold'>Program <span className='text-red-700'>*</span> </p>
                            <select onChange={handleProgramChanged} required name='program' className="select text-lg font-semibold  select-info w-full ">

                                <option value={'HscPhy'}>HSC Physics</option>
                                <option value={'HscPhyDue'}>HSC Physics Due</option>
                                <option value={'PBC'}>PBC</option>
                                <option value={'SscPhy'}>SSC Physics</option>
                                <option value={'MonthlyDue'}>Monthly Payment Due</option>

                                <option value={'SscPhyDue'}>SSC Physics Due</option>
                                <option value={'Exam'}>Exam Batch </option>
                                <option value={'ExamDue'}>Exam Batch Due </option>
                                <option value={'Others'}>Others </option>
                                <option value={'OthersDue'}>Others Due </option>
                            </select>
                        </div>
                        {
                            programStatus == "regular" ?
                                role == 'CEO' ? <div>
                                    <p className='font-semibold'>Monthly Amount <span className='text-red-700'>*</span> </p>
                                    <input
                                        onWheel={(e) => e.target.blur()}
                                        required
                                        name='monthlyAmount'
                                        type="number"
                                        defaultValue={800}
                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>
                                    :
                                    <div>
                                        <p className='font-semibold'>Monthly Amount <span className='text-red-700'>*</span> </p>
                                        <input
                                            onWheel={(e) => e.target.blur()}
                                            required
                                            name='monthlyAmount'
                                            type="text"
                                            value={800}
                                            className="input text-lg font-semibold  input-bordered input-info w-full " />
                                    </div>
                                :
                                <></>
                        }
                        {
                            programStatus == "admission" ? <div>
                                <p className='font-semibold'>Program Fee <span className='text-red-700'>*</span> </p>
                                <input
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    name='programFee'
                                    type="number"
                                    defaultValue={0}

                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <></>
                        }
                        {
                            programStatus == "regular" ? <div>
                                <p className='font-semibold'>Note Fee <span className='text-red-700'>*</span> </p>
                                <input
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    name='noteFee'
                                    type="number"

                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <></>
                        }
                        {
                            programStatus == "regular" ? <div>
                                <p className='font-semibold'>Exam Fee <span className='text-red-700'>*</span> </p>
                                <input
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    name='examFee'
                                    type="number"

                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <></>
                        }
                        {
                            programStatus == "due" ? <div>
                                <p className='font-semibold'>Paid Amount <span className='text-red-700'>*</span> </p>
                                <input
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    name='duePaid'
                                    type="number"

                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <></>
                        }
                        {
                            programStatus == "due" ? <div>
                                <p className='font-semibold'>Due Amount <span className='text-red-700'>*</span> </p>
                                <input
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    name='due'
                                    type="number"

                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <></>
                        }
                        {
                            programStatus == "due" ? <div>
                                <p className='font-semibold'>Note  </p>
                                <input

                                    name='dueNote'
                                    type="text"

                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <></>
                        }


                        <div className='flex  mt-2 flex-col lg:flex-row'>

                            <div className=' text-center  w-full'>
                                <input className="font-semibold w-full bg-blue-100  border-2 rounded-xl h-11  btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Confirm"}`} />
                                <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                            </div>
                        </div>

                    </div>

                </form>

            </div>


            {navigate ? <Navigate to={`/payment`}></Navigate> : <></>}
        </div>
    )
}

export default ProgramEntry