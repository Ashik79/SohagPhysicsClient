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
        { value: 'vouto', label: 'à§§. à¦­à§Œà¦¤à¦œà¦—à§Ž' },
        { value: 'vector', label: 'à§¨. à¦­à§‡à¦•à§à¦Ÿà¦°' },
        { value: 'gotibidda', label: 'à§©. à¦—à¦¤à¦¿à¦¬à¦¿à¦¦à§à¦¯à¦¾' },
        { value: 'neutonian', label: 'à§ª. à¦¨à¦¿à¦‰à¦Ÿà¦¨à¦¿à§Ÿà¦¾à¦¨' },
        { value: 'kajshokti', label: 'à§«. à¦•à¦¾à¦œ à¦¶à¦•à§à¦¤à¦¿' },
        { value: 'mohakorsho', label: 'à§¬. à¦®à¦¹à¦¾à¦•à¦°à§à¦· ' },
        { value: 'gathonik', label: 'à§­. à¦—à¦¾à¦ à¦¨à¦¿à¦• à¦§à¦°à§à¦®' },
        { value: 'porjabritto', label: 'à§®. à¦ªà¦°à§à¦¯à¦¾à¦¬à§ƒà¦¤à§à¦¤ à¦—à¦¤à¦¿' },
        { value: 'torongo', label: 'à§¯. à¦¤à¦°à¦™à§à¦—' },
        { value: 'adorsho', label: 'à§§à§¦. à¦†à¦¦à¦°à§à¦¶ à¦—à§à¦¯à¦¾à¦¸' },
    ];

    const secondPaperNotes = [
        { value: 'tapgotibidda', label: 'à§§. à¦¤à¦¾à¦ªà¦—à¦¤à¦¿à¦¬à¦¿à¦¦à§à¦¯à¦¾' },
        { value: 'sthirtorit', label: 'à§¨. à¦¸à§à¦¥à¦¿à¦° à¦¤à§œà¦¿à§Ž' },
        { value: 'cholotorit', label: 'à§©. à¦šà¦² à¦¤à§œà¦¿à§Ž' },
        { value: 'choumbok', label: 'à§ª. à¦šà§Œà¦®à§à¦¬à¦• à¦“ à¦šà§Œà¦®à§à¦¬à¦•à¦¤à§à¦¬' },
        { value: 'taritchoumbokiyoAbesh', label: 'à§«. à¦¤à¦¾à§œà¦¿à§Žà¦šà§Œà¦®à§à¦¬à¦•à§€à§Ÿ à¦†à¦¬à§‡à¦¶' },
        { value: 'jamitikAlokbiggan', label: 'à§¬. à¦œà§à¦¯à¦¾à¦®à¦¿à¦¤à¦¿à¦• à¦†à¦²à§‹à¦•à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨' },
        { value: 'voutoalokbiggan', label: 'à§­. à¦­à§Œà¦¤ à¦†à¦²à§‹à¦•à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨' },
        { value: 'adhunik', label: 'à§®. à¦†à¦§à§à¦¨à¦¿à¦• à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨' },
        { value: 'poromanuModel', label: 'à§¯. à¦ªà¦°à¦®à¦¾à¦£à§ à¦®à¦¡à§‡à¦²' },
        { value: 'semiconductor', label: 'à§§à§¦. à¦¸à§‡à¦®à¦¿à¦•à¦¨à§à¦¡à¦¾à¦•à§à¦Ÿà¦°' },
        { value: 'jotirbiggan', label: 'à§§à§§. à¦œà§à¦¯à§‹à¦¤à¦¿à¦°à§à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨' },
    ];

    const SscNotes = [
        { value: 'à¦°à¦¾à¦¶à¦¿', label: 'à§§. à¦­à§Œà¦¤ à¦°à¦¾à¦¶à¦¿ à¦à¦¬à¦‚ à¦ªà¦°à¦¿à¦®à¦¾à¦ª' },
        { value: 'à¦—à¦¤à¦¿', label: 'à§¨. à¦—à¦¤à¦¿' },
        { value: 'à¦¬à¦²', label: 'à§©. à¦¬à¦²' },
        { value: 'à¦¶à¦•à§à¦¤à¦¿', label: 'à§ª. à¦•à¦¾à¦œ, à¦•à§à¦·à¦®à¦¤à¦¾ à¦“ à¦¶à¦•à§à¦¤à¦¿' },
        { value: 'à¦šà¦¾à¦ª', label: 'à§«. à¦ªà¦¦à¦¾à¦°à§à¦¥à§‡à¦° à¦…à¦¬à¦¸à§à¦¥à¦¾ à¦“ à¦šà¦¾à¦ª' },
        { value: 'à¦¤à¦¾à¦ª', label: 'à§¬. à¦¬à§ƒà¦¹à¦¤à§à¦¤à¦° à¦“à¦ªà¦° à¦¤à¦¾à¦ªà§‡à¦° à¦ªà§à¦°à¦­à¦¾à¦¬' },
        { value: 'à¦¤à¦°à¦™à§à¦—', label: 'à§­. à¦¤à¦°à¦™à§à¦— à¦“ à¦¶à¦¬à§à¦¦' },
        { value: 'à¦ªà§à¦°à¦¤à¦¿à¦«à¦²à¦¨', label: 'à§®. à¦†à¦²à§‹à¦° à¦ªà§à¦°à¦¤à¦¿à¦«à¦²à¦¨' },
        { value: 'à¦ªà§à¦°à¦¤à¦¿à¦¸à¦°à¦£', label: 'à§¯. à¦†à¦²à§‹à¦° à¦ªà§à¦°à¦¤à¦¿à¦¸à¦°à¦£' },
        { value: 'à¦¸à§à¦¥à¦¿à¦°à¦¬à¦¿à¦¦à§à¦¯à§à§Ž', label: 'à§§à§¦. à¦¸à§à¦¥à¦¿à¦° à¦¬à¦¿à¦¦à§à¦¯à§à§Ž' },
        { value: 'à¦šà¦²à¦¬à¦¿à¦¦à§à¦¯à§à§Ž', label: 'à§§à§§. à¦šà¦² à¦¬à¦¿à¦¦à§à¦¯à§à§Ž' },
        { value: 'à¦šà§Œà¦®à§à¦¬à¦•', label: 'à§§à§¨. à¦¬à¦¿à¦¦à§à¦¯à§à¦¤à§‡à¦° à¦šà§Œà¦®à§à¦¬à¦• à¦•à§à¦°à¦¿à¦¯à¦¼à¦¾' },
        { value: 'à¦‡à¦²à§‡à¦•à¦Ÿà§à¦°à¦¨à¦¿à¦•à§à¦¸', label: 'à§§à§©. à¦†à¦§à§à¦¨à¦¿à¦• à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨ à¦“ à¦‡à¦²à§‡à¦•à¦Ÿà§à¦°à¦¨à¦¿à¦•à§à¦¸' },
        { value: 'à¦œà§€à¦¬à¦¨', label: 'à§§à§ª. à¦œà§€à¦¬à¦¨ à¦¬à¦¾à¦à¦šà¦¾à¦¤à§‡ à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨' },
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
