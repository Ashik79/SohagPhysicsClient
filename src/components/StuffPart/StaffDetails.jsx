import React, { useContext, useState } from 'react';
import { Link, Navigate, useLoaderData } from 'react-router-dom';


import { FaUserEdit } from "react-icons/fa";
import StaffAttendanceCalendar from './StaffAttendanceComponent';






const StaffDetails = () => {

  const [navigate, setNavigate] = useState(false)
  const staff = useLoaderData();
  console.log(staff)
  const [activeTab, setActiveTab] = useState('details');
  const [messageText, setMessageText] = useState("")
  const [selectedOption, setSelectedOption] = useState('bangla');
  const [divisor, setDivisor] = useState(65)
  const [loading, setLoading] = useState(false)

 



 
  
 
  
  const handleKeyUp = e => {
    const text = e.target.value
    setMessageText(text)
  }
  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        // return <div><staffDetailsPart staff={staff}></staffDetailsPart></div>;
     
     
      // case 'results':
      //   return <div><ExamsList staff={staff}></ExamsList></div>;
      case 'attendance':
        return <div><StaffAttendanceCalendar staff={staff}></StaffAttendanceCalendar></div>;
      // case 'monthlyPayments':
      //   return <div><MonthlyPaymentsComponent payments={staff.payments} staff={staff}></MonthlyPaymentsComponent></div>;
     
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className='flex justify-between'>
        <div>
          <h1 className="text-2xl lg:text-3xl text-sky-800 font-bold mb-2">{staff.name}</h1>
          <h2 className="text-xl mb-4"> {staff.role}</h2>
        </div>
        <div className='flex gap-3'>
          <div className='w-24 lg:w-32  mb-4 '>
            <img className='rounded-lg' src={`${staff.photo?staff.photo:'/profile.jpg'}`} alt="Image" />
          </div>
          <div className='text-2xl flex flex-col gap-1 pt-3 text-sky-800'>
            <Link to={`/staff/update/${staff.id}`}><FaUserEdit /></Link>
            
          </div>
        </div>
      </div>
      <div className="flex gap-2 text-sm overflow-x-auto mb-5">
        
       
       
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
       
      </div>
      <div>
        {renderContent()}
      </div>
      {navigate ? <Navigate to={`/`}></Navigate> : <></>}

      
    </div>
  );
};

export default StaffDetails;
