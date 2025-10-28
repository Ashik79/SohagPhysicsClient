import React, { useContext, useState } from 'react';
import { Link, Navigate, useLoaderData } from 'react-router-dom';
import { FaUserEdit } from "react-icons/fa";
import { AuthContext } from '../../Provider';
import Swal from 'sweetalert2';
import { IoMdClose } from "react-icons/io";

import VideoManager from './VideoManager';
import PdfManager from './PdfManager';
import NoticeBoard from './NoticeBoard';
import BannerPics from './BannerPics';
import PromoVideo from './PromoVideo';
import BatchTime from './BatchTime';

const EditorDashboard = () => {
  const { role, notifySuccess } = useContext(AuthContext)
  const [navigate, setNavigate] = useState(false)
  
  
  const [activeTab, setActiveTab] = useState('videos');
  const [loading, setLoading] = useState(false)
 

  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return <div><VideoManager></VideoManager></div>;
      case 'pdf':
        return <div><PdfManager></PdfManager></div>;
      case 'notice':
        return <div><NoticeBoard></NoticeBoard></div>;
      case 'promo':
        return <div><PromoVideo></PromoVideo></div>;
      case 'batchtime':
        return <div><BatchTime></BatchTime></div>;
      case 'banners':
        return <div><BannerPics></BannerPics></div>;
      // case 'results':
      //   return <div></div>;
      // case 'attendance':
      //   return <div></div>;
      // case 'monthlyPayments':
      //   return <div></div>;
      
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
          onClick={() => setActiveTab('promo')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'promo' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Promo Video
        </button>
        <button
          onClick={() => setActiveTab('batchtime')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'batchtime' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Batch Time
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'banners' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
        >
          Banners
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


