import React, { useContext, useState } from 'react'
import StudentsList from './StudentList';
import { AuthContext } from '../Provider';
function Students() {
    const { notifyFailed, notifySuccess, role } = useContext(AuthContext)

    const [students, setStudents] = useState([])

    const [loading, setLoading] = useState(false)
    const handleSearch = e => {
        setLoading(true)
        e.preventDefault();
        const query = {};
        const id = e.target.id.value
        const batch = e.target.batch.value;
        const name = e.target.name.value;
        const school = e.target.school.value;
        const college = e.target.college.value;
        const program = e.target.program.value;
        const session = e.target.session.value;

        const target = e.target.target.value;
        const phone = e.target.phone.value;
        const gender = e.target.gender.value;
        if (id) {
            query.id = id;
        }

        if (name) {
            query.name = name;
        }
        if (batch) {
            query.batch = batch;
        }
        if (school) {
            query.school = school;
        }
        if (college) {
            query.college = college;
        }
        if (college) {
            query.college = college;
        }

        if (session) {
            query.session = session;
        }
        if (target) {
            query.target = target;
        }
        if (phone) {
            query.phone = phone;
        }
        if (gender) {
            query.gender = gender;
        }
        console.log(query)
        if (role != 'CEO' && !query.phone && !query.id && !name) {
            notifyFailed("Input Can't be blank")
            setLoading(false)
            return
        }
        fetch(`https://spoffice-server.vercel.app/students`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(query)

        })
            .then(res => res.json())
            .then(data => {

                if (program) {
                    let filteredStudents = []
                    if (program == "Free") {
                        filteredStudents = data.filter(student => student.programs.length == 0)
                    }
                    else {
                        filteredStudents = data.filter(student =>
                            student.programs.some(p => p.program == program)

                        )
                    }
                    if (filteredStudents.length == 0) {
                        notifyFailed('Sorry, No student is found!')
                        setLoading(false)
                        setStudents([])
                    }
                    else if (filteredStudents.length) {
                        notifySuccess(`Found ${filteredStudents.length} students !`)
                        setLoading(false)

                        setStudents(filteredStudents)
                    }
                }
                else if (!program) {
                    if (data.length == 0) {
                        notifyFailed("Sorry, No student is found!")
                        setLoading(false)
                        setStudents([])
                    }
                    else if (data.length) {

                        console.log(data)
                        notifySuccess(`Found ${data.length} students !`)
                        setLoading(false)
                        setStudents(data)
                    }
                }
                console.log(students)
            })
    }
    return (
        <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-2xl text-cyan-500 underline mt-10'>Student Finder</h1>
            <form className='mx-auto w-full' onSubmit={handleSearch} >

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'>Searching Options :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>
                        <div>
                            <p className='font-semibold'>ID  </p>
                            <input
                                onWheel={(e) => e.target.blur()}
                                name='id'
                                type="number"
                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>

                        <div>
                            <p className={`font-semibold`}>Name  </p>
                            <input

                                name='name'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>


                        <div>
                            <p className='font-semibold'>Phone </p>
                            <input

                                name='phone'
                                type="text"

                                className="input text-lg font-semibold  input-bordered input-info w-full " />
                        </div>

                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
                            <p className='font-semibold'>School Name  </p>
                            <input

                                name='school'
                                type="text"

                                className="input input-bordered text-lg font-semibold  input-info w-full " />
                        </div>
                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
                            <p className='font-semibold'>College Name </p>
                            <input
                                name='college'
                                type="text"

                                className="input input-bordered text-lg font-semibold  input-info w-full " />
                        </div>
                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
                            <p className='font-semibold'>Gender </p>
                            <select name='gender' className="select text-lg font-semibold  select-info w-full ">
                                <option value={""}>All</option>
                                <option>Male</option>
                                <option>Female</option>


                            </select>
                        </div>

                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
                            <p className='font-semibold'>Batch </p>

                            <select name='batch' className="select text-lg font-semibold  select-info w-full ">
                                <option value={""}>All</option>
                                <option value={'Hsc-27-Marketing'}>Hsc-27 (Marketing)</option>
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

                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
                            <p className='font-semibold'>Program  </p>
                            <select name='program' className="select text-lg font-semibold  select-info w-full ">
                                <option value={''}>All</option>
                                <option value={'Free'}>Free Class</option>
                                <option value={'HscPhy'}>HSC Physics</option>
                                <option value={'HscPhyDue'}>HSC Physics Due</option>
                                <option value={'SscPhy'}>SSC Physics</option>
                                <option value={'SscPhyDue'}>SSC Physics Due</option>
                                <option value={'Exam'}>Exam Batch </option>
                                <option value={'ExamDue'}>Exam Batch Due </option>
                                <option value={'Others'}>Others </option>
                                <option value={'OthersDue'}>Others Due </option>




                            </select>
                        </div>
                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
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
                        <div className={` ${role == 'CEO' ? "" : "hidden"}`}>
                            <p className='font-semibold'>Target </p>
                            <select name='target' className="select text-lg font-semibold  select-info w-full ">

                                <option value={""}>All</option>
                                <option>Medical</option>
                                <option>Varsity</option>
                                <option>Engineering</option>



                            </select>
                        </div>



                    </div>
                </div>

                {/* Guardian Part */}

                <div className='flex mt-10 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl h-11   btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? '' : "Find Students"}`} />
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                </div>

            </form>
            {
                students.length ? <>
                    <div>
                        <h1 className='text-center my-3 text-2xl font-semibold text-black'>Total Students Found <span className='text-sky-600 font-bold '>{students.length}</span></h1>
                        <StudentsList students={students}></StudentsList>
                    </div>
                </> : <></>
            }

        </div>
    )
}

export default Students