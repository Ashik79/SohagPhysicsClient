import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

function Monitor() {
    const loadedUsers = useLoaderData();

    // States for active and inactive users
    const [activeAll, setActiveAll] = useState([]);
    const [inactiveAll, setInactiveAll] = useState([]);
    const [jtola, setJtola] = useState([]);
    const [bpara, setBpara] = useState([]);
    const [sbati, setSbati] = useState([]);
    const [marketing, setMarketing] = useState([]);
    const [brk, setBrk] = useState([]);
    const [dutyFinished, setDutyFinished] = useState([]);


    // Process data inside useEffect
    useEffect(() => {
        const adminAll = loadedUsers.filter((user) => user.role === "Admin");
        const active = [];
        const inactive = [];
        const jtolaUsers = [];
        const bparaUsers = [];
        const sbatiUsers = [];
        const marketingUsers = [];
        const breakUsers = [];
        const finishedUsers = [];

        adminAll.forEach((user) => {
            const length = user.sessions?.length || 0;
            if (length > 0 && user.sessions[length - 1].out === false) {
                active.push(user);
                const inPlace = user.sessions[length - 1].inPlace;
                if (inPlace === "Jaleswaritola") jtolaUsers.push(user);
                else if (inPlace === "Brindabon Para") bparaUsers.push(user);
                else if (inPlace === "Shibbati") sbatiUsers.push(user);
                else if (inPlace === "Marketing") marketingUsers.push(user);
            } else {
                inactive.push(user);
                if (length > 0 && user.sessions[length - 1].out === true) {
                    if (user.sessions[length - 1].outReason === "Break") breakUsers.push(user);
                    else if (user.sessions[length - 1].outReason === "Duty Finished") finishedUsers.push(user);
                }
            }
        });

        // Update states
        setActiveAll(active);
        setInactiveAll(inactive);
        setJtola(jtolaUsers);
        setBpara(bparaUsers);
        setSbati(sbatiUsers);
        setMarketing(marketingUsers);
        setBrk(breakUsers);
        setDutyFinished(finishedUsers);
    }, [loadedUsers]);
    console.log(brk)
    console.log(inactiveAll)
    // Render boxes for users by location
    const renderLocationBox = (locationUsers, locationName, bgColor) => (
        <div className={`border p-3 rounded-lg mb-4 ${bgColor}`}>
            <h3 className="font-semibold text-lg mb-2">{locationName} ({locationUsers.length})</h3>
            {locationUsers.map((user) => {
                const length = user.sessions?.length || 0;
                const inHour = user.sessions[length - 1]?.inHour || 0;
                const inMin = user.sessions[length - 1]?.inMin || 0;
                const out =user.sessions [length -1]?.out;
                return (
                    <div
                        key={user._id}
                        className="bg-white p-2 mb-2 shadow rounded-lg text-sm"
                    >
                        <p className="font-semibold text-base "> {user.name}</p>
                        {((inHour || inMin) && !out) ?<p>Entry Time: <span className="text-sky-600">{inHour} : {inMin}</span> </p>:<></>}
                        
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="p-2 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Live Monitor</h1>
            <div className="mb-6 flex justify-between border-2 border-sky-600 rounded-lg p-2">
                <p className="text-lg font-semibold">
                    Active Users: <span className="text-green-600">{activeAll.length}</span>
                </p>
                <p className="text-lg font-semibold">
                    Inactive Users: <span className="text-red-600">{inactiveAll.length}</span>
                </p>
            </div>

            {/* Active Users Section */}
            <div className="bg-green-100 p-4 rounded-lg mb-6 shadow">
                <h2 className="text-xl font-bold mb-4 text-green-800">Active Users</h2>
                {renderLocationBox(jtola, "Jaleswaritola", "bg-green-200")}
                {renderLocationBox(bpara, "Brindabon Para", "bg-green-200")}
                {renderLocationBox(sbati, "Shibbati", "bg-green-200")}
                {renderLocationBox(marketing, "Marketing", "bg-green-200")}
            </div>

            {/* Inactive Users Section */}
            <div className="bg-red-100 p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-red-800">Inactive Users</h2>
                {renderLocationBox(brk, "Break", "bg-red-200")}
                {renderLocationBox(dutyFinished, "Duty Finished", "bg-red-200")}
            </div>
        </div>
    );
}

export default Monitor;
