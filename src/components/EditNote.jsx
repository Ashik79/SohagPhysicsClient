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
        { value: 'vouto', label: '১. à¦­à§Œà¦¤à¦œà¦—à§Ž' },
        { value: 'vector', label: '২. à¦­à§‡à¦•à§à¦Ÿর' },
        { value: 'gotibidda', label: '৩. à¦—তিবিদ্যা' },
        { value: 'neutonian', label: '৪. à¦¨à¦¿à¦‰à¦Ÿà¦¨à¦¿à§Ÿান' },
        { value: 'kajshokti', label: '৫. à¦•à¦¾à¦œ à¦¶à¦•্তি' },
        { value: 'mohakorsho', label: '৬. à¦®à¦¹à¦¾à¦•র্ষ ' },
        { value: 'gathonik', label: '৭. à¦—à¦¾à¦ à¦¨à¦¿à¦• ধর্ম' },
        { value: 'porjabritto', label: '৮. à¦ªà¦°à§à¦¯à¦¾à¦¬à§ƒত্ত à¦—তি' },
        { value: 'torongo', label: '৯. à¦¤à¦°à¦™à§à¦—' },
        { value: 'adorsho', label: '১০. à¦†দর্শ à¦—্যাস' },
    ];

    const secondPaperNotes = [
        { value: 'tapgotibidda', label: '১. à¦¤à¦¾à¦ªà¦—তিবিদ্যা' },
        { value: 'sthirtorit', label: '২. স্থির à¦¤à§œà¦¿à§Ž' },
        { value: 'cholotorit', label: '৩. à¦šল à¦¤à§œà¦¿à§Ž' },
        { value: 'choumbok', label: '৪. à¦šà§Œà¦®à§à¦¬à¦• à¦“ à¦šà§Œà¦®à§à¦¬à¦•ত্ব' },
        { value: 'taritchoumbokiyoAbesh', label: '৫. à¦¤à¦¾à§œà¦¿à§Žà¦šà§Œà¦®à§à¦¬à¦•à§€à§Ÿ à¦†à¦¬à§‡শ' },
        { value: 'jamitikAlokbiggan', label: '৬. à¦œà§à¦¯à¦¾à¦®à¦¿à¦¤à¦¿à¦• à¦†à¦²à§‹à¦•à¦¬à¦¿à¦œà§à¦žান' },
        { value: 'voutoalokbiggan', label: '৭. à¦­à§Œত à¦†à¦²à§‹à¦•à¦¬à¦¿à¦œà§à¦žান' },
        { value: 'adhunik', label: '৮. à¦†à¦§à§à¦¨à¦¿à¦• à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žান' },
        { value: 'poromanuModel', label: '৯. পরমাণু à¦®à¦¡à§‡ল' },
        { value: 'semiconductor', label: '১০. à¦¸à§‡à¦®à¦¿à¦•à¦¨à§à¦¡à¦¾à¦•à§à¦Ÿর' },
        { value: 'jotirbiggan', label: '১১. à¦œà§à¦¯à§‹à¦¤à¦¿à¦°à§à¦¬à¦¿à¦œà§à¦žান' },
    ];

    const SscNotes = [
        { value: 'রাশি', label: '১. à¦­à§Œত রাশি à¦à¦¬à¦‚ পরিমাপ' },
        { value: 'à¦—তি', label: '২. à¦—তি' },
        { value: 'বল', label: '৩. বল' },
        { value: 'à¦¶à¦•্তি', label: '৪. à¦•à¦¾à¦œ, à¦•্ষমতা à¦“ à¦¶à¦•্তি' },
        { value: 'à¦šাপ', label: '৫. à¦ªà¦¦à¦¾à¦°à§à¦¥à§‡র à¦…বস্থা à¦“ à¦šাপ' },
        { value: 'তাপ', label: '৬. à¦¬à§ƒহত্তর à¦“পর à¦¤à¦¾à¦ªà§‡র প্রভাব' },
        { value: 'à¦¤à¦°à¦™à§à¦—', label: '৭. à¦¤à¦°à¦™à§à¦— à¦“ শব্দ' },
        { value: 'প্রতিফলন', label: '৮. à¦†à¦²à§‹র প্রতিফলন' },
        { value: 'প্রতিসরণ', label: '৯. à¦†à¦²à§‹র প্রতিসরণ' },
        { value: 'à¦¸à§à¦¥à¦¿à¦°à¦¬à¦¿à¦¦à§à¦¯à§à§Ž', label: '১০. স্থির à¦¬à¦¿à¦¦à§à¦¯à§à§Ž' },
        { value: 'à¦šà¦²à¦¬à¦¿à¦¦à§à¦¯à§à§Ž', label: '১১. à¦šল à¦¬à¦¿à¦¦à§à¦¯à§à§Ž' },
        { value: 'à¦šà§Œà¦®à§à¦¬à¦•', label: '১২. à¦¬à¦¿à¦¦à§à¦¯à§à¦¤à§‡র à¦šà§Œà¦®à§à¦¬à¦• à¦•্রিয়া' },
        { value: 'à¦‡à¦²à§‡à¦•à¦Ÿà§à¦°à¦¨à¦¿à¦•্স', label: '১৩. à¦†à¦§à§à¦¨à¦¿à¦• à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žান à¦“ à¦‡à¦²à§‡à¦•à¦Ÿà§à¦°à¦¨à¦¿à¦•্স' },
        { value: 'à¦œà§€বন', label: '১৪. à¦œà§€বন à¦¬à¦¾à¦à¦šà¦¾à¦¤à§‡ à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žান' },
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/addpayment/${student.id}`, {
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
