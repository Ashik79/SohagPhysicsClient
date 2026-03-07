import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Provider'
import { IoMdClose, IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit, FaPlus, FaFilePdf, FaEye } from "react-icons/fa";
import Swal from 'sweetalert2';
import SmartImageUpload from '../SmartImageUpload';
import LoadingPage from '../OtherPages.jsx/LoadingPage';
import { useNavigate } from 'react-router-dom';

function PdfManager() {
  const { notifySuccess, notifyFailed } = useContext(AuthContext)
  const navigate = useNavigate()
  const [firstLoading, setFirstLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [allCourses, setAllCourses] = useState([])
  const [expandedCourses, setExpandedCourses] = useState({})
  const [expandedChapters, setExpandedChapters] = useState({})
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')

  // Modal states
  const [courseModal, setCourseModal] = useState({ type: '', data: {} })
  const [chapterModal, setChapterModal] = useState({ type: '', data: {}, courseId: '' })
  const [pdfModal, setPdfModal] = useState({ type: '', data: {}, chapterId: '', courseId: '' })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = () => {
    fetch(`${import.meta.env.VITE_API_URL}/getpdfcourses`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.priority - b.priority)
        setAllCourses(sorted)
        setFirstLoading(false)
      })
  }

  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
  };

  const resetImageUpload = () => {
    setUploadedImageUrl('');
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }))
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  // ============== COURSE OPERATIONS ==============
  const handleAddCourse = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl || '';
    const id = crypto.randomUUID()
    const details = { title, chapters: [], priority, thumbnail, id }

    fetch(`${import.meta.env.VITE_API_URL}/addpdfcourse`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        if (data.insertedId) {
          notifySuccess("Course added Successfully")
          setAllCourses(prev => [...prev, { ...details, _id: data.insertedId }].sort((a, b) => a.priority - b.priority))
          closeModal()
        } else {
          notifyFailed("Failed to add course")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleEditCourse = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl || courseModal.data.thumbnail;
    const details = {
      title, priority, thumbnail,
      chapters: courseModal.data.chapters,
      id: courseModal.data.id
    }

    fetch(`${import.meta.env.VITE_API_URL}/pdfcourseupdate/${courseModal.data.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("Course Updated Successfully")
          setAllCourses(prev => prev.map(course =>
            course._id === courseModal.data._id ? { ...details, _id: courseModal.data._id } : course
          ).sort((a, b) => a.priority - b.priority))
          closeModal()
        } else {
          notifyFailed("Failed to update course")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleDeleteCourse = (course) => {
    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete this Course and all its chapters?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${import.meta.env.VITE_API_URL}/pdfcourse/delete/${course.id}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(data => {
            if (data.deletedCount) {
              notifySuccess("Successfully Deleted Course")
              setAllCourses(prev => prev.filter(c => c.id !== course.id))
            }
          })
      }
    })
  }

  // ============== CHAPTER OPERATIONS ==============
  const handleAddChapter = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl || '';
    const id = crypto.randomUUID()
    const details = { title, Pdfs: [], priority, thumbnail, id }

    const course = allCourses.find(c => c.id === chapterModal.courseId)
    const updatedChapters = [...course.chapters, details]
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`${import.meta.env.VITE_API_URL}/pdfcourseupdate/${course.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updatedCourse)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("Chapter added Successfully")
          setAllCourses(prev => prev.map(c =>
            c.id === course.id ? { ...c, chapters: updatedChapters } : c
          ))
          closeModal()
        } else {
          notifyFailed("Failed to add Chapter")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleEditChapter = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl || chapterModal.data.thumbnail;
    const details = {
      title, priority, thumbnail,
      Pdfs: chapterModal.data.Pdfs,
      id: chapterModal.data.id
    }

    const course = allCourses.find(c => c.id === chapterModal.courseId)
    const updatedChapters = course.chapters.map(ch =>
      ch.id === chapterModal.data.id ? details : ch
    ).sort((a, b) => a.priority - b.priority)
    
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`${import.meta.env.VITE_API_URL}/updatepdfchapter/${chapterModal.data.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("Chapter Updated Successfully")
          setAllCourses(prev => prev.map(c =>
            c.id === course.id ? { ...c, chapters: updatedChapters } : c
          ))
          closeModal()
        } else {
          notifyFailed("Failed to update Chapter")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleDeleteChapter = (course, chapter) => {
    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete this Chapter and all its PDFs?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedChapters = course.chapters.filter(ch => ch.id !== chapter.id)
        const updatedCourse = { ...course, chapters: updatedChapters }

        fetch(`${import.meta.env.VITE_API_URL}/pdfcourseupdate/${course.id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(updatedCourse)
        })
          .then(res => res.json())
          .then(data => {
            if (data.modifiedCount) {
              notifySuccess("Successfully Deleted Chapter")
              setAllCourses(prev => prev.map(c =>
                c.id === course.id ? { ...c, chapters: updatedChapters } : c
              ))
            }
          })
      }
    })
  }

  // ============== PDF OPERATIONS ==============
  const handleAddPdf = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl || '';
    const id = crypto.randomUUID()
    const details = { title, url, priority, thumbnail, id }

    const course = allCourses.find(c => c.id === pdfModal.courseId)
    const chapter = course.chapters.find(ch => ch.id === pdfModal.chapterId)
    const updatedPdfs = [...chapter.Pdfs, details]
    const updatedChapter = { ...chapter, Pdfs: updatedPdfs }
    const updatedChapters = course.chapters.map(ch =>
      ch.id === chapter.id ? updatedChapter : ch
    )
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`${import.meta.env.VITE_API_URL}/updatepdfchapter/${chapter.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updatedChapter)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("PDF added Successfully")
          setAllCourses(prev => prev.map(c =>
            c.id === course.id ? updatedCourse : c
          ))
          closeModal()
        } else {
          notifyFailed("Failed to add PDF")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleEditPdf = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const thumbnail = uploadedImageUrl || pdfModal.data.thumbnail;
    const details = { title, url, priority, thumbnail, id: pdfModal.data.id }

    const course = allCourses.find(c => c.id === pdfModal.courseId)
    const chapter = course.chapters.find(ch => ch.id === pdfModal.chapterId)
    const updatedPdfs = chapter.Pdfs.map(p =>
      p.id === pdfModal.data.id ? details : p
    ).sort((a, b) => a.priority - b.priority)
    const updatedChapter = { ...chapter, Pdfs: updatedPdfs }
    const updatedChapters = course.chapters.map(ch =>
      ch.id === chapter.id ? updatedChapter : ch
    )
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`${import.meta.env.VITE_API_URL}/updatepdffile/${pdfModal.data.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("PDF Updated Successfully")
          setAllCourses(prev => prev.map(c =>
            c.id === course.id ? updatedCourse : c
          ))
          closeModal()
        } else {
          notifyFailed("Failed to update PDF")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleDeletePdf = (course, chapter, pdf) => {
    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete this PDF?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedPdfs = chapter.Pdfs.filter(p => p.id !== pdf.id)
        const updatedChapter = { ...chapter, Pdfs: updatedPdfs }
        const updatedChapters = course.chapters.map(ch =>
          ch.id === chapter.id ? updatedChapter : ch
        )
        const updatedCourse = { ...course, chapters: updatedChapters }

        fetch(`${import.meta.env.VITE_API_URL}/updatepdfchapter/${chapter.id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(updatedChapter)
        })
          .then(res => res.json())
          .then(data => {
            if (data.modifiedCount) {
              notifySuccess("Successfully Deleted PDF")
              setAllCourses(prev => prev.map(c =>
                c.id === course.id ? updatedCourse : c
              ))
            }
          })
      }
    })
  }

  const closeModal = () => {
    setCourseModal({ type: '', data: {} })
    setChapterModal({ type: '', data: {}, courseId: '' })
    setPdfModal({ type: '', data: {}, chapterId: '', courseId: '' })
    setUploadedImageUrl('')
    resetImageUpload()
    setLoading(false)
    document.getElementById('modal_course')?.close()
    document.getElementById('modal_chapter')?.close()
    document.getElementById('modal_pdf')?.close()
  }

  const viewPdf = (pdf) => {
    navigate('/pdfcourse/chapters/notes/view', { state: { url: pdf.url } })
  }

  if (firstLoading) return <LoadingPage />

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-gradient-to-r from-orange-50 to-red-50 p-3 lg:p-4 rounded-lg'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
          <h1 className='font-bold text-lg sm:text-xl lg:text-2xl text-orange-700 flex items-center gap-2'>
            <FaFilePdf className='text-2xl lg:text-3xl' />
            PDF Library Manager
          </h1>
          <button
            className="btn btn-sm lg:btn-md border-2 border-orange-600 text-orange-600 font-bold hover:border-orange-700 hover:bg-orange-50 w-full sm:w-auto"
            onClick={() => {
              setCourseModal({ type: 'add', data: {} })
              document.getElementById('modal_course').showModal()
            }}
          >
            <FaPlus /> Add Course
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className='space-y-3'>
        {allCourses.map((course) => (
          <div key={course.id} className='border-2 border-orange-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'>
            {/* Course Header */}
            <div className='bg-gradient-to-r from-orange-100 to-red-100 p-2 sm:p-3'>
              <div className='flex gap-2 sm:gap-3 items-start sm:items-center'>
                <button
                  onClick={() => toggleCourse(course.id)}
                  className='text-xl sm:text-2xl text-orange-700 hover:text-orange-900 transition-colors flex-shrink-0 mt-1'
                >
                  {expandedCourses[course.id] ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                </button>
                <img
                  className='rounded-lg h-12 w-16 sm:h-16 sm:w-24 object-cover border-2 border-red-300 flex-shrink-0'
                  src={course.thumbnail || '/profile.jpg'}
                  alt={course.title}
                />
                <div className='flex-grow min-w-0'>
                  <h2 className='text-sm sm:text-lg lg:text-xl font-bold text-red-600 truncate'>{course.title}</h2>
                  <p className='text-xs sm:text-sm text-gray-600'>{course.chapters?.length || 0} Chapters</p>
                </div>
                <div className='flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0'>
                  <button
                    onClick={() => {
                      setCourseModal({ type: 'edit', data: course })
                      document.getElementById('modal_course').showModal()
                    }}
                    className='p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                  >
                    <FaEdit className='text-sm sm:text-lg' />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className='p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <MdDeleteForever className='text-base sm:text-xl' />
                  </button>
                  <button
                    onClick={() => {
                      setChapterModal({ type: 'add', data: {}, courseId: course.id })
                      document.getElementById('modal_chapter').showModal()
                    }}
                    className='btn btn-xs sm:btn-sm border-red-500 text-red-600 hover:bg-red-50 whitespace-nowrap'
                  >
                    <FaPlus className='text-xs' /> <span className='hidden sm:inline'>Chapter</span><span className='sm:hidden'>Ch</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Chapters (Collapsible) */}
            {expandedCourses[course.id] && (
              <div className='p-3 space-y-2 bg-gray-50'>
                {course.chapters?.sort((a, b) => a.priority - b.priority).map((chapter) => (
                  <div key={chapter.id} className='border border-red-200 rounded-lg overflow-hidden bg-white'>
                    {/* Chapter Header */}
                    <div className='bg-gradient-to-r from-red-50 to-orange-50 p-2'>
                      <div className='flex gap-1.5 sm:gap-2 items-start sm:items-center'>
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className='text-lg sm:text-xl text-red-600 hover:text-red-800 transition-colors flex-shrink-0 mt-0.5'
                        >
                          {expandedChapters[chapter.id] ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                        </button>
                        <img
                          className='rounded h-10 w-12 sm:h-12 sm:w-16 object-cover border border-orange-300 flex-shrink-0'
                          src={chapter.thumbnail || '/profile.jpg'}
                          alt={chapter.title}
                        />
                        <div className='flex-grow min-w-0'>
                          <h3 className='font-semibold text-sm sm:text-base text-orange-700 truncate'>{chapter.title}</h3>
                          <p className='text-xs text-gray-500'>{chapter.Pdfs?.length || 0} PDFs</p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-0.5 sm:gap-1 flex-shrink-0'>
                          <button
                            onClick={() => {
                              setChapterModal({ type: 'edit', data: chapter, courseId: course.id })
                              document.getElementById('modal_chapter').showModal()
                            }}
                            className='p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                          >
                            <FaEdit className='text-xs sm:text-sm' />
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(course, chapter)}
                            className='p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors'
                          >
                            <MdDeleteForever className='text-sm sm:text-lg' />
                          </button>
                          <button
                            onClick={() => {
                              setPdfModal({ type: 'add', data: {}, chapterId: chapter.id, courseId: course.id })
                              document.getElementById('modal_pdf').showModal()
                            }}
                            className='btn btn-xs border-orange-500 text-orange-600 hover:bg-orange-50 whitespace-nowrap text-xs px-1.5'
                          >
                            <FaPlus className='text-xs' /> <span className='hidden xs:inline'>PDF</span><span className='xs:hidden'>P</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PDFs (Collapsible) */}
                    {expandedChapters[chapter.id] && (
                      <div className='p-1.5 sm:p-2 space-y-1'>
                        {chapter.Pdfs?.sort((a, b) => a.priority - b.priority).map((pdf) => (
                          <div key={pdf.id} className='flex gap-1.5 sm:gap-2 items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded border border-gray-200'>
                            <img
                              className='rounded h-8 w-12 sm:h-10 sm:w-14 object-cover cursor-pointer border border-orange-300 flex-shrink-0'
                              src={pdf.thumbnail || '/profile.jpg'}
                              alt={pdf.title}
                              onClick={() => viewPdf(pdf)}
                            />
                            <div className='flex-grow cursor-pointer min-w-0' onClick={() => viewPdf(pdf)}>
                              <p className='font-medium text-xs sm:text-sm text-gray-800 truncate'>{pdf.title}</p>
                              <p className='text-xs text-gray-500'>ðŸ“„ PDF Document</p>
                            </div>
                            <div className='flex flex-col sm:flex-row gap-0.5 sm:gap-1 flex-shrink-0'>
                              <button
                                onClick={() => viewPdf(pdf)}
                                className='p-1 sm:p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors'
                              >
                                <FaEye className='text-base sm:text-xl' />
                              </button>
                              <button
                                onClick={() => {
                                  setPdfModal({ type: 'edit', data: pdf, chapterId: chapter.id, courseId: course.id })
                                  document.getElementById('modal_pdf').showModal()
                                }}
                                className='p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                              >
                                <FaEdit className='text-xs sm:text-sm' />
                              </button>
                              <button
                                onClick={() => handleDeletePdf(course, chapter, pdf)}
                                className='p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors'
                              >
                                <MdDeleteForever className='text-sm sm:text-lg' />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!chapter.Pdfs || chapter.Pdfs.length === 0) && (
                          <p className='text-center text-gray-400 text-xs sm:text-sm py-3 sm:py-4'>No PDFs yet. Add one!</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(!course.chapters || course.chapters.length === 0) && (
                  <p className='text-center text-gray-400 py-4'>No chapters yet. Add one!</p>
                )}
              </div>
            )}
          </div>
        ))}
        {allCourses.length === 0 && (
          <p className='text-center text-gray-400 py-8'>No courses yet. Create your first course!</p>
        )}
      </div>

      {/* ============== MODALS ============== */}

      {/* Course Modal */}
      <dialog id="modal_course" className="modal">
        <div className="modal-box max-w-lg">
          <div className="modal-action mt-0">
            <form method="dialog">
              <button className="text-red-600 text-xl sm:text-2xl" onClick={closeModal}><IoMdClose /></button>
            </form>
          </div>
          <form onSubmit={courseModal.type === 'add' ? handleAddCourse : handleEditCourse}>
            <h2 className='font-bold text-center text-lg sm:text-xl mb-3 sm:mb-4'>
              {courseModal.type === 'add' ? 'Add New Course' : 'Edit Course'}
            </h2>
            <div className='space-y-3'>
              <div>
                <p className='font-semibold'>Upload Thumbnail:</p>
                <SmartImageUpload 
                  onImageUploaded={handleImageUpload}
                  initialImage={courseModal.type === 'edit' ? courseModal.data.thumbnail : null}
                />
              </div>
              <div>
                <p className='font-semibold'>Course Name <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='title'
                  type="text"
                  defaultValue={courseModal.data.title || ''}
                  className="input input-bordered input-info w-full"
                />
              </div>
              <div>
                <p className='font-semibold'>Priority <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='priority'
                  type="number"
                  defaultValue={courseModal.data.priority || ''}
                  onWheel={(e) => e.target.blur()}
                  className="input input-bordered input-info w-full"
                />
              </div>
            </div>
            <div className='mt-6 text-center'>
              <button
                type='submit'
                disabled={loading}
                className="btn btn-info w-full"
              >
                {loading ? <span className="loading loading-dots"></span> : (courseModal.type === 'add' ? 'Add Course' : 'Update Course')}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Chapter Modal */}
      <dialog id="modal_chapter" className="modal">
        <div className="modal-box max-w-lg">
          <div className="modal-action mt-0">
            <form method="dialog">
              <button className="text-red-600 text-xl sm:text-2xl" onClick={closeModal}><IoMdClose /></button>
            </form>
          </div>
          <form onSubmit={chapterModal.type === 'add' ? handleAddChapter : handleEditChapter}>
            <h2 className='font-bold text-center text-lg sm:text-xl mb-3 sm:mb-4'>
              {chapterModal.type === 'add' ? 'Add New Chapter' : 'Edit Chapter'}
            </h2>
            <div className='space-y-3'>
              <div>
                <p className='font-semibold'>Upload Thumbnail:</p>
                <SmartImageUpload 
                  onImageUploaded={handleImageUpload}
                  initialImage={chapterModal.type === 'edit' ? chapterModal.data.thumbnail : null}
                />
              </div>
              <div>
                <p className='font-semibold'>Chapter Name <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='title'
                  type="text"
                  defaultValue={chapterModal.data.title || ''}
                  className="input input-bordered input-info w-full"
                />
              </div>
              <div>
                <p className='font-semibold'>Priority <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='priority'
                  type="number"
                  defaultValue={chapterModal.data.priority || ''}
                  onWheel={(e) => e.target.blur()}
                  className="input input-bordered input-info w-full"
                />
              </div>
            </div>
            <div className='mt-6 text-center'>
              <button
                type='submit'
                disabled={loading}
                className="btn btn-info w-full"
              >
                {loading ? <span className="loading loading-dots"></span> : (chapterModal.type === 'add' ? 'Add Chapter' : 'Update Chapter')}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* PDF Modal */}
      <dialog id="modal_pdf" className="modal">
        <div className="modal-box max-w-lg">
          <div className="modal-action mt-0">
            <form method="dialog">
              <button className="text-red-600 text-xl sm:text-2xl" onClick={closeModal}><IoMdClose /></button>
            </form>
          </div>
          <form onSubmit={pdfModal.type === 'add' ? handleAddPdf : handleEditPdf}>
            <h2 className='font-bold text-center text-lg sm:text-xl mb-3 sm:mb-4'>
              {pdfModal.type === 'add' ? 'Add New PDF' : 'Edit PDF'}
            </h2>
            <div className='space-y-3'>
              <div>
                <p className='font-semibold'>Upload Cover Image:</p>
                <SmartImageUpload 
                  onImageUploaded={handleImageUpload}
                  initialImage={pdfModal.type === 'edit' ? pdfModal.data.thumbnail : null}
                />
              </div>
              <div>
                <p className='font-semibold'>PDF Title <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='title'
                  type="text"
                  defaultValue={pdfModal.data.title || ''}
                  className="input input-bordered input-info w-full"
                />
              </div>
              <div>
                <p className='font-semibold'>Drive URL <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='url'
                  type="text"
                  defaultValue={pdfModal.data.url || ''}
                  placeholder='Share Access must be: Anyone with the link'
                  className="input input-bordered input-info w-full"
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Make sure the PDF is shared with "Anyone with the link"
                </p>
              </div>
              <div>
                <p className='font-semibold'>Priority <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='priority'
                  type="number"
                  defaultValue={pdfModal.data.priority || ''}
                  onWheel={(e) => e.target.blur()}
                  className="input input-bordered input-info w-full"
                />
              </div>
            </div>
            <div className='mt-6 text-center'>
              <button
                type='submit'
                disabled={loading}
                className="btn btn-info w-full"
              >
                {loading ? <span className="loading loading-dots"></span> : (pdfModal.type === 'add' ? 'Add PDF' : 'Update PDF')}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}

export default PdfManager
