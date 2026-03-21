import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, MailCheck, Heart, Brain, Sparkles, Shield, Check } from 'lucide-react';

// ── SVG Logos ──────────────────────────────────────────────────────────────
const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const AppleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.22 1.3-2.2 3.88.03 3.06 2.69 4.08 2.72 4.1-.03.07-.42 1.44-1.38 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

// ── Password Strength Meter ────────────────────────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
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

// Left panel features
const features = [
    { icon: Brain, label: 'AI Emotion Detection', color: 'bg-violet-500/20 text-violet-200' },
    { icon: Heart, label: 'Daily Mood Tracking', color: 'bg-rose-500/20 text-rose-200' },
    { icon: Sparkles, label: 'Personalized Insights', color: 'bg-amber-500/20 text-amber-200' },
    { icon: Shield, label: 'Private & Encrypted', color: 'bg-emerald-500/20 text-emerald-200' },
];

export function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
    const [registered, setRegistered] = useState(false);
    const { signUp, signInWithOAuth } = useAuth();
    const navigate = useNavigate();

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        const { error, needsConfirmation } = await signUp(email, password, name);
        setIsLoading(false);

        if (error) {
            setError(error);
        } else if (needsConfirmation) {
            setRegistered(true);
        } else {
            navigate('/');
        }
    };

    const handleOAuth = async (provider: 'google' | 'apple') => {
        setError(null);
        setOauthLoading(provider);
        const { error } = await signInWithOAuth(provider);
        if (error) {
            setError(error);
            setOauthLoading(null);
        }
    };

    // ── Email Confirmation Screen ────────────────────────────────────────
    if (registered) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 p-4">
                <div className="bg-white border border-slate-100 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MailCheck size={36} className="text-violet-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your inbox!</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        We sent a confirmation link to{' '}
                        <strong className="text-slate-800">{email}</strong>.
                        Click it to activate your account and begin your wellness journey.
                    </p>
                    <Link
                        to="/signin"
                        className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95 text-sm"
                    >
                        Go to Sign In →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white">

            {/* ── Left Decorative Panel ───────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-[52%] bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-900 p-14 relative overflow-hidden">

                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                            <Heart size={20} className="text-white" fill="white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">EMOCARE+</span>
                    </div>
                </div>

                {/* Main copy */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                            Start your<br />wellness<br /><span className="text-violet-200">journey.</span>
                        </h1>
                        <p className="text-violet-200/80 text-lg leading-relaxed max-w-sm">
                            Join thousands discovering clarity and emotional balance with EMOCARE+.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-3">
                        {features.map(({ icon: Icon, label, color }) => (
                            <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 ${color} text-sm font-medium`}>
                                <Icon size={14} />
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex -space-x-2">
                                {['🧘', '😊', '💪', '🌱'].map((e, i) => (
                                    <div key={i} className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/30 flex items-center justify-center text-sm">{e}</div>
                                ))}
                            </div>
                            <p className="text-white/80 text-sm font-medium">Join 5,000+ users</p>
                        </div>
                        <p className="text-violet-200/70 text-xs leading-relaxed">
                            "EMOCARE+ helped me understand my anxiety patterns and find real calm." — Sarah K.
                        </p>
                    </div>
                </div>

                {/* Bottom trust badge */}
                <div className="relative z-10 flex items-center gap-2 text-violet-300/70 text-xs">
                    <Shield size={12} />
                    <span>Your data is private, encrypted, and never sold.</span>
                </div>
            </div>

            {/* ── Right Form Panel ────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-md py-6">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
                            <Heart size={16} className="text-white" fill="white" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg">EMOCARE+</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-1">Create your account ✨</h2>
                        <p className="text-slate-500 text-sm">Free forever. No credit card required.</p>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => handleOAuth('google')}
                            disabled={!!oauthLoading || isLoading}
                            className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 font-semibold text-slate-700 text-sm"
                        >
                            {oauthLoading === 'google' ? <Loader2 size={18} className="animate-spin text-slate-400" /> : <GoogleLogo />}
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuth('apple')}
                            disabled={!!oauthLoading || isLoading}
                            className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-black border border-slate-900 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 font-semibold text-white text-sm"
                        >
                            {oauthLoading === 'apple' ? <Loader2 size={18} className="animate-spin" /> : <AppleLogo />}
                            Apple
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center mb-6">
                        <div className="flex-grow border-t border-slate-200" />
                        <span className="mx-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-slate-200" />
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div role="alert" aria-live="polite" className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe"
                                required
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm"
                            />
                        </div>

                        {/* Password + Strength Meter */}
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                    aria-invalid={error ? "true" : "false"}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Strength Bar */}
                            {password && (
                                <div className="space-y-2 pt-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Password strength: <span className="font-semibold text-slate-700">{strength.label}</span>
                                    </p>

                                    {/* Rules checklist */}
                                    <div className="space-y-1">
                                        {passwordRules.map(rule => {
                                            const passed = rule.test(password);
                                            return (
                                                <div key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${passed ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                                        <Check size={10} className={passed ? 'text-emerald-600' : 'text-slate-300'} />
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
                            disabled={isLoading || !!oauthLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transform transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account →'}
                        </button>

                        <p className="text-center text-xs text-slate-400 pt-1">
                            By signing up you agree to our{' '}
                            <span className="underline cursor-pointer hover:text-slate-600">Terms</span> and{' '}
                            <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
                        </p>
                    </form>

                    <p className="text-center mt-6 text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/signin" className="font-bold text-violet-600 hover:text-violet-700">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
