import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Heart, Brain, Sparkles, Shield } from 'lucide-react';

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

// Floating wellness feature pills for the left panel
const features = [
    { icon: Brain, label: 'AI Emotion Detection', color: 'bg-violet-500/20 text-violet-200' },
    { icon: Heart, label: 'Daily Mood Tracking', color: 'bg-rose-500/20 text-rose-200' },
    { icon: Sparkles, label: 'Personalized Insights', color: 'bg-amber-500/20 text-amber-200' },
    { icon: Shield, label: 'Private & Encrypted', color: 'bg-emerald-500/20 text-emerald-200' },
];

const quotes = [
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Mental health is not a destination, but a process.", author: "Noam Shpancer" },
    { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
];
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

export function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forgotMsg, setForgotMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const { error } = await signIn(email, password);
        setIsLoading(false);
        if (error) {
            setError(error);
        } else {
            navigate('/');
        }
    };

    const handleForgot = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setIsLoading(true);
        const { error } = await resetPassword(email);
        setIsLoading(false);
        if (error) {
            setError(error);
        } else {
            setForgotMsg('Password reset email sent! Check your inbox.');
        }
    };

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
                            Understand<br />your<br /><span className="text-violet-200">emotions.</span>
                        </h1>
                        <p className="text-violet-200/80 text-lg leading-relaxed max-w-sm">
                            Your personal companion for emotional wellness, powered by AI.
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

                    {/* Quote */}
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
                        <p className="text-white/90 italic text-sm leading-relaxed mb-3">"{randomQuote.text}"</p>
                        <p className="text-violet-300 text-xs font-medium">— {randomQuote.author}</p>
                    </div>
                </div>

                {/* Bottom trust badge */}
                <div className="relative z-10 flex items-center gap-2 text-violet-300/70 text-xs">
                    <Shield size={12} />
                    <span>Your data is private, encrypted, and never sold.</span>
                </div>
            </div>

            {/* ── Right Form Panel ────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
                            <Heart size={16} className="text-white" fill="white" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg">EMOCARE+</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-1">Welcome back 👋</h2>
                        <p className="text-slate-500 text-sm">Sign in to continue your wellness journey.</p>
                    </div>



                    {/* Error / Success Banners */}
                    {error && (
                        <div role="alert" aria-live="polite" className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {forgotMsg && (
                        <div role="status" aria-live="polite" className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
                            <CheckCircle size={16} className="shrink-0" />
                            <span>{forgotMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                aria-invalid={error ? "true" : "false"}
                                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-sm shadow-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                                <button
                                    type="button"
                                    onClick={handleForgot}
                                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transform transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In →'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-violet-600 hover:text-violet-700">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
