import React, { useState, useEffect } from 'react';
import { 
  BarChart3, BookOpen, Home, GraduationCap, User, Bell, 
  Sparkles, Flame, Check, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  RotateCcw, Lock, Mail, ArrowRight, ShieldCheck, FileText, Search, Download,
  X, Bookmark, Info, CheckCircle2, XCircle, Loader2, AlertCircle, UserCheck, UserPlus
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { 
  getMistakesVault, 
  recordMistake, 
  markAsMastered, 
  recordSession, 
  getSessionHistory 
} from './utils/vaultStorage';
import { 
  exportErrorNotebookPDF, 
  exportSessionTranscriptPDF 
} from './utils/pdfGenerator';
import {
  authenticateUser,
  registerUser,
  getCurrentUser,
  logoutUser
} from './utils/authStorage';

// DEFAULT QUESTION BANK
const DEFAULT_QUESTIONS = [
  {
    id: "q1",
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
    id: "q2",
    category: "MAJOR SUBJECT - INTEGRATED 1",
    difficulty: "Medium",
    question: "A teacher shall base the evaluation of the learner's work only in:",
    options: [
      { id: "A", text: "Attendance and behavioral compliance" },
      { id: "B", text: "merit and quality of academic performance" },
      { id: "C", text: "Socio-economic background and effort" },
      { id: "D", text: "Personal relationship and class standing" }
    ],
    correctAnswer: "B",
    rationale: "Article VIII, Section 1 of the Code of Ethics for Professional Teachers mandates that evaluation of student work must be based solely on merit and quality of academic performance, free from extraneous factors.",
    memoryTip: "Code of Ethics Art. VIII, Sec. 1: Evaluation must be based solely on merit and quality of academic performance.",
    choiceAnalysis: {
      A: "Incorrect. Behavioral marks are separate.",
      B: "Correct. Mandated by Code of Ethics Art. VIII, Sec. 1.",
      C: "Incorrect. Extraneous factor.",
      D: "Incorrect. Leads to biased evaluation."
    }
  },
  {
    id: "q3",
    category: "SOCIAL SCIENCE - PHILIPPINE HISTORY",
    difficulty: "Hard",
    question: "What power was reserved by the Kingdom of Spain to the Governor-General of the Philippines to reject or set aside measures?",
    options: [
      { id: "A", text: "Indulto de Comercio" },
      { id: "B", text: "Veto Power (Cúmplase)" },
      { id: "C", text: "Patronato Real" },
      { id: "D", text: "Residencia" }
    ],
    correctAnswer: "B",
    rationale: "The Cúmplase was the right of the Governor-General to suspend the operation of a Royal Decree from the King of Spain if found detrimental to the peace or welfare of the colony.",
    memoryTip: "Power to set aside royal decrees (Cúmplase) = VETO POWER.",
    choiceAnalysis: {
      A: "Incorrect. License to engage in commerce.",
      B: "Correct. Cúmplase = Veto power of the Governor-General.",
      C: "Incorrect. Church and state appointment agreement.",
      D: "Incorrect. Special judicial court reviewing conduct."
    }
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeDrill, setActiveDrill] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);

  // Refresh user data & vault
  const refreshAppData = () => {
    setVaultItems(getMistakesVault());
    setHistoryItems(getSessionHistory());
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    refreshAppData();
  }, [activeTab, activeDrill]);

  // Exam Countdown for LET September 2026
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

  if (!currentUser) {
    return (
      <LandingPage 
        onOpenAuth={() => setShowAuthModal(true)} 
        showAuthModal={showAuthModal}
        onCloseAuth={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
        }}
      />
    );
  }

  // Active Quiz View
  if (activeDrill) {
    return (
      <QuizScreen 
        drillTitle={activeDrill.title}
        questions={activeDrill.questions}
        onExit={() => {
          setActiveDrill(null);
          refreshAppData();
        }}
        onFinish={(results) => {
          recordSession({
            title: activeDrill.title,
            score: results.score,
            total: results.total,
            percentage: Math.round((results.score / results.total) * 100),
            durationSecs: results.seconds
          });
          setActiveDrill(null);
          refreshAppData();
          setActiveTab('learn');
        }}
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
              user={currentUser}
              vaultCount={vaultItems.length}
              onStartDrill={(title, qs) => setActiveDrill({ title, questions: qs || DEFAULT_QUESTIONS })}
              onStartBossMode={() => {
                if (vaultItems.length === 0) {
                  alert("Your Mistakes Vault is currently empty! Complete a standard drill first.");
                  return;
                }
                setActiveDrill({ title: "Boss Mode: Mistakes Vault", questions: vaultItems });
              }}
            />
          )}
          {activeTab === 'review' && (
            <ReviewHubScreen 
              vaultCount={vaultItems.length}
              onStartDrill={(title, qs) => setActiveDrill({ title, questions: qs || DEFAULT_QUESTIONS })}
              onStartBossMode={() => {
                if (vaultItems.length === 0) {
                  alert("Your Mistakes Vault is currently empty! Complete a standard drill first.");
                  return;
                }
                setActiveDrill({ title: "Boss Mode: Mistakes Vault", questions: vaultItems });
              }}
            />
          )}
          {activeTab === 'stats' && (
            <AnalyticsScreen 
              history={historyItems}
              vault={vaultItems}
            />
          )}
          {activeTab === 'learn' && (
            <MasteryScreen 
              vault={vaultItems}
              history={historyItems}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen 
              user={currentUser}
              vaultCount={vaultItems.length}
              onSignOut={() => {
                logoutUser();
                setCurrentUser(null);
              }} 
            />
          )}
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

