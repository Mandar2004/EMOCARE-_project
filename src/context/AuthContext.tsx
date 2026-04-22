import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LocalUser,
  localSignIn,
  localSignUp,
  localSignOut,
  localGetCurrentUser,
  localResetPassword,
} from '../lib/localAuth';
import supabase from '../supabaseClient';

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

// ── Helpers ────────────────────────────────────────────────────────────────
function mapLocalUser(lu: LocalUser): User {
  return {
    id: lu.id,
    email: lu.email,
    name: lu.name,
    avatar: lu.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lu.email)}`,
  };
}

function mapSupabaseUser(su: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, string>;
}): User {
  const meta = su.user_metadata ?? {};
  return {
    id: su.id,
    email: su.email ?? '',
    name: meta['full_name'] ?? meta['name'] ?? su.email ?? 'User',
    avatar:
      meta['avatar_url'] ??
      meta['picture'] ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(su.email ?? su.id)}`,
  };
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restore local (email/password) session first
    const localUser = localGetCurrentUser();
    if (localUser) {
      setUser(mapLocalUser(localUser));
      setLoading(false);
      return;
    }

    // 2. Check for an active Supabase session (e.g. returned from Google OAuth redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    });

    // 3. Subscribe to Supabase auth state changes (handles OAuth redirect callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        // Only clear if there's no local session either
        const stillLocal = localGetCurrentUser();
        if (!stillLocal) setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const session = user ? { userId: user.id } : null;

  // ── Sign In (local email/password) ───────────────────────────────────
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error, user: lu } = localSignIn(email, password);
    if (error || !lu) return { error: error ?? 'Sign in failed.' };
    setUser(mapLocalUser(lu));
    return { error: null };
  };

  // ── Sign Up (local email/password) ───────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
    const { error, user: lu } = localSignUp(email, password, name);
    if (error || !lu) return { error: error ?? 'Sign up failed.' };
    setUser(mapLocalUser(lu));
    return { error: null, needsConfirmation: false };
  };

  // ── Google OAuth via Supabase ─────────────────────────────────────────
  const signInWithOAuth = async (
    provider: 'google' | 'facebook' | 'apple'
  ): Promise<{ error: string | null }> => {
    if (provider !== 'google') {
      return { error: 'Only Google sign-in is currently supported.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    // Browser redirects to Google — Supabase handles the callback automatically
    return { error: null };
  };

  // ── Sign Out ─────────────────────────────────────────────────────────
  const signOut = async () => {
    localSignOut();
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Reset Password ───────────────────────────────────────────────────
  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    return localResetPassword(email);
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
