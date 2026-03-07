import API_URL from '../apiConfig';
import React, { useContext, useEffect, useState } from 'react'
import { Link, Navigate, useLoaderData, useLocation } from 'react-router-dom'
import { AuthContext } from '../Provider'
import { FiCheckCircle, FiCreditCard, FiCalendar, FiUser, FiInfo, FiTag, FiDollarSign, FiClock, FiActivity, FiArrowLeft, FiMoreVertical } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import { TbCurrencyTaka } from "react-icons/tb";
import PaymentCard from './PaymentCard';
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';


function AddPayment() {

    const [user, setUser] = useState(useLoaderData())
    const [firstLoading, setFirstLoading] = useState(true)
    const [noProgram, setNoProgram] = useState(false)
    const { month, date, year, loggedUser, getMonth, notifySuccess, notifyFailed, role } = useContext(AuthContext)
    const [showReceipt, setShowReceipt] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pdata, setPdata] = useState({})
    const [navigate, setNavigate] = useState(false)
    const [paymentType, setPaymentType] = useState('Monthly')
    const [displayCoupon, setCoupon] = useState(null)
    const [newStudent, setNewStudent] = useState(false)
    const [entryMonth, setEntryMonth] = useState(month)
    const [entryYear, setEntryYear] = useState(year)

    const handleOptionChange = (event) => {
        setPaymentType(event.target.value);
    };

    const [disabled, setDisabled] = useState(false)
    const handleSelect = e => {
        setDisabled(true)
        setTimeout(() => {
            setDisabled(false)
        }, 500)
    }

    const [unpaidMonths, setUnpaidMonths] = useState([])


    useEffect(() => {
        if (user.id && user.payments.length) {
            const examPayment = user.payments.find(payment => payment.type == "Exam Fee")
            const allMonthlyPayments = []
            user.payments.forEach(payment => {
                if (payment.type == "Monthly") {
                    allMonthlyPayments.push(payment)
                }
            })
            if (examPayment && allMonthlyPayments.length == 0) {
                setNewStudent(true)
            }
            const lastMonthlyPayment = allMonthlyPayments[allMonthlyPayments.length - 1]

            let bulb = false;
            const unpaid = []
            const yearArray = [2024, 2025, 2026, 2027, 2028, 2029, 2030]
            if (lastMonthlyPayment) {
                for (let i = 0; i < 7; i++) {
                    for (let j = 1; j <= 12; j++) {
                        if (bulb) {
                            const obj = { month: j, monthName: getMonth(j), year: yearArray[i] }
                            unpaid.push(obj)
                            if (j == parseInt(month) && yearArray[i] == parseInt(year)) {
                                bulb = false
                                setUnpaidMonths(unpaid)
                            }
                        }
                        if (j == parseInt(lastMonthlyPayment.pmonth) && yearArray[i] == parseInt(lastMonthlyPayment.pyear)) {
                            bulb = true
                        }
                    }
                }
                if ((parseInt(lastMonthlyPayment.pmonth) == parseInt(month)) && (parseInt(lastMonthlyPayment.pyear) == parseInt(year))) {
                    setUnpaidMonths([])
                }
            }
        }
        else if (user.id && !user.payments.length) {
            notifyFailed("Program entry needed for payment.")
            setNoProgram(true)
        }
    }, [user]);

    useEffect(() => {
        if (unpaidMonths.length != 0) {
            setEntryMonth(unpaidMonths[0].month)
            setEntryYear(unpaidMonths[0].year)
        }
        else if (!unpaidMonths.length) {
            const allMonthlyPayments = []
            user.payments.forEach(payment => {
                if (payment.type == "Monthly") {
                    allMonthlyPayments.push(payment)
                }
            })

            const lastMonthlyPayment = allMonthlyPayments[allMonthlyPayments.length - 1]
            const lastPaidMonth = parseInt(lastMonthlyPayment?.pmonth)
            const lastPaidYear = parseInt(lastMonthlyPayment?.pyear)

            if (lastPaidMonth == month && lastPaidYear == year) {
                if (month == 12) {
                    setEntryMonth(1)
                    setEntryYear(year + 1)
                }
                else {
                    setEntryMonth(month + 1);
                    setEntryYear(year)
                }
            }
            else if ((lastPaidMonth > month) || (lastPaidYear > year)) {
                if (lastPaidMonth == 12) {
                    setEntryMonth(1)
                    setEntryYear(lastPaidYear + 1);
                }
                else {
                    setEntryMonth(lastPaidMonth + 1)
                    setEntryYear(lastPaidYear)
                }
            }
        }
        setFirstLoading(false)
    }, [unpaidMonths])


    const { monthlyAmount, name, id, payments, phone } = user;

    const handlePayment = async (event) => {
        event.preventDefault();
        if (user.programs.length == 0) {
            notifyFailed("Student must be in a program!");
            return;
        }

        setLoading(true);
        const id = user.id;
        const name = user.name;
        const type = event.target.type.value;
        const pmonth = event.target.pmonth.value;
        const pyear = event.target.pyear.value;
        let pamount = event.target.pamount.value;
        const payDate = `${date}-${month}-${year}`;
        const ptaken = loggedUser;
        const coupon = event.target.coupon.value;

        if (coupon) {
            try {
                const response = await fetch(`${API_URL}/getcoupon/${coupon}`);
                const data = await response.json();
                if (!data.amount) {
                    notifyFailed("Invalid Coupon");
                    setLoading(false);
                    return;
                } else {
                    pamount -= data.amount;
                    setCoupon(data);
                    if (data.month !== pmonth) {
                        notifyFailed("Coupon is not for this month");
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error fetching coupon:", error);
                notifyFailed("Error checking coupon");
                setLoading(false);
                return;
            }
        }

        if (!ptaken) {
            notifyFailed("Taker name not Loaded, Please refresh!");
            setLoading(false);
            return;
        }

        const alreadyPaid = user.payments.some(payment =>
            payment.type === type &&
            payment.pmonth == pmonth &&
            payment.pyear == pyear
        );

        if (alreadyPaid) {
            notifyFailed("Already paid for selected month!");
            setLoading(false);
            return;
        }

        const pdata = {
            id, type, pmonth, pyear, pamount, payDate, ptaken, date, month, year, name
        };
        const tempPayments = [...user.payments];
        tempPayments.push(pdata);

        const newUser = { ...user, payments: tempPayments }

        try {
            const response = await fetch(`${API_URL}/addpayment/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            const data = await response.json();

            if (data.modifiedCount) {
                setUser(newUser)
                const smsResponse = await fetch('https://bulksmsbd.net/api/smsapi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_key: 'CUOP72nJJHahM30djaQG',
                        senderid: '8809617642567',
                        number: phone,
                        message: `${type} payment for ${getMonth(pmonth)} is successful\nId: ${id}\nName: ${name}\nPaid: ${pamount} TK${coupon ? `\nDiscount: ${displayCoupon.amount} (${displayCoupon.title})` : ''}\nReceived by: ${ptaken}\n SOHAG PHYSICS`
                    }),
                });

                const smsData = await smsResponse.json();
                if (smsData.response_code === 202) {
                    notifySuccess("Payment Successful!");
                    setNewStudent(false)
                }
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            notifyFailed("Error processing payment");
        } finally {
            setLoading(false);
        }
    };

    if (!(role == 'CEO' || loggedUser == 'Sree Krishno')) return <div className="p-10 text-center font-bold text-rose-500">No Access</div>
    if (firstLoading) return <div className="flex h-96 items-center justify-center"><span className="loading loading-spinner loading-lg text-cyan-500"></span></div>

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='pb-20'
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600">
                        <FiCreditCard size={24} />
                    </div>
                    <h1 className='font-black text-2xl lg:text-3xl text-slate-800 tracking-tight'>Payment Entry</h1>
                </div>
                <Link to="/payment" className="btn btn-ghost rounded-xl flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors">
                    <FiArrowLeft /> Back
                </Link>
            </div>

            <form className='mx-auto w-full' onSubmit={handlePayment} >
                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Student Info Card */}
                    <div className='lg:w-2/5'>
                        <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 sticky top-24">
                            <div className='flex items-center justify-between mb-6'>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <img className='w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg' src={`${user.image ? user.image : '/profile.jpg'}`} alt={name} />
                                        <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white p-1.5 rounded-lg shadow-lg">
                                            <FiUser size={12} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800 leading-tight">{name}</h3>
                                        <p className="text-sm font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg inline-block mt-1">ID: {id}</p>
                                    </div>
                                </div>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                                        <FiMoreVertical size={20} />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 w-48 z-[1]">
                                        <li><Link className="flex items-center gap-2 font-bold py-3" to={`/students/${user.id}`}><CgProfile className="text-cyan-500" /> View Profile</Link></li>
                                        <li><Link className="flex items-center gap-2 font-bold py-3" to={`/attendance/${user.id}`}><FiActivity className="text-amber-500" /> Attendance</Link></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Fee</p>
                                    <p className="text-2xl font-black text-slate-800 flex items-center gap-1">{monthlyAmount}<span className="text-slate-400 text-lg"><TbCurrencyTaka /></span></p>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                    <p className="text-sm font-bold text-slate-700">{phone || 'N/A'}</p>
                                </div>
                            </div>

                            {newStudent ? (
                                <div className='bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-cyan-200 font-bold text-center flex items-center justify-center gap-2'>
                                    <FiCheckCircle /> New Student
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-inner">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <p className='font-black text-xs text-slate-500 uppercase tracking-wider'>Payment Status</p>
                                        {unpaidMonths.length ? (
                                            <span className='bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter'>Unpaid: {unpaidMonths.length}</span>
                                        ) : (
                                            <span className='bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter'>All Clear</span>
                                        )}
                                    </div>
                                    <div className={`space-y-2 ${unpaidMonths.length && 'max-h-40'} overflow-y-auto pr-2 custom-scrollbar`}>
                                        {unpaidMonths.length > 0 ? (
                                            unpaidMonths.map((unpaid, index) => (
                                                <div className='bg-rose-50/50 border border-rose-100 rounded-xl p-3 flex justify-between items-center group hover:bg-rose-50 transition-colors' key={index}>
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar size={14} className="text-rose-400" />
                                                        <span className="font-bold text-rose-700">{unpaid.monthName}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-rose-300 group-hover:text-rose-400">{unpaid.year}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center">
                                                <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                                                    <FiCheckCircle size={24} />
                                                </div>
                                                <p className="text-sm font-bold text-emerald-600">No pending payments</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className='lg:w-3/5'>
                        <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-6">
                            <div className="flex items-center gap-2 mb-2 text-cyan-600">
                                <FiDollarSign size={20} />
                                <h2 className="font-black text-xl text-slate-800 tracking-tight">Transaction Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className='font-bold text-sm text-slate-700 ml-1'>Payment Type</label>
                                    <select
                                        name='type'
                                        onChange={handleOptionChange}
                                        defaultValue="Monthly"
                                        className="input-premium w-full pt-3"
                                    >
                                        <option>Monthly</option>
                                        <option>Due</option>
                                        <option>Note Fee</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className='font-bold text-sm text-slate-700 ml-1'>Amount (TK)</label>
                                    <div className="relative">
                                        <input
                                            required
                                            name='pamount'
                                            defaultValue={monthlyAmount}
                                            type="number"
                                            readOnly={role !== 'CEO' && paymentType === 'Monthly'}
                                            onWheel={(e) => e.target.blur()}
                                            className="input-premium w-full pl-10"
                                        />
                                        <TbCurrencyTaka className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className='font-bold text-sm text-slate-700 ml-1'>For Month</label>
                                    <select name='pmonth' defaultValue={entryMonth} className="input-premium w-full pt-3">
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{getMonth(i + 1)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className='font-bold text-sm text-slate-700 ml-1'>For Year</label>
                                    <select name='pyear' defaultValue={entryYear} className="input-premium w-full pt-3">
                                        {[2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className='font-bold text-sm text-slate-700 ml-1 flex items-center gap-1'><FiTag size={12} /> Coupon Code (Optional)</label>
                                    <input
                                        name='coupon'
                                        type="text"
                                        placeholder="Enter promo code"
                                        className="input-premium w-full"
                                    />
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className="btn-premium w-full h-16 flex items-center justify-center gap-3 text-lg font-bold mt-4"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner"></span>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <FiCheckCircle size={24} />
                                        <span>Confirm Payment</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Recent Payments Section */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6 px-4">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <FiClock size={20} />
                                    <h2 className="font-black text-xl text-slate-800 tracking-tight">Recent Activity</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {[...payments].reverse().slice(0, 5).map((payment, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <PaymentCard payment={payment} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {payments.length > 5 && (
                                    <div className="text-center mt-6">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing last 5 payments</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {navigate ? <Navigate to={`/payment`}></Navigate> : <></>}
            {noProgram && <Navigate to={`/programentry/${user.id}`}></Navigate>}
        </motion.div>
    )
}

export default AddPayment
