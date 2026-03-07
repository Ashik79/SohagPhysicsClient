self.importScripts('https://docs.opencv.org/4.5.4/opencv.js');
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

cv['onRuntimeInitialized'] = () => {
    self.postMessage({ type: 'ready' });
};

self.onmessage = function (e) {
    if (!cv || !cv.Mat) {
        self.postMessage({ type: 'error', message: 'OpenCV not loaded' });
        return;
    }

    const { imageData, width, height, numQ, numOpts, isMasterKeyMode, selectedSet } = e.data;

    let src = cv.matFromImageData(imageData);
    let gray = new cv.Mat();
    let thresh = new cv.Mat();
    let warped = new cv.Mat();
    let warpedGray = new cv.Mat();
    let M = null;

    try {
        // 1. Preprocessing with CLAHE (Contrast Limited Adaptive Histogram Equalization)
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Apply CLAHE for Shadow Removal & Lighting Normalization
        let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
        clahe.apply(gray, gray);
        clahe.delete();

        cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
        cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

        // 2. Deskewing & Perspective Transform (Find the 4 corner anchors)
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let markers = [];
        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            if (area > 100 && area < 10000) {
                let approx = new cv.Mat();
                let peri = cv.arcLength(cnt, true);
                cv.approxPolyDP(cnt, approx, 0.04 * peri, true);

                if (approx.rows === 4) {
                    let rect = cv.boundingRect(approx);
                    let aspectRatio = rect.width / rect.height;
                    if (aspectRatio >= 0.7 && aspectRatio <= 1.3) {
                        markers.push({ cnt: cnt.clone(), area: area });
                    }
                }
                approx.delete();
            }
        }

        let ordered;
        if (markers.length >= 4) {
            let points = markers.map(m => {
                let M_moments = cv.moments(m.cnt);
                let cx = M_moments.m10 / M_moments.m00;
                let cy = M_moments.m01 / M_moments.m00;
                return { x: cx, y: cy };
            });

            points.sort((a, b) => a.y - b.y);
            let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
            let bottom = points.slice(-2).sort((a, b) => a.x - b.x);

            ordered = cv.matFromArray(4, 1, cv.CV_32FC2, [top[0].x, top[0].y, top[1].x, top[1].y, bottom[0].x, bottom[0].y, bottom[1].x, bottom[1].y]);
        } else {
            console.warn("Could not find EXACTLY 4 registration marks! Falling back to page boundaries.");
            let sheetContour = null;
            let maxArea = 0;
            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let area = cv.contourArea(cnt);
                if (area > 50000) {
                    let approx = new cv.Mat();
                    let peri = cv.arcLength(cnt, true);
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
                    if (approx.rows === 4 && area > maxArea) {
                        if (sheetContour) sheetContour.delete();
                        sheetContour = approx.clone();
                        maxArea = area;
                    }
                    approx.delete();
                }
            }

            if (!sheetContour) throw new Error("Could not find OMR Sheet boundaries.");

            let pts = [];
            for (let i = 0; i < 4; i++) pts.push({ x: sheetContour.data32S[i * 2], y: sheetContour.data32S[i * 2 + 1] });
            pts.sort((a, b) => a.y - b.y);
            let top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
            let bot = pts.slice(2).sort((a, b) => b.x - a.x);
            ordered = cv.matFromArray(4, 1, cv.CV_32FC2, [top[0].x, top[0].y, top[1].x, top[1].y, bot[0].x, bot[0].y, bot[1].x, bot[1].y]);
            sheetContour.delete();
        }

        let dsize = new cv.Size(800, 1000);
        let dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 800, 0, 0, 1000, 800, 1000]);
        // Note: SET extraction needs to happen AFTER thresholding which is down below.

        // 3. Bubble Detection & ICR Verification
        cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY);

        // Use CLAHE on the warped image as well to ensure perfect bubbles
        let claheWarped = new cv.CLAHE(3.0, new cv.Size(8, 8));
        claheWarped.apply(warpedGray, warpedGray);
        claheWarped.delete();

        cv.GaussianBlur(warpedGray, warpedGray, new cv.Size(3, 3), 0);
        cv.adaptiveThreshold(warpedGray, warpedGray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 5);

        // EXTRACTION: Detect SET CODE from exactly mapped percentage coordinates
        let detectedSet = null;
        const setLabels = ['A', 'B', 'C', 'D'];
        let maxSetPixels = 0;
        // From React UI: Left = 36% + 4% = 40%. Top = 18% + 25.9% offset. Row Space = 3.675%
        const setStartX = 0.40;
        const setStartY = 0.259;
        const setRowSpace = 0.03675;

        for (let row = 0; row < 4; row++) {
            const bx = Math.round(800 * setStartX);
            const by = Math.round(1000 * (setStartY + row * setRowSpace));
            if (bx - 8 >= 0 && by - 8 >= 0 && bx + 8 <= 800 && by + 8 <= 1000) {
                let roi = warpedGray.roi(new cv.Rect(bx - 8, by - 8, 16, 16));
                let pixels = cv.countNonZero(roi);
                if (pixels > maxSetPixels && pixels > 40) {
                    maxSetPixels = pixels;
                    detectedSet = setLabels[row];
                }
                roi.delete();
            }
        }

        let detectedAnswers = [];
        let warpedWidth = 800;
        let warpedHeight = 1000;

        for (let i = 0; i < numQ; i++) {
            // UPDATED 75-MCQ GEOMETRY (3 COLUMNS) - BIG BUBBLE MODE
            const numCols = 3;
            const questionsPerCol = 25;
            const col = Math.floor(i / questionsPerCol);
            const rowInCol = i % questionsPerCol;

            const qStartY = 0.46;
            const qRowSpace = 0.0195;
            const gapHeight = 0.012;
            const colBaseX = 0.02 + col * (0.94 / numCols);

            const baseY = Math.round(warpedHeight * (qStartY + rowInCol * qRowSpace + Math.floor(rowInCol / 5) * gapHeight));

            let optionsData = [];
            for (let j = 0; j < numOpts; j++) {
                const bx = Math.round(warpedWidth * (colBaseX + 0.08 + j * 0.052));
                const by = baseY;

                if (bx - 10 >= 0 && by - 10 >= 0 && bx + 10 <= warpedWidth && by + 10 <= warpedHeight) {
                    let roi = warpedGray.roi(new cv.Rect(bx - 10, by - 10, 20, 20));
                    let totalPixels = cv.countNonZero(roi);
                    optionsData.push({ opt: OPTION_LABELS[j], pixels: totalPixels });
                    roi.delete();
                } else {
                    optionsData.push({ opt: OPTION_LABELS[j], pixels: 0 });
                }
            }

            optionsData.sort((a, b) => b.pixels - a.pixels);
            const highest = optionsData[0].pixels;
            const secondHighest = optionsData[1].pixels;

            const isMultiFill = highest > 75 && (secondHighest > 50 && (highest / (secondHighest || 1) < 1.4));
            const isEmpty = highest < 60;

            const detected = (highest >= 60 && !isMultiFill) ? optionsData[0].opt : null;

            detectedAnswers.push({
                qNum: i + 1,
                detected,
                isError: isMultiFill || isEmpty,
                errorType: isMultiFill ? 'MULTIPLE_FILL' : (isEmpty ? 'EMPTY' : null)
            });
        }

        let finalRoll = "";
        const rollStartX = 0.12;
        const rollStartY = 0.18;
        const rollColSpace = 0.04;
        const rollRowSpace = 0.022;

        for (let col = 0; col < 6; col++) {
            let bestDigit = null;
            let maxD = 0;
            let secondMaxD = 0;

            for (let row = 0; row < 10; row++) {
                const bx = Math.round(warpedWidth * (rollStartX + col * rollColSpace));
                const by = Math.round(warpedHeight * (rollStartY + row * rollRowSpace));

                if (bx - 6 >= 0 && by - 6 >= 0 && bx + 6 <= warpedWidth && by + 6 <= warpedHeight) {
                    let roiRoll = warpedGray.roi(new cv.Rect(bx - 6, by - 6, 12, 12));
                    let d = cv.countNonZero(roiRoll);

                    if (d > maxD) {
                        secondMaxD = maxD;
                        maxD = d;
                        bestDigit = row;
                    } else if (d > secondMaxD) {
                        secondMaxD = d;
                    }

                    roiRoll.delete();
                }
            }

            if (maxD < 40 || (maxD > 40 && secondMaxD > 30 && maxD / (secondMaxD || 1) < 1.3)) {
                finalRoll += "?";
            } else {
                finalRoll += bestDigit !== null ? bestDigit : "?";
            }
        }

        // Return the warped image data so we can display it if we want
        // But converting cv.Mat back to canvas imageData is done via converting to Unit8ClampedArray
        let imgData = new ImageData(new Uint8ClampedArray(warped.data), warped.cols, warped.rows);

        // Send everything back
        self.postMessage({
            type: 'scan_result',
            qrPayload: null, // Legacy flag
            detectedSet: detectedSet, // The student-bubbled set
            data: {
                isMasterKeyMode,
                selectedSet: detectedSet || selectedSet, // Prefer detected over whatever UI says
                detectedAnswers,
                finalRoll,
                imageData: imgData
            }
        });

        // Cleanup
        contours.delete(); hierarchy.delete(); ordered.delete(); dstCoords.delete();
        markers.forEach(m => m.cnt.delete());
    } catch (error) {
        self.postMessage({ type: 'error', message: error.toString() });
    } finally {
        if (src && !src.isDeleted()) src.delete();
        if (gray && !gray.isDeleted()) gray.delete();
        if (thresh && !thresh.isDeleted()) thresh.delete();
        if (warped && !warped.isDeleted()) warped.delete();
        if (warpedGray && !warpedGray.isDeleted()) warpedGray.delete();
        if (M && !M.isDeleted()) M.delete();
    }
};
