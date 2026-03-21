import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
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
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
    signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
    isAuthenticated: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helper ─────────────────────────────────────────────────────────────────
function mapUser(su: SupabaseUser): User {
    const meta = su.user_metadata || {};
    return {
        id: su.id,
        email: su.email ?? '',
        name: meta.name || meta.full_name || su.email?.split('@')[0] || 'Friend',
        avatar: meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${su.email}`,
    };
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ? mapUser(session.user) : null);
            setLoading(false);
        });

        // Listen to auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ? mapUser(session.user) : null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // ── Sign In ──────────────────────────────────────────────────────────
    const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    };

    // ── Sign Up ──────────────────────────────────────────────────────────
    const signUp = async (
        email: string,
        password: string,
        name: string
    ): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) return { error: error.message };
        // Supabase returns a user but no session when email confirmation is required
        const needsConfirmation = !!data.user && !data.session;
        return { error: null, needsConfirmation };
    };

    // ── OAuth (Google / Apple) ────────────────────────────────────────────
    const signInWithOAuth = async (provider: 'google' | 'facebook'): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/` },
        });
        if (error) return { error: error.message };
        return { error: null };
    };

    // ── Sign Out ─────────────────────────────────────────────────────────
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    // ── Reset Password ───────────────────────────────────────────────────
    const resetPassword = async (email: string): Promise<{ error: string | null }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { error: error.message };
        return { error: null };
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
                isAuthenticated: !!session,
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
