import API_URL from '../../apiConfig';
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

  // Modal states for batches
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    classId: '',
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

  // Modal states for classes
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalMode, setClassModalMode] = useState('add'); // 'add' or 'edit'
  const [editingClassId, setEditingClassId] = useState(null);
  const [classFormData, setClassFormData] = useState({
    name: '',
    priority: '',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    icon: 'FaGraduationCap'
  });

  useEffect(() => {
    fetchBatchTime();
  }, []);

  const fetchBatchTime = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/getbatchtime`);
      
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
      classes: []
    });
  };

  const openAddModal = (classId, day) => {
    setModalConfig({
      classId,
      day,
      mode: 'add',
      editIndex: null
    });
    setBatchFormData({ time: '', priority: '', isNew: 'No', location: 'Kalitola' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (classId, day, index) => {
    const classObj = batchTime.classes.find(c => c.id === classId);
    const batch = classObj[day][index];
    setModalConfig({
      classId,
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

  const openClassModal = (mode, classId = null) => {
    setClassModalMode(mode);
    if (mode === 'edit' && classId) {
      const classObj = batchTime.classes.find(c => c.id === classId);
      setEditingClassId(classId);
      setClassFormData({
        name: classObj.name,
        priority: classObj.priority,
        gradient: classObj.gradient || 'from-blue-500 via-cyan-500 to-teal-500',
        icon: classObj.icon || 'FaGraduationCap'
      });
    } else {
      setEditingClassId(null);
      setClassFormData({
        name: '',
        priority: '',
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        icon: 'FaGraduationCap'
      });
    }
    setIsClassModalOpen(true);
  };

  const closeClassModal = () => {
    setIsClassModalOpen(false);
    setClassFormData({
      name: '',
      priority: '',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      icon: 'FaGraduationCap'
    });
    setEditingClassId(null);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setBatchFormData({ time: '', priority: '', isNew: 'No', location: 'Kalitola' });
    setModalConfig({
      classId: '',
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

  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    setClassFormData(prev => ({
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
      const { classId, day } = modalConfig;
      const newBatch = {
        time: batchFormData.time.trim(),
        priority: parseInt(batchFormData.priority),
        isNew: batchFormData.isNew,
        location: batchFormData.location,
        id: crypto.randomUUID()
      };

      const updatedBatchTime = { ...batchTime };
      const classIndex = updatedBatchTime.classes.findIndex(c => c.id === classId);
      updatedBatchTime.classes[classIndex][day] = [...updatedBatchTime.classes[classIndex][day], newBatch]
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
      const { classId, day, editIndex } = modalConfig;
      const updatedBatchTime = { ...batchTime };
      const classIndex = updatedBatchTime.classes.findIndex(c => c.id === classId);
      
      updatedBatchTime.classes[classIndex][day][editIndex] = {
        ...updatedBatchTime.classes[classIndex][day][editIndex],
        time: batchFormData.time.trim(),
        priority: parseInt(batchFormData.priority),
        isNew: batchFormData.isNew,
        location: batchFormData.location
      };

      // Re-sort after editing
      updatedBatchTime.classes[classIndex][day] = updatedBatchTime.classes[classIndex][day]
        .sort((a, b) => a.priority - b.priority);

      await saveBatchTime(updatedBatchTime);
      closeModal();
    } catch (error) {
      console.error('Error updating batch:', error);
      notifyFailed('Error updating batch');
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = (classId, day, index) => {
    const classObj = batchTime.classes.find(c => c.id === classId);
    const batch = classObj[day][index];
    
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
          const classIndex = updatedBatchTime.classes.findIndex(c => c.id === classId);
          updatedBatchTime.classes[classIndex][day].splice(index, 1);
          await saveBatchTime(updatedBatchTime);
        } catch (error) {
          console.error('Error deleting batch:', error);
          notifyFailed('Error deleting batch');
        }
      }
    });
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!classFormData.name.trim() || !classFormData.priority) {
      notifyFailed('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const newClass = {
        id: crypto.randomUUID(),
        name: classFormData.name.trim(),
        priority: parseInt(classFormData.priority),
        gradient: classFormData.gradient,
        icon: classFormData.icon,
        saturday: [],
        sunday: []
      };

      const updatedBatchTime = { ...batchTime };
      if (!updatedBatchTime.classes) {
        updatedBatchTime.classes = [];
      }
      updatedBatchTime.classes = [...updatedBatchTime.classes, newClass]
        .sort((a, b) => a.priority - b.priority);

      await saveBatchTime(updatedBatchTime);
      closeClassModal();
    } catch (error) {
      console.error('Error adding class:', error);
      notifyFailed('Error adding class');
      setSubmitting(false);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    
    if (!classFormData.name.trim() || !classFormData.priority) {
      notifyFailed('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const updatedBatchTime = { ...batchTime };
      const classIndex = updatedBatchTime.classes.findIndex(c => c.id === editingClassId);
      
      updatedBatchTime.classes[classIndex] = {
        ...updatedBatchTime.classes[classIndex],
        name: classFormData.name.trim(),
        priority: parseInt(classFormData.priority),
        gradient: classFormData.gradient,
        icon: classFormData.icon
      };

      // Re-sort after editing
      updatedBatchTime.classes = updatedBatchTime.classes
        .sort((a, b) => a.priority - b.priority);

      await saveBatchTime(updatedBatchTime);
      closeClassModal();
    } catch (error) {
      console.error('Error updating class:', error);
      notifyFailed('Error updating class');
      setSubmitting(false);
    }
  };

  const handleDeleteClass = (classId) => {
    const classObj = batchTime.classes.find(c => c.id === classId);
    
    Swal.fire({
      title: 'Are You Sure?',
      text: `Do you want to delete the entire "${classObj.name}" class and all its batches?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedBatchTime = { ...batchTime };
          updatedBatchTime.classes = updatedBatchTime.classes.filter(c => c.id !== classId);
          await saveBatchTime(updatedBatchTime);
        } catch (error) {
          console.error('Error deleting class:', error);
          notifyFailed('Error deleting class');
        }
      }
    });
  };

  const saveBatchTime = async (updatedData) => {
    try {
      let response;
      
      if (batchTime && batchTime._id) {
        // Update existing
        response = await fetch(`${API_URL}/updatebatchtime/${batchTime._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            classes: updatedData.classes
          })
        });
      } else {
        // Insert new
        response = await fetch(`${API_URL}/insertbatchtime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            classes: updatedData.classes
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

  const getIconComponent = (iconName) => {
    const icons = {
      'FaGraduationCap': <FaClock />,
      'FaStar': <FaClock />,
      'FaClock': <FaClock />
    };
    return icons[iconName] || <FaClock />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 flex items-center gap-2">
            <MdSchedule className="text-2xl sm:text-3xl" />
            Batch Time Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Manage all class batch schedules dynamically</p>
        </div>
        <button
          onClick={() => openClassModal('add')}
          className="btn btn-sm sm:btn-md bg-purple-600 text-white hover:bg-purple-700 border-none"
        >
          <FaPlus /> Add New Class
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batchTime?.classes && batchTime.classes.length > 0 ? (
          batchTime.classes.map((classObj) => (
            <div key={classObj.id} className={`bg-gradient-to-br ${classObj.gradient.includes('blue') ? 'from-blue-50 to-cyan-50 border-blue-300' : 'from-green-50 to-emerald-50 border-green-300'} border-2 rounded-lg p-4 shadow-md relative`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${classObj.gradient.includes('blue') ? 'text-blue-700' : 'text-green-700'} flex items-center gap-2`}>
                  {getIconComponent(classObj.icon)}
                  {classObj.name} Batches
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openClassModal('edit', classObj.id)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded transition"
                    title="Edit Class"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classObj.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                    title="Delete Class"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Saturday */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`font-semibold ${classObj.gradient.includes('blue') ? 'text-blue-600' : 'text-green-600'}`}>Saturday</h4>
                  <button
                    onClick={() => openAddModal(classObj.id, 'saturday')}
                    className={`btn btn-xs sm:btn-sm ${classObj.gradient.includes('blue') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white border-none`}
                  >
                    <FaPlus /> Add Batch
                  </button>
                </div>
                <div className="space-y-2">
                  {classObj.saturday && classObj.saturday.length > 0 ? (
                    classObj.saturday.map((batch, index) => (
                      <div
                        key={batch.id || index}
                        className={`flex justify-between items-center bg-white p-3 rounded-lg border ${classObj.gradient.includes('blue') ? 'border-blue-200' : 'border-green-200'} hover:shadow-md transition`}
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
                          <p className={`text-xs ${classObj.gradient.includes('blue') ? 'text-blue-600' : 'text-green-600'} font-medium`}>ðŸ“ {batch.location || 'Kalitola'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(classObj.id, 'saturday', index)}
                            className={`p-2 ${classObj.gradient.includes('blue') ? 'text-blue-600 hover:bg-blue-100' : 'text-green-600 hover:bg-green-100'} rounded transition`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(classObj.id, 'saturday', index)}
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
                  <h4 className={`font-semibold ${classObj.gradient.includes('blue') ? 'text-blue-600' : 'text-green-600'}`}>Sunday</h4>
                  <button
                    onClick={() => openAddModal(classObj.id, 'sunday')}
                    className={`btn btn-xs sm:btn-sm ${classObj.gradient.includes('blue') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white border-none`}
                  >
                    <FaPlus /> Add Batch
                  </button>
                </div>
                <div className="space-y-2">
                  {classObj.sunday && classObj.sunday.length > 0 ? (
                    classObj.sunday.map((batch, index) => (
                      <div
                        key={batch.id || index}
                        className={`flex justify-between items-center bg-white p-3 rounded-lg border ${classObj.gradient.includes('blue') ? 'border-blue-200' : 'border-green-200'} hover:shadow-md transition`}
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
                          <p className={`text-xs ${classObj.gradient.includes('blue') ? 'text-blue-600' : 'text-green-600'} font-medium`}>ðŸ“ {batch.location || 'Kalitola'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(classObj.id, 'sunday', index)}
                            className={`p-2 ${classObj.gradient.includes('blue') ? 'text-blue-600 hover:bg-blue-100' : 'text-green-600 hover:bg-green-100'} rounded transition`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(classObj.id, 'sunday', index)}
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No classes added yet</p>
            <button
              onClick={() => openClassModal('add')}
              className="btn bg-purple-600 text-white hover:bg-purple-700 border-none"
            >
              <FaPlus /> Add Your First Class
            </button>
          </div>
        )}
      </div>

      {/* Class Add/Edit Modal */}
      {isClassModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-purple-700">
              {classModalMode === 'add' ? 'Add New Class' : 'Edit Class'}
            </h3>
            
            <form onSubmit={classModalMode === 'add' ? handleAddClass : handleEditClass} className="space-y-4">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={classFormData.name}
                  onChange={handleClassFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="e.g., SSC, HSC, Admission"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="priority"
                  value={classFormData.priority}
                  onChange={handleClassFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="1, 2, 3..."
                  min="1"
                  required
                  onWheel={(e) => e.target.blur()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              {/* Gradient */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Color Theme <span className="text-red-500">*</span>
                </label>
                <select
                  name="gradient"
                  value={classFormData.gradient}
                  onChange={handleClassFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="from-blue-500 via-cyan-500 to-teal-500">Blue/Cyan</option>
                  <option value="from-purple-500 via-pink-500 to-rose-500">Purple/Pink</option>
                  <option value="from-green-500 via-emerald-500 to-teal-500">Green/Emerald</option>
                  <option value="from-orange-500 via-red-500 to-pink-500">Orange/Red</option>
                  <option value="from-indigo-500 via-purple-500 to-pink-500">Indigo/Purple</option>
                  <option value="from-yellow-500 via-orange-500 to-red-500">Yellow/Orange</option>
                </select>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Icon <span className="text-red-500">*</span>
                </label>
                <select
                  name="icon"
                  value={classFormData.icon}
                  onChange={handleClassFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="FaGraduationCap">Graduation Cap</option>
                  <option value="FaStar">Star</option>
                  <option value="FaClock">Clock</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : (classModalMode === 'add' ? 'Add Class' : 'Update Class')}
                </button>
                <button
                  type="button"
                  onClick={closeClassModal}
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeClassModal}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Batch Add/Edit Modal */}
      {isAddModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-purple-700">
              {modalConfig.mode === 'add' ? 'Add New Batch' : 'Edit Batch'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {batchTime?.classes?.find(c => c.id === modalConfig.classId)?.name} - {modalConfig.day.charAt(0).toUpperCase() + modalConfig.day.slice(1)}
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
