import React from 'react';

const SessionCard = ({ session }) => {
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
    </div>
  );
};

export default SessionCard;
