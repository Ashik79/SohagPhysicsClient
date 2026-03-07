import API_URL from '../apiConfig';
import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Provider';
import { FiCreditCard, FiSearch, FiArrowRight, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Payment = () => {
  const { notifyFailed, role } = useContext(AuthContext)
  const [id, setId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState({})

  const handleIdInput = async (event) => {
    event.preventDefault();
    setLoading(true)
    const id = event.target.id.value;

    try {
      const res = await fetch(`${API_URL}/student/${id}`)
      const studentData = await res.json()
      if (studentData.id) {
        setId(id)
        setStudent(studentData)
      } else {
        notifyFailed("No student found with this Roll Number!")
      }
    } catch (error) {
      notifyFailed("Something went wrong!")
    } finally {
      setLoading(false)
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto py-12 px-4"
    >
      <div className="text-center mb-10">
        <div className="inline-flex p-4 bg-cyan-100 rounded-3xl text-cyan-600 mb-4 shadow-inner">
          <FiCreditCard size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Payment</h1>
        <p className="text-slate-500 mt-2">Enter the roll number to process student fees.</p>
      </div>

      <form
        className='bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-slate-200/50 space-y-8'
        onSubmit={handleIdInput}
      >
        <div className="space-y-3">
          <label className='flex items-center gap-2 font-bold text-sm text-slate-700 uppercase tracking-wider ml-1'>
            Roll Number <span className='text-red-500'>*</span>
          </label>
          <div className="relative group">
            <input
              required
              name='id'
              type="number"
              placeholder="e.g. 23001"
              onWheel={(e) => e.target.blur()}
              className="input-premium w-full px-6 h-16 text-xl font-bold tracking-widest"
            />
          </div>
        </div>

        <button
          type='submit'
          disabled={loading}
          className="btn-premium w-full h-16 flex items-center justify-center gap-3 text-lg font-bold group"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner"></span>
              <span>Verifying...</span>
            </div>
          ) : (
            <>
              <span>Continue to Payment</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span className="h-px w-8 bg-slate-200"></span>
        Secure Transaction
        <span className="h-px w-8 bg-slate-200"></span>
      </div>

      {id && <Navigate to={`/payment/${id}`} state={student}></Navigate>}
    </motion.div>
  );
};

export default Payment;
