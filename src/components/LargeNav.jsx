import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../Provider'

function LargeNav() {
    const { role ,loggedUser} = useContext(AuthContext)
    return (
        <div className='w-full hidden lg:block'>
            <ul className="w-full flex flex-col pl-4 gap-3 font-semibold mt-10">
                {
                    loggedUser != 'Sohag Prodhan' &&

                <NavLink to={'/overview'}><li className='pl-2 hover:bg-gray-200 '>Payment Overview</li></NavLink>
                }
                {role === 'CEO' && <NavLink to={'/studentoverview'}><li className='pl-2 hover:bg-gray-200 '>Student Overview</li></NavLink>}
                <NavLink to={'/finder'}><li className='pl-2 hover:bg-gray-200 '>Finder</li></NavLink>
                {role === 'CEO' && <NavLink to={'/staffs'}><li className='pl-2 hover:bg-gray-200'>Staffs</li></NavLink>}
                <NavLink to={'/entry'}><li className='pl-2 hover:bg-gray-200 '>Staff Entry</li></NavLink>
                <NavLink to={'/monitor'}><li className='pl-2 hover:bg-gray-200 '>Live Monitor</li></NavLink>
                <NavLink to={'/attendance'}><li className='pl-2 hover:bg-gray-200'>Attendance</li></NavLink>
                <NavLink to={'/exams'}><li className='pl-2 hover:bg-gray-200'>Exams</li></NavLink>
                <NavLink to={'/note'}><li className='pl-2 hover:bg-gray-200'>Notes</li></NavLink>
                {role === 'CEO' && <NavLink to={'/coupons'}><li className='pl-2 hover:bg-gray-200'>Coupons</li></NavLink>}
                {(role == 'CEO' || role == 'Manager') && <NavLink to={'/batch'}><li className='pl-2 hover:bg-gray-200'>Batch Students</li></NavLink>}
                {
                    (role == 'CEO' || role == 'Manager') ? <NavLink to={'/download'}><li className='pl-2 hover:bg-gray-200'>Download Center</li></NavLink> : ''
                }
              
                {
                    (role == 'CEO' || role == 'Manager') ? <NavLink to={'/message'}><li className='pl-2 hover:bg-gray-200'>Message</li></NavLink> : ''
                }
                {
                    (role == 'CEO' || loggedUser == 'Sree Krishno') ? <NavLink to={'/payment'}><li className='pl-2 hover:bg-gray-200'>Payment Entry</li></NavLink> : ''
                }
                
               
                {
                    ((role == 'CEO') || (loggedUser =="Badhon")) ? <NavLink to={'/editor'}><li className='pl-2 hover:bg-gray-200'>Student Website</li></NavLink> : ''
                }


                <NavLink to={'/register'}><li className='pl-2 hover:bg-gray-200'>Register</li></NavLink>
                {role == 'CEO' && <NavLink to={'/programentry'}><li className='pl-2 hover:bg-gray-200'>Program Entry</li></NavLink>}
                {
                    role == 'CEO' ? <NavLink to={'/adduser'}><li className='pl-2 hover:bg-gray-200'>Add Role</li></NavLink> : ''
                }
                {
                    role == 'CEO' ? <NavLink to={'/user-management'}><li className='pl-2 hover:bg-gray-200'>User Management</li></NavLink> : ''
                }

            </ul>
        </div>
    )
}

export default LargeNav