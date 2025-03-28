import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Provider'
import { Link, Navigate, useLoaderData } from 'react-router-dom'
import { IoMdClose } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import ImageUpload from '../ImageUpload';
import { FaEdit } from "react-icons/fa";
import LoadingPage from '../OtherPages.jsx/LoadingPage';


function Courses() {
  const [firstLoading, setFirstLoading] = useState(true)
  const { month, year, date, getMonth, notifySuccess, notifyFailed } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [allCourses, setAllCourses] = useState([])
  const [displayCourses, setDisplayCourses] = useState([]);
  const [editCourse, setEditCourse] = useState({})
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')


  useEffect(() => {
    fetch('https://spoffice-server.vercel.app/getcourses')
      .then(res => res.json())
      .then(data => setAllCourses(data))
    setFirstLoading(false)

  }, [])

  useEffect(() => {
    if (allCourses.length) {
      let temp = allCourses;
      temp.sort((a, b) => a.priority - b.priority)
      setDisplayCourses(temp)
    }
  }, [allCourses])

  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
    console.log("Image URL received in parent:", url);
  };

  const [navigate, setNavigate] = useState(false)


  const handleAddCourse = e => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl ? uploadedImageUrl : '';
    const chapters = []
    const details = {
      title, chapters, priority, thumbnail
    }
    console.log(details)
    fetch('https://spoffice-server.vercel.app/addCourse', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.insertedId) {
          notifySuccess("Course added Successfully")
          const newDisplay = [...displayCourses, details]
          setAllCourses(newDisplay)
          setLoading(false)
          document.getElementById('my_modal_1').close()
          setUploadedImageUrl('')
          setNavigate(true)
        }
        else {
          notifyFailed("Failed to add course")
          setLoading(false)
        }
      })
      .catch(e => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }


  const handleEditCourse = e => {
    console.log(editCourse)
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl ? uploadedImageUrl : editCourse.thumbnail;
    const chapters = editCourse.chapters;
    const details = {
      title, priority, thumbnail, chapters,
    }
    console.log(details)
    fetch(`https://spoffice-server.vercel.app/courseupdate/${editCourse._id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.modifiedCount) {
          notifySuccess("Course Updated Successfully")
          const withoutEdited = allCourses.filter(course => course._id != editCourse._id)
          const newDisplay = [...withoutEdited, { ...details, _id: editCourse._id }]
          setAllCourses(newDisplay)
          setLoading(false)
          setEditCourse({})
          document.getElementById('my_modal_2').close()
          setUploadedImageUrl('')
          setNavigate(true)
        }
        else {
          notifyFailed("Failed to add course")
          setLoading(false)
        }
      })
      .catch(e => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }





  const handleDelete = (id) => {

    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete the Course?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(id)
        fetch(`https://spoffice-server.vercel.app/course/delete/${id}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(data => {
            if (data.deletedCount) {
              notifySuccess("Successfully Deleted Course")
              setDisplayCourses(prevCourses => prevCourses.filter(Course => Course._id !== id));

            }
          })
      } else if (result.isDismissed) {
        return
      }
    })

  }

  const openEditModal = (id) => {

    const editable = displayCourses.find(course => course._id == id)
    setEditCourse(editable)
    document.getElementById('my_modal_2').showModal()
  }

  return (
    firstLoading ? <LoadingPage></LoadingPage>
      : 
      <div>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <div className='flex justify-between items-center'>
          <p className=' font-bold text-xl text-cyan-600 underline lg:text-2xl'>All Video Courses</p>
          <button className="btn border-2 border-cyan-600 text-cyan-600 font-bold hover:border-black  hover:text-black" onClick={() => document.getElementById('my_modal_1').showModal()}>Add Course</button>
        </div>
        {/* add korar modal edit */}
        <dialog id="my_modal_1" className="modal ">
          <div className="modal-box ">
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
              </form>
            </div>
            <form className='mx-auto  w-full' onSubmit={handleAddCourse} >


              {/* students part */}
              <div className='flex  flex-col '>
                <h1 className='font-bold text-center underline mb-2 text-xl '>Course Details </h1>
                <div className='grid grid-cols-1   gap-3'>
                  <div className='lg:col-span-2 '>
                    <p className='font-semibold '>Upload Course Thumbnail :</p>
                    <ImageUpload onUpload={handleImageUpload}></ImageUpload>

                  </div>

                  <div>
                    <p className='font-semibold'>Video Course Name <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      name='title'
                      type="text"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Course Priority <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      onWheel={(e) => e.target.blur()}
                      name='priority'
                      type="number"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>

                </div>
              </div>


              <div className='flex mt-10 flex-col lg:flex-row'>
                <h1 className='font-bold text-lg lg:w-1/4'></h1>
                <div className='lg:w-2/3 text-center'>
                  <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl  h-11  btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? '' : "Add"}`} />
                  <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                </div>
              </div>

            </form>



          </div>
        </dialog>

        {/* edit korar modal  */}
        <dialog id="my_modal_2" className="modal ">
          <div className="modal-box ">
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
              </form>
            </div>
            <form className='mx-auto  w-full' onSubmit={handleEditCourse} >


              {/* students part */}
              <div className='flex  flex-col '>
                <h1 className='font-bold text-center underline mb-2 text-xl '>Course Details </h1>
                <div className='grid grid-cols-1   gap-3'>
                  <div className='lg:col-span-2 '>
                    <p className='font-semibold '>Change Course Thumbnail :</p>
                    <ImageUpload onUpload={handleImageUpload}></ImageUpload>

                  </div>

                  <div>
                    <p className='font-semibold'>Video Course Name <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      defaultValue={editCourse.title}
                      name='title'
                      type="text"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Course Priority <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      onWheel={(e) => e.target.blur()}
                      defaultValue={editCourse.priority}
                      name='priority'
                      type="number"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>

                </div>
              </div>


              <div className='flex mt-10 flex-col lg:flex-row'>
                <h1 className='font-bold text-lg lg:w-1/4'></h1>
                <div className='lg:w-2/3 text-center'>
                  <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl  h-11  btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? '' : "Update"}`} />
                  <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                </div>
              </div>

            </form>



          </div>
        </dialog>




        {/* Uporer dialog ta modal er part */}



        {/* Sob Course dekhai */}



        {
          displayCourses.map((Course, index) => <>
            <div key={index} className=' w-full  cursor-pointer  border-b  p-1 border-sky-600 '>
              <div className='flex gap-4' >
                <Link key={Course._id} className=' ' to={{ pathname: `/course/chapters`, state: { Course } }}>
                  <div className=' p-2 rounded-lg border-2 border-orange-600'>
                    <img className='rounded-lg h-12 w-20 lg:w-40 lg:h-24' src={Course.thumbnail || '/profile.jpg'} alt="" />
                  </div>
                </Link>
                <div className='w-3/4 flex gap-2 items-center'>
                  <Link className='w-3/4 ' to={`/course/chapters`} state={Course} >
                    <div>
                      <h1 className='text-lg  text-orange-600 lg:text-2xl font-bold'> {Course.title}</h1>
                    </div>
                  </Link>
                  <div className='flex gap-2 w-1/4 justify-end'>
                    <button onClick={() => openEditModal(Course._id)} className='flex items-center text-lg gap-1 text-blue-600'><FaEdit /></button>
                    <button onClick={() => handleDelete(Course._id)} className='flex items-center text-lg gap-1 text-red-600'><MdDeleteForever /></button>

                  </div>
                </div>

              </div>








            </div>
          </>)
        }

      </div>
  )
}

export default Courses