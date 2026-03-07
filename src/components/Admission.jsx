import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import { FiUser, FiInfo, FiUsers, FiPhone, FiBook, FiMapPin, FiStar, FiMessageCircle, FiHeart, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

function Admission() {

    const { month, year, date, loggedUser, notifySuccess, notifyFailed } = useContext(AuthContext)
    const type = "Admission"
    const [loading, setLoading] = useState(false)
    const [navigate, setNavigate] = useState(false)
    const [error, setError] = useState('')
    const [id, setId] = useState(0)
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    const handleImageUpload = (url) => {
        setUploadedImageUrl(url);
        // //console.log("Image URL received in parent:", url);
    };


    const handleAdmission = async (e) => {

        const admissionDate = `${date}-${month}-${year}`
        // //console.log(admissionDate)
        // //console.log("admission clicked")
        e.preventDefault();
        const id = e.target.id.value;
        let image = '';
        if (uploadedImageUrl) {
            image = uploadedImageUrl
        }
        setLoading(true)
        setId(id)
        // const monthlyAmount = parseInt(e.target.monthlyAmount.value)
        // //console.log(typeof (monthlyAmount))
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
        const note = e.target.note.value;
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
            id, batch, name, image, school, note, college, programs, session, target, phone, address, reference, gname, gphone, gender, admissionDate, payments, admittedBy, admissionMonth, admissionYear, attendances, exams
        }
        // //console.log(formData)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admit`, {
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

                // //console.log(result)
                const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_key: 'CUOP72nJJHahM30djaQG',
                        senderid: '8809617642567',
                        number: phone,
                        message: `Welcome to Sohag Physics\nStudent ID: ${id}\nName: ${name}\nRegistered by: ${admittedBy}\nContact:\n 01789539292\n 01780719371\nFB Group:\nhttps://facebook.com/groups/351973371171795\nFB Page:\nhttps://facebook.com/sohagphysics\nWebsite: https://sohagphysics.fun`

                    }),
                })
                const result2 = await response2.json();
                // //console.log(result2);
                if (result2.response_code == 202) {

                    notifySuccess("Registration Successful !")
                    setLoading(false)
                    setNavigate(true)
                }
                else (notifyFailed(result2.error_message))
                setLoading(false)
                setNavigate(true)



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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='pb-20'
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600">
                    <FiUser size={24} />
                </div>
                <h1 className='font-black text-2xl lg:text-3xl text-slate-800 tracking-tight'>Registration Form</h1>
            </div>

            <form className='mx-auto w-full space-y-12' onSubmit={handleAdmission} onKeyPress={handleKeyPress}>

                {/* students part */}
                <div className='flex flex-col lg:flex-row gap-8'>
                    <div className="lg:w-1/4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiInfo className="text-cyan-500" />
                            <h2 className='font-bold text-lg text-slate-800 uppercase tracking-wider'>Student Info</h2>
                        </div>
                        <p className="text-sm text-slate-500">Enter personal and academic details of the student.</p>
                    </div>

                    <div className='lg:w-3/4 bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            <div className='lg:col-span-2 mb-4'>
                                <ImageUpload onUpload={handleImageUpload}></ImageUpload>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'>ID <span className='text-red-500'>*</span> <span className='text-[10px] text-slate-400 ml-2 font-normal'>(6 digits)</span></p>
                                <input
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    name='id'
                                    type="number"
                                    className="input-premium w-full"
                                    placeholder="Enter 6-digit ID"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Name <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='name'
                                    type="text"
                                    className="input-premium w-full"
                                    placeholder="Student's Full Name"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiUsers className="text-indigo-400" /> Batch <span className='text-red-500'>*</span></p>
                                <select name='batch' className="input-premium w-full pt-3">
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
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiPhone className="text-green-500" /> Phone <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='phone'
                                    type="text"
                                    className="input-premium w-full"
                                    placeholder="Whatsapp number Preferred"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiBook className="text-blue-500" /> School Name <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='school'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiBook className="text-indigo-500" /> College Name</p>
                                <input
                                    name='college'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Gender</p>
                                <select name='gender' className="input-premium w-full pt-3">
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'>Session <span className='text-red-500'>*</span></p>
                                <select name='session' className="input-premium w-full pt-3">
                                    {['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'].map(yr => (
                                        <option key={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiStar className="text-amber-500" /> Target</p>
                                <select name='target' className="input-premium w-full pt-3">
                                    <option>Medical</option>
                                    <option>Varsity</option>
                                    <option>Engineering</option>
                                </select>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiMapPin className="text-rose-500" /> Address</p>
                                <input
                                    name='address'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiHeart className="text-pink-500" /> Referenced By</p>
                                <input
                                    name='reference'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiMessageCircle className="text-purple-500" /> Note (à¦®à¦¨à§à¦¤à¦¬à§à¦¯)</p>
                                <input
                                    name='note'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guardian Part */}
                <div className='flex flex-col lg:flex-row gap-8'>
                    <div className="lg:w-1/4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiUsers className="text-violet-500" />
                            <h2 className='font-bold text-lg text-slate-800 uppercase tracking-wider'>Guardian Info</h2>
                        </div>
                        <p className="text-sm text-slate-500">Parent or local guardian contact information.</p>
                    </div>

                    <div className='lg:w-3/4 bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Guardian Name <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='gname'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Guardian Phone <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='gphone'
                                    type="text"
                                    className="input-premium w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row gap-8 pt-6'>
                    <div className='lg:w-1/4'></div>
                    <div className='lg:w-3/4'>
                        <button
                            type='submit'
                            disabled={loading}
                            className="btn-premium w-full h-14 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner"></span>
                                    <span>Registering...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiSave size={20} />
                                    <span>Register Student</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

            </form>

            {navigate ? <Navigate to={`/students/${id}`}></Navigate> : <></>}
        </motion.div>
    )
}

export default Admission