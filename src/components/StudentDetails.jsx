import API_URL from '../apiConfig';
import React, { useContext, useState, Suspense, lazy } from 'react';
import { Link, Navigate, useLoaderData } from 'react-router-dom';
import { AuthContext } from '../Provider';
import Swal from 'sweetalert2';

// Lazy load sub-components for better performance
const StudentDetailsPart = React.lazy(() => import('./StudentDetailsPart'));
const MonthlyPaymentsComponent = React.lazy(() => import('./MonthlyPaymentsComponent'));
const AttendanceCalendar = React.lazy(() => import('./AttendanceComponent'));
const ExamsList = React.lazy(() => import('./ExamsList'));
const ProgramList = React.lazy(() => import('./ProgramList'));
const DisplayNotes = React.lazy(() => import('./DisplayNotes'));
import { IoMdClose } from "react-icons/io";
import { FiEdit, FiMail, FiTrash2, FiInfo, FiLayers, FiFileText, FiCalendar, FiCheckSquare, FiCreditCard, FiDollarSign, FiArrowLeft, FiCamera, FiMapPin, FiPhone, FiChevronRight, FiX, FiSend, FiPrinter, FiUser, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PaymentCard = ({ payment }) => {
  const { type, pmonth, pyear, pamount, payDate, ptaken } = payment;
  const { getMonth } = useContext(AuthContext)
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/print-receipt', { state: { payment } });
  };

  const getStatusConfig = (type) => {
    switch (type) {
      case 'Monthly': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
      case 'Due': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
      case 'Note Fee': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  const config = getStatusConfig(type);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white/50 backdrop-blur-sm border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shadow-inner`}>
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>{type}</span>
              <h2 className="text-xl font-black text-slate-800 tracking-tight italic">Transaction Verified</h2>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <FiCalendar size={12} className="text-slate-300" /> {payDate}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-100 pl-4">
                <FiUser size={12} className="text-slate-300" /> {ptaken}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-8">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-3xl font-black text-slate-800 tracking-tighter">{pamount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">BDT</span>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">
              {getMonth(pmonth)} {pyear} Academic Cycle
            </p>
          </div>

          <button
            onClick={handleButtonClick}
            className="w-14 h-14 bg-white hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-lg active:scale-95"
            title="Generate Digital Receipt"
          >
            <FiPrinter size={22} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StudentDetails = () => {
  const { role, notifySuccess, notifyFailed } = useContext(AuthContext)
  const [navigate, setNavigate] = useState(false)
  const student = useLoaderData();
  const [activeTab, setActiveTab] = useState('details');
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
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Delete Student?',
      text: 'This action cannot be undone. All records will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-[2.5rem] p-8',
        confirmButton: 'rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-xs',
        cancelButton: 'rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-xs'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/student/delete/${student.id}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(data => {
            if (data.deletedCount) {
              notifySuccess("Student profile removed");
              setNavigate(true)
            }
          })
      }
    })
  }

  const otherPayments = student.payments.filter(p => p.type !== 'Monthly');
  const otherPaymentsReversed = [...otherPayments].reverse();

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return notifyFailed("Enter a message");

    setLoading(true);
    try {
      const response2 = await fetch('https://bulksmsbd.net/api/smsapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: 'CUOP72nJJHahM30djaQG',
          senderid: '8809617642567',
          number: student.phone,
          message: messageText
        }),
      });

      const result2 = await response2.json();
      if (result2.response_code === 202) {
        notifySuccess("SMS sent to student");
        setMessageText("");
        document.getElementById('sms_modal').close();
      } else {
        notifyFailed("SMS delivery failed");
      }
    } catch (err) {
      console.log(err);
      notifyFailed("Error sending SMS");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'Profile', icon: <FiInfo /> },
    { id: 'programs', label: 'Programs', icon: <FiLayers /> },
    { id: 'notes', label: 'Notes', icon: <FiFileText /> },
    { id: 'attendance', label: 'Attendance', icon: <FiCalendar /> },
    { id: 'results', label: 'Results', icon: <FiCheckSquare /> },
    { id: 'monthlyPayments', label: 'Monthly', icon: <FiCreditCard /> },
    { id: 'otherPayments', label: 'Others', icon: <FiDollarSign /> },
  ];

  const renderContent = () => {
    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/20 min-h-[400px]"
      >
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fetching Data...</p>
          </div>
        }>
          {(() => {
            switch (activeTab) {
              case 'details': return <StudentDetailsPart student={student} />;
              case 'programs': return <ProgramList student={student} />;
              case 'notes': return <DisplayNotes notes={student.notes || []} id={student.id} />;
              case 'results': return <ExamsList student={student} />;
              case 'attendance': return <AttendanceCalendar student={student} />;
              case 'monthlyPayments': return <MonthlyPaymentsComponent payments={student.payments} student={student} />;
              case 'otherPayments': return (
                <div className="space-y-4">
                  {otherPaymentsReversed.map((payment, index) => <PaymentCard key={index} payment={payment} />)}
                  {otherPaymentsReversed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <FiDollarSign size={48} className="mb-4 opacity-20" />
                      <p className="font-bold text-sm uppercase tracking-widest">No extra payments found</p>
                    </div>
                  )}
                </div>
              );
              default: return null;
            }
          })()}
        </Suspense>
      </motion.div>
    );
  };

  return (
    <div className="pb-32 container mx-auto px-4 max-w-6xl">
      {/* Premium Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden'
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
          <Link to="/students" className="hidden md:flex p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <FiArrowLeft size={20} />
          </Link>

          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-[2.5rem] blur-lg opacity-20 group-hover:opacity-40 transition duration-700"></div>
            <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-[2.2rem] overflow-hidden border-4 border-white shadow-2xl">
              <img
                className='w-full h-full object-cover'
                src={student.image || '/profile.jpg'}
                alt={student.name}
              />
              <button className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur rounded-xl text-indigo-600 shadow-lg hover:bg-white transition-all">
                <FiCamera size={16} />
              </button>
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 italic">#{student.id}</span>
              <span className="px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{student.batch}</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-800 tracking-tight mb-3 italic">{student.name} <span className="text-indigo-200">/ Profile</span></h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <FiPhone className="text-indigo-400" /> {student.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold border-l border-slate-100 pl-4">
                <FiMapPin className="text-indigo-400" /> {student.college || student.school || 'Unknown Location'}
              </div>
            </div>
          </div>
        </div>

        <div className='flex gap-3 relative z-10'>
          <Link
            to={`/student/update/${student.id}`}
            className="w-14 h-14 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-all group"
          >
            <FiEdit size={22} className="group-hover:scale-110 transition-transform" />
          </Link>
          <button
            onClick={() => document.getElementById('sms_modal').showModal()}
            className="w-14 h-14 bg-white hover:bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-all group"
          >
            <FiMail size={22} className="group-hover:scale-110 transition-transform" />
          </button>
          {role === 'CEO' && (
            <button
              onClick={handleDelete}
              className="w-14 h-14 bg-white hover:bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-all group"
            >
              <FiTrash2 size={22} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-6 py-4 whitespace-nowrap font-black text-xs uppercase tracking-widest rounded-3xl transition-all duration-500
              ${activeTab === tab.id
                ? 'bg-slate-800 text-white shadow-2xl shadow-slate-200 -translate-y-1'
                : 'bg-white text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm hover:shadow-md'}
            `}
          >
            <span className={`text-xl ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-300'}`}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {navigate && <Navigate to="/" />}

      {/* SMS Modal */}
      <dialog id="sms_modal" className="modal backdrop-blur-md">
        <div className="modal-box p-0 bg-white/90 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden max-w-lg">
          <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
            <div>
              <h3 className="font-black text-2xl tracking-tight">Direct Message</h3>
              <p className="text-indigo-100 text-xs mt-1 uppercase tracking-widest font-bold">Protocol: Bulk SMS Gateway</p>
            </div>
            <form method="dialog">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><FiX size={20} /></button>
            </form>
          </div>

          <div className="p-8 space-y-6">
            <div className='relative'>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className='w-full p-6 h-52 rounded-3xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-slate-700 font-bold leading-relaxed'
                placeholder="Compose your message here..."
              />
              <div className="absolute bottom-4 right-6 flex gap-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{messageText.length} Chars</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{getWordCount(messageText)} Words</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Encoding Mode</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-600 uppercase tracking-widest">
                    <input type="radio" value="bangla" checked={selectedOption === 'bangla'} onChange={handleOptionChange} className="radio radio-xs radio-primary" />
                    à¦¬à¦¾à¦‚লা
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-600 uppercase tracking-widest">
                    <input type="radio" value="english" checked={selectedOption === 'english'} onChange={handleOptionChange} className="radio radio-xs radio-primary" />
                    EN
                  </label>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-3xl text-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimate</p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-black text-indigo-400'>{(Math.ceil(messageText.length / divisor) * 0.35).toFixed(2)}</span>
                  <span className='text-[10px] font-black text-slate-400 uppercase'>TK</span>
                </div>
                <p className='text-[9px] font-black text-indigo-300/50 mt-1 uppercase tracking-widest italic'>Billing: SMS Parts {Math.ceil(messageText.length / divisor)}</p>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={loading}
              className='btn-premium w-full h-16 flex items-center justify-center gap-3 group text-lg'
            >
              {loading ? <span className="loading loading-spinner"></span> : <> <FiSend /> Dispatch Message</>}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default StudentDetails;
