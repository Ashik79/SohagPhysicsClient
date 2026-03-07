import React, { useEffect, useState } from 'react'
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { MdPlayCircleFilled } from "react-icons/md";
import { FaVideo, FaFilm } from "react-icons/fa";
import LoadingPage from '../OtherPages.jsx/LoadingPage';

const getYouTubeVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

function VideoLibrary() {
  const [firstLoading, setFirstLoading] = useState(true)
  const [allCourses, setAllCourses] = useState([])
  const [expandedCourses, setExpandedCourses] = useState({})
  const [expandedChapters, setExpandedChapters] = useState({})
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [filterType, setFilterType] = useState('all') // 'all', 'video', 'reel'

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getVideocourses`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.priority - b.priority)
        setAllCourses(sorted)
        setFirstLoading(false)
      })
  }, [])

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }))
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  const playVideo = (video) => {
    setSelectedVideo(video)
    document.getElementById('modal_player').showModal()
  }

  const closeModal = () => {
    // Stop video playback by removing the selected video
    setSelectedVideo(null)
    document.getElementById('modal_player')?.close()
  }

  const getFilteredVideos = (videos) => {
    if (!videos) return []
    if (filterType === 'all') return videos
    return videos.filter(v => v.type === filterType)
  }

  if (firstLoading) return <LoadingPage />

  return (
    <div className='max-w-7xl mx-auto p-4 space-y-4'>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg'>
        <h1 className='text-3xl lg:text-4xl font-bold flex items-center gap-3 mb-4'>
          <MdPlayCircleFilled className='text-4xl' />
          Video Library
        </h1>
        
        {/* Filter Tabs */}
        <div className='flex gap-2 flex-wrap'>
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filterType === 'all' 
                ? 'bg-white text-purple-600 shadow-md' 
                : 'bg-purple-500 bg-opacity-50 hover:bg-opacity-70'
            }`}
          >
            ðŸ“š All Content
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filterType === 'video' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'bg-blue-500 bg-opacity-50 hover:bg-opacity-70'
            }`}
          >
            ðŸŽ¥ Videos
          </button>
          <button
            onClick={() => setFilterType('reel')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filterType === 'reel' 
                ? 'bg-white text-pink-600 shadow-md' 
                : 'bg-pink-500 bg-opacity-50 hover:bg-opacity-70'
            }`}
          >
            ðŸŽ¬ Reels
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className='space-y-4'>
        {allCourses.map((course) => {
          const totalVideos = course.chapters?.reduce((sum, ch) => sum + (getFilteredVideos(ch.Videos)?.length || 0), 0) || 0
          
          // Hide course if no videos match filter
          if (totalVideos === 0 && filterType !== 'all') return null

          return (
            <div key={course.id} className='border-2 border-purple-200 rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all'>
              {/* Course Header */}
              <div className='bg-gradient-to-r from-purple-100 to-blue-100 p-4'>
                <div className='flex gap-4 items-center'>
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className='text-3xl text-purple-600 hover:text-purple-800 transition-colors'
                  >
                    {expandedCourses[course.id] ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                  </button>
                  <img
                    className='rounded-lg h-20 w-28 object-cover border-2 border-purple-300 shadow-md'
                    src={course.thumbnail || '/profile.jpg'}
                    alt={course.title}
                  />
                  <div className='flex-grow'>
                    <h2 className='text-xl lg:text-2xl font-bold text-purple-700'>{course.title}</h2>
                    <div className='flex gap-4 mt-1 text-sm text-gray-600'>
                      <span>ðŸ“– {course.chapters?.length || 0} Chapters</span>
                      <span>ðŸŽ¥ {totalVideos} {filterType === 'all' ? 'Items' : filterType === 'video' ? 'Videos' : 'Reels'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapters (Collapsible) */}
              {expandedCourses[course.id] && (
                <div className='p-4 space-y-3 bg-gray-50'>
                  {course.chapters?.sort((a, b) => a.priority - b.priority).map((chapter) => {
                    const filteredVideos = getFilteredVideos(chapter.Videos)?.sort((a, b) => a.priority - b.priority) || []
                    
                    // Hide chapter if no videos match filter
                    if (filteredVideos.length === 0 && filterType !== 'all') return null

                    return (
                      <div key={chapter.id} className='border-2 border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm'>
                        {/* Chapter Header */}
                        <div className='bg-gradient-to-r from-blue-50 to-cyan-50 p-3'>
                          <div className='flex gap-3 items-center'>
                            <button
                              onClick={() => toggleChapter(chapter.id)}
                              className='text-2xl text-blue-600 hover:text-blue-800 transition-colors'
                            >
                              {expandedChapters[chapter.id] ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
                            </button>
                            <img
                              className='rounded h-16 w-20 object-cover border-2 border-blue-300'
                              src={chapter.thumbnail || '/profile.jpg'}
                              alt={chapter.title}
                            />
                            <div className='flex-grow'>
                              <h3 className='font-bold text-lg text-blue-700'>{chapter.title}</h3>
                              <p className='text-sm text-gray-600'>{filteredVideos.length} {filterType === 'all' ? 'Items' : filterType === 'video' ? 'Videos' : 'Reels'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Videos (Collapsible) */}
                        {expandedChapters[chapter.id] && (
                          <div className='p-3'>
                            {/* Videos Grid */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                              {filteredVideos.map((video) => (
                                <div
                                  key={video.id}
                                  onClick={() => playVideo(video)}
                                  className={`cursor-pointer group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105 ${
                                    video.type === 'reel' 
                                      ? 'border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50' 
                                      : 'border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'
                                  }`}
                                >
                                  {/* Thumbnail */}
                                  <div className='relative'>
                                    <img
                                      className='w-full h-40 object-cover'
                                      src={video.thumbnail || '/profile.jpg'}
                                      alt={video.title}
                                    />
                                    {/* Play Overlay */}
                                    <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center'>
                                      <MdPlayCircleFilled className='text-white text-5xl opacity-0 group-hover:opacity-100 transition-opacity' />
                                    </div>
                                    {/* Type Badge */}
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
                                      video.type === 'reel' 
                                        ? 'bg-pink-500' 
                                        : 'bg-blue-500'
                                    }`}>
                                      {video.type === 'reel' ? 'ðŸŽ¬ Reel' : 'ðŸŽ¥ Video'}
                                    </div>
                                  </div>
                                  {/* Title */}
                                  <div className='p-3'>
                                    <p className='font-semibold text-sm text-gray-800 line-clamp-2'>
                                      {video.title}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {filteredVideos.length === 0 && (
                              <p className='text-center text-gray-400 py-8'>
                                No {filterType === 'all' ? 'content' : filterType === 'video' ? 'videos' : 'reels'} available
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {course.chapters?.filter(ch => getFilteredVideos(ch.Videos)?.length > 0).length === 0 && (
                    <p className='text-center text-gray-400 py-8'>No chapters with {filterType === 'all' ? 'content' : filterType === 'video' ? 'videos' : 'reels'}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {allCourses.filter(course => 
          course.chapters?.some(ch => getFilteredVideos(ch.Videos)?.length > 0)
        ).length === 0 && (
          <div className='text-center py-16'>
            <p className='text-gray-400 text-xl'>No {filterType === 'all' ? 'content' : filterType === 'video' ? 'videos' : 'reels'} available yet</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <dialog id="modal_player" className="modal">
        <div className="modal-box max-w-6xl w-full">
          <form method="dialog">
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-2xl z-10"
              onClick={closeModal}
            >
              âœ•
            </button>
          </form>
          {selectedVideo && (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                  selectedVideo.type === 'reel' ? 'bg-pink-500' : 'bg-blue-500'
                }`}>
                  {selectedVideo.type === 'reel' ? 'ðŸŽ¬ Reel' : 'ðŸŽ¥ Video'}
                </div>
                <h2 className='font-bold text-xl flex-grow'>{selectedVideo.title}</h2>
              </div>
              
              {/* Video Player */}
              <div className={`w-full rounded-lg overflow-hidden ${
                selectedVideo.type === 'reel' 
                  ? 'h-[600px] max-w-md mx-auto' 
                  : 'h-[400px] md:h-[500px] lg:h-[600px]'
              }`}>
                {getYouTubeVideoId(selectedVideo.url) ? (
                  <iframe
                    key={selectedVideo.id}
                    className="w-full h-full"
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
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default VideoLibrary
