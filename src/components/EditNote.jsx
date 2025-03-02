import React, { useContext, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { AuthContext } from '../Provider';
import { FaCheckCircle } from "react-icons/fa";
import { ImCross } from "react-icons/im";

const EditNote = () => {
    const { notifyFailed, notifySuccess } = useContext(AuthContext)
    const student = useLoaderData()
    const previousNotes = student.notes
    const [selectedValues, setSelectedValues] = useState(previousNotes || []);
    const [loading, setLoading] = useState(false)
    const [paid, setPaid] = useState(false)
    useEffect(() => {
        const notePayments = student.payments.filter(payment => payment.type == 'Note Fee')
        setPaid(notePayments.some(payment => payment.pamount != 0))
    }, [student])
    const firstPaperNotes = [
        { value: 'vouto', label: '১. ভৌতজগৎ' },
        { value: 'vector', label: '২. ভেক্টর' },
        { value: 'gotibidda', label: '৩. গতিবিদ্যা' },
        { value: 'neutonian', label: '৪. নিউটনিয়ান' },
        { value: 'kajshokti', label: '৫. কাজ শক্তি' },
        { value: 'mohakorsho', label: '৬. মহাকর্ষ ' },
        { value: 'gathonik', label: '৭. গাঠনিক ধর্ম' },
        { value: 'porjabritto', label: '৮. পর্যাবৃত্ত গতি' },
        { value: 'torongo', label: '৯. তরঙ্গ' },
        { value: 'adorsho', label: '১০. আদর্শ গ্যাস' },
    ];

    const secondPaperNotes = [
        { value: 'tapgotibidda', label: '১. তাপগতিবিদ্যা' },
        { value: 'sthirtorit', label: '২. স্থির তড়িৎ' },
        { value: 'cholotorit', label: '৩. চল তড়িৎ' },
        { value: 'choumbok', label: '৪. চৌম্বক ও চৌম্বকত্ব' },
        { value: 'taritchoumbokiyoAbesh', label: '৫. তাড়িৎচৌম্বকীয় আবেশ' },
        { value: 'jamitikAlokbiggan', label: '৬. জ্যামিতিক আলোকবিজ্ঞান' },
        { value: 'voutoalokbiggan', label: '৭. ভৌত আলোকবিজ্ঞান' },
        { value: 'adhunik', label: '৮. আধুনিক পদার্থবিজ্ঞান' },
        { value: 'poromanuModel', label: '৯. পরমাণু মডেল' },
        { value: 'semiconductor', label: '১০. সেমিকন্ডাক্টর' },
        { value: 'jotirbiggan', label: '১১. জ্যোতির্বিজ্ঞান' },
    ];

    const SscNotes = [
        { value: 'রাশি', label: '১. ভৌত রাশি এবং পরিমাপ' },
        { value: 'গতি', label: '২. গতি' },
        { value: 'বল', label: '৩. বল' },
        { value: 'শক্তি', label: '৪. কাজ, ক্ষমতা ও শক্তি' },
        { value: 'চাপ', label: '৫. পদার্থের অবস্থা ও চাপ' },
        { value: 'তাপ', label: '৬. বৃহত্তর ওপর তাপের প্রভাব' },
        { value: 'তরঙ্গ', label: '৭. তরঙ্গ ও শব্দ' },
        { value: 'প্রতিফলন', label: '৮. আলোর প্রতিফলন' },
        { value: 'প্রতিসরণ', label: '৯. আলোর প্রতিসরণ' },
        { value: 'স্থিরবিদ্যুৎ', label: '১০. স্থির বিদ্যুৎ' },
        { value: 'চলবিদ্যুৎ', label: '১১. চল বিদ্যুৎ' },
        { value: 'চৌম্বক', label: '১২. বিদ্যুতের চৌম্বক ক্রিয়া' },
        { value: 'ইলেকট্রনিক্স', label: '১৩. আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স' },
        { value: 'জীবন', label: '১৪. জীবন বাঁচাতে পদার্থবিজ্ঞান' },
    ];

    const toggleOption = (value) => {
        setSelectedValues(prev => {
            if (prev.includes(value)) {
                return prev.filter(val => val !== value); // Remove the value
            } else {
                return [...prev, value]; // Add the value
            }
        });
    };

    const saveNotes = async () => {
        setLoading(true)
        student.notes = selectedValues;
        try {
            const response = await fetch(`https://spoffice-server.vercel.app/addpayment/${student.id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(student)
            });
            const data = await response.json();

            if (data.modifiedCount) {
                notifySuccess("Saved Successfully!");


            }
        } catch (error) {
            console.error("Error saving updates", error);
            notifyFailed("Error saving updates");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-wrap gap-4">
            {paid ? <p className='mx-auto flex gap-1 items-center font-semibold bg-green-600 rounded-lg text-white py-1 px-3'>
                <FaCheckCircle /> Note fee paid
            </p> : <p className='mx-auto flex gap-1 items-center font-semibold bg-red-600 rounded-lg text-white py-1 px-3'>
                <ImCross /> Note fee DUE
            </p>}

            <div className='ml-2 mt-5'>
                <p className='text-sky-600 font-bold text-lg'>{student.name}</p>
                <p className='text-sm text-gray-500 font-semibold'>{student.id}</p>
            </div>
            <div className=" ">
                <p className="font-bold underline my-2 mt-5 text-lg text-sky-600">Selected Notes:</p>
                <ul className='flex flex-wrap gap-2 border-sky-600 border-2 rounded-xl p-3'>
                    {selectedValues.map(value => (
                        <li className='font-semibold text-sm bg-sky-200 px-1 rounded-md' key={value}>{value}</li>
                    ))}
                </ul>
            </div>

            <div className='w-full'>
                <p className="font-bold underline my-2 mt-5 text-lg text-sky-600">First Paper Notes:</p>
                <div className='grid lg:grid-cols-4 grid-cols-2 md:grid-cols-3 gap-3 mb-4'>
                    {firstPaperNotes.map(option => (
                        <div
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className={`flex text-center items-center justify-center h-16 rounded-xl cursor-pointer transition-all 
                                ${selectedValues.includes(option.value) ? 'bg-sky-500 text-sm px-1 font-semibold text-white' : 'bg-gray-200 text-black'}`}
                        >

                            <span className='text-sm px-1 text-center font-semibold'>{option.label}</span>
                        </div>
                    ))}
                </div>

                <p className="font-bold underline my-2 mt-5 text-lg text-sky-600">Second Paper Notes:</p>
                <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3'>
                    {secondPaperNotes.map(option => (
                        <div
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className={`flex items-center justify-center text-center h-16 rounded-xl cursor-pointer transition-all 
                                ${selectedValues.includes(option.value) ? 'bg-sky-500 px-1 text-sm font-semibold text-white' : 'bg-gray-200 text-black'}`}
                        >

                            <span className='text-sm text-center px-1 font-semibold'>{option.label}</span>
                        </div>
                    ))}
                </div>
                <p className="font-bold underline my-2 mt-5 text-lg text-sky-600">SSC Notes:</p>
                <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3'>
                    {SscNotes.map(option => (
                        <div
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className={`flex items-center justify-center text-center h-16 rounded-xl cursor-pointer transition-all 
                                ${selectedValues.includes(option.value) ? 'bg-sky-500 px-1 text-sm font-semibold text-white' : 'bg-gray-200 text-black'}`}
                        >

                            <span className='text-sm text-center px-1 font-semibold'>{option.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className=' text-center  w-full'>
                <button onClick={saveNotes} className="font-semibold h-11 w-full bg-blue-100  border-2 rounded-xl   btn-outline btn-info py-2 px-6 text-blue-950"  >{loading ? "" : "Save"}</button>
                <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
            </div>
        </div>
    );
};

export default EditNote;
