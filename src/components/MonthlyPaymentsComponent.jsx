import React, { useState } from 'react';
import { TbCurrencyTaka } from "react-icons/tb";

const MonthlyPaymentsComponent = ({ payments, student }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // //console.log(student);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getPaymentForMonth = (month) => {
    return payments.find(payment =>
      payment.pyear == selectedYear && payment.pmonth == month && payment.type =='Monthly'
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <select
          onChange={handleYearChange}
          value={selectedYear}
          className="p-2 border border-gray-300 rounded"
        >
          {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {months.map((month, index) => {
          const payment = getPaymentForMonth(index + 1);
          const isPaid = !!payment;
          return (
            <div
              key={index}
              className={`flex flex-col  border-black border-2 py-1 rounded-lg items-center justify-center h-28 text-white font-bold ${
                isPaid ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <p>{month} </p>
              {isPaid && <>
                <span className=" ml-2 text-lg flex gap-1 items-center">{payment.pamount} <TbCurrencyTaka /></span>
                <p> {payment.ptaken}</p>
                <p> {payment.payDate}</p>
                
              </>}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyPaymentsComponent;
