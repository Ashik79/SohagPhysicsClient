import React from 'react';

const Loading = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="mt-4 text-sm font-black text-indigo-600 uppercase tracking-widest animate-pulse">
                Loading Application...
            </p>
        </div>
    );
};

export default Loading;
