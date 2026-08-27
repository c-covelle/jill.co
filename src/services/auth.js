// Whitelist of authorized reviewers and candidate IDs
export const AUTHORIZED_USERS = [
  { id: "PJ-2026-8821", name: "Crissian Jill", role: "Verified Reviewer", major: "Science" },
  { id: "PJ-2026-0001", name: "Guest Candidate", role: "Trial Reviewer", major: "General Education" },
  { id: "ADMIN-JILL", name: "Lead Reviewer", role: "Administrator", major: "All Subjects" }
];

const AUTH_STORAGE_KEY = "project_jill_authenticated_user";

export function checkLogin(passcodeOrId) {
  const cleanKey = passcodeOrId.trim().toUpperCase();
  const match = AUTHORIZED_USERS.find(
    user => user.id.toUpperCase() === cleanKey || user.name.toUpperCase() === cleanKey
  );

  if (match) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(match));
    return { success: true, user: match };
  }

  return { 
    success: false, 
    error: "Invalid Candidate ID or Access Code. Please check your assigned review code." 
  };
}

export function getCurrentUser() {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}