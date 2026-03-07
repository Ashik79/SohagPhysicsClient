import React, { useContext } from 'react';
import { AuthContext } from '../Provider';
import { TbCurrencyTaka } from "react-icons/tb";
import { FiPrinter, FiCalendar, FiUser, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentCard = ({ payment }) => {
  const { type, pmonth, pyear, pamount, payDate, ptaken } = payment;
  const { getMonth } = useContext(AuthContext)
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/print-receipt', { state: { payment } });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Monthly': return 'from-cyan-500 to-blue-600';
      case 'Due': return 'from-amber-500 to-orange-600';
      case 'Note Fee': return 'from-purple-500 to-pink-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all mb-4 group"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTypeColor(type)} text-white shadow-lg shadow-slate-200`}>
            <FiCheckCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{type} Payment</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                <FiCalendar size={12} /> {payDate}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                <FiUser size={12} /> {ptaken}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-6 md:gap-10">
          <div className="text-right">
            <p className="text-2xl font-black text-slate-800 flex items-center justify-end gap-0.5">
              {pamount} <TbCurrencyTaka className="text-slate-400" size={20} />
            </p>
            <p className="text-xs font-black text-cyan-600 uppercase tracking-widest mt-0.5">
              {getMonth(pmonth)} {pyear}
            </p>
          </div>

          <button
            onClick={handleButtonClick}
            className="p-3 bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 rounded-2xl transition-all group-hover:scale-110 active:scale-95 border border-slate-100"
            title="Print Receipt"
          >
            <FiPrinter size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentCard;
