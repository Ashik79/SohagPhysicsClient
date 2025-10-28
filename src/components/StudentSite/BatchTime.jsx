import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Provider';
import { FaClock, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { MdSchedule } from 'react-icons/md';
import Swal from 'sweetalert2';

function BatchTime() {
  const { notifySuccess, notifyFailed } = useContext(AuthContext);
  const [batchTime, setBatchTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    category: '', // 'SSC' or 'HSC'
    day: '', // 'saturday' or 'sunday'
    mode: 'add', // 'add' or 'edit'
    editIndex: null
  });

  const [batchFormData, setBatchFormData] = useState({
    time: '',
    priority: '',
    isNew: 'No',
    location: 'Kalitola'
  });

  useEffect(() => {
    fetchBatchTime();
  }, []);

  const fetchBatchTime = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://spoffice-server.vercel.app/getbatchtime');
      
      if (!response.ok) {
        initializeEmptyBatchTime();
        setLoading(false);
        return;
      }
      
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        initializeEmptyBatchTime();
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(text);
      
      if (data && data._id) {
        setBatchTime(data);
      } else {
        initializeEmptyBatchTime();
      }
    } catch (error) {
      console.error('Error fetching batch time:', error);
      initializeEmptyBatchTime();
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyBatchTime = () => {
    setBatchTime({
      SSC: {
        saturday: [],
        sunday: []
      },
      HSC: {
        saturday: [],
        sunday: []
      }
    });
  };

  const openAddModal = (category, day) => {
    setModalConfig({
      category,
      day,
      mode: 'add',
      editIndex: null
    });
    setBatchFormData({ time: '', priority: '', isNew: 'No', location: 'Kalitola' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (category, day, index) => {
    const batch = batchTime[category][day][index];
    setModalConfig({
      category,
      day,
      mode: 'edit',
      editIndex: index
    });
    setBatchFormData({
      time: batch.time,
      priority: batch.priority,
      isNew: batch.isNew || 'No',
      location: batch.location || 'Kalitola'
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setBatchFormData({ time: '', priority: '', isNew: 'No', location: 'Kalitola' });
    setModalConfig({
      category: '',
      day: '',
      mode: 'add',
      editIndex: null
    });
  };

  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    setBatchFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    
    if (!batchFormData.time.trim() || !batchFormData.priority) {
      notifyFailed('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const { category, day } = modalConfig;
      const newBatch = {
        time: batchFormData.time.trim(),
        priority: parseInt(batchFormData.priority),
        isNew: batchFormData.isNew,
        location: batchFormData.location,
        id: crypto.randomUUID()
      };

      const updatedBatchTime = { ...batchTime };
      updatedBatchTime[category][day] = [...updatedBatchTime[category][day], newBatch]
        .sort((a, b) => a.priority - b.priority);

      await saveBatchTime(updatedBatchTime);
      closeModal();
    } catch (error) {
      console.error('Error adding batch:', error);
      notifyFailed('Error adding batch');
      setSubmitting(false);
    }
  };

  const handleEditBatch = async (e) => {
    e.preventDefault();
    
    if (!batchFormData.time.trim() || !batchFormData.priority) {
      notifyFailed('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const { category, day, editIndex } = modalConfig;
      const updatedBatchTime = { ...batchTime };
      
      updatedBatchTime[category][day][editIndex] = {
        ...updatedBatchTime[category][day][editIndex],
        time: batchFormData.time.trim(),
        priority: parseInt(batchFormData.priority),
        isNew: batchFormData.isNew,
        location: batchFormData.location
      };

      // Re-sort after editing
      updatedBatchTime[category][day] = updatedBatchTime[category][day]
        .sort((a, b) => a.priority - b.priority);

      await saveBatchTime(updatedBatchTime);
      closeModal();
    } catch (error) {
      console.error('Error updating batch:', error);
      notifyFailed('Error updating batch');
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = (category, day, index) => {
    const batch = batchTime[category][day][index];
    
    Swal.fire({
      title: 'Are You Sure?',
      text: `Do you want to delete the batch at ${batch.time}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedBatchTime = { ...batchTime };
          updatedBatchTime[category][day] = updatedBatchTime[category][day]
            .filter((_, i) => i !== index);

          await saveBatchTime(updatedBatchTime);
        } catch (error) {
          console.error('Error deleting batch:', error);
          notifyFailed('Error deleting batch');
        }
      }
    });
  };

  const saveBatchTime = async (updatedData) => {
    try {
      let response;
      
      if (batchTime && batchTime._id) {
        // Update existing
        response = await fetch(`https://spoffice-server.vercel.app/updatebatchtime/${batchTime._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            SSC: updatedData.SSC,
            HSC: updatedData.HSC
          })
        });
      } else {
        // Insert new
        response = await fetch('https://spoffice-server.vercel.app/insertbatchtime', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            SSC: updatedData.SSC,
            HSC: updatedData.HSC
          })
        });
      }

      const result = await response.json();

      if (response.ok) {
        notifySuccess('Batch time updated successfully!');
        fetchBatchTime();
      } else {
        notifyFailed(result.message || 'Failed to save batch time');
      }
    } catch (error) {
      console.error('Error saving batch time:', error);
      notifyFailed('Error saving batch time');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-purple-600"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 flex items-center gap-2">
          <MdSchedule className="text-2xl sm:text-3xl" />
          Batch Time Management
        </h2>
        <p className="text-sm text-gray-600 mt-1">Manage SSC and HSC batch schedules for Saturday and Sunday</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SSC Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <FaClock />
            SSC Batches
          </h3>

          {/* Saturday */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-blue-600">Saturday</h4>
              <button
                onClick={() => openAddModal('SSC', 'saturday')}
                className="btn btn-xs sm:btn-sm bg-blue-600 text-white hover:bg-blue-700 border-none"
              >
                <FaPlus /> Add Batch
              </button>
            </div>
            <div className="space-y-2">
              {batchTime?.SSC?.saturday?.length > 0 ? (
                batchTime.SSC.saturday.map((batch, index) => (
                  <div
                    key={batch.id || index}
                    className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-200 hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{batch.time}</p>
                        {batch.isNew === 'Yes' && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Priority: {batch.priority}</p>
                      <p className="text-xs text-blue-600 font-medium">📍 {batch.location || 'Kalitola'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal('SSC', 'saturday', index)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch('SSC', 'saturday', index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-sm">No batches added yet</p>
              )}
            </div>
          </div>

          {/* Sunday */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-blue-600">Sunday</h4>
              <button
                onClick={() => openAddModal('SSC', 'sunday')}
                className="btn btn-xs sm:btn-sm bg-blue-600 text-white hover:bg-blue-700 border-none"
              >
                <FaPlus /> Add Batch
              </button>
            </div>
            <div className="space-y-2">
              {batchTime?.SSC?.sunday?.length > 0 ? (
                batchTime.SSC.sunday.map((batch, index) => (
                  <div
                    key={batch.id || index}
                    className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-200 hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{batch.time}</p>
                        {batch.isNew === 'Yes' && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Priority: {batch.priority}</p>
                      <p className="text-xs text-blue-600 font-medium">📍 {batch.location || 'Kalitola'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal('SSC', 'sunday', index)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch('SSC', 'sunday', index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-sm">No batches added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* HSC Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <FaClock />
            HSC Batches
          </h3>

          {/* Saturday */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-green-600">Saturday</h4>
              <button
                onClick={() => openAddModal('HSC', 'saturday')}
                className="btn btn-xs sm:btn-sm bg-green-600 text-white hover:bg-green-700 border-none"
              >
                <FaPlus /> Add Batch
              </button>
            </div>
            <div className="space-y-2">
              {batchTime?.HSC?.saturday?.length > 0 ? (
                batchTime.HSC.saturday.map((batch, index) => (
                  <div
                    key={batch.id || index}
                    className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200 hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{batch.time}</p>
                        {batch.isNew === 'Yes' && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Priority: {batch.priority}</p>
                      <p className="text-xs text-green-600 font-medium">📍 {batch.location || 'Kalitola'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal('HSC', 'saturday', index)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch('HSC', 'saturday', index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-sm">No batches added yet</p>
              )}
            </div>
          </div>

          {/* Sunday */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-green-600">Sunday</h4>
              <button
                onClick={() => openAddModal('HSC', 'sunday')}
                className="btn btn-xs sm:btn-sm bg-green-600 text-white hover:bg-green-700 border-none"
              >
                <FaPlus /> Add Batch
              </button>
            </div>
            <div className="space-y-2">
              {batchTime?.HSC?.sunday?.length > 0 ? (
                batchTime.HSC.sunday.map((batch, index) => (
                  <div
                    key={batch.id || index}
                    className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200 hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{batch.time}</p>
                        {batch.isNew === 'Yes' && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Priority: {batch.priority}</p>
                      <p className="text-xs text-green-600 font-medium">📍 {batch.location || 'Kalitola'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal('HSC', 'sunday', index)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch('HSC', 'sunday', index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-sm">No batches added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-purple-700">
              {modalConfig.mode === 'add' ? 'Add New Batch' : 'Edit Batch'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {modalConfig.category} - {modalConfig.day.charAt(0).toUpperCase() + modalConfig.day.slice(1)}
            </p>
            
            <form onSubmit={modalConfig.mode === 'add' ? handleAddBatch : handleEditBatch} className="space-y-4">
              {/* Time Input */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Batch Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="time"
                  value={batchFormData.time}
                  onChange={handleBatchFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 9:00 AM - 10:30 AM"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the time range (e.g., "9:00 AM - 10:30 AM" or "Morning Batch")
                </p>
              </div>

              {/* Priority Input */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="priority"
                  value={batchFormData.priority}
                  onChange={handleBatchFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="1, 2, 3..."
                  min="1"
                  required
                  onWheel={(e) => e.target.blur()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first in the list
                </p>
              </div>

              {/* Is New Batch */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Is New Batch? <span className="text-red-500">*</span>
                </label>
                <select
                  name="isNew"
                  value={batchFormData.isNew}
                  onChange={handleBatchFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Mark "Yes" to display a "NEW" badge on this batch
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  value={batchFormData.location}
                  onChange={handleBatchFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="Kalitola">Kalitola</option>
                  <option value="Jaleswaritola">Jaleswaritola</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the location where this batch will be held
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : (modalConfig.mode === 'add' ? 'Add Batch' : 'Update Batch')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeModal}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default BatchTime;
