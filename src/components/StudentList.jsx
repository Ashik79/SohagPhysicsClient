import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiUser, FiArrowRight } from 'react-icons/fi';

const StudentsList = ({ students }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
  };

  const handleNext = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    setCurrentPage(newPage);
  };

  const currentStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Search Results</h3>
        <span className="text-xs font-bold text-slate-400">Page {currentPage} of {totalPages}</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {currentStudents.map((student, index) => (
            <motion.div
              layout
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/students/${student.id}`}
                className="group flex items-center justify-between p-4 bg-white/50 backdrop-blur-md border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    #{student.id}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-700 group-hover:text-indigo-700 transition-colors">{student.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <FiUser className="text-xs" /> Student Profile
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <FiArrowRight />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="p-3 bg-white border border-slate-100 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
          >
            <FiChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300'}`}
              >
                {i + 1}
              </button>
            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-3 bg-white border border-slate-100 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
