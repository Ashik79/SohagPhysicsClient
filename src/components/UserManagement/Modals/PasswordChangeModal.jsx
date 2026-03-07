import API_URL from '../../../apiConfig';
import React, { useContext, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { AuthContext } from '../../../Provider';
import axios from 'axios';

function PasswordChangeModal({ email }) {
    const { role, notifySuccess, notifyFailed } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [passChar, setPassChar] = useState(0);

    const handleCharChange = e => {
        setPassChar(e.target.value.length)
        //console.log(e.target.value.length)
    }
    const handlePasswordChange = async (e) => {
        setLoading(true)
        e.preventDefault()
        const newPass = e.target.newPass.value
        const newPassRepeat = e.target.newPassRepeat.value

        if (newPass !== newPassRepeat) {
            notifyFailed("Passwords must be same!")
            setLoading(false)
            return
        }

        try {
            const response = await axios.post(`${API_URL}/change-user-password`, { email, newPassword: newPass }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.data.success) {
                notifySuccess("Password Changed Successfully")
                setLoading(false)

            }
            else {
                notifyFailed("something went wrong!")
                setLoading(false)
            }
        }
        catch (err) {
            notifyFailed(err.message)
            setLoading(false)
        }


    }


    return (
        <dialog id="pass-change-modal" className="modal ">
            <div className="modal-box ">
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="text-red-600 text-lg px-1 lg:text-lg"><IoMdClose /></button>
                    </form>
                </div>
                <form className='mx-auto  w-full' onSubmit={handlePasswordChange} >


                    {/* students part */}
                    <div className='flex  flex-col '>
                        <h1 className='font-bold text-center underline mb-2 text-sm lg:text-base '>Add Result </h1>
                        <div className='grid grid-cols-1 text-sm lg:text-base   gap-3'>


                            <div>
                                <p className='font-semibold'>New Password<span className='text-red-700'>*</span> </p>
                                <input
                                    required
                                    name='newPass'
                                    type="Enter New Password"
                                    onChange={handleCharChange}
                                    className="input text-sm lg:text-base font-semibold  input-bordered input-info w-full " />
                            </div>
                            <div>
                                <p className='font-semibold'>Repeat New Password<span className='text-red-700'>*</span> </p>
                                <input
                                    required
                                    name='newPassRepeat'
                                    type="Repeat New Password"

                                    className="input text-sm lg:text-base font-semibold  input-bordered input-info w-full " />
                            </div>
                            <p className={`text-xs ${passChar < 6 ? '' : "hidden"} font-semibold text-red-400`}>Password must be at least 6 characters long</p>







                        </div>
                    </div>


                    <div className='flex mt-10 flex-col lg:flex-row'>
                        <h1 className='font-bold text-lg lg:w-1/4'></h1>
                        <div className='lg:w-2/3 text-center'>
                            <input disabled={passChar < 6} className={`text-sm lg:text-lg font-semibold   w-full bg-blue-100  border-2 rounded-xl h-11 disabled:bg-slate-300 disabled:text-slate-600 disabled:hover:bg-slate-300 disabled:cursor-not-allowed  btn-outline btn-info py-2 px-6 text-blue-950`} type='submit' value={`${loading ? "" : "Change Password"}`} />
                            <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                        </div>
                    </div>

                </form>










            </div>
        </dialog>
    )
}

export default PasswordChangeModal