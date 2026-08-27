const VAULT_KEY = 'project_jill_mistakes_vault';
const HISTORY_KEY = 'project_jill_drill_history';

// 1. Get all recorded mistake questions
export function getMistakesVault() {
  try {
    const data = localStorage.getItem(VAULT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// 2. Add a missed question to the vault
export function recordMistake(question) {
  try {
    const vault = getMistakesVault();
    const existingIndex = vault.findIndex(
      item => (question.id && item.id === question.id) || item.question === question.question
    );
    
    if (existingIndex >= 0) {
      vault[existingIndex].missCount = (vault[existingIndex].missCount || 1) + 1;
      vault[existingIndex].lastMissed = new Date().toISOString();
    } else {
      vault.unshift({
        ...question,
        missCount: 1,
        status: 'Needs Practice',
        dateAdded: new Date().toISOString(),
        lastMissed: new Date().toISOString()
      });
    }
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  } catch (e) {
    console.error("Failed to record mistake", e);
  }
}

// 3. Mark a question as Mastered
export function markAsMastered(questionId) {
  try {
    let vault = getMistakesVault();
    vault = vault.map(item => {
      if (item.id === questionId) {
        return { ...item, status: 'Mastered' };
      }
      return item;
    });
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  } catch (e) {
    console.error("Failed to update question status", e);
  }
}

// 4. Save drill session history
export function recordSession(session) {
  try {
    const history = getSessionHistory();
    history.unshift({
      id: Date.now(),
      title: session.title,
      score: session.score,
      total: session.total,
      percentage: Math.round((session.score / session.total) * 100),
      durationSecs: session.durationSecs || 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: session.percentage >= 85 ? 'Very Good' : session.percentage >= 75 ? 'Good' : 'Needs Review'
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

// 5. Retrieve drill history
export function getSessionHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}