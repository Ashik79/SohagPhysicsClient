import React, { useContext, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";

import { AuthContext } from '../Provider';
import { MdDeleteForever } from "react-icons/md";

import * as XLSX from 'xlsx';
import { IoCloudDownloadOutline } from "react-icons/io5";

function Exam() {
    const { notifySuccess, notifyFailed, getMonth, loggedUser, today } = useContext(AuthContext);
    const [exam, setExam] = useState(useLoaderData())
    console.log(exam);
    const { title, session, batch, program, date, results: examResults, mcqTotal, writenTotal, day, month, year } = exam;
    const [published, setPublished] = useState(exam.published)

    const tarikh = `${day} ${getMonth(month)}, ${year}`
    const [displayResults, setDisplayResults] = useState(examResults)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const sortedResults = [...displayResults].sort((a, b) => (b.mcqMarks + b.writenMarks) - (a.mcqMarks + a.writenMarks));
        let rank = 1;
        let previousMarks = sortedResults[0]?.mcqMarks + sortedResults[0]?.writenMarks
        console.log(sortedResults)
        console.log(previousMarks)

        sortedResults.forEach((result, index) => {
            // If the current student's marks are the same as the previous student's, they share the same rank
            if ((result.mcqMarks + result.writenMarks) != previousMarks) {
                rank++; // Update rank based on the index
            }

            result.merit = rank; // Assign the rank (merit) to the student
            previousMarks = result.mcqMarks + result.writenMarks; // Update previousMarks for the next iteration
        });
        setDisplayResults(sortedResults);
        console.log(displayResults)
    }, [displayResults.length]);


    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(displayResults.length / itemsPerPage);

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

    const currentResults = displayResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    //Result add korar function
    const handleAddResult = async (e) => {
        setLoading(true)
        e.preventDefault();

        const id = e.target.id.value;
        const examId = exam._id
        const mcqMarks = e.target.mcqMarks.value ? parseFloat(e.target.mcqMarks.value) : 0;
        const writenMarks = e.target.writenMarks.value ? parseFloat(e.target.writenMarks.value) : 0;
        const total = mcqMarks + writenMarks;


        try {
            const res = await fetch(`https://spoffice-server.vercel.app/student/${id}`);
            const data = await res.json();
            console.log(data);

            if (!data.id) {
                notifyFailed("Student Not Found");
                setLoading(false)
                return;
            }

            const name = data.name;
            const result = { id, mcqMarks, writenMarks, total, name, date, mcqTotal, writenTotal };
            console.log(result);

            const response = await fetch(`https://spoffice-server.vercel.app/exam/addresult/${exam._id}`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(result),
            });

            if (response.status === 400) {
                notifyFailed("Duplicate result for the same student");
                setLoading(false)
            } else if (response.status === 200) {
                notifySuccess("Result added Successfully");
                setLoading(false)
                e.target.reset()
                const temp = [...displayResults, result]
                setDisplayResults(temp)
            } else {
                notifyFailed("Unknown error occurred");
                setLoading(false)
            }
            const resultForStudent = {
                title, examId, mcqMarks, writenMarks, total, date, mcqTotal, writenTotal, day, month, year
            }
            data.exams.push(resultForStudent)
            const studentResultAdd = await fetch(`https://spoffice-server.vercel.app/addresult/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(data)

            })
        } catch (error) {
            console.error("Error adding result:", error);

        }
    };

    //Batch result add
    const handleProcessResults = async (resultsArray) => {
        setLoading(true);


        // Extract all IDs from the results array
        const ids = resultsArray.map(resultObj => resultObj.id.toString());

        try {
            // Fetch all students in a single request
            const res = await fetch(`https://spoffice-server.vercel.app/getstudents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids }), // Send an array of IDs to the server
            });

            const studentsData = await res.json();
            console.log(studentsData)
            console.log(ids)

            if (!studentsData || studentsData.length === 0) {
                notifyFailed("No students found");
                setLoading(false);
                return;
            }

            const tempResults = [];
            const studentTempResults = [];

            for (const resultObj of resultsArray) {
                const { id, mark: mcqMarks } = resultObj;
                const student = studentsData.find(student => student.id == id);

                if (!student) {
                    notifyFailed(`Student with ID ${id} not found`);
                    continue;
                }

                const examId = exam._id;
                const writenMarks = 0; // Or any other logic for written marks
                const total = mcqMarks + writenMarks;
                const result = { id, mcqMarks, writenMarks, total, name: student.name, date, mcqTotal, writenTotal };

                tempResults.push(result);

                // Add result to the student's profile
                const resultForStudent = { title, examId, mcqMarks, writenMarks, total, date, mcqTotal, writenTotal, day, month, year };
                studentTempResults.push({
                    id: id.toString(),
                    exams: [resultForStudent]
                });
            }

            // Update exam results in exam collection
            const response = await fetch(`https://spoffice-server.vercel.app/exam/update/${exam._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ results: [...examResults, ...tempResults] })
            });

            if (!response.ok) {
                const errorText = await response.text();
                notifyFailed(errorText);
                setLoading(false);
                return;
            }

            const updateResult = await response.json();
            console.log('Exam Updated:', updateResult);

            // Bulk update student profiles with the new exam results
            const response2 = await fetch(`https://spoffice-server.vercel.app/addbulkresults`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentTempResults)
            });

            if (!response2.ok) {
                const errorText = await response2.text();
                notifyFailed(errorText);
            } else {
                const result2 = await response2.json();
                console.log('Students Updated:', result2);

                if (result2.modifiedCount) {
                    notifySuccess("Student info updated");

                }
            }
        } catch (error) {
            console.error("Error processing results:", error);
        }

        setLoading(false);
    };


    //excell file upload
    const handleFileChange = e => {
        setFile(e.target.files[0]);
    }

    const handleFileUpload = (e) => {
        e.preventDefault()
        if (!file) {
            alert('Please select a file first.');
            return;
        }
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });

            // Assuming the first sheet is the one you want
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert worksheet data to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Log the raw JSON data to debug
            console.log('Raw JSON data:', jsonData);

            // Assuming headers are present and the relevant data starts after the header row
            const header = jsonData[4];
            const dataRows = jsonData.slice(1);

            // Find the indices of the columns
            const idIndex = header.indexOf('Roll No'); // Replace 'id' with the actual column name in the header
            const markIndex = header.indexOf('Obtained Marks'); // Replace 'mark' with the actual column name in the header

            if (idIndex === -1 || markIndex === -1) {
                console.error('Column names not found in the header');
                return;
            }

            // Process the data
            const formattedData = dataRows.map(row => ({
                id: row[idIndex],
                mark: row[markIndex],
            }));

            // Update the state with the processed data
            const resultArray = []
            formattedData.map(data => {
                if (typeof (data.mark) == 'number') {

                    resultArray.push(data)
                }
            })
            handleProcessResults(resultArray)
        };

        reader.readAsBinaryString(file);
    };


    //Download er Function
    const handleDownload = async () => {
        console.log('d')
        try {

            const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/examresults', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'

                },
                body: JSON.stringify(displayResults)
            })

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title}'s Results.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error('Failed to download Info');
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    //Publish korar Function 
    const handlePublish = async () => {
        setLoading(true)
        console.log("publish clicked")
        const ids = []
        displayResults.map(result => {
            ids.push(result.id)

        })
        try {
            const res = await fetch('https://spoffice-server.vercel.app/getnumbers', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(ids)
            })

            const data = await res.json()
            console.log(data)
            const messages = []
            data.map(num => {
                const result = displayResults.find(res => res.name == num.name)
                console.log(result)
                const message = {
                    to: `${num.phone}`,
                    message: `Hey ${num.name},\nHere is your result! \nExam Name: ${title}\nExam Date: ${tarikh}\n${mcqTotal ? 'MCQ: ' : ''}${mcqTotal ? result.mcqMarks : ''}${mcqTotal ? `/${mcqTotal}\n` : ''}${writenTotal ? `Written: ${result.writenMarks}/${writenTotal}\n` : ''}Total: ${result.mcqMarks + result.writenMarks}/${mcqTotal + writenTotal}\nMerit:${result.merit}\nHighest Mark: ${displayResults[0].total} \nSohag Physics`
                }
                messages.push(message)

            })
            console.log(messages)
            const response2 = await fetch('https://bulksmsbd.net/api/smsapimany', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: 'CUOP72nJJHahM30djaQG',
                    senderid: '8809617642567',
                    messages: messages
                }),
            })
            const result2 = await response2.json();
            console.log(result2);

            if (result2.response_code == 202) {
                const response = await fetch(`https://spoffice-server.vercel.app/exam/update/${exam._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ published: { status: true, date: today, publishedBy: loggedUser } })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    notifyFailed(errorText);
                    setLoading(false);
                    return;
                }

                setPublished({ status: true, date: today, publishedBy: loggedUser })
                notifySuccess("Result Published Successfully !")
                setLoading(false)
            }
            else if (result2.response_code != 202) {
                notifyFailed("Error in SMS Server")
                setLoading(false)
            }


        }

        catch (error) {
            console.error("Error geting numbers", error)
        }


    }
    const handleDelete = async (id) => {
        const response = await fetch(`https://spoffice-server.vercel.app/student/${id}`)
        let student=await response.json()
        let data = exam;
     
        let filteredResults = data.results.filter(result => result.id != id)
        data.results = filteredResults
        student.exams=student.exams.filter(result => result.examId !=data._id)
        console.log(data)
        console.log(filteredResults)
        
      

        const res = await fetch(`https://spoffice-server.vercel.app/deleteresult/${exam._id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)

        })
        const dat = await res.json()
        if (dat.modifiedCount) {
            notifySuccess("Successfully Deleted")
            setDisplayResults(data.results)
        }
        const studentResultDelete = await fetch(`https://spoffice-server.vercel.app/addresult/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(student)

            })
    }

    return (
        <div>
            {/* title part */}
            <div className='flex justify-between items-center flex-col lg:flex-row md:flex-row gap-3'>
                <div>
                    <p className='font-semibold text-2xl text-black'>{title}</p>
                    <p className='font-semibold text-gray-500 '>{date}</p>

                </div>
                <div className='flex gap-1 flex-col lg:flex-row items-center '>
                    <div>
                        <button className='btn border-2 hover:border-sky-600 hover:text-sky-600 text-sm font-bold rounded-xl h-11 border-black text-black py-1 px-2' onClick={() => handlePublish()}>{loading ? "" : "Publish Result"}</button>
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                    <button className='btn border-2 hover:border-sky-600 hover:text-sky-600 text-sm font-bold rounded-xl border-black text-black py-1 px-5' onClick={() => document.getElementById('my_modal_1').showModal()} >Add Single Result</button>
                    <button className='btn border-2 hover:border-sky-600 hover:text-sky-600 text-sm font-bold rounded-xl border-black text-black py-1 px-5' onClick={() => document.getElementById('my_modal_3').showModal()} >Add Multiple Results</button>
                </div>
            </div>

            {/* exam er details part */}
            <div className='my-5'>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Batch
                    </span>
                    <span className='font-semibold w-1/2'>
                        {batch}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Program
                    </span>
                    <span className='font-semibold w-1/2'>
                        {program}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Session
                    </span>
                    <span className='font-semibold w-1/2'>
                        {session}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Total MCQ Marks
                    </span>
                    <span className='font-semibold w-1/2'>
                        {mcqTotal}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Total Written Marks
                    </span>
                    <span className='font-semibold w-1/2'>
                        {writenTotal}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Total Results
                    </span>
                    <span className='font-semibold w-1/2'>
                        {displayResults?.length}
                    </span>
                </div>
                <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                    <span className='w-1/2'>
                        Result Published
                    </span>
                    {published ? <span className='font-semibold text-sm w-1/2'>
                        in {published.date} by {published.publishedBy}
                    </span> : <span>Not Published</span>}
                </div>


            </div>


            {/* Result add korar modal edit */}

            <dialog id="my_modal_1" className="modal ">
                <div className="modal-box ">
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
                        </form>
                    </div>
                    <form className='mx-auto  w-full' onSubmit={handleAddResult} >


                        {/* students part */}
                        <div className='flex  flex-col '>
                            <h1 className='font-bold text-center underline mb-2 text-xl '>Add Result </h1>
                            <div className='grid grid-cols-1   gap-3'>


                                <div>
                                    <p className='font-semibold'>Student ID <span className='text-red-700'>*</span> </p>
                                    <input
                                        required
                                        name='id'
                                        type="text"

                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>





                                <div>
                                    <p className='font-semibold'>MCQ Marks ( <span className='text-gray-500'>out of {mcqTotal}</span> ) </p>
                                    <input

                                        name='mcqMarks'
                                        type="text"

                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>
                                <div>
                                    <p className='font-semibold'>Written Marks ( <span className='text-gray-500'>out of {writenTotal}</span> )</p>
                                    <input

                                        name='writenMarks'
                                        type="text"

                                        className="input text-lg font-semibold  input-bordered input-info w-full " />
                                </div>


                            </div>
                        </div>


                        <div className='flex mt-10 flex-col lg:flex-row'>
                            <h1 className='font-bold text-lg lg:w-1/4'></h1>
                            <div className='lg:w-2/3 text-center'>
                                <input className=" text-lg font-semibold  w-full bg-blue-100  border-2 rounded-xl h-11   btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Add Result"}`} />
                                <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                            </div>
                        </div>

                    </form>










                </div>
            </dialog>

            {/* Multiple upload er modal */}

            <dialog id="my_modal_3" className="modal ">
                <div className="modal-box ">
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="text-red-600 px-1 lg:text-lg"><IoMdClose /></button>
                        </form>
                    </div>
                    <form className='mx-auto  w-full'  >



                        <div className='mb-10'>
                            <h1 className='text-2xl font-semibold my-1 text-sky-600'>Upload Excel File</h1>
                            <input className='  text-black font-semibold' type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                            <button className='border-sky-600 border-2 font-semibold text-sky-600 hover:bg-slate-300 py-1 px-3 rounded-lg' onClick={handleFileUpload}>Submit</button>

                        </div>



                    </form>










                </div>
            </dialog>

            <h1 className='text-2xl font-semibold text-sky-900 flex items-center justify-center gap-1'>
                Results : <button onClick={handleDownload} className=' flex items-center justify-center gap-1 px-1 text-base border-2 font-bold text-sky-600 hover:bg-slate-400 py-1  hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download</button> <br />
            </h1>

            <div className='flex text-gray-500 text-sm lg:text-base font-semibold mt-8 mb-2 w-full'>
                <div className='w-1/3'>
                    <p>NAME</p>
                </div>

                <div className='w-2/3 flex text-sm lg:text-base'>
                    <p className='w-1/2 flex flex-col lg:flex-row md:flex-row'>MCQ <span>({mcqTotal})</span></p>
                    <p className='w-1/2 flex flex-col lg:flex-row md:flex-row'>WRITTEN <span>({writenTotal})</span></p>
                    <p className='w-1/2 flex flex-col lg:flex-row md:flex-row'>TOTAL <span>({mcqTotal + writenTotal})</span></p>
                    <p className='w-1/2 flex flex-col lg:flex-row md:flex-row'>MERIT <span>({examResults.length})</span></p>
                </div>
            </div>


            {
                currentResults.map((result, index) => <>
                    <div key={index} className='flex w-full text-sm lg:text-base cursor-pointer items-center border-b  p-1 border-sky-600 '>

                        <div className='w-1/3' >
                            <p className='font-semibold'>{result.name}</p>
                            <p className='text-sm text-gray-500'>{result.id}</p>
                        </div>



                        <div className=' w-2/3 flex text-gray-500 font-semibold'>
                            <p className='w-1/3 ml-6'>{result.mcqMarks}</p>
                            <p className='w-1/3 ml-10'>{result.writenMarks}</p>
                            <p className='w-1/3 ml-10'>{result.mcqMarks + result.writenMarks}</p>
                            <p className='w-1/3 ml-10'>{result.merit}</p>
                        </div>



                        <a onClick={() => handleDelete(result.id)} className='flex items-center text-lg gap-1 text-red-600'><MdDeleteForever /></a>


                    </div>
                </>)
            }
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
    )
}

export default Exam