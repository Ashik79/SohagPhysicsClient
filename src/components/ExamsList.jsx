import React, { useState, useEffect } from 'react';
import { IoCloudDownloadOutline } from "react-icons/io5";

const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['All', 2023, 2024, 2025,2026,2027]; // Add 'All' to the years

const ExamsList = ({ student }) => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      if (student && student.id) {
        setLoading(true);
        try {
          const response = await fetch(`https://spoffice-server.vercel.app/getexams/${student.id}`);
          const data = await response.json();
         
          // Process each exam to calculate merit position
          const processedExams = data.map(exam => {
            // Sort results by total marks in descending order
            const sortedResults = [...exam.results].sort((a, b) => b.total - a.total);
            
            // Find the student's result and calculate merit
            const studentResult = sortedResults.find(result => result.id === student.id);
            
            if (studentResult) {
              // Calculate merit position (1-based)
              let merit = 1;
              for (let i = 0; i < sortedResults.length; i++) {
                if (sortedResults[i].id === student.id) {
                  merit = i + 1;
                  break;
                }
                // Handle tied positions
                if (i > 0 && sortedResults[i].total === sortedResults[i - 1].total) {
                  merit = merit; // Keep the same merit as previous
                } else if (i > 0) {
                  merit = i + 1;
                }
              }
              
              return {
                title: exam.title,
                date: exam.date,
                mcqMarks: studentResult.mcqMarks,
                writenMarks: studentResult.writenMarks,
                total: studentResult.total,
                mcqTotal: exam.mcqTotal,
                writenTotal: exam.writenTotal,
                merit: merit,
                totalParticipants: exam.results.length
              };
            }
            return null;
          }).filter(exam => exam !== null);
          
          setExams(processedExams);
        } catch (error) {
          console.error('Error fetching exams:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchExams();
  }, [student]);

  const filteredExams = exams.filter(exam => {
    const [examMonth, , examYear] = exam.date.split(' ');

    const isMonthMatch = selectedMonth === 'All' || examMonth === months[selectedMonth];
    const isYearMatch = selectedYear === 'All' || parseInt(examYear, 10) === parseInt(selectedYear, 10);

    return isMonthMatch && isYearMatch;
  });


  const handleDownload = async () => {
    try {
      // Add merit to each exam before downloading
      const examsWithMerit = filteredExams.map(exam => ({
        ...exam,
        merit: exam.merit,
        totalParticipants: exam.totalParticipants
      }));

      const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/results', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(examsWithMerit.reverse())
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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-lg text-sky-600"></span>
        </div>
      ) : (
        <div>
          {filteredExams.length > 0 ? (
            <ul>
              {filteredExams.reverse().map((exam, index) => (
                <li key={index} className="p-2 border border-sky-600 rounded-xl px-5 py-2 mb-2">
                  <p><strong>Title:</strong> {exam.title}</p>
                  {exam.mcqTotal ? <p><strong>MCQ :</strong> {exam.mcqMarks}/{exam.mcqTotal}</p> : ''}
                  {exam.writenTotal ? <p><strong>Written :</strong> {exam.writenMarks}/{exam.writenTotal}</p> : ''}
                  <p><strong>Total:</strong> {exam.total}/{exam.mcqTotal + exam.writenTotal}</p>
                  <p><strong>Merit Position:</strong> {exam.merit} out of {exam.totalParticipants}</p>
                  <p><strong>Date:</strong> {exam.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No exams found for the selected month and year.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamsList;
