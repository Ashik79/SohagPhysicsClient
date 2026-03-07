import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../Provider';
import { MdLogout, MdMenu, MdClose } from "react-icons/md";
import {
    FiPieChart, FiBarChart2, FiSearch, FiUsers, FiUserPlus,
    FiMonitor, FiCheckSquare, FiFileText, FiEdit3, FiTag,
    FiLayers, FiDownloadCloud, FiCreditCard, FiMessageSquare,
    FiDollarSign, FiGlobe, FiUserCheck, FiPlusSquare, FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function Nav() {
    const { loggedUser, role, logout, loggedPhoto } = useContext(AuthContext);
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        if (loggedPhoto) {
            setPhoto(loggedPhoto);
            localStorage.setItem("loggedPhoto", loggedPhoto);
        } else {
            const storedPhoto = localStorage.getItem("loggedPhoto");
            if (storedPhoto) {
                setPhoto(storedPhoto);
            }
        }
    }, [loggedPhoto]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <MdMenu size={28} />
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <img className="w-8 h-8 lg:w-10 lg:h-10" src="/logo.png" alt="Logo" />
                    </Link>
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                        <img className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src={photo ? photo : 'profile.jpg'} alt="Profile" />
                        <div className="hidden sm:block text-right">
                            <h1 className="font-bold text-xs text-slate-800">{loggedUser}</h1>
                            <p className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-widest">{role}</p>
                        </div>
                    </div>
                    <button onClick={() => logout()} className="text-slate-400 hover:text-red-600 p-2 transition-colors">
                        <MdLogout size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                            onClick={() => setIsMenuOpen(false)}
                        ></motion.div>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col"
                        >
                            <div className="p-5 flex items-center justify-between border-b border-slate-50">
                                <span className="font-black text-xl text-slate-800 tracking-tight">Navigation</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                                {allLinks.map((link) => (
                                    (!link.role || link.role === role) && (
                                        <NavLink
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={({ isActive }) => `
                                                flex items-center gap-4 px-6 py-3 text-sm font-bold transition-all
                                                ${isActive
                                                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                                            `}
                                        >
                                            <span className="text-xl">{link.icon}</span>
                                            {link.label}
                                        </NavLink>
                                    )
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Nav;
