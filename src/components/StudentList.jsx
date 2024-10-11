import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    <div>
      <h1 className="text-2xl font-bold mb-4">Students List</h1>
      <ul>
        {currentStudents.map((student, index) => (
          <Link key={index} to={`/students/${student.id}`}><li key={student.id} className="border-b flex border hover:bg-gray-300 font-semibold text-sm items-center lg:text-xl border-sky-600 rounded-xl mb-1 px-4 py-2">
          <span className='bg-sky-600 py-1 mr-5 text-sm w-24 text-center text-white rounded-lg px-2'>{student.id}</span>  <span className='text-sky-600 '>{student.name}</span>
        </li></Link>
        ))}
      </ul>
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-sky-600 text-white rounded-l hover:bg-sky-700 disabled:bg-gray-400"
        >
          Previous
        </button>
        <span className="px-4 py-2 border-t border-b border-sky-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-sky-600 text-white rounded-r hover:bg-sky-700 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StudentsList;
