import React from 'react'

function StudentDetailsPart({ student }) {
    const { address, admissionDate, lastEdit, admittedBy, note, batch, college, waver, gname, gphone, id, monthlyAmount, name, phone, program, reference, school, session, target } = student

    return (
        <div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Monthly Fee
                </span>
                <span className='font-semibold w-3/5'>
                    {monthlyAmount}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Batch
                </span>
                <span className='font-semibold w-3/5'>
                    {batch}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Program
                </span>
                <span className='font-semibold w-3/5'>
                    {program}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Session
                </span>
                <span className='font-semibold w-3/5'>
                    {session}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Phone
                </span>
                <span className='font-semibold w-3/5'>
                    {phone}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    School
                </span>
                <span className='font-semibold w-3/5'>
                    {school}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    College
                </span>
                <span className='font-semibold w-3/5'>
                    {college}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Address
                </span>
                <span className='font-semibold w-3/5'>
                    {address}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Guardian
                </span>
                <span className='font-semibold w-3/5'>
                    {gname}
                    <br />
                    {gphone}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    referenced by
                </span>
                <span className='font-semibold w-3/5'>
                    {reference}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Note (মন্তব্য)
                </span>
                <span className='font-semibold w-3/5'>
                    {note}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Last Edit
                </span>
                <span className='font-semibold w-3/5'>
                    {lastEdit ? lastEdit : "None"}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-sky-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Assigned by
                </span>
                <span className='font-semibold w-3/5'>
                    {admittedBy}
                    <br />
                    {admissionDate}
                </span>
            </div>
            <div className='flex items-center text-sm lg:text-base  rounded-xl pl-4 bg-gray-200 px-2 py-1 mt-2'>
                <span className='w-2/5'>
                    Waver
                </span>
                <span className='font-semibold w-3/5'>
                    {waver}
                </span>
            </div>

        </div>
    )
}

export default StudentDetailsPart