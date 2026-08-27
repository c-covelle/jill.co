import React from 'react';
import { 
  FileText, 
  BookOpenCheck, 
  TrendingUp, 
  Volume2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Code2
} from 'lucide-react';

export default function AestheticCover({ onProceed }) {
  const features = [
    {
      icon: <FileText size={20} color="#E5B842" />,
      badge: "CURATED DRILLS (Sets A-E)",
      desc: "Over 750 targeted questions in GenEd, ProfEd, and Specialization."
    },
    {
      icon: <BookOpenCheck size={20} color="#34D399" />,
      badge: "ERROR NOTEBOOK & VAULT",
      desc: "Sync and review missed questions across devices for mastery."
    },
    {
      icon: <TrendingUp size={20} color="#FBBF24" />,
      badge: "PERFORMANCE ANALYTICS",
      desc: "Live accuracy tracking, streaks, and domain-specific insights."
    },
    {
      icon: <Volume2 size={20} color="#818CF8" />,
      badge: "EXCLUSIVE B&O EXPERIENCE",
      desc: "Unlock your potential with unparalleled study ambiance."
    }
  ];

  return (
    <div className="cover-root">
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
        @keyframes subtleShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .cover-root {
          min-height: 100vh;
          width: 100%;
          background: #060911;
          color: #F1F5F9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .glow-orb-center {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 450px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(14, 165, 233, 0.08) 45%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          animation: pulseGlow 6s ease-in-out infinite;
        }

        .glow-orb-gold {
          position: absolute;
          top: -80px;
          right: 15%;
          width: 400px;
          height: 350px;
          background: radial-gradient(circle, rgba(229, 184, 66, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          animation: floatSlow 8s ease-in-out infinite;
        }

        .cover-nav {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 24px 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .cover-main-grid {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1120px;
          margin: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
          align-items: center;
          box-sizing: border-box;
        }

        @media (min-width: 900px) {
          .cover-main-grid {
            grid-template-columns: 5fr 7fr;
            gap: 48px;
          }
        }

        .feature-card {
          background: rgba(13, 18, 31, 0.75);
          border: 1px solid #1C2438;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 12px;
        }

        .feature-card:hover {
          transform: translateX(4px);
          border-color: rgba(229, 184, 66, 0.5);
          background: rgba(18, 25, 43, 0.9);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }

        .feature-icon-box {
          padding: 8px;
          background: #070A12;
          border: 1px solid #232D47;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mission-capsule {
          background: linear-gradient(135deg, rgba(18, 24, 41, 0.95), rgba(10, 14, 26, 0.95));
          border: 1px solid rgba(229, 184, 66, 0.3);
          border-radius: 14px;
          padding: 16px 20px;
          font-size: 13px;
          line-height: 1.5;
          color: #E2E8F0;
          backdrop-filter: blur(8px);
        }

        .cta-gold-button {
          background: linear-gradient(135deg, #E5B842 0%, #F5D365 50%, #E5B842 100%);
          background-size: 200% 200%;
          color: #060911;
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(229, 184, 66, 0.35);
          transition: all 0.25s ease;
          animation: subtleShimmer 4s ease infinite;
        }

        .cta-gold-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 45px rgba(229, 184, 66, 0.6);
        }

        .cta-gold-button:active {
          transform: translateY(0px) scale(0.98);
        }

        .cover-footer {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 16px 24px;
          border-top: 1px solid rgba(28, 36, 56, 0.8);
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-family: monospace;
          color: #64748B;
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          .cover-footer {
            flex-direction: row;
          }
        }
      `}</style>

      {/* Ambient Lighting Layers */}
      <div className="glow-orb-center" />
      <div className="glow-orb-gold" />

      {/* Top Navbar */}
      <header className="cover-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#111625',
            border: '1px solid rgba(229, 184, 66, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            transform: 'rotate(45deg)'
          }}>
            <span style={{
              transform: 'rotate(-45deg)',
              fontFamily: 'Georgia, serif',
              fontWeight: 900,
              fontSize: '13px',
              color: '#E5B842'
            }}>PJ</span>
          </div>
          <div>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: '16px', letterSpacing: '0.18em', color: '#FFF' }}>
              PROJECT JILL
            </span>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.15em', color: 'rgba(229, 184, 66, 0.9)', textTransform: 'uppercase' }}>
              Engineered by C. Covelle
            </span>
          </div>
        </div>

        <button 
          onClick={onProceed}
          style={{
            padding: '7px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(229, 184, 66, 0.4)',
            color: '#E5B842',
            background: 'rgba(229, 184, 66, 0.08)',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E5B842'; e.currentTarget.style.color = '#060911'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(229, 184, 66, 0.08)'; e.currentTarget.style.color = '#E5B842'; }}
        >
          Trial Access
        </button>
      </header>

      {/* Main Grid: Left Feature Cards + Right Hero Narrative */}
      <main className="cover-main-grid">
        
        {/* Left Side: 4 Interactive Feature Cards */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {features.map((item, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-box">
                {item.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#E5B842', textTransform: 'uppercase' }}>
                  {item.badge}
                </span>
                <span style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.4' }}>
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Headlines, Mission & CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(229, 184, 66, 0.1)',
              border: '1px solid rgba(229, 184, 66, 0.3)',
              color: '#E5B842',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <Sparkles size={12} color="#E5B842" />
              <span>Wave 1 Verified Candidate Access</span>
            </div>

            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#FFFFFF',
              margin: '0 0 10px 0'
            }}>
              Master Your Path to LPT:{' '}
              <span style={{
                background: 'linear-gradient(90deg, #E5B842, #F8E29A, #E5B842)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Project Jill
              </span>
            </h1>

            <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 300, margin: 0, lineHeight: 1.5 }}>
              The definitive digital companion for PRC Licensure candidates.
            </p>
          </div>

          {/* Mission Capsule */}
          <div className="mission-capsule">
            <span style={{ color: '#E5B842', fontWeight: 800, letterSpacing: '0.05em', marginRight: '6px', fontFamily: 'monospace' }}>
              Our Mission:
            </span>
            To empower future Filipino educators with smart, resilient, and focused PRC exam preparation.
          </div>

          {/* About Jill & Action CTA */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingTop: '8px'
          }}>
            <div style={{ maxWidth: '280px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', color: '#E5B842', textTransform: 'uppercase', fontFamily: 'monospace', display: 'block', marginBottom: '2px' }}>
                About Jill
              </span>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                A premium, data-driven licensure support system combining academic rigor with tailored readiness.
              </p>
            </div>

            <button onClick={onProceed} className="cta-gold-button">
              <span>TRY PROJECT JILL NOW</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="cover-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#E5B842" />
          <span>Verified Examinees Only • Wave 1 Trial Access</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={14} color="#818CF8" />
          <span>Architected & Built by <strong style={{ color: '#E2E8F0', fontWeight: 600 }}>C. Covelle</strong> • © 2026 Project Jill</span>
        </div>
      </footer>

    </div>
  );
}