import React from 'react';
import { Link } from 'react-router-dom';

const DisplayNotes = ({ notes,id }) => {
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

    return (
        <div className="flex flex-col flex-wrap gap-4">
            <div className="mt-4">
                <div className='flex justify-between items-center px-4 my-2'>
                <p className="font-semibold underline my-2">Given Notes: {notes.length}</p>
                <Link className='px-4 rounded-lg bg-sky-300 font-bold text-sm py-1' to={`/note/${id}`}>edit</Link>
                </div>
                <ul className='flex flex-wrap gap-2 border-sky-600 border-2 rounded-xl p-3'>
                    {notes.map(value => (
                        <li className='font-semibold text-sm bg-sky-200 px-1 rounded-md' key={value}>{value}</li>
                    ))}
                </ul>
            </div>

            <div className='w-full'>
                <p className="font-semibold underline my-2">First Paper Notes:</p>
                <div className='grid lg:grid-cols-4 grid-cols-2 md:grid-cols-3 gap-3 mb-4'>
                    {firstPaperNotes.map(option => (
                        <div
                            key={option.value}
                            className={`flex text-center items-center justify-center h-16 rounded-xl transition-all 
                                ${notes.includes(option.value) ? 'bg-sky-500 text-sm px-1 font-semibold text-white' : 'bg-gray-200 text-black'}`}
                        >
                            <span className='text-sm px-1 text-center font-semibold'>{option.label}</span>
                        </div>
                    ))}
                </div>

                <p className="font-semibold underline my-2">Second Paper Notes:</p>
                <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3'>
                    {secondPaperNotes.map(option => (
                        <div
                            key={option.value}
                            className={`flex items-center justify-center text-center h-16 rounded-xl transition-all 
                                ${notes.includes(option.value) ? 'bg-sky-500 px-1 text-sm font-semibold text-white' : 'bg-gray-200 text-black'}`}
                        >
                            <span className='text-sm text-center px-1 font-semibold'>{option.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DisplayNotes;
