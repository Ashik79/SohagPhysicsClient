import React, { useState, useRef } from 'react';
import { MdPrint, MdSettings, MdKey, MdAutoAwesome, MdClose } from 'react-icons/md';
import { useReactToPrint } from 'react-to-print';
import PremiumOmrSheet from './PremiumOmrSheet';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
const OPTION_COLORS = {
    A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#ef4444', E: '#8b5cf6'
};
const SET_COLORS = {
    A: [14, 165, 233],
    B: [16, 185, 129],
    C: [245, 158, 11],
    D: [239, 68, 68],
};

function OmrSheetDesigner({ exam, onClose, embedded, answerKey: externalAnswerKey, setAnswerKey: setExternalAnswerKey }) {
    const [activeTab, setActiveTab] = useState('design');

    // Fallback to internal state if not provided (standalone mode)
    const [internalAnswerKey, setInternalAnswerKey] = useState({});
    const answerKey = externalAnswerKey || internalAnswerKey;
    const setAnswerKey = setExternalAnswerKey || setInternalAnswerKey;

    // Auto-fill from exam when launched from exam page
    const [config, setConfig] = useState({
        examTitle: exam?.title || 'Sohag Physics â€” Exam',
        batch: exam?.batch || '',
        date: exam?.date || '',
        totalQuestions: exam?.mcqTotal || 30,
        optionsPerQuestion: 4,
        showRollBox: true,
        showNameBox: true,
        instructions: `Fill the bubble completely. Use black/blue ballpoint pen only. Each correct answer = +${exam?.marksPerCorrect || 1}. No negative marking.`,
        marksPerCorrect: exam?.marksPerCorrect || 1,
        negativeMarking: false,
        negativeValue: 0.25,
    });

    const handleConfigChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked
                : (type === 'number' || name === 'totalQuestions' || name === 'optionsPerQuestion' || name === 'copiesPerPage' || name === 'marksPerCorrect')
                    ? (parseFloat(value) || 0)
                    : value
        }));
    };

    const setAnswer = (qNum, option) => {
        setAnswerKey(prev => ({ ...prev, [qNum]: option }));
    };

    const answeredCount = Object.keys(answerKey).length;

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // SHUFFLE QUESTION ORDERS FOR EACH SET
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const getQuestionOrder = (setLabel) => {
        const original = Array.from({ length: config.totalQuestions }, (_, i) => i);
        if (setLabel === 'A') return original;
        if (setLabel === 'B') return [...original].reverse();
        if (setLabel === 'C') {
            const odds = original.filter(i => i % 2 === 0);
            const evens = original.filter(i => i % 2 !== 0);
            return [...odds, ...evens];
        }
        if (setLabel === 'D') {
            // Deterministic shuffle using seed
            const arr = [...original];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = (i * 7 + 13) % (i + 1);
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
        return original;
    };

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // REACT TO PRINT INTEGRATION
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const printRef = useRef(null);
    const [printMode, setPrintMode] = useState({ mode: 'preview', sets: ['A'] });

    const performPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `OMR_${config.examTitle.replace(/\s+/g, '_')}`,
        pageStyle: `
            @page { size: A4 portrait; margin: 0; }
            @media print {
                html, body { 
                    width: 210mm; height: 297mm;
                    margin: 0 !important; padding: 0 !important;
                    background: white !important;
                }
                .print-page { 
                    margin: 0 !important; border: initial !important; 
                    box-shadow: initial !important; background: initial !important; 
                    page-break-after: always; 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `
    });

    const triggerPrint = (mode, sets) => {
        setPrintMode({ mode, sets });
        setTimeout(() => {
            performPrint();
        }, 500); // give react time to render the hidden print area
    };

    const handleGenerateOriginal = () => triggerPrint('sheet', ['A']);
    const handleGenerateAllSets = () => triggerPrint('sheet', ['A', 'B', 'C', 'D']);
    const handleGenerateAnswerKey = () => triggerPrint('answer_key', ['A', 'B', 'C', 'D']);
    const handleGenerateSingleSet = (setLabel) => triggerPrint('sheet', [setLabel]);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // RENDER
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const tabs = [
        { id: 'design', label: 'Sheet Design', icon: MdSettings },
        { id: 'answerkey', label: 'Answer Key', icon: MdKey },
        { id: 'generate', label: 'Generate PDF', icon: MdAutoAwesome },
    ];

    const inner = (
        <div className={(onClose || embedded) ? 'p-6 overflow-y-auto h-full' : ''}>
            {!embedded && (
                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-xl font-bold text-cyan-600 underline'>OMR Sheet Designer PRO</h1>
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
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-all ${activeTab === tab.id
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* â”€â”€ TAB 1: SHEET DESIGN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'design' && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-semibold text-slate-600 mb-1'>Exam Title</label>
                            <input name='examTitle' value={config.examTitle} onChange={handleConfigChange}
                                className='input input-bordered input-sm w-full' />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-600 mb-1'>Batch</label>
                                <input name='batch' value={config.batch} onChange={handleConfigChange}
                                    className='input input-bordered input-sm w-full' placeholder='e.g. Sat 1' />
                            </div>
                            <div>
                                <label className='block text-sm font-semibold text-slate-600 mb-1'>Date</label>
                                <input name='date' value={config.date} onChange={handleConfigChange}
                                    type='date' className='input input-bordered input-sm w-full' />
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-600 mb-1'>Total Questions (5-100)</label>
                                <input
                                    type="number"
                                    name='totalQuestions'
                                    value={config.totalQuestions}
                                    onChange={handleConfigChange}
                                    min={5}
                                    max={100}
                                    className='input input-bordered input-sm w-full font-bold text-sky-600'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-semibold text-slate-600 mb-1'>Options per Q</label>
                                <select name='optionsPerQuestion' value={config.optionsPerQuestion} onChange={handleConfigChange}
                                    className='select select-bordered select-sm w-full'>
                                    <option value={4}>4 options (Aâ€“D)</option>
                                    <option value={5}>5 options (Aâ€“E)</option>
                                </select>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-3'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-600 mb-1'>Marks per Correct</label>
                                <input name='marksPerCorrect' value={config.marksPerCorrect} onChange={handleConfigChange}
                                    type='number' step='0.25' min='0.25' className='input input-bordered input-sm w-full' />
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type='checkbox' name='negativeMarking' checked={config.negativeMarking} onChange={handleConfigChange}
                                    className='toggle toggle-sm toggle-warning' />
                                <span className='text-sm font-medium'>Negative Marking</span>
                            </label>
                            {config.negativeMarking && (
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm text-slate-500'>Penalty:</span>
                                    <input name='negativeValue' value={config.negativeValue} onChange={handleConfigChange}
                                        type='number' step='0.25' min='0' max='1' className='input input-bordered input-xs w-20' />
                                </div>
                            )}
                        </div>
                        <div className='flex gap-4'>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type='checkbox' name='showRollBox' checked={config.showRollBox} onChange={handleConfigChange}
                                    className='checkbox checkbox-sm checkbox-info' />
                                <span className='text-sm'>Roll No. Box</span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type='checkbox' name='showNameBox' checked={config.showNameBox} onChange={handleConfigChange}
                                    className='checkbox checkbox-sm checkbox-info' />
                                <span className='text-sm'>Name Box</span>
                            </label>
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-slate-600 mb-1'>Instructions</label>
                            <textarea name='instructions' value={config.instructions} onChange={handleConfigChange}
                                rows={2} className='textarea textarea-bordered textarea-sm w-full' />
                        </div>
                    </div>

                    {/* Mini preview */}
                    <div className='bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col gap-3'>
                        <p className='font-bold text-sm text-slate-600'>Live Preview</p>
                        <div className='bg-slate-50 border rounded-lg shadow-sm text-xs p-2 overflow-hidden relative' style={{ height: '300px' }}>
                            <div className='origin-top-left' style={{ transform: 'scale(0.35)', width: '210mm' }}>
                                <PremiumOmrSheet config={config} setLabel="A" questionOrder={getQuestionOrder('A')} />
                            </div>
                        </div>
                        <div className='grid grid-cols-3 gap-2 text-center text-xs mt-2'>
                            {[
                                { label: 'Questions', val: config.totalQuestions, color: 'text-sky-600' },
                                { label: 'Options', val: config.optionsPerQuestion, color: 'text-indigo-600' },
                                { label: 'Key Set', val: `${answeredCount}/${config.totalQuestions}`, color: answeredCount === config.totalQuestions ? 'text-emerald-600' : 'text-orange-500' },
                            ].map(item => (
                                <div key={item.label} className='bg-white border rounded-lg p-2'>
                                    <p className={`text-xl font-black ${item.color}`}>{item.val}</p>
                                    <p className='text-[9px] text-slate-400 uppercase font-bold'>{item.label}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGenerateOriginal}
                            className='w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-sky-700 transition-colors'>
                            <MdPrint size={18} /> Quick Generate (Set A)
                        </button>
                    </div>
                </div>
            )}

            {/* â”€â”€ TAB 2: ANSWER KEY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'answerkey' && (
                <div>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <p className='font-bold text-slate-700'>Enter Correct Answers</p>
                            <p className='text-sm text-slate-400'>Click the correct option for each question</p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${answeredCount === config.totalQuestions
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-orange-700'}`}>
                                {answeredCount} / {config.totalQuestions} answered
                            </div>
                            {answeredCount > 0 && (
                                <button onClick={() => setAnswerKey({})}
                                    className='btn btn-xs btn-outline btn-error'>Clear All</button>
                            )}
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
                        {Array.from({ length: config.totalQuestions }, (_, i) => {
                            const qNum = i + 1;
                            const selected = answerKey[qNum];
                            return (
                                <div key={qNum} className={`border-2 rounded-xl p-2 transition-all ${selected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                    <p className='text-xs font-black text-slate-500 mb-1.5'>Q.{qNum}</p>
                                    <div className='flex gap-1'>
                                        {Array.from({ length: config.optionsPerQuestion }, (_, j) => {
                                            const opt = OPTION_LABELS[j];
                                            const isSelected = selected === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => setAnswer(qNum, opt)}
                                                    className={`w-7 h-7 rounded-full text-[10px] font-black transition-all ${isSelected
                                                        ? 'text-white shadow-md scale-110'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    style={isSelected ? { backgroundColor: Object.values(OPTION_COLORS)[j] } : {}}
                                                >
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
                            <p className='font-bold text-sm text-slate-600 mb-3'>Answer Key Summary</p>
                            <div className='flex flex-wrap gap-1.5'>
                                {Array.from({ length: config.totalQuestions }, (_, i) => {
                                    const qNum = i + 1;
                                    const ans = answerKey[qNum];
                                    const optIdx = OPTION_LABELS.indexOf(ans);
                                    return (
                                        <div key={qNum} className='flex items-center gap-0.5 bg-white border rounded-lg px-2 py-1'>
                                            <span className='text-[9px] text-slate-400'>{qNum}.</span>
                                            {ans ? (
                                                <span className='text-[10px] font-black'
                                                    style={{ color: optIdx >= 0 ? Object.values(OPTION_COLORS)[optIdx] : '#666' }}>
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

            {/* â”€â”€ TAB 3: GENERATE PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {activeTab === 'generate' && (
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                        {/* Original Sheet */}
                        <button onClick={handleGenerateOriginal}
                            className='flex items-start gap-4 p-5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 rounded-2xl transition-all text-left group'>
                            <div className='w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform'>ðŸ“‹</div>
                            <div>
                                <p className='font-black text-slate-800'>Original Sheet (Set A)</p>
                                <p className='text-slate-500 text-xs mt-0.5'>{config.totalQuestions} questions • {config.optionsPerQuestion} options • Full Page Optimal Layout</p>
                            </div>
                        </button>

                        {/* All 4 Sets */}
                        <button onClick={handleGenerateAllSets}
                            className='flex items-start gap-4 p-5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-2xl transition-all text-left group'>
                            <div className='w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform'>ðŸ”€</div>
                            <div>
                                <p className='font-black text-slate-800'>All 4 Sets (A, B, C, D)</p>
                                <p className='text-slate-500 text-xs mt-0.5'>Shuffled question orders + answer keys in one PDF</p>
                            </div>
                        </button>

                        {/* Answer Key Only */}
                        <button onClick={handleGenerateAnswerKey}
                            disabled={answeredCount === 0}
                            className='flex items-start gap-4 p-5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-2xl transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed'>
                            <div className='w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform'>ðŸ”‘</div>
                            <div>
                                <p className='font-black text-slate-800'>Answer Key Card (All Sets)</p>
                                <p className='text-slate-500 text-xs mt-0.5'>
                                    {answeredCount === 0
                                        ? 'âš ï¸ Set answers in the Answer Key tab first'
                                        : `${answeredCount}/${config.totalQuestions} answers set â€” print for teachers`}
                                </p>
                            </div>
                        </button>

                        {/* Individual Set */}
                        <div className='p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl'>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-lg'>ðŸŽ¯</div>
                                <p className='font-black text-slate-800'>Individual Set</p>
                            </div>
                            <div className='grid grid-cols-4 gap-2'>
                                {['A', 'B', 'C', 'D'].map(setLabel => (
                                    <button key={setLabel}
                                        onClick={() => handleGenerateSingleSet(setLabel)}
                                        className='py-2 rounded-xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95'
                                        style={{ backgroundColor: SET_COLORS[setLabel] }}>
                                        SET {setLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                        <p className='font-bold text-sm text-slate-600 mb-2'>ðŸ“Œ Set Shuffle Logic</p>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-500'>
                            <div className='bg-white p-2 rounded-lg border'><span className='font-bold text-sky-600'>SET A</span> â€” Original order</div>
                            <div className='bg-white p-2 rounded-lg border'><span className='font-bold text-emerald-600'>SET B</span> â€” Reversed order</div>
                            <div className='bg-white p-2 rounded-lg border'><span className='font-bold text-amber-600'>SET C</span> â€” Odd first, then Even</div>
                            <div className='bg-white p-2 rounded-lg border'><span className='font-bold text-red-600'>SET D</span> â€” Fixed random shuffle</div>
                        </div>
                        <p className='text-xs text-slate-400 mt-2'>Answer Key auto-remapped for each set. Same questions â€” different order = anti-cheating.</p>
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
                    {printMode.mode === 'sheet' && printMode.sets.map(setLabel => (
                        <PremiumOmrSheet
                            key={`sheet-${setLabel}`}
                            config={config}
                            setLabel={setLabel}
                            questionOrder={getQuestionOrder(setLabel)}
                        />
                    ))}
                    {printMode.mode === 'answer_key' && printMode.sets.map(setLabel => (
                        <PremiumOmrSheet
                            key={`ans-${setLabel}`}
                            config={config}
                            setLabel={setLabel}
                            questionOrder={getQuestionOrder(setLabel)}
                            answerKey={answerKey}
                            isAnswerKeyMode={true}
                        />
                    ))}
                </div>
            </div>

            {/* NORMAL RENDER (Modal or Embedded) */}
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
