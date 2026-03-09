import React, { forwardRef } from 'react';

// ── CONSTANTS FOR PERFECT AI ALIGNMENT ─────────────────────────
// ALL percentages match exactly with the WebWorker & Python Engine
export const ENGINE = {
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
const TOTAL_Q = 100;
const Q_PER_COL = 25;
const NUM_COLS = 4;

const PremiumOmrSheet = forwardRef(({ answerKey, isAnswerKeyMode = false, copyNum = 1 }, ref) => {
    const dropOutColor = isAnswerKeyMode ? '#cbd5e1' : '#000000';
    const accentColor = '#0f172a'; // Deep slate
    const brandColor = '#b91c1c'; // Brand red

    return (
        <div
            ref={ref}
            className="bg-white print-page relative box-border"
            style={{
                width: '210mm',
                height: '297mm',
                pageBreakAfter: 'always',
                overflow: 'hidden',
                fontFamily: '"Inter", "Arial Narrow", Arial, sans-serif',
                color: accentColor
            }}
        >
            {/* GOOGLE FONTS IMPORT */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');`}</style>

            {/* ── CORNER REGISTRATION MARKS (CV2 alignment targets) ── */}
            {/* Increased offset to 45px (~12mm) for maximum print safety */}
            <div style={{ position: 'absolute', top: 45, left: 45, width: 28, height: 28, background: '#000', borderRadius: 4 }} className="marker" />
            <div style={{ position: 'absolute', top: 45, right: 45, width: 28, height: 28, background: '#000', borderRadius: 4 }} className="marker" />
            <div style={{ position: 'absolute', bottom: 45, left: 45, width: 28, height: 28, background: '#000', borderRadius: 4 }} className="marker" />
            <div style={{ position: 'absolute', bottom: 45, right: 45, width: 28, height: 28, background: '#000', borderRadius: 4 }} className="marker" />

            {/* ── INNER CONTENT BOX (Exactly maps to 0-100% in Edge AI) ── */}
            <div style={{
                position: 'absolute',
                top: 45, left: 45, right: 45, bottom: 45,
                zIndex: 10,
            }}>
                {/* 1. HEADER */}
                <div style={{
                    position: 'absolute', top: '0.5%', left: '5%', right: '5%', height: '6.5%',
                    border: '1.5px solid #e2e8f0', borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px',
                    background: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <img src="/logo.png" alt="Logo" style={{ width: 50, height: 50, objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div style={{ width: 50, height: 50, background: accentColor, borderRadius: 12, display: 'none', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 900 }}>S</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, color: accentColor }}>SOHAG PHYSICS</div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', marginTop: 2, color: '#64748b' }}>ADVANCED LEARNING CENTER</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: accentColor, letterSpacing: '0.05em' }}>UNIVERSAL</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>OMR ANSWER SHEET</div>
                    </div>
                </div>

                {/* 3. ROLL SECTION HEADER */}
                <div style={{
                    position: 'absolute', top: '7.5%',
                    left: `${ENGINE.rollStartX - 1.8}%`,
                    width: `${5 * ENGINE.rollColSpace + 3.6}%`,
                    height: '2.0%',
                    backgroundColor: brandColor,
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', borderRadius: '4px 4px 0 0'
                }}>
                    ROLL NUMBER
                </div>

                {/* Left side thick line */}
                <div style={{
                    position: 'absolute',
                    left: `${ENGINE.rollStartX - 2.8}%`,
                    top: `${ENGINE.rollStartY - 1.2}%`,
                    height: `${9 * ENGINE.rollRowSpace + 2.4}%`,
                    width: '6px',
                    backgroundColor: accentColor,
                }} />

                {/* Left side row digits 0-9 */}
                {Array.from({ length: 10 }).map((_, r) => (
                    <div key={`row-lbl-${r}`} style={{
                        position: 'absolute',
                        left: `${ENGINE.rollStartX - 4.8}%`,
                        top: `${ENGINE.rollStartY + r * ENGINE.rollRowSpace}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: 12,
                        fontWeight: 900,
                        color: accentColor
                    }}>
                        {r}
                    </div>
                ))}

                {/* Roll Bubbles Bounding Box */}
                <div style={{
                    position: 'absolute',
                    left: `${ENGINE.rollStartX - 1.8}%`,
                    top: `${ENGINE.rollStartY - 1.2}%`,
                    width: `${5 * ENGINE.rollColSpace + 3.6}%`,
                    height: `${9 * ENGINE.rollRowSpace + 2.4}%`,
                    border: '1.2px solid #e2e8f0',
                    background: '#fff',
                    zIndex: 0
                }} />

                {/* Roll Columns */}
                {Array.from({ length: 6 }).map((_, c) => (
                    <React.Fragment key={`roll-c-${c}`}>
                        {/* Write box */}
                        <div style={{
                            position: 'absolute',
                            left: `${ENGINE.rollStartX + c * ENGINE.rollColSpace}%`,
                            top: `${ENGINE.rollStartY - 1.8}%`,
                            width: 28, height: 28, border: `2.2px solid ${accentColor}`, borderRadius: 4,
                            transform: 'translate(-50%, -100%)', background: '#fff', zIndex: 1
                        }} />
                        {/* Bubbles 0-9 */}
                        {Array.from({ length: 10 }).map((_, r) => (
                            <div key={`roll-r-${r}`} style={{
                                position: 'absolute',
                                left: `${ENGINE.rollStartX + c * ENGINE.rollColSpace}%`,
                                top: `${ENGINE.rollStartY + r * ENGINE.rollRowSpace}%`,
                                width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${accentColor}`,
                                transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 900, background: '#fff'
                            }}>
                                {r}
                            </div>
                        ))}
                    </React.Fragment>
                ))}

                {/* 4. NAME & INFO BOX */}
                <div style={{
                    position: 'absolute', top: '8.8%', left: '33%', right: '2%', height: '22%',
                    padding: '8px 20px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'transparent',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: accentColor }}>STUDENT NAME:</span>
                        <div style={{ flex: 1, borderBottom: '2px dashed #94a3b8', height: '18px', marginBottom: '2px' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: accentColor }}>CLASS:</span>
                            <div style={{ flex: 1, borderBottom: '2px dashed #94a3b8', height: '20px', marginBottom: '2px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: accentColor }}>BATCH:</span>
                            <div style={{ flex: 1, borderBottom: '2px dashed #94a3b8', height: '20px', marginBottom: '2px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: accentColor }}>SESSION:</span>
                            <div style={{ flex: 1, borderBottom: '2px dashed #94a3b8', height: '20px', marginBottom: '2px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: accentColor }}>DATE:</span>
                            <div style={{ flex: 1, borderBottom: '2px dashed #94a3b8', height: '20px', marginBottom: '2px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{
                                width: '120px', height: '52px',
                                border: `2.5px solid ${brandColor}`, borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#fef2f2'
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 900, color: brandColor, letterSpacing: '0.05em' }}>TOTAL MARKS</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '220px' }}>
                            <div style={{ width: '100%', borderBottom: `2px solid ${accentColor}`, marginBottom: 6 }} />
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invigilator Signature</span>
                        </div>
                    </div>
                </div>

                {/* 8. BUBBLES GRID */}
                {Array.from({ length: 100 }).map((_, i) => {
                    const ci = Math.floor(i / Q_PER_COL);
                    const ri = i % Q_PER_COL;
                    const y = ENGINE.qStartY + ri * ENGINE.qRowSpace + Math.floor(ri / 5) * ENGINE.gapHeight;
                    const qNum = i + 1;
                    const keyAns = answerKey ? answerKey[qNum] : null;
                    const showKey = isAnswerKeyMode && keyAns;
                    const showMarker = ri % 5 === 0;

                    return (
                        <React.Fragment key={`q-${qNum}`}>
                            {showMarker && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${(ENGINE.colBaseX && ENGINE.colBaseX[ci] !== undefined ? ENGINE.colBaseX[ci] : 0) + 0.0}%`,
                                    top: `${y}%`,
                                    width: 12, height: 12, background: '#000', borderRadius: 2,
                                    transform: 'translate(-50%, -50%)', zIndex: 10
                                }} />
                            )}

                            <div style={{
                                position: 'absolute', left: `${(ENGINE.colBaseX && ENGINE.colBaseX[ci] !== undefined ? ENGINE.colBaseX[ci] : 0) + 5.2}%`, top: `${y}%`,
                                transform: 'translate(-100%, -50%)', fontSize: 13, fontWeight: 900, color: accentColor,
                                whiteSpace: 'nowrap'
                            }}>
                                {i + 1}.
                            </div>
                            {OPTION_LABELS.map((lbl, oi) => {
                                const isCorrect = showKey && keyAns === lbl;
                                return (
                                    <div key={lbl} style={{
                                        position: 'absolute',
                                        left: `${(ENGINE.colBaseX && ENGINE.colBaseX[ci] !== undefined ? ENGINE.colBaseX[ci] : 0) + ENGINE.bubbleOffsetX + oi * ENGINE.bubbleSpacingX}%`,
                                        top: `${y}%`,
                                        width: 24, height: 24, borderRadius: '50%',
                                        border: `2px solid ${isCorrect ? brandColor : (isAnswerKeyMode ? '#e2e8f0' : accentColor)}`,
                                        background: isCorrect ? brandColor : '#fff',
                                        color: isCorrect ? '#fff' : (showKey ? 'transparent' : accentColor),
                                        transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 900
                                    }}>
                                        {isCorrect ? '✓' : lbl}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    );
                })}

            </div>
        </div >
    );
});

PremiumOmrSheet.displayName = 'PremiumOmrSheet';
export default PremiumOmrSheet;
