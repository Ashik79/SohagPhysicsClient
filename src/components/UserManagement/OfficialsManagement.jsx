import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AuthContext } from "../../Provider";
const OfficialsManagement = () => {
    const { role } = useContext(AuthContext)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Replace with your server endpoint
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/getusersmanage`);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleSelect = e => {

        setDisabled(true)
        setTimeout(() => {
            setDisabled(false)
        }, 500)
    }
    if (loading) return <p>Loading users...</p>;

    return (
        role == 'CEO' ? <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Official Users ({users.length})</h2>
            <div className=" ">
                <div className='flex text-gray-500 text-sm lg:text-base font-semibold mt-8 mb-2 w-full '>
                    <p className="w-10">SL.</p>
                    <div className='w-1/2'>
                        <p>NAME</p>
                    </div>

                    <div className='w-1/2  text-sm lg:text-base'>


                        <p className=' '>Email </p>

                    </div>
                </div>
                {
                    users.map((user, index) => <>
                        <Link key={index} to={'user'} state={{ user: user }}>
                            <div className='flex w-full hover:bg-slate-200 rounded-lg text-sm lg:text-base  items-center border-b p-1 border-sky-600 '>
                                <p className="w-10">{index + 1}.</p>
                                <div className='w-1/2' >
                                    <p className='font-semibold'>{user.name}</p>
                                    <p className='text-xs text-gray-500 font-semibold'>{user.role}</p>
                                </div>



                                <div className=' w-1/2 flex text-gray-500 font-semibold'>
                                    <p className=''>{user.email}</p>


                                </div>
                                {/* <div className="dropdown dropdown-end w-5">
                                    <div tabIndex={0} role="button" className="rounded-full p-1 bg-sky-200  font-semibold"><BsThreeDotsVertical /></div>
                                    <ul onClick={() => { handleSelect() }} tabIndex={0} className={`dropdown-content ${disabled ? 'hidden' : ''} menu bg-sky-50 text-sky-600 font-semibold rounded-box z-[1] w-52 p-2 shadow `}>
                                        <li> Profile</li>
                                        <li className=''>ddd</li>

                                    </ul>
                                </div> */}



                                {/* <a onClick={() => handleDelete(result.id)} className='flex items-center text-lg gap-1 text-red-600'><MdDeleteForever /></a> */}


                            </div>
                        </Link>
                    </>)
                }
            </div>
        </div> : <div>No access</div>
    );
};

export default OfficialsManagement;
