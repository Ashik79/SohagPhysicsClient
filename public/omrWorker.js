/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 *  SOHAG PHYSICS — UNIVERSAL OMR WEB WORKER  v4.0
 *  ─────────────────────────────────────────────
 *  Universal Sheet Edition — One SET per Exam
 *  • Always 60 bubble rows on sheet
 *  • Scanner evaluates only first N (activeQ) questions
 *  • SET bubble (A/B/C/D) auto-detected for identification
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 *  ENGINE CONSTANTS — must match PremiumOmrSheet.jsx ENGINE object:
 *    setStartX   : 56%    →  setColX   = WARPED_W * 0.56
 *    setStartY   : 16.5%  →  setStartY = 0.165
 *    setRowSpace : 3.5%   →  setRowGap = 0.035
 *
 *    rollStartX  : 7.2%   →  rSX = 0.072
 *    rollColSpace: 7%     →  rCG = 0.07
 *    rollStartY  : 16.5%  →  rSY = 0.165
 *    rollRowSpace: 1.65%  →  rRG = 0.0165
 *
 *    qStartY     : 36.5%  →  qStartY   = 0.365
 *    qRowSpace   : 3.05%  →  qRowSpace = 0.0305
 *    gapHeight   : 0.85%  →  gapHeight = 0.0085
 *    colBaseX    : [2,35,68]%
 *    bubbleOffsetX: 8%
 *    bubbleSpacingX: 5.5%
 */


self.importScripts('https://docs.opencv.org/4.5.4/opencv.js');


const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const WARPED_W = 800;
const WARPED_H = 1000;
const TOTAL_SHEET_Q = 100;
const Q_PER_COL = 25;

cv['onRuntimeInitialized'] = () => {
    self.postMessage({ type: 'ready' });
};

// ── Bubble column X position (matches ENGINE.colBaseX + bubbleOffsetX + oi * bubbleSpacingX)
function bubbleX(ci, oi) {
    const colBaseX = ci === 0 ? 0.05 : (ci === 1 ? 0.285 : (ci === 2 ? 0.52 : 0.755));
    return Math.round(WARPED_W * (colBaseX + 0.08 + oi * 0.038));
}

function bubbleY(i) {
    const ri = i % Q_PER_COL;
    const ci = Math.floor(i / Q_PER_COL);
    // Matches Python: q_start_y (0.342), q_row_space (0.0248), gap_height (0.003)
    // Plus col_y_offset (-1 for col 3 & 4)
    const yOffset = ci >= 2 ? -1 : 0;
    return Math.round(WARPED_H * (0.342 + ri * 0.0248 + Math.floor(ri / 5) * 0.003)) + yOffset;
}

// ── Count filled pixels in a circular region (more accurate than rectangle)
function countPixels(mat, cx, cy, r) {
    const x = cx - r, y = cy - r, s = r * 2;
    if (x < 0 || y < 0 || x + s > mat.cols || y + s > mat.rows) return 0;

    const roi = mat.roi(new cv.Rect(x, y, s, s));
    let count = 0;
    let totalCirclePixels = 0;

    // Manual circular logic: check distance from center
    // We use a simple loop over ROI for maximum precision on small radii
    for (let i = 0; i < s; i++) {
        for (let j = 0; j < s; j++) {
            const dx = j - r;
            const dy = i - r;
            if (dx * dx + dy * dy <= (r - 1) * (r - 1)) {
                totalCirclePixels++;
                if (roi.ucharAt(i, j) > 0) count++;
            }
        }
    }

    roi.delete();
    // Return an object with count and total available pixels in circle
    return { count, total: totalCirclePixels };
}

