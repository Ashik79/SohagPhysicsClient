import React, { useState } from 'react'
import NumberSheet from './NumberSheet'
import PaidList from './PaidList'
import UnpaidList from './UnpaidList'
import PresentList from './PresentList'
import AbsentList from './AbsentList'
import CustomList from './CustomList'
import MonthlyReport from './MonthlyReport'
import PaymentReport from './PaymentReport'

function DownloadCenter() {
    const [downlaodOption, setDownlaodOption] = useState("phone")
    const optionChange = e => {
        setDownlaodOption(e.target.value)
    }
const loadedComponent = ()=>{
    switch(downlaodOption){
        case "phone":return <div><NumberSheet></NumberSheet></div>
        case "paid":return <div><PaidList></PaidList></div>
        case "unpaid":return <div><UnpaidList></UnpaidList></div>
        case "present":return <div><PresentList></PresentList></div>
        case "absent":return <div><AbsentList></AbsentList></div>
        case "report":return <div><MonthlyReport></MonthlyReport></div>
        case "payment":return <div><PaymentReport></PaymentReport></div>
        case "custom":return <div><CustomList></CustomList></div>
    }
}

    return (
        <div>
            <h2 className='font-semibold text-xl lg:text-2xl text-center underline'>Download Center</h2>

            <div className='flex gap-3 items-center mt-4'>
                <p className='text-gray-600 font-semibold mr-3 '>
                    Select Preset:
                </p>
                <select name='target' onChange={optionChange} className="select  font-semibold  select-info flex-grow">

                    <option value={"phone"}>Number Sheet</option>
                    <option value={"paid"}>Paid List</option>
                    <option value={"unpaid"}>Unpaid List</option>
                    <option value={"present"}>Present List</option>
                    <option value={"absent"}>Absent List</option>
                    <option value={"report"}>Monthly Report</option>
                    <option value={"payment"}>Payment Report</option>
                    <option value={"custom"}>Custom Sheet</option>
                </select>
            </div>

            {loadedComponent()}
            
            

        </div>
    )
}

export default DownloadCenter