
import React, { useState, useEffect, useContext } from 'react';

import { RiDeleteBin5Line } from "react-icons/ri";
import { AuthContext } from '../Provider';


const ProgramList = ({ student }) => {
    const {role,notifySuccess,notifyFailed} =useContext(AuthContext)

    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        if (student && student.programs) {
            setPrograms(student.programs);
        }
    }, [student]);
    console.log(student)

    const handleDelete=async(programname)=>{
        console.log('delete',programname)
        const remaining =student.programs.filter(program => program.program !=programname)
        student.programs =remaining
        const res = await fetch(`https://spoffice-server.vercel.app/addpayment/${student.id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(student)

        })

        const resData = await res.json()
        if(resData.modifiedCount){
            notifySuccess("Program removed successfully")
            setPrograms(remaining)
        }
    }



    return (
        <div className="p-4">


            <div>
                {programs.length > 0 ? (
                    <ul>
                        {programs.map((exam, index) => (
                            <li key={index} className="p-2 border w-full border-sky-600 rounded-xl px-5 py-2 mb-2">
                                <div className='flex justify-between items-center'>
                                    <p><strong>Title:</strong> {exam.program}</p>
                                    <button onClick={() => handleDelete(exam.program)} className={`text-xl text-red-600 ${role == "CEO" ? "" : "hidden"}`}><RiDeleteBin5Line /></button>
                                </div>

                               <p><strong>Program Fee:</strong> {exam.Fee}</p> 
                                <p><strong>Enrolement:</strong> {exam.payDate}</p>
                                {
                                    exam.due?<p className='text-red-600'><strong>Due:</strong> {exam.due}</p>:<></>
                                }
                                {
                                    exam.note?<p><strong>Note:</strong> {exam.note}</p>:<></>
                                }

                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No program found for the student.</p>
                )}
            </div>
        </div>
    );
};

export default ProgramList;
