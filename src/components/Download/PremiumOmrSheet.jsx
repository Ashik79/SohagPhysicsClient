import React, { forwardRef } from 'react';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

const PremiumOmrSheet = forwardRef(({ config, setLabel = 'A', questionOrder, answerKey, isAnswerKeyMode = false, copyNum = 1 }, ref) => {
    const numOpts = config?.optionsPerQuestion || 4;
    const totalQ = config?.totalQuestions || 75;

    // â”€â”€ Layout constants (percentages over the inner bounding box) â”€â”€
    const questionsPerCol = Math.ceil(totalQ / 3);
    const numCols = 3;

    // Bubble grid starts at 44% from top of inner box, ends ~97%
    const qStartY = 44.5;
    const availH = 52.5; // percent height for question rows
    const qRowSpace = availH / questionsPerCol;
    const gapHeight = 0.6; // extra gap every 5 questions

    const dropOutColor = isAnswerKeyMode ? '#cbd5e1' : '#000000';

    // Bubble X calculation: 3 columns, each column has numOpts bubbles + Q number
    // Inner box width divided into 3 equal cols, each col has fixed pattern
    const colWidth = 97 / numCols; // % of container
    const colBaseX = (colIdx) => 1.5 + colIdx * colWidth;
    const bubbleX = (colIdx, optIdx) => colBaseX(colIdx) + 7 + optIdx * (numOpts === 5 ? 4.6 : 5.5);

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
                border: '2px solid #000',
            }}
        >
            {/* â”€â”€ CORNER REGISTRATION MARKS (CV2 targets) â”€â”€ */}
            {/* Top-left */}
            <div style={{ position: 'absolute', top: 10, left: 10, width: 20, height: 20, background: '#000', zIndex: 20 }} />
            {/* Top-right */}
            <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, background: '#000', zIndex: 20 }} />
            {/* Bottom-left */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, width: 20, height: 20, background: '#000', zIndex: 20 }} />
            {/* Bottom-right */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, background: '#000', zIndex: 20 }} />

            {/* â”€â”€ TIMING TRACKS â”€â”€ */}
            <div style={{ position: 'absolute', top: 38, left: 4, bottom: 38, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={`L${i}`} style={{ width: 10, height: 3, background: '#000' }} />
                ))}
            </div>
            <div style={{ position: 'absolute', top: 38, right: 4, bottom: 38, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={`R${i}`} style={{ width: 10, height: 3, background: '#000' }} />
                ))}
            </div>

            {/* â”€â”€ INNER CONTENT BOX (matches Python bounding box) â”€â”€ */}
            <div style={{
                position: 'absolute',
                top: 34,
                left: 28,
                right: 28,
                bottom: 28,
                zIndex: 10,
            }}>

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    HEADER BANNER
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 62,
                    border: '3.5px solid #000',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}>
                    <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '0.25em', lineHeight: 1, textTransform: 'uppercase', fontFamily: 'Arial Black, Arial, sans-serif' }}>
                        SOHAG PHYSICS
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#222' }}>
                        UNIVERSAL OMR ANSWER SHEET
                    </div>
                </div>

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    INSTRUCTION BAR
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                <div style={{
                    position: 'absolute',
                    top: 66,
                    left: 0,
                    right: 0,
                    height: 20,
                    borderBottom: '3px solid #000',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 7.5,
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    gap: 0,
                }}>
                    FILL ALL REQUIRED DETAILS CAREFULLY
                    <span style={{ margin: '0 10px', fontSize: 11 }}>•</span>
                    DARKEN BUBBLES COMPLETELY
                    <span style={{ margin: '0 10px', fontSize: 11 }}>•</span>
                    USE BLACK BALLPOINT PEN ONLY
                </div>

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    INFO SECTION: ROLL | SET | NAME+BATCH
                    Top: 90px â†’ Bottom: ~220px (height ~130px)
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}

                {/* â”€â”€ ROLL NUMBER BOX â”€â”€ */}
                {config?.showRollBox && (
                    <div style={{
                        position: 'absolute',
                        top: 90,
                        left: 0,
                        width: '35%',
                        height: 158,
                        border: '3px solid #000',
                        background: '#fff',
                        padding: '8px 10px 6px 10px',
                        boxSizing: 'border-box',
                    }}>
                        <div style={{ fontSize: 11.5, fontWeight: 900, textAlign: 'center', letterSpacing: '0.18em', marginBottom: 7, textTransform: 'uppercase' }}>
                            ROLL NUMBER
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: 'calc(100% - 26px)' }}>
                            {Array.from({ length: 6 }).map((_, col) => (
                                <div key={col} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                    {/* Digit write box */}
                                    <div style={{
                                        width: 28,
                                        height: 28,
                                        border: '3px solid #000',
                                        background: '#fff',
                                        marginBottom: 5,
                                        borderRadius: 3,
                                        flexShrink: 0,
                                    }} />
                                    {/* Number bubbles 0–9 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'space-between' }}>
                                        {Array.from({ length: 10 }).map((_, row) => (
                                            <div key={row} style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '50%',
                                                border: '2px solid #000',
                                                background: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 9,
                                                fontWeight: 800,
                                                lineHeight: 1,
                                                flexShrink: 0,
                                            }}>
                                                {row}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* â”€â”€ SET BOX â”€â”€ */}
                <div style={{
                    position: 'absolute',
                    top: 90,
                    left: 'calc(35% + 6px)',
                    width: 70,
                    height: 158,
                    border: '3px solid #000',
                    background: '#fff',
                    padding: '8px 8px 6px 8px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 8, textTransform: 'uppercase' }}>
                        SET
                    </div>
                    {/* Write box */}
                    <div style={{
                        width: 32,
                        height: 32,
                        border: '3px solid #000',
                        background: '#fff',
                        marginBottom: 10,
                        borderRadius: 3,
                    }} />
                    {/* A B C D bubbles */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-start' }}>
                        {['A', 'B', 'C', 'D'].map((lbl) => {
                            const isCorrect = isAnswerKeyMode && setLabel === lbl;
                            return (
                                <div key={lbl} style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    border: `2.5px solid ${isCorrect ? '#000' : '#000'}`,
                                    background: isCorrect ? '#000' : '#fff',
                                    color: isCorrect ? '#fff' : '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 900,
                                    lineHeight: 1,
                                    flexShrink: 0,
                                }}>
                                    {isCorrect ? 'âœ“' : lbl}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* â”€â”€ NAME & BATCH BOX â”€â”€ */}
                {config?.showNameBox && (
                    <div style={{
                        position: 'absolute',
                        top: 90,
                        left: 'calc(35% + 84px)',
                        right: 0,
                        height: 158,
                        border: '3px solid #000',
                        background: '#fff',
                        padding: '10px 14px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                    }}>
                        {/* Name row */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 52 }}>NAME:</span>
                            <div style={{ flex: 1, borderBottom: '2px dotted #000', height: 20 }} />
                        </div>
                        {/* Batch row */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 52 }}>BATCH:</span>
                            <div style={{ flex: 1, borderBottom: '2px dotted #000', height: 20 }} />
                        </div>
                        {/* Date row */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 52 }}>DATE:</span>
                            <div style={{ flex: 1, borderBottom: '2px dotted #000', height: 20 }} />
                        </div>
                        {/* Signature row */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 52 }}>SIGN:</span>
                            <div style={{ flex: 1, borderBottom: '2px dotted #000', height: 20 }} />
                        </div>
                    </div>
                )}

                {/* â”€â”€ SET LABEL BADGE (top-right corner overlay) â”€â”€ */}
                <div style={{
                    position: 'absolute',
                    top: 90,
                    right: 0,
                    width: 38,
                    height: 38,
                    background: isAnswerKeyMode ? '#000' : '#000',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    zIndex: 15,
                    borderLeft: '3px solid #000',
                    borderBottom: '3px solid #000',
                }}>
                    <div style={{ fontSize: 18, lineHeight: 1, fontWeight: 900 }}>{setLabel}</div>
                    <div style={{ fontSize: 6.5, lineHeight: 1.2 }}>SET</div>
                </div>

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    DIVIDER + COLUMN HEADERS before bubble grid
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                <div style={{
                    position: 'absolute',
                    top: 252,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                }}>
                    {/* â”€â”€ Column header labels: Q# + option labels â”€â”€ */}
                    {Array.from({ length: numCols }).map((_, ci) => {
                        const cBase = colBaseX(ci);
                        return (
                            <React.Fragment key={ci}>
                                {/* Q# label */}
                                <div style={{
                                    position: 'absolute',
                                    left: `${cBase}%`,
                                    width: '22px',
                                    textAlign: 'right',
                                    fontSize: 7,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                    color: '#555',
                                }}>No.</div>
                                {/* Option header bubbles */}
                                {Array.from({ length: numOpts }).map((_, oi) => (
                                    <div key={oi} style={{
                                        position: 'absolute',
                                        left: `${bubbleX(ci, oi)}%`,
                                        transform: 'translateX(-50%)',
                                        fontSize: 7.5,
                                        fontWeight: 900,
                                        color: '#444',
                                    }}>
                                        {OPTION_LABELS[oi]}
                                    </div>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Thick separator line before bubble grid */}
                <div style={{
                    position: 'absolute',
                    top: 262,
                    left: 0,
                    right: 0,
                    height: 2.5,
                    background: '#000',
                }} />

                {/* Vertical column dividers */}
                {[1, 2].map(i => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: 264,
                        bottom: 14,
                        left: `${colBaseX(i) - 1.5}%`,
                        width: 1.5,
                        background: '#ccc',
                    }} />
                ))}

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    BUBBLE GRID
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                {Array.from({ length: totalQ }).map((_, i) => {
                    const ci = Math.floor(i / questionsPerCol);
                    const ri = i % questionsPerCol;

                    // Y position within inner box (percentage of inner box height)
                    const innerH = 297 - 34 - 28; // inner box pixel height approx (mm*3.78)
                    const gridStartPx = 266; // px from top of inner box
                    const gridEndPx = (297 - 28 - 34) * (96 / 297) * 3.7796; // rough

                    // Use percentage for Y
                    const gapEvery5 = Math.floor(ri / 5) * gapHeight;
                    const yPct = qStartY + ri * qRowSpace + gapEvery5;

                    const trueQ = questionOrder ? questionOrder[i] + 1 : i + 1;
                    const keyAns = answerKey ? answerKey[trueQ] : null;

                    const cBase = colBaseX(ci);
                    const groupBorder = ri % 5 === 0 && ri > 0;

                    return (
                        <React.Fragment key={i}>
                            {/* Question number */}
                            <div style={{
                                position: 'absolute',
                                left: `${cBase}%`,
                                top: `${yPct}%`,
                                width: '22px',
                                textAlign: 'right',
                                transform: 'translateY(-50%)',
                                fontSize: 9.5,
                                fontWeight: 900,
                                color: '#000',
                                lineHeight: 1,
                            }}>
                                {i + 1}.
                            </div>

                            {/* Option bubbles */}
                            {Array.from({ length: numOpts }).map((_, oi) => {
                                const bx = bubbleX(ci, oi);
                                const label = OPTION_LABELS[oi];
                                const isCorrect = isAnswerKeyMode && keyAns === label;

                                return (
                                    <div key={oi} style={{
                                        position: 'absolute',
                                        left: `${bx}%`,
                                        top: `${yPct}%`,
                                        width: 19,
                                        height: 19,
                                        transform: 'translate(-50%, -50%)',
                                        borderRadius: '50%',
                                        border: `2px solid ${isAnswerKeyMode ? (isCorrect ? '#000' : dropOutColor) : '#000'}`,
                                        background: isAnswerKeyMode && isCorrect ? '#000' : '#fff',
                                        color: isAnswerKeyMode && isCorrect ? '#fff' : (isAnswerKeyMode ? 'transparent' : '#000'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 8.5,
                                        fontWeight: 900,
                                        lineHeight: 1,
                                    }}>
                                        {isAnswerKeyMode && isCorrect ? 'âœ“' : label}
                                    </div>
                                );
                            })}

                            {/* Group separator line every 5 questions */}
                            {groupBorder && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${cBase - 0.5}%`,
                                    right: ci === numCols - 1 ? '0%' : undefined,
                                    width: ci === numCols - 1 ? undefined : `${colWidth}%`,
                                    top: `${yPct - qRowSpace * 0.55}%`,
                                    height: 1,
                                    background: '#bbb',
                                }} />
                            )}
                        </React.Fragment>
                    );
                })}

                {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    FOOTER
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderTop: '3px solid #000',
                    paddingTop: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 7,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#111',
                }}>
                    <span>P-{copyNum} • SET {setLabel}</span>
                    <span>DO NOT WRITE BELOW THIS LINE • OPTICAL MARK RECOGNITION REGION</span>
                    <span>{totalQ} QUESTIONS • {numOpts} OPTIONS</span>
                </div>

            </div>
        </div>
    );
});

PremiumOmrSheet.displayName = 'PremiumOmrSheet';

export default PremiumOmrSheet;
