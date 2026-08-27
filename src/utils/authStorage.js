const USERS_KEY = 'project_jill_users';
const SESSION_USER_KEY = 'project_jill_session_user';

// Persistent registered accounts database
export function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [
      { email: 'crissian@example.com', name: 'Crissian Jill', passcode: 'Covelle' },
      { email: 'demo@projectjill.com', name: 'Demo Candidate', passcode: 'Covelle' }
    ];
  } catch (e) {
    return [];
  }
}

// Register user and set current session
export function registerUser(email, passcode, name = "Candidate") {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please sign in.' };
  }

  const newUser = {
    id: 'PJ-' + Math.floor(1000 + Math.random() * 9000),
    email: cleanEmail,
    name: name.trim() || 'Candidate',
    passcode: passcode,
    joinedDate: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // Save ONLY in sessionStorage so it clears on browser/tab exit
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser));
  return { success: true, user: newUser };
}

// Authenticate user and store in session
export function authenticateUser(email, passcode) {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();

  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return registerUser(cleanEmail, passcode, cleanEmail.split('@')[0]);
  }

  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

// Get Active Candidate for the current session only
export function getCurrentUser() {
  try {
    const data = sessionStorage.getItem(SESSION_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// Sign out / Clear session
export function logoutUser() {
  sessionStorage.removeItem(SESSION_USER_KEY);
}