import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LocalUser,
  localSignIn,
  localSignUp,
  localSignOut,
  localGetCurrentUser,
  localResetPassword,
} from '../lib/localAuth';

// ── Types ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  session: { userId: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helper ─────────────────────────────────────────────────────────────────
function mapUser(lu: LocalUser): User {
  return {
    id: lu.id,
    email: lu.email,
    name: lu.name,
    avatar: lu.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lu.email)}`,
  };
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const currentUser = localGetCurrentUser();
    setUser(currentUser ? mapUser(currentUser) : null);
    setLoading(false);
  }, []);

  const session = user ? { userId: user.id } : null;

  // ── Sign In ──────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error, user: lu } = localSignIn(email, password);
    if (error || !lu) return { error: error ?? 'Sign in failed.' };
    setUser(mapUser(lu));
    return { error: null };
  };

  // ── Sign Up ──────────────────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
    const { error, user: lu } = localSignUp(email, password, name);
    if (error || !lu) return { error: error ?? 'Sign up failed.' };
    setUser(mapUser(lu));
    // No email confirmation needed for local auth
    return { error: null, needsConfirmation: false };
  };

  // ── OAuth (not supported locally — show friendly error) ───────────────
  const signInWithOAuth = async (_provider: 'google' | 'facebook' | 'apple'): Promise<{ error: string | null }> => {
    return { error: 'OAuth sign-in is not available in offline mode. Please use email & password.' };
  };

  // ── Sign Out ─────────────────────────────────────────────────────────
  const signOut = async () => {
    localSignOut();
    setUser(null);
  };

  // ── Reset Password ───────────────────────────────────────────────────
  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const result = localResetPassword(email);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
