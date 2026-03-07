import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate, useLoaderData } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import { FiUser, FiInfo, FiUsers, FiPhone, FiBook, FiMapPin, FiStar, FiMessageCircle, FiHeart, FiSave, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';

function UpdateStudent() {

    const { month, year, date, notifySuccess, notifyFailed, role, loggedUser } = useContext(AuthContext)
    const [navigate, setNavigate] = useState(false)
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [loading, setLoading] = useState(false)
    const student = useLoaderData()
    const { address, batch, college, gender, gname, gphone, id, monthlyAmount, name, phone, program, reference, school, note, session, target, group } = student

    const [error, setError] = useState('')
    const handleImageUpload = (url) => {
        setUploadedImageUrl(url);
    };

    const handleAdmission = async (e) => {
        e.preventDefault();
        setLoading(true)
        let image = student?.image
        if (uploadedImageUrl) {
            image = uploadedImageUrl
        }

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
        const note = e.target.note.value;

        const formData = {
            id, monthlyAmount, batch, name, note, image, school, college, session, target, phone, address, reference, gname, gphone, gender, lastEdit: loggedUser
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/student/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                notifyFailed(errorText)
                setLoading(false)
            } else {
                const result = await response.json();
                if (result.modifiedCount) {
                    notifySuccess("Student info updated")
                    setNavigate(true)
                } else {
                    notifySuccess("No changes made")
                    setNavigate(true)
                }
                setLoading(false)
            }
        }
        catch (error) {
            setError('An error occurred while submitting the form.');
            notifyFailed("Update failed")
            setLoading(false)
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
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
                <h1 className='font-black text-2xl lg:text-3xl text-slate-800 tracking-tight'>Update Student</h1>
            </div>

            <form className='mx-auto w-full space-y-12' onSubmit={handleAdmission} onKeyPress={handleKeyPress}>

                {/* students part */}
                <div className='flex flex-col lg:flex-row gap-8'>
                    <div className="lg:w-1/4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiInfo className="text-cyan-500" />
                            <h2 className='font-bold text-lg text-slate-800 uppercase tracking-wider'>Student Info</h2>
                        </div>
                        <p className="text-sm text-slate-500">Update personal and academic details.</p>
                    </div>

                    <div className='lg:w-3/4 bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            <div className='lg:col-span-2 mb-4'>
                                <ImageUpload onUpload={handleImageUpload}></ImageUpload>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Name <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='name'
                                    type="text"
                                    defaultValue={name}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiUsers className="text-indigo-400" /> Batch <span className='text-red-500'>*</span></p>
                                <select name='batch' defaultValue={batch} className="input-premium w-full pt-3">
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
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiPhone className="text-green-500" /> Phone <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='phone'
                                    type="text"
                                    defaultValue={phone}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div className={`${role === 'CEO' ? '' : 'hidden'}`}>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiCreditCard className="text-teal-500" /> Monthly Fee <span className='text-red-500'>*</span></p>
                                <input
                                    name='monthlyAmount'
                                    type="text"
                                    defaultValue={monthlyAmount}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiBook className="text-blue-500" /> School Name <span className='text-red-500'>*</span></p>
                                <input
                                    required
                                    name='school'
                                    type="text"
                                    defaultValue={school}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiBook className="text-indigo-500" /> College Name</p>
                                <input
                                    name='college'
                                    type="text"
                                    defaultValue={college}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Gender</p>
                                <select name='gender' defaultValue={gender} className="input-premium w-full pt-3">
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'>Session <span className='text-red-500'>*</span></p>
                                <select name='session' defaultValue={session} className="input-premium w-full pt-3">
                                    {['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'].map(yr => (
                                        <option key={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiStar className="text-amber-500" /> Target</p>
                                <select name='target' defaultValue={target} className="input-premium w-full pt-3">
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
                                    defaultValue={address}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiHeart className="text-pink-500" /> Referenced By</p>
                                <input
                                    name='reference'
                                    type="text"
                                    defaultValue={reference}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2 flex items-center gap-1'><FiMessageCircle className="text-purple-500" /> Note (মন্তব্য)</p>
                                <input
                                    name='note'
                                    type="text"
                                    defaultValue={note}
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
                                <p className='font-bold text-sm text-slate-700 mb-2'>Guardian Name</p>
                                <input
                                    name='gname'
                                    type="text"
                                    defaultValue={gname}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <p className='font-bold text-sm text-slate-700 mb-2'>Guardian Phone</p>
                                <input
                                    name='gphone'
                                    type="text"
                                    defaultValue={gphone}
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
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiSave size={20} />
                                    <span>Update Student Info</span>
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

export default UpdateStudent