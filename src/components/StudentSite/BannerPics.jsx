import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Provider';
import SmartImageUpload from '../SmartImageUpload';
import Swal from 'sweetalert2';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

function BannerPics() {
  const { notifySuccess, notifyFailed } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    image: '',
    title: '',
    priority: 1
  });

  // Fetch all banners
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://spoffice-server.vercel.app/getbanners');
      const data = await response.json();
      
      // Sort by priority (lower number = higher priority)
      const sortedBanners = data.sort((a, b) => a.priority - b.priority);
      setBanners(sortedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      notifyFailed('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploaded = (url) => {
    setFormData(prev => ({
      ...prev,
      image: url
    }));
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      // Editing existing banner
      setEditingBanner(banner);
      setFormData({
        image: banner.image || '',
        title: banner.title || '',
        priority: banner.priority || 1
      });
    } else {
      // Adding new banner
      setEditingBanner(null);
      setFormData({
        image: '',
        title: '',
        priority: banners.length + 1 // Set priority to next available
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      image: '',
      title: '',
      priority: 1
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image.trim()) {
      notifyFailed('Please upload an image');
      return;
    }

    setSubmitting(true);

    try {
      let response;

      if (editingBanner) {
        // Update existing banner
        response = await fetch(`https://spoffice-server.vercel.app/updatebanner/${editingBanner._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Insert new banner
        response = await fetch('https://spoffice-server.vercel.app/insertbanner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }

      const result = await response.json();

      if (response.ok) {
        notifySuccess(editingBanner ? 'Banner updated successfully!' : 'Banner added successfully!');
        fetchBanners();
        handleCloseModal();
      } else {
        notifyFailed(result.message || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      notifyFailed('Error saving banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (banner) => {
    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete this banner?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`https://spoffice-server.vercel.app/deletebanner/${banner._id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            notifySuccess('Banner deleted successfully!');
            fetchBanners();
          } else {
            notifyFailed('Failed to delete banner');
          }
        } catch (error) {
          console.error('Error deleting banner:', error);
          notifyFailed('Error deleting banner');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-sky-600"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sky-800">Banner Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
        >
          <MdAdd size={20} />
          Add Banner
        </button>
      </div>

      {/* Banners List */}
      {banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative">
                <img
                  src={banner.image}
                  alt={banner.title || 'Banner'}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-sky-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Priority: {banner.priority}
                </div>
              </div>
              <div className="p-4">
                {banner.title && (
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {banner.title}
                  </h3>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                  >
                    <MdEdit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  >
                    <MdDelete size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">No banners available</p>
          <p className="text-gray-400 text-sm">Click "Add Banner" to create your first banner</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-sky-700">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Banner Image <span className="text-red-500">*</span>
                  </label>
                  <SmartImageUpload
                    onImageUploaded={handleImageUploaded}
                    initialImage={formData.image}
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Title <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                    placeholder="Enter banner title (optional)"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Priority <span className="text-gray-500">(Lower number = Higher priority)</span>
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                    placeholder="Enter priority number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Priority 1 will be displayed first, Priority 2 second, etc.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:bg-gray-400"
                  >
                    {submitting ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerPics;