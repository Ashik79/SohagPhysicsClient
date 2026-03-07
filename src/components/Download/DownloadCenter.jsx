import React, { useState } from 'react'
import NumberSheet from './NumberSheet'
import PaidList from './PaidList'
import UnpaidList from './UnpaidList'
import PresentList from './PresentList'
import AbsentList from './AbsentList'
import CustomList from './CustomList'
import MonthlyReport from './MonthlyReport'
import PaymentReport from './PaymentReport'
import ExamReport from './ExamReport'
import { motion } from 'framer-motion'
import { FiDownloadCloud, FiLayers } from 'react-icons/fi'
import OmrSheetDesigner from './OmrSheetDesigner'

function DownloadCenter() {
    const [downlaodOption, setDownlaodOption] = useState("phone")
    const optionChange = e => {
        setDownlaodOption(e.target.value)
    }
    const loadedComponent = () => {
        switch (downlaodOption) {
            case "phone": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><NumberSheet /></motion.div>
            case "paid": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><PaidList /></motion.div>
            case "unpaid": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><UnpaidList /></motion.div>
            case "present": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><PresentList /></motion.div>
            case "absent": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><AbsentList /></motion.div>
            case "report": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><MonthlyReport /></motion.div>
            case "payment": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><PaymentReport /></motion.div>
            case "exam": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><ExamReport /></motion.div>
            case "omr": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><OmrSheetDesigner embedded={true} /></motion.div>
            case "custom": return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><CustomList /></motion.div>
            default: return null
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <div className="glass-panel p-6 lg:p-10 rounded-3xl space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                            <FiDownloadCloud className="text-3xl text-white" />
                        </div>
                        <div>
                            <h2 className='font-extrabold text-2xl lg:text-3xl text-slate-800 tracking-tight'>Download Center</h2>
                            <p className="text-slate-500 font-medium">Generate and export official documents</p>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
                        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            <FiLayers />
                            <span>Select Preset</span>
                        </div>
                        <select
                            name='target'
                            onChange={optionChange}
                            className="select select-bordered select-lg font-bold border-2 border-slate-100 bg-white/50 focus:border-indigo-400 rounded-2xl min-w-[280px]"
                        >
                            <option value={"phone"}>Number Sheet</option>
                            <option value={"paid"}>Paid List</option>
                            <option value={"unpaid"}>Unpaid List</option>
                            <option value={"present"}>Present List</option>
                            <option value={"absent"}>Absent List</option>
                            <option value={"report"}>Monthly Attendance Report</option>
                            <option value={"payment"}>Payment Report</option>
                            <option value={"exam"}>Exam Report</option>
                            <option value={"omr"}>OMR Sheet Designer</option>
                            <option value={"custom"}>Custom Sheet</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    {loadedComponent()}
                </div>
            </div>
        </div>
    )
}

export default DownloadCenter
