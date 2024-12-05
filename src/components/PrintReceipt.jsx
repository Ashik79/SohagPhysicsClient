import React, { useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../Provider';

function PrintReceipt() {
  const { getMonth } = useContext(AuthContext)
  const receiptRef = useRef(null);
  const location = useLocation();
  const payment = location.state?.payment;
  const handlePrint = () => {
    const printContent = receiptRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
  }

  return (
    <div className='w-full'>
      <div ref={receiptRef} className="receipt-container py-10 px-20 max-w-[800px]">
        <div className="flex justify-between items-center mb-12 mt-20  w-3/4 mx-auto">
          <h2 className="text-3xl  w-2/3  font-bold mb-4 flex justify-center items-center"><span className='border-b-2 border-black'>Payment Receipt</span></h2>
          <div className="logo-container">
            <img src="bwlogo.png" alt="Your Logo" className="w-32 h-32" />
          </div>
        </div>
        <div className='w-2/3 mx-auto flex justify-between items-center'>
          <div className='w-1/3'>
            <p className="mb-2"><strong>Student Id:</strong> </p>
            <p className="mb-2"><strong>Payment Type:</strong> </p>
            {payment.type !== 'Monthly'  ? <p className="mb-2"><strong>Program:</strong> </p> : <></>}
            {payment.type == 'Monthly' ? <p className="mb-2"><strong>Paid for:</strong> </p> : <></>}
            <p className="mb-2"><strong>Amount Paid:</strong> </p>
      
            <p className="mb-2"><strong>Payment Date:</strong> </p>
          </div>
          <div className='w-2/3'>
            <p className="mb-2"> {payment.id}</p>
            <p className="mb-2"> {`${payment.type} Payment `}</p>
            {payment.type == 'Monthly' ? <p className="mb-2"> {`${getMonth(payment.pmonth)}, ${payment.pyear}`}</p> : <></>}
            {payment.type !== 'Monthly'  ? <p className="mb-2"> {payment.program}</p> : <></>}
            <p className="mb-2"> {payment.pamount} Tk only</p>
      
            <p className="mb-2"> {payment.payDate}</p>
          </div>
        </div>
        <div className='flex justify-between items-center mt-10'>
          <div className='w-1/3 text-center'>
            <p className=" text-center border-b font-semibold border-black"> {payment.name}</p>
            <p className="mt-2"><strong>Paid By</strong> </p>
          </div>
          <div className='w-1/3 text-center'>
            <p className=" text-center border-b font-semibold border-black"> {payment.ptaken}</p>
            <p className="mt-2"><strong>Received By</strong> </p>
          </div>
        </div>
      </div>
      <div className='w-full text-center'>
      <button className=' border-2 border-sky-600 font-bold text-sm py-1 px-5 w-full text-sky-600 rounded-xl hover:bg-sky-200' onClick={handlePrint}>Print </button>
      </div>
    </div>

  );
}

export default PrintReceipt;