import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Provider'
import { Link, Navigate, useLoaderData, useLocation, useParams } from 'react-router-dom'
import { IoMdClose } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import ImageUpload from '../ImageUpload';
import { FaEdit } from "react-icons/fa";
import LoadingPage from '../OtherPages.jsx/LoadingPage';


function PdfNotes() {
  const params = useParams()
  console.log(params.id)
  const [firstLoading, setFirstLoading] = useState(true)
  const { month, year, date, getMonth, notifySuccess, notifyFailed } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [chapter, setChapter] = useState({})
  const [allNotes, setAllNotes] = useState([])
  const [displayNotes, setDisplayNotes] = useState([]);
  const [editNotes, setEditNotes] = useState({})
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')

  useEffect(() => {


    fetch(`https://spoffice-server.vercel.app/getpdfchapter/${params.id}`)

      .then(res => res.json())
      .then(data => {
        console.log(data.chapters[0])
        setChapter(data.chapters[0])
        setAllNotes(data.chapters[0].Pdfs)
        setFirstLoading(false)


      })

  }, [])

  useEffect(() => {
    if (allNotes.length) {
      console.log("call hoise")
      let temp = allNotes;
      temp.sort((a, b) => a.priority - b.priority)
      setDisplayNotes(temp)
    }
    else{
      setDisplayNotes(allNotes)
    }


  }, [allNotes])

  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
    console.log("Image URL received in parent:", url);
  };

  const [navigate, setNavigate] = useState(false)


  const handleAddNotes = e => {
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
    const updatedNotes = [...displayNotes, details]
    const updatedChapter = { ...chapter, Pdfs: updatedNotes }


    fetch(`https://spoffice-server.vercel.app/updatepdfchapter/${params.id}`, {
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
          notifySuccess("Pdf added Successfully")

          setAllNotes(updatedNotes)
          setChapter(updatedChapter)
          setLoading(false)
          document.getElementById('my_modal_1').close()
          setUploadedImageUrl('')
          setNavigate(true)
        }
        else {
          notifyFailed("Failed to add Notes")
          setLoading(false)
        }
      })
      .catch(e => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }


  const handleEditNotes = e => {
    console.log(editNotes)
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl ? uploadedImageUrl : editNotes.thumbnail;

    const details = {
      title, priority, thumbnail, url,id:editNotes.id
    }
    const remainingNotes = displayNotes.filter(note => note != editNotes)

    const updatedNotes = [...remainingNotes, details]
    const updatedChapter = { ...chapter, Pdfs: updatedNotes }
   
    // fetch(`https://spoffice-server.vercel.app/updatepdffile/${editNotes}`, {
    fetch(`http://localhost:5000/updatepdffile/${editNotes.id}`, {
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
          notifySuccess("Notes Updated Successfully")

          setAllNotes(updatedNotes)
          setChapter(updatedChapter)
          setLoading(false)
          setEditNotes({})
          document.getElementById('my_modal_2').close()
          setUploadedImageUrl('')
          setNavigate(true)
        }
        else {
          notifyFailed("Failed to add Notes")
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
      text: 'Do you want to delete the Notes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {

        const updatedNotes = displayNotes.filter(Notes => Notes != deletable)

        console.log('updatednotes',updatedNotes)
        const updatedChapter = { ...chapter, Pdfs: updatedNotes }

        fetch(`https://spoffice-server.vercel.app/updatepdfchapter/${params.id}`, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(updatedChapter)
        })
          .then(res => res.json())
          .then(data => {
            if (data.modifiedCount) {
              notifySuccess("Successfully Deleted Notes")
              setAllNotes(updatedNotes)
              setChapter(updatedChapter)

            }
          })
      } else if (result.isDismissed) {
        return
      }
    })

  }

  const openEditModal = (editable) => {


    setEditNotes(editable)
    document.getElementById('my_modal_2').showModal()
  }

  return (
    firstLoading ? <LoadingPage></LoadingPage>
      : <div>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <div className='flex justify-between items-center'>
          <p className=' font-bold text-xl text-cyan-600 underline lg:text-2xl'>All Pdf Notes</p>
          <button className="btn border-2 border-cyan-600 text-cyan-600 font-bold hover:border-black  hover:text-black" onClick={() => document.getElementById('my_modal_1').showModal()}>Add PDF</button>
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
            <form className='mx-auto  w-full' onSubmit={handleAddNotes} >


              {/* students part */}
              <div className='flex  flex-col '>
                <h1 className='font-bold text-center underline mb-2 text-xl '>PDF Details </h1>
                <div className='grid grid-cols-1   gap-3'>
                  <div className='lg:col-span-2 '>
                    <p className='font-semibold '>Upload Pdf Cover page:</p>
                    <ImageUpload onUpload={handleImageUpload}></ImageUpload>

                  </div>

                  <div>
                    <p className='font-semibold'>Pdf Name <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      name='title'
                      type="text"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>

                  <div>
                    <p className='font-semibold'>Drive Url <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      name='url'
                      type="text"
                      placeholder='Share Access must be: Anyone with the link'
                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>PDF Priority <span className='text-red-700'>*</span> </p>
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
            <form className='mx-auto  w-full' onSubmit={handleEditNotes} >


              {/* students part */}
              <div className='flex  flex-col '>
                <h1 className='font-bold text-center underline mb-2 text-xl '>Notes Details </h1>
                <div className='grid grid-cols-1   gap-3'>
                  <div className='lg:col-span-2 '>
                    <p className='font-semibold '>Change Notes Thumbnail :</p>
                    <ImageUpload onUpload={handleImageUpload}></ImageUpload>

                  </div>

                  <div>
                    <p className='font-semibold'>Pdf Notes Name <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      defaultValue={editNotes.title}
                      name='title'
                      type="text"

                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Drive Url <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      defaultValue={editNotes.url}
                      name='url'
                      type="text"
                      placeholder='Share permission: Anyone with the link'
                      className="input text-lg font-semibold  input-bordered input-info w-full " />
                  </div>
                  <div>
                    <p className='font-semibold'>Notes Priority <span className='text-red-700'>*</span> </p>
                    <input
                      required
                      onWheel={(e) => e.target.blur()}
                      defaultValue={editNotes.priority}
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



        {/* Sob Notes dekhai */}



        {
          displayNotes.map((Notes, index) => <>
            <div key={index} className=' w-full  cursor-pointer  border-b  p-1 border-sky-600 '>
              <div className='flex gap-4' >
                <Link className=' ' to={`/pdfcourse/chapters/notes/view`} state={{ url: Notes.url }}>
                  <div className=' p-2 rounded-lg border-2 border-orange-600'>
                    <img className='rounded-lg h-12 w-20 lg:w-40 lg:h-24' src={Notes.thumbnail || '/profile.jpg'} alt="" />
                  </div>
                </Link>
                <div className='w-3/4 flex gap-2 items-center'>
                  <Link className='w-3/4 ' to={`/pdfcourse/chapters/notes/view`} state={{ url: Notes.url }}>
                    <div>
                      <h1 className='text-lg  text-orange-600 lg:text-2xl font-bold'> {Notes.title}</h1>
                    </div>
                  </Link>
                  <div className='flex gap-2 w-1/4 justify-end'>
                    <button onClick={() => openEditModal(Notes)} className='flex items-center text-lg gap-1 text-blue-600'><FaEdit /></button>
                    <button onClick={() => handleDelete(Notes)} className='flex items-center text-lg gap-1 text-red-600'><MdDeleteForever /></button>

                  </div>
                </div>

              </div>








            </div>
          </>)
        }

      </div>
  )
}

export default PdfNotes