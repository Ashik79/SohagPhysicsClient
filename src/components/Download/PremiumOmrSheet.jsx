import React, { forwardRef } from 'react';

// ── CONSTANTS FOR PERFECT AI ALIGNMENT ─────────────────────────
// ALL percentages match exactly with the WebWorker & Python Engine
export const ENGINE = {
    qStartY: 33,
    qRowSpace: 2.55,
    gapHeight: 0.7,

    colBaseX: [5, 28.5, 52, 75.5],
    bubbleOffsetX: 8,
    bubbleSpacingX: 3.8,

    rollStartX: 7.0,
    rollStartY: 13.5,
    rollColSpace: 4.8,
    rollRowSpace: 1.82,
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const TOTAL_Q = 100;
const Q_PER_COL = 25;
const NUM_COLS = 4;

const PremiumOmrSheet = forwardRef(({ answerKey, isAnswerKeyMode = false, copyNum = 1 }, ref) => {
    const dropOutColor = isAnswerKeyMode ? '#cbd5e1' : '#000000';

    return (
        <div
            ref={ref}
            className="bg-white print-page relative box-border"
            style={{
                width: '210mm',
                height: '297mm',
                pageBreakAfter: 'always',
                overflow: 'hidden',
                fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
            }}
        >
            {/* ── CORNER REGISTRATION MARKS (CV2 alignment targets) ── */}
            {/* These define the EXACT bounds of the warped rectangle (Inner Content Box) */}
            <div style={{ position: 'absolute', top: 32, left: 32, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />
            <div style={{ position: 'absolute', top: 32, right: 32, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />
            <div style={{ position: 'absolute', bottom: 32, left: 32, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />
            <div style={{ position: 'absolute', bottom: 32, right: 32, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />

            {/* ── INNER CONTENT BOX (Exactly maps to 0-100% in Edge AI) ── */}
            <div style={{
                position: 'absolute',
                top: 32, left: 32, right: 32, bottom: 32,
                zIndex: 10,
            }}>
                {/* 1. HEADER */}
                <div style={{
                    position: 'absolute', top: '0.8%', left: '5%', right: '5%', height: '5.5%',
                    border: '2px solid #000', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
                    background: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        {/* Logo Placeholder */}
                        <div style={{ width: 45, height: 45, background: '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 900 }}>S</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1, color: '#000' }}>SOHAG PHYSICS</div>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', marginTop: 2, color: '#64748b' }}>ADVANCED LEARNING CENTER</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#000' }}>UNIVERSAL</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em' }}>OMR ANSWER SHEET</div>
                    </div>
                </div>


                {/* 5. QUESTION GRID BOUNDARY (HANDLED BELOW) */}


                {/* 6. TIMING TRACKS REMOVED */}

                {/* V-Dividers Removed for border-less look */}

                {/* 3. ROLL SECTION HEADER (Red Box) */}
                <div style={{
                    position: 'absolute', top: '7.5%',
                    left: `${ENGINE.rollStartX - 1.8}%`,
                    width: `${5 * ENGINE.rollColSpace + 3.6}%`,
                    height: '2.5%',
                    backgroundColor: '#b91c1c', // dark red
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, letterSpacing: '0.1em'
                }}>
                    ROLL NUMBER
                </div>

                {/* Left side thick line */}
                <div style={{
                    position: 'absolute',
                    left: `${ENGINE.rollStartX - 2.8}%`,
                    top: `${ENGINE.rollStartY - 1}%`,
                    height: `${9 * ENGINE.rollRowSpace + 2}%`,
                    width: '4.5px',
                    backgroundColor: '#000',
                }} />

                {/* Left side row digits 0-9 */}
                {Array.from({ length: 10 }).map((_, r) => (
                    <div key={`row-lbl-${r}`} style={{
                        position: 'absolute',
                        left: `${ENGINE.rollStartX - 4.2}%`,
                        top: `${ENGINE.rollStartY + r * ENGINE.rollRowSpace}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: 10,
                        fontWeight: 900,
                        color: '#000'
                    }}>
                        {r}
                    </div>
                ))}

                {/* Roll Bubbles Bounding Box (Greenish) */}
                <div style={{
                    position: 'absolute',
                    left: `${ENGINE.rollStartX - 1.8}%`,
                    top: `${ENGINE.rollStartY - 1}%`,
                    width: `${5 * ENGINE.rollColSpace + 3.6}%`,
                    height: `${9 * ENGINE.rollRowSpace + 2}%`,
                    border: '1.2px solid #10b981', // emerald green
                    zIndex: 0
                }} />



                {/* Drawn independently, absolute positioned based on ENGINE */}
                {Array.from({ length: 6 }).map((_, c) => (
                    <React.Fragment key={`roll-c-${c}`}>
                        {/* Write box */}
                        <div style={{
                            position: 'absolute',
                            left: `${ENGINE.rollStartX + c * ENGINE.rollColSpace}%`,
                            top: `${ENGINE.rollStartY - 1.2}%`,
                            width: 26, height: 26, border: '1.5px solid #000', borderRadius: 2,
                            transform: 'translate(-50%, -100%)', background: '#fff', zIndex: 1
                        }} />
                        {/* Bubbles 0-9 */}
                        {Array.from({ length: 10 }).map((_, r) => (
                            <div key={`roll-r-${r}`} style={{
                                position: 'absolute',
                                left: `${ENGINE.rollStartX + c * ENGINE.rollColSpace}%`,
                                top: `${ENGINE.rollStartY + r * ENGINE.rollRowSpace}%`,
                                width: 16.5, height: 16.5, borderRadius: '50%', border: '1.5px solid #000',
                                transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9.5, fontWeight: 900, background: '#fff'
                            }}>
                                {r}
                            </div>
                        ))}
                    </React.Fragment>
                ))}

                {/* 4. NAME & INFO BOX (Borderless) */}
                <div style={{
                    position: 'absolute', top: '7%', left: '33%', right: '2%', height: '24%',
                    padding: '15px 25px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'transparent',
                    fontFamily: 'Arial, Helvetica, sans-serif'
                }}>
                    {/* Top Section: Name */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 900, color: '#000' }}>Name:</span>
                        <div style={{ flex: 1, borderBottom: '3.5px dotted #000', height: '18px', marginBottom: '3px' }} />
                    </div>

                    {/* Middle Section: Class & Batch */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 900, color: '#000' }}>Class:</span>
                            <div style={{ flex: 1, borderBottom: '3.5px dotted #000', height: '18px', marginBottom: '3px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 900, color: '#000' }}>Batch:</span>
                            <div style={{ flex: 1, borderBottom: '3.5px dotted #000', height: '18px', marginBottom: '3px' }} />
                        </div>
                    </div>

                    {/* Middle Section: Session & Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 900, color: '#000' }}>Session:</span>
                            <div style={{ flex: 1, borderBottom: '3.5px dotted #000', height: '18px', marginBottom: '3px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 900, color: '#000' }}>Date:</span>
                            <div style={{ flex: 1, borderBottom: '3.5px dotted #000', height: '18px', marginBottom: '3px' }} />
                        </div>
                    </div>

                    {/* Bottom Section: Obtained Mark + Signature */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, padding: '0 5px' }}>
                        {/* Obtained Mark Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: '105px', height: '48px',
                                border: '2px solid #b91c1c', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} />
                            <span style={{ fontSize: 14, fontWeight: 900, color: '#000', letterSpacing: '0.02em' }}>OBTAINED MARK</span>
                        </div>

                        {/* Signature Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '190px', marginBottom: 2 }}>
                            <div style={{ width: '100%', borderBottom: '1.5px solid #b91c1c', marginBottom: 5 }} />
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#003366', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invigilator's Signature</span>
                        </div>
                    </div>
                </div>

                {/* 6. GRID HEADERS REMOVED AS REQUESTED */}

                {/* Horizontal Group Line (Full Width) - Removed for border-less feel */}

                {/* 8. BUBBLES GRID */}
                {Array.from({ length: 100 }).map((_, i) => {
                    const ci = Math.floor(i / Q_PER_COL);
                    const ri = i % Q_PER_COL;
                    const y = ENGINE.qStartY + ri * ENGINE.qRowSpace + Math.floor(ri / 5) * ENGINE.gapHeight;
                    const qNum = i + 1;
                    const keyAns = answerKey ? answerKey[qNum] : null;

                    // Always show 100 questions, but only mark colors if in Answer Key Mode and key exists
                    const showKey = isAnswerKeyMode && keyAns;

                    // Marker logic: Every 5 questions (1, 6, 11, 16, 21 in each column)
                    const showMarker = ri % 5 === 0;

                    return (
                        <React.Fragment key={`q-${qNum}`}>
                            {/* AI ALIGNMENT MARKERS (LEFT OF BUBBLES) */}
                            {showMarker && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${ENGINE.colBaseX[ci] + 0.2}%`,
                                    top: `${y}%`,
                                    width: 10, height: 10, background: '#000', borderRadius: 1.5,
                                    transform: 'translate(-50%, -50%)', zIndex: 10
                                }} />
                            )}

                            {/* Question Number */}
                            <div style={{
                                position: 'absolute', left: `${ENGINE.colBaseX[ci] + 4}%`, top: `${y}%`,
                                transform: 'translate(-100%, -50%)', fontSize: 13, fontWeight: 900, letterSpacing: '-0.05em'
                            }}>
                                {qNum}.
                            </div>
                            {/* Options */}
                            {OPTION_LABELS.map((lbl, oi) => {
                                const isCorrect = showKey && keyAns === lbl;
                                return (
                                    <div key={lbl} style={{
                                        position: 'absolute',
                                        left: `${ENGINE.colBaseX[ci] + ENGINE.bubbleOffsetX + oi * ENGINE.bubbleSpacingX}%`,
                                        top: `${y}%`,
                                        width: 22, height: 22, borderRadius: '50%',
                                        border: `2px solid ${isCorrect ? '#000' : dropOutColor}`,
                                        background: isCorrect ? '#000' : '#fff',
                                        color: isCorrect ? '#fff' : (showKey ? 'transparent' : '#000'),
                                        transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 900
                                    }}>
                                        {isCorrect ? '✓' : lbl}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    );
                })}

                {/* 9. FOOTER REMOVED AS REQUESTED */}

            </div>
        </div >
    );
});

PremiumOmrSheet.displayName = 'PremiumOmrSheet';
export default PremiumOmrSheet;
