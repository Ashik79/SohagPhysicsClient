import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../Provider';
import {
    MdCameraAlt as Camera,
    MdClose as X,
    MdCheck as Check,
    MdSave as Save,
    MdDelete as Trash2,
    MdHistory as History,
    MdAdjust as Target,
    MdFlashOn as Zap,
    MdImage as ImageIcon,
    MdPersonPin as UserCheck,
    MdKey as Key,
    MdDownload as Download,
    MdWarning as Warning,
} from 'react-icons/md';
// Html5Qrcode and XLSX removed — not used in universal OMR workflow

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = {
    A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#ef4444'
};

const OmrScanner = ({ exam, onSave, onClose, externalKey, embedded, activeQuestions }) => {
    const { notifySuccess, notifyFailed } = useContext(AuthContext);
    const [status, setStatus] = useState('initializing');
    const [scannedData, setScannedData] = useState(null);
    const [batchHistory, setBatchHistory] = useState([]);
    const [isCvLoaded, setIsCvLoaded] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showKeyPanel, setShowKeyPanel] = useState(false);
    const [selectedSet, setSelectedSet] = useState('A');
    const [identifiedStudent, setIdentifiedStudent] = useState(null);
    const [isMasterKeyMode, setIsMasterKeyMode] = useState(false);
    const [editRoll, setEditRoll] = useState(''); // for manual roll entry when unreadable

    // --- Device Management ---
    const [sourceType, setSourceType] = useState('camera'); // 'camera' or 'scanner'
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [usePythonServer, setUsePythonServer] = useState(true); // Default to true for PRO scanner
    const [pythonProcessing, setPythonProcessing] = useState(false);

    // AI Auto-Capture States
    const [autoCapture, setAutoCapture] = useState(true);
    const [isAligned, setIsAligned] = useState(false);
    const [alignmentScore, setAlignmentScore] = useState(0); // 0 to 5 frames
    const [markerPoints, setMarkerPoints] = useState([]);
    // -------------------------

    const [answerKey, setAnswerKey] = useState(externalKey || {});
    const [marksPerCorrect, setMarksPerCorrect] = useState(1);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeValue, setNegativeValue] = useState(0.25);
    // activeQ: provided from OmrHub (how many of the 75 bubbles to evaluate)
    const totalQToEvaluate = activeQuestions || exam.mcqTotal || 25;

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const qrScannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const hasKey = Object.keys(answerKey).length > 0;

    useEffect(() => {
        if (externalKey) setAnswerKey(externalKey);
    }, [externalKey]);

    const calculateScore = useCallback((detectedAnswers) => {
        const activeAnswers = detectedAnswers.filter(a => a.errorType !== 'SKIPPED_INACTIVE');
        const skippedCount = detectedAnswers.length - activeAnswers.length;

        if (!hasKey) {
            const total = activeAnswers.reduce((s, a) => s + (a.detected !== null ? 1 : 0), 0);
            return { score: total, correct: total, wrong: 0, unattempted: 0, skipped: skippedCount, breakdown: detectedAnswers };
        }

        let correct = 0, wrong = 0, unattempted = 0;
        const breakdown = detectedAnswers.map(item => {
            if (item.errorType === 'SKIPPED_INACTIVE') return { ...item, result: 'inactive', keyAnswer: null };
            const keyAnswer = answerKey[item.qNum];
            if (item.detected === null) { unattempted++; return { ...item, result: 'skip', keyAnswer }; }
            if (!keyAnswer) return { ...item, result: 'nokey', keyAnswer: '?' };
            if (item.detected === keyAnswer) { correct++; return { ...item, result: 'correct', keyAnswer }; }
            else { wrong++; return { ...item, result: 'wrong', keyAnswer }; }
        });

        const score = (correct * marksPerCorrect) - (negativeMarking ? wrong * negativeValue : 0);
        return { score: Math.max(0, score), correct, wrong, unattempted, skipped: skippedCount, breakdown };
    }, [answerKey, hasKey, marksPerCorrect, negativeMarking, negativeValue]);

    const handleScanResult = useCallback((data, detectedSet, isAutoCapture = false) => {
        const { detectedAnswers, finalRoll, imageData, isMasterKeyMode: _isMasterKey, selectedSet: _set, roll_crop_base64 } = data;
        let finalSet = detectedSet || _set;
        const { score, correct, wrong, unattempted, breakdown } = calculateScore(detectedAnswers);

        if (_isMasterKey) {
            const newKey = {};
            breakdown.forEach(q => { if (q.detected) newKey[q.qNum] = q.detected; });
            onSave({ type: 'MASTER_KEY', set: finalSet, key: newKey });
            notifySuccess(`AI Engine: Master Key Set!`);
            setIsMasterKeyMode(false);
            setStatus('ready');
        } else {
            const rollUnreadable = finalRoll.includes('?');
            setEditRoll(rollUnreadable ? '' : finalRoll);

            const newData = {
                roll: finalRoll,
                score, correct, wrong, unattempted, set: finalSet, breakdown,
                capturedImg: roll_crop_base64 || (imageData ? imageDataToDataURL(imageData) : null),
                rollCrop: roll_crop_base64,
                isEdgeAiProcessed: true,
                icrVerified: !rollUnreadable,
                scanTimestamp: new Date().toISOString()
            };

            if (isAutoCapture && !rollUnreadable) {
                onSave(newData);
                setBatchHistory(p => [newData, ...p]);
                notifySuccess(`Auto-Saved: Roll ${finalRoll}`);
                setStatus('ready');
                setAlignmentScore(0);
            } else {
                setScannedData(newData);
                setStatus('scanned');
            }
        }
    }, [calculateScore, onSave, notifySuccess]);

    const imageDataToDataURL = (imageData) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.5);
    };

    const workerRef = useRef(null);
    useEffect(() => {
        workerRef.current = new Worker('/omrWorker.js');
        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'ready') {
                setIsCvLoaded(true);
                setStatus('ready');
                startCamera();
            } else if (e.data.type === 'detecting') {
                setIsAligned(false);
                // We let it continue so if it quickly loses tracking it doesn't hard-reset
                // setAlignmentScore(0);
            } else if (e.data.type === 'scan_result') {
                setIsAligned(true);
                if (autoCapture && status === 'ready') {
                    setAlignmentScore(prev => {
                        const next = prev + 1;
                        if (next >= 5) {
                            handleScanResult(e.data.data, e.data.detectedSet, true);
                            return 0;
                        }
                        return next;
                    });
                } else if (!autoCapture) {
                    handleScanResult(e.data.data, e.data.detectedSet, false);
                }
            } else if (e.data.type === 'error') {
                setIsAligned(false);
                setAlignmentScore(0);
                // Do NOT set status to 'ready' if we were holding a scanned data. 
                // We keep whatever status we are in (e.g., 'scanned' to review roll)
            }
        };
        return () => {
            if (workerRef.current) workerRef.current.terminate();
            stopCamera();
        };
    }, [autoCapture, status, handleScanResult]);

    const startCamera = async (deviceId = null) => {
        if (sourceType === 'scanner') return;
        try {
            stopCamera();
            const constraints = deviceId
                ? { video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } } }
                : { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) { videoRef.current.srcObject = stream; streamRef.current = stream; }
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            setDevices(allDevices.filter(d => d.kind === 'videoinput'));
            if (!deviceId && allDevices.length > 0) setSelectedDeviceId(allDevices[0].deviceId);
        } catch { setStatus('error'); }
    };

    const stopCamera = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } };

    const processFramePython = async (base64Image) => {
        if (pythonProcessing) return;
        setPythonProcessing(true);
        try {
            const resp = await fetch('http://localhost:5050/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image, active_q: totalQToEvaluate })
            });
            const data = await resp.json();
            if (data.success) {
                const result = data.result;
                handleScanResult({
                    detectedAnswers: result.questions,
                    finalRoll: result.roll,
                    roll_crop_base64: result.roll_crop_base64,
                    selectedSet: result.set
                }, result.set, autoCapture);
            }
        } catch (err) {
            console.error("Python Server Error:", err);
            notifyFailed("Python Server Error - Falling back to Edge AI");
            setUsePythonServer(false);
        } finally {
            setPythonProcessing(false);
        }
    };

    const processFrame = useCallback((imageSource) => {
        if (!isCvLoaded || !imageSource || status !== 'ready' || !workerRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let w = imageSource.videoWidth || imageSource.width, h = imageSource.videoHeight || imageSource.height;
        if (!w || !h) return;
        canvas.width = w; canvas.height = h;
        ctx.drawImage(imageSource, 0, 0, w, h);

        if (usePythonServer && alignmentScore >= 5 && !pythonProcessing) {
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            processFramePython(base64);
            return;
        }

        const imageData = ctx.getImageData(0, 0, w, h);
        workerRef.current.postMessage({
            imageData, width: w, height: h, numQ: totalQToEvaluate,
            numOpts: exam.optionsPerQuestion || 4, isMasterKeyMode, selectedSet
        }, [imageData.data.buffer]);
    }, [isCvLoaded, status, totalQToEvaluate, exam, isMasterKeyMode, selectedSet, usePythonServer, alignmentScore, pythonProcessing]);

    // Fast-Loop for camera
    useEffect(() => {
        let timer;
        const loop = () => {
            if (status === 'ready' && sourceType === 'camera' && videoRef.current) processFrame(videoRef.current);
            timer = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(timer);
    }, [status, sourceType, processFrame]);

    const handleConfirm = () => {
        if (!scannedData) return;
        // Use manually edited roll if the original was unreadable
        const finalConfirmedRoll = scannedData.roll.includes('?')
            ? (editRoll.trim() || scannedData.roll)
            : scannedData.roll;
        const confirmedData = { ...scannedData, roll: finalConfirmedRoll };
        onSave(confirmedData);                   // ✅ send result to OmrHub
        setBatchHistory(p => [confirmedData, ...p]);
        setEditRoll('');
        setScannedData(null);
        setStatus('ready');
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const img = new Image(); img.onload = () => processFrame(img); img.src = URL.createObjectURL(file);
    };

    return (
        <div className={embedded ? 'h-full bg-slate-900 rounded-[2rem] overflow-hidden' : 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl'}>
            <div className={`relative bg-white w-full h-full flex flex-col overflow-hidden ${!embedded && 'sm:h-[96vh] sm:max-w-5xl sm:rounded-3xl shadow-2xl'}`}>

                {/* HEADER */}
                {!embedded && (
                    <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-md"><Target size={22} /></div>
                            <div>
                                <h2 className="text-base font-black text-slate-900">OMR PRO Scanner</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam.title || 'Exam'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMasterKeyMode(!isMasterKeyMode)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all ${isMasterKeyMode ? 'bg-orange-500 border-orange-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-500'}`}>
                                <Zap size={14} /> {isMasterKeyMode ? 'SCANNING KEY...' : 'SET MASTER KEY'}
                            </button>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-xl"><X size={18} /></button>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                        {sourceType === 'camera' ? (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500">
                                <h3 className="text-white font-bold text-lg">Hardware Scanner Mode Active</h3>
                                <button onClick={() => fileInputRef.current?.click()} className="mt-8 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl">Choose Scanned File</button>
                            </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />

                        {status === 'ready' && sourceType === 'camera' && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {isAligned && (
                                    <div className="absolute inset-x-0 bottom-40 flex flex-col items-center gap-4 z-50">
                                        <div className="w-16 h-16 relative">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="4" fill="transparent" className="opacity-20" />
                                                <circle cx="32" cy="32" r="28" stroke="#0ea5e9" strokeWidth="4" fill="transparent"
                                                    strokeDasharray={176} strokeDashoffset={176 - (176 * alignmentScore) / 5} />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black">{Math.round((alignmentScore / 5) * 100)}%</div>
                                        </div>
                                        <div className="px-5 py-2 bg-sky-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">HOLD STEADY... LOCKING</div>
                                    </div>
                                )}
                                <div className={`absolute inset-0 border-[40px] transition-all duration-300 ${isAligned ? 'border-sky-500/20' : 'border-slate-950/40'} backdrop-blur-[1px]`}></div>
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm aspect-[3/4] border-2 transition-all duration-300 ${isAligned ? 'border-sky-400 scale-105 shadow-[0_0_80px_rgba(14,165,233,0.3)]' : 'border-sky-500/30'} rounded-[3rem]`}>
                                    <div className={`absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 rounded-tl-3xl ${isAligned ? 'border-sky-400' : 'border-sky-500'}`} />
                                    <div className={`absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 rounded-tr-3xl ${isAligned ? 'border-sky-400' : 'border-sky-500'}`} />
                                    <div className={`absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 rounded-bl-3xl ${isAligned ? 'border-sky-400' : 'border-sky-500'}`} />
                                    <div className={`absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 rounded-br-3xl ${isAligned ? 'border-sky-400' : 'border-sky-500'}`} />
                                </div>
                            </div>
                        )}

                        {status === 'scanned' && scannedData && (
                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm z-[60]">
                                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">

                                    {/* Roll Badge */}
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-3 mx-auto border-4 border-white shadow-xl ${scannedData.icrVerified ? 'bg-emerald-50' : 'bg-amber-50'
                                        }`}>
                                        <p className={`text-xl font-black ${scannedData.icrVerified ? 'text-emerald-700' : 'text-amber-600'
                                            }`}>
                                            {scannedData.icrVerified ? scannedData.roll.slice(-3) : '???'}
                                        </p>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-1">
                                        {scannedData.icrVerified ? 'Sheet Scanned ✓' : 'Roll Unreadable ⚠️'}
                                    </h3>
                                    {/* <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                        SET: <span className="text-sky-600">{scannedData.set}</span>
                                    </p> */}

                                    {/* Editable Roll — show when unreadable */}
                                    {!scannedData.icrVerified ? (
                                        <div className="mb-4">
                                            {scannedData.rollCrop && (
                                                <div className="mb-3 rounded-xl overflow-hidden border-2 border-slate-100 shadow-inner">
                                                    <p className="text-[10px] font-black text-slate-400 bg-slate-50 py-1 uppercase">Sheet Roll Preview</p>
                                                    <img src={scannedData.rollCrop} alt="Roll Crop" className="w-full h-16 object-contain bg-white" />
                                                </div>
                                            )}
                                            <p className="text-xs text-amber-600 font-bold mb-2">Roll বুঝা যায়নি। নিচে লিখুন:</p>
                                            <input
                                                type="text"
                                                value={editRoll}
                                                onChange={e => setEditRoll(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Roll Number লিখুন"
                                                maxLength={10}
                                                className="w-full px-4 py-3 border-2 border-amber-300 rounded-2xl text-center font-black text-slate-800 text-lg focus:outline-none focus:border-sky-500 bg-amber-50"
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-400 mb-4">Roll: <span className="text-slate-700">{scannedData.roll}</span></p>
                                    )}

                                    {/* Score Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase">Correct</p>
                                            <p className="text-2xl font-black text-emerald-600">{scannedData.correct}</p>
                                        </div>
                                        <div className="bg-sky-50 rounded-2xl p-3 border border-sky-100">
                                            <p className="text-[9px] font-black text-sky-400 uppercase">Score</p>
                                            <p className="text-2xl font-black text-sky-600">{scannedData.score}</p>
                                        </div>
                                        <div className="bg-red-50 rounded-2xl p-3 border border-red-100">
                                            <p className="text-[9px] font-black text-red-400 uppercase">Wrong</p>
                                            <p className="text-2xl font-black text-red-500">{scannedData.wrong}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => { setScannedData(null); setEditRoll(''); setStatus('ready'); }} className="flex-1 py-3 bg-slate-100 font-black rounded-2xl text-xs uppercase text-slate-500 hover:bg-slate-200 transition-colors">Discard</button>

                                        {!scannedData.icrVerified && !editRoll.trim() && (
                                            <button
                                                onClick={() => {
                                                    const confirmedData = { ...scannedData, roll: "Unknown_" + Math.floor(1000 + Math.random() * 9000) };
                                                    onSave(confirmedData);
                                                    setBatchHistory(p => [confirmedData, ...p]);
                                                    setEditRoll(''); setScannedData(null); setStatus('ready');
                                                }}
                                                className="flex-1 py-3 bg-amber-50 border border-amber-200 text-amber-600 font-black rounded-2xl text-xs uppercase hover:bg-amber-100 transition-colors"
                                            >
                                                Skip Roll
                                            </button>
                                        )}

                                        <button
                                            onClick={handleConfirm}
                                            disabled={!scannedData.icrVerified && !editRoll.trim()}
                                            className="flex-[2] py-3 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase shadow-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            ✓ Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-white border-t flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Status</p>
                        <p className="text-xs font-bold text-slate-600">{status} {isAligned ? '• Locked' : ''}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setAutoCapture(!autoCapture)} className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase ${autoCapture ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                            AI Auto: {autoCapture ? 'ON' : 'OFF'}
                        </button>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><ImageIcon size={24} /></button>
                        <button onClick={() => processFrame(videoRef.current)} disabled={status !== 'ready'} className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center"><Camera size={24} /></button>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</p>
                        <p className="text-xs font-bold text-slate-600">{batchHistory.length} Scanned</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OmrScanner;
