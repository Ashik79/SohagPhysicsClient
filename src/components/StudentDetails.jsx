import React, { useContext, useState } from 'react';
import { Navigate, useLoaderData } from 'react-router-dom';
import StudentDetailsPart from './StudentDetailsPart';
import MonthlyPaymentsComponent from './MonthlyPaymentsComponent';
import { FaUserEdit } from "react-icons/fa";
import PaymentCard from './PaymentCard';
import { RiDeleteBin5Line } from "react-icons/ri";
import { AuthContext } from '../Provider';
import Swal from 'sweetalert2';

import AttendanceCalendar from './AttendanceComponent';
import ExamsList from './ExamsList';
import ProgramList from './ProgramList';
import DisplayNotes from './DisplayNotes';

const StudentDetails = () => {
  const { role, notifySuccess } = useContext(AuthContext)
  const [navigate, setNavigate] = useState(false)
  console.log(role)
  const student = useLoaderData();
  const [activeTab, setActiveTab] = useState('details');
  const handleDelete = () => {

    Swal.fire({
      title: 'Are You Sure?',
      text: 'Do you want to delete the student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://spoffice-server.vercel.app/student/delete/${student.id}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(data => {
            if (data.deletedCount) {
              notifySuccess("Successfully Deleted Student")
              setNavigate(true)

            }
          })
      } else if (result.isDismissed) {
        return
      }
    })




  }
  var otherPayments = []
  student.payments.map((payment) => {
    if (payment.type != 'Monthly') {
      otherPayments.push(payment)
    }
  })
  const otherPaymentsReversed = otherPayments.reverse()


  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return <div><StudentDetailsPart student={student}></StudentDetailsPart></div>;
      case 'programs':
        return <div><ProgramList student={student}></ProgramList></div>;
      case 'notes':
        return <div><DisplayNotes notes={student.notes ||[]} id={student.id}></DisplayNotes></div>;
      case 'results':
        return <div><ExamsList student={student}></ExamsList></div>;
      case 'attendance':
        return <div><AttendanceCalendar student={student}></AttendanceCalendar></div>;
      case 'monthlyPayments':
        return <div><MonthlyPaymentsComponent payments={student.payments} student={student}></MonthlyPaymentsComponent></div>;
      case 'otherPayments':
        return <div>
          {otherPaymentsReversed.map((payment, index) => (
            <PaymentCard key={index} payment={payment} />
          ))}
        </div>;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
  <div className="container mx-auto p-4">
   <div className='flex justify-between'>
     <div>
       <h1 className="text-2xl lg:text-3xl text-sky-800 font-bold mb-2">{student.name}</h1>
       <h2 className="text-xl mb-4">Roll: {student.id}</h2>
     </div>
     <div className='text-2xl flex flex-col gap-1 pt-3 text-sky-800'>
       <a  href={`/student/update/${student.id}`}><FaUserEdit /></a>
       <button onClick={() => handleDelete()} className={'hidden'}><RiDeleteBin5Line /></button>
     </div>
   </div>
   <div className="flex gap-2 text-sm overflow-x-auto mb-5">
     <button
       onClick={() => setActiveTab('details')}
       className={`px-2 py-1 whitespace-nowrap ${activeTab === 'details' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
     >
       Details
     </button>
     <button
       onClick={() => setActiveTab('programs')}
       className={`px-2 py-1 whitespace-nowrap ${activeTab === 'programs' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
     >
       Programs
     </button>
     <button
       onClick={() => setActiveTab('notes')}
       className={`px-2 py-1 whitespace-nowrap ${activeTab === 'notes' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
     >
       Notes
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
   {navigate ? <Navigate to={`/`}></Navigate> : <></>}
 </div>
  );
};

export default StudentDetails;
