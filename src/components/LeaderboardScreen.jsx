import React, { useEffect, useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export default function LeaderboardScreen({ currentUser }) {
  const [filter, setFilter] = useState('weekly'); // 'weekly', 'all-time'
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCandidates = async () => {
      const { data, error } = await supabase.from('profiles').select('*');

      if (!isMounted) return;

      if (error) {
        setErrorMessage(error.message || 'Unable to load candidate rankings.');
        setLoading(false);
        return;
      }

      const currentEmail = currentUser?.email?.toLowerCase().trim();
      const normalizedCandidates = (data || [])
        .map((profile) => {
          const name = profile.full_name || profile.name || profile.display_name || profile.email || 'Candidate';
          return {
            id: profile.id || profile.email,
            name,
            xp: Number(profile.xp) || 0,
            accuracy: Number(profile.accuracy) || 0,
            streak: Number(profile.streak) || 0,
            avatar: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
            isCurrentUser: Boolean(currentEmail && profile.email?.toLowerCase().trim() === currentEmail)
          };
        })
        .sort((firstCandidate, secondCandidate) => secondCandidate.xp - firstCandidate.xp);

      setCandidates(normalizedCandidates);
      setLoading(false);
    };

    fetchCandidates();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading rankings...</div>;
  }

  if (errorMessage) {
    return <div className="py-12 text-center text-sm text-rose-400">{errorMessage}</div>;
  }

  if (candidates.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-400">No candidate rankings yet.</div>;
  }

  const hasPodium = candidates.length >= 3;
  const topThree = candidates.slice(0, 3);
  const remaining = hasPodium ? candidates.slice(3) : candidates;

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
          Rankings <Trophy size={26} className="text-[#E5B842]" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Top PRC licensure candidates striving for 1st rank.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#121829] border border-[#1E263D] p-1 rounded-2xl flex justify-between gap-1 shadow-md">
        <button
          onClick={() => setFilter('weekly')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            filter === 'weekly'
              ? 'bg-[#E5B842] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Weekly Sprint
        </button>
        <button
          onClick={() => setFilter('all-time')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            filter === 'all-time'
              ? 'bg-[#E5B842] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All-Time Masters
        </button>
      </div>

      {/* PODIUM (TOP 3) */}
      {hasPodium && (
      <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
        {/* Rank 2 */}
        <div className="bg-[#121829] border border-slate-700/60 rounded-3xl p-3 flex flex-col items-center text-center shadow-lg relative">
          <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-[10px] flex items-center justify-center absolute -top-3 shadow-md">
            2
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center text-sm shadow-md mt-1 mb-2">
            {topThree[1].avatar}
          </div>
          <h4 className="font-bold text-white text-xs truncate max-w-[80px]">{topThree[1].name}</h4>
          <span className="text-[10px] text-slate-400">{topThree[1].accuracy}% acc</span>
          <span className="text-xs font-bold text-slate-300 mt-1">{topThree[1].xp} XP</span>
        </div>

        {/* Rank 1 (Tall & Highlighted) */}
        <div className="bg-gradient-to-b from-[#1E2A4A] to-[#121829] border-2 border-[#E5B842] rounded-3xl p-3 flex flex-col items-center text-center shadow-2xl relative -mt-3 scale-105">
          <div className="w-7 h-7 rounded-full bg-[#E5B842] text-slate-950 font-extrabold text-xs flex items-center justify-center absolute -top-3.5 shadow-lg">
            👑
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#E5B842] text-slate-950 font-bold flex items-center justify-center text-base shadow-lg mt-1 mb-2 border-2 border-[#E5B842]/40">
            {topThree[0].avatar}
          </div>
          <h4 className="font-bold text-white text-xs truncate max-w-[90px]">{topThree[0].name}</h4>
          <span className="text-[10px] text-emerald-400 font-semibold">{topThree[0].accuracy}% acc</span>
          <span className="text-sm font-extrabold text-[#E5B842] mt-1">{topThree[0].xp} XP</span>
        </div>

        {/* Rank 3 */}
        <div className="bg-[#121829] border border-amber-900/40 rounded-3xl p-3 flex flex-col items-center text-center shadow-lg relative">
          <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center absolute -top-3 shadow-md">
            3
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-900 to-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-md mt-1 mb-2">
            {topThree[2].avatar}
          </div>
          <h4 className="font-bold text-white text-xs truncate max-w-[80px]">{topThree[2].name}</h4>
          <span className="text-[10px] text-slate-400">{topThree[2].accuracy}% acc</span>
          <span className="text-xs font-bold text-amber-500 mt-1">{topThree[2].xp} XP</span>
        </div>
      </div>
      )}

      {/* LIST (RANK 4+) */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Candidate Roster
        </span>

        {remaining.map((user, idx) => (
          <div
            key={user.id}
            className={`w-full bg-[#121829] border ${
              user.isCurrentUser ? 'border-[#E5B842] bg-[#172138]' : 'border-[#1E263D]'
            } rounded-2xl p-3.5 flex items-center justify-between shadow-md`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 w-4 text-center">
                {hasPodium ? idx + 4 : idx + 1}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#1A2238] border border-slate-700/60 flex items-center justify-center font-bold text-xs text-white">
                {user.avatar}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {user.name}
                  {user.isCurrentUser && (
                    <span className="text-[8px] bg-[#E5B842] text-slate-950 font-bold px-1.5 py-0.2 rounded-sm uppercase">YOU</span>
                  )}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-400"><Flame size={10} /> {user.streak}d</span>
                  <span>•</span>
                  <span>{user.accuracy}% accuracy</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-[#E5B842] block">
                {user.xp.toLocaleString()} XP
              </span>
              <span className="text-[9px] text-slate-500 uppercase">Ranked</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}