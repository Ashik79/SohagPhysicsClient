import React, { useContext } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../Provider';
const SessionCard = ({ session, edit,del }) => {

  const {role} =useContext(AuthContext)
  const {
    out,
    inHour,
    inMin,
    date,
    inPlace,
    outReason,
    durationHour,
    durationMin,
    outHour,
    outMin,
  } = session;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 mb-6">
      {/* Top Section */}
      <div className="text-center border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Duration</h2>
        <p className="text-lg text-gray-600">
          {durationHour || 0}h {durationMin || 0}m
        </p>
        <p className="text-sm text-gray-500">Date: {date}</p>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Entry Details */}
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Entry Details</h3>
          <p className="text-gray-700">
            <span className="font-semibold">Time:</span> {inHour}:{inMin}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Place:</span> {inPlace || 'N/A'}
          </p>
        </div>

        {/* Exit Details */}
        <div className="bg-red-100 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-800 mb-2">Exit Details</h3>
          {out ? (
            <>
              <p className="text-gray-700">
                <span className="font-semibold">Time:</span> {outHour}:{outMin}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Reason:</span> {outReason || 'N/A'}
              </p>
            </>
          ) : (
            <p className="text-gray-700">Not Checked Out</p>
          )}
        </div>
      </div>

      {/* Buttons Section */}
      {(role !='Admin' && edit) ?<div className="flex justify-end gap-4 mt-4">
        <button
          className="flex items-center gap-2 bg-blue-500 text-sm text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={() =>edit(session)}
        >
          <FaEdit className="text-sm" />
          Edit
        </button>
        <button
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          onClick={() =>del(session)}
        >
          <FaTrash className="text-lg" />
          Delete
        </button>
      </div>:<div></div>}
    </div>

  );
};

export default SessionCard;
