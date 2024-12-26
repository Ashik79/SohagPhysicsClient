import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate, useLoaderData } from 'react-router-dom';

function UpdateStudent() {

    const { month, year, date, notifySuccess, notifyFailed, role } = useContext(AuthContext)
    const [navigate, setNavigate] = useState(false)

    const student = useLoaderData()
    const { address, batch, college, gender, gname, gphone, id, monthlyAmount, name, phone, program, reference, school, session, target, group } = student

    const [error, setError] = useState('')




    const handleAdmission = async (e) => {

        const admissionDate = `${date}-${month}-${year}`
        console.log(admissionDate)
        console.log("admission clicked")
        e.preventDefault();

        const monthlyAmount = parseInt(e.target.monthlyAmount.value)
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






        //sob data diye object banai
        const formData = {
            id, monthlyAmount, batch, name, school, college, session, target, phone, address, reference, gname, gphone, gender
        }
        console.log(formData)

        try {
            const response = await fetch(`https://spoffice-server.vercel.app/student/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                // If response is not ok, handle error
                const errorText = await response.text();
                notifyFailed(errorText)

            } else {
                // Handle successful response
                const result = await response.json();
                console.log('Updated:', result);
                if (result.modifiedCount) {
                    notifySuccess("Student info updated")
                    setNavigate(true)
                }
                // Clear the form or show success message as needed
            }
        }
        catch (error) {
            // Handle network or other errors
            setError('An error occurred while submitting the form.');
            console.log(error)
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    return (
        <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold  text-2xl text-cyan-500 underline mt-10'>Update Student</h1>
            <form className='mx-auto w-full' onSubmit={handleAdmission} onKeyPress={handleKeyPress}>

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'>Student's Information :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>


                        <div>
                            <p className='font-semibold'>Name <span className='text-red-700'>*</span> </p>
                            <input
                                required
                                name='name'
                                type="text"
                                defaultValue={name}

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>Batch <span className='text-red-700'>*</span> </p>

                            <select name='batch' defaultValue={batch} className="select text-lg font-semibold  select-info w-full ">

                                <option value={'Sat 1'}>শনি ৭টা (নিউ টেন SSC 26 - HSC 28)</option>
                                <option value={'Sat 2'}>শনি ৮টা (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option value={'Sat 3'}>শনি ৯টা (নিউ টেন SSC 26 - HSC 28)</option>
                                <option value={'Sat 4'}>শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option value={'Sat 5'}>শনি ১১টা </option>
                               
                                <option value={'Sat 6'}>শনি ২টা (HSC 26)</option>
                                <option value={'Sat 7'}>শনি ৩টা (HSC 26)</option>
                                <option value={'Sat 8'}>শনি ৪টা (HSC 25)</option>
                                <option value={'Sat 9'}>শনি ৫টা (HSC 26)</option>
                                <option value={'Sat 10'}>শনি ৬.১৫ টা (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option value={'Sat 11'}>শনি ৭.১৫ টা (নিউ টেন SSC 26 - HSC 28)</option>
                                <option value={'Sun 1'}>রবি ৭টা (HSC 25)</option>
                                <option value={'Sun 2'}>রবি ৮টা (HSC 26)</option>
                                <option value={'Sun 3'}>রবি ৯টা (HSC 26)</option>
                                <option value={'Sun 4'}>রবি ১০টা (Nine & Ten combined)</option>
                                <option value={'Sun 5'}>রবি ১১টা </option>
                               
                                <option value={'Sun 6'}>রবি ২টা (HSC 26) </option>
                                <option value={'Sun 7'}>রবি ৩টা (HSC 25) </option>
                                <option value={'Sun 8'}>রবি ৪টা (HSC 26) </option>
                                <option value={'Sun 9'}>রবি ৫টা (HSC 26) </option>
                                <option value={'Sun 10'}>রবি ৬টা (নিউ নাইন SSC 27 - HSC 29) </option>
                                <option value={'Sun 11'}>রবি ৭টা (নিউ টেন SSC 26 - HSC 28) </option>
                                <option>Exam Batch HSC 25</option>
                                <option>Exam Batch HSC 26</option>
                                <option>Exam Batch (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option>Exam Batch (নিউ টেন SSC 26 - HSC 28)</option>
                                <option>Admission Cancelled</option>
                                <option>Inactive</option>
                                <option>SSC 25 (Physics Olympiad)</option>
                                <option>Class 9 (SSC 27) Phy Champ</option>
                                <option>Class 10 (SSC 26) Phy Champ</option>

                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Phone <span className='text-red-700'>*</span> </p>
                            <input
                                required
                                name='phone'
                                type="text"
                                defaultValue={phone}
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>


                        <div className={`${role =='CEO'?'':'hidden'}`}>
                            <p className='font-semibold'>Monthly Fee <span className='text-red-700'>*</span> </p>
                            <input

                                name='monthlyAmount'
                                type="text"
                                defaultValue={monthlyAmount}
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>School Name <span className='text-red-700'>*</span> </p>
                            <input
                                required
                                name='school'
                                type="text"
                                defaultValue={school}
                                className="input input-bordered text-lg font-semibold  input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>College Name </p>
                            <input
                                name='college'
                                type="text"
                                defaultValue={college}
                                className="input input-bordered text-lg font-semibold  input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>Gender </p>
                            <select name='gender' defaultValue={gender} className="select text-lg font-semibold  select-info w-full ">

                                <option>Male</option>
                                <option>Female</option>


                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Session <span className='text-red-700'>*</span> </p>
                            <select name='session' defaultValue={session} className="select text-lg font-semibold  select-info w-full ">


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
                            <select name='target' defaultValue={target} className="select text-lg font-semibold  select-info w-full ">

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
                                defaultValue={address}
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>
                        <div>
                            <p className='font-semibold'>referenced by  </p>
                            <input
                                name='reference'
                                type="text"
                                defaultValue={reference}
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
                                defaultValue={gname}
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>



                        <div>
                            <p className='font-semibold'>Guardian Phone </p>
                            <input

                                name='gphone'
                                type="text"
                                defaultValue={gphone}
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>

                    </div>
                </div>
                <div className='flex mt-10 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl    btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value='Update' />
                    </div>
                </div>

            </form>
            {navigate ? <Navigate to={`/students/${id}`}></Navigate> : <></>}

        </div>
    )
}

export default UpdateStudent