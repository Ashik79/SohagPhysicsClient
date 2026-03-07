import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Provider';
import { FaYoutube, FaPlay } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

function PromoVideo() {
  const { notifySuccess, notifyFailed } = useContext(AuthContext);
  const [promoVideo, setPromoVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    isActive: true
  });

  // Fetch existing promo video on component mount
  useEffect(() => {
    fetchPromoVideo();
  }, []);

  const fetchPromoVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getpromovideo`);
      
      if (!response.ok) {
        setPromoVideo(null);
        setLoading(false);
        return;
      }
      
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        setPromoVideo(null);
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(text);
      
      if (data && data._id) {
        setPromoVideo(data);
        setFormData({
          title: data.title || '',
          url: data.url || '',
          description: data.description || '',
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } else {
        setPromoVideo(null);
      }
    } catch (error) {
      console.error('Error fetching promo video:', error);
      setPromoVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const extractYoutubeId = (url) => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const getEmbedUrl = (url) => {
    const videoId = extractYoutubeId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      notifyFailed('Please fill in all required fields');
      return;
    }

    // Validate YouTube URL
    const videoId = extractYoutubeId(formData.url);
    if (!videoId) {
      notifyFailed('Please enter a valid YouTube URL or video ID');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      
      if (promoVideo && promoVideo._id) {
        // Update existing promo video
        response = await fetch(`${import.meta.env.VITE_API_URL}/updatepromovideo/${promoVideo._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Insert new promo video (only happens once)
        response = await fetch(`${import.meta.env.VITE_API_URL}/insertpromovideo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }

      const result = await response.json();

      if (response.ok) {
        notifySuccess(promoVideo ? 'Promo video updated successfully!' : 'Promo video created successfully!');
        fetchPromoVideo();
        setIsEditing(false);
      } else {
        notifyFailed(result.message || 'Failed to save promo video');
      }
    } catch (error) {
      console.error('Error saving promo video:', error);
      notifyFailed('Error saving promo video');
    } finally {
      setSubmitting(false);
    }
  };

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-red-600"></span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-red-700 flex items-center gap-2">
          <FaYoutube className="text-2xl sm:text-3xl" />
          Promo Video Management
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          {!promoVideo && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Create Promo Video
            </button>
          )}
          {promoVideo && !isEditing && (
            <>
              <button
                onClick={openPreview}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FaPlay /> Preview
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Update Video
              </button>
            </>
          )}
        </div>
      </div>

      {/* Display Promo Video Info */}
      {promoVideo && !isEditing && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 sm:p-6 mb-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-2">{promoVideo.title}</h3>
              {promoVideo.description && (
                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{promoVideo.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                promoVideo.isActive 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {promoVideo.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {/* Video Preview Thumbnail */}
          <div className="mt-4 bg-black rounded-lg overflow-hidden aspect-video relative group cursor-pointer" onClick={openPreview}>
            {extractYoutubeId(promoVideo.url) && (
              <>
                <img 
                  src={`https://img.youtube.com/vi/${extractYoutubeId(promoVideo.url)}/maxresdefault.jpg`}
                  alt={promoVideo.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${extractYoutubeId(promoVideo.url)}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <FaPlay className="text-white text-2xl sm:text-3xl ml-1" />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 text-xs sm:text-sm text-gray-600 break-all">
            <strong>URL:</strong> {promoVideo.url}
          </div>
        </div>
      )}

      {/* Edit/Create Form */}
      {isEditing && (
        <div className="bg-white border-2 border-red-200 rounded-lg p-4 sm:p-6 shadow-md">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-red-700">
            {promoVideo ? 'Update Promo Video' : 'Create New Promo Video'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                placeholder="Enter video title"
                required
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                YouTube URL or Video ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                placeholder="https://www.youtube.com/watch?v=... or video ID"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: Full URL, youtu.be link, or just the video ID
              </p>
              {formData.url && extractYoutubeId(formData.url) && (
                <div className="mt-2 text-sm text-green-600">
                  âœ“ Valid YouTube video detected: {extractYoutubeId(formData.url)}
                </div>
              )}
              {formData.url && !extractYoutubeId(formData.url) && (
                <div className="mt-2 text-sm text-red-600">
                  âœ— Invalid YouTube URL. Please check the format.
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                placeholder="Enter video description (optional)"
              ></textarea>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                id="isActive"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium">
                Active (Visible on website)
              </label>
            </div>

            {/* Preview in Form */}
            {formData.url && extractYoutubeId(formData.url) && (
              <div className="border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50">
                <p className="text-sm font-semibold text-red-700 mb-2">Preview:</p>
                <div className="aspect-video bg-black rounded overflow-hidden">
                  <img 
                    src={`https://img.youtube.com/vi/${extractYoutubeId(formData.url)}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || (formData.url && !extractYoutubeId(formData.url))}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : (promoVideo ? 'Update Video' : 'Create Video')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (promoVideo) {
                    setFormData({
                      title: promoVideo.title || '',
                      url: promoVideo.url || '',
                      description: promoVideo.description || '',
                      isActive: promoVideo.isActive !== undefined ? promoVideo.isActive : true
                    });
                  }
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* No Promo Video Message */}
      {!promoVideo && !isEditing && (
        <div className="text-center py-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-300">
          <FaYoutube className="text-6xl sm:text-7xl text-red-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No promo video available</p>
          <p className="text-gray-400 text-sm mb-4">Click "Create Promo Video" to add your promotional video</p>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && promoVideo && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-red-700">{promoVideo.title}</h3>
              <button 
                onClick={closePreview}
                className="text-red-600 text-2xl hover:text-red-800 transition"
              >
                <IoMdClose />
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {getEmbedUrl(promoVideo.url) && (
                <iframe
                  key={promoVideo._id}
                  src={getEmbedUrl(promoVideo.url)}
                  title={promoVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
            
            {promoVideo.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{promoVideo.description}</p>
              </div>
            )}
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closePreview}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default PromoVideo;
