import API_URL from '../../apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLoaderData } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import { FaUserEdit } from "react-icons/fa";
import StaffAttendanceCalendar from './StaffAttendanceComponent';
import SessionCard from './SessionCard';
import { AuthContext } from '../../Provider';
import Swal from 'sweetalert2'

const StaffDetails = () => {
  const { month, year, date, notifyFailed, notifySuccess } = useContext(AuthContext);
  const [staff, setStaff] = useState(useLoaderData())

  const [sessions, setSessions] = useState([]);
  const [checked, setChecked] = useState(false); // Determines if there is an active session
  const [session, setSession] = useState({}); // Current active session

  const today = `${date}-${month}-${year}`;

  useEffect(() => {
    if (staff?.sessions?.length) {
      const lastSession = staff.sessions[staff.sessions.length - 1];
      setSessions(staff.sessions);

      if (lastSession && !lastSession.out) {
        setSession(lastSession);
        setChecked(false); // Active session exists
      } else {
        setChecked(true); // No active session
      }
    } else {
      setChecked(true); // No sessions available
    }
  }, [staff],[staff.sessions]);
  const reversedSessions = [...sessions].reverse();
  const first100 = reversedSessions.length > 100 ? reversedSessions.slice(0, 100) : reversedSessions;
  const [navigate, setNavigate] = useState(false)

  const getCurrentTime = () => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
    };
  };
  const { hour: defaultHour, minute: defaultMinute } = getCurrentTime();
  let activeHr, activeMin;
  if (session.date) {
    let totalNow = defaultHour * 60 + defaultMinute;
    let totalSession = session.inHour * 60 + session.inMin;
    if (totalNow < totalSession) {
      totalNow += 24 * 60; // Handle overnight sessions
    }
    let totalMin = totalNow - totalSession;
    activeHr = Math.floor(totalMin / 60);
    activeMin = totalMin % 60;
  }

  //console.log(staff)
  const [activeTab, setActiveTab] = useState('workHours');
  const [messageText, setMessageText] = useState("")
  const [selectedOption, setSelectedOption] = useState('bangla');
  const [divisor, setDivisor] = useState(65)
  const [loading, setLoading] = useState(false)
  const [entryHour, setEntryHour] = useState(1);
  const [entryMinute, setEntryMinute] = useState(0);
  const [exitHour, setExitHour] = useState(1);
  const [exitMinute, setExitMinute] = useState(0);
  const [editSession, setEditSession] = useState({})


  //edit a session
  const handleEdit = async (session) => {
    setEditSession(session)
    setEntryHour(session.inHour)
    setEntryMinute(session.inMin)
    setExitHour(session.outHour)
    setExitMinute(session.outMin)
    document.getElementById('my_modal_1').showModal()
  }
  const handleEditSession = async e => {
    e.preventDefault()
    setLoading(true)
    //console.log(e.target)
    let newSession = editSession
    newSession.inHour = entryHour;
    newSession.inMin = entryMinute;
    newSession.outHour = exitHour;
    newSession.outMin = exitMinute;

    const inTime = entryHour * 60 + entryMinute;
    let outTime = exitHour * 60 + exitMinute;
    if (outTime < inTime) {
      outTime += 24 * 60; // Handle overnight sessions
    }
    const durationMinutes = outTime - inTime;
    newSession.durationHour = Math.floor(durationMinutes / 60);
    newSession.durationMin = durationMinutes % 60;

    const indx = sessions.indexOf(editSession)
    let newSessions = sessions
    newSessions[indx] = newSession
    let tempStaff = staff
    tempStaff.sessions = newSessions
    setStaff(tempStaff)

    //console.log(staff)

    try {
      const response = await fetch(`${API_URL}/updatestaff/${staff._id}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(staff)
      });
      const data = await response.json();
      //console.log(data)
      if (data.modifiedCount) {

        setLoading(false)
        document.getElementById('my_modal_1').close()
        Swal.fire({
          title: "Successfully Edited!",
          icon: "success",
          draggable: true
        });


      }
    } catch (error) {
      console.error("Error processing update:", error);
      notifyFailed("Error processing update");
    } finally {
      setLoading(false);
    }

  }

  //Delete a session
  const handleDelete = async (session) => {
    Swal.fire({
      title: "SURE?",
      text: "Do you want to delete the session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Filter out the session to be deleted
        const newSessions = sessions.filter((ses) => ses !== session);
  
        // Update state for sessions
        setSessions(newSessions);
  
        // Update staff object with new sessions
        const updatedStaff = {
          ...staff,
          sessions: newSessions,
        };
        setStaff(updatedStaff);
  
        try {
          // Update the server with the modified staff object
          const response = await fetch(
            `${API_URL}/updatestaff/${staff._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedStaff),
            }
          );
  
          const data = await response.json();
          //console.log(data);
  
          if (data.modifiedCount) {
            Swal.fire({
              title: "Session Deleted!",
              icon: "success",
              draggable: true,
            });
          } else {
            notifyFailed("Failed to delete the session on the server.");
          }
        } catch (error) {
          console.error("Error processing delete:", error);
          notifyFailed("Error processing delete.");
        }
      }
    });
  };
  
  




  const handleKeyUp = e => {
    const text = e.target.value
    setMessageText(text)
  }
  const renderContent = () => {
    switch (activeTab) {


      case 'sessions':
        return <div><h2 className='text-2xl font-bold mb-4 text-center mt-5'>Active Session</h2>
          {session.date ? (
            <div className='bg-green-300 border border-gray-300 rounded-lg shadow-lg p-4 mb-6'>
              <div className='text-center border-b border-gray-200 pb-4 mb-4'>
                <h2 className='text-xl font-bold text-gray-800'>Duration</h2>
                <p className='text-lg text-gray-600'>
                  {activeHr}h {activeMin}m
                </p>
                <p className='text-sm text-gray-500'>Date: {session.date}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-blue-100 rounded-lg p-4'>
                  <h3 className='text-lg font-bold text-blue-800 mb-2'>Entry Details</h3>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>Time:</span> {session.inHour}:{session.inMin}
                  </p>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>Place:</span> {session.inPlace || 'N/A'}
                  </p>
                </div>
                <div className='bg-red-100 rounded-lg p-4'>
                  <h3 className='text-lg font-bold text-red-800 mb-2'>Exit Details</h3>
                  {session.out ? (
                    <>
                      <p className='text-gray-700'>
                        <span className='font-semibold'>Time:</span> {session.outHour}:{session.outMin}
                      </p>
                      <p className='text-gray-700'>
                        <span className='font-semibold'>Reason:</span> {session.outReason || 'N/A'}
                      </p>
                    </>
                  ) : (
                    <p className='text-gray-700'>Not Checked Out</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className='border-2 border-sky-500 rounded-lg text-center w-full py-3'>
              No Active Session
            </div>
          )}
          <h2 className='text-2xl font-bold mb-4 text-center mt-5'>Past Sessions</h2>
          <div className='mt-2 max-h-screen overflow-y-auto'>
            {first100.map((sess, index) => (
              sess !== session && <SessionCard key={index} session={sess} del={handleDelete} edit={handleEdit} />
            ))}
          </div>
        </div>;
      case 'workHours':
        return <div><StaffAttendanceCalendar staff={staff}></StaffAttendanceCalendar></div>;
      // case 'monthlyPayments':
      //   return <div><MonthlyPaymentsComponent payments={staff.payments} staff={staff}></MonthlyPaymentsComponent></div>;

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div>
      {staff ? <div className="container mx-auto p-4">
        <div className='flex justify-between'>
          <div>
            <h1 className="text-2xl lg:text-3xl text-sky-800 font-bold mb-2">{staff.name}</h1>
            <h2 className="text-xl mb-4"> {staff.role}</h2>
          </div>
          <div className='flex gap-3'>
            <div className='w-24 lg:w-32  mb-4 '>
              <img className='rounded-lg' src={`${staff.photo ? staff.photo : '/profile.jpg'}`} alt="Image" />
            </div>
            {/* <div className='text-2xl flex flex-col gap-1 pt-3 text-sky-800'>
              <Link to={`/staff/update/${staff.id}`}><FaUserEdit /></Link>

            </div> */}
          </div>
        </div>
        <div className="flex gap-2 text-sm overflow-x-auto mb-5">



          <button
            onClick={() => setActiveTab('workHours')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'workHours' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
          >
            Daily Work Hours
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'sessions' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
          >
            Sessions
          </button>
          {/* <button
            onClick={() => setActiveTab('monthlyPayments')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'monthlyPayments' ? 'bg-sky-600 text-white' : 'bg-gray-200'} rounded hover:bg-sky-700`}
          >
            Monthly Payments
          </button> */}

        </div>
        <div>
          {renderContent()}
        </div>
        {navigate ? <Navigate to={`/`}></Navigate> : <></>}


      </div> :
        <div className="flex mt-10 justify-center  bg-gray-100">
          <div className="flex flex-col items-center">
            <FaSpinner className="text-blue-500 animate-spin text-6xl mb-4" />
            <p className="text-lg font-semibold text-gray-700">Loading, please wait...</p>
          </div>
        </div>
      }


      {/* edit korar modal */}
      <dialog id="my_modal_1" className="modal ">
        <div className="modal-box ">
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
            </form>
          </div>
          <form className='mx-auto  w-full' onSubmit={handleEditSession} >


            {/* students part */}
            <div className='flex  flex-col '>
              <h1 className='font-bold text-center underline mb-2 text-xl '>Edit Timing </h1>
              <div className='grid grid-cols-1   gap-3'>


                <div className='w-full flex gap-2'>
                  <div className='w-1/2'>
                    <p className='font-semibold'>Entry Hour  </p>
                    <select
                      value={entryHour}
                      onChange={(e) => setEntryHour(Number(e.target.value))}
                      name='inHour'

                      className="select text-lg font-semibold  select-info w-full"
                    >

                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} am
                        </option>
                      ))}
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1 + 12} value={i + 1 + 12}>
                          {i + 1} pm
                        </option>
                      ))}
                    </select>

                  </div>
                  <div className='w-1/2'>
                    <p className='font-semibold'>Entry Minute  </p>
                    <select
                      value={entryMinute}
                      onChange={(e) => setEntryMinute(Number(e.target.value))}
                      name='inMin'

                      className="select text-lg font-semibold  select-info w-full"
                    >
                      <option key={0} value={0}>
                        {0} min
                      </option>
                      {[...Array(59)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} min
                        </option>
                      ))}

                    </select>

                  </div>
                </div>
                <div className='w-full flex gap-2'>
                  <div className='w-1/2'>
                    <p className='font-semibold'>Exit Hour  </p>
                    <select
                      value={exitHour}
                      onChange={(e) => setExitHour(Number(e.target.value))}
                      name='inHour'

                      className="select text-lg font-semibold  select-info w-full"
                    >

                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} am
                        </option>
                      ))}
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1 + 12} value={i + 1 + 12}>
                          {i + 1} pm
                        </option>
                      ))}
                    </select>

                  </div>
                  <div className='w-1/2'>
                    <p className='font-semibold'>Exit Minute  </p>
                    <select
                      value={exitMinute}
                      onChange={(e) => setExitMinute(Number(e.target.value))}
                      name='inMin'

                      className="select text-lg font-semibold  select-info w-full"
                    >
                      <option key={0} value={0}>
                        {0} min
                      </option>
                      {[...Array(59)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} min
                        </option>
                      ))}

                    </select>

                  </div>
                </div>



              </div>
            </div>


            <div className='flex mt-10 flex-col lg:flex-row'>
              <h1 className='font-bold text-lg lg:w-1/4'></h1>
              <div className='lg:w-2/3 text-center'>
                <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl h-11   btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Confirm"}`} />
                <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
              </div>
            </div>

          </form>










        </div>
      </dialog>
    </div>
  );
};

export default StaffDetails;
