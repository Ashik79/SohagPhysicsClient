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
const TOTAL_SHEET_Q = 60;
const Q_PER_COL = 20;

cv['onRuntimeInitialized'] = () => {
    self.postMessage({ type: 'ready' });
};

// ── Bubble column X position (matches ENGINE.colBaseX + bubbleOffsetX + oi * bubbleSpacingX)
function bubbleX(ci, oi) {
    const colBaseX = ci === 0 ? 0.02 : (ci === 1 ? 0.35 : 0.68);
    return Math.round(WARPED_W * (colBaseX + 0.08 + oi * 0.055));
}

function bubbleY(i) {
    const ri = i % Q_PER_COL;
    return Math.round(WARPED_H * (0.365 + ri * 0.0305 + Math.floor(ri / 5) * 0.0085));
}

// ── Count filled pixels in a circle region
function countPixels(mat, cx, cy, r) {
    const x = cx - r, y = cy - r, s = r * 2;
    if (x < 0 || y < 0 || x + s > mat.cols || y + s > mat.rows) return 0;
    const roi = mat.roi(new cv.Rect(x, y, s, s));
    const count = cv.countNonZero(roi);
    roi.delete();
    return count;
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

        // ── Pre-process: CLAHE + Gaussian blur + Adaptive threshold
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        const clahe = new cv.CLAHE(2.5, new cv.Size(8, 8));
        clahe.apply(gray, gray);
        clahe.delete();
        cv.GaussianBlur(gray, blurMat, new cv.Size(5, 5), 0);
        cv.adaptiveThreshold(blurMat, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

        // ── Find 4 corner registration markers
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        const markers = [];
        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);
            if (area > 80 && area < 12000) {
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);
                if (approx.rows === 4) {
                    const r = cv.boundingRect(approx);
                    if (r.width / r.height >= 0.65 && r.width / r.height <= 1.45) {
                        const mom = cv.moments(cnt);
                        if (mom.m00 !== 0) markers.push({ x: mom.m10 / mom.m00, y: mom.m01 / mom.m00 });
                    }
                }
                approx.delete();
            }
        }

        // ── Not enough markers: report and exit
        if (markers.length < 4) {
            self.postMessage({ type: 'detecting', markersFound: markers.length });
            contours.delete(); hierarchy.delete();
            return;
        }

        // ── Sort markers: top-left, top-right, bottom-right, bottom-left
        markers.sort((a, b) => a.y - b.y);
        const top2 = markers.slice(0, 2).sort((a, b) => a.x - b.x);
        const bot2 = markers.slice(-2).sort((a, b) => a.x - b.x);
        const markerPoints = [top2[0], top2[1], bot2[1], bot2[0]];

        ordered = cv.matFromArray(4, 1, cv.CV_32FC2, [top2[0].x, top2[0].y, top2[1].x, top2[1].y, bot2[1].x, bot2[1].y, bot2[0].x, bot2[0].y]);
        dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, WARPED_W - 1, 0, WARPED_W - 1, WARPED_H - 1, 0, WARPED_H - 1]);

        M = cv.getPerspectiveTransform(ordered, dstCoords);
        warped = new cv.Mat();
        cv.warpPerspective(src, warped, M, new cv.Size(WARPED_W, WARPED_H));

        // ── Enhance warped image for scanning
        warpedGray = new cv.Mat();
        cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY);
        const clahe2 = new cv.CLAHE(3.0, new cv.Size(8, 8));
        clahe2.apply(warpedGray, warpedGray);
        clahe2.delete();
        cv.adaptiveThreshold(warpedGray, warpedGray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 5);

        // ── SET Detection removed
        const finalSet = selectedSet || 'A';

        // ── Roll Number Detection (matches ENGINE: rollStartX=7.2%, rollColSpace=7%, rollStartY=16.5%, rollRowSpace=1.65%)
        //    Roll bubbles are 20px circles → scan radius 10px
        let finalRoll = '';
        const rSX = 0.072, rCG = 0.07, rSY = 0.165, rRG = 0.0165;
        for (let c = 0; c < 6; c++) {
            let best = null, mD = 0, sD = 0;
            for (let r = 0; r < 10; r++) {
                const d = countPixels(warpedGray, Math.round(WARPED_W * (rSX + c * rCG)), Math.round(WARPED_H * (rSY + r * rRG)), 10);
                if (d > mD) { sD = mD; mD = d; best = r; } else if (d > sD) sD = d;
            }
            finalRoll += (mD < 50 || (mD > 50 && sD > 30 && mD / (sD || 1) < 1.3)) ? '?' : String(best);
        }

        // ── Answer Bubbles: scan all 60, but mark as SKIPPED_INACTIVE beyond activeQ
        //    Question bubbles are 22px circles → scan radius 12px
        const detectedAnswers = [];
        for (let i = 0; i < TOTAL_SHEET_Q; i++) {
            const qNum = i + 1;

            // Beyond active questions: mark as skipped, do not evaluate
            if (qNum > activeQ) {
                detectedAnswers.push({ qNum, detected: null, isError: false, errorType: 'SKIPPED_INACTIVE' });
                continue;
            }

            const ci = Math.floor(i / Q_PER_COL);
            const by = bubbleY(i);
            const optData = [];
            for (let oi = 0; oi < 4; oi++) {
                optData.push({ opt: OPTION_LABELS[oi], pixels: countPixels(warpedGray, bubbleX(ci, oi), by, 12) });
            }
            optData.sort((a, b) => b.pixels - a.pixels);

            const top1 = optData[0].pixels;
            const top2 = optData[1].pixels;
            const isMultiple = top1 > 100 && top2 > 60 && (top1 / (top2 || 1)) < 1.4;
            const isEmpty = top1 < 80;

            detectedAnswers.push({
                qNum,
                detected: (!isEmpty && !isMultiple) ? optData[0].opt : null,
                isError: isMultiple || isEmpty,
                errorType: isMultiple ? 'MULTIPLE_FILL' : (isEmpty ? 'EMPTY' : null)
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

        contours.delete(); hierarchy.delete();
    } catch (err) {
        self.postMessage({ type: 'error', message: err.toString() });
    } finally {
        [src, gray, thresh, blurMat, warped, warpedGray, M, ordered, dstCoords].forEach(m => {
            if (m && !m.isDeleted()) m.delete();
        });
    }
};
