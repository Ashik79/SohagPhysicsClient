import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Provider';
import { motion } from 'framer-motion';
import { FiUsers, FiUserCheck, FiCalendar, FiPieChart, FiActivity } from 'react-icons/fi';

function StudentOverview() {
    const { date, month, year } = useContext(AuthContext);
    const payDate = `${date}-${month}-${year}`;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/studentoverview`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ date: payDate })
                });
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatusCard = ({ title, icon: Icon, children, colorClass }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 w-full max-w-md mx-auto"
        >
            <div className={`p-5 rounded-2xl mb-6 shadow-inner ${colorClass}`}>
                <Icon size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">{title}</h2>

            <div className="w-full space-y-4">
                {children}
            </div>
        </motion.div>
    );

    const StatusItem = ({ label, value, icon: Icon, color }) => (
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={18} />
                </div>
                <span className="font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase text-xs tracking-wider">{label}</span>
            </div>
            {value === null ? (
                <span className="loading loading-dots loading-sm text-slate-400"></span>
            ) : (
                <span className="text-2xl font-black text-slate-800">{value}</span>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col gap-8 py-10">
                <StatusCard title="Overall Status" icon={FiPieChart} colorClass="bg-gradient-to-br from-cyan-500 to-blue-600">
                    <StatusItem label="Registered" value={null} icon={FiUsers} color="text-cyan-600 bg-cyan-600" />
                    <StatusItem label="Admitted" value={null} icon={FiUserCheck} color="text-blue-600 bg-blue-600" />
                </StatusCard>

                <StatusCard title="Today's Status" icon={FiActivity} colorClass="bg-gradient-to-br from-amber-500 to-rose-600">
                    <StatusItem label="Registered" value={null} icon={FiCalendar} color="text-amber-600 bg-amber-600" />
                    <StatusItem label="Admitted" value={null} icon={FiUserCheck} color="text-rose-600 bg-rose-600" />
                </StatusCard>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 py-10 justify-center items-start">
            <StatusCard title="Overall Status" icon={FiPieChart} colorClass="bg-gradient-to-br from-cyan-500 to-blue-600">
                <StatusItem label="Total Registered" value={data?.total} icon={FiUsers} color="text-cyan-600 bg-cyan-600" />
                <StatusItem label="Total Admitted" value={data?.admitted} icon={FiUserCheck} color="text-blue-600 bg-blue-600" />
            </StatusCard>

            <StatusCard title="Today's Status" icon={FiActivity} colorClass="bg-gradient-to-br from-amber-500 to-rose-600">
                <StatusItem label="Registered Today" value={data?.registeredToday} icon={FiCalendar} color="text-amber-600 bg-amber-600" />
                <StatusItem label="Admitted Today" value={data?.admittedToday} icon={FiUserCheck} color="text-rose-600 bg-rose-600" />
            </StatusCard>
        </div>
    );
}

export default StudentOverview;
