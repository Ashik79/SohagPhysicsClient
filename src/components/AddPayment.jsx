import React, { useContext, useEffect, useState } from 'react'
import { Link, Navigate, useLoaderData } from 'react-router-dom'
import { AuthContext } from '../Provider'
import { FiCheckCircle } from "react-icons/fi";
import { ImCross } from "react-icons/im";
import Swal from 'sweetalert2';
import { TbCurrencyTaka } from "react-icons/tb";
import PaymentCard from './PaymentCard';
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";




function AddPayment() {
    const user = useLoaderData()
    const { month, date, year, loggedUser, getMonth, notifySuccess, notifyFailed, role } = useContext(AuthContext)
    const [showReceipt, setShowReceipt] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pdata, setPdata] = useState({})
    const [navigate, setNavigate] = useState(false)

    const [displayCoupon, setCoupon] = useState(null)
    const [newStudent, setNewStudent] = useState(false)

    console.log(user)
    const { monthlyAmount, name, id, payments, phone } = user;
    const reversedPayments = [...payments].reverse();

    const [disabled, setDisabled] = useState(false)
    const handleSelect = e => {
        console.log('s')
        setDisabled(true)
        setTimeout(() => {
            setDisabled(false)
        }, 500)
    }

   



    //Last month status
    const [lastMonthPaid, setLastMonthPaid] = useState(false)
    let lastYear = year
    var lastMonth = month - 1;
    if (lastMonth == 0) {
        lastMonth += 12;
        lastYear--;
    }
    const lastMonthText = getMonth(lastMonth)
    console.log(lastMonthText);

    useEffect(() => {
       
        user.payments.forEach(payment => {
            if (payment.type == "Monthly" && parseInt(payment.pmonth) == lastMonth && parseInt(payment.pyear) == lastYear) {
                setLastMonthPaid(true);
            }
        });
        if (!lastMonthPaid) {
            const haveMonthly = payments.some(payment => payment.type == "Monthly")
            if (!haveMonthly) { setNewStudent(true) }
        }
    }, [user.payments, month,user]);

    const handlePayment = async (event) => {
        event.preventDefault();
        if (user.programs.length === 0) {
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
            console.log("Checking coupon...");
            try {
                const response = await fetch(`https://spoffice-server.vercel.app/getcoupon/${coupon}`);
                const data = await response.json();
                if (!data.amount) {
                    notifyFailed("Invalid Coupon");
                    setLoading(false);
                    return; // Stop the function here
                } else {
                    pamount -= data.amount;
                    console.log(pamount);
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
            return; // Stop the function here
        }

        if (!lastMonthPaid && !newStudent && pmonth != lastMonth && type =='Monthly') {
            notifyFailed(`Did not paid for ${lastMonthText}`)
            setLoading(false)
            return;
        }

        const pdata = {
            id, type, pmonth, pyear, pamount, payDate, ptaken, date, month, year, name
        };

        user.payments.push(pdata);
        console.log(user);

        try {
            const response = await fetch(`https://spoffice-server.vercel.app/addpayment/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();

            if (data.modifiedCount) {
                // notifySuccess("Payment Successful!");
                // setNavigate(true);

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
        <div>
            <form className='mx-auto w-full' onSubmit={handlePayment} >

                {/* students part */}
                <div className='flex mt-2 flex-col gap-5 lg:flex-row'>
                    <div className='lg:w-2/5'>
                        <h1 className='font-bold text-2xl '>Payment Entry :</h1>
                        <p className='font-semibold'>Payment Information</p> <hr />
                        <div className='flex py-3 px-2 items-center my-2 justify-between'>
                            <p className='font-bold text-3xl'>{name} <span className='bg-sky-100 text-sky-500 font-semibold text-xl px-4 rounded-xl py-1'>{id}</span></p>
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="rounded-full p-1 bg-sky-200  font-semibold"><BsThreeDotsVertical /></div>
                                <ul onClick={() => { handleSelect() }} tabIndex={0} className={`dropdown-content ${disabled ? 'hidden' : ''} menu bg-sky-100 text-sky-600 font-semibold rounded-box z-[1] w-52 p-2 shadow `}>
                                    <li><Link to={`/students/${user.id}`}><CgProfile /> Profile</Link></li>
                                    <li className=''><Link to={`/attendance/${user.id}`}> <FaMoneyBillTransfer /> Attendance</Link></li>

                                </ul>
                            </div>
                        </div>
                        <div className='flex flex-col items-center my-2 justify-center rounded-lg py-3  border-sky-400 border'>
                            <p className='text-3xl text-sky-500 font-semibold flex gap-1 items-center '>{monthlyAmount} <span className='text-3xl'><TbCurrencyTaka /></span></p>
                            <p className='font-semibold'>Monthly</p>
                        </div>

                        <p className='font-semibold my-2'>Last month status</p>
                        {lastMonthPaid ? <><p className='text-sky-600 flex items-center border rounded-xl border-sky-600 gap-2 py-1 px-5 font-semibold text-lg'><span className='text-green-700 font-bold'><FiCheckCircle /></span> Paid for {lastMonthText}</p></> : newStudent ? <p className='text-blue-600 border border-blue-600 rounded-xl flex items-center gap-2 py-1 px-5 font-semibold text-lg'>New Student</p> : <><p className='text-red-600 border border-red-600 rounded-xl flex items-center gap-2 py-1 px-5 font-semibold text-lg'><ImCross /> Not paid for {lastMonthText}</p></>}
                    </div>
                    <div className='grid grid-cols-1  lg:w-3/5  gap-3'>



                        <div>
                            <p className='font-semibold'>Payment Type <span className='text-red-700'>*</span> </p>
                            <select name='type' defaultValue={month} className="select select-inf text-lg font-semibold w-full ">

                                <option >Monthly</option>
                                <option >Due</option>
                                <option >Note Fee</option>


                            </select>
                        </div>
                        {
                            role == "CEO" ? <div>
                                <p className='font-semibold'>Amount <span className='text-red-700'>*</span> </p>
                                <input
                                    required
                                    name='pamount'
                                    defaultValue={monthlyAmount}
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    className="input text-lg font-semibold  input-bordered input-info w-full " />
                            </div> : <div>
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
                        <div className='flex flex-col lg:flex-row gap-2 justify-between'>
                            <div className='w-full lg:w-1/2'>
                                <p className='font-semibold'>Month <span className='text-red-700'>*</span> </p>
                                <select name='pmonth' defaultValue={month} className="select text-lg font-semibold   select-info w-full ">

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
                                <select name='pyear' defaultValue={year} className="select text-lg font-semibold  select-info w-full ">

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
                <div className=''>{showReceipt && <MonthlyReciept  data={pdata} />}</div>
            }
            </form>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Recent Payments</h2>
                {reversedPayments.map((payment, index) => (
                    <PaymentCard key={index} payment={payment} />
                ))}
            </div>
            {navigate ? <Navigate to={`/payment`}></Navigate> : <></>}
            
        </div>
    )
}

export default AddPayment