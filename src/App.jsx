import React, { useState, useEffect } from 'react';
import { 
  BarChart3, BookOpen, Home, GraduationCap, User, Bell, 
  Sparkles, Flame, Check, ChevronRight, ChevronLeft, 
  RotateCcw, Lock, Mail, ArrowRight, ShieldCheck, FileText,
  X, Bookmark, Info, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// ALLOWLIST: Approved reviewer emails
const ALLOWED_EMAILS = [
  'crissian@example.com',
  'jill@example.com',
  'reviewer@projectjill.com',
  'admin@test.com'
];

// SAMPLE QUESTION BANK
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    category: "INFORMATION TECHNOLOGY - COMPUTER BASICS",
    difficulty: "Easy",
    question: "Which is the brain of the computer?",
    options: [
      { id: "A", text: "RAM" },
      { id: "B", text: "CPU" },
      { id: "C", text: "Program" },
      { id: "D", text: "Password" }
    ],
    correctAnswer: "B",
    rationale: "The Central Processing Unit (CPU) performs basic arithmetic, logic, controlling, and input/output operations specified by computer program instructions, earning its designation as the computer's 'brain'.",
    memoryTip: "CPU (Central Processing Unit) = BRAIN of the computer.",
    choiceAnalysis: {
      A: "Incorrect. RAM is primary volatile temporary memory.",
      B: "Correct. The CPU executes instructions and performs logic.",
      C: "Incorrect. Program is a set of software instructions.",
      D: "Incorrect. Password is a security credential."
    }
  },
  {
    id: 2,
    category: "PROFESSIONAL EDUCATION - CODE OF ETHICS",
    difficulty: "Medium",
    question: "A teacher shall base the evaluation of the learner's work only in:",
    options: [
      { id: "A", text: "Merit and quality of academic performance" },
      { id: "B", text: "Attendance and behavioral compliance" },
      { id: "C", text: "Socio-economic background and effort" },
      { id: "D", text: "Personal relationship and class standing" }
    ],
    correctAnswer: "A",
    rationale: "Article VIII, Section 1 of the Code of Ethics for Professional Teachers mandates that evaluation of student work must be based solely on merit and quality of academic performance.",
    memoryTip: "Code of Ethics Art. VIII, Sec. 1: Evaluation must be based solely on merit and quality of academic performance.",
    choiceAnalysis: {
      A: "Correct. Mandated by Code of Ethics Art. VIII, Sec. 1.",
      B: "Incorrect. Behavior is graded separately from academic merit.",
      C: "Incorrect. Socio-economic factors are extraneous.",
      D: "Incorrect. Personal relations create bias."
    }
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeDrill, setActiveDrill] = useState(null);

  // Time remaining countdown for LET Sept 2026
  const [timeLeft, setTimeLeft] = useState({ days: 24, hours: 5, minutes: 42, seconds: 21 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, seconds: 59, minutes: prev.minutes > 0 ? prev.minutes - 1 : 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Landing Page & Auth Gate
  if (!isAuthenticated) {
    return (
      <LandingPage 
        onOpenAuth={() => setShowAuthModal(true)} 
        showAuthModal={showAuthModal}
        onCloseAuth={() => setShowAuthModal(false)}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  // Active Quiz View
  if (activeDrill) {
    return (
      <QuizScreen 
        drillTitle={activeDrill.title}
        questions={activeDrill.questions || SAMPLE_QUESTIONS}
        onExit={() => setActiveDrill(null)}
        onFinish={() => setActiveDrill(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex justify-center selection:bg-[#E5B842]/30 selection:text-[#E5B842]">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between pb-24 relative overflow-x-hidden border-x border-slate-800/40 bg-gradient-to-b from-[#0D1224] via-[#0A0E1A] to-[#070A12]">
        
        {/* TAB CONTENTS */}
        <main className="flex-1 p-5 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeScreen 
              timeLeft={timeLeft} 
              onStartDrill={(title) => setActiveDrill({ title, questions: SAMPLE_QUESTIONS })}
            />
          )}
          {activeTab === 'review' && (
            <ReviewHubScreen 
              onStartDrill={(title) => setActiveDrill({ title, questions: SAMPLE_QUESTIONS })}
            />
          )}
          {activeTab === 'stats' && <AnalyticsScreen />}
          {activeTab === 'learn' && <MasteryScreen />}
          {activeTab === 'profile' && <ProfileScreen onSignOut={() => setIsAuthenticated(false)} />}
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0D1322]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2.5 z-50">
          <div className="flex justify-around items-center">
            
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <BarChart3 size={22} className={activeTab === 'stats' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Stats</span>
              {activeTab === 'stats' && <div className="w-1 h-1 bg-blue-400 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('review')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'review' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <BookOpen size={22} className={activeTab === 'review' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Review</span>
              {activeTab === 'review' && <div className="w-1 h-1 bg-indigo-400 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#E5B842]' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <Home size={22} className={activeTab === 'home' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Home</span>
              {activeTab === 'home' && <div className="w-1 h-1 bg-[#E5B842] rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('learn')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'learn' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <GraduationCap size={22} className={activeTab === 'learn' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Learn</span>
              {activeTab === 'learn' && <div className="w-1 h-1 bg-emerald-400 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-fuchsia-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <User size={22} className={activeTab === 'profile' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Profile</span>
              {activeTab === 'profile' && <div className="w-1 h-1 bg-fuchsia-400 rounded-full" />}
            </button>

          </div>
        </nav>

      </div>
    </div>
  );
}

// ---------------- LUXURY LANDING PAGE ---------------- //
function LandingPage({ onOpenAuth, showAuthModal, onCloseAuth, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your reviewer email.');
      return;
    }
    const isAllowed = ALLOWED_EMAILS.some(em => em.toLowerCase() === email.trim().toLowerCase());
    if (isAllowed || email.trim() === 'demo') {
      onSuccess();
    } else {
      setErrorMsg('Access Restricted. Email is not enrolled in Wave 1 Trial.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex justify-center items-center relative overflow-hidden px-4 py-8">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <div className="w-full max-w-md min-h-screen flex flex-col justify-between relative z-10 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#162038] to-[#0D1527] border border-[#E5B842]/40 flex items-center justify-center font-serif font-bold text-[#E5B842] shadow-lg text-base">
              PJ
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm tracking-wider text-white uppercase">Project Jill</h2>
              <span className="text-[9px] text-[#E5B842] font-semibold tracking-widest block uppercase opacity-90">
                Engineered by C. Covelle
              </span>
            </div>
          </div>

          <button 
            onClick={onOpenAuth}
            className="border border-[#E5B842]/50 hover:border-[#E5B842] hover:bg-[#E5B842]/10 text-[#E5B842] text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wider uppercase transition duration-200"
          >
            Trial Access
          </button>
        </header>

        {/* Feature Cards */}
        <section className="space-y-3.5 pt-2">
          <FeatureCard 
            icon="📑" 
            title="CURATED DRILLS (SETS A-E)" 
            desc="Over 750 targeted questions in GenEd, ProfEd, and Specialization." 
          />
          <FeatureCard 
            icon="📖" 
            title="ERROR NOTEBOOK & VAULT" 
            desc="Sync and review missed questions across devices for mastery." 
          />
          <FeatureCard 
            icon="📈" 
            title="PERFORMANCE ANALYTICS" 
            desc="Live accuracy tracking, streaks, and domain-specific insights." 
          />
          <FeatureCard 
            icon="🔊" 
            title="EXCLUSIVE B&O EXPERIENCE" 
            desc="Unlock your potential with unparalleled study ambiance." 
          />
        </section>

        {/* Hero Section */}
        <section className="space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 bg-[#121B30] border border-[#E5B842]/30 text-[#E5B842] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles size={13} className="text-[#E5B842]" /> 
            <span>Wave 1 Verified Candidate Access</span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-white leading-tight tracking-tight">
            Master Your Path to LPT: <span className="text-[#E5B842] italic">Project Jill</span>
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            The definitive digital companion for PRC Licensure candidates.
          </p>

          <div className="luxury-glass-card rounded-2xl p-4.5 space-y-1.5 border border-white/5">
            <h4 className="text-xs font-bold text-[#E5B842] tracking-wide">Our Mission:</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              To empower future Filipino educators with smart, resilient, and focused PRC exam preparation.
            </p>
          </div>

          <button 
            onClick={onOpenAuth}
            className="w-full gold-glow-btn text-slate-950 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Try Project Jill Now <ArrowRight size={16} />
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center pt-6 pb-2 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1.5">
          <p className="flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck size={14} className="text-[#E5B842]" /> Verified Examinees Only • Wave 1 Trial Access
          </p>
          <p>Architected & Built by <span className="text-slate-300 font-semibold">C. Covelle</span> • © 2026 Project Jill</p>
        </footer>

        {/* AUTH MODAL */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="luxury-glass-card border border-[#232F4D] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 relative">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1A2645] to-[#0F172B] border border-[#E5B842]/40 text-[#E5B842] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  PJ
                </div>
                <span className="text-[10px] font-bold text-[#E5B842] tracking-widest uppercase block pt-1">
                  PRC LICENSURE COMPANION
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">Project Jill</h3>
                <p className="text-xs text-slate-400">Sign in to access candidate drill sets.</p>
              </div>

              {errorMsg && (
                <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewer Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="candidate@example.com (or 'demo')"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#090E1B] border border-[#1E2B4A] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passcode / Access Key</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#090E1B] border border-[#1E2B4A] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842] transition"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full gold-glow-btn text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition mt-4"
                >
                  Authenticate & Enter <ArrowRight size={16} />
                </button>
              </form>

              <div className="text-center pt-1">
                <button 
                  onClick={onCloseAuth}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Cancel and return
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="luxury-glass-card rounded-2xl p-4 flex items-start gap-4 cursor-default">
      <div className="w-11 h-11 rounded-xl bg-[#141C30] border border-white/5 flex items-center justify-center text-xl shrink-0 shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-[#E5B842] tracking-wider uppercase">{title}</h4>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ---------------- HOME SCREEN ---------------- //
function HomeScreen({ timeLeft, onStartDrill }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center font-serif font-bold text-white shadow-md border border-white/20 text-sm">
            PJ
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white leading-tight">Project Jill</h1>
            <p className="text-[10px] text-[#E5B842] font-semibold tracking-wide">Your LET Review Companion</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white bg-[#13192B] rounded-full border border-slate-800">
          <Bell size={18} />
        </button>
      </div>

      <div className="pt-2">
        <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
          Good Evening, <br />Crissian! 👋
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Let's make today another step toward your license.
        </p>
      </div>

      {/* Countdown Card */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-1.5 text-[#E5B842] text-[11px] font-bold tracking-wider mb-4 uppercase">
          <Sparkles size={14} /> LET SEPTEMBER 2026
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="text-2xl font-bold text-white block">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Days</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hrs</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Min</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sec</span>
          </div>
        </div>
      </div>

      {/* Daily Quote Card */}
      <div className="luxury-glass-card rounded-3xl p-5 relative shadow-lg">
        <span className="text-3xl text-[#E5B842] font-serif block leading-none mb-1">“</span>
        <p className="text-sm italic font-serif text-slate-200 leading-relaxed">
          "The discipline of the mind is the first step toward the transformation of the classroom."
        </p>
        <div className="flex justify-between items-center mt-3 text-xs font-semibold text-[#E5B842]">
          <span>— Project Jill Team</span>
          <RotateCcw size={14} className="text-slate-500 hover:text-[#E5B842] cursor-pointer" />
        </div>
      </div>

      {/* Smart Insight Card */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#E5B842] uppercase">
          💡 SMART INSIGHT
        </div>
        <h3 className="font-bold text-base text-white">Targeted Improvement</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your Preboard Science accuracy is at 81%. A focused drill could help boost it.
        </p>
        <button 
          onClick={() => onStartDrill("Preboard Science Drill")}
          className="w-full gold-glow-btn text-slate-950 font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition mt-2 shadow-md"
        >
          Reinforce Preboard Science
        </button>
      </div>

      {/* Today's Progress Card */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">Today's Progress</span>
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame size={12} fill="#F59E0B" /> 1 Day Streak
            </span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">13 <span className="text-slate-500 text-sm font-normal">/ 150 Questions</span></div>
          <p className="text-[11px] text-slate-400">Target for today</p>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-[#E5B842] flex items-center justify-center font-bold text-sm text-white">
          8%
        </div>
      </div>

      {/* Study Consistency & Calendar */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-lg space-y-4">
        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">STUDY CONSISTENCY</div>
        <div className="flex justify-between items-center">
          {['✓', '✓', '✓', '✓', 'M', '✓', 'W'].map((val, i) => (
            <div 
              key={i} 
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                val === '✓' 
                  ? 'bg-[#E5B842] text-slate-950 font-bold' 
                  : 'bg-[#1C243B] text-slate-500'
              }`}
            >
              {val === '✓' ? <Check size={16} strokeWidth={3} /> : val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- REVIEW HUB SCREEN ---------------- //
function ReviewHubScreen({ onStartDrill }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Review Hub</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Choose your path to mastery.</p>
      </div>

      {/* Resume Banner */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
          <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-700/50">RESUME STUDY</span>
          <span className="text-emerald-400">88% ACCURACY</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-white">Preboard Science</h3>
            <p className="text-xs text-slate-400">Integrated 1</p>
          </div>
          <button 
            onClick={() => onStartDrill("Preboard Science")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
          >
            Resume
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>Session Progress</span>
            <span>1 / 160</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[2%]" />
          </div>
        </div>
      </div>

      {/* Quick Modes Grid */}
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">QUICK MODES</div>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onStartDrill("Quick Review")}
          className="luxury-glass-card rounded-3xl p-4 text-left space-y-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Quick</h4>
            <p className="text-[11px] text-slate-400">50 Random Mixed</p>
          </div>
        </button>

        <button 
          onClick={() => onStartDrill("Boss Mode")}
          className="luxury-glass-card rounded-3xl p-4 text-left space-y-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">
            🧠
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Boss</h4>
            <p className="text-[11px] text-slate-400">Weak Spots Vault</p>
          </div>
        </button>
      </div>

      {/* Full Mock Exams */}
      <button 
        onClick={() => onStartDrill("Full Mock Exam")}
        className="w-full luxury-glass-card rounded-3xl p-5 flex items-center justify-between text-left shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Full Mock Exams</h3>
            <p className="text-xs text-slate-400">Simulate the 150-item board exam.</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-500" />
      </button>

      {/* Subject Drill Cards */}
      <div className="space-y-3 pt-2">
        <SubjectCard 
          title="General Education" 
          icon="📖" 
          score={87} 
          progress={87} 
          color="blue" 
          onClick={() => onStartDrill("General Education Drill")}
        />
        <SubjectCard 
          title="Professional Education" 
          icon="👨‍🏫" 
          score={88} 
          progress={88} 
          color="emerald" 
          onClick={() => onStartDrill("Professional Education Drill")}
        />
        <SubjectCard 
          title="Science (Major)" 
          icon="🧪" 
          score={87} 
          progress={87} 
          color="amber" 
          onClick={() => onStartDrill("Science Major Drill")}
        />
      </div>
    </div>
  );
}

function SubjectCard({ title, icon, score, progress, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full luxury-glass-card rounded-3xl p-4 flex items-center justify-between text-left shadow-md transition"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#1A2238] flex items-center justify-center text-xl">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">{title}</h4>
          <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className={`h-full ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/40 flex flex-col items-center justify-center text-[10px] font-bold text-blue-400">
          {score}%
          <span className="text-[7px] text-slate-500 -mt-0.5">SCORE</span>
        </div>
        <ChevronRight size={16} className="text-slate-600" />
      </div>
    </button>
  );
}

// ---------------- ANALYTICS SCREEN ---------------- //
function AnalyticsScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Your journey to LPT mastery.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricBox icon="📖" value="2828" label="TOTAL ITEMS" />
        <MetricBox icon="🎯" value="87%" label="ACCURACY" />
        <MetricBox icon="⏱" value="11.0H" label="STUDY TIME" />
        <MetricBox icon="🔥" value="1 DAYS" label="STREAK" />
      </div>

      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">SESSION BREAKDOWN</div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="luxury-glass-card rounded-2xl p-3">
          <span className="text-lg font-bold text-blue-400 block">24</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">STUDY</span>
        </div>
        <div className="luxury-glass-card rounded-2xl p-3">
          <span className="text-lg font-bold text-amber-400 block">18</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">QUICK</span>
        </div>
        <div className="luxury-glass-card rounded-2xl p-3">
          <span className="text-lg font-bold text-fuchsia-400 block">3</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">MOCK</span>
        </div>
      </div>

      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">SUBJECT PERFORMANCE</div>
      <div className="space-y-2">
        <PerformanceRow title="General Education" percent={87} color="bg-blue-500" />
        <PerformanceRow title="Professional Education" percent={88} color="bg-fuchsia-500" />
        <PerformanceRow title="Science (Major)" percent={87} color="bg-amber-500" />
        <PerformanceRow title="Preboard Science" percent={81} color="bg-indigo-500" />
      </div>
    </div>
  );
}

function MetricBox({ icon, value, label }) {
  return (
    <div className="luxury-glass-card rounded-3xl p-4 space-y-2 shadow-lg">
      <div className="w-8 h-8 rounded-xl bg-[#1A2238] flex items-center justify-center text-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{label}</p>
      </div>
    </div>
  );
}

function PerformanceRow({ title, percent, color }) {
  return (
    <div className="luxury-glass-card rounded-2xl p-3.5 space-y-2">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-white">{title}</span>
        <span className="text-blue-400">{percent}%</span>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// ---------------- MASTERY / LEARN SCREEN ---------------- //
function MasteryScreen() {
  const [subTab, setSubTab] = useState('history');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Mastery</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Track and sharpen your knowledge.</p>
      </div>

      {/* Sub Tabs */}
      <div className="luxury-glass-card p-1.5 rounded-2xl flex justify-between gap-1 shadow-md">
        {['history', 'notes', 'cards'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              subTab === tab 
                ? 'bg-[#E5B842] text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'history' && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">YESTERDAY</span>
          <div className="luxury-glass-card rounded-3xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">⚡</div>
              <div>
                <span className="text-[9px] font-bold text-amber-400 uppercase block">QUICK REVIEW</span>
                <h4 className="font-bold text-white text-sm">Quick Review</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">44/50 • 88% • 11m</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>
        </div>
      )}

      {subTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span>GENERAL EDUCATION RAPID RECALL</span>
            <span>Card {activeCardIndex + 1} of {SAMPLE_QUESTIONS.length}</span>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-[360px] cursor-pointer perspective-1000"
          >
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* FRONT */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-6 flex flex-col justify-between items-center text-slate-900 backface-hidden shadow-2xl">
                <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
                  {SAMPLE_QUESTIONS[activeCardIndex].category}
                </span>
                <p className="text-base font-bold text-center leading-relaxed">
                  {SAMPLE_QUESTIONS[activeCardIndex].question}
                </p>
                <span className="text-xs text-slate-400 font-medium">Tap card to flip ↺</span>
              </div>

              {/* BACK */}
              <div className="absolute inset-0 w-full h-full bg-[#162B68] rounded-3xl p-6 flex flex-col justify-between items-center text-white rotate-y-180 backface-hidden shadow-2xl">
                <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">CORRECT ANSWER</span>
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-white">{SAMPLE_QUESTIONS[activeCardIndex].correctAnswer}</h3>
                  <p className="text-xs bg-white/10 p-3 rounded-xl text-slate-200 border border-white/10 leading-relaxed">
                    {SAMPLE_QUESTIONS[activeCardIndex].rationale}
                  </p>
                </div>
                <span className="text-xs text-slate-300/70 font-medium">Tap to view question ↺</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => { setIsFlipped(false); setActiveCardIndex((i) => (i + 1) % SAMPLE_QUESTIONS.length); }}
              className="border border-amber-500/30 bg-amber-500/10 text-amber-400 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >
              Hard (Review Later)
            </button>
            <button 
              onClick={() => { setIsFlipped(false); setActiveCardIndex((i) => (i + 1) % SAMPLE_QUESTIONS.length); }}
              className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >
              Got it! (Mastered)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- PROFILE SCREEN ---------------- //
function ProfileScreen({ onSignOut }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Profile</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Managing your professional identity.</p>
      </div>

      <div className="luxury-glass-card rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1A2238] border border-indigo-500/30 flex items-center justify-center text-slate-300 font-bold text-xl relative">
            <User size={30} />
            <div className="w-5 h-5 rounded-full bg-[#E5B842] text-slate-950 flex items-center justify-center text-[10px] absolute -bottom-0.5 -right-0.5">
              ✏️
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#E5B842] uppercase tracking-wider">LPT CANDIDATE</span>
            <h2 className="text-xl font-bold text-white">Crissian Jill</h2>
            <span className="inline-block bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-md mt-1">
              STATUS: VERIFIED REVIEWER
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-left">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">EXAM DATE</span>
            <span className="text-xs font-bold text-white">SEPT 2026</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">ID NUMBER</span>
            <span className="text-xs font-bold text-white">PJ-2026-8821</span>
          </div>
        </div>
      </div>

      {/* 8-Badge Grid */}
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">ACHIEVEMENTS</div>
      <div className="luxury-glass-card rounded-3xl p-5 shadow-lg">
        <div className="grid grid-cols-4 gap-4 text-center">
          <Badge icon="🚀" label="Starter" active={true} color="bg-blue-500/20 text-blue-400 border-blue-500/40" />
          <Badge icon="🔥" label="Consistent" active={false} color="bg-slate-800 text-slate-600 border-transparent" />
          <Badge icon="🎖" label="Centurion" active={true} color="bg-amber-500/20 text-amber-400 border-amber-500/40" />
          <Badge icon="🎯" label="Accurate" active={true} color="bg-emerald-500/20 text-emerald-400 border-emerald-500/40" />
          <Badge icon="📖" label="Scholar" active={true} color="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40" />
          <Badge icon="📅" label="Dedicated" active={false} color="bg-slate-800 text-slate-600 border-transparent" />
          <Badge icon="💎" label="Elite" active={true} color="bg-cyan-500/20 text-cyan-400 border-cyan-500/40" />
          <Badge icon="🛡" label="LPT Master" active={false} color="bg-slate-800 text-slate-600 border-transparent" />
        </div>
      </div>

      <button 
        onClick={onSignOut}
        className="w-full bg-[#121829] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition mt-4"
      >
        Sign Out Session
      </button>
    </div>
  );
}

function Badge({ icon, label, active, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
    </div>
  );
}

// ---------------- QUIZ & QUESTIONS ENGINE ---------------- //
function QuizScreen({ drillTitle, questions, onExit, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  const currentQ = questions[currentIndex] || SAMPLE_QUESTIONS[0];

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (optionId) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAiInsight(null);
    } else if (onFinish) {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAiInsight(null);
    }
  };

  const handleAskGemini = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setAiInsight("Gemini API key is not configured in .env.local.");
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `As an expert LET reviewer, provide a clear, high-yield rationale and choice breakdown for this question:\nQuestion: "${currentQ.question}"\nOptions: ${JSON.stringify(currentQ.options)}\nCorrect Answer: Choice ${currentQ.correctAnswer}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setAiInsight(response.text);
    } catch (err) {
      setAiInsight("Failed to fetch Gemini insights. Please check your network and API key.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between p-4 pb-8 relative">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-white">
              <X size={22} />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-bold tracking-widest text-[#E5B842] uppercase block">
                QUICK REVIEW
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {drillTitle}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => setBookmarked(!bookmarked)} className="p-2 text-slate-400 hover:text-[#E5B842]">
                <Bookmark size={20} fill={bookmarked ? "#E5B842" : "none"} color={bookmarked ? "#E5B842" : "currentColor"} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white">
                <Info size={20} />
              </button>
            </div>
          </div>

          {/* Progress & Timer */}
          <div className="flex items-center justify-between mt-4 text-xs font-semibold text-slate-400">
            <span>Q{currentIndex + 1} OF {questions.length}</span>
            <span>⏱ {formatTime(seconds)}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#E5B842] h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Category Tag */}
          <div className="flex items-center space-x-2 mt-4 text-xs text-slate-400">
            <span className="truncate max-w-[260px] font-medium text-slate-300">📁 {currentQ.category}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">🟢 {currentQ.difficulty}</span>
          </div>

          {/* Question Text */}
          <div className="luxury-glass-card rounded-2xl p-5 mt-3 shadow-lg">
            <h2 className="text-base font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mt-4">
            {currentQ.options.map(opt => {
              let btnStyle = "luxury-glass-card text-slate-200";
              if (isAnswered) {
                if (opt.id === currentQ.correctAnswer) {
                  btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-300";
                } else if (selectedOption === opt.id) {
                  btnStyle = "bg-rose-950/60 border-rose-500 text-rose-300";
                } else {
                  btnStyle = "luxury-glass-card opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={isAnswered}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 ${btnStyle}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAnswered && opt.id === currentQ.correctAnswer
                        ? "bg-emerald-500 text-slate-950"
                        : isAnswered && selectedOption === opt.id
                        ? "bg-rose-500 text-white"
                        : "bg-[#171E31] text-slate-300"
                    }`}>
                      {opt.id}
                    </span>
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </div>
                  {isAnswered && opt.id === currentQ.correctAnswer && (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  )}
                  {isAnswered && selectedOption === opt.id && opt.id !== currentQ.correctAnswer && (
                    <XCircle size={20} className="text-rose-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanations */}
          {isAnswered && (
            <div className="mt-5 space-y-4">
              <div className="luxury-glass-card border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 size={16} />
                  CORRECT: {currentQ.correctAnswer}
                </div>
                <h4 className="text-white font-bold text-sm mb-2">
                  {currentQ.options.find(o => o.id === currentQ.correctAnswer)?.text}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentQ.rationale}
                </p>

                <button
                  onClick={handleAskGemini}
                  disabled={aiLoading}
                  className="mt-4 w-full bg-[#171E31] hover:bg-[#1E2638] border border-[#E5B842]/30 text-[#E5B842] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  ASK AI FOR DEEPER ANALYSIS
                </button>
              </div>

              {aiInsight && (
                <div className="luxury-glass-card border border-[#E5B842]/40 rounded-2xl p-4 text-xs leading-relaxed text-slate-200">
                  <div className="flex items-center gap-1.5 text-[#E5B842] font-bold mb-2">
                    <Sparkles size={14} /> GEMINI INSIGHT
                  </div>
                  <div className="whitespace-pre-wrap font-sans">{aiInsight}</div>
                </div>
              )}

              {currentQ.memoryTip && (
                <div className="luxury-glass-card border border-[#E5B842]/20 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-[#E5B842] text-base">💡</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5B842] block">
                      MEMORY TIP
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">{currentQ.memoryTip}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Next/Prev */}
        <div className="grid grid-cols-3 gap-3 pt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="col-span-1 luxury-glass-card text-slate-300 disabled:opacity-40 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} /> PREV
          </button>
          <button
            onClick={handleNext}
            className="col-span-2 gold-glow-btn text-slate-950 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1 shadow-lg"
          >
            {currentIndex === questions.length - 1 ? "FINISH DRILL" : "NEXT"} <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}