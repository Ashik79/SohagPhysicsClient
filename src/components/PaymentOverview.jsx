import React, { useContext, useState } from 'react';
import { AuthContext } from '../Provider';
import { TbCurrencyTaka } from "react-icons/tb";
import { useLoaderData } from 'react-router-dom';
import { FaDownload } from "react-icons/fa";

const PaymentComponent = () => {

  const { date, month, year, role, notifyFailed,loggedUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [mloading, setmLoading] = useState(false)
  const [ploading, setpLoading] = useState(false)
  const [oloading, setoLoading] = useState(false)

  const userNames = useLoaderData()
  const [data, setData] = useState(null)

  const fetchPayments = async (e) => {
    e.preventDefault();
    setLoading(true)
    const month = e.target.month.value
    const day = e.target.day.value
    const year = e.target.year.value
    const taker = e.target.taker.value
    const data = {
      month, day, year, taker
    }
    console.log(data)
    fetch('https://spoffice-server.vercel.app/api/payments', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setData(data)

        setLoading(false)
      })
  };

  const handleDownload = async (type) => {
    
    const array = data.paymentArray.filter(payment => payment.type == type)
    if (type == 'Monthly'){
      setmLoading(true)
    }
    if (type == 'Exam Fee') {
      setpLoading(true)
      data.paymentArray.map(payment => {
        if (payment.type == 'Note Fee') {
          array.push(payment)
        }
      })
    }
    else if (type == 'other') {
      setoLoading(true)
      data.paymentArray.map(payment => {
        if (payment.type != 'Note Fee' && payment.type != 'Exam Fee' && payment.type != 'Monthly') {
          array.push(payment)
        }
      })
    }
    console.log(array)
    try {

      const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/overview', {

        method: 'POST',
        headers: {
          'content-type': 'application/json'

        },
        body: JSON.stringify(array)
      })

      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setLoading(false)
        setpLoading(false)
        setmLoading(false)
        setoLoading(false)
      } else {
        console.error('Failed to download results');
        setLoading(false)
      }
    }
    catch (err) {
      console.log(err)
      setLoading(false)
      notifyFailed("Something went wrong!")
    }
  }
  return (
    <div className="container mx-auto p-4">
      <form onSubmit={fetchPayments} className="mb-4 grid ">
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
          <div className="mb-4">
            <label className="block text-gray-700  font-bold mb-2">Day:</label>
            <select
              defaultValue={date}
              name='day'
              className="block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <option value="">All</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 ">
            <label className="block text-gray-700  font-bold mb-2">Month:</label>
            <select
              defaultValue={month}
              name='month'

              className="block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <option value="">All</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div className="mb-4 w-full">
            <label className="block text-gray-700  font-bold mb-2">Year:</label>
            <select
              name='year'
              defaultValue={year}
              className="p-2 border border-gray-300 rounded w-full"
            > <option value={""}>All</option>
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>


          {
            role == 'CEO' ? <div className="mb-4">
              <label className="block text-gray-700  font-bold mb-2">Taken by :</label>
              <select

                name='taker'
                className="block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option value={""}>All</option>
                {userNames.map((name, i) => (
                  <option key={i + 1} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div> : <div className="mb-4">
              <label className="block text-gray-700  font-bold mb-2">Taken by :</label>
              <select

                name='taker'
                className="block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              >
                <option value={loggedUser}>{loggedUser}</option>
                
              </select>
            </div>
          }
        </div>
        <button
          type="submit"
          className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? "" : "Submit"}
        </button>
        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
      </form>

      {data ? <>
        <h1 className='text-center text-base flex gap-2 items-center justify-center my-5 lg:text-2xl font-semibold'>Total Amount Recieved : <span className='font-bold flex items-center gap-1 text-lg lg:text-3xl text-sky-800'> {data.total} <TbCurrencyTaka /></span></h1>
        <div className='flex flex-col font-semibold text-base lg:text-xl lg:flex-row w-full gap-4 text-center  justify-between'>
          <div className='w-full py-2 flex flex-col items-center justify-center gap-3  lg:w-1/4 border-2 border-sky-900 rounded-xl shadow-xl bg-gray-200'>
            <p>Monthly Payments : {data.monthlyCount}</p>
            <p className='flex items-center gap-2'> Total : <span className='font-bold flex items-center gap-1  text-sky-800'>{data.monthly} <TbCurrencyTaka /></span></p>
            <button className='text-blue-700' onClick={() => handleDownload("Monthly")}>{!mloading?<FaDownload />:""}</button>
            <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${mloading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> </p>
          </div>
          <div className='w-full py-2 flex flex-col border-2 border-sky-900 rounded-xl shadow-xl bg-gray-200   justify-center gap-3  px-2  lg:w-1/2'>
            <p>Admission: {data.admissionCount}</p>
            <div className='flex flex-col items-center '>
              <p className='lg:w-1/2 flex items-center gap-2'>Exam Fee : <span className='font-bold flex items-center gap-1  text-sky-800'>{data.exam} <TbCurrencyTaka /></span></p>
              <p className='lg:w-1/2 flex items-center gap-2'>Note Fee : <span className='font-bold  flex items-center gap-1 text-sky-800'>{data.note} <TbCurrencyTaka /></span></p>
              <button className='text-blue-700' onClick={() => handleDownload("Exam Fee")}>{!ploading?<FaDownload />:""}</button>
              <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${ploading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> </p>

            </div>
          </div>
          <div className='w-full py-2 flex flex-col justify-center border-2 border-sky-900 rounded-xl shadow-xl bg-gray-200 items-center  gap-3 lg:w-1/4'>
            <p>Other : <span className='font-bold flex items-center gap-1  text-sky-800'>{data.other} <TbCurrencyTaka /></span></p>
            <button className='text-blue-700' onClick={() => handleDownload("other")}>{!oloading?<FaDownload />:""}</button>
            <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${oloading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> </p>
          </div>
        </div></> : <></>}
    </div>
  );
};

export default PaymentComponent;
