import React, { useState, useEffect } from 'react';
import { IoCloudDownloadOutline } from "react-icons/io5";

const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['All', 2023, 2024, 2025,2026,2027]; // Add 'All' to the years

const ExamsList = ({ student }) => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (student && student.exams) {
      setExams(student.exams);
    }
  }, [student]);

  const filteredExams = exams.filter(exam => {
    const [examMonth, , examYear] = exam.date.split(' ');

    const isMonthMatch = selectedMonth === 'All' || examMonth === months[selectedMonth];
    const isYearMatch = selectedYear === 'All' || parseInt(examYear, 10) === parseInt(selectedYear, 10);

    return isMonthMatch && isYearMatch;
  });

  const handleDownload = async () => {
    try {
      const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/results', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(filteredExams)
      });

      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Failed to download Results');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="mr-2 p-2 border">
          {months.map((month, index) => (
            <option key={index} value={index === 0 ? 'All' : index}>{month}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="p-2 border">
          {years.map((year, index) => (
            <option key={index} value={year === 'All' ? 'All' : year}>{year}</option>
          ))}
        </select>
        <button onClick={handleDownload} className='flex items-center -mt-1 justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1  w-40 hover:text-white  rounded-lg border-sky-600'>
          <IoCloudDownloadOutline /> Download
        </button>
      </div>

      <div>
        {filteredExams.length > 0 ? (
          <ul>
            {filteredExams.map((exam, index) => (
              <li key={index} className="p-2 border border-sky-600 rounded-xl px-5 py-2 mb-2">
                <p><strong>Title:</strong> {exam.title}</p>
                {exam.mcqTotal ? <p><strong>MCQ :</strong> {exam.mcqMarks}/{exam.mcqTotal}</p> : ''}
                {exam.writenTotal ? <p><strong>Writen :</strong> {exam.writenMarks}/{exam.writenTotal}</p> : ''}
                <p><strong>Total:</strong> {exam.mcqMarks + exam.writenMarks}/{exam.mcqTotal + exam.writenTotal}</p>
                <p><strong>Date:</strong> {exam.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No exams found for the selected month and year.</p>
        )}
      </div>
    </div>
  );
};

export default ExamsList;
