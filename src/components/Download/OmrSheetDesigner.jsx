import React, { useState, useRef } from 'react';
import { MdPrint, MdKey, MdAutoAwesome, MdClose, MdInfo } from 'react-icons/md';
import { useReactToPrint } from 'react-to-print';
import PremiumOmrSheet from './PremiumOmrSheet';

// ── Universal OMR Sheet Designer ──────────────────────────────────────
//  The OMR sheet is ALWAYS 75 questions (fixed and universal).
//  "Active Questions" tells the scanner how many bubbles to evaluate.
//  One exam = one SET. The printed sheet never changes.
// ─────────────────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = { A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#ef4444' };

// Active question options: 10, 15, 20 ... 75 (step 5)
const ACTIVE_Q_OPTIONS = Array.from({ length: 14 }, (_, i) => (i + 2) * 5);

function OmrSheetDesigner({ exam, onClose, embedded, answerKey: externalAnswerKey, setAnswerKey: setExternalAnswerKey, activeQuestions: externalActiveQ, setActiveQuestions: setExternalActiveQ }) {
    const [activeTab, setActiveTab] = useState('design');

    // Answer key — shared with OmrHub if provided
    const [internalAnswerKey, setInternalAnswerKey] = useState({});
    const answerKey = externalAnswerKey || internalAnswerKey;
    const setAnswerKey = setExternalAnswerKey || setInternalAnswerKey;

    // Active questions — how many will the scanner evaluate
    const [internalActiveQ, setInternalActiveQ] = useState(exam?.mcqTotal || 25);
    const activeQ = externalActiveQ || internalActiveQ;
    const setActiveQ = setExternalActiveQ || setInternalActiveQ;

    const handleActiveQChange = (val) => {
        const num = parseInt(val);
        setActiveQ(num);
        // Remove answer key entries beyond new active Q
        const newKey = {};
        Object.entries(answerKey).forEach(([k, v]) => { if (parseInt(k) <= num) newKey[k] = v; });
        setAnswerKey(newKey);
    };

    const setAnswer = (qNum, option) => {
        setAnswerKey(prev => ({ ...prev, [qNum]: option }));
    };

    const answeredCount = Object.keys(answerKey).length;

    // ── Print Integration ──────────────────────────────────────────────
    const printRef = useRef(null);
    const [printMode, setPrintMode] = useState({ mode: 'preview', setLabel: 'A' });

    const performPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `OMR_Universal_Sheet`,
        pageStyle: `
            @page { size: A4 portrait; margin: 0; }
            @media print {
                html, body { width: 210mm; height: 297mm; margin: 0 !important; padding: 0 !important; background: white !important; }
                .print-page { margin: 0 !important; border: initial !important; box-shadow: initial !important; background: initial !important; page-break-after: always; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        `
    });

    const triggerPrint = (mode, setLabel) => {
        setPrintMode({ mode, setLabel });
        setTimeout(() => { performPrint(); }, 500);
    };

    const handlePrintBlank = () => triggerPrint('sheet', 'A');
    const handlePrintAnswerKey = () => triggerPrint('answer_key', 'A');

    // ── Tabs ───────────────────────────────────────────────────────────
    const tabs = [
        { id: 'design', label: 'Universal Sheet', icon: MdInfo },
        { id: 'answerkey', label: 'Answer Key', icon: MdKey },
        { id: 'generate', label: 'Generate PDF', icon: MdAutoAwesome },
    ];

    const inner = (
        <div className={(onClose || embedded) ? 'p-6 overflow-y-auto h-full' : ''}>
            {!embedded && (
                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-xl font-bold text-cyan-600 underline'>Universal OMR Sheet — Always 75 Questions</h1>
                    {onClose && (
                        <button onClick={onClose} className='p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors'>
                            <MdClose size={22} />
                        </button>
                    )}
                </div>
            )}

            {/* TAB BAR */}
            <div className='flex border-b border-slate-200 mb-5 gap-1'>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-all ${activeTab === tab.id ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: UNIVERSAL SHEET INFO ──────────────────────────────── */}
            {activeTab === 'design' && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                    <div className='space-y-4'>

                        {/* ── INFO BANNER ── */}
                        <div className='bg-sky-50 border-2 border-sky-200 rounded-2xl p-5'>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white'>
                                    <MdInfo size={22} />
                                </div>
                                <div>
                                    <p className='font-black text-slate-800 text-sm'>Universal Fixed OMR Sheet</p>
                                    <p className='text-xs text-slate-500'>Print once — use for all exams</p>
                                </div>
                            </div>
                            <ul className='text-xs text-slate-600 space-y-1.5 font-medium'>
                                <li>✅ <strong>Always 75 questions</strong> — sheet never changes</li>
                                <li>✅ <strong>SET bubble</strong> (A/B/C/D) — scanner auto-detects active set</li>
                                <li>✅ <strong>Roll Number</strong> — 6-digit bubble grid</li>
                                <li>✅ <strong>Scanner evaluates only "Active Questions"</strong> (Q1 → Q{activeQ})</li>
                                <li>✅ No QR code, no conditions — pure bubble-based OMR</li>
                            </ul>
                        </div>

                        {/* ── ACTIVE QUESTIONS SELECTOR ── */}
                        <div className='bg-white border-2 border-slate-200 rounded-2xl p-5'>
                            <label className='block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider'>
                                Active Questions for This Exam
                            </label>
                            <p className='text-xs text-slate-400 mb-3'>
                                Scanner will evaluate only the first <strong className='text-sky-600'>{activeQ}</strong> bubbles.
                                Remaining {75 - activeQ} bubbles are ignored.
                            </p>
                            <div className='grid grid-cols-7 gap-1.5'>
                                {ACTIVE_Q_OPTIONS.map(n => (
                                    <button
                                        key={n}
                                        onClick={() => handleActiveQChange(n)}
                                        className={`py-2 rounded-xl text-xs font-black transition-all ${activeQ === n
                                            ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div className='mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3'>
                                <div className='text-2xl font-black text-amber-600'>{activeQ}</div>
                                <div>
                                    <p className='text-xs font-black text-amber-700'>Active Questions Selected</p>
                                    <p className='text-[10px] text-amber-500'>Q1 → Q{activeQ} evaluated. Q{activeQ + 1} → Q75 ignored by scanner.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mini preview */}
                    <div className='bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col gap-3'>
                        <p className='font-bold text-sm text-slate-600'>Live Preview — Universal OMR Sheet</p>
                        <div className='bg-slate-50 border rounded-lg shadow-sm text-xs p-2 overflow-hidden relative' style={{ height: '300px' }}>
                            <div className='origin-top-left' style={{ transform: 'scale(0.35)', width: '210mm' }}>
                                <PremiumOmrSheet setLabel="A" />
                            </div>
                        </div>
                        <div className='grid grid-cols-3 gap-2 text-center text-xs mt-2'>
                            {[
                                { label: 'Total Bubbles', val: 75, color: 'text-sky-600' },
                                { label: 'Active Q', val: activeQ, color: 'text-amber-600' },
                                { label: 'Ignored', val: 75 - activeQ, color: 'text-slate-400' },
                            ].map(item => (
                                <div key={item.label} className='bg-white border rounded-lg p-2'>
                                    <p className={`text-xl font-black ${item.color}`}>{item.val}</p>
                                    <p className='text-[9px] text-slate-400 uppercase font-bold'>{item.label}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={handlePrintBlank}
                            className='w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-sky-700 transition-colors'>
                            <MdPrint size={18} /> Print Universal OMR Sheet
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB 2: ANSWER KEY ──────────────────────────────────────────── */}
            {activeTab === 'answerkey' && (
                <div>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <p className='font-bold text-slate-700'>Enter Correct Answers</p>
                            <p className='text-sm text-slate-400'>
                                Setting answers for <strong className='text-sky-600'>Q1 → Q{activeQ}</strong> only.
                                Q{activeQ + 1}–Q75 are ignored by scanner.
                            </p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${answeredCount === activeQ ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                {answeredCount} / {activeQ} answered
                            </div>
                            {answeredCount > 0 && (
                                <button onClick={() => setAnswerKey({})} className='btn btn-xs btn-outline btn-error'>Clear All</button>
                            )}
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
                        {Array.from({ length: activeQ }, (_, i) => {
                            const qNum = i + 1;
                            const selected = answerKey[qNum];
                            return (
                                <div key={qNum} className={`border-2 rounded-xl p-2 transition-all ${selected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                    <p className='text-xs font-black text-slate-500 mb-1.5'>Q.{qNum}</p>
                                    <div className='flex gap-1'>
                                        {OPTION_LABELS.map((opt, j) => {
                                            const isSelected = selected === opt;
                                            return (
                                                <button key={opt} onClick={() => setAnswer(qNum, opt)}
                                                    className={`w-7 h-7 rounded-full text-[10px] font-black transition-all ${isSelected ? 'text-white shadow-md scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    style={isSelected ? { backgroundColor: Object.values(OPTION_COLORS)[j] } : {}}>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {answeredCount > 0 && (
                        <div className='mt-5 p-4 bg-slate-50 rounded-xl'>
                            <p className='font-bold text-sm text-slate-600 mb-3'>Answer Key Summary (Q1–Q{activeQ})</p>
                            <div className='flex flex-wrap gap-1.5'>
                                {Array.from({ length: activeQ }, (_, i) => {
                                    const qNum = i + 1;
                                    const ans = answerKey[qNum];
                                    const optIdx = OPTION_LABELS.indexOf(ans);
                                    return (
                                        <div key={qNum} className='flex items-center gap-0.5 bg-white border rounded-lg px-2 py-1'>
                                            <span className='text-[9px] text-slate-400'>{qNum}.</span>
                                            {ans ? (
                                                <span className='text-[10px] font-black' style={{ color: optIdx >= 0 ? Object.values(OPTION_COLORS)[optIdx] : '#666' }}>
                                                    {ans}
                                                </span>
                                            ) : (
                                                <span className='text-[10px] text-red-300'>?</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 3: GENERATE PDF ──────────────────────────────────────── */}
            {activeTab === 'generate' && (
                <div className='space-y-4'>
                    {/* Active Q reminder */}
                    <div className='flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-5 py-3'>
                        <div className='w-8 h-8 bg-sky-600 rounded-xl flex items-center justify-center text-white text-sm font-black'>{activeQ}</div>
                        <div>
                            <p className='text-xs font-black text-sky-700'>Active Questions: {activeQ}</p>
                            <p className='text-[10px] text-sky-400'>Scanner evaluates Q1–Q{activeQ}. Remaining {75 - activeQ} bubbles ignored. Sheet always has 75 bubbles.</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                        {/* ── PRIMARY: Blank Universal Sheet ── */}
                        <button onClick={handlePrintBlank}
                            className='flex items-start gap-4 p-5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 rounded-2xl transition-all text-left group col-span-full'>
                            <div className='w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform'>📋</div>
                            <div>
                                <p className='font-black text-slate-800 text-base'>Print Universal OMR Sheet</p>
                                <p className='text-slate-500 text-xs mt-1'>
                                    75 questions • 4 options (A/B/C/D) • SET bubble • 6-digit Roll Number<br />
                                    <span className='text-sky-600 font-bold'>One sheet for all exams — scanner evaluates only the first {activeQ} questions</span>
                                </p>
                            </div>
                        </button>

                        {/* Answer Key */}
                        <button onClick={handlePrintAnswerKey} disabled={answeredCount === 0}
                            className='flex items-start gap-4 p-5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-2xl transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed'>
                            <div className='w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform'>🔑</div>
                            <div>
                                <p className='font-black text-slate-800'>Answer Key Card (Teacher Copy)</p>
                                <p className='text-slate-500 text-xs mt-0.5'>
                                    {answeredCount === 0 ? '⚠️ Set answers in Answer Key tab first' : `${answeredCount}/${activeQ} answers set — Q1–Q${activeQ} marked`}
                                </p>
                            </div>
                        </button>

                        {/* Exam Info */}
                        <div className='p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center'>
                            <p className='font-bold text-xs text-slate-500 uppercase tracking-wider mb-2'>How it works</p>
                            <div className='space-y-1 text-xs text-slate-500'>
                                <p>1️⃣ Print Universal Sheet (75 Q) — stock in bulk</p>
                                <p>2️⃣ Student fills: SET bubble + roll number + answers</p>
                                <p>3️⃣ Scanner reads SET, roll, and evaluates Q1–Q<strong className='text-sky-600'>{activeQ}</strong></p>
                                <p>4️⃣ Remaining {75 - activeQ} bubbles automatically ignored</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* HIDDEN PRINT AREA */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <PremiumOmrSheet
                        setLabel={printMode.setLabel}
                        answerKey={printMode.mode === 'answer_key' ? answerKey : undefined}
                        isAnswerKeyMode={printMode.mode === 'answer_key'}
                    />
                </div>
            </div>

            {/* NORMAL RENDER */}
            {onClose ? (
                <div className='fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-auto'>
                        {inner}
                    </div>
                </div>
            ) : inner}
        </>
    );
}

export default OmrSheetDesigner;
