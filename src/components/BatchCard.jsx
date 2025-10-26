import React, { useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';

const BatchCard = ({ batch }) => {
    const [showMenu, setShowMenu] = useState(false);

    
    // //console.log(batch)
    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };
    const handlePresentDownload = async () => {
        // //console.log('d')
        try {

            const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/students', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'

                },
                body: JSON.stringify(batch.present)
            })

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `students.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error('Failed to download Info');
            }
            toggleMenu()
        }
        catch (err) {
            console.log(err)
        }
    }
    const handleAbsentDownload = async () => {
        // //console.log('d')
        try {

            const downloadResponse = await fetch('https://spoffice-server.vercel.app/download/students', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'

                },
                body: JSON.stringify(batch.absent)
            })

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `students.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toggleMenu()
            } else {
                console.error('Failed to download Info');
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="relative w-full max-w-xs p-4  border-sky-500 border-2 rounded-lg shadow-md bg-white text-gray-800">
            <h3 className="text-lg font-bold">{batch.vakka}</h3>
            <p className="text-gray-600 mt-2">
                Present: <span className="font-semibold">{batch.present.length}</span> /
                Total: <span className="font-semibold">{batch.total.length}</span>
            </p>

            {/* Three-dot menu button */}
            <button
                onClick={toggleMenu}
                className="absolute top-2 right-2 text-sky-500 hover:text-gray-800 focus:outline-none"
            >
                <FaEllipsisV />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
                <div className="absolute right-2 top-10 bg-white border rounded shadow-lg p-2 w-36 z-10">
                    <ul className="text-gray-800">
                        <li
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handlePresentDownload()}
                        >
                            Present List
                        </li>
                        <li
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAbsentDownload()}
                        >
                            Absent List
                        </li>

                    </ul>
                </div>
            )}
        </div>
    );
};

export default BatchCard;
