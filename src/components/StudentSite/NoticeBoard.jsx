import API_URL from '../../apiConfig';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Provider';

function NoticeBoard() {
  const { notifySuccess, notifyFailed } = useContext(AuthContext);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    headline: '',
    date: '',
    details: '',
    type: 'casual',
    isActive: true
  });

  // Fetch existing notice on component mount
  useEffect(() => {
    fetchNotice();
  }, []);

  const fetchNotice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/getnotice`);
      
      if (!response.ok) {
        // Handle server errors
        setNotice(null);
        setLoading(false);
        return;
      }
      
      // Get the response text first
      const text = await response.text();
      
      // Check if response has content
      if (!text || text.trim() === '') {
        // Empty response - no notice in database
        setNotice(null);
        setLoading(false);
        return;
      }
      
      // Parse JSON
      const data = JSON.parse(text);
      
      // Check if data exists and is not null/empty
      if (data && data._id) {
        setNotice(data);
        setFormData({
          headline: data.headline || '',
          date: data.date || '',
          details: data.details || '',
          type: data.type || 'casual',
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } else {
        // No notice found in database
        setNotice(null);
      }
    } catch (error) {
      console.error('Error fetching notice:', error);
      // Don't show error notification if it's just no notice found
      setNotice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'date' && value) {
      // Convert yyyy-mm-dd to dd/mm/yyyy for storage
      const [year, month, day] = value.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      setFormData(prev => ({
        ...prev,
        [name]: formattedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd for date input
  const getDateInputValue = () => {
    if (!formData.date) return '';
    
    // Check if date is in dd/mm/yyyy format
    const parts = formData.date.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return formData.date;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.headline.trim() || !formData.date || !formData.details.trim()) {
      notifyFailed('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      
      if (notice && notice._id) {
        // Update existing notice
        response = await fetch(`${API_URL}/updatenotice/${notice._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Insert new notice (only happens once)
        response = await fetch(`${API_URL}/insertnotice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }

      const result = await response.json();

      if (response.ok) {
        notifySuccess(notice ? 'Notice updated successfully!' : 'Notice created successfully!');
        fetchNotice();
        setIsEditing(false);
      } else {
        notifyFailed(result.message || 'Failed to save notice');
      }
    } catch (error) {
      console.error('Error saving notice:', error);
      notifyFailed('Error saving notice');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'casual':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'important':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'information':
        return 'bg-green-100 border-green-500 text-green-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'casual':
        return 'bg-blue-500 text-white';
      case 'important':
        return 'bg-yellow-500 text-white';
      case 'information':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-sky-600"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sky-800">Notice Board Management</h2>
        {!notice && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Create Notice
          </button>
        )}
        {notice && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Update Notice
          </button>
        )}
      </div>

      {/* Display Notice */}
      {notice && !isEditing && (
        <div className={`border-l-4 rounded-lg p-6 mb-6 ${getTypeColor(notice.type)}`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getTypeBadgeColor(notice.type)}`}>
                {notice.type}
              </span>
              {!notice.isActive && (
                <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
                  Inactive
                </span>
              )}
            </div>
            <span className="text-sm font-medium">{notice.date}</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">{notice.headline}</h3>
          <p className="whitespace-pre-wrap text-gray-700">{notice.details}</p>
        </div>
      )}

      {/* Edit/Create Form */}
      {isEditing && (
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-sky-700">
            {notice ? 'Update Notice' : 'Create New Notice'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Headline */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                placeholder="Enter notice headline"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={getDateInputValue()}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                required
              />
              {formData.date && (
                <p className="text-sm text-gray-600 mt-1">Selected: {formData.date}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Notice Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                required
              >
                <option value="casual">Casual</option>
                <option value="emergency">Emergency</option>
                <option value="important">Important</option>
                <option value="information">Information</option>
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500"
                placeholder="Enter notice details"
                required
              ></textarea>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                id="isActive"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium">
                Active (Visible to students)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Saving...' : (notice ? 'Update Notice' : 'Create Notice')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (notice) {
                    setFormData({
                      headline: notice.headline || '',
                      date: notice.date || '',
                      details: notice.details || '',
                      type: notice.type || 'casual',
                      isActive: notice.isActive !== undefined ? notice.isActive : true
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

      {/* No Notice Message */}
      {!notice && !isEditing && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">No notice available</p>
          <p className="text-gray-400 text-sm">Click "Create Notice" to add a new notice</p>
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;