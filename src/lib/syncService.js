import { supabase } from './supabase';

/**
 * Adds a completed quiz score to the profile fields used by the leaderboard.
 * One XP is awarded for each correct answer; accuracy reflects the latest quiz.
 */
export async function recordLeaderboardResult({ score, totalQuestions }) {
  const correct = Number(score);
  const total = Number(totalQuestions);

  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0 || correct < 0 || correct > total) {
    throw new Error('The quiz score is invalid; the score could not be ranked.');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const normalizedEmail = user?.email?.trim().toLowerCase();
  if (!user || !normalizedEmail) throw new Error('Please sign in again; no authenticated candidate was found.');
  const name = user.user_metadata?.full_name || user.user_metadata?.name || normalizedEmail;

  const { data: profile, error: lookupError } = await supabase
    .from('profiles')
    .select('id, xp')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (lookupError) throw lookupError;

  const accuracy = Number(((correct / total) * 100).toFixed(2));
  if (!profile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: normalizedEmail,
      name: name.trim(),
      avatar: name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      xp: correct,
      accuracy
    });
    if (insertError) throw insertError;
    return { xpEarned: correct, accuracy };
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({
      xp: (Number(profile.xp) || 0) + correct,
      accuracy
    })
    .eq('id', profile.id)
    .select('id')
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updatedProfile) {
    throw new Error('Supabase did not update your profile. Check the profiles table update policy.');
  }

  return { xpEarned: correct, accuracy };
}

/**
 * Records a completed drill session to Supabase
 */
export async function recordDrillSession({ category, setName, score, totalQuestions }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const accuracy = ((score / totalQuestions) * 100).toFixed(2);

    // Insert the session
    const { error: sessionError } = await supabase
      .from('drill_sessions')
      .insert({
        user_id: user.id,
        category,
        set_name: setName,
        score,
        total_questions: totalQuestions,
        accuracy_percentage: accuracy,
      });

    if (sessionError) throw sessionError;

    // Recalculate user's aggregated analytics
    await updateUserAggregateStats(user.id);
  } catch (err) {
    console.error('Error syncing drill session:', err.message);
  }
}

/**
 * Computes overall accuracy and domain masteries from user's drill history
 */
export async function updateUserAggregateStats(userId) {
  const { data: sessions, error } = await supabase
    .from('drill_sessions')
    .select('*')
    .eq('user_id', userId);

  if (error || !sessions || sessions.length === 0) return;

  const totalAnswered = sessions.reduce((acc, s) => acc + s.total_questions, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.score, 0);

  const calcCatAcc = (cat) => {
    const catSessions = sessions.filter(s => s.category.toLowerCase() === cat.toLowerCase());
    if (!catSessions.length) return 0;
    const catTotal = catSessions.reduce((acc, s) => acc + s.total_questions, 0);
    const catScore = catSessions.reduce((acc, s) => acc + s.score, 0);
    return ((catScore / catTotal) * 100).toFixed(2);
  };

  const payload = {
    user_id: userId,
    total_questions_answered: totalAnswered,
    total_correct: totalCorrect,
    gen_ed_accuracy: calcCatAcc('GenEd'),
    prof_ed_accuracy: calcCatAcc('ProfEd'),
    spec_accuracy: calcCatAcc('Specialization'),
    updated_at: new Date().toISOString(),
  };

  await supabase
    .from('user_analytics')
    .upsert(payload, { onConflict: 'user_id' });
}

/**
 * Loads the user's aggregated stats from Supabase
 */
export async function fetchUserAnalytics() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching analytics:', err.message);
    return null;
  }
}
/**
 * Records or updates missed questions in Supabase
 */
export async function recordMistake({ questionId, category, setName, question, options, correctAnswer, selectedAnswer, rationalization }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if mistake already exists for this candidate
    const { data: existing } = await supabase
      .from('user_mistakes')
      .select('id, missed_count')
      .match({
        user_id: user.id,
        category,
        set_name: setName,
        question_id: questionId
      })
      .maybeSingle();

    if (existing) {
      // Increment mistake count and reset mastered state
      await supabase
        .from('user_mistakes')
        .update({
          missed_count: (existing.missed_count || 1) + 1,
          selected_answer: selectedAnswer,
          mastered: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Insert new mistake record
      await supabase
        .from('user_mistakes')
        .insert({
          user_id: user.id,
          question_id: questionId,
          category,
          set_name: setName,
          question,
          options,
          correct_answer: correctAnswer,
          selected_answer: selectedAnswer,
          rationalization,
          mastered: false,
          missed_count: 1
        });
    }
  } catch (err) {
    console.error('Error saving mistake:', err.message);
  }
}

/**
 * Fetches all unmastered mistakes for the Error Notebook & Boss Mode
 */
export async function fetchActiveMistakes() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_mistakes')
      .select('*')
      .eq('user_id', user.id)
      .eq('mastered', false)
      .order('missed_count', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching mistakes:', err.message);
    return [];
  }
}

/**
 * Marks a mistake as resolved/mastered once answered correctly in remedial drill
 */
export async function markMistakeMastered(mistakeId) {
  try {
    const { error } = await supabase
      .from('user_mistakes')
      .update({ mastered: true, updated_at: new Date().toISOString() })
      .eq('id', mistakeId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating mistake status:', err.message);
  }
}

function mergeHistory(remoteHistory = [], localHistory = []) {
  const merged = new Map();
  [...remoteHistory, ...localHistory].forEach(session => {
    const key = String(session.id ?? `${session.title}:${session.date}:${session.score}:${session.total}`);
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, ...session } : session);
  });
  return [...merged.values()]
    .sort((left, right) => Number(right.id || 0) - Number(left.id || 0))
    .slice(0, 100);
}

function mergeVault(remoteVault = [], localVault = []) {
  const merged = new Map();
  [...remoteVault, ...localVault].forEach(item => {
    const key = String(item.question || item.id || '').trim().toLowerCase();
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, item);
      return;
    }
    merged.set(key, {
      ...existing,
      ...item,
      missCount: Math.max(existing.missCount || 1, item.missCount || 1),
      status: existing.status === 'Mastered' || item.status === 'Mastered' ? 'Mastered' : item.status || existing.status
    });
  });
  return [...merged.values()].slice(0, 500);
}

export async function syncCandidateProgress({ vault = [], history = [] }) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to sync study progress across devices.');

  const progressOwner = localStorage.getItem('project_jill_progress_owner');
  const canMergeLocalProgress = !progressOwner || progressOwner === user.id;

  const { data: remote, error: fetchError } = await supabase
    .from('candidate_progress')
    .select('vault, history')
    .eq('user_id', user.id)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const mergedVault = mergeVault(remote?.vault || [], canMergeLocalProgress ? vault : []);
  const mergedHistory = mergeHistory(remote?.history || [], canMergeLocalProgress ? history : []);
  const { error: saveError } = await supabase
    .from('candidate_progress')
    .upsert({
      user_id: user.id,
      vault: mergedVault,
      history: mergedHistory,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  if (saveError) throw saveError;

    localStorage.setItem('project_jill_progress_owner', user.id);

  return { vault: mergedVault, history: mergedHistory };
}

export async function submitQuestionFeedback({ questionId, question, category, issueType, details }) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to submit question feedback.');

  const { error } = await supabase.from('question_feedback').insert({
    user_id: user.id,
    question_id: String(questionId || ''),
    question,
    category: category || 'Uncategorized',
    issue_type: issueType,
    details: details.trim()
  });
  if (error) throw error;
}