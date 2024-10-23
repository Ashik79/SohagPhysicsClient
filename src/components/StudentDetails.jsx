import React, { useContext, useState } from 'react';
import { Navigate, useLoaderData } from 'react-router-dom';
import StudentDetailsPart from './StudentDetailsPart';
import MonthlyPaymentsComponent from './MonthlyPaymentsComponent';
import { FaUserEdit } from "react-icons/fa";
import PaymentCard from './PaymentCard';
import { RiDeleteBin5Line } from "react-icons/ri";
import { AuthContext } from '../Provider';
import Swal from 'sweetalert2';
<<<<<<< HEAD

=======
import { TiMessages } from "react-icons/ti";
>>>>>>> 933b704 (Reinitialized git and added updated code)
import AttendanceCalendar from './AttendanceComponent';
import ExamsList from './ExamsList';
import ProgramList from './ProgramList';
import DisplayNotes from './DisplayNotes';
<<<<<<< HEAD
=======
import { IoMdClose } from "react-icons/io";
>>>>>>> 933b704 (Reinitialized git and added updated code)

const StudentDetails = () => {
  const { role, notifySuccess } = useContext(AuthContext)
  const [navigate, setNavigate] = useState(false)
  console.log(role)
  const student = useLoaderData();
  const [activeTab, setActiveTab] = useState('details');
<<<<<<< HEAD
=======
  const [messageText, setMessageText] = useState("")
  const [selectedOption, setSelectedOption] = useState('bangla');
  const [divisor, setDivisor] = useState(65)
  const [loading, setLoading] = useState(false)

  const handleOptionChange = e => {
    const value = e.target.value;
    setSelectedOption(value)
    if (value == 'bangla') {
      setDivisor(65)
    }
    else if (value == 'english') {
      setDivisor(155)
    }
  }

  const getWordCount = (text) => {
    // Match words using a regex that handles spaces and line breaks
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };


>>>>>>> 933b704 (Reinitialized git and added updated code)
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
<<<<<<< HEAD


=======
  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('send', messageText)

    try {




      const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: 'CUOP72nJJHahM30djaQG',
          senderid: '8809617642567',
          number: student.phone,
          message: messageText

        }),
      })
      const result2 = await response2.json();
      console.log(result2);
      if (result2.response_code == 202) {

        notifySuccess("SMS Sent Successfully !")

        setLoading(false)

      }
      else if (result2.response_code != 202) {
        notifyFailed(result2.error_message)

        setLoading(false)

      }
    }
    catch (err) {
      console.log(err)
    }
  }
  const handleKeyUp = e => {
    const text = e.target.value
    setMessageText(text)
  }
>>>>>>> 933b704 (Reinitialized git and added updated code)
  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return <div><StudentDetailsPart student={student}></StudentDetailsPart></div>;
      case 'programs':
        return <div><ProgramList student={student}></ProgramList></div>;
      case 'notes':
<<<<<<< HEAD
        return <div><DisplayNotes notes={student.notes ||[]} id={student.id}></DisplayNotes></div>;
=======
        return <div><DisplayNotes notes={student.notes || []} id={student.id}></DisplayNotes></div>;
>>>>>>> 933b704 (Reinitialized git and added updated code)
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
<<<<<<< HEAD
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
=======
    <div className="container mx-auto p-4">
      <div className='flex justify-between'>
        <div>
          <h1 className="text-2xl lg:text-3xl text-sky-800 font-bold mb-2">{student.name}</h1>
          <h2 className="text-xl mb-4">Roll: {student.id}</h2>
        </div>
        <div className='text-2xl flex flex-col gap-1 pt-3 text-sky-800'>
          <a href={`/student/update/${student.id}`}><FaUserEdit /></a>
          <div onClick={() => document.getElementById('my_modal_1').showModal()}><TiMessages /></div>
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

      {/* add korar modal edit */}
      <dialog id="my_modal_1" className="modal ">
        <div className="modal-box ">
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
            </form>
          </div>
          <form className='mx-auto  w-full'  >


            {/* students part */}
            <div className='mt-10 flex flex-col lg:flex-row gap-5'>
              <div className='w-full '>
                <textarea onKeyUp={handleKeyUp} className='w-full p-2 h-40 rounded-lg border-2 border-sky-600' name="text" ></textarea>
                <div className='relative -mt-9 text-end pr-4  '>
                  char : <span className='font-semibold text-sky-600'>{messageText.length}</span> || word : <span className='font-semibold text-sky-600'>{getWordCount(messageText)}</span>
                </div>
              </div>
              <div className='w-full  flex justify-center flex-col items-start gap-2'>
                <div className='text-red-600 font-semibold border-2 border-red-600 rounded-lg w-full h-20 lg:h-28 flex flex-col items-center justify-center'>

                  <p className='text-sky-600 flex gap-2 items-center text-sm'>Calculation for
                    <div>
                      <label>
                        <input
                          type="radio"
                          value="bangla"
                          checked={selectedOption === 'bangla'} // Bind the checked property to state
                          onChange={handleOptionChange}
                        />
                        বাংলা
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="radio"
                          value="english"
                          checked={selectedOption === 'english'} // Bind the checked property to state
                          onChange={handleOptionChange}
                        />
                        English
                      </label>
                    </div>
                  </p>
                  <div className='flex items-center gap-3'>
                    <p>Cost: {(Math.ceil(messageText.length / divisor) * 0.35).toFixed(2)} TK</p>
                    <p>Sms Part: {Math.ceil(messageText.length / divisor)} </p>
                  </div>



                </div>
                <div className='h-10 border-2 font-bold text-sky-600 hover:bg-slate-400 hover:text-white w-full rounded-lg border-sky-600 text-center '>
                  <button className='my-1 h-11' onClick={handleSend} >{loading ? "" : "Send SMS"}</button>
                  <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                </div>
              </div>

            </div>




          </form>










        </div>
      </dialog>
    </div>
>>>>>>> 933b704 (Reinitialized git and added updated code)
  );
};

export default StudentDetails;
