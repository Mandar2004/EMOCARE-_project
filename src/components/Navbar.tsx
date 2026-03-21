import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { openModal } = useAuthModal();
    const isActive = (path: string) => location.pathname === path;

    // Gate navigation to feature routes — open modal if not signed in
    const handleFeatureNav = useCallback(
        (e: React.MouseEvent, path: string) => {
            if (!isAuthenticated) {
                e.preventDefault();
                openModal('signin');
            } else {
                navigate(path);
            }
        },
        [isAuthenticated, openModal, navigate]
    );

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    E
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                    EMOCARE+
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium text-sm">
                {/* Dashboard is always free to explore */}
                <Link to="/" className={`transition-colors ${isActive('/') ? 'text-violet-600' : 'hover:text-violet-600'}`}>
                    Dashboard
                </Link>
                {/* Feature links — gate with modal if not authenticated */}
                <a
                    href="/trends"
                    onClick={e => handleFeatureNav(e, '/trends')}
                    className={`transition-colors cursor-pointer ${isActive('/trends') ? 'text-violet-600' : 'hover:text-violet-600'}`}
                >
                    Trends
                </a>
                <a
                    href="/screening"
                    onClick={e => handleFeatureNav(e, '/screening')}
                    className={`transition-colors cursor-pointer ${isActive('/screening') ? 'text-violet-600' : 'hover:text-violet-600'}`}
                >
                    Screening
                </a>
                <a
                    href="/resources"
                    onClick={e => handleFeatureNav(e, '/resources')}
                    className={`transition-colors cursor-pointer ${isActive('/resources') ? 'text-violet-600' : 'hover:text-violet-600'}`}
                >
                    Resources
                </a>
            </div>

            <div className="flex items-center gap-4">
                {/* Talk to Emo — gated */}
                <a
                    href="/chat"
                    onClick={e => handleFeatureNav(e, '/chat')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-medium hover:bg-orange-200 transition-colors text-sm cursor-pointer"
                >
                    <MessageCircle size={18} />
                    Talk to Emo
                </a>

                {/* Account / sign in avatar */}
                {isAuthenticated ? (
                    <Link
                        to="/account"
                        className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 ring-violet-200 transition-all"
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={20} className="text-slate-500" />
                        )}
                    </Link>
                ) : (
                    <button
                        onClick={() => openModal('signin')}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold text-sm transition-colors"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
}
