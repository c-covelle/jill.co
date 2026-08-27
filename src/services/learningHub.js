const NOTES_KEY = 'project_jill_notes';
const HISTORY_KEY = 'project_jill_history';

export function getNotes() {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveNote(noteText, category = "General") {
  if (!noteText.trim()) return;
  const notes = getNotes();
  const newNote = {
    id: Date.now(),
    text: noteText,
    category,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
  notes.unshift(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return notes;
}

export function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return notes;
}

export function getSessionHistory() {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function logSessionHistory(title, score, total, mode) {
  const history = getSessionHistory();
  const entry = {
    id: Date.now(),
    title,
    score,
    total,
    mode,
    percentage: Math.round((score / total) * 100),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  history.unshift(entry);
  if (history.length > 20) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