self.onmessage = function (e) {
    if (!cv || !cv.Mat) return;

    const { imageData, numQ, numOpts, isMasterKeyMode, selectedSet } = e.data;
    // Clamp activeQ to [5, 60]
    const activeQ = Math.min(TOTAL_SHEET_Q, Math.max(5, numQ || TOTAL_SHEET_Q));

    let src, gray, thresh, blurMat, warped, warpedGray, M, ordered, dstCoords;

    try {
        src = cv.matFromImageData(imageData);
        gray = new cv.Mat();
        thresh = new cv.Mat();
        blurMat = new cv.Mat();

        // ── Pre-process: CLAHE + Gaussian blur + Adaptive + Otsu combined
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        const clahe = new cv.CLAHE(2.5, new cv.Size(8, 8));
        clahe.apply(gray, gray);
        clahe.delete();
        cv.GaussianBlur(gray, blurMat, new cv.Size(5, 5), 0);
        // Adaptive threshold (good for shadows) - slightly larger block size for robustness
        cv.adaptiveThreshold(blurMat, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 3);

        // ── Find 4 corner registration markers (AI vs Legacy)
        let markers = [];
        const isAiEnabled = e.data.useAiMode;

        if (isAiEnabled) {
            // AI Detection: placeholder (ONNX removed for performance)
            console.log("[*] AI mode not active — using Legacy detection");
        }

        const imgW = src.cols, imgH = src.rows;
        // CORNER_ZONE 0.55 — (Reverted to v1925 "perfect" state)
        const CORNER_ZONE = 0.55;

        // ── Helper: scan contours for corner markers
        function scanContours(threshMat, areaMin, areaMax) {
            const found = [];
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(threshMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const area = cv.contourArea(cnt);
                if (area > areaMin && area < areaMax) {
                    const approx = new cv.Mat();
                    // epsilon বাড়িয়ে perspective distortion handle করা হয়েছে
                    cv.approxPolyDP(cnt, approx, 0.06 * cv.arcLength(cnt, true), true);
                    if (approx.rows >= 4 && approx.rows <= 6) {
                        const r = cv.boundingRect(approx);
                        // aspect ratio 0.3-3.5 — perspective distortion-এ rectangle rectangular নাও দেখাতে পারে
                        const ratio = r.width / Math.max(r.height, 1);
                        if (ratio >= 0.3 && ratio <= 3.5) {
                            const mom = cv.moments(cnt);
                            if (mom.m00 > 0) {
                                const cx = mom.m10 / mom.m00, cy = mom.m01 / mom.m00;
                                const inCornerX = cx < imgW * cornerZone || cx > imgW * (1 - cornerZone);
                                const inCornerY = cy < imgH * cornerZone || cy > imgH * (1 - cornerZone);
                                if (inCornerX && inCornerY) {
                                    found.push({ x: cx, y: cy });
                                }
                            }
                        }
                    }
                    approx.delete();
                }
            }
            contours.delete();
            hierarchy.delete();
            return found;
        }

        // ── MULTI-THRESHOLD STRATEGY: সবচেয়ে বেশি marker যে config-এ পাওয়া গেছে সেটা রাখো
        // let markers = []; // This was already declared above, so commenting out to avoid redeclaration

        const configs = [
            { block: 15, C: 3 },
            { block: 11, C: 2 },
            { block: 21, C: 4 },
            { block: 25, C: 5 },
            { block: 35, C: 7 },   // larger block for high-resolution images
            { block: 9, C: 1 },   // very fine for sharp images
        ];

        for (let cfg of configs) {
            const tempThresh = new cv.Mat();
            cv.adaptiveThreshold(blurMat, tempThresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, cfg.block, cfg.C);
            const found = scanContours(tempThresh, 60, 40000);
            tempThresh.delete();
            if (found.length > markers.length) markers = found; // best result রাখো
            if (markers.length >= 4) break;
        }

        // Otsu threshold দিয়েও চেষ্টা করো (uniform lighting-এ ভালো কাজ করে)
        if (markers.length < 4) {
            const otsuThresh = new cv.Mat();
            cv.threshold(blurMat, otsuThresh, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
            const found = scanContours(otsuThresh, 60, 40000);
            otsuThresh.delete();
            if (found.length > markers.length) markers = found;
        }

        // ── Not enough markers: report and exit
        if (markers.length < 4) {
            throw new Error(`৪টি রেজিস্ট্রেশন মার্কার পাওয়া যায়নি। ${markers.length}টি পাওয়া গেছে।`);
        }


        // ── Sort markers: top-left, top-right, bottom-right, bottom-left
        markers.sort((a, b) => a.y - b.y);
        const top2 = markers.slice(0, 2).sort((a, b) => a.x - b.x);
        const bot2 = markers.slice(-2).sort((a, b) => a.x - b.x);

        // ── Final sanity check: each sorted marker must be in its expected quadrant
        const halfW = imgW / 2, halfH = imgH / 2;
        const validLayout =
            top2[0].x < halfW && top2[0].y < halfH &&   // top-left: left+top half
            top2[1].x > halfW && top2[1].y < halfH &&   // top-right: right+top half
            bot2[0].x < halfW && bot2[0].y > halfH &&   // bottom-left: left+bottom half
            bot2[1].x > halfW && bot2[1].y > halfH;     // bottom-right: right+bottom half

        if (!validLayout) {
            self.postMessage({ type: 'detecting', markersFound: 0 });
            return;
        }

        const markerPoints = [top2[0], top2[1], bot2[1], bot2[0]];

        ordered = cv.matFromArray(4, 1, cv.CV_32FC2, [top2[0].x, top2[0].y, top2[1].x, top2[1].y, bot2[1].x, bot2[1].y, bot2[0].x, bot2[0].y]);
        dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, WARPED_W - 1, 0, WARPED_W - 1, WARPED_H - 1, 0, WARPED_H - 1]);

        M = cv.getPerspectiveTransform(ordered, dstCoords);
        warped = new cv.Mat();
        cv.warpPerspective(src, warped, M, new cv.Size(WARPED_W, WARPED_H));

        // ── Enhance warped image for scanning: CLAHE + Adaptive + Otsu combined
        warpedGray = new cv.Mat();
        const warpedBlur = new cv.Mat();
        const threshOtsu = new cv.Mat();
        cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY);
        const clahe2 = new cv.CLAHE(3.5, new cv.Size(8, 8));
        clahe2.apply(warpedGray, warpedGray);
        clahe2.delete();
        cv.GaussianBlur(warpedGray, warpedBlur, new cv.Size(3, 3), 0);
        // Adaptive threshold
        cv.adaptiveThreshold(warpedBlur, warpedGray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 17, 6);
        // Otsu threshold — merge with adaptive
        cv.threshold(warpedBlur, threshOtsu, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
        cv.bitwise_or(warpedGray, threshOtsu, warpedGray);
        // Morphological cleanup: remove tiny noise
        const kernel = cv.Mat.ones(2, 2, cv.CV_8U);
        cv.morphologyEx(warpedGray, warpedGray, cv.MORPH_OPEN, kernel);
        kernel.delete(); warpedBlur.delete(); threshOtsu.delete();

        // SET Detection removed as requested
        let finalSet = '';

        // ── Roll Number Detection
        let finalRoll = '';
        const { engineParams } = e.data;
        const rSX = engineParams?.rollStartX || 0.070; // Dynamic
        const rCG = engineParams?.rollColSpace || 0.048; // Dynamic
        const rSY = engineParams?.rollStartY || 0.145; // Dynamic
        const rRG = engineParams?.rollRowGap || 0.0182;
        const rollR = engineParams?.rollR || 7;
        const cornerZone = engineParams?.cornerZone || 0.55;
        for (let c = 0; c < 6; c++) {
            let best = null, mD = 0, sD = 0;
            const allD = [];
            for (let r = 0; r < 10; r++) {
                const res = countPixels(warpedGray, Math.round(WARPED_W * (rSX + c * rCG)), Math.round(WARPED_H * (rSY + r * rRG)), rollR);
                const d = res.count;
                allD.push(d);
                if (d > mD) { sD = mD; mD = d; best = r; } else if (d > sD) sD = d;
            }
            const nonzero = allD.filter(d => d > 5);
            const dynMin = nonzero.length ? Math.round(nonzero.reduce((a, b) => a + b, 0) / nonzero.length * 0.5) : 25;
            const confident = mD >= Math.max(25, dynMin) && (sD === 0 || mD / Math.max(sD, 1) >= 1.25);
            finalRoll += confident ? String(best) : '?';
        }

        // ── Answer Bubbles — density-based detection (matches Python engine v3)
        const BUBBLE_R = 15;   // Matched to Python: 15
        const EMPTY_PCT = 2.5;  // Matched to Python: 2.5
        const VALID_PCT = 6;    // Matched to Python: 6
        const MULTI_SECOND = 5;    // Matched to Python: 5
        const CONF_RATIO = 1.3;  // Matched to Python: 1.3

        const detectedAnswers = [];
        for (let i = 0; i < TOTAL_SHEET_Q; i++) {
            const qNum = i + 1;
            if (qNum > activeQ) {
                detectedAnswers.push({ qNum, detected: null, isError: false, errorType: 'SKIPPED_INACTIVE' });
                continue;
            }

            const ci = Math.floor(i / Q_PER_COL);
            const by = bubbleY(i);
            const optData = [];
            for (let oi = 0; oi < 4; oi++) {
                const bx = bubbleX(ci, oi);
                const res = countPixels(warpedGray, bx, by, BUBBLE_R);
                optData.push({
                    opt: OPTION_LABELS[oi],
                    pixels: res.count,
                    pct: (res.count / res.total) * 100,
                    x: bx,
                    y: by
                });
            }
            optData.sort((a, b) => b.pct - a.pct);

            const topPct = optData[0].pct;
            const secondPct = optData[1].pct;

            const isEmpty = topPct < EMPTY_PCT;
            const isMultiple = topPct >= VALID_PCT && secondPct >= MULTI_SECOND && (topPct / Math.max(secondPct, 1)) < CONF_RATIO;
            const isValid = topPct >= VALID_PCT && !isMultiple;

            detectedAnswers.push({
                qNum,
                detected: isValid ? optData[0].opt : null,
                isError: isMultiple,
                errorType: isMultiple ? 'MULTIPLE_FILL' : (isEmpty ? 'EMPTY' : null),
                options: optData // Now includes X, Y for every bubble
            });
        }

        // ── Return warped image + results
        const imgData = new ImageData(new Uint8ClampedArray(warped.data), warped.cols, warped.rows);
        self.postMessage({
            type: 'scan_result',
            detectedSet: finalSet,
            markerPoints,
            data: {
                isMasterKeyMode,
                selectedSet: finalSet,
                detectedAnswers,
                finalRoll,
                imageData: imgData,
                activeQ
            }
        });

    } catch (err) {
        self.postMessage({ type: 'error', message: err.toString() });
    } finally {
        [src, gray, thresh, blurMat, warped, warpedGray, M, ordered, dstCoords].forEach(m => {
            if (m && !m.isDeleted()) m.delete();
        });
    }
};
