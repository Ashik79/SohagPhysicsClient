import { AuthContext } from '../../Provider';
import React, { useContext, useEffect, useState } from 'react';
import SessionCard from './SessionCard';
import { FaSpinner } from 'react-icons/fa';
function MyEntry() {
    const { staff, month, year, date, notifyFailed } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [checked, setChecked] = useState(false); // Determines if there is an active session
    const [session, setSession] = useState({}); // Current active session

    const today = `${date}-${month}-${year}`;

    useEffect(() => {
        if (staff?.sessions?.length) {
            const lastSession = staff.sessions[staff.sessions.length - 1];
            setSessions(staff.sessions);

            if (lastSession && !lastSession.out) {
                setSession(lastSession);
                setChecked(false); // Active session exists
            } else {
                setChecked(true); // No active session
            }
        } else {
            setChecked(true); // No sessions available
        }
    }, [staff]);

    const getCurrentTime = () => {
        const now = new Date();
        return {
            hour: now.getHours(),
            minute: now.getMinutes(),
        };
    };
    const { hour: defaultHour, minute: defaultMinute } = getCurrentTime();

    // Reverse sessions for display and limit to 100
    const reversedSessions = [...sessions].reverse();
    const first100 = reversedSessions.length > 100 ? reversedSessions.slice(0, 100) : reversedSessions;

    // Calculate active session duration
    let activeHr, activeMin;
    if (session.date) {
        let totalNow = defaultHour * 60 + defaultMinute;
        let totalSession = session.inHour * 60 + session.inMin;
        if (totalNow < totalSession) {
            totalNow += 24 * 60; // Handle overnight sessions
        }
        let totalMin = totalNow - totalSession;
        activeHr = Math.floor(totalMin / 60);
        activeMin = totalMin % 60;
    }

    const handleEntry = async (e) => {
        e.preventDefault();
        const hr = parseInt(e.target.hour.value);
        const min = parseInt(e.target.min.value);
        const reason = e.target.reason.value;

        if (checked) {
            // Start a new session
            const newSession = {
                date: today,
                inHour: hr,
                inMin: min,
                out: false,
                inPlace: reason,
            };

            try {
                const response = await fetch(`https://spoffice-server.vercel.app/updatestaff/${staff._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...staff, sessions: [...sessions, newSession] }),
                });
                const data = await response.json();

                if (data.modifiedCount) {
                    setSessions((prev) => [...prev, newSession]);
                    setSession(newSession);
                    setChecked(false); // Session started
                }
            } catch (error) {
                notifyFailed('Error starting a new session');
            }
        } else {
            // End the current session
            const updatedSession = {
                ...session,
                out: true,
                outHour: hr,
                outMin: min,
                outReason: reason,
            };

            const inTime = session.inHour * 60 + session.inMin;
            let outTime = hr * 60 + min;
            if (outTime < inTime) {
                outTime += 24 * 60; // Handle overnight sessions
            }
            const durationMinutes = outTime - inTime;
            updatedSession.durationHour = Math.floor(durationMinutes / 60);
            updatedSession.durationMin = durationMinutes % 60;

            try {
                const response = await fetch(`https://spoffice-server.vercel.app/updatestaff/${staff._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...staff,
                        sessions: sessions.map((sess) => (sess === session ? updatedSession : sess)),
                    }),
                });
                const data = await response.json();

                if (data.modifiedCount) {
                    setSessions((prev) =>
                        prev.map((sess) => (sess === session ? updatedSession : sess))
                    );
                    setSession({});
                    setChecked(true); // Session ended
                }
            } catch (error) {
                notifyFailed('Error ending the session');
            }
        }
    };

    return (
        <div>
            {staff ? (
                <div>
                    <form className='mx-auto w-full p-2 rounded-lg my-3' onSubmit={handleEntry}>
                        <div className='flex mt-5 flex-col gap-5 lg:flex-row'>
                            <div className='w-full'>
                                <div className='flex py-3 px-2 items-center my-2 justify-between'>
                                    <p className='font-bold text-2xl'>
                                        {staff.name}{' '}
                                        <span className='bg-sky-100 text-sky-600 font-semibold text-lg px-4 rounded-xl py-1'>
                                            {staff.role}
                                        </span>
                                    </p>
                                </div>

                                <div className='flex flex-col gap-4'>
                                    <div className='flex gap-3 justify-between'>
                                        <label className='w-1/2 font-semibold'>
                                            Hour:
                                            <select
                                                name='hour'
                                                defaultValue={defaultHour}
                                                className='ml-2 border rounded w-1/2 p-1'
                                            >
                                                {[...Array(24).keys()].map((hr) => (
                                                    <option key={hr} value={hr}>
                                                        {hr}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className='w-1/2 font-semibold'>
                                            Minute:
                                            <select
                                                name='min'
                                                defaultValue={defaultMinute}
                                                className='ml-2 border rounded p-1 w-1/2'
                                            >
                                                {[...Array(60).keys()].map((min) => (
                                                    <option key={min} value={min}>
                                                        {min}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    {checked ? (
                                        <div>
                                            <p className='font-semibold'>Place</p>
                                            <select
                                                name='reason'
                                                className='select font-semibold select-info w-full'
                                            >
                                                <option>Jaleswaritola</option>
                                                <option>Brindabon Para</option>
                                                <option>Shibbati</option>
                                                <option>Marketing</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className='font-semibold'>Reason</p>
                                            <select
                                                name='reason'
                                                className='select font-semibold select-info w-full'
                                            >
                                                <option>Break</option>
                                                <option>Duty Finished</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    )}

                                    <button
                                        type='submit'
                                        className='bg-blue-500 text-white px-4 py-2 rounded mt-4'
                                    >
                                        {checked ? 'Start New Session' : 'End Current Session'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <hr />
                    <h2 className='text-2xl font-bold mb-4 text-center mt-5'>Active Session</h2>
                    {session.date ? (
                        <div className='bg-green-300 border border-gray-300 rounded-lg shadow-lg p-4 mb-6'>
                            <div className='text-center border-b border-gray-200 pb-4 mb-4'>
                                <h2 className='text-xl font-bold text-gray-800'>Duration</h2>
                                <p className='text-lg text-gray-600'>
                                    {activeHr}h {activeMin}m
                                </p>
                                <p className='text-sm text-gray-500'>Date: {session.date}</p>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='bg-blue-100 rounded-lg p-4'>
                                    <h3 className='text-lg font-bold text-blue-800 mb-2'>Entry Details</h3>
                                    <p className='text-gray-700'>
                                        <span className='font-semibold'>Time:</span> {session.inHour}:{session.inMin}
                                    </p>
                                    <p className='text-gray-700'>
                                        <span className='font-semibold'>Place:</span> {session.inPlace || 'N/A'}
                                    </p>
                                </div>
                                <div className='bg-red-100 rounded-lg p-4'>
                                    <h3 className='text-lg font-bold text-red-800 mb-2'>Exit Details</h3>
                                    {session.out ? (
                                        <>
                                            <p className='text-gray-700'>
                                                <span className='font-semibold'>Time:</span> {session.outHour}:{session.outMin}
                                            </p>
                                            <p className='text-gray-700'>
                                                <span className='font-semibold'>Reason:</span> {session.outReason || 'N/A'}
                                            </p>
                                        </>
                                    ) : (
                                        <p className='text-gray-700'>Not Checked Out</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='border-2 border-sky-500 rounded-lg text-center w-full py-3'>
                            No Active Session
                        </div>
                    )}
                    <h2 className='text-2xl font-bold mb-4 text-center mt-5'>Past Sessions</h2>
                    <div className='mt-2 max-h-screen overflow-y-auto'>
                        {first100.map((sess, index) => (
                            sess !== session && <SessionCard key={index} session={sess} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen bg-gray-100">
                    <div className="flex flex-col items-center">
                        <FaSpinner className="text-blue-500 animate-spin text-6xl mb-4" />
                        <p className="text-lg font-semibold text-gray-700">Loading, please wait...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyEntry;
