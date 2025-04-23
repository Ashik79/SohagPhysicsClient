import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Provider'
import { Link, Navigate, useLoaderData, useLocation, useParams } from 'react-router-dom'
import { IoMdClose } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import ImageUpload from '../ImageUpload';
import { FaEdit } from "react-icons/fa";
import LoadingPage from '../OtherPages.jsx/LoadingPage';


function Videofiles() {
  const params = useParams()
  console.log(params.id)
  const [firstLoading, setFirstLoading] = useState(true)
  const { month, year, date, getMonth, notifySuccess, notifyFailed } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [chapter, setChapter] = useState({})
  const [allfiles, setAllfiles] = useState([])
  const [displayfiles, setDisplayfiles] = useState([]);
  const [editfiles, setEditfiles] = useState({})
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')

  useEffect(() => {


    fetch(`https://spoffice-server.vercel.app/getVideochapter/${params.id}`)

      .then(res => res.json())
      .then(data => {
        console.log(data.chapters[0])
        setChapter(data.chapters[0])
        setAllfiles(data.chapters[0].Videos)
        setFirstLoading(false)


      })

  }, [])

  useEffect(() => {
    if (allfiles.length) {
      console.log("call hoise")
      let temp = allfiles;
      temp.sort((a, b) => a.priority - b.priority)
      setDisplayfiles(temp)
    }
    else{
      setDisplayfiles(allfiles)
    }


  }, [allfiles])

  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
    console.log("Image URL received in parent:", url);
  };

  const [navigate, setNavigate] = useState(false)


  const handleAddfiles = e => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl ? uploadedImageUrl : '';
    const id = crypto.randomUUID()
    const details = {
      title, url, priority, thumbnail, id
    }
    const updatedfiles = [...displayfiles, details]
    const updatedChapter = { ...chapter, Videos: updatedfiles }


    fetch(`https://spoffice-server.vercel.app/updateVideochapter/${params.id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(updatedChapter)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.modifiedCount) {
          notifySuccess("Video added Successfully")

          setAllfiles(updatedfiles)
          setChapter(updatedChapter)
          setLoading(false)
          document.getElementById('my_modal_1').close()
          setUploadedImageUrl('')
          setNavigate(true)
        }
        else {
          notifyFailed("Failed to add files")
          setLoading(false)
        }
      })
      .catch(e => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }


  const handleEditfiles = e => {
    console.log(editfiles)
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl ? uploadedImageUrl : editfiles.thumbnail;

    const details = {
      title, priority, thumbnail, url,id:editfiles.id
    }
    const remainingfiles = displayfiles.filter(file => file != editfiles)

    const updatedfiles = [...remainingfiles, details]
    const updatedChapter = { ...chapter, Videos: updatedfiles }
   
    fetch(`https://spoffice-server.vercel.app/updateVideofile/${editfiles.id}`, {
    // fetch(`http://localhost:5000/updateVideofile/${editfiles.id}`, {
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
          notifySuccess("files Updated Successfully")

          setAllfiles(updatedfiles)
          setChapter(updatedChapter)
          setLoading(false)
          setEditfiles({})
          document.getElementById('my_modal_2').close()
          setUploadedImageUrl('')
          setNavigate(true)
        }
        else {
          notifyFailed("Failed to add files")
          setLoading(false)
        }
      })
      .catch(e => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }





  const handleDelete = (deletable) => {

    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete the files?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {

        const updatedfiles = displayfiles.filter(files => files != deletable)

        console.log('updatedfiles',updatedfiles)
        const updatedChapter = { ...chapter, Videos: updatedfiles }

        fetch(`https://spoffice-server.vercel.app/updateVideochapter/${params.id}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(updatedChapter)
        })
          .then(res => res.json())
          .then(data => {
            if (data.modifiedCount) {
              notifySuccess("Successfully Deleted files")
              setAllfiles(updatedfiles)
              setChapter(updatedChapter)

            }
          })
      } else if (result.isDismissed) {
        return
      }
    })

  }

  const openEditModal = (editable) => {


    setEditfiles(editable)
    document.getElementById('my_modal_2').showModal()
  }

  return (
    firstLoading ? <LoadingPage></LoadingPage>
      : <div>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <div className='flex justify-between items-center'>
          <p className=' font-bold text-xl text-cyan-600 underline lg:text-2xl'>All Video files</p>
          <button className="btn border-2 border-cyan-600 text-cyan-600 font-bold hover:border-black  hover:text-black" onClick={() => document.getElementById('my_modal_1').showModal()}>Add Video</button>
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
            <form className='mx-auto  w-full' onSubmit={handleAddfiles} >


              {/* students part */}
              <div className='flex  flex-col '>
                <h1 className='font-bold text-center underline mb-2 text-xl '>Video Details </h1>
                <div className='grid grid-cols-1   gap-3'>
                  <div className='lg:col-span-2 '>
                    <p className='font-semibold '>Upload Video Cover page:</p>
                    <ImageUpload onUpload={handleImageUpload}></ImageUpload>

                  </div>

                  <div>
                    <p className='font-semibold'>Video Title <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      name='title'
                      type="text"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>

                  <div>
                    <p className='font-semibold'>Youtube Url <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      name='url'
                      type="text"
                      placeholder='Share Access must be: Anyone with the link'
                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Video Priority <span className='text-red-700'>*</span> </p>
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
            <form className='mx-auto  w-full' onSubmit={handleEditfiles} >


              {/* students part */}
              <div className='flex  flex-col '>
                <h1 className='font-bold text-center underline mb-2 text-xl '>file Details </h1>
                <div className='grid grid-cols-1   gap-3'>
                  <div className='lg:col-span-2 '>
                    <p className='font-semibold '>Change file Thumbnail :</p>
                    <ImageUpload onUpload={handleImageUpload}></ImageUpload>

                  </div>

                  <div>
                    <p className='font-semibold'>Video file Name <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      defaultValue={editfiles.title}
                      name='title'
                      type="text"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Youtube Url <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      defaultValue={editfiles.url}
                      name='url'
                      type="text"
                      placeholder='Share permission: Anyone with the link'
                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Video file Priority <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      onWheel={(e) => e.target.blur()}
                      defaultValue={editfiles.priority}
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



        {/* Sob files dekhai */}



        {
          displayfiles.map((files, index) => <>
            <div key={index} className=' w-full  cursor-pointer  border-b  p-1 border-sky-600 '>
              <div className='flex gap-4' >
                <Link className=' ' to={`/videocourse/chapters/file/view`} state={{ url: files.url }}>
                  <div className=' p-2 rounded-lg border-2 border-orange-600'>
                    <img className='rounded-lg h-12 w-20 lg:w-40 lg:h-24' src={files.thumbnail || '/profile.jpg'} alt="" />
                  </div>
                </Link>
                <div className='w-3/4 flex gap-2 items-center'>
                  <Link className='w-3/4 ' to={`/videocourse/chapters/file/view`} state={{ url: files.url }}>
                    <div>
                      <h1 className='text-lg  text-orange-600 lg:text-2xl font-bold'> {files.title}</h1>
                    </div>
                  </Link>
                  <div className='flex gap-2 w-1/4 justify-end'>
                    <button onClick={() => openEditModal(files)} className='flex items-center text-lg gap-1 text-blue-600'><FaEdit /></button>
                    <button onClick={() => handleDelete(files)} className='flex items-center text-lg gap-1 text-red-600'><MdDeleteForever /></button>

                  </div>
                </div>

              </div>








            </div>
          </>)
        }

      </div>
  )
}

export default Videofiles