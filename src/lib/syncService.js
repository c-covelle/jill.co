import { supabase } from './supabase';

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