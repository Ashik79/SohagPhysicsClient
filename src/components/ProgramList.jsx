import API_URL from '../apiConfig';
import React, { useState, useEffect, useContext } from 'react';
import { FiLayers, FiTrash2, FiCalendar, FiUser, FiFileText, FiAlertCircle } from "react-icons/fi";
import { AuthContext } from '../Provider';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const ProgramList = ({ student }) => {
    const { role, notifySuccess, notifyFailed } = useContext(AuthContext)
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        if (student && student.programs) {
            setPrograms(student.programs);
        }
    }, [student]);

    const handleDelete = async (programname) => {
        Swal.fire({
            title: 'Remove Program?',
            text: `Are you sure you want to remove ${programname}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Remove',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-[2.5rem] p-8',
                confirmButton: 'rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-xs',
                cancelButton: 'rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-xs'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const remaining = student.programs.filter(program => program.program != programname)
                student.programs = remaining
                const res = await fetch(`${API_URL}/addpayment/${student.id}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(student)
                })

                const resData = await res.json()
                if (resData.modifiedCount) {
                    notifySuccess("Program removed successfully")
                    setPrograms(remaining)
                }
            }
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FiLayers size={18} />
                </div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Active Enrollments</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode='popLayout'>
                    {programs.map((pg, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            key={index}
                            className="group p-6 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-[2.5rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-800 tracking-tight uppercase italic group-hover:text-indigo-600 transition-colors">{pg.program}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FiCalendar /> Enrolled: {pg.payDate}</p>
                                </div>
                                {role === "CEO" && (
                                    <button
                                        onClick={() => handleDelete(pg.program)}
                                        className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-2xl border border-slate-100/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Program Fee</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-black text-slate-700">{pg.Fee}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">BDT</span>
                                    </div>
                                </div>
                                {pg.due > 0 && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Outstanding</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-black text-rose-600">{pg.due}</span>
                                            <span className="text-[8px] font-bold text-rose-400 uppercase">BDT</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(pg.note || pg.entryBy) && (
                                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {pg.note && <span className="text-[10px] font-bold text-slate-400 italic flex items-center gap-1.5"><FiFileText /> {pg.note}</span>}
                                    </div>
                                    {pg.entryBy && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter flex items-center gap-1.5"><FiUser /> By {pg.entryBy}</span>}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {programs.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-slate-300">
                        <FiAlertCircle size={48} className="mb-4 opacity-20" />
                        <p className="font-black text-sm uppercase tracking-widest">No Active Programs</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramList;
