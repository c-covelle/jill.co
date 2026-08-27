import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AestheticCover from './components/AestheticCover';
import LoginScreen from './components/LoginScreen';
import QuizEngine from './components/QuizEngine';
import QuizResults from './components/QuizResults';
import Flashcard from './components/Flashcard';
import { 
  BookOpen, 
  BarChart3, 
  AlertCircle, 
  User, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  LogOut,
  Play
} from 'lucide-react';
import { loadQuestionsBySubject, getAvailableSets } from './data/questionBanks';
import { getDomainMetrics, getUserStats, resetStats } from './services/learningHub';
import { getMistakesVault, getMistakesCount } from './services/mistakes';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Quiz execution states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [stats, setStats] = useState({ total_answered: 0, overall_accuracy: 0, current_streak: 0 });
  const [domainMetrics, setDomainMetrics] = useState([]);
  const [mistakesCount, setMistakesCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setShowAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [uStats, dMetrics, mCount] = await Promise.all([
        getUserStats(user.id),
        getDomainMetrics(user.id),
        getMistakesCount(user.id)
      ]);
      if (uStats) setStats(uStats);
      if (dMetrics) setDomainMetrics(dMetrics);
      setMistakesCount(mCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
  };

  const startDrill = (questions, title, meta = {}) => {
    if (!questions || questions.length === 0) {
      alert("No questions found for this drill set.");
      return;
    }
    setActiveQuiz({ questions, title, meta });
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060911', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(229,184,66,0.2)', borderTopColor: '#E5B842', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- UNATHENTICATED ROUTE (Cover Screen First) ---
  if (!user) {
    if (!showAuth) {
      return <AestheticCover onProceed={() => setShowAuth(true)} />;
    }
    return (
      <LoginScreen 
        onLoginSuccess={(authUser) => setUser(authUser)} 
        onBack={() => setShowAuth(false)} 
      />
    );
  }

  // --- ACTIVE QUIZ VIEW ---
  if (activeQuiz) {
    return (
      <QuizEngine 
        questions={activeQuiz.questions}
        title={activeQuiz.title}
        meta={activeQuiz.meta}
        user={user}
        onComplete={(results) => {
          setQuizResults(results);
          setActiveQuiz(null);
          refreshData();
        }}
        onExit={() => {
          setActiveQuiz(null);
          refreshData();
        }}
      />
    );
  }

  // --- QUIZ RESULTS VIEW ---
  if (quizResults) {
    return (
      <QuizResults 
        results={quizResults}
        onBackToDashboard={() => {
          setQuizResults(null);
          refreshData();
        }}
        onRetake={() => {
          const retakeQuiz = { ...quizResults.quizData };
          setQuizResults(null);
          setActiveQuiz(retakeQuiz);
        }}
      />
    );
  }

  // --- MAIN AUTHENTICATED DASHBOARD ---
  return (
    <div style={{ minHeight: '100vh', background: '#060911', color: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid #1C2438', background: '#0B0F19', padding: '14px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#12192B', border: '1px solid rgba(229,184,66,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#E5B842', fontWeight: 900, fontSize: '12px' }}>PJ</span>
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em' }}>PROJECT JILL</span>
              <span style={{ display: 'block', fontSize: '8px', color: '#E5B842', fontFamily: 'monospace' }}>BY C. COVELLE</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(229,184,66,0.1)', padding: '5px 12px', borderRadius: '999px', border: '1px solid rgba(229,184,66,0.3)', color: '#E5B842', fontSize: '11px', fontWeight: 700 }}>
              <Flame size={14} color="#E5B842" />
              <span>{stats.current_streak || 0} Day Streak</span>
            </div>
            <button 
              onClick={handleSignOut}
              style={{ background: '#12192B', border: '1px solid #1C2438', color: '#94A3B8', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main style={{ flex: 1, maxWidth: '1120px', width: '100%', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0D121F', border: '1px solid #1C2438', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Total Drills Completed</span>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#FFF', margin: '6px 0 0 0' }}>{stats.total_answered || 0}</p>
              </div>
              <div style={{ background: '#0D121F', border: '1px solid #1C2438', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Overall Accuracy</span>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#E5B842', margin: '6px 0 0 0' }}>{Math.round(stats.overall_accuracy || 0)}%</p>
              </div>
              <div style={{ background: '#0D121F', border: '1px solid #1C2438', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Mistakes Vault</span>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#F87171', margin: '6px 0 0 0' }}>{mistakesCount} items</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#0D121F', border: '1px solid #1C2438', borderRadius: '14px', padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 14px 0', color: '#FFF' }}>Review Hub & Drill Sets</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {['General Education', 'Professional Education', 'Science Specialization'].map((subject, idx) => (
                  <div key={idx} style={{ background: '#070A12', border: '1px solid #232D47', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px 0' }}>{subject}</h3>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>5 Curated Sets Available</span>
                    </div>
                    <button 
                      onClick={() => {
                        const key = subject.toLowerCase().includes('gen') ? 'general_education' : subject.toLowerCase().includes('prof') ? 'professional_education' : 'science';
                        const qs = loadQuestionsBySubject(key, 'set_A');
                        startDrill(qs, `${subject} (Set A)`, { subject: key, set: 'set_A' });
                      }}
                      style={{ background: '#E5B842', color: '#060911', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Play size={12} fill="#060911" />
                      <span>Start Set A</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Bottom Floating Nav Bar */}
      <nav style={{ borderTop: '1px solid #1C2438', background: '#0B0F19', padding: '10px 0' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#E5B842' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>
            <BookOpen size={18} />
            <span>Dashboard</span>
          </button>
        </div>
      </nav>

    </div>
  );
}