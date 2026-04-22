// ── Local Auth System (replaces Supabase) ──────────────────────────────────
// Stores users & sessions in localStorage so the app works fully offline.

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  passwordHash: string; // simple base64 "hash" for demo purposes
  createdAt: string;
}

export interface LocalSession {
  userId: string;
  token: string;
  expiresAt: string;
}

const USERS_KEY = 'emocare_users';
const SESSION_KEY = 'emocare_session';

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Very simple encoding — NOT a real hash. Fine for a local demo. */
function encodePassword(password: string): string {
  return btoa(encodeURIComponent(password));
}

function verifyPassword(password: string, hash: string): boolean {
  return encodePassword(password) === hash;
}

// ── Storage helpers ────────────────────────────────────────────────────────
function getUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: LocalSession = JSON.parse(raw);
    // Check expiry
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function createSession(userId: string): LocalSession {
  const session: LocalSession = {
    userId,
    token: generateId(),
    // 30-day session
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// ── Public API ─────────────────────────────────────────────────────────────

export function localSignUp(
  email: string,
  password: string,
  name: string
): { error: string | null; user: LocalUser | null } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.', user: null };
  }
  const user: LocalUser = {
    id: generateId(),
    email,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    passwordHash: encodePassword(password),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  createSession(user.id);
  return { error: null, user };
}

export function localSignIn(
  email: string,
  password: string
): { error: string | null; user: LocalUser | null } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { error: 'No account found with that email address.', user: null };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { error: 'Incorrect password. Please try again.', user: null };
  }
  createSession(user.id);
  return { error: null, user };
}

export function localSignOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function localGetCurrentUser(): LocalUser | null {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.id === session.userId) ?? null;
}

export function localGetSession(): LocalSession | null {
  return getSession();
}

export function localResetPassword(_email: string): { error: string | null } {
  // In a real app this would send an email. For local demo, we just succeed.
  return { error: null };
}
