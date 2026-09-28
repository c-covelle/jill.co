import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, BookOpen, Home, GraduationCap, User, Trophy, Bell, 
  Sparkles, Flame, Check, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  RotateCcw, Lock, Mail, ArrowRight, FileText, Search, Download,
  X, Bookmark, Info, CheckCircle2, XCircle, Loader2, AlertCircle, UserPlus, Share2, Globe2
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
import { supabase } from './lib/supabase.js';
import { recordLeaderboardResult } from './lib/syncService.js';
import LeaderboardScreen from './components/LeaderboardScreen';
import { getSetQuestions } from './data/questionBanks';

// ROTATING MOTIVATIONAL QUOTES
const INSPIRATIONAL_QUOTES = [
  { text: "The discipline of the mind is the first step toward the transformation of the classroom.", author: "Project Jill Team" },
  { text: "Teaching is the greatest act of optimism. Your license is just one exam away.", author: "Colleen Wilcox" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner. Trust your preparation.", author: "Helen Hayes" },
  { text: "Teachers plant seeds that grow forever. Keep pushing for your LPT license.", author: "PRC LET Board" },
  { text: "Believe you can and you're halfway there. Claim that 2026 license!", author: "Theodore Roosevelt" }
];

// COMPLETE QUESTION BANKS
const QUESTION_BANKS = {
  gened_a: [
    {
      id: "ge_a1",
      category: "GENERAL SCIENCE - BIOLOGY",
      difficulty: "Easy",
      question: "Some animals perform services to assist man. Canines serve in war and in peace. Cats safeguard the home from pests. Pigeons can transmit messages. It is possible that these animals are _____.",
      options: [
        { id: "A", text: "Tamed and friendly" },
        { id: "B", text: "Domesticated" },
        { id: "C", text: "Trained and skilled" },
        { id: "D", text: "Wild and feral" }
      ],
      correctAnswer: "B",
      rationale: "Domesticated animals are species adapted over generations to human custody and mutual service.",
      memoryTip: "Animals adapted for human use & service = DOMESTICATED.",
      choiceAnalysis: {
        A: "Incorrect. Tamed is individual behavioral habituation.",
        B: "Correct. Multi-generational adaptation for human benefit is domestication.",
        C: "Incorrect. Trained describes skill acquisition.",
        D: "Incorrect. Wild animals are non-domesticated."
      }
    },
    {
      id: "ge_a2",
      category: "INFORMATION TECHNOLOGY - COMPUTER BASICS",
      difficulty: "Easy",
      question: "Which is considered the primary 'brain' of the computer?",
      options: [
        { id: "A", text: "RAM" },
        { id: "B", text: "CPU" },
        { id: "C", text: "Operating System" },
        { id: "D", text: "Motherboard" }
      ],
      correctAnswer: "B",
      rationale: "The Central Processing Unit (CPU) executes arithmetic, logical, and control instructions.",
      memoryTip: "CPU = Core Brain of computing architecture.",
      choiceAnalysis: {
        A: "Incorrect. Primary temporary storage.",
        B: "Correct. CPU executes instructions.",
        C: "Incorrect. System software interface.",
        D: "Incorrect. Main printed circuit board."
      }
    }
  ],
  gened_b: [
    {
      id: "ge_b1",
      category: "MATHEMATICS - BASIC ALGEBRA",
      difficulty: "Medium",
      question: "What is the value of x in the equation 3x - 7 = 14?",
      options: [
        { id: "A", text: "5" },
        { id: "B", text: "7" },
        { id: "C", text: "8" },
        { id: "D", text: "6" }
      ],
      correctAnswer: "B",
      rationale: "3x = 14 + 7 => 3x = 21 => x = 7.",
      memoryTip: "Isolate variable: Add 7 to both sides, then divide by 3.",
      choiceAnalysis: {
        A: "Incorrect.",
        B: "Correct. 3(7) - 7 = 21 - 7 = 14.",
        C: "Incorrect.",
        D: "Incorrect."
      }
    }
  ],
  gened_c: [
    {
      id: "ge_c1",
      category: "ENGLISH - GRAMMAR & VOCABULARY",
      difficulty: "Medium",
      question: "Neither the teacher nor the students _____ present in the laboratory.",
      options: [
        { id: "A", text: "is" },
        { id: "B", text: "were" },
        { id: "C", text: "was" },
        { id: "D", text: "are being" }
      ],
      correctAnswer: "B",
      rationale: "Rule of proximity: In 'neither... nor' constructions, the verb agrees with the closer subject ('students' -> plural verb 'were').",
      memoryTip: "Neither... Nor = Agree with the CLOSER subject.",
      choiceAnalysis: {
        A: "Incorrect. 'Students' is plural.",
        B: "Correct. Plural past tense verb agreeing with 'students'.",
        C: "Incorrect. Singular verb.",
        D: "Incorrect. Progressive form."
      }
    }
  ],
  profed_a: [
    {
      id: "pe_a1",
      category: "PROFESSIONAL EDUCATION - CODE OF ETHICS",
      difficulty: "Medium",
      question: "A teacher shall base the evaluation of the learner's work only in:",
      options: [
        { id: "A", text: "Attendance and behavioral compliance" },
        { id: "B", text: "Merit and quality of academic performance" },
        { id: "C", text: "Socio-economic background and effort" },
        { id: "D", text: "Personal relationship and class standing" }
      ],
      correctAnswer: "B",
      rationale: "Article VIII, Section 1 of the Code of Ethics states evaluations must be based solely on academic merit.",
      memoryTip: "Code of Ethics Art. VIII: Academic Merit only.",
      choiceAnalysis: {
        A: "Incorrect. Conduct is marked separately.",
        B: "Correct. Explicitly mandated by PRC Code of Ethics.",
        C: "Incorrect. Extraneous bias.",
        D: "Incorrect. Unethical conflict of interest."
      }
    }
  ],
  science_a: [
    {
      id: "sci_a1",
      category: "SCIENCE SPECIALIZATION - EARTH SCIENCE",
      difficulty: "Hard",
      question: "Which boundary is formed when two tectonic plates move past each other horizontally?",
      options: [
        { id: "A", text: "Divergent Boundary" },
        { id: "B", text: "Convergent Boundary" },
        { id: "C", text: "Transform Fault Boundary" },
        { id: "D", text: "Subduction Zone" }
      ],
      correctAnswer: "C",
      rationale: "Transform boundaries feature plates sliding horizontally past each other.",
      memoryTip: "Sliding horizontally = TRANSFORM Fault.",
      choiceAnalysis: {
        A: "Incorrect. Divergent plates move apart.",
        B: "Incorrect. Convergent plates collide.",
        C: "Correct. Sliding motion defines transform faults.",
        D: "Incorrect. One plate sinks beneath another."
      }
    }
  ]
};

// All combined for quick drills
const ALL_DRILL_ITEMS = [
  ...QUESTION_BANKS.gened_a,
  ...QUESTION_BANKS.gened_b,
  ...QUESTION_BANKS.gened_c,
  ...QUESTION_BANKS.profed_a,
  ...QUESTION_BANKS.science_a
];

// 15 Full Sets
const ALL_15_SETS = [
  { id: "gen_a", title: "General Education - SET A", tag: "Gen Ed", tagColor: "text-blue-300 bg-blue-950/80 border-blue-800", setNum: "SET - 1", category: "General Education", folderKey: "general_education", setKey: "Set_A" },
  { id: "gen_b", title: "General Education - SET B", tag: "Gen Ed", tagColor: "text-blue-300 bg-blue-950/80 border-blue-800", setNum: "SET - 2", category: "General Education", folderKey: "general_education", setKey: "Set_B" },
  { id: "gen_c", title: "General Education - SET C", tag: "Gen Ed", tagColor: "text-blue-300 bg-blue-950/80 border-blue-800", setNum: "SET - 3", category: "General Education", folderKey: "general_education", setKey: "Set_C" },
  { id: "gen_d", title: "General Education - SET D", tag: "Gen Ed", tagColor: "text-blue-300 bg-blue-950/80 border-blue-800", setNum: "SET - 4", category: "General Education", folderKey: "general_education", setKey: "Set_D" },
  { id: "gen_e", title: "General Education - SET E", tag: "Gen Ed", tagColor: "text-blue-300 bg-blue-950/80 border-blue-800", setNum: "SET - 5", category: "General Education", folderKey: "general_education", setKey: "Set_E" },
  { id: "prof_a", title: "Professional Education - SET A", tag: "Prof Ed", tagColor: "text-emerald-300 bg-emerald-950/80 border-emerald-800", setNum: "SET - 1", category: "Professional Education", folderKey: "professional_education", setKey: "Set_A" },
  { id: "prof_b", title: "Professional Education - SET B", tag: "Prof Ed", tagColor: "text-emerald-300 bg-emerald-950/80 border-emerald-800", setNum: "SET - 2", category: "Professional Education", folderKey: "professional_education", setKey: "Set_B" },
  { id: "prof_c", title: "Professional Education - SET C", tag: "Prof Ed", tagColor: "text-emerald-300 bg-emerald-950/80 border-emerald-800", setNum: "SET - 3", category: "Professional Education", folderKey: "professional_education", setKey: "Set_C" },
  { id: "prof_d", title: "Professional Education - SET D", tag: "Prof Ed", tagColor: "text-emerald-300 bg-emerald-950/80 border-emerald-800", setNum: "SET - 4", category: "Professional Education", folderKey: "professional_education", setKey: "Set_D" },
  { id: "prof_e", title: "Professional Education - SET E", tag: "Prof Ed", tagColor: "text-emerald-300 bg-emerald-950/80 border-emerald-800", setNum: "SET - 5", category: "Professional Education", folderKey: "professional_education", setKey: "Set_E" },
  { id: "sci_a", title: "Science Major - SET A", tag: "Major", tagColor: "text-amber-300 bg-amber-950/80 border-amber-800", setNum: "SET - 1", category: "Science (Major)", folderKey: "science", setKey: "Set_A" },
  { id: "sci_b", title: "Science Major - SET B", tag: "Major", tagColor: "text-amber-300 bg-amber-950/80 border-amber-800", setNum: "SET - 2", category: "Science (Major)", folderKey: "science", setKey: "Set_B" },
  { id: "sci_c", title: "Science Major - SET C", tag: "Major", tagColor: "text-amber-300 bg-amber-950/80 border-amber-800", setNum: "SET - 3", category: "Science (Major)", folderKey: "science", setKey: "Set_C" },
  { id: "sci_d", title: "Science Major - SET D", tag: "Major", tagColor: "text-amber-300 bg-amber-950/80 border-amber-800", setNum: "SET - 4", category: "Science (Major)", folderKey: "science", setKey: "Set_D" },
  { id: "sci_e", title: "Science Major - SET E", tag: "Major", tagColor: "text-amber-300 bg-amber-950/80 border-amber-800", setNum: "SET - 5", category: "Science (Major)", folderKey: "science", setKey: "Set_E" }
].map(set => ({
  ...set,
  questions: getSetQuestions(set.folderKey, set.setKey)
})).map(set => ({
  ...set,
  count: `${set.questions.length} Items Available`
}));

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeDrill, setActiveDrill] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const authActionInProgress = useRef(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length));

  const refreshAppData = () => {
    setVaultItems(getMistakesVault());
    setHistoryItems(getSessionHistory());
  };

  useEffect(() => {
    refreshAppData();
  }, [activeTab, activeDrill]);

  useEffect(() => {
    let isMounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted || authActionInProgress.current) return;
      const authUser = session?.user;
      setCurrentUser(authUser ? {
        ...authUser,
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Candidate'
      } : null);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted || authActionInProgress.current) return;
      if (error) console.error('Unable to restore Supabase session:', error.message);
      const authUser = session?.user;
      setCurrentUser(authUser ? {
        ...authUser,
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Candidate'
      } : null);
      setAuthLoading(false);
    }).catch((error) => {
      if (!isMounted) return;
      console.error('Unable to restore Supabase session:', error);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Exact Countdown to 12:00 AM (Midnight) of September 20, 2026 PST
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 12:00 AM on September 20, 2026 Philippine Standard Time (UTC+8)
    const targetDate = new Date('2026-09-20T00:00:00+08:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) {
    return <div className="min-h-screen bg-[#090A0F] text-slate-300 flex items-center justify-center text-sm">Restoring your session...</div>;
  }

  if (!currentUser) {
    return (
      <LandingPage 
        onOpenAuth={() => setShowAuthModal(true)} 
        showAuthModal={showAuthModal}
        onCloseAuth={() => setShowAuthModal(false)}
        onAuthProcessing={(processing) => { authActionInProgress.current = processing; }}
        onSuccess={(user) => {
          setCurrentUser(user);
          setQuoteIndex(Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length));
          setShowAuthModal(false);
        }}
      />
    );
  }

  // Active Drill Mode
  if (activeDrill) {
    return (
      <QuizScreen 
        drillTitle={activeDrill.title}
        questions={activeDrill.questions}
        onExit={() => {
          setActiveDrill(null);
          refreshAppData();
        }}
        onFinish={async (results) => {
          recordSession({
            title: activeDrill.title,
            score: results.score,
            total: results.total,
            percentage: Math.round((results.score / results.total) * 100),
            durationSecs: results.seconds
          });

          try {
            await recordLeaderboardResult({
              score: results.score,
              totalQuestions: results.total
            });
          } catch (error) {
            console.error('Failed to record leaderboard score:', error);
            alert(`Your quiz was saved on this device, but your ranking could not be updated. ${error.message || 'Please try again later.'}`);
          }

          setActiveDrill(null);
          refreshAppData();
          setActiveTab('stats');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex justify-center selection:bg-cyan-400/30 selection:text-cyan-100">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between pb-24 relative overflow-x-hidden border-x border-white/5 bg-[#090A0F]/80">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        
        {/* VIEW BODY */}
        <main className="flex-1 p-5 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeScreen 
              timeLeft={timeLeft} 
              user={currentUser}
              vaultCount={vaultItems.length}
              quote={INSPIRATIONAL_QUOTES[quoteIndex]}
              onRotateQuote={() => setQuoteIndex((quoteIndex + 1) % INSPIRATIONAL_QUOTES.length)}
              onStartDrill={(title, qs) => setActiveDrill({ title, questions: qs || ALL_DRILL_ITEMS })}
              onStartBossMode={() => {
                if (vaultItems.length === 0) {
                  alert("Your Mistakes Vault is clean! Complete a drill to log any weak spots.");
                  return;
                }
                setActiveDrill({ title: "Boss Mode: Mistakes Vault", questions: vaultItems });
              }}
            />
          )}
          {activeTab === 'review' && (
            <ReviewHubScreen 
              vaultCount={vaultItems.length}
              onStartDrill={(title, qs) => setActiveDrill({ title, questions: qs || ALL_DRILL_ITEMS })}
              onStartBossMode={() => {
                if (vaultItems.length === 0) {
                  alert("Your Mistakes Vault is clean! Complete a drill to log any weak spots.");
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
          {activeTab === 'rankings' && <LeaderboardScreen currentUser={currentUser} />}
          {activeTab === 'profile' && (
            <ProfileScreen 
              user={currentUser}
              vaultCount={vaultItems.length}
              onSignOut={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) alert(`Unable to log out: ${error.message}`);
                else {
                  setActiveTab('home');
                  setShowAuthModal(false);
                }
              }}
            />
          )}
        </main>

        {/* BOTTOM NAVIGATION TABS */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#090A0F]/85 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 z-50">
          <div className="flex justify-around items-center">
            
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-[#E5B842]' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <BarChart3 size={22} className={activeTab === 'stats' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Stats</span>
              {activeTab === 'stats' && <div className="w-1 h-1 bg-[#E5B842] rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('review')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'review' ? 'text-[#E5B842]' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <BookOpen size={22} className={activeTab === 'review' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Review</span>
              {activeTab === 'review' && <div className="w-1 h-1 bg-[#E5B842] rounded-full" />}
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
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'learn' ? 'text-[#E5B842]' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <GraduationCap size={22} className={activeTab === 'learn' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Learn</span>
              {activeTab === 'learn' && <div className="w-1 h-1 bg-[#E5B842] rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('rankings')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'rankings' ? 'text-[#E5B842]' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <Trophy size={22} className={activeTab === 'rankings' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Ranks</span>
              {activeTab === 'rankings' && <div className="w-1 h-1 bg-[#E5B842] rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-[#E5B842]' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <User size={22} className={activeTab === 'profile' ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold tracking-wide">Profile</span>
              {activeTab === 'profile' && <div className="w-1 h-1 bg-[#E5B842] rounded-full" />}
            </button>

          </div>
        </nav>

      </div>
    </div>
  );
}

// ---------------- HOME SCREEN ---------------- //
function HomeScreen({ timeLeft, user, vaultCount, quote, onRotateQuote, onStartBossMode }) {
  const displayName = user?.name || "Candidate";

  return (
    <div className="space-y-4">
      <div className="pt-2">
        <h2 className="font-serif text-3xl font-bold text-white leading-tight">
          Good Day, <br /><span className="text-[#E5B842]">{displayName}!</span> 👋
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Let's make today another step toward your license.
        </p>
      </div>

      {/* Countdown Card */}
      <div className="luxury-glass-card rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-1.5 text-[#E5B842] text-[11px] font-bold tracking-wider mb-4 uppercase">
          <Sparkles size={14} /> LET SEPTEMBER 20, 2026
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

      {/* Rotating Daily Quote Card */}
      <div className="luxury-glass-card rounded-3xl p-5 relative shadow-lg">
        <span className="text-3xl text-[#E5B842] font-serif block leading-none mb-1">“</span>
        <p className="text-sm italic font-serif text-slate-200 leading-relaxed min-h-[48px] flex items-center">
          "{quote.text}"
        </p>
        <div className="flex justify-between items-center mt-3 text-xs font-semibold text-[#E5B842]">
          <span>— {quote.author}</span>
          <button 
            onClick={onRotateQuote} 
            title="Next Quote"
            className="text-slate-500 hover:text-[#E5B842] p-1 transition cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
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
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
        >
          Drill Weak Spots ({vaultCount})
        </button>
      </div>
    </div>
  );
}

// ---------------- REVIEW HUB SCREEN ---------------- //
function ReviewHubScreen({ vaultCount, onStartDrill, onStartBossMode }) {
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredSets = filterCategory === 'All' 
    ? ALL_15_SETS 
    : ALL_15_SETS.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Review Hub</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">15 Complete Question Banks Available (Sets A to E)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onStartDrill("Quick Drill: 50 Mixed", ALL_DRILL_ITEMS)}
          className="luxury-glass-card rounded-3xl p-4 text-left space-y-3 shadow-lg hover:border-[#E5B842]/40 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Quick Drill</h4>
            <p className="text-[11px] text-slate-400">50 Random Mixed</p>
          </div>
        </button>

        <button 
          onClick={onStartBossMode}
          className="luxury-glass-card rounded-3xl p-4 text-left space-y-3 shadow-lg border border-rose-500/20 hover:border-rose-500/40 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">
            🔥
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Boss Mode</h4>
            <p className="text-[11px] text-slate-400">{vaultCount} Recorded</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'General Education', 'Professional Education', 'Science (Major)'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              filterCategory === cat 
                ? 'bg-[#E5B842] text-slate-950 shadow-md' 
                : 'bg-[#121829] text-slate-400 border border-[#1C253D] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3 pt-1">
        {filteredSets.map(set => (
          <button 
            key={set.id}
            onClick={() => onStartDrill(set.title, set.questions)}
            className="w-full luxury-glass-card rounded-3xl p-4 flex items-center justify-between text-left shadow-md transition hover:border-[#E5B842]/40 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#1A2238] flex items-center justify-center text-xl">
                📖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold border px-2 py-0.5 rounded uppercase ${set.tagColor}`}>
                    {set.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{set.setNum}</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-1">{set.title}</h4>
                <span className="text-[10px] text-slate-400">{set.count}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------- USER-SPECIFIC REAL-TIME ANALYTICS ---------------- //
function AnalyticsScreen({ history, vault }) {
  const totalItemsAttempted = history.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalCorrect = history.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const overallAccuracy = totalItemsAttempted > 0 ? Math.round((totalCorrect / totalItemsAttempted) * 100) : 0;
  const totalStudyMinutes = history.reduce((acc, curr) => acc + Math.round((curr.durationSecs || 0) / 60), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Real-time personalized mastery assessment.</p>
      </div>

      {/* 4 Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="luxury-glass-card rounded-3xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm">
            📖
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{totalItemsAttempted}</h3>
            <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">ITEMS ANSWERED</p>
          </div>
        </div>

        <div className="luxury-glass-card rounded-3xl p-4 space-y-2 border border-rose-500/20">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">
            ⚠️
          </div>
          <div>
            <h3 className="text-2xl font-bold text-rose-400">{vault.length}</h3>
            <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">WEAK SPOTS</p>
          </div>
        </div>

        <div className="luxury-glass-card rounded-3xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm">
            ⏱
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{history.length}</h3>
            <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">DRILLS DONE</p>
          </div>
        </div>

        <div className="luxury-glass-card rounded-3xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
            🎯
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{overallAccuracy}%</h3>
            <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">ACCURACY</p>
          </div>
        </div>
      </div>

      {/* Session Breakdown */}
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">SESSION LOGS</div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="luxury-glass-card rounded-2xl p-3">
          <span className="text-lg font-bold text-blue-400 block">{history.length}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">SESSIONS</span>
        </div>
        <div className="luxury-glass-card rounded-2xl p-3">
          <span className="text-lg font-bold text-amber-400 block">{totalStudyMinutes}m</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">STUDY TIME</span>
        </div>
        <div className="luxury-glass-card rounded-2xl p-3">
          <span className="text-lg font-bold text-fuchsia-400 block">{vault.length}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">VAULT ITEMS</span>
        </div>
      </div>

      {/* Domain Mastery Bar */}
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">YOUR DOMAIN MASTERY</div>
      <div className="space-y-2">
        <div className="luxury-glass-card rounded-2xl p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-white">Overall Drill Performance</span>
            <span className="text-[#E5B842]">{overallAccuracy}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-[#E5B842]" style={{ width: `${overallAccuracy}%` }} />
          </div>
        </div>
      </div>

      {/* Recorded Missed Topics */}
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pt-2">YOUR CRITICAL WEAK SPOTS</div>
      <div className="luxury-glass-card rounded-3xl p-4 divide-y divide-slate-800/60 shadow-lg">
        {vault.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3">No mistakes recorded yet! Clean slate for this candidate.</p>
        ) : (
          vault.slice(0, 5).map((v, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-rose-400 text-xs">⚠️</span>
                <div>
                  <h5 className="text-xs font-bold text-white">{v.category}</h5>
                  <span className="text-[10px] text-slate-400">Missed {v.missCount || 1} times</span>
                </div>
              </div>
              <span className="text-[#E5B842] text-xs">⚡</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- MASTERY SCREEN (WITH FULL OPTION TEXT IN 3D FLASHCARDS) ---------------- //
function MasteryScreen({ vault, history }) {
  const [subTab, setSubTab] = useState('cards');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  const displayCards = vault.length > 0 ? vault : ALL_DRILL_ITEMS;
  const currentCard = displayCards[activeCardIndex] || displayCards[0];
  
  // Extract full option text
  const correctOptionObject = currentCard.options?.find(o => o.id === currentCard.correctAnswer);
  const correctOptionFullText = correctOptionObject 
    ? `${correctOptionObject.id}. ${correctOptionObject.text}` 
    : currentCard.correctAnswer;

  const filteredNotes = vault.filter(n => 
    n.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Learning Center</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">Mastery flashcards, personal study notes, error tracking, and drill history.</p>
      </div>

      {/* 4 Tabs */}
      <div className="grid grid-cols-4 gap-1.5 luxury-glass-card p-1.5 rounded-2xl shadow-md text-center">
        {[
          { id: 'cards', label: 'Flashcards' },
          { id: 'mistakes', label: `Mistakes (${vault.length})` },
          { id: 'notes', label: `Notes (${vault.length})` },
          { id: 'history', label: 'History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              subTab === tab.id 
                ? 'bg-[#E5B842] text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FLASHCARDS (FULL OPTION TEXT + FLIP FIX) */}
      {subTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span className="text-[#E5B842] font-bold uppercase tracking-wider">ACTIVE RECALL</span>
            <span>Card {activeCardIndex + 1} of {displayCards.length}</span>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
            className="w-full h-[370px] cursor-pointer select-none"
          >
            <div 
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="relative w-full h-full"
            >
              {/* FRONT FACE (QUESTION) */}
              <div 
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                className="luxury-glass-card absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between items-center text-white shadow-2xl"
              >
                <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase text-center">
                  {currentCard.category}
                </span>
                <p className="text-base font-bold text-center leading-relaxed text-slate-100 px-2 font-sans">
                  {currentCard.question}
                </p>
                <span className="text-xs text-slate-400 font-medium">Tap card to reveal full answer ↺</span>
              </div>

              {/* BACK FACE (FULL CORRECT ANSWER + MEMORY TIP) */}
              <div 
                style={{ 
                  backfaceVisibility: 'hidden', 
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
                className="luxury-glass-card absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between items-center text-white shadow-2xl"
              >
                <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  CORRECT ANSWER
                </span>
                
                <div className="text-center space-y-3 px-2 w-full">
                  <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                      VERIFIED CHOICE
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {correctOptionFullText}
                    </h3>
                  </div>

                  {currentCard.memoryTip && (
                    <div className="bg-white/10 p-3 rounded-xl text-slate-200 border border-white/10 text-xs leading-relaxed text-left">
                      <span className="font-bold text-[#E5B842] block mb-0.5">💡 MEMORY TIP</span>
                      {currentCard.memoryTip}
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-300/70 font-medium">Tap to view question ↺</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => {
                setIsFlipped(false);
                setActiveCardIndex((i) => (i + 1) % displayCards.length);
              }}
              className="border border-amber-500/30 bg-amber-500/10 text-amber-400 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-amber-500/20 transition"
            >
              Hard (Review Later)
            </button>
            <button 
              onClick={() => {
                markAsMastered(currentCard.id);
                setIsFlipped(false);
                setActiveCardIndex((i) => (i + 1) % displayCards.length);
              }}
              className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-emerald-500/20 transition"
            >
              Got it! (Mastered)
            </button>
          </div>
        </div>
      )}

      {/* NOTES */}
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
              const noteCorrectText = note.options?.find(o => o.id === note.correctAnswer)?.text || note.correctAnswer;

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
                        <p className="text-emerald-400 font-bold">Choice {note.correctAnswer}: {noteCorrectText}</p>
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

      {/* MISTAKES & HISTORY */}
      {(subTab === 'history' || subTab === 'mistakes') && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {subTab === 'history' ? 'RECORDED SESSIONS' : 'RECORDED MISTAKES VAULT'}
          </span>
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
    </div>
  );
}

// ---------------- PROFILE SCREEN ---------------- //
function ProfileScreen({ user, vaultCount, onSignOut }) {
  const candidateName = user?.name || "Candidate";
  const userInitials = candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LPT';

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
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1E2742] to-[#2E3C66] border border-[#E5B842]/40 flex items-center justify-center text-[#E5B842] font-serif font-bold text-xl relative shadow-lg">
            {userInitials}
            <div className="w-5 h-5 rounded-full bg-[#E5B842] text-slate-950 flex items-center justify-center text-[10px] absolute -bottom-0.5 -right-0.5 font-sans font-bold">
              ✓
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
            <span className="text-xs font-bold text-white">SEPT 20, 2026</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">VAULT WEAK SPOTS</span>
            <span className="text-xs font-bold text-rose-400">{vaultCount} Items</span>
          </div>
        </div>
      </div>

      {/* PDF Downloads */}
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

      <div className="luxury-glass-card rounded-3xl p-5 space-y-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[#E5B842] uppercase">CONTACT PROJECT JILL</span>
          <p className="text-[11px] text-slate-400 mt-1">Official support and project channels.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <a
            href="mailto:projectjill.support@gmail.com"
            className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#0D1322]/70 px-3 py-3 text-[10px] font-bold text-slate-300 transition hover:border-[#E5B842]/50 hover:text-[#E5B842]"
          >
            <Mail size={15} className="text-[#E5B842]" /> Email
          </a>
          <a
            href="https://facebook.com/project.jill"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#0D1322]/70 px-3 py-3 text-[10px] font-bold text-slate-300 transition hover:border-[#E5B842]/50 hover:text-[#E5B842]"
          >
            <Share2 size={15} className="text-[#E5B842]" /> Facebook
          </a>
          <a
            href="https://project-jill-web.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#0D1322]/70 px-3 py-3 text-[10px] font-bold text-slate-300 transition hover:border-[#E5B842]/50 hover:text-[#E5B842]"
          >
            <Globe2 size={15} className="text-[#E5B842]" /> Web
          </a>
        </div>
      </div>

      <button 
        onClick={onSignOut}
        className="w-full bg-[#121829] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition mt-4 cursor-pointer"
      >
        Log Out
      </button>
    </div>
  );
}

// ---------------- QUIZ ENGINE ---------------- //
function QuizScreen({ drillTitle, questions, onExit, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  const currentQ = questions[currentIndex] || ALL_DRILL_ITEMS[0];

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
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-white cursor-pointer">
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
              <button onClick={() => setBookmarked(!bookmarked)} className="p-2 text-slate-400 hover:text-[#E5B842] cursor-pointer">
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
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${btnStyle}`}
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

                {currentQ.choiceAnalysis && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="text-[#E5B842] font-bold text-[10px] uppercase tracking-wider mb-3">
                      WHY EACH CHOICE
                    </div>
                    <div className="space-y-3">
                      {currentQ.options?.map(option => (
                        <div key={option.id} className="flex gap-2 text-xs leading-relaxed">
                          <span className={`font-bold shrink-0 ${option.id === currentQ.correctAnswer ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {option.id}.
                          </span>
                          <p className="text-slate-300">
                            {currentQ.choiceAnalysis[option.id] || 'No explanation provided for this choice.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAskGemini}
                  disabled={aiLoading}
                  className="mt-4 w-full bg-[#171E31] hover:bg-[#1E2638] border border-[#E5B842]/30 text-[#E5B842] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
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
            className="col-span-1 luxury-glass-card text-slate-300 disabled:opacity-40 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={16} /> PREV
          </button>
          <button
            onClick={handleNext}
            className="col-span-2 gold-glow-btn text-slate-950 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1 shadow-lg cursor-pointer"
          >
            {currentIndex === questions.length - 1 ? "FINISH DRILL" : "NEXT"} <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ---------------- LANDING & SUPABASE AUTH GATEWAY ---------------- //
function LandingPage({ onOpenAuth, showAuthModal, onCloseAuth, onAuthProcessing, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedPreviewOption, setSelectedPreviewOption] = useState('Formal Operational');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const openAuth = (signUp) => {
    setIsSignUp(signUp);
    setErrorMsg('');
    setSuccessMsg('');
    onOpenAuth();
  };

  const ensureCandidateProfile = async (authUser, profileName) => {
    const normalizedEmail = authUser.email?.trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Supabase did not return an account email.');

    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (profile) return;

    const nameForProfile = profileName || authUser.user_metadata?.full_name || normalizedEmail.split('@')[0];
    const avatar = nameForProfile.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    const { error: insertError } = await supabase.from('profiles').insert({
      id: authUser.id,
      email: normalizedEmail,
      name: nameForProfile,
      avatar,
      xp: 0,
      accuracy: 0
    });
    if (insertError) throw insertError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    if (isSignUp && !trimmedName) {
      setErrorMsg('Please provide your full name.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    onAuthProcessing(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { full_name: trimmedName } }
        });
        if (error) throw error;
        if (!data.user) throw new Error('Supabase did not return a user for this account.');

        const profileName = trimmedName;
        const avatar = profileName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: trimmedEmail,
          name: profileName,
          avatar,
          xp: 0,
          accuracy: 0
        });

        if (profileError) {
          console.error('Account created but profile setup failed:', profileError);
          if (data.session) await supabase.auth.signOut();
          if (!data.session) {
            setSuccessMsg('Account created. Confirm your email, then sign in; your candidate profile will be created at sign-in.');
            setIsSignUp(false);
            setPassword('');
            return;
          }
          throw new Error(`Your account was created, but the candidate profile could not be saved. ${profileError.message}`);
        }

        if (data.session) {
          onSuccess({
            ...data.user,
            name: profileName
          });
        } else {
          setSuccessMsg('Account created. Check your email to confirm it, then sign in.');
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });
        if (error) throw error;
        if (!data.user) throw new Error('Supabase did not return a user for this account.');
        await ensureCandidateProfile(data.user);
        onSuccess({
          ...data.user,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Candidate'
        });
      }
    } catch (error) {
      setErrorMsg(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      onAuthProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex justify-center relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <div className="w-full max-w-6xl min-h-[calc(100vh-3rem)] flex flex-col relative z-10">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <img src="/project-jill-logo.svg" alt="Project Jill" className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_0_14px_rgba(6,182,212,0.25)]" />
            <div>
              <h2 className="font-mono font-bold text-sm tracking-wider text-white uppercase">Project Jill</h2>
              <span className="text-[9px] text-cyan-300 font-semibold tracking-widest block uppercase">
                Engineered by C. Covelle
              </span>
            </div>
          </div>

          <button
            onClick={() => openAuth(false)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:border-cyan-300/50 hover:text-cyan-100 cursor-pointer"
          >
            Sign In
          </button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-100 shadow-[0_0_24px_rgba(6,182,212,0.1)] backdrop-blur-md">
            <Sparkles size={14} className="text-cyan-300" />
            <span>🔥 Join future LPTs prepping for the March 2027 exam</span>
          </div>

          <h1 className="mt-7 max-w-4xl font-mono text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Master the Board. One High-Yield Question at a Time.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Master high-yield competencies with instant rationalizations and live leaderboard ranks. Your intelligent prep system for the March 2027 Licensure Examination for Teachers.
          </p>

          <button
            onClick={() => openAuth(true)}
            className="gold-glow-btn mt-8 inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-300/30 cursor-pointer"
          >
            Get Started — It's Free <ArrowRight size={17} className="ml-2" />
          </button>

          <button
            onClick={() => openAuth(false)}
            className="mt-4 text-sm font-medium text-slate-400 transition hover:text-cyan-100 cursor-pointer"
          >
            Already have an account? <span className="font-semibold text-cyan-300 underline decoration-cyan-400 underline-offset-4">Sign in</span>
          </button>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {['🎯 Smart Drills', '⚡ Instant Scoring', '🏆 Live Leaderboard'].map((feature) => (
              <span key={feature} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md">
                {feature}
              </span>
            ))}
          </div>

          <section className="relative mx-auto mt-12 w-full max-w-5xl px-4 text-left perspective-[1200px]" aria-label="Interactive candidate dashboard preview">
            <div aria-hidden="true" className="absolute -z-10 -top-10 left-1/2 h-64 w-3/4 -translate-x-1/2 bg-gradient-to-r from-violet-600/30 via-cyan-500/30 to-blue-600/30 blur-3xl" />
            <div className="relative rounded-3xl border border-cyan-500/20 bg-slate-900/60 p-4 shadow-[0_0_50px_rgba(6,182,212,0.15)] ring-1 ring-white/10 backdrop-blur-2xl before:absolute before:-inset-1 before:-z-10 before:rounded-3xl before:bg-gradient-to-r before:from-cyan-500/20 before:via-violet-500/20 before:to-fuchsia-500/20 before:blur-2xl before:content-[''] transform md:-rotate-x-2 md:rotate-1 hover:rotate-0 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_0_70px_rgba(6,182,212,0.25)] transition-all duration-700 ease-out sm:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-cyan-300">CANDIDATE WORKSPACE</p>
                  <h2 className="mt-1 font-mono text-base font-semibold text-white sm:text-lg">Your next session, in focus</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[9px] tracking-wider text-slate-400">DASHBOARD PREVIEW</span>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <article className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 backdrop-blur-xl sm:p-5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                    </span>
                    <h3 className="font-mono text-[10px] font-semibold tracking-widest text-cyan-200">LIVE DRILL SESSION</h3>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">GenEd <span className="text-cyan-500">•</span> Professional Education</p>
                  <p className="mt-5 text-sm font-semibold leading-relaxed text-slate-100">
                    According to Piaget, at which stage does abstract hypothetical-deductive reasoning develop?
                  </p>
                  <div className="mt-4 space-y-2">
                    {[
                      { label: 'Sensorimotor', accuracy: '' },
                      { label: 'Preoperational', accuracy: '' },
                      { label: 'Concrete', accuracy: '' },
                      { label: 'Formal Operational', accuracy: '94% accuracy' }
                    ].map((option) => {
                      const isSelected = selectedPreviewOption === option.label;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedPreviewOption(option.label)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[11px] transition ${isSelected ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/30 hover:bg-white/[0.06]'}`}
                        >
                          <span>{option.label}{option.accuracy ? ' ✨' : ''}</span>
                          {option.accuracy && <span className="shrink-0 font-mono text-[9px] text-cyan-300">{option.accuracy}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-xl border border-violet-300/20 bg-violet-400/[0.06] px-3 py-2.5 text-[10px] leading-relaxed text-violet-100">
                    💡 Instant Rationalization &amp; Memory Peg Available
                  </div>
                </article>

                <article className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 backdrop-blur-xl sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-mono text-[10px] font-semibold tracking-widest text-slate-200">COMPETENCY RADAR</h3>
                    <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                  </div>
                  <div className="my-5 flex justify-center">
                    <div className="h-36 w-36 rounded-full p-[3px] shadow-[0_0_24px_rgba(6,182,212,0.18)]" style={{ background: 'conic-gradient(#22d3ee 0deg 318deg, rgba(255,255,255,0.08) 318deg 360deg)' }}>
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-cyan-300/10 bg-[#0B101A]">
                        <span className="font-mono text-2xl font-semibold text-white">88.4%</span>
                        <span className="mt-1 text-[9px] uppercase tracking-widest text-cyan-200">Accuracy</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'GenEd', score: 92, color: 'bg-cyan-400' },
                      { label: 'ProfEd', score: 86, color: 'bg-violet-400' },
                      { label: 'Specialization', score: 87, color: 'bg-emerald-400' }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span className="text-slate-300">{item.label}</span>
                          <span className="font-mono text-slate-100">{item.score}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 px-2 py-2 text-center text-[10px] text-cyan-100"><Flame size={12} className="mr-1 inline text-cyan-300" />14-Day Study Streak</span>
                    <span className="rounded-lg border border-violet-300/20 bg-violet-300/5 px-2 py-2 text-center text-[10px] text-violet-100">Level 8 Mentor</span>
                  </div>
                </article>

                <article className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 backdrop-blur-xl sm:p-5">
                  <div className="flex items-center gap-2">
                    <Trophy size={15} className="text-cyan-300 drop-shadow-[0_0_7px_rgba(6,182,212,0.6)]" />
                    <h3 className="font-mono text-[10px] font-semibold tracking-widest text-slate-200">TOP REVIEWERS TODAY</h3>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { rank: '🥇 #1', name: 'Maria Santos', xp: '4,280 XP', color: 'dashboard-top-reviewer border-amber-500/30 bg-amber-500/5 shadow-[0_0_18px_rgba(245,158,11,0.08)]' },
                      { rank: '🥈 #2', name: 'Kevin Cruz', xp: '3,950 XP', color: 'border-violet-300/25 bg-violet-300/[0.05]' },
                      { rank: '🥉 #3', name: 'Jill C.', xp: '3,820 XP', color: 'border-emerald-300/20 bg-emerald-300/[0.04]' }
                    ].map((reviewer) => (
                      <div key={reviewer.rank} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 ${reviewer.color}`}>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="shrink-0 font-mono text-[10px] font-semibold text-cyan-200">{reviewer.rank}</span>
                          <span className="truncate text-xs font-medium text-slate-100">{reviewer.name}</span>
                        </div>
                        <span className="shrink-0 rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 font-mono text-[9px] text-cyan-200">{reviewer.xp}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 border-t border-white/10 pt-3 text-center text-[9px] text-slate-500">Updated live via Supabase sync</p>
                </article>
              </div>
            </div>
          </section>
        </main>

        <footer className="pt-5 pb-2 text-center text-[10px] text-slate-500">
          <p>Built by <span className="font-semibold text-slate-300">C. Covelle</span> · © 2026 Project Jill</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-[10px]">
            <a href="mailto:projectjill.support@gmail.com" className="inline-flex items-center gap-1.5 transition hover:text-cyan-200">
              <Mail size={12} className="text-cyan-400" /> projectjill.support@gmail.com
            </a>
            <a href="https://facebook.com/project.jill" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-cyan-200">
              <Share2 size={12} className="text-cyan-400" /> Facebook
            </a>
            <a href="https://project-jill-web.vercel.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-cyan-200">
              <Globe2 size={12} className="text-cyan-400" /> project-jill-web.vercel.app
            </a>
          </div>
        </footer>

        {/* MODAL */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="luxury-glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 relative">
              
              <div className="text-center space-y-1">
                <img src="/project-jill-logo.svg" alt="Project Jill" className="mx-auto h-14 w-14 object-contain drop-shadow-[0_0_16px_rgba(6,182,212,0.25)]" />
                <span className="text-[10px] font-bold text-cyan-300 tracking-widest uppercase block pt-1">
                  YOUR LET REVIEW COMPANION
                </span>
                <h3 className="font-mono text-xl font-semibold text-white">Project Jill</h3>
                <p className="text-xs text-slate-400">
                  {isSignUp ? "Create your candidate account." : "Sign in to access your candidate drill sets."}
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
                {isSignUp && <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="e.g. Maria Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="w-full bg-[#090E1B] border border-[#1E2B4A] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842] transition"
                    />
                  </div>
                </div>}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewer Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="candidate@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full bg-[#090E1B] border border-[#1E2B4A] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      className="w-full bg-[#090E1B] border border-[#1E2B4A] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E5B842] transition"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gold-glow-btn text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition mt-3 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isSignUp ? (
                    <>Create Account <UserPlus size={16} /></>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-800/80">
                {isSignUp ? (
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                    className="text-xs text-slate-300 hover:text-[#E5B842] font-semibold transition cursor-pointer"
                  >
                    Already registered? <span className="text-[#E5B842] underline">Sign In</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                    className="text-xs text-slate-300 hover:text-[#E5B842] font-semibold transition cursor-pointer"
                  >
                    First time reviewer? <span className="text-[#E5B842] underline">Create Account</span>
                  </button>
                )}
              </div>

              <div className="text-center">
                <button 
                  onClick={onCloseAuth}
                  className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
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

