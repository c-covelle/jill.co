import React, { useState, useEffect } from 'react';
import { 
  BarChart3, BookOpen, Home, GraduationCap, User, Bell, 
  Sparkles, Flame, Check, ChevronRight, RotateCcw, 
  Lock, Mail, ArrowRight, ShieldCheck, FileText
} from 'lucide-react';

// ALLOWLIST: Add the emails allowed to access your trial app
const ALLOWED_EMAILS = [
  'crissian@example.com',
  'jill@example.com',
  'reviewer@projectjill.com',
  'admin@test.com'
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Countdown State
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

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex justify-center selection:bg-[#E5B842]/30 selection:text-[#E5B842]">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between pb-24 relative overflow-x-hidden border-x border-slate-800/40 bg-gradient-to-b from-[#0D1224] via-[#0A0E1A] to-[#070A12]">
        
        {/* TAB CONTENTS */}
        <div className="flex-1 p-5 overflow-y-auto">
          {activeTab === 'home' && <HomeScreen timeLeft={timeLeft} />}
          {activeTab === 'review' && <ReviewHubScreen />}
          {activeTab === 'stats' && <AnalyticsScreen />}
          {activeTab === 'learn' && <MasteryScreen />}
          {activeTab === 'profile' && <ProfileScreen onSignOut={() => setIsAuthenticated(false)} />}
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0D1322]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2.5 z-50">
          <div className="flex justify-around items-center">
            <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-blue-400' : 'text-slate-500'}`}>
              <BarChart3 size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Stats</span>
              {activeTab === 'stats' && <div className="w-1 h-1 bg-blue-400 rounded-full"></div>}
            </button>

            <button onClick={() => setActiveTab('review')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'review' ? 'text-indigo-400' : 'text-slate-500'}`}>
              <BookOpen size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Review</span>
              {activeTab === 'review' && <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>}
            </button>

            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#E5B842]' : 'text-slate-500'}`}>
              <Home size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Home</span>
              {activeTab === 'home' && <div className="w-1 h-1 bg-[#E5B842] rounded-full"></div>}
            </button>

            <button onClick={() => setActiveTab('learn')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'learn' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <GraduationCap size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Learn</span>
              {activeTab === 'learn' && <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>}
            </button>

            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-fuchsia-400' : 'text-slate-500'}`}>
              <User size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Profile</span>
              {activeTab === 'profile' && <div className="w-1 h-1 bg-fuchsia-400 rounded-full"></div>}
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}

