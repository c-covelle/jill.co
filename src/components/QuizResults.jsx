import React from 'react';
import { 
  Trophy, RotateCcw, Home, CheckCircle2, 
  XCircle, Clock, Award, ChevronRight, BarChart3 
} from 'lucide-react';

export default function QuizResults({
  questions = [],
  selectedAnswers = {},
  totalTime = 0,
  title = "Quick Review",
  onRetry,
  onHome
}) {
  let correctCount = 0;
  const totalQuestions = questions.length || 1;

  questions.forEach((q, index) => {
    if (selectedAnswers[index] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = percentage >= 75;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col justify-between max-w-xl mx-auto p-5 select-none animate-in fade-in duration-300">
      <div className="space-y-6">
        
        {/* TOP STATUS BADGE */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 mb-4">
            <BarChart3 size={14} className="text-[#E5B842]" />
            <span>DRILL SUMMARY</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            {isPassed ? "Outstanding Performance!" : "Review & Master"}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {title} • PRC Board Examination Standard (75% Passing)
          </p>
        </div>

        {/* SCORE CARD */}
        <div className="bg-[#121724] border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div 
            className={`absolute w-40 h-40 rounded-full blur-3xl opacity-20 -top-10 ${
              isPassed ? "bg-emerald-500" : "bg-amber-500"
            }`} 
          />

          <div className="relative z-10 text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner mb-2">
              <Trophy size={36} className={isPassed ? "text-[#E5B842]" : "text-slate-400"} />
            </div>

            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-white">{percentage}%</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-slate-900/80 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${isPassed ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              <span className={isPassed ? "text-emerald-400" : "text-rose-400"}>
                {isPassed ? "Board Ready (Passed)" : "Needs Review (Retake)"}
              </span>
            </div>
          </div>

          {/* KEY METRICS */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-5 border-t border-slate-800/60 text-center">
            <div className="p-2.5 rounded-2xl bg-[#0d121c] border border-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Score</span>
              <span className="text-base font-bold text-white">{correctCount}/{totalQuestions}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#0d121c] border border-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Time</span>
              <span className="text-base font-bold text-slate-200">{formatTime(totalTime)}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#0d121c] border border-slate-800/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Accuracy</span>
              <span className="text-base font-bold text-emerald-400">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* ITEM BREAKDOWN */}
        <div className="space-y-3">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase block px-1">
            Item Analysis Breakdown
          </span>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div 
                  key={q.id || idx}
                  className="bg-[#121724] border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : (
                        <XCircle size={20} className="text-rose-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">
                        {idx + 1}. {q.question}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Correct: <strong className="text-emerald-300">{q.correctAnswer}</strong> • Your Choice: <strong className={isCorrect ? "text-emerald-300" : "text-rose-400"}>{userAns || "None"}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-900 text-slate-400 shrink-0 uppercase">
                    {q.category ? q.category.substring(0, 10) : "GENED"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FOOTER CONTROLS */}
      <div className="pt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onRetry}
          className="bg-[#151B2B] hover:bg-[#1a2236] border border-slate-800 text-slate-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>RETAKE DRILL</span>
        </button>

        <button
          onClick={onHome}
          className="bg-[#E5B842] hover:bg-[#d6ab38] text-slate-950 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <Home size={16} />
          <span>DASHBOARD</span>
        </button>
      </div>
    </div>
  );
}