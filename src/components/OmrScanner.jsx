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
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
const OPTION_COLORS = {
    A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#ef4444', E: '#8b5cf6'
};

const OmrScanner = ({ exam, onSave, onClose, externalKey, embedded }) => {
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

    // --- Device Management ---
    const [sourceType, setSourceType] = useState('camera'); // 'camera' or 'scanner'
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [usePythonServer, setUsePythonServer] = useState(false);
    // -------------------------

    const [answerKey, setAnswerKey] = useState(externalKey || {});
    const [marksPerCorrect, setMarksPerCorrect] = useState(exam.mcqTotal ? (exam.mcqTotal / (exam.mcqTotal || 30)) : 1);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeValue, setNegativeValue] = useState(0.25);
    const [totalQuestionsInKey, setTotalQuestionsInKey] = useState(exam.mcqTotal || 30);

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
        if (!hasKey) {
            const total = detectedAnswers.reduce((s, a) => s + (a.detected !== null ? 1 : 0), 0);
            return { score: total, correct: total, wrong: 0, unattempted: 0, breakdown: detectedAnswers };
        }

        let correct = 0, wrong = 0, unattempted = 0;
        const breakdown = detectedAnswers.map(item => {
            const keyAnswer = answerKey[item.qNum];
            if (item.detected === null) {
                unattempted++;
                return { ...item, result: 'skip', keyAnswer };
            }
            if (!keyAnswer) return { ...item, result: 'nokey', keyAnswer: '?' };
            if (item.detected === keyAnswer) {
                correct++;
                return { ...item, result: 'correct', keyAnswer };
            } else {
                wrong++;
                return { ...item, result: 'wrong', keyAnswer };
            }
        });

        const score = (correct * marksPerCorrect) - (negativeMarking ? wrong * negativeValue : 0);
        return { score: Math.max(0, score), correct, wrong, unattempted, breakdown };
    }, [answerKey, hasKey, marksPerCorrect, negativeMarking, negativeValue]);

    const workerRef = useRef(null);
    const messageHandlerRef = useRef(null);

    useEffect(() => {
        messageHandlerRef.current = (e) => {
            if (e.data.type === 'ready') {
                setIsCvLoaded(true);
                setStatus('ready');
                startCamera();
            } else if (e.data.type === 'scan_result') {
                handleScanResult(e.data.data, e.data.detectedSet);
            } else if (e.data.type === 'error') {
                console.error("Worker Error:", e.data.message);
                notifyFailed("Processing error. Align the markers and hold steady.");
                setStatus('ready'); // Reset status so we can try again
            }
        };
    });

    useEffect(() => {
        workerRef.current = new Worker('/omrWorker.js');
        workerRef.current.onmessage = (e) => {
            if (messageHandlerRef.current) messageHandlerRef.current(e);
        };
        return () => {
            if (workerRef.current) workerRef.current.terminate();
            stopCamera();
            if (qrScannerRef.current) qrScannerRef.current.stop().catch(() => { });
        };
    }, []);

    const handleScanResult = useCallback((data, detectedSet) => {
        const { detectedAnswers, finalRoll, imageData, isMasterKeyMode: _isMasterKey, selectedSet: _set } = data;

        // Auto-detect SET from Bubbled SET Code
        let finalSet = _set;
        if (detectedSet) {
            console.log(`[OmrScanner] Auto-detected SET ${detectedSet} from OMR bubbles.`);
            finalSet = detectedSet;
        } else if (!_isMasterKey) {
            console.log(`[OmrScanner] Warning: Could not detect SET bubble for roll ${finalRoll}. Falling back to default: ${_set}`);
        }
        const { score, correct, wrong, unattempted, breakdown } = calculateScore(detectedAnswers);

        if (_isMasterKey) {
            const newKey = {};
            breakdown.forEach(q => { if (q.detected) newKey[q.qNum] = q.detected; });
            onSave({ type: 'MASTER_KEY', set: finalSet, key: newKey });
            notifySuccess(`AI Engine: Master Key Set!`);
            setIsMasterKeyMode(false);
            setStatus('ready');
        } else {
            const canvas = canvasRef.current;
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);

            setScannedData({
                roll: finalRoll.includes("?") ? (Math.floor(100000 + Math.random() * 900000).toString()) : finalRoll,
                score, correct, wrong, unattempted,
                set: finalSet,
                breakdown,
                capturedImg: canvas.toDataURL('image/jpeg', 0.5),
                isEdgeAiProcessed: true,
                icrVerified: !finalRoll.includes("?")
            });
            setStatus('scanned');
        }
    }, [calculateScore, onSave, notifySuccess]);

    const startCamera = async (deviceId = null) => {
        if (sourceType === 'scanner') return;
        try {
            stopCamera();
            const constraints = deviceId
                ? { video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } } }
                : { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) { videoRef.current.srcObject = stream; streamRef.current = stream; }

            // Fetch list of all active cameras (after permission granted above)
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevs = allDevices.filter(d => d.kind === 'videoinput');
            setDevices(videoDevs);
            if (!deviceId && videoDevs.length > 0) {
                setSelectedDeviceId(videoDevs[0].deviceId);
            }
        } catch { setStatus('error'); }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const processFrame = useCallback(async (imageSource) => {
        if (!isCvLoaded || !imageSource || status !== 'ready' || !workerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let width = imageSource.videoWidth || imageSource.width;
        let height = imageSource.videoHeight || imageSource.height;
        if (!width || !height) return;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(imageSource, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);

        // Prevent multiple simultaneous scan triggers
        setStatus('processing');

        if (usePythonServer) {
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            fetch('http://localhost:5050/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        console.log("Python Cloud Result:", data.result);
                        notifySuccess(`Python Engine Scanned Roll: ${data.result.roll}`);
                        setStatus('ready');
                    } else {
                        notifyFailed("Python Engine Error: " + data.error);
                        setStatus('ready');
                    }
                })
                .catch(e => {
                    console.error(e);
                    notifyFailed("Python server is down. Ensure python_server.py is running.");
                    setStatus('ready');
                });
            return;
        }

        workerRef.current.postMessage({
            imageData,
            width,
            height,
            numQ: totalQuestionsInKey,
            numOpts: exam.optionsPerQuestion || 4,
            isMasterKeyMode,
            selectedSet
        }, [imageData.data.buffer]);

    }, [isCvLoaded, status, totalQuestionsInKey, exam, isMasterKeyMode, selectedSet, usePythonServer, notifyFailed, notifySuccess]);

    const handleConfirm = () => {
        if (!scannedData) return;
        setBatchHistory(prev => [scannedData, ...prev]);
        setScannedData(null);
        setStatus('ready');
        setIdentifiedStudent(null);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            processFrame(img);
        };
        img.src = URL.createObjectURL(file);
    };

    return (
        <div className={embedded ? 'h-full bg-slate-900 rounded-[2rem] overflow-hidden' : 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl'}>
            <div className={`relative bg-white w-full h-full flex flex-col overflow-hidden ${!embedded && 'sm:h-[96vh] sm:max-w-5xl sm:rounded-3xl shadow-2xl'}`}>

                {/* â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {!embedded && (
                    <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                <Target size={22} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900">OMR PRO Scanner</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam.title || 'Exam'}</p>
                                {scannedData.isEdgeAiProcessed && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 rounded-full text-white text-[10px] font-black self-start mt-2 border border-white/20">
                                        <Zap size={12} className="animate-pulse" /> EDGE AI ACTIVE
                                    </div>
                                )}
                                {scannedData.icrVerified && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 rounded-full text-white text-[10px] font-black self-start mt-1 border border-white/20">
                                        <UserCheck size={12} /> ICR VERIFIED ROLL
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMasterKeyMode(!isMasterKeyMode)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all flex items-center gap-2 ${isMasterKeyMode ? 'bg-orange-500 border-orange-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:border-orange-500 hover:text-orange-500'}`}
                            >
                                <Zap size={14} /> {isMasterKeyMode ? 'SCANNING KEY...' : 'SET MASTER KEY'}
                            </button>
                            <button
                                onClick={() => setUsePythonServer(!usePythonServer)}
                                className={`px-2 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all flex items-center gap-1 ${usePythonServer ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-100 hover:text-indigo-400'}`}
                                title="Use Python Edge Server"
                            >
                                Py
                            </button>
                            <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                                {['A', 'B', 'C', 'D'].map(s => (
                                    <button key={s} onClick={() => setSelectedSet(s)}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${selectedSet === s ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-xl"><X size={18} /></button>
                        </div>
                    </div>
                )}

                {/* Hub Header Overlay (Device Selection) */}
                <div className={`absolute ${embedded ? 'top-4' : 'top-20'} left-4 right-4 z-50 flex items-center justify-between pointer-events-none`}>
                    <div className="flex gap-2 pointer-events-auto items-center">
                        {embedded && (
                            <div className="flex gap-1 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                                {['A', 'B', 'C', 'D'].map(set => (
                                    <button key={set} onClick={() => setSelectedSet(set)}
                                        className={`w-9 h-9 rounded-xl text-sm font-black transition-all ${selectedSet === set ? 'bg-sky-500 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}>
                                        {set}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Device Source Selector */}
                        <select
                            value={sourceType === 'scanner' ? 'hardware_scanner' : selectedDeviceId}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'hardware_scanner') {
                                    setSourceType('scanner');
                                    stopCamera();
                                } else {
                                    setSourceType('camera');
                                    setSelectedDeviceId(val);
                                    startCamera(val);
                                }
                            }}
                            className="bg-black/60 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer max-w-[200px] truncate"
                        >
                            <optgroup label="Mobile & Webcams">
                                {devices.map((d, i) => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                        {d.label || `Camera ${i + 1}`}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="External Devices">
                                <option value="hardware_scanner">ðŸ–¨ï¸ Hardware Scanner</option>
                            </optgroup>
                        </select>
                    </div>

                    {embedded && (
                        <button onClick={() => setShowHistory(!showHistory)} className="pointer-events-auto p-3 rounded-2xl bg-black/40 backdrop-blur-md text-white/50 border border-white/10"><History size={20} /></button>
                    )}
                </div>

                {/* â”€â”€ MAIN CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                        {sourceType === 'camera' ? (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500">
                                <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border-2 border-slate-700 border-dashed">
                                    <ImageIcon size={40} className="text-slate-600" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Hardware Scanner Mode Active</h3>
                                <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">Use the upload button below to import scanned sheets from your flatbed/ADF scanner or local drive.</p>
                                <button onClick={() => fileInputRef.current?.click()} className="mt-8 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-sky-50 transition-colors">
                                    Choose Scanned File
                                </button>
                            </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                        <div id="qr-detect-sink" className="hidden" />

                        {status === 'ready' && sourceType === 'camera' && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {/* Cyber Frame */}
                                <div className="absolute inset-0 border-[40px] border-slate-950/40 backdrop-blur-[1px]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm aspect-[3/4] border-2 border-sky-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(14,165,233,0.1)]">
                                    <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-sky-500 rounded-tl-3xl" />
                                    <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-sky-500 rounded-tr-3xl" />
                                    <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-sky-500 rounded-bl-3xl" />
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-sky-500 rounded-br-3xl" />

                                    {/* Scanning Beam */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
                                </div>

                                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                                    <div className="px-6 py-2 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine Processing</p>
                                    </div>
                                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Hold steady for auto-capture</p>
                                </div>
                            </div>
                        )}

                        {status === 'scanned' && scannedData && (
                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm z-[60]">
                                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20">
                                    <div className={`px-8 py-10 flex flex-col items-center text-center relative overflow-hidden`}>
                                        <div className={`absolute top-0 inset-x-0 h-24 ${scannedData.correct > scannedData.wrong ? 'bg-emerald-500' : 'bg-sky-600'} opacity-10 blur-3xl`}></div>

                                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 border-4 border-white shadow-xl">
                                            <p className="text-2xl font-black text-slate-800">#{scannedData.roll.toString().slice(-3)}</p>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 mb-1">Sheet Identified</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Roll Number: {scannedData.roll}</p>

                                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                            <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Score</p>
                                                <p className="text-3xl font-black text-sky-600">{scannedData.score}</p>
                                                <p className="text-[10px] font-bold text-slate-300">Out of {scannedData.maxScore}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Accuracy</p>
                                                <p className="text-3xl font-black text-emerald-500">{Math.round((scannedData.correct / exam.mcqTotal) * 100)}%</p>
                                                <p className="text-[10px] font-bold text-slate-300">Set {scannedData.set}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full">
                                            <button onClick={() => setStatus('ready')} className="flex-1 py-4 bg-slate-100 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-200 transition-all">Reject</button>
                                            <button onClick={handleConfirm} className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all">Confirm Match</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-white border-t flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Engine Status</p>
                        <p className="text-xs font-bold text-slate-600 lowercase">{status} • {isCvLoaded ? 'cv loaded' : 'loading cv'}</p>
                    </div>

                    <div className="flex gap-4">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={status !== 'ready'} className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all hover:bg-slate-200 hover:border-slate-300 disabled:opacity-40">
                            <ImageIcon size={28} />
                        </button>
                        <button onClick={() => processFrame(videoRef.current)} disabled={status !== 'ready'} className="w-16 h-16 rounded-full bg-sky-600 shadow-xl shadow-sky-200 flex items-center justify-center text-white active:scale-90 transition-all disabled:opacity-40 hover:bg-sky-700">
                            <Camera size={28} />
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Session</p>
                        <p className="text-xs font-bold text-slate-600">{batchHistory.length} scanned</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OmrScanner;
