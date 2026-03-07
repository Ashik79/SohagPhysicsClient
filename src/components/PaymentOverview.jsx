import React, { useContext, useState } from 'react';
import { AuthContext } from '../Provider';
import { TbCurrencyTaka } from "react-icons/tb";
import { useLoaderData } from 'react-router-dom';
import { FiDownload, FiFilter, FiCalendar, FiUser, FiPieChart, FiTrendingUp, FiCheckCircle, FiBookOpen, FiMoreHorizontal } from "react-icons/fi";
import { motion, AnimatePresence } from 'framer-motion';

const PaymentComponent = () => {

  const { date, month, year, role, notifyFailed, loggedUser } = useContext(AuthContext)
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
    const filterData = {
      month, day, year, taker
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterData)
    })
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
        notifyFailed("Failed to fetch payments")
      })
  };

  const handleDownload = async (type) => {
    const array = data.paymentArray.filter(payment => payment.type == type)
    if (type == 'Monthly') setmLoading(true)
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

    try {
      const downloadResponse = await fetch(`${import.meta.env.VITE_API_URL}/download/overview`, {
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
        a.download = `${type}_payments.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Failed to download results');
      }
    } catch (err) {
      console.log(err)
      notifyFailed("Something went wrong!")
    } finally {
      setmLoading(false)
      setpLoading(false)
      setoLoading(false)
    }
  }

  const SummaryCard = ({ title, icon: Icon, mainValue, subItems, colorClass, downloadHandler, dlLoading }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-8">
        <div className={`p-4 rounded-2xl ${colorClass} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        {downloadHandler && (
          <button
            onClick={downloadHandler}
            disabled={dlLoading}
            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-cyan-600 hover:border-cyan-100 transition-all shadow-sm"
          >
            {dlLoading ? <span className="loading loading-spinner loading-xs"></span> : <FiDownload size={18} />}
          </button>
        )}
      </div>

      <h3 className="text-slate-500 font-black text-xs uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-3xl font-black text-slate-800 flex items-center gap-1 mb-8">
        {mainValue} <TbCurrencyTaka className="text-slate-400" />
      </p>

      <div className="space-y-4 mt-auto">
        {subItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</span>
            <div className="flex items-center gap-1 font-bold text-slate-700">
              {item.value} {item.showTaka && <TbCurrencyTaka size={14} className="text-slate-400" />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="pb-20">
      {/* Header Area */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <FiTrendingUp size={24} />
        </div>
        <h1 className='font-black text-2xl lg:text-3xl text-slate-800 tracking-tight'>Payment Overview</h1>
      </div>

      {/* Filter Form */}
      <form onSubmit={fetchPayments} className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-12">
        <div className="flex items-center gap-2 mb-8 text-slate-800">
          <FiFilter className="text-cyan-500" />
          <h2 className="font-black text-lg">Quick Filters</h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              <FiCalendar size={12} /> Day
            </label>
            <select defaultValue={date} name='day' className="input-premium w-full pt-3 h-12">
              <option value="">All Days</option>
              {[...Array(31)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              <FiCalendar size={12} /> Month
            </label>
            <select defaultValue={month} name='month' className="input-premium w-full pt-3 h-12">
              <option value="">All Months</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              <FiCalendar size={12} /> Year
            </label>
            <select name='year' defaultValue={year} className="input-premium w-full pt-3 h-12">
              <option value={""}>All Years</option>
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              <FiUser size={12} /> Taken By
            </label>
            <select name='taker' className="input-premium w-full pt-3 h-12">
              {role === 'CEO' ? (
                <>
                  <option value={""}>Everyone</option>
                  {userNames.map((name, i) => (<option key={i} value={name}>{name}</option>))}
                </>
              ) : (
                <option value={loggedUser}>{loggedUser}</option>
              )}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading} className="btn-premium px-12 h-12 font-bold flex items-center gap-2">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <><FiTrendingUp /> Calculate Analytics</>}
          </button>
        </div>
      </form>

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {data ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            {/* Grand Total */}
            <div className="text-center bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <h2 className='text-cyan-400 font-black text-xs uppercase tracking-[0.3em] mb-4'>Total Revenue Received</h2>
                <div className='flex items-center justify-center gap-2'>
                  <span className="text-5xl lg:text-7xl font-black text-white tracking-tighter">{data.total}</span>
                  <TbCurrencyTaka className="text-cyan-500 text-4xl lg:text-6xl" />
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              <SummaryCard
                title="Monthly Subscriptions"
                icon={FiCalendar}
                mainValue={data.monthly}
                colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
                dlLoading={mloading}
                downloadHandler={() => handleDownload("Monthly")}
                subItems={[
                  { label: "Total Transactions", value: data.monthlyCount, showTaka: false },
                  { label: "Average per student", value: Math.round(data.monthly / (data.monthlyCount || 1)), showTaka: true }
                ]}
              />

              <SummaryCard
                title="Academic Fees"
                icon={FiBookOpen}
                mainValue={data.exam + data.note}
                colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
                dlLoading={ploading}
                downloadHandler={() => handleDownload("Exam Fee")}
                subItems={[
                  { label: "Exam Fees", value: data.exam, showTaka: true },
                  { label: "Note Fees", value: data.note, showTaka: true },
                  { label: "Admissions", value: data.admissionCount, showTaka: false }
                ]}
              />

              <SummaryCard
                title="Other Revenue"
                icon={FiMoreHorizontal}
                mainValue={data.other}
                colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                dlLoading={oloading}
                downloadHandler={() => handleDownload("other")}
                subItems={[
                  { label: "Miscellaneous", value: data.other, showTaka: true }
                ]}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200"
          >
            <div className="inline-flex p-6 bg-white rounded-3xl text-slate-300 mb-4 shadow-sm">
              <FiPieChart size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-400">No Analytics to display</h3>
            <p className="text-slate-400 mt-2">Adjust your filters and click calculate to see financial insights.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentComponent;
