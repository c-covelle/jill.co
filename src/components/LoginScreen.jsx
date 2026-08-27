import React, { useState } from 'react';
import { Lock, Mail, Sparkles, AlertCircle, Loader2, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { supabase, isEmailAllowed } from '../lib/supabase';

export default function LoginScreen({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Whitelist Verification
    if (!isEmailAllowed(trimmedEmail)) {
      setErrorMessage("Access Restricted: This email is not registered for Trial Wave 1. Contact the administrator for reviewer access.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // --- SIGN UP FLOW ---
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || 'LPT Candidate'
            }
          }
        });

        if (error) throw error;

        if (data?.session) {
          // Email auto-confirmed, logged in directly
          onLoginSuccess(data.user);
        } else if (data?.user) {
          // Account registered
          setSuccessNotice("Account successfully registered! You can now sign in.");
          setIsSignUp(false);
        }
      } else {
        // --- SIGN IN FLOW ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password
        });

        if (error) throw error;
        if (data?.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setErrorMessage("Invalid credentials. If you haven't created your account yet, click 'Create Account' below.");
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex items-center justify-center p-4 selection:bg-[#E5B842]/30 selection:text-[#E5B842]">
      <div className="w-full max-w-md bg-gradient-to-b from-[#121829] to-[#0A0E1A] border border-[#1E263D] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5B842]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Crest */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 border border-white/20 flex items-center justify-center font-serif font-bold text-white text-xl mx-auto shadow-lg shadow-indigo-950">
            PJ
          </div>
          <div className="flex items-center justify-center gap-1 text-[#E5B842] text-[10px] font-bold tracking-widest uppercase pt-1">
            <Sparkles size={13} />
            <span>PRC Licensure Companion</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">Project Jill</h1>
          <p className="text-xs text-slate-400 font-sans">
            {isSignUp ? 'Register your trial reviewer account.' : 'Sign in to access candidate drill sets.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="mt-6 space-y-4 relative z-10">
          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-3.5 text-xs text-emerald-300 animate-in fade-in duration-150">
              {successNotice}
            </div>
          )}

          {/* Full Name field (shown during Sign Up) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block pl-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Crissian Jill"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-[#1E263D] focus:border-[#E5B842] rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block pl-1">
              Reviewer Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-[#1E263D] focus:border-[#E5B842] rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block pl-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-[#1E263D] focus:border-[#E5B842] rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E5B842] hover:bg-[#F2C94C] text-slate-950 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Register Candidate Account' : 'Authenticate & Enter'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Sign In & Create Account */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
              setSuccessNotice('');
            }}
            className="text-xs text-slate-400 hover:text-[#E5B842] transition cursor-pointer font-medium"
          >
            {isSignUp ? 'Already registered? Sign In' : 'First time reviewer? Create Account'}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Restricted Trial Access • Verified Examinees Only</span>
          </div>
        </div>

      </div>
    </div>
  );
}