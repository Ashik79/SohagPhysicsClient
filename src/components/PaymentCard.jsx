import React, { useContext } from 'react';
import { AuthContext } from '../Provider';
import { TbCurrencyTaka } from "react-icons/tb";

const PaymentCard = ({ payment }) => {
  const { type, pmonth, pyear, pamount, payDate, ptaken } = payment;
  const {getMonth}=useContext(AuthContext)

  return (
    <div className="bg-sky-600 text-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{type} Payment</h2>
          <p className="">Date: {payDate}</p>
          <p className="">Taken by: <span className='font-bold'>{ptaken}</span></p>
        </div>
        <div>
          <p className="text-2xl font-bold flex gap-1 items-center">{pamount} <TbCurrencyTaka /></p>
          <p className="text-2xl font-semibold">{getMonth(pmonth) } <span className='text-lg font-semibold'> {pyear}</span></p>
        </div>
      </div>
      
    </div>
  );
};

export default PaymentCard;
