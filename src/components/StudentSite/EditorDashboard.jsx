import React, { useContext, useState } from 'react';
import { Link, Navigate, useLoaderData } from 'react-router-dom';
import { FaUserEdit } from "react-icons/fa";
import { AuthContext } from '../../Provider';
import Swal from 'sweetalert2';
import { IoMdClose } from "react-icons/io";

import Courses from './VideoCourses';
import PdfCourses from './PdfCourses';
import NoticeBoard from './NoticeBoard';

const EditorDashboard = () => {
  const { role, notifySuccess } = useContext(AuthContext)
  const [navigate, setNavigate] = useState(false)
  
  
  const [activeTab, setActiveTab] = useState('videos');
  const [loading, setLoading] = useState(false)
 

  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return <div><Courses></Courses></div>;
      case 'pdf':
        return <div><PdfCourses></PdfCourses></div>;
      case 'notice':
        return <div><NoticeBoard></NoticeBoard></div>;
      case 'results':
        return <div></div>;
      case 'attendance':
        return <div></div>;
      case 'monthlyPayments':
        return <div></div>;
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    role == 'CEO' ?
    <div className="container mx-auto p-4">
      <div className='flex justify-between'>
        <div>
          <h1 className="text-2xl lg:text-3xl text-sky-800 font-bold mb-2 text-center">Website Content Management</h1>
          
        </div>
       
      </div>
      <div className="flex gap-2 text-sm overflow-x-auto mb-5">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'videos' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'pdf' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          PDF
        </button>
        <button
          onClick={() => setActiveTab('notice')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'notice' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Notice
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'attendance' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'results' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab('monthlyPayments')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'monthlyPayments' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Monthly Payments
        </button>
        <button
          onClick={() => setActiveTab('otherPayments')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'otherPayments' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Other Payments
        </button>
      </div>
      <div>
        {renderContent()}
      </div>
      

     
    </div>
    :
    <div>
        No Access
    </div>
  );
};

export default EditorDashboard;


