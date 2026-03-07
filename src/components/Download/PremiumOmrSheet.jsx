import React, { forwardRef } from 'react';

// ── CONSTANTS FOR PERFECT AI ALIGNMENT ─────────────────────────
// ALL percentages match exactly with the WebWorker & Python Engine
export const ENGINE = {
    qStartY: 36.5,
    qRowSpace: 3.05,
    gapHeight: 0.85,

    colBaseX: [2, 35, 68],
    bubbleOffsetX: 8,
    bubbleSpacingX: 5.5,

    rollStartX: 7.2,
    rollStartY: 16.5,
    rollColSpace: 7,
    rollRowSpace: 1.65,

    setStartX: 56,
    setStartY: 16.5,
    setRowSpace: 3.5,
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const TOTAL_Q = 60;
const Q_PER_COL = 20;
const NUM_COLS = 3;

const PremiumOmrSheet = forwardRef(({ setLabel = 'A', answerKey, isAnswerKeyMode = false, copyNum = 1 }, ref) => {
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
            <div style={{ position: 'absolute', top: 20, left: 20, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />
            <div style={{ position: 'absolute', top: 20, right: 20, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />
            <div style={{ position: 'absolute', bottom: 20, left: 20, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />
            <div style={{ position: 'absolute', bottom: 20, right: 20, width: 24, height: 24, background: '#000', borderRadius: 2 }} className="marker" />

            {/* ── INNER CONTENT BOX (Exactly maps to 0-100% in Edge AI) ── */}
            <div style={{
                position: 'absolute',
                top: 32, left: 32, right: 32, bottom: 32,
                zIndex: 10,
            }}>
                {/* 1. HEADER */}
                <div style={{
                    position: 'absolute', top: '0%', left: '2%', right: '2%', height: '5.5%',
                    border: '3px solid #000', borderRadius: 8,
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

                {/* 2. INSTRUCTIONS & GUIDELINES */}
                <div style={{
                    position: 'absolute', top: '6.5%', left: '2%', right: '2%', height: '3.5%',
                    display: 'flex', border: '2px solid #e2e8f0', borderRadius: 8, overflow: 'hidden'
                }}>
                    <div style={{ flex: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', px: 15, fontSize: 10, fontWeight: 800, paddingLeft: 15 }}>
                        FILL INSTRUCTIONS:
                    </div>
                    <div style={{ flex: 4, display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 15 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#000' }} />
                            <span style={{ fontSize: 10, fontWeight: 800 }}>CORRECT</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid #000', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: 2, background: '#000', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 800 }}>WRONG</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 800 }}>WRONG</span>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', fontStyle: 'italic' }}>* Use black ballpoint pen only. Do not fold or smudge the sheet.</span>
                    </div>
                </div>

                {/* 5. QUESTION GRID (34.2% - 99.7%) */}
                <div style={{
                    position: 'absolute', top: '34.2%', left: '1.8%', right: '1.8%', height: '65.5%',
                    border: '2px solid #000', borderRadius: 12, background: '#fff'
                }}>
                </div>

                {/* 6. TIMING TRACKS (AI LINE ALIGNMENT) */}
                {/* Right Side Tracks */}
                <div style={{ position: 'absolute', top: '1.5%', right: '-3%', height: '97%', width: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {Array.from({ length: 45 }).map((_, i) => (
                        <div key={`track-right-${i}`} style={{ width: 8, height: 8, background: '#000' }} />
                    ))}
                </div>
                {/* Left Side Tracks */}
                <div style={{ position: 'absolute', top: '1.5%', left: '-3%', height: '97%', width: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {Array.from({ length: 45 }).map((_, i) => (
                        <div key={`track-left-${i}`} style={{ width: 8, height: 8, background: '#000' }} />
                    ))}
                </div>

                {Array.from({ length: NUM_COLS }).map((_, ci) => (
                    <React.Fragment key={`col-${ci}`}>
                        {/* Section Divider Lines */}
                        {ci < NUM_COLS - 1 && (
                            <div style={{
                                position: 'absolute', top: '35%', bottom: '0.3%',
                                left: `${ENGINE.colBaseX[ci] + 32}%`,
                                borderLeft: '1px dashed #cbd5e1'
                            }} />
                        )}
                    </React.Fragment>
                ))}

                {/* 3. ROLL BOX */}
                <div style={{
                    position: 'absolute', top: '10.5%', left: '2%', width: '45%', height: '22.5%',
                    border: '3px solid #000', borderRadius: 8, background: '#fff'
                }}>
                    <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 900, marginTop: 4, letterSpacing: '0.1em', color: '#000' }}>ROLL NUMBER</div>
                </div>

                {/* Drawn independently, absolute positioned based on ENGINE */}
                {Array.from({ length: 6 }).map((_, c) => (
                    <React.Fragment key={`roll-c-${c}`}>
                        {/* Write box */}
                        <div style={{
                            position: 'absolute',
                            left: `${ENGINE.rollStartX + c * ENGINE.rollColSpace}%`,
                            top: `${ENGINE.rollStartY - 1.4}%`,
                            width: 28, height: 28, border: '2px solid #000', borderRadius: 3,
                            transform: 'translate(-50%, -100%)', background: '#fff'
                        }} />
                        {/* Bubbles 0-9 */}
                        {Array.from({ length: 10 }).map((_, r) => (
                            <div key={`roll-r-${r}`} style={{
                                position: 'absolute',
                                left: `${ENGINE.rollStartX + c * ENGINE.rollColSpace}%`,
                                top: `${ENGINE.rollStartY + r * ENGINE.rollRowSpace}%`,
                                width: 20, height: 20, borderRadius: '50%', border: '2px solid #000',
                                transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 900, background: '#fff'
                            }}>
                                {r}
                            </div>
                        ))}
                    </React.Fragment>
                ))}


                {/* 4. NAME & INFO BOX */}
                <div style={{
                    position: 'absolute', top: '10.5%', left: '50%', right: '2%', height: '22.5%',
                    border: '3px solid #000', borderRadius: 8, padding: '10px 14px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-around', background: '#fff'
                }}>
                    {['NAME', 'BATCH', 'DATE'].map(lbl => (
                        <div key={lbl} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', width: '45px' }}>{lbl}:</span>
                            <div style={{ flex: 1, borderBottom: '2px dashed #000' }} />
                        </div>
                    ))}
                </div>

                {/* 6. GRID HEADERS REMOVED AS REQUESTED */}

                {/* 7. COLUMNS & QUESTIONS DIVIDERS */}
                {[1, 2].map(i => (
                    <div key={`col-${i}`} style={{
                        position: 'absolute', top: '34.5%', bottom: '0.3%',
                        left: `${ENGINE.colBaseX[i] - 1.5}%`, width: 1.5, background: '#000'
                    }} />
                ))}

                {/* 8. BUBBLES GRID */}
                {Array.from({ length: TOTAL_Q }).map((_, i) => {
                    const ci = Math.floor(i / Q_PER_COL);
                    const ri = i % Q_PER_COL;
                    const y = ENGINE.qStartY + ri * ENGINE.qRowSpace + Math.floor(ri / 5) * ENGINE.gapHeight;
                    const qNum = i + 1;
                    const keyAns = answerKey ? answerKey[qNum] : null;

                    return (
                        <React.Fragment key={`q-${qNum}`}>
                            {/* Question Number */}
                            <div style={{
                                position: 'absolute', left: `${ENGINE.colBaseX[ci] + 4}%`, top: `${y}%`,
                                transform: 'translate(-100%, -50%)', fontSize: 13, fontWeight: 900, letterSpacing: '-0.05em'
                            }}>
                                {qNum}.
                            </div>
                            {/* Options */}
                            {OPTION_LABELS.map((lbl, oi) => {
                                const isCorrect = isAnswerKeyMode && keyAns === lbl;
                                return (
                                    <div key={lbl} style={{
                                        position: 'absolute',
                                        left: `${ENGINE.colBaseX[ci] + ENGINE.bubbleOffsetX + oi * ENGINE.bubbleSpacingX}%`,
                                        top: `${y}%`,
                                        width: 22, height: 22, borderRadius: '50%',
                                        border: `2px solid ${isCorrect ? '#000' : dropOutColor}`,
                                        background: isCorrect ? '#000' : '#fff',
                                        color: isCorrect ? '#fff' : (isAnswerKeyMode ? 'transparent' : '#000'),
                                        transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 900
                                    }}>
                                        {isCorrect ? '✓' : lbl}
                                    </div>
                                );
                            })}

                            {/* Horizontal Group Line every 5 rows */}
                            {ri % 5 === 0 && ri > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${ENGINE.colBaseX[ci]}%`, width: '31%',
                                    top: `${y - (ENGINE.qRowSpace * 0.55)}%`, height: 1, background: '#bbb'
                                }} />
                            )}
                        </React.Fragment>
                    );
                })}

                {/* 9. FOOTER REMOVED AS REQUESTED */}

            </div>
        </div>
    );
});

PremiumOmrSheet.displayName = 'PremiumOmrSheet';
export default PremiumOmrSheet;
