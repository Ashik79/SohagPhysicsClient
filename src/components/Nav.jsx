import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../Provider';
import { MdLogout } from "react-icons/md";

function Nav() {
    const { loggedUser, role, logout, loggedPhoto } = useContext(AuthContext);
    const [photo, setPhoto] = useState(null);  // Initially set to null

    // Ensure the photo is updated based on loggedPhoto or localStorage
    useEffect(() => {
        if (loggedPhoto) {
            setPhoto(loggedPhoto);
            localStorage.setItem("loggedPhoto", loggedPhoto);  // Save the photo in localStorage on login
        } else {
            const storedPhoto = localStorage.getItem("loggedPhoto");
            if (storedPhoto) {
                setPhoto(storedPhoto);
            }
        }
    }, [loggedPhoto]);
console.log(photo)
    const [disabled, setDisabled] = useState(false);

    const handleSelect = e => {
        setDisabled(true);
        setTimeout(() => {
            setDisabled(false);
        }, 500);
    };
    

    return (
        <div>
            <div className="navbar bg-slate-100">
                <div className="navbar-start">
                    <div className="dropdown text-lg font-semibold">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul onClick={() => handleSelect()}
                            tabIndex={0}
                            className={`menu menu-lg gap-2 text-lg bg-gray-100 dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow ${disabled ? 'hidden' : ''}`}>
                           <NavLink to={'/overview'}><li className='pl-2 hover:bg-gray-200 '>Overview</li></NavLink>
                            <NavLink to={'/finder'}><li className='pl-2 hover:bg-gray-200 '>Finder</li></NavLink>
                            <NavLink to={'/attendance'}><li className='pl-2 hover:bg-gray-200'>Attendance</li></NavLink>
                            <NavLink to={'/exams'}><li className='pl-2 hover:bg-gray-200'>Exams</li></NavLink>
                            {role === 'CEO' && <NavLink to={'/download'}><li className='pl-2 hover:bg-gray-200'>Download</li></NavLink>}
                            {role === 'CEO' && <NavLink to={'/message'}><li className='pl-2 hover:bg-gray-200'>Message</li></NavLink>}
                            <NavLink to={'/payment'}><li className='pl-2 hover:bg-gray-200'>Payment Entry</li></NavLink>
                            <NavLink to={'/register'}><li className='pl-2 hover:bg-gray-200'>Register</li></NavLink>
                            <NavLink to={'/programentry'}><li className='pl-2 hover:bg-gray-200'>Program Entry</li></NavLink>
                            {role === 'CEO' && <NavLink to={'/adduser'}><li className='pl-2 hover:bg-gray-200'>Add Role</li></NavLink>}
                        </ul>
                    </div>
                    <Link to={'/'}><img className='w-24 rounded-full lg:w-36' src={`/logo.png`} alt="Logo" /></Link>
                   
                </div>
                <div className='navbar-end flex gap-4 justify-end items-center'>
                    <div className=' justify-end gap-1 lg:gap-3 flex items-center'>
                        {/* Fallback to a default image if photo is not available */}
                        <img className='w-12 h-12 rounded-full border-2 border-sky-600 ' src={`${photo?photo:'profile.jpg'} `} alt="Profile" />
                        <div className='flex flex-col items-end'>
                            <h1 className='font-semibold lg:text-xl text-right '>{loggedUser}</h1>
                            <p className='text-sm text-gray-600'>{role}</p>
                    
                        </div>
                    </div>
                    <div>
                        <button className='text-lg' onClick={() => logout()}><MdLogout /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Nav;
