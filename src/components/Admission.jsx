import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate } from 'react-router-dom';

function Admission() {

    const { month, year, date, loggedUser, notifySuccess, notifyFailed } = useContext(AuthContext)
    const type = "Admission"
    const [loading, setLoading] = useState(false)
    const [navigate, setNavigate] = useState(false)
    const [error, setError] = useState('')
    const [id, setId] = useState(0)



    const handleAdmission = async (e) => {

        const admissionDate = `${date}-${month}-${year}`
        console.log(admissionDate)
        console.log("admission clicked")
        e.preventDefault();
        const id = e.target.id.value;

        setLoading(true)
        setId(id)
        // const monthlyAmount = parseInt(e.target.monthlyAmount.value)
        console.log(typeof (monthlyAmount))
        // const noteFee = parseInt(e.target.noteFee.value)
        // const examFee = parseInt(e.target.examFee.value)
        const batch = e.target.batch.value;
        const name = e.target.name.value;
        const school = e.target.school.value;
        const college = e.target.college.value;

        const session = e.target.session.value;
        const target = e.target.target.value;
        const phone = e.target.phone.value;
        const address = e.target.address.value;
        const reference = e.target.reference.value;
        const gname = e.target.gname.value;
        const gphone = e.target.gphone.value;
        const gender = e.target.gender.value;

        const attendances = []
        const programs = []
        const exams = []



        const admissionMonth = month;
        const admissionYear = year;
        const payments = [

        ];
        const admittedBy = loggedUser;

        //sob data diye object banai
        const formData = {
            id, batch, name, school, college, programs, session, target, phone, address, reference, gname, gphone, gender, admissionDate, payments, admittedBy, admissionMonth, admissionYear, attendances, exams
        }
        console.log(formData)

        try {
            const response = await fetch('https://spoffice-server.vercel.app/admit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                // If response is not ok, handle error
                const errorText = await response.text();
                setError(errorText);
                notifyFailed(errorText)
                setLoading(false)
            } else {
                // Handle successful response
                const result = await response.json();
               
console.log(result)
                const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_key: 'CUOP72nJJHahM30djaQG',
                        senderid: '8809617642567',
                        number:phone,
                        message: `Welcome to Sohag Physics\nStudent ID: ${id}\nName: ${name}\nRegistered by: ${admittedBy}\nContact:\n 01789539292\n 01780719371\nFB Group:\nhttps://facebook.com/groups/351973371171795\nFB Page:\nhttps://facebook.com/sohagphysics\nWebsite: https://sohagphysics.fun`
                        
                    }),
                })
                const result2 = await response2.json();
                console.log(result2);
                if (result2.response_code == 202) {

                    notifySuccess("Registration Successful !")
                    setLoading(false)
                    setNavigate(true)
                }




                // Clear the form or show success message as needed
            }
        } catch (error) {
            // Handle network or other errors
            setError('An error occurred while submitting the form.');
            notifyFailed(error)
        }
    };


    const handleKeyPress = (e) => {
        if (e.key == 'Enter') {
            e.preventDefault();
        }
    }

    return (
        <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-2xl text-cyan-500 underline mt-10'>Registration Form</h1>
            <form className='mx-auto w-full' onSubmit={handleAdmission} onKeyPress={handleKeyPress}>

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'>Student's Information :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>
                        <div>
                            <p className='font-semibold'>ID <span className='text-red-700'>*</span> <span className='text-sm text-gray-500'>Must be 6 digits</span></p>
                            <input
                                onWheel={(e) => e.target.blur()}
                                required
                                name='id'
                                type="number"
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>

                        <div>
                            <p className='font-semibold'>Name <span className='text-red-700'>*</span> </p>
                            <input
                                required
                                name='name'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>Batch <span className='text-red-700'>*</span> </p>

                            <select name='batch' className="select text-lg font-semibold  select-info w-full ">

                                <option>Sat 1</option>
                                <option>Sat 2</option>
                                <option>Sat 3</option>
                                <option>Sat 4</option>
                                <option>Sat 5</option>
                                <option>Sat 6</option>
                                <option>Sat 7</option>
                                <option>Sat 8</option>
                                <option>Sat 9</option>
                                <option>Sat 10</option>
                                <option>Sat 11</option>
                                <option>Sat 12</option>
                                <option>Sun 1</option>
                                <option>Sun 2</option>
                                <option>Sun 3</option>
                                <option>Sun 4</option>
                                <option>Sun 5</option>
                                <option>Sun 6</option>
                                <option>Sun 7</option>
                                <option>Sun 8</option>
                                <option>Sun 9</option>
                                <option>Sun 10</option>
                                <option>Sun 11</option>
                                <option>Sun 12</option>
                                <option>Admission Cancelled</option>
                                <option>Inactive</option>



                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Phone <span className='text-red-700'>*</span> </p>
                            <input
                                required
                                name='phone'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>

                        <div>
                            <p className='font-semibold'>School Name <span className='text-red-700'>*</span> </p>
                            <input
                                required
                                name='school'
                                type="text"

                                className="input input-bordered text-lg font-semibold  input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>College Name </p>
                            <input
                                name='college'
                                type="text"

                                className="input input-bordered text-lg font-semibold  input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>Gender </p>
                            <select name='gender' className="select text-lg font-semibold  select-info w-full ">

                                <option>Male</option>
                                <option>Female</option>


                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Session <span className='text-red-700'>*</span> </p>
                            <select name='session' className="select text-lg font-semibold  select-info w-full ">


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
                            <p className='font-semibold'>Target </p>
                            <select name='target' className="select text-lg font-semibold  select-info w-full ">

                                <option>Medical</option>
                                <option>Varsity</option>
                                <option>Engineering</option>



                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Address </p>
                            <input
                                name='address'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>referenced by  </p>
                            <input
                                name='reference'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>
                    </div>
                </div>

                {/* Guardian Part */}
                <div className='flex mt-10 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'>Guardian's Information :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>

                        <div>
                            <p className='font-semibold'>Guardian Name  </p>
                            <input

                                name='gname'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>



                        <div>
                            <p className='font-semibold'>Guardian Phone </p>
                            <input

                                name='gphone'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>

                    </div>
                </div>
                <div className='flex mt-10 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl  h-11  btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? '' : 'Register'}`} />
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                </div>

            </form>

            {navigate ? <Navigate to={`/students/${id}`}></Navigate> : <></>}
        </div>
    )
}

export default Admission