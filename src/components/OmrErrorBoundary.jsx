import React from 'react';

/**
 * OmrErrorBoundary — OMR Scanner crash হলে পুরো app বন্ধ হওয়া থেকে রক্ষা করে
 * "Aw, Snap!" crash সাধারণত low-RAM device-এ OpenCV WASM লোড করতে OOM-এ হয়
 */
class OmrErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMsg: '' };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMsg: error?.message || 'Unknown error' };
    }

    componentDidCatch(error, info) {
        console.error('[OMR] Crashed:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">⚠️</div>
                    <div>
                        <p className="font-black text-slate-800 text-lg mb-1">Scanner লোড হয়নি</p>
                        <p className="text-sm text-slate-500 mb-1">
                            আপনার ডিভাইসে পর্যাপ্ত RAM নেই। ব্রাউজার ট্যাব রিফ্রেশ করুন।
                        </p>
                        <p className="text-xs text-slate-400 mb-4 font-mono">{this.state.errorMsg}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-sky-600 text-white rounded-2xl font-bold text-sm hover:bg-sky-700 transition-all"
                        >
                            🔄 পেজ Reload করুন
                        </button>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                        >
                            আবার চেষ্টা করুন
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        💡 টিপস: ব্রাউজারে অন্য ট্যাব বন্ধ করলে RAM মুক্ত হবে
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default OmrErrorBoundary;
