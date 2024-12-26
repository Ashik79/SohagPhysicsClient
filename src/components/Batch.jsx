import { AuthContext } from '../Provider';
import React, { useContext, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';


import AttendanceCalendar from './AttendanceComponent'; // keep as it is
import TakeAttendance from './TakeAttendance';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // import styles for the calendar
import BatchCard from './BatchCard';

const Batch = () => {
  const students = useLoaderData();
  const { notifySuccess, notifyFailed } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [pickedDate, setPickedDate] = useState(new Date()); // default date is today
  const [showCalendar, setShowCalendar] = useState(false); // to toggle calendar visibility

  const [batchData, setBatchData] = useState([
    {
      name: "Sat 1",
      vakka:'শনি ৭টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 2",
      vakka:'শনি ৮টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 3",
      vakka:'শনি ৯টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 4",
      vakka:'শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 5",
      vakka:'শনি ১১টা',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 6",
      vakka:'শনি ২টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 7",
      vakka:'শনি ৩টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 8",
      vakka:'শনি ৪টা (HSC 25)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 9",
      vakka:'শনি ৫টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 10",
      vakka:'শনি ৬.১৫ টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 11",
      vakka:'শনি ৭.১৫ টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    
    {
      name: "Sun 1",
      vakka:'রবি ৭টা (HSC 25)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 2",
      vakka:'রবি ৮টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 3",
      vakka:'রবি ৯টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 4",
      vakka:'রবি ১০টা (Nine & Ten combined)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 5",
      vakka:'রবি ১১টা',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 6",
      vakka:'রবি ২টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 7",
      vakka:'রবি ৩টা (HSC 25)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 8",
      vakka:'রবি ৪টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 9",
      vakka:'রবি ৫টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 10",
      vakka:'রবি ৬টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 11",
      vakka:'রবি ৭টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    
  ])


  // Convert picked date to DD-MM-YYYY format without leading zeros
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate(); // No leading zero
    const month = d.getMonth() + 1; // No leading zero
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

useEffect(()=>{
  const tempBatchData = [
    {
      name: "Sat 1",
      vakka:'শনি ৭টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 2",
      vakka:'শনি ৮টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 3",
      vakka:'শনি ৯টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 4",
      vakka:'শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 5",
      vakka:'শনি ১১টা',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 6",
      vakka:'শনি ২টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 7",
      vakka:'শনি ৩টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 8",
      vakka:'শনি ৪টা (HSC 25)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 9",
      vakka:'শনি ৫টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 10",
      vakka:'শনি ৬.১৫ টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sat 11",
      vakka:'শনি ৭.১৫ টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    
    {
      name: "Sun 1",
      vakka:'রবি ৭টা (HSC 25)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 2",
      vakka:'রবি ৮টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 3",
      vakka:'রবি ৯টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 4",
      vakka:'রবি ১০টা (Nine & Ten combined)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 5",
      vakka:'রবি ১১টা',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 6",
      vakka:'রবি ২টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 7",
      vakka:'রবি ৩টা (HSC 25)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 8",
      vakka:'রবি ৪টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 9",
      vakka:'রবি ৫টা (HSC 26)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 10",
      vakka:'রবি ৬টা (নিউ নাইন SSC 27 - HSC 29)',
      total: [],
      present: [],absent: [],
    },
    {
      name: "Sun 11",
      vakka:'রবি ৭টা (নিউ টেন SSC 26 - HSC 28)',
      total: [],
      present: [],absent: [],
    },
    
  ]
  tempBatchData.forEach(batch => {
    students.forEach(stdnt => {

      if (stdnt.batch === batch.name && Number(stdnt.session) === 2025) {
        batch.total.push(stdnt);
        if (stdnt.attendances.some(attendance => attendance.date === formatDate(pickedDate))) {
          batch.present.push(stdnt);
        }
        else batch.absent.push(stdnt)
      }
    });
  });
  setBatchData(tempBatchData)
},[students])

  // Input handle
  const handleIdInput = async (event) => {
    event.preventDefault();
    const session = Number(event.target.session.value); // Ensure session is a number
    console.log("Formatted Date:", formatDate(pickedDate));
    console.log("Session Type:", typeof (session), "Session Value:", session);
    const tempBatchData = [
      {
        name: "Sat 1",
        vakka:'শনি ৭টা (নিউ টেন SSC 26 - HSC 28)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 2",
        vakka:'শনি ৮টা (নিউ নাইন SSC 27 - HSC 29)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 3",
        vakka:'শনি ৯টা (নিউ টেন SSC 26 - HSC 28)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 4",
        vakka:'শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 5",
        vakka:'শনি ১১টা',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 6",
        vakka:'শনি ২টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 7",
        vakka:'শনি ৩টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 8",
        vakka:'শনি ৪টা (HSC 25)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 9",
        vakka:'শনি ৫টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 10",
        vakka:'শনি ৬.১৫ টা (নিউ নাইন SSC 27 - HSC 29)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sat 11",
        vakka:'শনি ৭.১৫ টা (নিউ টেন SSC 26 - HSC 28)',
        total: [],
        present: [],absent: [],
      },
      
      {
        name: "Sun 1",
        vakka:'রবি ৭টা (HSC 25)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 2",
        vakka:'রবি ৮টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 3",
        vakka:'রবি ৯টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 4",
        vakka:'রবি ১০টা (Nine & Ten combined)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 5",
        vakka:'রবি ১১টা',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 6",
        vakka:'রবি ২টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 7",
        vakka:'রবি ৩টা (HSC 25)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 8",
        vakka:'রবি ৪টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 9",
        vakka:'রবি ৫টা (HSC 26)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 10",
        vakka:'রবি ৬টা (নিউ নাইন SSC 27 - HSC 29)',
        total: [],
        present: [],absent: [],
      },
      {
        name: "Sun 11",
        vakka:'রবি ৭টা (নিউ টেন SSC 26 - HSC 28)',
        total: [],
        present: [],absent: [],
      },
      
    ]
    tempBatchData.forEach(batch => {
      students.forEach(stdnt => {

        if (stdnt.batch === batch.name && Number(stdnt.session) === session) {
          batch.total.push(stdnt);
          if (stdnt.attendances.some(attendance => attendance.date === formatDate(pickedDate))) {
            batch.present.push(stdnt);
          }
          else batch.absent.push(stdnt)
          
        }
      });
    });
    setBatchData(tempBatchData)
    console.log("Batch Data after Attendance Check:", batchData);
  };




  return (
    <div>
      <form className='mx-auto w-full' onSubmit={handleIdInput}>
        <div className='flex mt-2 flex-col lg:flex-row'>
          <h1 className='font-bold text-lg lg:w-1/4'>Take Attendance :</h1>
          <div className='grid grid-cols-2 lg:w-2/3 gap-3'>

            <div>
              <p className='font-semibold'>Session <span className='text-red-700'>*</span> </p>
              <select name='session' className="select text-lg font-semibold  select-info w-full ">



                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
                <option>2028</option>
                <option>2029</option>
                <option>2030</option>


              </select>
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
          <h1 className='font-bold text-lg lg:w-1/4'></h1>
          <div className='lg:w-2/3 text-center'>
            <input className="font-semibold w-full bg-blue-100 border-2 rounded-xl h-11 btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Next"}`} />
            <p className={`flex items-center gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}> <span className="loading loading-dots loading-sm"></span> Loading</p>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap justify-center gap-4 p-4">
        {batchData.map((batch, index) => (
          <BatchCard key={index} batch={batch} />
        ))}
      </div>

    </div>
  );
};

export default Batch;
