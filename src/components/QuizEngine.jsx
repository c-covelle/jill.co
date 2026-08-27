import React, { useState, useEffect } from 'react';
import { 
  X, Bookmark, Info, Bug, Timer, 
  ChevronLeft, ChevronRight, Sparkles, CheckCircle2, 
  FolderOpen, RefreshCw 
} from 'lucide-react';
import { markMistakeMastered, recordMistake } from '../lib/syncService';

export default function QuizEngine({ 
  questions = [], 
  title = "Quick Review", 
  subtitle = "Mixed Questions",
  onClose,
  onComplete 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);

  const defaultQuestion = {
    id: 1,
    category: "GENERAL SCIENCE",
    difficulty: "Easy",
    question: "Which is the brain of the computer?",
    options: [
      { id: "A", text: "RAM" },
      { id: "B", text: "CPU" },
      { id: "C", text: "Program" },
      { id: "D", text: "Password" }
    ],
    correctAnswer: "B",
    correctText: "CPU",
    rationale: "The Central Processing Unit (CPU) executes instructions, performs calculations, and manages data flow across computer components, earning its standard designation as the 'brain' of the system.",
    memoryTip: "CPU = Central Processing Unit = Core computational Brain.",
    choiceAnalysis: {
      A: "Incorrect. RAM (Random Access Memory) provides high-speed volatile temporary memory storage, not computational control.",
      B: "Correct. The CPU performs fundamental arithmetic, logic, and control operations.",
      C: "Incorrect. A Program is a software instruction set executed by the processor.",
      D: "Incorrect. A Password is an authentication string for access control."
    }
  };

  const currentQ = (questions && questions.length > 0) ? questions[currentIndex] : defaultQuestion;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectedChoice = selectedAnswers[currentIndex];
  const isAnswered = selectedChoice !== undefined;

  const handleSelect = (choiceId) => {
    if (isAnswered) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: choiceId }));
    setAiExplanation(null);

    const isCorrect = choiceId === currentQ.correctAnswer;
    const category = currentQ.domain === 'gened'
      ? 'GenEd'
      : currentQ.domain === 'profed'
        ? 'ProfEd'
        : currentQ.category || 'Specialization';

    if (isCorrect && currentQ.mistakeId) {
      markMistakeMastered(currentQ.mistakeId);
    } else if (!isCorrect) {
      recordMistake({
        questionId: currentQ.id,
        category,
        setName: currentQ.setName || title,
        question: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.correctAnswer,
        selectedAnswer: choiceId,
        rationalization: currentQ.choiceAnalysis || currentQ.rationale || ''
      });
    }
  };

  const handleNext = () => {
    const total = questions.length || 1;
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setAiExplanation(null);
    } else if (onComplete) {
      onComplete(selectedAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setAiExplanation(null);
    }
  };

  // Dynamic Contextual LET Analyzer
  const askGemini = () => {
    setAiLoading(true);
    setAiExplanation(null);

    setTimeout(() => {
      const distractors = currentQ.options
        ? currentQ.options.filter(opt => opt.id !== currentQ.correctAnswer)
        : [];

      const distractorBreakdown = distractors.map(opt => {
        const specificAnalysis = currentQ.choiceAnalysis?.[opt.id];
        return specificAnalysis 
          ? `• **Option ${opt.id} (${opt.text})**: ${specificAnalysis}`
          : `• **Option ${opt.id} (${opt.text})**: Non-definitive choice; functions as a common board distractor in ${currentQ.category || 'General Education'}.`;
      }).join('\n');

      const fullAnalysis = `
• **Core Subject Competency**: **${currentQ.category || 'General Education'}**
• **Key Concept**: **Option ${currentQ.correctAnswer} (${currentQ.correctText})** directly satisfies the prompt criteria.

**Direct Item Rationale:**
${currentQ.rationale || 'This option represents the precise, standard definition evaluated in Licensure Examination curricula.'}

**Distractor Elimination Breakdown:**
${distractorBreakdown}

**High-Yield Recall Strategy:**
💡 ${currentQ.memoryTip || `Anchor the keyword "${currentQ.correctText}" directly to the primary operational condition in the item stem.`}
      `.trim();

      setAiExplanation(fullAnalysis);
      setAiLoading(false);
    }, 400);
  };

  const totalQuestions = questions.length || 1;

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col justify-between max-w-xl mx-auto p-4 select-none">
      {/* TOP HEADER */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer">
            <X size={20} className="text-slate-300" />
          </button>
          
          <div className="text-center">
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#E5B842] block">
              {title}
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {subtitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <Bookmark size={18} className={isBookmarked ? "fill-[#E5B842] text-[#E5B842]" : "text-slate-400"} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 cursor-pointer">
              <Info size={18} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 cursor-pointer">
              <Bug size={18} />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR & TIMER */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden my-2">
          <div 
            className="bg-[#E5B842] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 py-2">
          <span>Q{currentIndex + 1} OF {totalQuestions}</span>
          <div className="flex items-center gap-1">
            <Timer size={14} className="text-slate-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
        </div>
      </div>

      {/* QUESTION BODY */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <FolderOpen size={14} className="text-indigo-400" />
          <span className="truncate uppercase">{currentQ.category}</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {currentQ.difficulty || "Medium"}
          </span>
        </div>

        <h2 className="text-xl font-bold leading-relaxed text-white">
          {currentQ.question}
        </h2>

        {/* OPTIONS LIST */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = selectedChoice === opt.id;
            const isCorrect = opt.id === currentQ.correctAnswer;
            
            let btnStyle = "border-slate-800 bg-[#121724] text-slate-200 hover:border-slate-700 cursor-pointer";
            let circleStyle = "bg-slate-800/80 text-slate-300";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                circleStyle = "bg-emerald-500 text-slate-950 font-bold";
              } else if (isSelected && !isCorrect) {
                btnStyle = "border-rose-500 bg-rose-950/40 text-rose-300";
                circleStyle = "bg-rose-500 text-white font-bold";
              } else {
                btnStyle = "border-slate-800/40 bg-[#0d121c] text-slate-500 opacity-60";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${circleStyle}`}>
                    {opt.id}
                  </span>
                  <span className="text-base font-medium leading-snug">{opt.text}</span>
                </div>
                {isAnswered && isCorrect && (
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* REVEALED RATIONALE & AI SECTION */}
        {isAnswered && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#121A2E] border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 size={16} />
                <span>CORRECT: {currentQ.correctAnswer}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{currentQ.correctText}</h3>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rationale</span>
                <p className="text-sm text-slate-300 leading-relaxed">{currentQ.rationale}</p>
              </div>

              <button
                onClick={askGemini}
                disabled={aiLoading}
                className="mt-4 w-full bg-[#1A233A] hover:bg-[#222E4D] border border-amber-500/30 text-[#E5B842] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing Breakdown...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>ASK AI FOR DEEPER ANALYSIS</span>
                  </>
                )}
              </button>
            </div>

            {aiExplanation && (
              <div className="bg-gradient-to-br from-[#121A2E] to-[#17233E] border border-[#E5B842]/40 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 text-[#E5B842] text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={16} />
                  <span>Gemini Insight</span>
                </div>
                <div className="text-sm text-slate-200 space-y-2 whitespace-pre-line leading-relaxed">
                  {aiExplanation}
                </div>
              </div>
            )}

            {currentQ.memoryTip && (
              <div className="bg-[#151B2B] border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <span className="text-[11px] font-bold text-[#E5B842] uppercase tracking-wider block mb-1">
                    Memory Tip
                  </span>
                  <p className="text-xs text-amber-200/90 leading-relaxed italic">
                    {currentQ.memoryTip}
                  </p>
                </div>
              </div>
            )}

            <ChoiceExplanations question={currentQ} />
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION FOOTER */}
      <div className="pt-4 grid grid-cols-3 gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="col-span-1 bg-[#151B2B] disabled:opacity-30 border border-slate-800 text-slate-300 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1 transition cursor-pointer"
        >
          <ChevronLeft size={18} />
          <span>PREV</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="col-span-2 bg-[#E5B842] hover:bg-[#d6ab38] disabled:opacity-40 text-slate-950 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1 transition shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <span>{currentIndex === totalQuestions - 1 ? "FINISH DRILL" : "NEXT"}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ChoiceExplanations({ question }) {
  const analysis =
    question.choiceAnalysis ||
    question.whyEachChoice ||
    question.why_each_choice ||
    question.choiceExplanations ||
    question.choice_explanations ||
    question.explanations ||
    question.explanationByChoice ||
    question.explanation_by_choice;

  if (!analysis) return null;

  const entries = Array.isArray(analysis)
    ? analysis.map((item, index) => {
        if (typeof item === 'string') {
          return [
            String.fromCharCode(65 + index),
            item
          ];
        }

        return [
          String(
            item.id ||
            item.key ||
            item.letter ||
            String.fromCharCode(65 + index)
          ).toUpperCase(),
          item.explanation ||
          item.text ||
          item.reason ||
          item.why ||
          ''
        ];
      })
    : typeof analysis === 'object'
      ? Object.entries(analysis).map(([key, value]) => [
          key.replace(/choice|option|why[_-]?/gi, '').trim().toUpperCase(),
          typeof value === 'object'
            ? value.explanation ||
              value.text ||
              value.reason ||
              value.why ||
              ''
            : String(value)
        ])
      : [['', String(analysis)]];

  const correctAnswer = String(question.correctAnswer || '').toUpperCase();

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2">
        <Info size={16} className="text-indigo-300" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
          Why Each Choice
        </h3>
      </div>

      <div className="mt-4 space-y-3">
        {entries.map(([choiceId, explanation], index) => {
          if (!explanation) return null;

          const normalizedChoiceId =
            choiceId || String.fromCharCode(65 + index);

          const isCorrect = normalizedChoiceId === correctAnswer;

          return (
            <div
              key={`${normalizedChoiceId}-${index}`}
              className={`rounded-xl border p-3 ${
                isCorrect
                  ? 'border-emerald-500/30 bg-emerald-950/30'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {normalizedChoiceId}
                </span>

                <p
                  className={`text-sm leading-relaxed ${
                    isCorrect ? 'text-emerald-200' : 'text-slate-300'
                  }`}
                >
                  {explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}