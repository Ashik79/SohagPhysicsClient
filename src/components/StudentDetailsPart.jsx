import React from 'react'
import { FiDollarSign, FiUser, FiLayers, FiCalendar, FiPhone, FiMapPin, FiUsers, FiTag, FiClock, FiCheckCircle, FiShield, FiFileText } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';

function StudentDetailsPart({ student }) {
    const { address, admissionDate, lastEdit, admittedBy, note, batch, college, waver, waverReason, gname, gphone, id, monthlyAmount, name, phone, program, reference, school, session, target } = student

    const infoGroups = [
        {
            title: "Academic Enrollment",
            items: [
                { label: "Monthly Fee", val: monthlyAmount, icon: FiDollarSign, color: "emerald" },
                { label: "Current Batch", val: batch, icon: FiUsers, color: "indigo" },
                { label: "Active Program", val: program, icon: FiLayers, color: "sky" },
                { label: "Academic Session", val: session, icon: FiCalendar, color: "amber" },
            ]
        },
        {
            title: "Personal & Educational",
            items: [
                { label: "Primary Phone", val: phone, icon: FiPhone, color: "rose" },
                { label: "Registered School", val: school, icon: MdSchool, color: "slate" },
                { label: "Current College", val: college, icon: MdSchool, color: "cyan" },
                { label: "Permanent Address", val: address, icon: FiMapPin, color: "violet" },
            ]
        },
        {
            title: "Guardian & Reference",
            items: [
                { label: "Guardian Initials", val: gname, icon: FiUser, color: "blue" },
                { label: "Guardian Contact", val: gphone, icon: FiPhone, color: "blue" },
                { label: "Referenced By", val: reference, icon: FiTag, color: "orange" },
            ]
        },
        {
            title: "Administrative Data",
            items: [
                { label: "Admission Date", val: admissionDate, icon: FiClock, color: "slate" },
                { label: "Admitted By", val: admittedBy, icon: FiCheckCircle, color: "slate" },
                { label: "Last Profile Edit", val: lastEdit || "None", icon: FiShield, color: "rose" },
            ]
        },
        {
            title: "Special Considerations",
            items: [
                { label: "Waver Status", val: waver, icon: FiTag, color: "rose" },
                { label: "Waver Justification", val: waverReason, icon: FiFileText, color: "rose" },
            ]
        }
    ];

    return (
        <div className="space-y-12">
            {infoGroups.map((group, idx) => (
                <div key={idx} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{group.title}</h3>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all hover:bg-white">
                                <div className={`p-2.5 bg-${item.color}-50 text-${item.color}-600 rounded-xl`}>
                                    <item.icon size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{item.label}</p>
                                    <p className="font-bold text-slate-700 text-sm truncate">{item.val || "Not Provided"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {note && (
                <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FiFileText size={48} className="text-amber-800" />
                    </div>
                    <p className="text-[10px] font-black text-amber-800/50 uppercase tracking-widest mb-2">Student Memo (à¦®à¦¨à§à¦¤à¦¬à§à¦¯)</p>
                    <p className="text-amber-900 font-bold leading-relaxed italic">{note}</p>
                </div>
            )}
        </div>
    )
}

export default StudentDetailsPart
