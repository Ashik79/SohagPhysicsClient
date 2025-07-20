import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider'

function DueView({ student }) {
    const [newStudent, setNewStudent] = useState(false)
    const [unpaidMonths, setUnpaidMonths] = useState([])
    const { getMonth, year, month } = useContext(AuthContext)

    useEffect(() => {
    // Reset state on new student
    setNewStudent(false);
    setUnpaidMonths([]);

    if (!student ) return;

    if (student.payments.length === 0) {
        setNewStudent(true);
        return;
    }

    const examPayment = student.payments.find(payment => payment.type === "Exam Fee");
    const allMonthlyPayments = student.payments.filter(payment => payment.type === "Monthly");

    if (examPayment && allMonthlyPayments.length === 0) {
        setNewStudent(true);
        return;
    }

    if (allMonthlyPayments.length === 0) return;

    const lastMonthlyPayment = allMonthlyPayments[allMonthlyPayments.length - 1];

    const unpaid = [];
    const yearArray = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    let foundLast = false;

    for (let i = 0; i < yearArray.length; i++) {
        for (let j = 1; j <= 12; j++) {
            if (foundLast) {
                unpaid.push({ month: j, monthName: getMonth(j), year: yearArray[i] });
                if (j === parseInt(month) && yearArray[i] === parseInt(year)) {
                    setUnpaidMonths([...unpaid]);
                    return;
                }
            }

            if (
                j === parseInt(lastMonthlyPayment.pmonth) &&
                yearArray[i] === parseInt(lastMonthlyPayment.pyear)
            ) {
                foundLast = true;
            }
        }
    }

    // If current month already paid
    if (
        parseInt(lastMonthlyPayment.pmonth) === parseInt(month) &&
        parseInt(lastMonthlyPayment.pyear) === parseInt(year)
    ) {
        setUnpaidMonths([]);
    }
}, [student, month, year, getMonth]);

    return (
        <div> {/* Payment Status */}

            {newStudent ? <div className='text-sky-600 text-sm lg:text-base p-1 px-5 text-start border border-sky-600 rounded-lg my-1 font-semibold'>
                New Student
            </div> :
                <div className='p-2 border-sky-400 mt-2 border rounded-lg text-center'>
                    {unpaidMonths.length ? <p className='font-semibold my-2'>Unpaid Months: <span className='text-red-600 font-bold'>{unpaidMonths.length}</span></p> : <p className=' font-semibold text-green-700'>All Payments Clear</p>}
                    <div className={`p-1 text-sm lg:text-base ${unpaidMonths.length && 'h-28'} overflow-auto`}>
                        {
                            unpaidMonths.map((unpaid, index) => <div className='border border-red-600 rounded-md my-1 flex justify-center gap-3 items-center text-red-600 font-semibold' key={index}>
                                <div>{unpaid.monthName}</div>
                                <div>
                                    {unpaid.year}
                                </div>
                            </div>)
                        }
                    </div>
                </div>}
        </div>
    )
}

export default DueView