import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Provider';

const Programs = () => {
  const { notifySuccess, notifyFailed } = useContext(AuthContext)

  const [id, setId] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleIdInput = async (event) => {
    event.preventDefault();
    setLoading(true)
    const id = event.target.id.value;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/student/${id}`)
    const student = await res.json()
    if (student.id) {
      setId(id)
      setLoading(false)

    }
    else {
      setLoading(false)
      notifyFailed("No student Found !")
    }

  };

  return (
    <div>
      <form className='mx-auto w-full' onSubmit={handleIdInput} >

        {/* students part */}
        <div className='flex mt-2 flex-col lg:flex-row'>
          <h1 className='font-bold text-lg lg:w-1/4'>Program Entry :</h1>
          <div className='grid grid-cols-1 lg:w-2/3  gap-3'>


            <div>
              <p className='font-semibold'>Roll Number <span className='text-red-700'>*</span> </p>
              <input
                required
                name='id'
                type="number"
                onWheel={(e) => e.target.blur()}
                className="input input-bordered input-info w-full " />
            </div>

          </div>
        </div>
        <div className='flex mt-2 flex-col lg:flex-row'>
          <h1 className='font-bold text-lg lg:w-1/4'></h1>
          <div className='lg:w-2/3 text-center'>
            <input className="font-semibold w-full bg-blue-100  border-2 rounded-xl   btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ?"":"Next"}`} />
            <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
          </div>
        </div>

      </form>
      {id && <Navigate to={`/programentry/${id}`}></Navigate>}
    </div>
  );
};

export default Programs;
