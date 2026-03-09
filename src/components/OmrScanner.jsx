import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AuthContext } from '../Provider';
import {
    MdCameraAlt as Camera,
    MdClose as X,
    MdFlashOn as Zap,
    MdImage as ImageIcon,
    MdAdjust as Target,
    MdRefresh as Retake,
    MdVideocamOff as CameraOff,
} from 'react-icons/md';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = {
    A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#ef4444'
};
const PYTHON_TIMEOUT_MS = 22000; // 22s — Render cold-start can take ~20s

const OmrScanner = ({ exam, onSave, onClose, externalKey, embedded, activeQuestions }) => {
    const { notifySuccess, notifyFailed } = useContext(AuthContext);
    const [status, setStatus] = useState('initializing');
    const [scannedData, setScannedData] = useState(null);
    const [batchHistory, setBatchHistory] = useState([]);
    const [isCvLoaded, setIsCvLoaded] = useState(false);
    const [isMasterKeyMode, setIsMasterKeyMode] = useState(false);
    const [editRoll, setEditRoll] = useState('');

    // Device Management
    const [sourceType] = useState('camera');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [usePythonServer, setUsePythonServer] = useState(true);
    const [useAiMode, setUseAiMode] = useState(false);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment'=back, 'user'=front

    // Capture states
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isAligned, setIsAligned] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [serverWarming, setServerWarming] = useState(false);

    // PDF page picker state
    const [pdfPages, setPdfPages] = useState([]);   // array of {pageNum, dataUrl}
    const [pdfFile, setPdfFile] = useState(null);    // pending PDF file
    const [showPdfPicker, setShowPdfPicker] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const capturingRef = useRef(false); // instant double-click guard (sync with isCapturing state)

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);
    const workerRef = useRef(null);

    const [answerKey, setAnswerKey] = useState(externalKey || {});
    const [marksPerCorrect, setMarksPerCorrect] = useState(1);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeValue, setNegativeValue] = useState(0.25);
    const totalQToEvaluate = activeQuestions || exam.mcqTotal || 25;

    const hasKey = Object.keys(answerKey).length > 0;

    // Keep capturingRef in sync with isCapturing state for instant access in rAF loop
    capturingRef.current = isCapturing;

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

    const handleScanResult = useCallback((data) => {
        const { detectedAnswers, finalRoll, imageData, isMasterKeyMode: _isMasterKey, roll_crop_base64 } = data;
        const { score, correct, wrong, unattempted, skipped, breakdown } = calculateScore(detectedAnswers);

        if (_isMasterKey) {
            const newKey = {};
            breakdown.forEach(q => { if (q.detected) newKey[q.qNum] = q.detected; });
            onSave({ type: 'MASTER_KEY', key: newKey });
            notifySuccess('AI Engine: Master Key Set!');
            setIsMasterKeyMode(false);
            setStatus('ready');
        } else {
            const rollUnreadable = finalRoll ? finalRoll.includes('?') : true;
            setEditRoll(rollUnreadable ? '' : finalRoll);

            const imageDataToDataURL = (imgData) => {
                const c = document.createElement('canvas');
                c.width = imgData.width; c.height = imgData.height;
                c.getContext('2d').putImageData(imgData, 0, 0);
                return c.toDataURL('image/jpeg', 0.5);
            };

            const newData = {
                roll: finalRoll || '??????',
                score, correct, wrong, unattempted, skipped, breakdown,
                capturedImg: roll_crop_base64 || (imageData ? imageDataToDataURL(imageData) : null),
                rollCrop: roll_crop_base64,
                isEdgeAiProcessed: true,
                icrVerified: !rollUnreadable,
                scanTimestamp: new Date().toISOString()
            };
            setScannedData(newData);
            setStatus('scanned');
        }
    }, [calculateScore, onSave, notifySuccess]);

    // ── Worker setup
    useEffect(() => {
        workerRef.current = new Worker('/omrWorker.js');
        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'ready') {
                setIsCvLoaded(true);
                setStatus('ready');
                // startCamera(); // Removed: don't auto-start camera anymore
            } else if (e.data.type === 'detecting') {
                setIsAligned(false);
            } else if (e.data.type === 'scan_result') {
                // Detection-only: just show alignment indicator, never auto-capture
                setIsAligned(true);
            } else if (e.data.type === 'error') {
                setIsAligned(false);
            }
        };
        return () => {
            if (workerRef.current) workerRef.current.terminate();
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Smart camera start: tries back camera first, falls back to any camera
    const startCamera = async (deviceId = null, forceFacing = null) => {
        try {
            stopCamera();
            const facing = forceFacing || facingMode;
            let stream;
            if (deviceId) {
                // Explicit device selected by user
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
            } else {
                // Try facingMode (works on phones)
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }
                    });
                } catch {
                    // fallback — any camera
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                }
            }
            if (videoRef.current) { videoRef.current.srcObject = stream; streamRef.current = stream; }

            // Enumerate and label all video devices
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
            setDevices(videoDevices);

            // Get the active track's deviceId and mark as selected
            const activeTrack = stream.getVideoTracks()[0];
            const activeDeviceId = activeTrack?.getSettings()?.deviceId || '';
            setSelectedDeviceId(activeDeviceId);
            setIsCameraOn(true);
        } catch (err) {
            console.error('Camera start failed:', err);
            setStatus('error');
        }
    };

    // Toggle between front and back camera
    const toggleFacingMode = () => {
        const newFacing = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newFacing);
        startCamera(null, newFacing);
    };

    const stopCamera = () => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        setIsCameraOn(false);
    };

    // ── Resize + Grayscale before upload → ~3-4x smaller payload than original
    const resizeForUpload = (srcCanvas) => {
        const MAX_W = 1280;
        const sw = srcCanvas.width, sh = srcCanvas.height;
        const scale = sw > MAX_W ? MAX_W / sw : 1;
        const rw = Math.round(sw * scale), rh = Math.round(sh * scale);

        // Draw resized color image to a temp canvas
        const colorCanvas = document.createElement('canvas');
        colorCanvas.width = rw; colorCanvas.height = rh;
        const colorCtx = colorCanvas.getContext('2d');
        colorCtx.drawImage(srcCanvas, 0, 0, rw, rh);

        // Convert to grayscale using ImageData pixel manipulation
        const grayCanvas = document.createElement('canvas');
        grayCanvas.width = rw; grayCanvas.height = rh;
        const grayCtx = grayCanvas.getContext('2d');
        const imageData = colorCtx.getImageData(0, 0, rw, rh);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // Standard luminance formula: 0.299R + 0.587G + 0.114B
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = lum;
        }
        grayCtx.putImageData(imageData, 0, 0);

        return grayCanvas.toDataURL('image/jpeg', 0.82);
    };


    // ── Python server call with 22s timeout
    const processFramePython = useCallback(async (base64Image) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, PYTHON_TIMEOUT_MS);
        setServerWarming(false);
        // Show "warming up" after 4s of waiting
        const warmingTimer = setTimeout(() => setServerWarming(true), 4000);

        try {
            const apiBase = window.location.hostname === 'localhost'
                ? 'http://localhost:5050'
                : (process.env.REACT_APP_OMR_API_URL || 'https://omrenginepython.onrender.com');
            const response = await fetch(`${apiBase}/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image, active_q: totalQToEvaluate, use_ai: useAiMode }),
                signal: controller.signal
            });
            clearTimeout(warmingTimer);
            setServerWarming(false);
            const data = await response.json();
            if (data.success) {
                const result = data.result;
                handleScanResult({
                    detectedAnswers: result.questions,
                    finalRoll: result.roll,
                    roll_crop_base64: result.roll_crop_base64
                });
            } else {
                notifyFailed(data.error || 'স্ক্যান ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
            }
        } catch (err) {
            clearTimeout(warmingTimer);
            setServerWarming(false);
            console.error("Python Fetch Error:", err);

            let errMsg = 'Python Server Error';
            if (err.name === 'AbortError') {
                errMsg = 'Server Timeout (22s)';
            } else if (err.message.includes('Failed to fetch')) {
                errMsg = 'Server Connection Refused (Is it running?)';
            } else {
                errMsg = `Server Error: ${err.message}`;
            }

            notifyFailed(`${errMsg} — Edge AI তে switch করা হচ্ছে।`);
            setUsePythonServer(false);
        } finally {
            clearTimeout(timeoutId);
            setIsCapturing(false);
            capturingRef.current = false;
        }
    }, [totalQToEvaluate, handleScanResult, notifyFailed, useAiMode]);

    // ── Detection-only frame loop (pauses during capture to avoid race conditions)
    useEffect(() => {
        let timer;
        const loop = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            // FIX Bug 2: pause detection while capturing
            if (status === 'ready' && !capturingRef.current && sourceType === 'camera' && video && canvas && isCvLoaded && workerRef.current) {
                const w = video.videoWidth, h = video.videoHeight;
                if (w && h) {
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(video, 0, 0, w, h);
                    const imageData = ctx.getImageData(0, 0, w, h);
                    workerRef.current.postMessage({
                        imageData, width: w, height: h, numQ: totalQToEvaluate,
                        numOpts: exam.optionsPerQuestion || 4, isMasterKeyMode
                    }, [imageData.data.buffer]);
                }
            }
            timer = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(timer);
    }, [status, sourceType, isCvLoaded, totalQToEvaluate, exam, isMasterKeyMode]);

    // ── Manual capture — called when user presses big Capture button
    const handleManualCapture = useCallback(async () => {
        // FIX Bug 3: use ref for instant double-click guard
        if (capturingRef.current || status !== 'ready') return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) { notifyFailed('ক্যামেরা প্রস্তুত নয়।'); return; }

        capturingRef.current = true;
        setIsCapturing(true);

        // Feedback effects
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);
        if ('vibrate' in navigator) navigator.vibrate(50);

        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, w, h);

        if (usePythonServer) {
            // Resize before upload → much faster network transfer
            const base64 = resizeForUpload(canvas);
            await processFramePython(base64);
        } else {
            // Edge AI one-shot fallback
            const imageData = ctx.getImageData(0, 0, w, h);
            const originalHandler = workerRef.current.onmessage;
            const handleOnce = (e) => {
                if (e.data.type === 'scan_result') {
                    handleScanResult(e.data.data);
                    workerRef.current.onmessage = originalHandler;
                    setIsCapturing(false);
                    capturingRef.current = false;
                } else if (e.data.type === 'error') {
                    notifyFailed('Sheet detect হয়নি। ভালোভাবে ধরুন।');
                    workerRef.current.onmessage = originalHandler;
                    setIsCapturing(false);
                    capturingRef.current = false;
                }
            };
            workerRef.current.onmessage = handleOnce;
            workerRef.current.postMessage({
                imageData, width: w, height: h, numQ: totalQToEvaluate,
                numOpts: exam.optionsPerQuestion || 4, isMasterKeyMode,
                useAiMode
            }, [imageData.data.buffer]);
        }
    }, [status, usePythonServer, totalQToEvaluate, exam, isMasterKeyMode, handleScanResult, processFramePython, notifyFailed, useAiMode]);

    const handleConfirm = () => {
        if (!scannedData) return;
        const finalConfirmedRoll = scannedData.roll.includes('?')
            ? (editRoll.trim() || scannedData.roll)
            : scannedData.roll;
        const confirmedData = { ...scannedData, roll: finalConfirmedRoll };
        onSave(confirmedData);
        setBatchHistory(p => [confirmedData, ...p]);
        setEditRoll('');
        setScannedData(null);
        setStatus('ready');
    };

    // ── PDF.js helper — renders one PDF page to a canvas and returns it
    const pdfPageToCanvas = async (file, pageNum = 1, pdfDocInput = null) => {
        try {
            // Set worker from a reliable CDN matched to the installed version
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            let pdfDoc = pdfDocInput;
            if (!pdfDoc) {
                const arrayBuffer = await file.arrayBuffer();
                pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            }
            const page = await pdfDoc.getPage(pageNum);
            const scale = 2.0; // higher scale → better quality for OMR detection
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width; canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            return { canvas, totalPages: pdfDoc.numPages, pdfDoc };
        } catch (err) {
            console.error('PDF.js Error:', err);
            throw new Error('PDF প্রসেস করা সম্ভব হয়নি।');
        }
    };

    // ── Generate thumbnails for all PDF pages (for the page picker modal)
    const generatePdfThumbnails = async (file, pdfDocInput = null) => {
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            let pdfDoc = pdfDocInput;
            if (!pdfDoc) {
                const arrayBuffer = await file.arrayBuffer();
                pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            }

            // Render all thumbnails in parallel for "very fast" performance
            const pagePromises = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(async (p) => {
                const page = await pdfDoc.getPage(p);
                const vp = page.getViewport({ scale: 0.2 }); // small scale for thumbs
                const c = document.createElement('canvas');
                c.width = vp.width; c.height = vp.height;
                await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
                return { pageNum: p, dataUrl: c.toDataURL('image/jpeg', 0.4) }; // lower quality for thumbs
            });

            return await Promise.all(pagePromises);
        } catch (err) {
            console.error('PDF.js Thumbnails Error:', err);
            throw new Error('PDF থাম্বনেইল তৈরি করা সম্ভব হয়নি।');
        }
    };

    // ── Process a canvas through the existing pipeline (Python or Edge AI)
    const processCanvas = async (canvas) => {
        if (usePythonServer) {
            try {
                const base64 = resizeForUpload(canvas);
                await processFramePython(base64);
            } catch (err) {
                console.warn("Python failed, trying Edge AI fallback...");
                setUsePythonServer(false);
                await processWithWorker(canvas);
            }
        } else {
            await processWithWorker(canvas);
        }
    };

    const processWithWorker = async (canvas) => {
        if (!workerRef.current || !isCvLoaded) {
            notifyFailed('Edge AI প্রস্তুত হয়নি। কিছুক্ষণ অপেক্ষা করুন।');
            setIsCapturing(false); capturingRef.current = false;
            return;
        }

        // Logic: Resize if too large for local worker to handle efficiently
        let targetCanvas = canvas;
        const MAX_DIM = 1200;
        if (canvas.width > MAX_DIM || canvas.height > MAX_DIM) {
            const scale = Math.min(MAX_DIM / canvas.width, MAX_DIM / canvas.height);
            const temp = document.createElement('canvas');
            temp.width = canvas.width * scale;
            temp.height = canvas.height * scale;
            const tCtx = temp.getContext('2d');
            tCtx.drawImage(canvas, 0, 0, temp.width, temp.height);
            targetCanvas = temp;
        }

        const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
        const originalHandler = workerRef.current.onmessage;

        const handleOnce = (ev) => {
            if (ev.data.type === 'scan_result') {
                handleScanResult(ev.data.data);
                workerRef.current.onmessage = originalHandler;
                setIsCapturing(false); capturingRef.current = false;
            } else if (ev.data.type === 'error') {
                notifyFailed(ev.data.message || 'ফাইল থেকে OMR detect হয়নি।');
                workerRef.current.onmessage = originalHandler;
                setIsCapturing(false); capturingRef.current = false;
            }
        };

        workerRef.current.onmessage = handleOnce;
        workerRef.current.postMessage({
            imageData, width: targetCanvas.width, height: targetCanvas.height, numQ: totalQToEvaluate,
            numOpts: exam.optionsPerQuestion || 4, isMasterKeyMode,
            useAiMode
        }, [imageData.data.buffer]);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (capturingRef.current || status !== 'ready') return;
        e.target.value = '';

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            // PDF flow
            capturingRef.current = true;
            setIsCapturing(true);
            try {
                // Return pdfDoc to reuse it
                const { canvas, totalPages, pdfDoc } = await pdfPageToCanvas(file, 1);
                if (totalPages === 1) {
                    // Single page → scan directly
                    await processCanvas(canvas);
                } else {
                    // Multi-page → show page picker
                    const thumbs = await generatePdfThumbnails(file, pdfDoc);
                    setPdfFile(file);
                    setPdfPages(thumbs);
                    setShowPdfPicker(true);
                    setIsCapturing(false);
                    capturingRef.current = false;
                }
            } catch (err) {
                notifyFailed('PDF পড়া যায়নি। অন্য ফাইল চেষ্টা করুন।');
                setIsCapturing(false);
                capturingRef.current = false;
            }
        } else {
            // Image flow (existing)
            capturingRef.current = true;
            setIsCapturing(true);
            const img = new Image();
            img.onload = async () => {
                const canvas = canvasRef.current;
                if (!canvas) { setIsCapturing(false); capturingRef.current = false; return; }
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0);
                await processCanvas(canvas);
            };
            img.src = URL.createObjectURL(file);
        }
    };

    // ── PDF page picker — user selects which page to scan
    const handlePdfPageSelect = async (pageNum) => {
        setShowPdfPicker(false);
        capturingRef.current = true;
        setIsCapturing(true);
        try {
            const { canvas } = await pdfPageToCanvas(pdfFile, pageNum);
            await processCanvas(canvas);
        } catch {
            notifyFailed('PDF পেজ process হয়নি।');
            setIsCapturing(false);
            capturingRef.current = false;
        }
        setPdfFile(null); setPdfPages([]);
    };

    // ── Status text helper
    const statusText = () => {
        if (isCapturing) return serverWarming ? '🔥 Server Warming Up...' : '⏳ Processing...';
        if (isAligned) return '🟢 Sheet Detected';
        if (status === 'ready') return '📷 Ready';
        return status;
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {exam.title || 'Exam'} &nbsp;·&nbsp; Q: {totalQToEvaluate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Server Engine Toggle */}
                            <button
                                onClick={() => setUsePythonServer(!usePythonServer)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all flex items-center gap-1.5 ${usePythonServer ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}
                                title={usePythonServer ? 'Using Cloud Server (More accurate) - Tap to switch to Local' : 'Using Local Edge AI (Faster) - Tap to switch to Cloud'}
                            >
                                <div className={`w-2 h-2 rounded-full ${usePythonServer ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                {usePythonServer ? 'CLOUD ENGINE' : 'LOCAL ENGINE'}
                            </button>

                            <button
                                onClick={() => setUseAiMode(!useAiMode)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all flex items-center gap-1.5 ${useAiMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${useAiMode ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
                                {useAiMode ? 'AI MODE ON' : 'AI MODE OFF'}
                            </button>
                            <button
                                onClick={() => setIsMasterKeyMode(!isMasterKeyMode)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all ${isMasterKeyMode ? 'bg-orange-500 border-orange-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Zap size={14} /> {isMasterKeyMode ? 'SCANNING KEY...' : 'SET MASTER KEY'}
                            </button>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-xl"><X size={18} /></button>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Flash Overlay */}
                        <div className={`absolute inset-0 bg-white z-[100] transition-opacity duration-200 pointer-events-none ${showFlash ? 'opacity-100' : 'opacity-0'}`} />

                        {/* Alignment frame overlay */}
                        {status === 'ready' && sourceType === 'camera' && isCameraOn && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {isAligned && (
                                    <div className="absolute top-5 inset-x-0 flex justify-center z-50">
                                        <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block"></span>
                                            Sheet Detected ✓
                                        </div>
                                    </div>
                                )}
                                <div className={`absolute inset-0 border-[40px] transition-all duration-300 ${isAligned ? 'border-emerald-500/15' : 'border-slate-950/40'} backdrop-blur-[1px]`}></div>
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm aspect-[3/4] border-2 transition-all duration-300 ${isAligned ? 'border-emerald-400 scale-105 shadow-[0_0_80px_rgba(52,211,153,0.3)]' : 'border-sky-500/30'} rounded-[3rem]`}>
                                    <div className={`absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 rounded-tl-3xl ${isAligned ? 'border-emerald-400' : 'border-sky-500'}`} />
                                    <div className={`absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 rounded-tr-3xl ${isAligned ? 'border-emerald-400' : 'border-sky-500'}`} />
                                    <div className={`absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 rounded-bl-3xl ${isAligned ? 'border-emerald-400' : 'border-sky-500'}`} />
                                    <div className={`absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 rounded-br-3xl ${isAligned ? 'border-emerald-400' : 'border-sky-500'}`} />
                                </div>
                            </div>
                        )}

                        {/* Start Camera Overlay */}
                        {status === 'ready' && sourceType === 'camera' && !isCameraOn && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
                                <button
                                    onClick={() => startCamera()}
                                    className="group flex flex-col items-center gap-4 p-8 rounded-[3rem] bg-white text-slate-900 shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                                        <Camera size={40} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black uppercase tracking-tight">Open Camera</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1">ক্যামেরা চালু করতে এখানে ট্যাপ করুন</p>
                                    </div>
                                </button>

                                <div className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest text-center">
                                        OR UPLOAD FILE BELOW
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Server warming overlay */}
                        {isCapturing && serverWarming && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 z-50">
                                <div className="flex flex-col items-center gap-4 p-8 bg-white/10 rounded-3xl backdrop-blur-md">
                                    <svg className="w-12 h-12 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-white font-black text-sm">Server Warming Up...</p>
                                    <p className="text-slate-300 text-xs text-center">প্রথমবার একটু সময় লাগে।<br />অনুগ্রহ করে অপেক্ষা করুন।</p>
                                </div>
                            </div>
                        )}

                        {/* Result / Review Panel */}
                        {status === 'scanned' && scannedData && (
                            <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm z-[60]">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-y-auto max-h-[95%] p-5 text-center">

                                    {/* Roll Badge — smaller */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 mx-auto border-4 border-white shadow-xl ${scannedData.icrVerified ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                        <p className={`text-base font-black ${scannedData.icrVerified ? 'text-emerald-700' : 'text-amber-600'}`}>
                                            {scannedData.icrVerified ? scannedData.roll.slice(-3) : '???'}
                                        </p>
                                    </div>

                                    <h3 className="text-base font-black text-slate-900 mb-1">
                                        {scannedData.icrVerified ? 'Sheet Scanned ✓' : 'Roll Unreadable ⚠️'}
                                    </h3>

                                    {/* Editable Roll — show when unreadable */}
                                    {!scannedData.icrVerified ? (
                                        <div className="mb-3">
                                            {scannedData.rollCrop && (
                                                <div className="mb-2 rounded-xl overflow-hidden border-2 border-slate-100 shadow-inner">
                                                    <p className="text-[9px] font-black text-slate-400 bg-slate-50 py-0.5 uppercase">Sheet Roll Preview</p>
                                                    <img src={scannedData.rollCrop} alt="Roll Crop" className="w-full h-12 object-contain bg-white" />
                                                </div>
                                            )}
                                            <p className="text-xs text-amber-600 font-bold mb-1.5">Roll বুঝা যায়নি। নিচে লিখুন:</p>
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

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase">Correct</p>
                                            <p className="text-xl font-black text-emerald-600">{scannedData.correct}</p>
                                        </div>
                                        <div className="bg-sky-50 rounded-xl p-2 border border-sky-100">
                                            <p className="text-[9px] font-black text-sky-400 uppercase">Score</p>
                                            <p className="text-xl font-black text-sky-600">{scannedData.score}</p>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-2 border border-red-100">
                                            <p className="text-[9px] font-black text-red-400 uppercase">Wrong</p>
                                            <p className="text-xl font-black text-red-500">{scannedData.wrong}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-2 border border-slate-200">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Skip</p>
                                            <p className="text-xl font-black text-slate-600">{scannedData.unattempted}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Retake button */}
                                        <button
                                            onClick={() => { setScannedData(null); setEditRoll(''); setStatus('ready'); }}
                                            className="flex-1 py-3 bg-rose-50 border border-rose-200 text-rose-500 font-black rounded-2xl text-xs uppercase hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Retake size={14} /> Retake
                                        </button>



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
                <div className="px-4 py-3 bg-white border-t">
                    {/* Top row: status + history */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                            <p className="text-xs font-bold text-slate-600">{statusText()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</p>
                            <p className="text-xs font-bold text-slate-600">{batchHistory.length} Scanned</p>
                        </div>
                    </div>

                    {/* Bottom row: controls */}
                    <div className="flex items-center justify-between gap-2">

                        {/* LEFT: Upload/Scanner Button — big and prominent */}
                        <div className="flex flex-col items-center gap-1">
                            <input
                                type="file"
                                accept="image/*,.pdf,application/pdf"
                                capture={undefined}
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCapturing || status !== 'ready'}
                                className="h-11 px-4 rounded-2xl bg-slate-800 hover:bg-black disabled:opacity-40 flex items-center gap-2 text-white text-xs font-black transition-colors shadow-md"
                                title="Upload image, PDF, or scan from USB scanner"
                            >
                                <ImageIcon size={18} />
                                <span>UPLOAD FILE</span>
                            </button>
                        </div>

                        {/* CENTER: Big Capture button */}
                        <button
                            onClick={handleManualCapture}
                            disabled={isCapturing || status !== 'ready'}
                            className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-xl flex-shrink-0
                                    ${isCapturing
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : isMasterKeyMode
                                        ? 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse'
                                        : isAligned
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white scale-105 shadow-emerald-300 animate-pulse'
                                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                                }`}
                            title={isMasterKeyMode ? 'Scan Master Key' : 'Capture'}
                        >
                            {isCapturing ? (
                                <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <>
                                    <Camera size={28} />
                                    <span className="mt-0.5 text-[9px]">{isMasterKeyMode ? 'SCAN KEY' : 'CAPTURE'}</span>
                                </>
                            )}
                        </button>

                        {/* RIGHT: Camera controls */}
                        <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                            {isCameraOn ? (
                                <>
                                    {/* Stop Camera Button */}
                                    <button
                                        onClick={stopCamera}
                                        className="h-9 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black transition-colors flex items-center gap-2"
                                        title="Turn Off Camera"
                                    >
                                        <CameraOff size={16} />
                                        <span>Camera Off</span>
                                    </button>

                                    {/* Front/Back toggle */}
                                    <button
                                        onClick={toggleFacingMode}
                                        disabled={isCapturing}
                                        className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center gap-2 text-slate-600 text-xs font-black transition-colors"
                                        title={facingMode === 'environment' ? 'Back Camera — tap for Front' : 'Front Camera — tap for Back'}
                                    >
                                        {facingMode === 'environment' ? '📷 Back' : '🤳 Front'}
                                    </button>

                                    {/* Camera selector dropdown (only if multiple cameras) */}
                                    {devices.length > 1 && (
                                        <select
                                            value={selectedDeviceId}
                                            onChange={e => { setSelectedDeviceId(e.target.value); startCamera(e.target.value); }}
                                            className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white max-w-[130px] truncate"
                                        >
                                            {devices.map((d, i) => {
                                                const label = d.label || `Camera ${i + 1}`;
                                                const isBack = /back|rear|environment/i.test(label);
                                                const isFront = /front|user|face/i.test(label);
                                                const icon = isBack ? '📷' : isFront ? '🤳' : '📹';
                                                return (
                                                    <option key={d.deviceId} value={d.deviceId}>
                                                        {icon} {label.length > 20 ? label.slice(0, 20) + '…' : label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                </>
                            ) : (
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camera</p>
                                    <p className="text-xs font-bold text-slate-300">OFF</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PDF Page Picker Modal */}
            {showPdfPicker && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900">PDF Page Select</h3>
                                <p className="text-xs text-slate-400 font-bold">{pdfPages.length} pages — কোন page scan করবেন?</p>
                            </div>
                            <button
                                onClick={() => { setShowPdfPicker(false); setPdfFile(null); setPdfPages([]); }}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {pdfPages.map(({ pageNum, dataUrl }) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePdfPageSelect(pageNum)}
                                    className="group relative rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-sky-400 transition-all shadow-sm aspect-[3/4] bg-slate-50"
                                    title={`Page ${pageNum} scan করুন`}
                                >
                                    <img src={dataUrl} alt={`Page ${pageNum}`} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/10 transition-colors" />
                                    <div className="absolute bottom-1 inset-x-0 flex justify-center">
                                        <span className="text-[10px] font-black bg-white/90 px-2 py-0.5 rounded-full text-slate-600">
                                            Page {pageNum}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OmrScanner;
