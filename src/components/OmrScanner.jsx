import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
// pdfjsLib: dynamic import — PDF upload করলেই লোড হবে (lazy)
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
const PYTHON_TIMEOUT_MS = 50000; // 50s — Render cold-start can take ~50s

const OmrScanner = ({ exam, onSave, onClose, externalKey, embedded, activeQuestions }) => {
    const { notifySuccess, notifyFailed } = useContext(AuthContext);
    const [status, setStatus] = useState('idle');
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
    // ── Adaptive Defaults: Mobile uses Edge AI by default, PC uses "perfect" Python Server
    const [useAiMode, setUseAiMode] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
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
    const [scanLineY, setScanLineY] = useState(0);

    const capturingRef = useRef(false); // instant double-click guard (sync with isCapturing state)

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);
    const workerRef = useRef(null);

    const [realTimeOverlayData, setRealTimeOverlayData] = useState(null);

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

    // ── Adaptive Engine Parameters (Matched to Device)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const engineParams = isMobile ? {
        rollStartY: 0.148,
        rollR: 9,
        cornerZone: 0.45
    } : {
        rollStartY: 0.145,
        rollR: 7,
        cornerZone: 0.55
    };

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

            // ── Haptic Feedback (Vibrate on success)
            if ('vibrate' in navigator) {
                try { navigator.vibrate(50); } catch (e) { /* ignore */ }
            }
        }
    }, [calculateScore, onSave, notifySuccess]);

    // ── Worker setup — camera চালু হলেই worker load হবে (low-RAM device-এর জন্য)
    const initWorker = () => {
        if (workerRef.current) return;
        try {
            // Cache busting for mobile
            workerRef.current = new Worker(`/omrWorker.js?v=${Date.now()}`);
            workerRef.current.onmessage = (e) => {
                if (e.data.type === 'ready') {
                    console.log("[+] OMR Worker Ready");
                    setIsCvLoaded(true);
                    setStatus('ready');
                } else if (e.data.type === 'detecting') {
                    setIsAligned(false);
                    setRealTimeOverlayData(null);
                } else if (e.data.type === 'scan_result') {
                    setIsAligned(true);
                    setRealTimeOverlayData({
                        markerPoints: e.data.markerPoints,
                        bubbles: e.data.data.detectedAnswers
                    });
                } else if (e.data.type === 'error') {
                    setIsAligned(false);
                    setRealTimeOverlayData(null);
                }
            };
            setStatus('initializing');

            // Safety timeout: If worker/OpenCV doesn't respond within 15s, just force it
            // This prevents the "infinite loading" on slower mobile devices
            setTimeout(() => {
                if (workerRef.current && status === 'initializing' && !isCvLoaded) {
                    console.warn("[!] CPU/Network too slow? Forcing ready state.");
                    setIsCvLoaded(true);
                    setStatus('ready');
                }
            }, 12000);

        } catch (e) {
            console.error('[OMR] Worker creation failed:', e);
            setStatus('error');
        }
    };

    useEffect(() => {
        // ── Auto-init worker on mount (background load for better speed)
        initWorker();

        return () => {
            if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // ── Server Wake-Up Ping: Render free tier cold-start-এ সাহায্য করে
    useEffect(() => {
        const pingServer = async () => {
            try {
                const apiBase = window.location.hostname === 'localhost'
                    ? 'http://localhost:5050'
                    : (import.meta.env.VITE_OMR_API_URL || 'https://sohag-physics-omr-engine.vercel.app'); // Updated to stable vercel prod endpoint
                await fetch(`${apiBase}/health`, { method: 'GET', signal: AbortSignal.timeout(60000) });
                console.log('[+] Server is warm and ready.');
            } catch (e) {
                // Silently ignore — this is just a background warm-up
                console.log('[-] Server warm-up ping failed (will try on scan):', e.message);
            }
        };
        pingServer();
    }, []); // mount হওয়ার সময় একবারই চলে


    // Smart camera start: tries back camera first, falls back to any camera
    const startCamera = async (deviceId = null, forceFacing = null) => {
        try {
            stopCamera();
            // ── Ensure worker is alive
            if (!workerRef.current) initWorker();

            setStatus('initializing');
            const facing = forceFacing || facingMode;

            // ── Build video constraints with autofocus hints
            const baseVideoConstraints = {
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            };

            let stream;
            if (deviceId) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { ...baseVideoConstraints, deviceId: { exact: deviceId } }
                });
            } else {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { ...baseVideoConstraints, facingMode: { ideal: facing } }
                    });
                } catch {
                    // fallback — basic constraints
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: { ideal: facing } }
                        });
                    } catch {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    }
                }
            }

            // ── Apply advanced autofocus after stream starts
            const track = stream.getVideoTracks()[0];
            if (track) {
                const capabilities = track.getCapabilities?.() || {};
                const advancedConstraints = {};

                // Enable continuous autofocus if supported
                if (capabilities.focusMode?.includes?.('continuous')) {
                    advancedConstraints.focusMode = 'continuous';
                }
                // Disable torch/flash if available (helps focus in normal light)
                if (capabilities.torch) {
                    advancedConstraints.torch = false;
                }

                if (Object.keys(advancedConstraints).length > 0) {
                    try {
                        await track.applyConstraints({ advanced: [advancedConstraints] });
                        console.log('[+] Camera: autofocus enabled');
                    } catch (e) {
                        console.log('[-] applyConstraints failed (non-critical):', e.message);
                    }
                }
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                try {
                    await videoRef.current.play();
                } catch (e) {
                    console.error("Video play failed:", e);
                }
            }

            // Enumerate and label all video devices
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
            setDevices(videoDevices);

            const activeDeviceId = track?.getSettings()?.deviceId || '';
            setSelectedDeviceId(activeDeviceId);
            setIsCameraOn(true);

            if (isCvLoaded) {
                setStatus('ready');
            }
        } catch (err) {
            console.error('Camera start failed:', err);
            notifyFailed('ক্যামেরা চালু করা যায়নি। ডিভাইসের পারমিশন চেক করুন।');
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


    // ── Python server call with 50s timeout
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
                : (import.meta.env.VITE_OMR_API_URL || 'https://omrenginepython.onrender.com');
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
                errMsg = 'Server Timeout (50s)';
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

    // ── Real-time Overlay Drawing ──
    const drawOverlay = useCallback(() => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;
        if (!video) return;

        // Resize canvas to match display size of video
        const rect = video.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Bubbles & Markers (if data exists)
        if (realTimeOverlayData) {
            const scaleX = canvas.width / 800;
            const scaleY = canvas.height / 1000;

            realTimeOverlayData.bubbles.forEach(q => {
                if (!q.options) return;
                q.options.forEach(opt => {
                    if (q.detected === opt.opt) {
                        const x = opt.x * scaleX;
                        const y = opt.y * scaleY;
                        const r = 8 * scaleX;
                        ctx.beginPath();
                        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
                        ctx.strokeStyle = '#10b981';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
                        ctx.fill();
                        ctx.fillStyle = '#fff';
                        ctx.font = `bold ${Math.round(10 * scaleX)}px Inter`;
                        ctx.textAlign = 'center';
                        ctx.fillText(opt.opt, x, y + (4 * scaleX));
                    }
                });
            });

            const { markerPoints } = realTimeOverlayData;
            const pulse = 1 + Math.sin(Date.now() / 150) * 0.1;
            ctx.lineWidth = 3 * pulse;
            ctx.strokeStyle = '#10b981';
            markerPoints.forEach(p => {
                const px = p.x * scaleX, py = p.y * scaleY;
                ctx.strokeRect(px - (10 * pulse), py - (10 * pulse), 20 * pulse, 20 * pulse);
            });
        }

        // 2. Scanning Sweep Line (Always moving when camera is on and ready)
        if (status === 'ready' && !capturingRef.current) {
            const scanY = (Date.now() % 2000) / 2000 * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(canvas.width, scanY);
            ctx.lineWidth = 2;
            const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 2);
            gradient.addColorStop(0, 'rgba(14, 165, 233, 0)');
            gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.1)');
            gradient.addColorStop(1, 'rgba(14, 165, 233, 0.6)');
            ctx.strokeStyle = gradient;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(canvas.width, scanY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.8)';
            ctx.stroke();
        }
    }, [realTimeOverlayData, status]);

    useEffect(() => {
        let timer;
        let lastDetectTime = 0;
        const DETECT_INTERVAL_MS = 333; // ~3fps — 60fps থেকে 20x কম CPU/memory ব্যবহার

        // ── Off-screen small canvas for detection only (1/4 resolution)
        const detectionCanvas = document.createElement('canvas');
        const DETECT_MAX_W = 480; // low-res এ detect করো, CAPTURE-এ full-res
        const detectionCtx = detectionCanvas.getContext('2d', { willReadFrequently: true });

        const loop = (timestamp) => {
            drawOverlay();
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (status === 'ready' && !capturingRef.current && sourceType === 'camera'
                && video && canvas && isCvLoaded && workerRef.current
                && timestamp - lastDetectTime >= DETECT_INTERVAL_MS) {

                lastDetectTime = timestamp;
                const vw = video.videoWidth, vh = video.videoHeight;
                if (vw && vh) {
                    // Scale down for detection (up to 480px wide)
                    const scale = Math.min(1, DETECT_MAX_W / vw);
                    const dw = Math.round(vw * scale);
                    const dh = Math.round(vh * scale);
                    detectionCanvas.width = dw;
                    detectionCanvas.height = dh;
                    detectionCtx.drawImage(video, 0, 0, dw, dh);
                    const imageData = detectionCtx.getImageData(0, 0, dw, dh);
                    workerRef.current.postMessage({
                        imageData, width: dw, height: dh, numQ: totalQToEvaluate,
                        numOpts: exam.optionsPerQuestion || 4, isMasterKeyMode,
                        useAiMode,
                        engineParams
                    }, [imageData.data.buffer]);
                }
            }
            timer = requestAnimationFrame(loop);
        };
        timer = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(timer);
    }, [status, sourceType, isCvLoaded, totalQToEvaluate, exam, isMasterKeyMode, drawOverlay, useAiMode]);


    // ── Manual capture — called when user presses big Capture button
    const handleManualCapture = useCallback(async () => {
        if (capturingRef.current || status !== 'ready') return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) { notifyFailed('ক্যামেরা প্রস্তুত নয়।'); return; }

        capturingRef.current = true;
        setIsCapturing(true);

        // Feedback effects: flash + vibrate
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);
        if ('vibrate' in navigator) navigator.vibrate(50);

        // ── Focus settle delay: camera-কে autofocus করতে 800ms দাও,
        //    তারপর ছবি তোলা হবে (blurry image সমস্যা কমায়)
        await new Promise(resolve => setTimeout(resolve, 800));

        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        // Re-read video dimensions after delay (may have changed)
        const fw = video.videoWidth, fh = video.videoHeight;
        ctx.drawImage(video, 0, 0, fw || w, fh || h);
        canvas.width = fw || w;
        canvas.height = fh || h;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (usePythonServer) {
            const base64 = resizeForUpload(canvas);
            await processFramePython(base64);
        } else {
            // Edge AI one-shot fallback
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
                imageData, width: canvas.width, height: canvas.height, numQ: totalQToEvaluate,
                numOpts: exam.optionsPerQuestion || 4, isMasterKeyMode,
                useAiMode,
                engineParams
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
        if (status === 'scanned') return '📝 Review Result';
        if (status === 'initializing') return '⚡ Loading Engine...';
        if (status === 'idle') return '💤 Standby';
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
                            <div className="flex flex-col items-end px-3">
                                <div className="flex items-center gap-1.5 min-w-[120px] justify-end">
                                    <div className={`w-2 h-2 rounded-full ${isAligned ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">SMART ENGINE READY</span>
                                </div>
                                <p className="text-[9px] font-black text-slate-400">AUTO FALLBACK ENABLED</p>
                            </div>

                            <button
                                onClick={() => setIsMasterKeyMode(!isMasterKeyMode)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all shadow-sm ${isMasterKeyMode ? 'bg-orange-500 border-orange-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}
                            >
                                <Zap size={14} className="inline mr-1" /> {isMasterKeyMode ? 'SCANNING...' : 'SET MASTER'}
                            </button>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={overlayCanvasRef} className="absolute inset-0 z-20 pointer-events-none" />
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

                        {/* Start Camera / Initializing Overlay */}
                        {sourceType === 'camera' && !isCameraOn && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[4px] p-8 text-center">
                                {(status === 'initializing' || !isCvLoaded) ? (
                                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                                        <div className="relative w-24 h-24">
                                            <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-t-sky-500 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-sky-400">
                                                <Target size={32} className="animate-pulse" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white text-lg font-black uppercase tracking-widest mb-1">Loading Engine</p>
                                            <p className="text-slate-400 text-xs font-bold">স্ক্যান ইঞ্জিন লোড হচ্ছে, এক মুহূর্ত অপেক্ষা করুন...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => startCamera()}
                                        className="group flex flex-col items-center gap-5 p-10 rounded-[4rem] bg-white text-slate-900 shadow-2xl transition-all duration-300 border border-white/20"
                                    >
                                        <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-500 shadow-lg">
                                            <Camera size={44} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-black uppercase tracking-tight">Open Camera</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">ক্যামেরা চালু করতে এখানে ট্যাপ করুন</p>
                                        </div>
                                    </motion.button>
                                )}

                                {!isCvLoaded && (
                                    <div className="mt-12 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Ready to scan in 5..4..3..</p>
                                    </div>
                                )}
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
                            <div className="absolute inset-0 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md z-[60] transition-all animate-in fade-in duration-500">
                                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden p-6 text-center border border-white/20">

                                    {/* Roll Badge */}
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 mx-auto border-[6px] border-white shadow-2xl transform -translate-y-2 ${scannedData.icrVerified ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
                                        <p className="text-2xl font-black text-white">
                                            {scannedData.icrVerified ? scannedData.roll.slice(-3) : '???'}
                                        </p>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-1">
                                        {scannedData.icrVerified ? 'Success! Sheet Scanned ✓' : 'Correction Needed ⚠️'}
                                    </h3>

                                    {/* Editable Roll */}
                                    {!scannedData.icrVerified ? (
                                        <div className="mb-4">
                                            {scannedData.rollCrop && (
                                                <div className="mb-3 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50 p-2">
                                                    <img src={scannedData.rollCrop} alt="Roll Crop" className="w-full h-14 object-contain" />
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                value={editRoll}
                                                onChange={e => setEditRoll(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Enter Roll Number"
                                                className="w-full px-5 py-4 border-2 border-amber-200 rounded-2xl text-center font-black text-slate-800 text-xl focus:outline-none focus:border-sky-500 bg-amber-50/50 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex flex-col items-center">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scanned Roll</span>
                                            <p className="text-lg font-black text-slate-600">{scannedData.roll}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 transition-transform hover:scale-105">
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Correct</p>
                                            <p className="text-2xl font-black text-emerald-600">{scannedData.correct}</p>
                                        </div>
                                        <div className="bg-sky-50/50 rounded-2xl p-3 border border-sky-100 transition-transform hover:scale-105">
                                            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">Score</p>
                                            <p className="text-2xl font-black text-sky-600 font-mono italic">{scannedData.score}</p>
                                        </div>
                                        <div className="bg-rose-50/50 rounded-2xl p-3 border border-rose-100 transition-transform hover:scale-105">
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Errors</p>
                                            <p className="text-2xl font-black text-rose-500">{scannedData.wrong}</p>
                                        </div>
                                        <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 transition-transform hover:scale-105">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blank</p>
                                            <p className="text-2xl font-black text-slate-500">{scannedData.unattempted}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setScannedData(null); setEditRoll(''); setStatus('ready'); }}
                                            className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[11px] uppercase hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Retake size={16} /> Retake
                                        </button>

                                        <button
                                            onClick={handleConfirm}
                                            disabled={!scannedData.icrVerified && !editRoll.trim()}
                                            className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-30 disabled:translate-y-0"
                                        >
                                            ✓ Confirm & Next
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
                    <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-bold text-slate-600">{statusText()}</p>
                                {status === 'initializing' && !isCvLoaded && (
                                    <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            className="w-full h-full bg-sky-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest leading-none mb-1">Build</p>
                            <button
                                onClick={() => window.location.reload(true)}
                                className="text-[9px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full hover:bg-sky-100 transition-colors"
                                title="Force Refresh App"
                            >
                                v0.1.0-260309-2030 📱💻
                            </button>
                        </div>
                        <div className="text-right flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">History</p>
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
