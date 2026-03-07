import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../Provider'
import {
    FiPieChart, FiBarChart2, FiSearch, FiUsers, FiUserPlus,
    FiMonitor, FiCheckSquare, FiFileText, FiEdit3, FiTag,
    FiLayers, FiDownloadCloud, FiCreditCard, FiMessageSquare,
    FiDollarSign, FiGlobe, FiUserCheck, FiPlusSquare, FiShield
} from 'react-icons/fi';

function LargeNav() {
    const { role } = useContext(AuthContext)

    const allLinks = [
        { to: '/overview', label: 'Payment Overview', icon: <FiPieChart className="text-blue-500" /> },
        { to: '/studentoverview', label: 'Student Overview', role: 'CEO', icon: <FiBarChart2 className="text-indigo-500" /> },
        { to: '/finder', label: 'Finder', icon: <FiSearch className="text-sky-500" /> },
        { to: '/staffs', label: 'Staffs', role: 'CEO', icon: <FiUsers className="text-purple-500" /> },
        { to: '/entry', label: 'Staff Entry', icon: <FiUserPlus className="text-emerald-500" /> },
        { to: '/monitor', label: 'Live Monitor', icon: <FiMonitor className="text-orange-500" /> },
        { to: '/attendance', label: 'Attendance', icon: <FiCheckSquare className="text-teal-500" /> },
        { to: '/exams', label: 'Exams', icon: <FiFileText className="text-rose-500" /> },
        { to: '/note', label: 'Notes', icon: <FiEdit3 className="text-amber-500" /> },
        { to: '/coupons', label: 'Coupons', icon: <FiTag className="text-pink-500" /> },
        { to: '/batch', label: 'Batch Students', icon: <FiLayers className="text-indigo-400" /> },
        { to: '/download', label: 'Download Center', icon: <FiDownloadCloud className="text-blue-400" /> },
        { to: '/payment', label: 'Batch Payments', icon: <FiCreditCard className="text-cyan-500" /> },
        { to: '/message', label: 'Message', icon: <FiMessageSquare className="text-violet-500" /> },
        { to: '/paymententry', label: 'Payment Entry', icon: <FiDollarSign className="text-green-500" /> },
        { to: '/editor', label: 'Student Website', icon: <FiGlobe className="text-sky-600" /> },
        { to: '/register', label: 'Register', icon: <FiUserCheck className="text-indigo-600" /> },
        { to: '/programentry', label: 'Program Entry', role: 'CEO', icon: <FiPlusSquare className="text-purple-600" /> },
        { to: '/adduser', label: 'Add Role', role: 'CEO', icon: <FiShield className="text-slate-600" /> },
    ];

    return (
        <div className='w-full hidden lg:block bg-white border-r border-slate-100 h-screen sticky top-0'>
            <div className="py-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {allLinks.map((link) => (
                        (!link.role || link.role === role) && (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all duration-200
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 shadow-[inset_4px_0_0_rgba(79,70,229,0.1)]'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                                `}
                            >
                                <span className="text-lg transition-transform duration-300">
                                    {link.icon}
                                </span>
                                {link.label}
                            </NavLink>
                        )
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LargeNav
