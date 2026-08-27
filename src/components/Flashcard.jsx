import React, { useState } from 'react';

export default function Flashcard({ card, onHard, onGotIt }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-md mx-auto min-h-[600px] p-4">
      {/* 3D Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-[450px] cursor-pointer perspective-1000"
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 flex flex-col justify-between items-center text-slate-900 backface-hidden shadow-2xl">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
              {card.category || "GENERAL SCIENCE"}
            </span>

            <p className="text-xl font-bold text-center leading-relaxed">
              {card.question}
            </p>

            <span className="text-xs text-slate-400 font-medium">
              Tap card to reveal answer & rationale ↺
            </span>
          </div>

          {/* BACK FACE (Pre-rotated 180deg so it displays normal when flipped) */}
          <div className="absolute inset-0 w-full h-full bg-[#162B68] rounded-3xl p-8 flex flex-col justify-between items-center text-white rotate-y-180 backface-hidden shadow-2xl">
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              CORRECT ANSWER
            </span>

            <div className="flex flex-col items-center text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {card.correctAnswer}
              </h3>
              {card.explanation && (
                <p className="text-sm bg-white/10 p-4 rounded-xl text-slate-200 border border-white/10 leading-relaxed">
                  {card.explanation}
                </p>
              )}
            </div>

            <span className="text-xs text-slate-300/70 font-medium">
              Tap to view question ↺
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-4 w-full mt-6">
        <button 
          onClick={onHard}
          className="border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-2xl py-4 flex flex-col items-center transition"
        >
          <span className="font-bold text-base">Hard</span>
          <span className="text-xs text-slate-400 mt-0.5">Review later</span>
        </button>

        <button 
          onClick={onGotIt}
          className="border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl py-4 flex flex-col items-center transition"
        >
          <span className="font-bold text-base">Got it!</span>
          <span className="text-xs text-slate-400 mt-0.5">Mastered</span>
        </button>
      </div>
    </div>
  );
}