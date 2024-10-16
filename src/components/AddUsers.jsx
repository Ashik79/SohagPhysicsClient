import React, { useContext, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate } from 'react-router-dom';

function AddUsers() {
    const { role,notifySuccess } = useContext(AuthContext);


    const [loading,setLoading] =useState(false)
  
    const handleAddUser = async(e) => {
        e.preventDefault()
        setLoading(true)
        const email = e.target.email.value;
        const name = e.target.name.value;
        const photo = e.target.photo.value;
        const role = e.target.role.value;

        const user = {
            email, name, photo, role
        }
        console.log(user)

        fetch('https://spoffice-server.vercel.app/adduser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                notifySuccess("User Added Successfully")
                setLoading(false)
            })
            e.target.reset()

    }

    // Enter dile jno submit na hoy



    return (
        role == 'CEO' ? <div>
            <h1 className='text-2xl text-center text-orange-600 mb-6'>You Must Create user with email and password in Firebase First</h1>
            <form onSubmit={handleAddUser}>
                <label className="input input-bordered border-orange-500 flex items-center gap-2">

                    <input required type="text" className="grow" name='email' placeholder="Email" />
                </label>

                <label className="input input-bordered border-orange-500 flex items-center gap-2">

                    <input type="text" className="grow" name='name' placeholder="name" />
                </label>
                <label className="input input-bordered border-orange-500 flex items-center gap-2">

                    <input type="text" className="grow" name='photo' placeholder="photo" />
                </label>
                <label className="input input-bordered border-orange-500 flex items-center gap-2">

                    <input type="text" className="grow" name='role' placeholder="role" />
                </label>
                <label className="input input-bordered border-orange-500 flex flex-col items-center gap-2">

                    <input type='submit' className='w-full h-11 cursor-pointer bg-orange-100 text-orange-700 p-2 rounded-md font-bold hover:bg-orange-200 transition duration-200' value={`${loading?'':'Set'}`} />
                    <p className={`flex items-center gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ?"":'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                </label>

            </form>

        </div> : <div className='text-red-800'>no access</div>

    )
}

export default AddUsers;