// ---------------- LUXURY LANDING & AUTH GATE (WITH CREATE ACCOUNT) ---------------- //
function LandingPage({ onOpenAuth, showAuthModal, onCloseAuth, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please provide a valid email.');
      return;
    }

    if (isSignUp) {
      const res = registerUser(email, password, name);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg('Account created successfully! Entering portal...');
        setTimeout(() => onSuccess(res.user), 600);
      }
    } else {
      const res = authenticateUser(email, password);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        onSuccess(res.user);
      }
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

        {/* AUTH / SIGN-IN / SIGN-UP MODAL */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="luxury-glass-card border border-[#232F4D] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 relative">
              
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1A2645] to-[#0F172B] border border-[#E5B842]/40 text-[#E5B842] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  PJ
                </div>
                <span className="text-[10px] font-bold text-[#E5B842] tracking-widest uppercase block pt-1">
                  PRC LICENSURE COMPANION
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">Project Jill</h3>
                <p className="text-xs text-slate-400">
                  {isSignUp ? "Create a candidate account to start reviewing." : "Sign in to access candidate drill sets."}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl text-center">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="e.g. Crissian Jill"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#090E1B] border border-[#1E2B4A] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842] transition"
                      />
                    </div>
                  </div>
                )}

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
                  className="w-full gold-glow-btn text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition mt-3"
                >
                  {isSignUp ? (
                    <>Create Account & Enter <UserPlus size={16} /></>
                  ) : (
                    <>Authenticate & Enter <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              {/* TOGGLE: SIGN IN vs CREATE ACCOUNT */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                {isSignUp ? (
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                    className="text-xs text-slate-300 hover:text-[#E5B842] font-semibold transition"
                  >
                    Already have an account? <span className="text-[#E5B842] underline">Sign In</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                    className="text-xs text-slate-300 hover:text-[#E5B842] font-semibold transition"
                  >
                    First time reviewer? <span className="text-[#E5B842] underline">Create Account</span>
                  </button>
                )}
              </div>

              <div className="text-center">
                <button 
                  onClick={onCloseAuth}
                  className="text-xs text-slate-500 hover:text-slate-300"
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
function HomeScreen({ timeLeft, user, vaultCount, onStartDrill, onStartBossMode }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Crissian';

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
          Good Day, <br />{firstName}! 👋
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

      {/* Boss Drill / Mistakes Vault Card */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-lg border border-rose-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            🔥 BOSS DRILL
          </span>
          <span className="text-xs text-slate-400">{vaultCount} Recorded</span>
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Target Your Mistakes Vault</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {vaultCount > 0 
              ? `You have ${vaultCount} missed questions ready for active reinforcement.` 
              : "No missed questions yet. Complete a standard drill to build your vault."}
          </p>
        </div>
        <button
          onClick={onStartBossMode}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition"
        >
          Drill Weak Spots ({vaultCount})
        </button>
      </div>

      {/* Daily Quote */}
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
    </div>
  );
}

// ---------------- REVIEW HUB SCREEN ---------------- //
function ReviewHubScreen({ vaultCount, onStartDrill, onStartBossMode }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Review Hub</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Choose your path to mastery.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onStartDrill("Quick Review: Mixed", DEFAULT_QUESTIONS)}
          className="luxury-glass-card rounded-3xl p-4 text-left space-y-3 shadow-lg hover:border-[#E5B842]/40 transition"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Quick Drill</h4>
            <p className="text-[11px] text-slate-400">Random Mixed</p>
          </div>
        </button>

        <button 
          onClick={onStartBossMode}
          className="luxury-glass-card rounded-3xl p-4 text-left space-y-3 shadow-lg border border-rose-500/20 hover:border-rose-500/40 transition"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">
            🔥
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Boss Mode</h4>
            <p className="text-[11px] text-slate-400">{vaultCount} Weak Spots</p>
          </div>
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <SubjectCard 
          title="General Education - SET A" 
          badge="GEN ED"
          items="250 Items Available"
          onClick={() => onStartDrill("General Education - Set A", DEFAULT_QUESTIONS)}
        />
        <SubjectCard 
          title="Professional Education - SET A" 
          badge="PROF ED"
          items="200 Items Available"
          onClick={() => onStartDrill("Professional Education - Set A", DEFAULT_QUESTIONS)}
        />
        <SubjectCard 
          title="Science Major - SET A" 
          badge="MAJOR"
          items="150 Items Available"
          onClick={() => onStartDrill("Science Major - Set A", DEFAULT_QUESTIONS)}
        />
      </div>
    </div>
  );
}

function SubjectCard({ title, badge, items, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full luxury-glass-card rounded-3xl p-4 flex items-center justify-between text-left shadow-md transition hover:border-[#E5B842]/30"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#1A2238] flex items-center justify-center text-xl">
          📖
        </div>
        <div>
          <span className="text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded uppercase">
            {badge}
          </span>
          <h4 className="font-bold text-white text-sm mt-1">{title}</h4>
          <span className="text-[10px] text-slate-400">{items}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-600" />
    </button>
  );
}

// ---------------- MASTERY / LEARN SCREEN ---------------- //
function MasteryScreen({ vault, history }) {
  const [subTab, setSubTab] = useState('history');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  const displayCards = vault.length > 0 ? vault : DEFAULT_QUESTIONS;
  const filteredNotes = vault.filter(n => 
    n.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {tab} {tab === 'notes' && `(${vault.length})`}
          </button>
        ))}
      </div>

      {/* 1. HISTORY VIEW */}
      {subTab === 'history' && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RECENT SESSIONS</span>
          {history.length === 0 ? (
            <div className="luxury-glass-card rounded-3xl p-6 text-center text-xs text-slate-400">
              No sessions completed yet. Take a drill in Review Hub!
            </div>
          ) : (
            history.map((sess) => (
              <div key={sess.id} className="luxury-glass-card rounded-3xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-amber-400 uppercase block">{sess.rating}</span>
                    <h4 className="font-bold text-white text-sm">{sess.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {sess.score}/{sess.total} • {sess.percentage}% • {Math.round(sess.durationSecs / 60)}m
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. NOTES VIEW */}
      {subTab === 'notes' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search weak spot notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111728] border border-[#1E253D] rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5B842]"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="luxury-glass-card rounded-3xl p-8 text-center text-slate-400 space-y-2">
              <span className="text-2xl">🎉</span>
              <h4 className="font-bold text-white text-sm">No Weak Spots Found</h4>
              <p className="text-xs">Any question you get wrong in drills will automatically appear here with high-yield memory takeaways.</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isExpanded = expandedNoteId === note.id;
              return (
                <div key={note.id} className="luxury-glass-card rounded-2xl overflow-hidden border border-[#1E2740] transition">
                  <div 
                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                        !
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">{note.category}</h4>
                        <span className="text-[10px] text-slate-400">Missed {note.missCount || 1}x</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-800/60 space-y-3 bg-[#0D1222]/80 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">THE QUESTION</span>
                        <p className="italic text-slate-200 font-serif">{note.question}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">CORRECT ANSWER</span>
                        <p className="text-emerald-400 font-bold">{note.options?.find(o => o.id === note.correctAnswer)?.text || note.correctAnswer}</p>
                      </div>
                      {note.memoryTip && (
                        <div className="bg-[#17223D] border border-[#E5B842]/30 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-[#E5B842] uppercase block mb-0.5">MEMORY TIP</span>
                          <p className="text-slate-300">{note.memoryTip}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">KEY TAKEAWAY</span>
                        <p className="text-slate-300 leading-relaxed">{note.rationale}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. ACTIVE FLASHCARDS */}
      {subTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span className="text-[#E5B842] font-bold uppercase tracking-wider">MISTAKES RECALL DECK</span>
            <span>Card {activeCardIndex + 1} of {displayCards.length}</span>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-[360px] cursor-pointer perspective-1000"
          >
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* FRONT */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-6 flex flex-col justify-between items-center text-slate-900 backface-hidden shadow-2xl">
                <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
                  {displayCards[activeCardIndex].category}
                </span>
                <p className="text-base font-bold text-center leading-relaxed font-sans">
                  {displayCards[activeCardIndex].question}
                </p>
                <span className="text-xs text-slate-400 font-medium">Tap card to reveal answer ↺</span>
              </div>

              {/* BACK */}
              <div className="absolute inset-0 w-full h-full bg-[#162B68] rounded-3xl p-6 flex flex-col justify-between items-center text-white rotate-y-180 backface-hidden shadow-2xl">
                <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">CORRECT ANSWER</span>
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-white">
                    {displayCards[activeCardIndex].options?.find(o => o.id === displayCards[activeCardIndex].correctAnswer)?.text || displayCards[activeCardIndex].correctAnswer}
                  </h3>
                  {displayCards[activeCardIndex].memoryTip && (
                    <p className="text-xs bg-white/10 p-3 rounded-xl text-slate-200 border border-white/10 leading-relaxed font-sans">
                      {displayCards[activeCardIndex].memoryTip}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-300/70 font-medium">Tap to flip back ↺</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => {
                setIsFlipped(false);
                setActiveCardIndex((i) => (i + 1) % displayCards.length);
              }}
              className="border border-amber-500/30 bg-amber-500/10 text-amber-400 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >
              Hard (Review Later)
            </button>
            <button 
              onClick={() => {
                markAsMastered(displayCards[activeCardIndex].id);
                setIsFlipped(false);
                setActiveCardIndex((i) => (i + 1) % displayCards.length);
              }}
              className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >
              Got it! (Mastered)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- ANALYTICS SCREEN ---------------- //
function AnalyticsScreen({ history, vault }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Your journey to LPT mastery.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="luxury-glass-card rounded-3xl p-4 space-y-1">
          <span className="text-lg">📖</span>
          <h3 className="text-2xl font-bold text-white">{history.length}</h3>
          <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">DRILLS DONE</p>
        </div>
        <div className="luxury-glass-card rounded-3xl p-4 space-y-1 border border-rose-500/20">
          <span className="text-lg">⚠️</span>
          <h3 className="text-2xl font-bold text-rose-400">{vault.length}</h3>
          <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">WEAK SPOTS</p>
        </div>
      </div>
    </div>
  );
}

// ---------------- PROFILE SCREEN WITH PDF EXPORTS ---------------- //
function ProfileScreen({ user, vaultCount, onSignOut }) {
  const candidateName = user?.name || "Crissian Jill";

  const handleDownloadErrorNotebook = () => {
    const vault = getMistakesVault();
    exportErrorNotebookPDF(vault, candidateName);
  };

  const handleDownloadTranscript = () => {
    const history = getSessionHistory();
    exportSessionTranscriptPDF(history, candidateName);
  };

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
            <h2 className="text-xl font-bold text-white">{candidateName}</h2>
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
            <span className="text-[9px] font-bold text-slate-400 uppercase block">VAULT WEAK SPOTS</span>
            <span className="text-xs font-bold text-rose-400">{vaultCount} Items</span>
          </div>
        </div>
      </div>

      {/* Personal Library & PDF Exports */}
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">PERSONAL LIBRARY & TOOLS</div>
      <div className="space-y-2">
        <button 
          onClick={handleDownloadErrorNotebook}
          className="w-full luxury-glass-card rounded-3xl p-4 flex items-center justify-between text-left shadow-md hover:border-[#E5B842]/40 transition group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-lg">
              <Download size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs group-hover:text-[#E5B842] transition">Download Error Notebook (PDF)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Export formatted study guide with {vaultCount} recorded errors</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-[#E5B842] transition" />
        </button>

        <button 
          onClick={handleDownloadTranscript}
          className="w-full luxury-glass-card rounded-3xl p-4 flex items-center justify-between text-left shadow-md hover:border-[#E5B842]/40 transition group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs group-hover:text-[#E5B842] transition">Export Performance Transcript</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Generate official session & accuracy log table</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-[#E5B842] transition" />
        </button>
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

// ---------------- QUIZ SCREEN ---------------- //
function QuizScreen({ drillTitle, questions, onExit, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  const currentQ = questions[currentIndex] || DEFAULT_QUESTIONS[0];

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

    if (optionId === currentQ.correctAnswer) {
      setScore(s => s + 1);
    } else {
      recordMistake(currentQ);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAiInsight(null);
    } else if (onFinish) {
      onFinish({
        score: selectedOption === currentQ.correctAnswer ? score + 1 : score,
        total: questions.length,
        seconds
      });
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
                DRILL SESSION
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {drillTitle}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => setBookmarked(!bookmarked)} className="p-2 text-slate-400 hover:text-[#E5B842]">
                <Bookmark size={20} fill={bookmarked ? "#E5B842" : "none"} color={bookmarked ? "#E5B842" : "currentColor"} />
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
            <span className="text-emerald-400 font-semibold">🟢 {currentQ.difficulty || 'Easy'}</span>
          </div>

          {/* Question Text */}
          <div className="luxury-glass-card rounded-2xl p-5 mt-3 shadow-lg">
            <h2 className="text-base font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mt-4">
            {currentQ.options?.map(opt => {
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
              {selectedOption !== currentQ.correctAnswer && (
                <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Logged to your Mistakes Vault for Flashcards & Notes.</span>
                </div>
              )}

              <div className="luxury-glass-card border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 size={16} />
                  CORRECT: {currentQ.correctAnswer}
                </div>
                <h4 className="text-white font-bold text-sm mb-2">
                  {currentQ.options?.find(o => o.id === currentQ.correctAnswer)?.text}
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