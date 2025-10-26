import React, { useContext, useEffect, useState } from 'react'
import { Link, Navigate, useLoaderData, useLocation } from 'react-router-dom'
import { AuthContext } from '../Provider'
import { FiCheckCircle } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import { TbCurrencyTaka } from "react-icons/tb";
import PaymentCard from './PaymentCard';
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";
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
    //Basic data
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

        //entry month portion
    useEffect(() => {

        if (unpaidMonths.length != 0) {
            // //console.log(unpaidMonths)
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
    //Last month status
    const [lastMonthPaid, setLastMonthPaid] = useState(false)
    let lastYear = year
    var lastMonth = month - 1;
    if (lastMonth == 0) {
        lastMonth += 12;
        lastYear--;
    }
    const lastMonthText = getMonth(lastMonth)



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
            // //console.log("Checking coupon...");
            try {
                const response = await fetch(`https://spoffice-server.vercel.app/getcoupon/${coupon}`);
                const data = await response.json();
                if (!data.amount) {
                    notifyFailed("Invalid Coupon");
                    setLoading(false);
                    return; // Stop the function here
                } else {
                    pamount -= data.amount;
                    // //console.log(pamount);
                    setCoupon(data);
                    if (data.month !== pmonth) {
                        notifyFailed("Coupon is not for this month");
                        setLoading(false);
                        return; // Stop the function here
                    }
                }
            } catch (error) {
                console.error("Error fetching coupon:", error);
                notifyFailed("Error checking coupon");
                setLoading(false);
                return; // Stop the function here
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
        const tempPayments = user.payments;
        tempPayments.push(pdata);

        const newUser = { ...user, payments: tempPayments }



        try {
            const response = await fetch(`https://spoffice-server.vercel.app/addpayment/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            const data = await response.json();

            if (data.modifiedCount) {
                // notifySuccess("Payment Successful!");
                // setNavigate(true);

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

    return (
        (role == 'CEO' || loggedUser == 'Sree Krishno') ?
            firstLoading ? <div>Loading user</div> :
                <div>
                    <form className='mx-auto w-full' onSubmit={handlePayment} >

                        {/* students part */}
                        <div className='flex mt-2 flex-col gap-5 lg:flex-row'>
                            <div className='lg:w-2/5'>
                                <h1 className='font-bold text-2xl '>Payment Entry :</h1>
                                <p className='font-semibold'>Payment Information</p> <hr />

                                <div className='flex py-3 px-2 items-center my-2 justify-between'>
                                    <p className='font-bold text-lg lg:text-2xl'>{name} <span className='bg-sky-100 text-sky-500 font-semibold text-xl px-4 rounded-xl py-1'>{id}</span></p>
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="rounded-full p-1 bg-sky-200  font-semibold"><BsThreeDotsVertical /></div>
                                        <ul onClick={() => { handleSelect() }} tabIndex={0} className={`dropdown-content ${disabled ? 'hidden' : ''} menu bg-sky-100 text-sky-600 font-semibold rounded-box z-[1] w-52 p-2 shadow `}>
                                            <li><Link to={`/students/${user.id}`}><CgProfile /> Profile</Link></li>
                                            <li className=''><Link to={`/attendance/${user.id}`}> <FaMoneyBillTransfer /> Attendance</Link></li>

                                        </ul>
                                    </div>
                                </div>
                                <div className='flex  border-sky-400 py-1 my-1 rounded-lg px-4 border items-center'>
                                    <div className='w-1/2    mx-auto '>
                                        <img className='rounded-lg w-2/3' src={`${user.image ? user.image : '/profile.jpg'}`} alt="Image" />
                                    </div>
                                    <div className='flex flex-col items-center my-2  rounded-lg py-3 w-1/2'>

                                        <p className='text-2xl  text-sky-500 font-semibold flex gap-1 items-center '>{monthlyAmount} <span className=' text-lg lg:text-2xl'><TbCurrencyTaka /></span></p>
                                        <p className='font-semibold'>Monthly</p>
                                    </div>
                                </div>

                                {newStudent ? <div className='text-sky-600 text-sm lg:text-base p-1 px-5 text-start border border-sky-600 rounded-lg my-1 font-semibold'>
                                    New Student
                                </div> :
                                    <div className='p-2 border-sky-400 border rounded-lg text-center'>
                                        {unpaidMonths.length ? <p className='font-semibold my-2'>Unpaid Months: <span className='text-red-600 font-bold'>{unpaidMonths.length}</span></p> : <p className=' font-semibold text-green-700'>All Payments Clear</p>}
                                        <div className={`p-1 text-sm lg:text-base ${unpaidMonths.length && 'h-28'} overflow-auto`}>
                                            {
                                                unpaidMonths.map((unpaid, index) => <div className='border border-red-600 rounded-lg my-1 flex justify-center gap-3 items-center text-red-600 font-semibold' key={index}>
                                                    <div>{unpaid.monthName}</div>
                                                    <div>
                                                        {unpaid.year}
                                                    </div>
                                                </div>)
                                            }
                                        </div>
                                    </div>}

                            </div>
                            <div className='grid grid-cols-1  lg:w-3/5  gap-3'>



                                <div>
                                    <p className='font-semibold'>Payment Type <span className='text-red-700'>*</span> </p>
                                    <select name='type'
                                        onChange={handleOptionChange}
                                        defaultValue={month} className="select select-inf text-lg font-semibold w-full ">

                                        <option >Monthly</option>
                                        <option >Due</option>
                                        <option >Note Fee</option>


                                    </select>
                                </div>
                                {
                                    role == "CEO" && <div>
                                        <p className='font-semibold'>Amount <span className='text-red-700'>*</span> </p>
                                        <input
                                            required
                                            name='pamount'
                                            defaultValue={monthlyAmount}
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            className="input text-lg font-semibold  input-bordered input-info w-full " />
                                    </div>}
                                {role != 'CEO' && paymentType == 'Monthly' &&
                                    <div>
                                        <p className='font-semibold'>Amount <span className='text-red-700'>*</span> </p>
                                        <input
                                            required
                                            name='pamount'
                                            value={monthlyAmount}
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            className="input text-lg font-semibold  input-bordered input-info w-full " />
                                    </div>
                                }
                                {role != 'CEO' && paymentType == 'Note Fee' &&
                                    <div>
                                        <p className='font-semibold'>Amount <span className='text-red-700'>*</span> </p>
                                        <input
                                            required
                                            name='pamount'

                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            className="input text-lg font-semibold  input-bordered input-info w-full " />
                                    </div>
                                }
                                <div className='flex flex-col lg:flex-row gap-2 justify-between'>
                                    <div className='w-full lg:w-1/2'>
                                        <p className='font-semibold'>Month <span className='text-red-700'>*</span> </p>
                                        <select name='pmonth' value={entryMonth} className="select text-lg font-semibold   select-info w-full ">

                                            <option value={1}>January</option>
                                            <option value={2}>February</option>
                                            <option value={3}>March</option>
                                            <option value={4}>April</option>
                                            <option value={5}>May</option>
                                            <option value={6}>June</option>
                                            <option value={7}>July</option>
                                            <option value={8}>August</option>
                                            <option value={9}>September</option>
                                            <option value={10}>October</option>
                                            <option value={11}>November</option>
                                            <option value={12}>December</option>

                                        </select>
                                    </div>
                                    <div className='w-full lg:w-1/2'>
                                        <p className='font-semibold'>Year <span className='text-red-700'>*</span> </p>
                                        <select name='pyear' value={entryYear} className="select text-lg font-semibold  select-info w-full ">

                                            <option value={2022}>2022</option>
                                            <option value={2023}>2023</option>
                                            <option value={2024}>2024</option>
                                            <option value={2025}>2025</option>
                                            <option value={2026}>2026</option>
                                            <option value={2027}>2027</option>
                                            <option value={2028}>2028</option>
                                            <option value={2029}>2029</option>
                                            <option value={2030}>2030</option>


                                        </select>
                                    </div>
                                    <div>
                                        <p className='font-semibold'>Coupon  </p>
                                        <input

                                            name='coupon'

                                            type="text"

                                            className="input text-lg font-semibold  input-bordered input-info w-full " />
                                    </div>

                                </div>
                                <div className='flex  mt-2 flex-col lg:flex-row'>

                                    <div className=' text-center  w-full'>
                                        <input className="font-semibold h-11 w-full bg-blue-100  border-2 rounded-xl   btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Confirm"}`} />
                                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                                    </div>
                                </div>

                            </div>
                        </div>


                        {
                            <div className=''>{showReceipt && <MonthlyReciept data={pdata} />}</div>
                        }
                    </form>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Recent Payments</h2>
                        {[...payments].reverse().map((payment, index) => (
                            <PaymentCard key={index} payment={payment} />
                        ))}
                    </div>
                    {navigate ? <Navigate to={`/payment`}></Navigate> : <></>}
                    {noProgram && <Navigate to={`/programentry/${user.id}`}></Navigate>}

                </div>
            : <div>No Access</div>

    )
}

export default AddPayment