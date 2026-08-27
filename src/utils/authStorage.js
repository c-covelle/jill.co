const USERS_KEY = 'project_jill_users';
const CURRENT_USER_KEY = 'project_jill_current_user';

// Get registered accounts
export function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [
      { email: 'crissian@example.com', name: 'Crissian Jill', password: 'password123' },
      { email: 'demo@projectjill.com', name: 'Demo Candidate', password: 'demo' }
    ];
  } catch (e) {
    return [];
  }
}

// Sign up / Create account
export function registerUser(email, password, name = "Crissian Jill") {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please sign in.' };
  }

  const newUser = {
    id: 'PJ-' + Math.floor(1000 + Math.random() * 9000),
    email: cleanEmail,
    name: name.trim() || 'Crissian Jill',
    password: password,
    joinedDate: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return { success: true, user: newUser };
}

// Authenticate / Sign in
export function authenticateUser(email, password) {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();

  // Allow instant trial bypass for 'demo'
  if (cleanEmail === 'demo') {
    const demoUser = { id: 'PJ-DEMO', email: 'demo@projectjill.com', name: 'Crissian Jill' };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
    return { success: true, user: demoUser };
  }

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    // If not found, automatically register them as a trial candidate
    return registerUser(cleanEmail, password || 'trial123', 'Crissian Jill');
  }

  if (password && user.password && user.password !== password) {
    return { success: false, message: 'Invalid password credential.' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

// Get Active Logged-in Candidate
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// Sign out
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}