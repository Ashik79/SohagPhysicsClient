import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

// ── CONSTANTS MATCHING ENGINE & JSX ────────────────────────────
const ENGINE = {
    qStartY: 34.5,
    qRowSpace: 2.4,
    gapHeight: 0.6,
    colBaseX: [5, 28.5, 52, 75.5],
    bubbleOffsetX: 8,
    bubbleSpacingX: 3.8,

    rollStartX: 7.0,
    rollStartY: 14.5,
    rollColSpace: 4.8,
    rollRowSpace: 1.82,
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const Q_PER_COL = 25;

const fetchLogo = async () => {
    try {
        const logoPath = '/logo.png';
        const response = await fetch(logoPath);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (e) { return null; }
};

/**
 * Generates the Universal OMR Sheet PDF using jsPDF primitives
 */
export const generateOmrPdf = async (exam = {}, answerKey = {}, isAnswerKeyMode = false) => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;
    const pad = 12; // 45px approx 11.9mm
    const innerW = pageW - 2 * pad;
    const innerH = pageH - 2 * pad;

    const mapX = (pct) => pad + (pct / 100) * innerW;
    const mapY = (pct) => pad + (pct / 100) * innerH;

    const accentColor = [15, 23, 42]; // #0f172a
    const brandColor = [185, 28, 28]; // #b91c1c
    const secondaryColor = [148, 163, 184]; // #94a3b8

    // 1. REGISTRATION MARKERS
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(mapX(0) - 4, mapY(0) - 4, 8, 8, 1, 1, 'F');
    doc.roundedRect(mapX(100) - 4, mapY(0) - 4, 8, 8, 1, 1, 'F');
    doc.roundedRect(mapX(0) - 4, mapY(100) - 4, 8, 8, 1, 1, 'F');
    doc.roundedRect(mapX(100) - 4, mapY(100) - 4, 8, 8, 1, 1, 'F');

    // 2. HEADER
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(mapX(5), mapY(0.5), innerW * 0.9, innerH * 0.065, 3, 3, 'FD');

    const logo = await fetchLogo();
    if (logo) {
        try { doc.addImage(logo, 'PNG', mapX(7), mapY(1.5), 14, 14); } catch (e) { }
    }

    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SOHAG PHYSICS', mapX(15), mapY(4.5));
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ADVANCED LEARNING CENTER', mapX(15), mapY(5.8));

    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(12);
    doc.text('UNIVERSAL OMR', mapX(93), mapY(3.5), { align: 'right' });
    doc.setFontSize(7);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('ANSWER SHEET', mapX(93), mapY(5.0), { align: 'right' });

    // 3. ROLL SECTION
    doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.roundedRect(mapX(ENGINE.rollStartX - 1.8), mapY(7.5), (5 * ENGINE.rollColSpace + 3.6) * innerW / 100, (2.0) * innerH / 100, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('ROLL NUMBER', mapX(ENGINE.rollStartX + 2.5 * ENGINE.rollColSpace), mapY(8.9), { align: 'center' });

    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(1.5);
    doc.line(mapX(ENGINE.rollStartX - 2.8), mapY(ENGINE.rollStartY - 1.2), mapX(ENGINE.rollStartX - 2.8), mapY(ENGINE.rollStartY + 9 * ENGINE.rollRowSpace + 1.2));
    doc.setLineWidth(0.2);

    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    for (let r = 0; r < 10; r++) {
        doc.setFontSize(10);
        doc.text(r.toString(), mapX(ENGINE.rollStartX - 4.8), mapY(ENGINE.rollStartY + r * ENGINE.rollRowSpace + 0.8), { align: 'center' });
    }

    // Roll Bubbles Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.rect(mapX(ENGINE.rollStartX - 1.8), mapY(ENGINE.rollStartY - 1.2), (5 * ENGINE.rollColSpace + 3.6) * innerW / 100, (9 * ENGINE.rollRowSpace + 2.4) * innerH / 100, 'D');

    // Roll Grid Items
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    for (let c = 0; c < 6; c++) {
        doc.rect(mapX(ENGINE.rollStartX + c * ENGINE.rollColSpace - 2.5), mapY(ENGINE.rollStartY - 1.8 - 5.5), 5, 5); // Write box
        for (let r = 0; r < 10; r++) {
            doc.circle(mapX(ENGINE.rollStartX + c * ENGINE.rollColSpace), mapY(ENGINE.rollStartY + r * ENGINE.rollRowSpace), 1.6, 'S');
            doc.setFontSize(6);
            doc.text(r.toString(), mapX(ENGINE.rollStartX + c * ENGINE.rollColSpace), mapY(ENGINE.rollStartY + r * ENGINE.rollRowSpace + 0.6), { align: 'center' });
        }
    }

    // 4. INFO BOX
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT NAME:', mapX(35), mapY(12));
    doc.setLineDash([1, 1]);
    doc.line(mapX(55), mapY(12), mapX(95), mapY(12));

    doc.text('CLASS:', mapX(35), mapY(18));
    doc.line(mapX(45), mapY(18), mapX(60), mapY(18));
    doc.text('BATCH:', mapX(65), mapY(18));
    doc.line(mapX(75), mapY(18), mapX(95), mapY(18));

    doc.text('SESSION:', mapX(35), mapY(24));
    doc.line(mapX(48), mapY(24), mapX(60), mapY(24));
    doc.text('DATE:', mapX(65), mapY(24));
    doc.line(mapX(75), mapY(24), mapX(95), mapY(24));
    doc.setLineDash([]);

    // 5. QUESTIONS GRID
    for (let i = 0; i < 100; i++) {
        const ci = Math.floor(i / Q_PER_COL);
        const ri = i % Q_PER_COL;
        const yPct = ENGINE.qStartY + ri * ENGINE.qRowSpace + Math.floor(ri / 5) * ENGINE.gapHeight;
        const qNum = i + 1;
        const keyAns = answerKey[qNum];
        const showKey = isAnswerKeyMode && keyAns;

        // Row Marker
        if (ri % 5 === 0) {
            doc.setFillColor(0, 0, 0);
            doc.rect(mapX(ENGINE.colBaseX[ci]) - 1.5, mapY(yPct) - 1.5, 3, 3, 'F');
        }

        // Q Number
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${qNum}.`, mapX(ENGINE.colBaseX[ci] + 2.5), mapY(yPct) + 1.1, { align: 'right' });

        // Bubbles
        OPTION_LABELS.forEach((lbl, oi) => {
            const isCorrect = showKey && keyAns === lbl;
            const xPct = ENGINE.colBaseX[ci] + ENGINE.bubbleOffsetX + oi * ENGINE.bubbleSpacingX;

            if (isCorrect) {
                doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
                doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
                doc.circle(mapX(xPct), mapY(yPct), 2.2, 'FD');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text('✓', mapX(xPct), mapY(yPct) + 0.8, { align: 'center' });
            } else {
                doc.setDrawColor(isAnswerKeyMode ? 200 : accentColor[0]);
                doc.circle(mapX(xPct), mapY(yPct), 2.2, 'S');
                doc.setTextColor(isAnswerKeyMode ? 200 : accentColor[0]);
                doc.setFontSize(8);
                if (!showKey) {
                    doc.text(lbl, mapX(xPct), mapY(yPct) + 0.8, { align: 'center' });
                }
            }
        });
    }

    // SAVE FILE
    const fileName = isAnswerKeyMode ? `Answer_Key_${exam?.title?.replace(/\s+/g, '_') || 'Universal'}.pdf` : `OMR_Sheet_Universal.pdf`;
    saveAs(doc.output('blob'), fileName);
};
