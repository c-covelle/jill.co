const MISTAKES_STORAGE_KEY = 'project_jill_mistakes_vault';

export function getRecordedMistakes() {
  const data = localStorage.getItem(MISTAKES_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function recordMistake(questionItem, selectedAnswer) {
  if (!questionItem || !questionItem.question) return;

  const currentMistakes = getRecordedMistakes();
  const existingIndex = currentMistakes.findIndex(m => m.question === questionItem.question);

  const mistakeEntry = {
    ...questionItem,
    lastUserChoice: selectedAnswer,
    timestamp: new Date().toISOString(),
    mistakeCount: existingIndex >= 0 ? (currentMistakes[existingIndex].mistakeCount || 1) + 1 : 1
  };

  if (existingIndex >= 0) {
    currentMistakes[existingIndex] = mistakeEntry;
  } else {
    currentMistakes.unshift(mistakeEntry);
  }

  localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(currentMistakes));
}

export function clearMistakes() {
  localStorage.removeItem(MISTAKES_STORAGE_KEY);
}

export function removeSingleMistake(questionText) {
  const currentMistakes = getRecordedMistakes().filter(m => m.question !== questionText);
  localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(currentMistakes));
}
