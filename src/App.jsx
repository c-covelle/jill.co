import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, ChevronLeft, ChevronRight, GraduationCap, Home, LogOut, User } from 'lucide-react';
import AestheticCover from './components/AestheticCover';
import LoginScreen from './components/LoginScreen';
import QuizEngine from './components/QuizEngine';
import QuizResults from './components/QuizResults';
import { QUESTION_BANKS, getRandomMixedDrill, getSetQuestions } from './data/questionBanks';
import { fetchActiveMistakes, fetchUserAnalytics, recordDrillSession } from './lib/syncService';
import { supabase } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState('dashboard');
  const [drill, setDrill] = useState({ title: '', subtitle: '', questions: [] });
  const [results, setResults] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setShowAuth(false);
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
    setView('dashboard');
  };

  const startDrill = (title, subtitle, questions) => {
    if (!questions.length) return;
    setDrill({ title, subtitle, questions });
    setView('quiz');
  };

  const handleQuizComplete = (answers) => {
    const score = drill.questions.reduce((count, question, index) => (
      count + (answers[index] === question.correctAnswer ? 1 : 0)
    ), 0);
    const firstQuestion = drill.questions[0];
    const category = firstQuestion?.domain === 'gened' ? 'GenEd' : firstQuestion?.domain === 'profed' ? 'ProfEd' : 'Specialization';
    recordDrillSession({ category, setName: drill.title, score, totalQuestions: drill.questions.length });
    setResults({ answers, timeTaken: 0 });
    setView('results');
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#080B11] flex items-center justify-center"><div className="h-10 w-10 rounded-full border-2 border-slate-800 border-t-[#E5B842] animate-spin" /></div>;
  }
  if (!user) {
    return showAuth
      ? <LoginScreen onLoginSuccess={setUser} onBack={() => setShowAuth(false)} />
      : <AestheticCover onProceed={() => setShowAuth(true)} />;
  }
  if (view === 'quiz') {
    return <QuizEngine questions={drill.questions} title={drill.title} subtitle={drill.subtitle} onComplete={handleQuizComplete} onClose={() => setView('dashboard')} />;
  }
  if (view === 'results') {
    return <QuizResults questions={drill.questions} selectedAnswers={results?.answers || {}} totalTime={results?.timeTaken || 0} title={drill.title} onRetry={() => setView('quiz')} onHome={() => { setView('dashboard'); setActiveTab('home'); }} />;
  }

  const goTab = (tab) => { setActiveTab(tab); setView('dashboard'); };
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen border-x border-slate-800/40 bg-gradient-to-b from-[#0D1224] via-[#0A0E1A] to-[#070A12] pb-24">
        <main className="p-5">
          {activeTab === 'home' && <HomeScreen user={user} onStartQuick={() => startDrill('Quick Drill', '50 Random Mixed Items', getRandomMixedDrill(50))} onTab={goTab} />}
          {activeTab === 'review' && <ReviewScreen onStart={(folderKey, setKey) => { const questions = getSetQuestions(folderKey, setKey); startDrill(`${QUESTION_BANKS[folderKey].title} - ${setKey.replace('_', ' ')}`, `${questions.length} Items Available`, questions); }} onQuick={() => startDrill('Quick Drill', '50 Random Mixed Items', getRandomMixedDrill(50))} />}
          {activeTab === 'stats' && <StatsScreen />}
          {activeTab === 'learn' && <MistakesScreen onStart={(mistakes) => startDrill('Boss Mode: Mistakes Vault', `${mistakes.length} Active Errors`, mistakes.map(toQuizQuestion))} />}
          {activeTab === 'profile' && <ProfileScreen user={user} onSignOut={handleSignOut} />}
        </main>
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-slate-800/80 bg-[#0D1322]/95 px-3 py-2 backdrop-blur-md">
          <div className="flex justify-around">
            <NavButton icon={BarChart3} label="Stats" active={activeTab === 'stats'} onClick={() => goTab('stats')} />
            <NavButton icon={BookOpen} label="Review" active={activeTab === 'review'} onClick={() => goTab('review')} />
            <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => goTab('home')} />
            <NavButton icon={GraduationCap} label="Learn" active={activeTab === 'learn'} onClick={() => goTab('learn')} />
            <NavButton icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => goTab('profile')} />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-semibold ${active ? 'text-[#E5B842]' : 'text-slate-500'}`}><Icon size={21} /><span>{label}</span></button>;
}

function HomeScreen({ user, onStartQuick, onTab }) {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { fetchUserAnalytics().then(setAnalytics); }, []);
  const name = user?.user_metadata?.full_name || 'Crissian Jill';
  const answered = analytics?.total_questions_answered || 0;
  const accuracy = answered ? Math.round((analytics.total_correct / answered) * 100) : 0;
  return <div className="space-y-5"><header><p className="text-xs uppercase tracking-[0.2em] text-[#E5B842]">Project Jill</p><h1 className="mt-3 font-serif text-4xl font-bold text-white">Good Evening,<br />{name.split(' ')[0]}.</h1><p className="mt-2 text-sm text-slate-400">Your focused path to the LPT starts here.</p></header><section className="border border-[#E5B842]/25 bg-[#121829] p-5 shadow-xl"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Progress</p><div className="mt-4 flex items-end justify-between"><div><strong className="text-4xl text-white">{answered}</strong><span className="ml-2 text-sm text-slate-500">questions answered</span></div><strong className="text-2xl text-[#E5B842]">{accuracy}%</strong></div></section><button onClick={onStartQuick} className="w-full bg-[#E5B842] p-4 text-xs font-black uppercase tracking-wider text-slate-950">Start Quick Drill <ChevronRight className="inline" size={16} /></button><button onClick={() => onTab('review')} className="w-full border border-slate-700 bg-[#121829] p-4 text-left"><span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Review Hub</span><p className="mt-1 font-bold text-white">Choose a subject and set</p></button></div>;
}

function ReviewScreen({ onStart, onQuick }) {
  return <div className="space-y-5"><div><h1 className="font-serif text-3xl font-bold text-white">Review Hub</h1><p className="mt-1 text-xs text-slate-400">Choose a focused question set.</p></div><button onClick={onQuick} className="w-full bg-[#E5B842] p-4 text-xs font-black uppercase text-slate-950">Quick Mixed Drill</button>{Object.entries(QUESTION_BANKS).map(([key, subject]) => <section key={key} className="border border-[#1E263D] bg-[#121829] p-4"><h2 className="font-serif text-xl font-bold text-white">{subject.title}</h2><div className="mt-3 grid grid-cols-2 gap-2">{Object.keys(subject.sets).map(setKey => <button key={setKey} onClick={() => onStart(key, setKey)} className="border border-slate-700 px-3 py-3 text-left text-xs font-bold text-slate-300 hover:border-[#E5B842]">{setKey.replace('_', ' ')}<ChevronRight size={14} className="float-right" /></button>)}</div></section>)}</div>;
}

function StatsScreen() {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { fetchUserAnalytics().then(setAnalytics); }, []);
  const answered = analytics?.total_questions_answered || 0;
  const accuracy = answered ? Math.round((analytics.total_correct / answered) * 100) : 0;
  return <div className="space-y-5"><h1 className="font-serif text-3xl font-bold text-white">Analytics</h1><div className="grid grid-cols-2 gap-3"><Metric label="Accuracy" value={`${accuracy}%`} /><Metric label="Answered" value={answered} /><Metric label="Gen Ed" value={`${analytics?.gen_ed_accuracy || 0}%`} /><Metric label="Prof Ed" value={`${analytics?.prof_ed_accuracy || 0}%`} /></div><section className="border border-[#1E263D] bg-[#121829] p-5"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Domain Mastery</h2>{[['General Education', 'gen_ed_accuracy'], ['Professional Education', 'prof_ed_accuracy'], ['Specialization', 'spec_accuracy']].map(([label, key]) => <div key={key} className="mt-4"><div className="flex justify-between text-xs"><span>{label}</span><span className="text-[#E5B842]">{analytics?.[key] || 0}%</span></div><div className="mt-2 h-2 bg-slate-800"><div className="h-full bg-[#E5B842]" style={{ width: `${Math.min(Number(analytics?.[key]) || 0, 100)}%` }} /></div></div>)}</section></div>;
}

function Metric({ label, value }) { return <div className="border border-[#1E263D] bg-[#121829] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }

function MistakesScreen({ onStart }) {
  const [mistakes, setMistakes] = useState([]);
  useEffect(() => { fetchActiveMistakes().then(setMistakes); }, []);
  return <div className="space-y-5"><div><h1 className="font-serif text-3xl font-bold text-white">Mistakes Vault</h1><p className="mt-1 text-xs text-slate-400">Active errors waiting for mastery.</p></div><button disabled={!mistakes.length} onClick={() => onStart(mistakes)} className="w-full bg-[#E5B842] p-4 text-xs font-black uppercase text-slate-950 disabled:opacity-40">Boss Mode ({mistakes.length})</button>{mistakes.length ? mistakes.map(mistake => <article key={mistake.id} className="border border-[#1E263D] bg-[#121829] p-4"><p className="text-sm font-bold text-white">{mistake.question}</p><p className="mt-2 text-[10px] uppercase text-rose-300">{mistake.category} • Missed {mistake.missed_count || 1}x</p></article>) : <p className="py-10 text-center text-sm text-slate-500">No active mistakes in your vault.</p>}</div>;
}

function toQuizQuestion(mistake) {
  const options = Array.isArray(mistake.options) ? mistake.options : Object.entries(mistake.options || {}).map(([id, text]) => ({ id, text }));
  return { id: mistake.question_id, mistakeId: mistake.id, category: mistake.category, domain: mistake.category === 'GenEd' ? 'gened' : mistake.category === 'ProfEd' ? 'profed' : 'specialization', setName: mistake.set_name, question: mistake.question, options, correctAnswer: mistake.correct_answer, correctText: options.find(option => option.id === mistake.correct_answer)?.text || mistake.correct_answer, rationale: mistake.rationalization, choiceAnalysis: mistake.rationalization };
}

function ProfileScreen({ user, onSignOut }) {
  const name = user?.user_metadata?.full_name || 'Crissian Jill';
  return <div className="space-y-5"><h1 className="font-serif text-3xl font-bold text-white">Profile</h1><section className="border border-[#1E263D] bg-[#121829] p-5"><p className="text-[10px] uppercase tracking-wider text-[#E5B842]">LPT Candidate</p><h2 className="mt-2 text-2xl font-bold text-white">{name}</h2><p className="mt-1 text-xs text-slate-400">{user?.email}</p></section><button onClick={onSignOut} className="flex w-full items-center justify-between border border-rose-900/60 bg-[#121829] p-4 text-sm font-bold text-rose-400">Sign Out Session <LogOut size={17} /></button></div>;
}
