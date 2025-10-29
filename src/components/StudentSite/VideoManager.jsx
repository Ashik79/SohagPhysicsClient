import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Provider'
import { IoMdClose, IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { MdDeleteForever, MdPlayCircleFilled } from "react-icons/md";
import { FaEdit, FaPlus } from "react-icons/fa";
import Swal from 'sweetalert2';
import SmartImageUpload from '../SmartImageUpload';
import LoadingPage from '../OtherPages.jsx/LoadingPage';

const getYouTubeVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

function VideoManager() {
  const { notifySuccess, notifyFailed } = useContext(AuthContext)
  const [firstLoading, setFirstLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [allCourses, setAllCourses] = useState([])
  const [expandedCourses, setExpandedCourses] = useState({})
  const [expandedChapters, setExpandedChapters] = useState({})
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Modal states
  const [courseModal, setCourseModal] = useState({ type: '', data: {} })
  const [chapterModal, setChapterModal] = useState({ type: '', data: {}, courseId: '' })
  const [videoModal, setVideoModal] = useState({ type: '', data: {}, chapterId: '', courseId: '' })

  // Access control states for chapter
  const [accessType, setAccessType] = useState('public')
  const [selectedBatches, setSelectedBatches] = useState([])
  const [customIds, setCustomIds] = useState([])
  const [newIdInput, setNewIdInput] = useState('')

  // All available batches from Admission page
  const allBatches = [
    { value: 'Hsc-27-Marketing', label: 'Hsc-27 (Marketing)' },
    { value: 'Sat 1', label: 'শনি ৭টা (HSC 27)' },
    { value: 'Sat 2', label: 'শনি ৮টা (HSC 27)' },
    { value: 'Sat 3', label: 'শনি ৯টা (নিউ টেন SSC 26 - HSC 28)' },
    { value: 'Sat 4', label: 'শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)' },
    { value: 'Sat 5', label: 'শনি ১১টা' },
    { value: 'Sat 6', label: 'শনি ২টা (HSC 26)' },
    { value: 'Sat 7', label: 'শনি ৩টা (HSC 26)' },
    { value: 'Sat 8', label: 'শনি ৪টা (HSC 27)' },
    { value: 'Sat 9', label: 'শনি ৫টা (HSC 26)' },
    { value: 'Sat 10', label: 'শনি ৬.১৫টা (HSC 27)' },
    { value: 'Sat 11', label: 'শনি ৭.১৫ টা (নিউ টেন SSC 26 - HSC 28)' },
    { value: 'Sun 1', label: 'রবি ৭টা (HSC 27)' },
    { value: 'Sun 2', label: 'রবি ৮টা (HSC 26)' },
    { value: 'Sun 3', label: 'রবি ৯টা (HSC 27)' },
    { value: 'Sun 4', label: 'রবি ১০টা (Nine & Ten combined)' },
    { value: 'Sun 5', label: 'রবি ১১টা' },
    { value: 'Sun 6', label: 'রবি ২টা (HSC 26)' },
    { value: 'Sun 7', label: 'রবি ৩টা (HSC 27)' },
    { value: 'Sun 8', label: 'রবি ৪টা (HSC 26)' },
    { value: 'Sun 9', label: 'রবি ৫টা (HSC 26)' },
    { value: 'Sun 10', label: 'রবি ৬টা (নিউ নাইন SSC 27 - HSC 29)' },
    { value: 'Sun 11', label: 'রবি ৭টা (নিউ টেন SSC 26 - HSC 28)' },
    { value: 'HSC 26 Admission cancel', label: 'HSC 26 Admission cancel' },
    { value: 'HSC 27 Admission cancel', label: 'HSC 27 Admission cancel' },
    { value: 'SSC 26 class 10 Admission cancel', label: 'SSC 26 class 10 Admission cancel' },
    { value: 'SSC 27 class 9 Admission cancel', label: 'SSC 27 class 9 Admission cancel' },
    { value: 'Exam Batch HSC 26', label: 'Exam Batch HSC 26' },
    { value: 'Exam Batch (নিউ নাইন SSC 27 - HSC 29)', label: 'Exam Batch (নিউ নাইন SSC 27 - HSC 29)' },
    { value: 'Exam Batch (নিউ টেন SSC 26 - HSC 28)', label: 'Exam Batch (নিউ টেন SSC 26 - HSC 28)' },
    { value: 'SSC 25 (Physics Olympiad)', label: 'SSC 25 (Physics Olympiad)' },
    { value: 'Class 9 (SSC 27) Phy Champ', label: 'Class 9 (SSC 27) Phy Champ' },
    { value: 'Class 10 (SSC 26) Phy Champ', label: 'Class 10 (SSC 26) Phy Champ' }
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = () => {
    fetch('https://spoffice-server.vercel.app/getVideocourses')
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

  // Access control helper functions
  const handleBatchToggle = (batchValue) => {
    setSelectedBatches(prev => 
      prev.includes(batchValue) 
        ? prev.filter(b => b !== batchValue)
        : [...prev, batchValue]
    )
  }

  const handleAddCustomId = () => {
    const trimmedId = newIdInput.trim()
    if (trimmedId && !customIds.includes(trimmedId)) {
      setCustomIds(prev => [...prev, trimmedId])
      setNewIdInput('')
    }
  }

  const handleRemoveCustomId = (idToRemove) => {
    setCustomIds(prev => prev.filter(id => id !== idToRemove))
  }

  const resetAccessControl = () => {
    setAccessType('public')
    setSelectedBatches([])
    setCustomIds([])
    setNewIdInput('')
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

    fetch('https://spoffice-server.vercel.app/addVideocourse', {
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

    fetch(`https://spoffice-server.vercel.app/Videocourseupdate/${courseModal.data.id}`, {
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
        fetch(`https://spoffice-server.vercel.app/Videocourse/delete/${course.id}`, {
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
    
    // Build access object
    const access = accessType === 'public' 
      ? { type: 'public' }
      : { 
          type: 'private',
          batches: selectedBatches,
          ids: customIds
        }
    
    const details = { title, Videos: [], priority, thumbnail, id, access }

    const course = allCourses.find(c => c.id === chapterModal.courseId)
    const updatedChapters = [...course.chapters, details]
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`https://spoffice-server.vercel.app/Videocourseupdate/${course.id}`, {
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
    
    // Build access object
    const access = accessType === 'public' 
      ? { type: 'public' }
      : { 
          type: 'private',
          batches: selectedBatches,
          ids: customIds
        }
    
    const details = {
      title, priority, thumbnail,
      Videos: chapterModal.data.Videos,
      id: chapterModal.data.id,
      access
    }

    const course = allCourses.find(c => c.id === chapterModal.courseId)
    const updatedChapters = course.chapters.map(ch =>
      ch.id === chapterModal.data.id ? details : ch
    ).sort((a, b) => a.priority - b.priority)
    
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`https://spoffice-server.vercel.app/updateVideochapter/${chapterModal.data.id}`, {
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
      text: 'Do you want to delete this Chapter and all its videos?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedChapters = course.chapters.filter(ch => ch.id !== chapter.id)
        const updatedCourse = { ...course, chapters: updatedChapters }

        fetch(`https://spoffice-server.vercel.app/Videocourseupdate/${course.id}`, {
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

  // ============== VIDEO OPERATIONS ==============
  const handleAddVideo = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const type = e.target.type.value
    const thumbnail = uploadedImageUrl || '';
    const id = crypto.randomUUID()
    const details = { title, url, priority, thumbnail, id, type }

    const course = allCourses.find(c => c.id === videoModal.courseId)
    const chapter = course.chapters.find(ch => ch.id === videoModal.chapterId)
    const updatedVideos = [...chapter.Videos, details]
    const updatedChapter = { ...chapter, Videos: updatedVideos }
    const updatedChapters = course.chapters.map(ch =>
      ch.id === chapter.id ? updatedChapter : ch
    )
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`https://spoffice-server.vercel.app/updateVideochapter/${chapter.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updatedChapter)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("Video added Successfully")
          setAllCourses(prev => prev.map(c =>
            c.id === course.id ? updatedCourse : c
          ))
          closeModal()
        } else {
          notifyFailed("Failed to add Video")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleEditVideo = (e) => {
    setLoading(true)
    e.preventDefault()
    const title = e.target.title.value
    const url = e.target.url.value
    const priority = e.target.priority.value
    const type = e.target.type.value
    const thumbnail = uploadedImageUrl || videoModal.data.thumbnail;
    const details = { title, url, priority, thumbnail, id: videoModal.data.id, type }

    const course = allCourses.find(c => c.id === videoModal.courseId)
    const chapter = course.chapters.find(ch => ch.id === videoModal.chapterId)
    const updatedVideos = chapter.Videos.map(v =>
      v.id === videoModal.data.id ? details : v
    ).sort((a, b) => a.priority - b.priority)
    const updatedChapter = { ...chapter, Videos: updatedVideos }
    const updatedChapters = course.chapters.map(ch =>
      ch.id === chapter.id ? updatedChapter : ch
    )
    const updatedCourse = { ...course, chapters: updatedChapters }

    fetch(`https://spoffice-server.vercel.app/updateVideofile/${videoModal.data.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(details)
    })
      .then(res => res.json())
      .then(data => {
        if (data.modifiedCount) {
          notifySuccess("Video Updated Successfully")
          setAllCourses(prev => prev.map(c =>
            c.id === course.id ? updatedCourse : c
          ))
          closeModal()
        } else {
          notifyFailed("Failed to update Video")
        }
        setLoading(false)
      })
      .catch(() => {
        notifyFailed("Failed to post request")
        setLoading(false)
      })
    e.target.reset()
  }

  const handleDeleteVideo = (course, chapter, video) => {
    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete this Video?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedVideos = chapter.Videos.filter(v => v.id !== video.id)
        const updatedChapter = { ...chapter, Videos: updatedVideos }
        const updatedChapters = course.chapters.map(ch =>
          ch.id === chapter.id ? updatedChapter : ch
        )
        const updatedCourse = { ...course, chapters: updatedChapters }

        fetch(`https://spoffice-server.vercel.app/updateVideochapter/${chapter.id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(updatedChapter)
        })
          .then(res => res.json())
          .then(data => {
            if (data.modifiedCount) {
              notifySuccess("Successfully Deleted Video")
              setAllCourses(prev => prev.map(c =>
                c.id === course.id ? updatedCourse : c
              ))
            }
          })
      }
    })
  }

  const closeModal = () => {
    // Stop video playback by removing the selected video
    setSelectedVideo(null)
    
    setCourseModal({ type: '', data: {} })
    setChapterModal({ type: '', data: {}, courseId: '' })
    setVideoModal({ type: '', data: {}, chapterId: '', courseId: '' })
    setUploadedImageUrl('')
    resetImageUpload()
    resetAccessControl()
    setLoading(false)
    document.getElementById('modal_course')?.close()
    document.getElementById('modal_chapter')?.close()
    document.getElementById('modal_video')?.close()
    document.getElementById('modal_player')?.close()
  }

  const playVideo = (video) => {
    setSelectedVideo(video)
    document.getElementById('modal_player').showModal()
  }

  if (firstLoading) return <LoadingPage />

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='bg-gradient-to-r from-cyan-50 to-blue-50 p-3 lg:p-4 rounded-lg'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
          <h1 className='font-bold text-lg sm:text-xl lg:text-2xl text-cyan-700 flex items-center gap-2'>
            <MdPlayCircleFilled className='text-2xl lg:text-3xl' />
            Video Library Manager
          </h1>
          <button
            className="btn btn-sm lg:btn-md border-2 border-cyan-600 text-cyan-600 font-bold hover:border-cyan-700 hover:bg-cyan-50 w-full sm:w-auto"
            onClick={() => {
              setCourseModal({ type: 'add', data: {} })
              document.getElementById('modal_course').showModal()
            }}
          >
            <FaPlus /> Add Class/Course
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className='space-y-3'>
        {allCourses.map((course) => (
          <div key={course.id} className='border-2 border-cyan-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'>
            {/* Course Header */}
            <div className='bg-gradient-to-r from-cyan-100 to-blue-100 p-2 sm:p-3'>
              <div className='flex gap-2 sm:gap-3 items-start sm:items-center'>
                <button
                  onClick={() => toggleCourse(course.id)}
                  className='text-xl sm:text-2xl text-cyan-700 hover:text-cyan-900 transition-colors flex-shrink-0 mt-1'
                >
                  {expandedCourses[course.id] ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                </button>
                <img
                  className='rounded-lg h-12 w-16 sm:h-16 sm:w-24 object-cover border-2 border-orange-300 flex-shrink-0'
                  src={course.thumbnail || '/profile.jpg'}
                  alt={course.title}
                />
                <div className='flex-grow min-w-0'>
                  <h2 className='text-sm sm:text-lg lg:text-xl font-bold text-orange-600 truncate'>{course.title}</h2>
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
                    className='btn btn-xs sm:btn-sm border-orange-500 text-orange-600 hover:bg-orange-50 whitespace-nowrap'
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
                  <div key={chapter.id} className='border border-orange-200 rounded-lg overflow-hidden bg-white'>
                    {/* Chapter Header */}
                    <div className='bg-gradient-to-r from-orange-50 to-yellow-50 p-2'>
                      <div className='flex gap-1.5 sm:gap-2 items-start sm:items-center'>
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className='text-lg sm:text-xl text-orange-600 hover:text-orange-800 transition-colors flex-shrink-0 mt-0.5'
                        >
                          {expandedChapters[chapter.id] ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                        </button>
                        <img
                          className='rounded h-10 w-12 sm:h-12 sm:w-16 object-cover border border-cyan-300 flex-shrink-0'
                          src={chapter.thumbnail || '/profile.jpg'}
                          alt={chapter.title}
                        />
                        <div className='flex-grow min-w-0'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-semibold text-sm sm:text-base text-cyan-700 truncate'>{chapter.title}</h3>
                            {chapter.access?.type === 'private' && (
                              <span className='px-1.5 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded whitespace-nowrap'>
                                🔒 PRIVATE
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-gray-500'>
                            {chapter.Videos?.length || 0} Videos
                            {chapter.access?.type === 'private' && (
                              <span className='ml-2 text-orange-600'>
                                • {(chapter.access.batches?.length || 0) + (chapter.access.ids?.length || 0)} access rules
                              </span>
                            )}
                          </p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-0.5 sm:gap-1 flex-shrink-0'>
                          <button
                            onClick={() => {
                              const chapterData = chapter
                              setChapterModal({ type: 'edit', data: chapterData, courseId: course.id })
                              
                              // Load existing access control data
                              if (chapterData.access) {
                                setAccessType(chapterData.access.type || 'public')
                                setSelectedBatches(chapterData.access.batches || [])
                                setCustomIds(chapterData.access.ids || [])
                              } else {
                                setAccessType('public')
                                setSelectedBatches([])
                                setCustomIds([])
                              }
                              
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
                              setVideoModal({ type: 'add', data: {}, chapterId: chapter.id, courseId: course.id })
                              document.getElementById('modal_video').showModal()
                            }}
                            className='btn btn-xs border-cyan-500 text-cyan-600 hover:bg-cyan-50 whitespace-nowrap text-xs px-1.5'
                          >
                            <FaPlus className='text-xs' /> <span className='hidden xs:inline'>Video</span><span className='xs:hidden'>V</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Videos (Collapsible) */}
                    {expandedChapters[chapter.id] && (
                      <div className='p-1.5 sm:p-2 space-y-1'>
                        {chapter.Videos?.sort((a, b) => a.priority - b.priority).map((video) => (
                          <div key={video.id} className='flex gap-1.5 sm:gap-2 items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded border border-gray-200'>
                            <img
                              className='rounded h-8 w-12 sm:h-10 sm:w-14 object-cover cursor-pointer border border-blue-300 flex-shrink-0'
                              src={video.thumbnail || '/profile.jpg'}
                              alt={video.title}
                              onClick={() => playVideo(video)}
                            />
                            <div className='flex-grow cursor-pointer min-w-0' onClick={() => playVideo(video)}>
                              <p className='font-medium text-xs sm:text-sm text-gray-800 truncate'>{video.title}</p>
                              <p className='text-xs text-gray-500'>
                                {video.type === 'reel' ? '🎬 Reel' : '🎥 Video'}
                              </p>
                            </div>
                            <div className='flex flex-col sm:flex-row gap-0.5 sm:gap-1 flex-shrink-0'>
                              <button
                                onClick={() => playVideo(video)}
                                className='p-1 sm:p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors'
                              >
                                <MdPlayCircleFilled className='text-base sm:text-xl' />
                              </button>
                              <button
                                onClick={() => {
                                  setVideoModal({ type: 'edit', data: video, chapterId: chapter.id, courseId: course.id })
                                  document.getElementById('modal_video').showModal()
                                }}
                                className='p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                              >
                                <FaEdit className='text-xs sm:text-sm' />
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(course, chapter, video)}
                                className='p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors'
                              >
                                <MdDeleteForever className='text-sm sm:text-lg' />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!chapter.Videos || chapter.Videos.length === 0) && (
                          <p className='text-center text-gray-400 text-xs sm:text-sm py-3 sm:py-4'>No videos yet. Add one!</p>
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
                <p className='font-semibold'>Class or Course Name <span className='text-red-700'>*</span></p>
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
                {loading ? <span className="loading loading-dots"></span> : (courseModal.type === 'add' ? 'Add Class/Course' : 'Update Course')}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Chapter Modal */}
      <dialog id="modal_chapter" className="modal">
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
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

              {/* Access Control */}
              <div className='border-t pt-3 mt-3'>
                <p className='font-semibold mb-2'>Chapter Visibility <span className='text-red-700'>*</span></p>
                <div className='flex gap-4'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='access'
                      value='public'
                      checked={accessType === 'public'}
                      onChange={(e) => setAccessType(e.target.value)}
                      className='radio radio-primary radio-sm'
                    />
                    <span className='text-sm font-medium'>Public</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='access'
                      value='private'
                      checked={accessType === 'private'}
                      onChange={(e) => setAccessType(e.target.value)}
                      className='radio radio-primary radio-sm'
                    />
                    <span className='text-sm font-medium'>Private</span>
                  </label>
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                  Public: Available to everyone | Private: Only specific batches/students
                </p>
              </div>

              {/* Private Access Controls */}
              {accessType === 'private' && (
                <div className='space-y-3 border border-orange-200 p-3 rounded-lg bg-orange-50'>
                  {/* Batch Selection */}
                  <div>
                    <p className='font-semibold text-sm mb-2'>Select Batches:</p>
                    <div className='max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white'>
                      <div className='grid grid-cols-1 gap-1'>
                        {allBatches.map((batch, index) => (
                          <label key={index} className='flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={selectedBatches.includes(batch.value)}
                              onChange={() => handleBatchToggle(batch.value)}
                              className='checkbox checkbox-xs checkbox-primary'
                            />
                            <span className='text-xs'>{batch.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      Selected: {selectedBatches.length} batch(es)
                    </p>
                  </div>

                  {/* Custom IDs */}
                  <div>
                    <p className='font-semibold text-sm mb-2'>Add Specific Student IDs:</p>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={newIdInput}
                        onChange={(e) => setNewIdInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddCustomId()
                          }
                        }}
                        placeholder='Enter student ID'
                        className='input input-bordered input-sm flex-1 text-sm'
                      />
                      <button
                        type='button'
                        onClick={handleAddCustomId}
                        className='btn btn-sm btn-primary'
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {customIds.length > 0 && (
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {customIds.map((id, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
                          >
                            <span>{id}</span>
                            <button
                              type='button'
                              onClick={() => handleRemoveCustomId(id)}
                              className='text-red-600 hover:text-red-800'
                            >
                              <IoMdClose />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className='text-xs text-gray-500 mt-1'>
                      {customIds.length} custom ID(s) added
                    </p>
                  </div>
                </div>
              )}
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

      {/* Video Modal */}
      <dialog id="modal_video" className="modal">
        <div className="modal-box max-w-lg">
          <div className="modal-action mt-0">
            <form method="dialog">
              <button className="text-red-600 text-xl sm:text-2xl" onClick={closeModal}><IoMdClose /></button>
            </form>
          </div>
          <form onSubmit={videoModal.type === 'add' ? handleAddVideo : handleEditVideo}>
            <h2 className='font-bold text-center text-lg sm:text-xl mb-3 sm:mb-4'>
              {videoModal.type === 'add' ? 'Add New Video' : 'Edit Video'}
            </h2>
            <div className='space-y-3'>
              <div>
                <p className='font-semibold'>Upload Cover Image:</p>
                <SmartImageUpload 
                  onImageUploaded={handleImageUpload}
                  initialImage={videoModal.type === 'edit' ? videoModal.data.thumbnail : null}
                />
              </div>
              <div>
                <p className='font-semibold'>Video Title <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='title'
                  type="text"
                  defaultValue={videoModal.data.title || ''}
                  className="input input-bordered input-info w-full"
                />
              </div>
              <div>
                <p className='font-semibold'>YouTube URL <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='url'
                  type="text"
                  defaultValue={videoModal.data.url || ''}
                  placeholder='https://www.youtube.com/watch?v=...'
                  className="input input-bordered input-info w-full"
                />
              </div>
              <div>
                <p className='font-semibold'>Video Type <span className='text-red-700'>*</span></p>
                <select
                  required
                  name='type'
                  key={videoModal.data.id || 'new'}
                  defaultValue={videoModal.type === 'edit' ? (videoModal.data.type || 'video') : 'video'}
                  className="select select-bordered select-info w-full"
                >
                  <option value="video">🎥 Regular Video</option>
                  <option value="reel">🎬 Short Reel</option>
                </select>
                <p className='text-xs text-gray-500 mt-1'>
                  Use 'Reel' for YouTube Shorts or quick videos (&lt;60s)
                </p>
              </div>
              <div>
                <p className='font-semibold'>Priority <span className='text-red-700'>*</span></p>
                <input
                  required
                  name='priority'
                  type="number"
                  defaultValue={videoModal.data.priority || ''}
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
                {loading ? <span className="loading loading-dots"></span> : (videoModal.type === 'add' ? 'Add Video' : 'Update Video')}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Video Player Modal */}
      <dialog id="modal_player" className="modal">
        <div className="modal-box max-w-4xl w-11/12">
          <div className="modal-action mt-0">
            <form method="dialog">
              <button 
                className="text-red-600 text-xl sm:text-2xl" 
                onClick={() => {
                  setSelectedVideo(null)
                  document.getElementById('modal_player')?.close()
                }}
              >
                <IoMdClose />
              </button>
            </form>
          </div>
          {selectedVideo && (
            <div>
              <h2 className='font-bold text-base sm:text-xl mb-3 sm:mb-4 text-center pr-8'>{selectedVideo.title}</h2>
              <div className="w-full h-48 sm:h-60 md:h-96 lg:h-[500px]">
                {getYouTubeVideoId(selectedVideo.url) ? (
                  <iframe
                    key={selectedVideo.id}
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.url)}?rel=0&modestbranding=1&autohide=1&playsinline=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Video Player"
                  />
                ) : (
                  <p className="text-red-500 text-center">Invalid YouTube URL</p>
                )}
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => {
            setSelectedVideo(null)
            document.getElementById('modal_player')?.close()
          }}>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default VideoManager
