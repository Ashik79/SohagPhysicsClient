import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiFileText, FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DisplayNotes = ({ notes, id }) => {
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