// ---------------- LUXURY LANDING PAGE & LOGIN ---------------- //
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
    // Whitelist check
    const isAllowed = ALLOWED_EMAILS.some(e => e.toLowerCase() === email.trim().toLowerCase());
    if (isAllowed || email.trim() === 'demo') {
      onSuccess();
    } else {
      setErrorMsg('Access Restricted. Email is not enrolled in Wave 1 Trial.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080C16] text-white flex justify-center">
      <div className="w-full max-w-md min-h-screen p-6 flex flex-col justify-between space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B2748] to-[#2B3E74] border border-[#E5B842]/40 flex items-center justify-center font-serif font-bold text-[#E5B842] shadow-lg">
              PJ
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm tracking-wider text-white uppercase">Project Jill</h2>
              <span className="text-[9px] text-[#E5B842] font-semibold tracking-widest block uppercase">Engineered by C. Covelle</span>
            </div>
          </div>

          <button 
            onClick={onOpenAuth}
            className="border border-[#E5B842]/50 hover:border-[#E5B842] text-[#E5B842] text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wider uppercase transition bg-[#E5B842]/5"
          >
            Trial Access
          </button>
        </div>

        {/* Feature Cards Showcase */}
        <div className="space-y-3 pt-2">
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
        </div>

        {/* Hero Section */}
        <div className="space-y-4 pt-4">
          <div className="inline-flex items-center gap-1.5 bg-[#17223D] border border-[#E5B842]/30 text-[#E5B842] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles size={12} /> Wave 1 Verified Candidate Access
          </div>

          <h1 className="font-serif text-3xl font-bold text-white leading-tight">
            Master Your Path to LPT: <span className="text-[#E5B842]">Project Jill</span>
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            The definitive digital companion for PRC Licensure candidates.
          </p>

          <div className="bg-[#121829] border border-[#1E263D] rounded-2xl p-4 space-y-1">
            <h4 className="text-xs font-bold text-[#E5B842]">Our Mission:</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              To empower future Filipino educators with smart, resilient, and focused PRC exam preparation.
            </p>
          </div>

          <button 
            onClick={onOpenAuth}
            className="w-full bg-[#E5B842] hover:bg-[#F2C94C] text-slate-950 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 transition"
          >
            Try Project Jill Now <ArrowRight size={16} />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 pb-2 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1 text-slate-400">
            <ShieldCheck size={13} className="text-[#E5B842]" /> Verified Examinees Only • Wave 1 Trial Access
          </p>
          <p>Architected & Built by <span className="text-slate-300 font-semibold">C. Covelle</span> • © 2026 Project Jill</p>
        </div>

        {/* AUTH MODAL */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#111728] border border-[#1E2740] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 relative">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#1B2748] border border-[#E5B842]/40 text-[#E5B842] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  PJ
                </div>
                <span className="text-[10px] font-bold text-[#E5B842] tracking-widest uppercase block pt-2">
                  PRC LICENSURE COMPANION
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">Project Jill</h3>
                <p className="text-xs text-slate-400">Sign in to access candidate drill sets.</p>
              </div>

              {errorMsg && (
                <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewer Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="candidate@example.com (or 'demo')"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B0F1C] border border-[#1E2740] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842]"
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
                      className="w-full bg-[#0B0F1C] border border-[#1E2740] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842]"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#E5B842] hover:bg-[#F2C94C] text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition mt-4"
                >
                  Authenticate & Enter <ArrowRight size={16} />
                </button>
              </form>

              <div className="text-center pt-2">
                <button 
                  onClick={onCloseAuth}
                  className="text-xs text-slate-500 hover:text-slate-400 underline"
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
    <div className="bg-[#111728] border border-[#1C253D] rounded-2xl p-4 flex items-start gap-3.5 shadow-md">
      <div className="w-10 h-10 rounded-xl bg-[#1A233A] flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-[#E5B842] tracking-wider uppercase">{title}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ---------------- HOME SCREEN ---------------- //
function HomeScreen({ timeLeft }) {
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

      {/* Countdown */}
      <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-5 shadow-xl relative overflow-hidden">
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

      {/* Quote */}
      <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-5 relative shadow-lg">
        <span className="text-3xl text-[#E5B842] font-serif block leading-none mb-1">“</span>
        <p className="text-sm italic font-serif text-slate-200 leading-relaxed">
          "The discipline of the mind is the first step toward the transformation of the classroom."
        </p>
        <div className="flex justify-between items-center mt-3 text-xs font-semibold text-[#E5B842]">
          <span>— Project Jill Team</span>
          <RotateCcw size={14} className="text-slate-500 hover:text-[#E5B842] cursor-pointer" />
        </div>
      </div>

      {/* Smart Insight */}
      <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#E5B842] uppercase">
          💡 SMART INSIGHT
        </div>
        <h3 className="font-bold text-base text-white">Targeted Improvement</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your Preboard Science accuracy is at 81%. A focused drill could help boost it.
        </p>
        <button className="w-full bg-[#E5B842] hover:bg-[#F2C94C] text-slate-950 font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition mt-2 shadow-md">
          Reinforce Preboard Science
        </button>
      </div>
    </div>
  );
}

// ---------------- REVIEW HUB SCREEN ---------------- //
function ReviewHubScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Review Hub</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Choose your path to mastery.</p>
      </div>

      {/* Quick Modes */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-[#121829] border border-[#1E263D] rounded-3xl p-4 text-left space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">⚡</div>
          <div>
            <h4 className="font-bold text-white text-base">Quick</h4>
            <p className="text-[11px] text-slate-400">Random</p>
          </div>
        </button>

        <button className="bg-[#121829] border border-[#1E263D] rounded-3xl p-4 text-left space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg">🧠</div>
          <div>
            <h4 className="font-bold text-white text-base">Boss</h4>
            <p className="text-[11px] text-slate-400">Weak Spots</p>
          </div>
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1A2238] flex items-center justify-center text-xl">📖</div>
            <div>
              <h4 className="font-bold text-white text-sm">General Education</h4>
              <span className="text-[10px] text-slate-400">150 Questions</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600" />
        </div>
      </div>
    </div>
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
        <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-4 space-y-2">
          <span className="text-xl">📖</span>
          <h3 className="text-2xl font-bold text-white">2828</h3>
          <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">TOTAL ITEMS</p>
        </div>
        <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-4 space-y-2">
          <span className="text-xl">🎯</span>
          <h3 className="text-2xl font-bold text-white">87%</h3>
          <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">ACCURACY</p>
        </div>
      </div>
    </div>
  );
}

// ---------------- MASTERY SCREEN ---------------- //
function MasteryScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Mastery</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Track and sharpen your knowledge.</p>
      </div>
      <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-6 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
          🗂
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Active Flashcards</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Review your missed questions using active recall.</p>
        </div>
      </div>
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

      <div className="bg-[#121829] border border-[#1E263D] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1A2238] border border-indigo-500/30 flex items-center justify-center text-slate-300 font-bold text-xl">
            <User size={30} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#E5B842] uppercase tracking-wider">LPT CANDIDATE</span>
            <h2 className="text-xl font-bold text-white">Crissian Jill</h2>
            <span className="inline-block bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-md mt-1">
              STATUS: VERIFIED REVIEWER
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={onSignOut}
        className="w-full bg-[#121829] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition"
      >
        Sign Out Session
      </button>
    </div>
  );
}