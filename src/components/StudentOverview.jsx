import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Provider';

function StudentOverview() {
    const { date, month, year } = useContext(AuthContext);
    const payDate = `${date}-${month}-${year}`;
   

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://spoffice-server.vercel.app/studentoverview`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ date: payDate })
                });
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="card bg-base-100 mx-auto w-96 shadow-xl">
            <figure className="px-10 pt-10">
                <img
                    src="https://i.ibb.co/CBjpWMm/calculation.png"
                    alt="Shoes"
                    className="rounded-xl" />
            </figure>
            <div className="card-body  items-center text-center">

                <h2 className="card-title text-amber-900">Overall Status !</h2>
                <p className='text-left  flex items-center gap-1 font-semibold text-amber-700'>Total Registered students : <span className="loading loading-dots loading-sm"></span> </p>
                <p className='text-left flex items-center gap-1 font-semibold text-amber-700'>Total Admitted students : <span className="loading loading-dots loading-sm"></span> </p>
                <br />
                <h2 className="card-title text-amber-900">Todays Status !</h2>
                <p className='text-left flex items-center gap-1 font-semibold text-amber-700'>Todays Registered students : <span className="loading loading-dots loading-sm"></span> </p>
                <p className='text-left flex items-center gap-1 font-semibold text-amber-700'>Todays Admitted students : <span className="loading loading-dots loading-sm"></span> </p>
                
            </div>
        </div>
    }

    return (
        <div className="card bg-base-100 mx-auto w-96 shadow-xl">
            <figure className="px-10 pt-10">
                <img
                    src="https://i.ibb.co/CBjpWMm/calculation.png"
                    alt="Shoes"
                    className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">

                <h2 className="card-title text-amber-900">Overall Status !</h2>
                <p className='text-left font-semibold text-amber-700'>Total Registered students : {data.total} </p>
                <p className='text-left font-semibold text-amber-700'>Total Admitted students : {data.admitted} </p>
                <br />
                <h2 className="card-title text-amber-900">Todays Status !</h2>
                <p className='text-left font-semibold text-amber-700'>Todays Registered students : {data.registeredToday} </p>
                <p className='text-left font-semibold text-amber-700'>Todays Admitted students : {data.admittedToday} </p>
                
            </div>
        </div>
    );
}

export default StudentOverview;
