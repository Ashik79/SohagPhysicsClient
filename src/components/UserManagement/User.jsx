import React, { useContext, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PasswordChangeModal from './Modals/PasswordChangeModal'
import { AuthContext } from '../../Provider'

function User() {
    const state = useLocation().state
    const [user, setUser] = useState(state.user)
    const { role: mainRole } = useContext(AuthContext)
    const { name, email, role, lastLogin, lastRefreshed, accountCreated, photo: image, disabled } = user
    console.log(user)
    //function for formating the time

    function formatGMTtoLocal(dateString) {
        // Parse the input date string as a UTC date
        const utcDate = new Date(dateString);

        // Create a new date in GMT+6
        // 6 hours in milliseconds = 6 * 60 * 60 * 1000
        const gmtPlus6Date = new Date(utcDate.getTime() + (6 * 60 * 60 * 1000));

        // Format the date parts
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        // Use Intl.DateTimeFormat for consistent formatting
        const formatted = new Intl.DateTimeFormat('en-US', options).format(gmtPlus6Date);

        return formatted.replace(',', ''); // Optional: clean up comma if needed
    }

    return (
        mainRole == "CEO" ? <div className='mt-5'>
            <div className='flex lg:px-10 justify-between items-center flex-row md:flex-row gap-3'>
                <div>
                    <p className='font-semibold text-xl  lg:text-2xl text-black'>{name}</p>
                    <p className='font-semibold text-xs lg:text-base text-gray-500 '>{role}</p>

                </div>


                <div className='w-24 lg:w-32  mb-4 '>
                    <img className='rounded-lg' src={`${image ? image : '/profile.jpg'}`} alt="Image" />
                </div>


            </div>
            {/* Buttons for operations */}
            <div className='my-3 flex flex-col  flex-wrap gap-2 items-center'>
                <button onClick={() => { document.getElementById("pass-change-modal").showModal() }} className="btn btn-info w-2/3 btn-outline  btn-sm">Change Password</button>
                <button className="btn w-2/3  btn-info btn-outline  btn-sm">Update Info.</button>
                <button className="btn w-2/3 btn-info btn-outline  btn-sm">Disable Account</button>
                <button className="btn w-2/3 btn-info btn-outline  btn-sm">Delete Account</button>
            </div>

            {/* user er details part */}
            <div className='my-5'>
                <h2 className='text-lg lg:text-xl text-center underline text-gray-500 font-semibold'>User Details</h2>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Email
                    </span>
                    <span className='font-semibold w-1/2'>
                        {email}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Last Online
                    </span>
                    <span className='font-semibold w-1/2'>
                        {formatGMTtoLocal(lastRefreshed)}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Last Login
                    </span>
                    <span className='font-semibold w-1/2'>
                        {formatGMTtoLocal(lastLogin)}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Account Created
                    </span>
                    <span className='font-semibold w-1/2'>
                        {formatGMTtoLocal(accountCreated)}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Status
                    </span>
                    <span className='font-semibold w-1/2'>
                        {disabled ? "Disabled" : "Enabled"}
                    </span>
                </div>



            </div>
            {/*importing all modals here */}
            <PasswordChangeModal email={email}></PasswordChangeModal>
        </div> : <div>No Access</div>
    )
}

export default User