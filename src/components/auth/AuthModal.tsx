import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import {
    Eye, EyeOff, Loader2, AlertCircle, CheckCircle, MailCheck,
    Heart, Brain, Sparkles, Shield, Check, X
} from 'lucide-react';

// ── SVG Logos ──────────────────────────────────────────────────────────────
const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);


// ── Password strength ──────────────────────────────────────────────────────
function getPasswordStrength(password: string) {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-400' };
    if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
    if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-400' };
    return { score, label: 'Very Strong', color: 'bg-emerald-500' };
}

const passwordRules = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

// ── Sign In Form ───────────────────────────────────────────────────────────
function SignInForm({ onSuccess }: { onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forgotMsg, setForgotMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const { error } = await signIn(email, password);
        setIsLoading(false);
        if (error) setError(error);
        else onSuccess();
    };

    const handleForgot = async () => {
        if (!email) { setError('Please enter your email address first.'); return; }
        setIsLoading(true);
        const { error } = await resetPassword(email);
        setIsLoading(false);
        if (error) setError(error);
        else setForgotMsg('Password reset email sent! Check your inbox.');
    };

    return (
        <div className="space-y-0">
            {error && (
                <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
                    <AlertCircle size={14} className="shrink-0" /><span>{error}</span>
                </div>
            )}
            {forgotMsg && (
                <div role="status" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-3 py-2.5 mb-4">
                    <CheckCircle size={14} className="shrink-0" /><span>{forgotMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="modal-email" className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                        id="modal-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label htmlFor="modal-password" className="text-xs font-semibold text-slate-700">Password</label>
                        <button type="button" onClick={handleForgot} className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            id="modal-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm pr-11"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200/50 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                >
                    {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In →'}
                </button>
            </form>
        </div>
    );
}

// ── Sign Up Form ───────────────────────────────────────────────────────────
function SignUpForm({ onConfirmNeeded }: { onConfirmNeeded: (email: string) => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const { closeModal } = useAuthModal();
    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setIsLoading(true);
        const { error, needsConfirmation } = await signUp(email, password, name);
        setIsLoading(false);
        if (error) setError(error);
        else if (needsConfirmation) onConfirmNeeded(email);
        else closeModal();
    };

    return (
        <div>
            {error && (
                <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
                    <AlertCircle size={14} className="shrink-0" /><span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1">
                    <label htmlFor="modal-name" className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                        id="modal-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Jane Doe"
                        required
                        className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="modal-signup-email" className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                        id="modal-signup-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="modal-signup-password" className="text-xs font-semibold text-slate-700">Password</label>
                    <div className="relative">
                        <input
                            id="modal-signup-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                            required
                            className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm pr-11"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {password && (
                        <div className="space-y-1.5 pt-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                                ))}
                            </div>
                            <p className="text-xs text-slate-400">Strength: <span className="font-semibold text-slate-600">{strength.label}</span></p>
                            <div className="space-y-0.5">
                                {passwordRules.map(rule => {
                                    const passed = rule.test(password);
                                    return (
                                        <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                                <Check size={8} className={passed ? 'text-emerald-600' : 'text-slate-300'} />
                                            </div>
                                            {rule.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200/50 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                >
                    {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account →'}
                </button>

                <p className="text-center text-xs text-slate-400">
                    By signing up you agree to our{' '}
                    <span className="underline cursor-pointer hover:text-slate-600">Terms</span> and{' '}
                    <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
                </p>
            </form>
        </div>
    );
}

// ── Confirmation Screen ────────────────────────────────────────────────────
function ConfirmationScreen({ email, onGoSignIn }: { email: string; onGoSignIn: () => void }) {
    return (
        <div className="text-center py-4">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MailCheck size={28} className="text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Check your inbox!</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                We sent a confirmation link to{' '}
                <strong className="text-slate-800">{email}</strong>.
                Click it to activate your account.
            </p>
            <button
                onClick={onGoSignIn}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200/50 transition-all active:scale-95 text-sm"
            >
                Back to Sign In →
            </button>
        </div>
    );
}

// ── Feature pills for header ───────────────────────────────────────────────
const featurePills = [
    { icon: Brain, label: 'AI Emotion Detection', color: 'bg-violet-500/15 text-violet-700' },
    { icon: Heart, label: 'Mood Tracking', color: 'bg-rose-500/15 text-rose-700' },
    { icon: Sparkles, label: 'Personalized Insights', color: 'bg-amber-500/15 text-amber-700' },
    { icon: Shield, label: 'Private & Encrypted', color: 'bg-emerald-500/15 text-emerald-700' },
];

// ── Main AuthModal ─────────────────────────────────────────────────────────
export function AuthModal() {
    const { isOpen, activeTab, closeModal, switchTab } = useAuthModal();
    const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

    // Close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
    }, [closeModal]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    // Reset confirmation state when modal re-opens
    useEffect(() => {
        if (!isOpen) setConfirmedEmail(null);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal panel */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
                            style={{ maxHeight: '92vh' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* ── Gradient Header ──────────────────────── */}
                            <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 px-6 pt-6 pb-5 relative overflow-hidden shrink-0">
                                {/* Decorative blobs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-400/10 rounded-full -translate-x-4 translate-y-4" />

                                {/* Close button */}
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all z-10"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>

                                {/* Logo + brand */}
                                <div className="relative z-10 flex items-center gap-2.5 mb-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                                        <Heart size={16} className="text-white" fill="white" />
                                    </div>
                                    <span className="text-white font-bold text-base tracking-tight">EMOCARE+</span>
                                </div>

                                {/* Feature pills */}
                                <div className="relative z-10 flex flex-wrap gap-2 mb-4">
                                    {featurePills.map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10 backdrop-blur-sm">
                                            <Icon size={11} />
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                {/* Tab switcher */}
                                {!confirmedEmail && (
                                    <div className="relative z-10 flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
                                        {(['signin', 'signup'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => switchTab(tab)}
                                                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab
                                                    ? 'bg-white text-violet-700 shadow-sm'
                                                    : 'text-white/70 hover:text-white'
                                                    }`}
                                            >
                                                {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Scrollable form body ──────────────────── */}
                            <div className="overflow-y-auto flex-1 px-6 py-5">
                                {confirmedEmail ? (
                                    <ConfirmationScreen
                                        email={confirmedEmail}
                                        onGoSignIn={() => { setConfirmedEmail(null); switchTab('signin'); }}
                                    />
                                ) : (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: activeTab === 'signin' ? -12 : 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: activeTab === 'signin' ? 12 : -12 }}
                                            transition={{ duration: 0.18 }}
                                        >
                                            {activeTab === 'signin' ? (
                                                <>
                                                    <p className="text-slate-500 text-sm mb-5">Welcome back 👋 Sign in to continue your wellness journey.</p>
                                                    <SignInForm onSuccess={closeModal} />
                                                    <p className="text-center mt-5 text-sm text-slate-500">
                                                        Don't have an account?{' '}
                                                        <button onClick={() => switchTab('signup')} className="font-bold text-violet-600 hover:text-violet-700">Create one free</button>
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-slate-500 text-sm mb-5">Start your wellness journey ✨ Free forever. No credit card required.</p>
                                                    <SignUpForm onConfirmNeeded={email => setConfirmedEmail(email)} />
                                                    <p className="text-center mt-5 text-sm text-slate-500">
                                                        Already have an account?{' '}
                                                        <button onClick={() => switchTab('signin')} className="font-bold text-violet-600 hover:text-violet-700">Sign In</button>
                                                    </p>
                                                </>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
