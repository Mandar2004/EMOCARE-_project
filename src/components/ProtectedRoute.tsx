import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { Loader2, Lock, Heart } from 'lucide-react';

/**
 * Wraps private routes.
 * - Loading → spinner
 * - Not authenticated → friendly gate page with manual Sign In button (no auto-popup)
 * - Authenticated → renders the child route
 */
export function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();
    const { openModal } = useAuthModal();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-violet-500" />
                    <p className="text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100 flex flex-col items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-10 text-center max-w-sm w-full">
                    {/* Lock icon */}
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Lock size={28} className="text-violet-600" />
                    </div>

                    {/* Brand */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
                            <Heart size={12} className="text-white" fill="white" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">EMOCARE+</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to unlock</h2>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        This feature is available to EMOCARE+ members. Create your free account or sign in to continue.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => openModal('signin')}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95 text-sm"
                        >
                            Sign In →
                        </button>
                        <button
                            onClick={() => openModal('signup')}
                            className="w-full py-3 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 font-semibold rounded-xl transition-all active:scale-95 text-sm"
                        >
                            Create Free Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <Outlet />;
}

