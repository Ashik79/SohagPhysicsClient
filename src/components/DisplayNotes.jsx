import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiFileText, FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DisplayNotes = ({ notes, id }) => {
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

    const NoteCategory = ({ title, items }) => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{title}</h3>
                <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {items.map(option => {
                    const hasNote = notes.includes(option.value);
                    return (
                        <div
                            key={option.value}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${hasNote
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-100 italic font-bold'
                                    : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                                }`}
                        >
                            <span className="text-[11px] leading-tight flex-1">{option.label}</span>
                            {hasNote ? <FiCheckCircle size={14} className="ml-2" /> : <FiXCircle size={14} className="ml-2 opacity-20" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <FiAward size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Achieved Milestones</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Note Collection Progress: {notes.length} Modules</p>
                    </div>
                </div>

                <Link
                    to={`/note/${id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-slate-100 shadow-sm transition-all group"
                >
                    <FiEdit className="group-hover:rotate-12 transition-transform" /> Modify Distribution
                </Link>
            </div>

            <NoteCategory title="Physics First Paper" items={firstPaperNotes} />
            <NoteCategory title="Physics Second Paper" items={secondPaperNotes} />
            <NoteCategory title="Secondary Science (SSC)" items={SscNotes} />

            {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <FiFileText size={48} className="mb-4 opacity-20" />
                    <p className="font-black text-sm uppercase tracking-widest">No Notes Distributed Yet</p>
                </div>
            )}
        </div>
    );
};

export default DisplayNotes;
