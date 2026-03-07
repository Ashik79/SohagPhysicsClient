import React, { useState } from 'react';
import { FiCalendar, FiCheckCircle, FiClock, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MonthlyPaymentsComponent = ({ payments, student }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getPaymentForMonth = (month) => {
    return payments.find(payment =>
      payment.pyear == selectedYear && payment.pmonth == month && payment.type == 'Monthly'
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiCreditCard size={18} />
          </div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Payment History</h3>
        </div>
        <select
          onChange={handleYearChange}
          value={selectedYear}
          className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
        >
          {[2023, 2024, 2025, 2026, 2027, 2028, 2029].map(year => (
            <option key={year} value={year}>{year} Academic Year</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {months.map((month, index) => {
          const payment = getPaymentForMonth(index + 1);
          const isPaid = !!payment;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              key={index}
              className={`relative overflow-hidden group p-5 rounded-[2rem] border-2 transition-all duration-500 
                ${isPaid
                  ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50'
                  : 'bg-rose-50/30 border-rose-100 hover:bg-rose-50/50'
                }
                backdrop-blur-sm shadow-md hover:shadow-lg
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>{month}</p>
                {isPaid ? <FiCheckCircle className="text-emerald-500" size={16} /> : <FiAlertCircle className="text-rose-400 opacity-50" size={16} />}
              </div>

              {isPaid ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-800 tracking-tighter">{payment.pamount}</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">à§³</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCalendar size={10} /> {payment.payDate}
                  </p>
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter mt-2">{payment.ptaken}</p>
                </div>
              ) : (
                <div className="flex flex-col justify-center h-full">
                  <p className="text-xs font-bold text-rose-300 uppercase tracking-widest italic">Pending...</p>
                  <p className="text-[9px] font-black text-rose-200 uppercase mt-1">No Record Found</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyPaymentsComponent;
