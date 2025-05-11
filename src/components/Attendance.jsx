import { AuthContext } from '../Provider';
import React, { useContext, useState } from 'react';
import { useLoaderData } from 'react-router-dom';


import AttendanceCalendar from './AttendanceComponent'; // keep as it is
import TakeAttendance from './TakeAttendance';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // import styles for the calendar

const Attendance = ({ students }) => {

  const { notifySuccess, notifyFailed } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [pickedDate, setPickedDate] = useState(new Date()); // default date is today
  const [showCalendar, setShowCalendar] = useState(false); // to toggle calendar visibility

  // Convert picked date to DD-MM-YYYY format without leading zeros
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate(); // No leading zero
    const month = d.getMonth() + 1; // No leading zero
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Input handle
  const handleIdInput = async (event) => {
    event.preventDefault();
    setLoading(true);
    const id = event.target.id.value;
    const student = students.find(st => st.id == id);

    if (student?.id) {
      setStudent(student);
      setLoading(false);
    } else {


      notifyFailed("No student Found !");
      setStudent(null);
      setLoading(false);

    }
  };

  // Handle submitting the attendance
  const handleAttendanceSubmit = () => {
    // Pass the selected date to TakeAttendance when "Next" is clicked
    if (student) {
      // This will call TakeAttendance with the currently selected student and date
      return <TakeAttendance student={student} today={formatDate(pickedDate)} />;
    }
    return null;
  };

  return (
    <div>
      <form className='mx-auto w-full' onSubmit={handleIdInput}>
        <div className='flex mt-2 flex-col lg:flex-row'>

          <div className='grid grid-cols-2 lg:w-full gap-3'>
            <div>
              <p className='font-semibold'>Roll Number <span className='text-red-700'>*</span> </p>
              <input
                required
                name='id'
                type="number"
                onWheel={(e) => e.target.blur()}
                className="input input-bordered input-info w-full" />
            </div>
            <div className="relative">
              <p className='font-semibold'>Date</p>
              <input
                type="text"
                value={formatDate(pickedDate)}
                readOnly
                className="input input-bordered input-info w-full cursor-pointer"
                onClick={() => setShowCalendar(!showCalendar)}
              />

              {showCalendar && (
                <div className="absolute z-10 bg-white border rounded-md shadow-lg">
                  <Calendar
                    onChange={setPickedDate}
                    value={pickedDate}
                    onClickDay={() => setShowCalendar(false)} // close calendar on date select
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex mt-2 flex-col lg:flex-row'>

          <div className='lg:w-full text-center'>
            <input className="font-semibold w-full bg-blue-100 border-2 rounded-xl h-11 btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Next"}`} />
            <p className={`flex items-center gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}> <span className="loading loading-dots loading-sm"></span> Loading</p>
          </div>
        </div>
      </form>

      {student && handleAttendanceSubmit()} {/* Call the attendance submit logic here */}

    </div>
  );
};

export default Attendance;
