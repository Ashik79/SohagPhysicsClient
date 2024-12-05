import React, { useContext } from 'react';
import { AuthContext } from '../Provider';
import { TbCurrencyTaka } from "react-icons/tb";
import { IoPrintSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
const PaymentCard = ({ payment }) => {
  const { type, pmonth, pyear, pamount, payDate, ptaken } = payment;
  const {getMonth}=useContext(AuthContext)

  const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/print-receipt', { state: { payment } });
    };

  return (
    <div className="bg-sky-600 text-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{type} Payment</h2>
          <p className="">Date: {payDate}</p>
          <p className="">Taken by: <span className='font-bold'>{ptaken}</span></p>
        </div>
        <div className='flex gap-3  w-1/2 lg:w-1/3 items-center justify-between pr-2 flex-col lg:flex-row md:flex-row'>
          <div className='text-start'>
          <p className="lg:text-2xl text-xl font-bold flex gap-1 items-center">{pamount} <TbCurrencyTaka /></p>
          <p className="lg:text-2xl text-xl font-semibold">{getMonth(pmonth) } <span className='text-lg font-semibold'> {pyear}</span></p>
          </div>
          <button onClick={()=>handleButtonClick()} className='font-semibold py-1 px-5 border-2 border-white rounded-lg hover:bg-gray-600 flex gap-1 items-center w-full justify-center lg:w-1/3'><IoPrintSharp /> Print</button>
        </div>
        
      </div>
      
    </div>
  );
};

export default PaymentCard;
