import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import avatarImg from '../../assets/avatar.png';

export function SignOutPage() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-sm text-center relative overflow-hidden animate-in zoom-in duration-300">
                <div className="absolute top-0 left-0 w-full h-32 bg-green-50/50 -z-10 rounded-b-[50%]"></div>

                <div className="w-40 h-40 mx-auto bg-green-100 rounded-3xl mb-6 overflow-hidden relative">
                    <img src={avatarImg} alt="Wave" className="w-full h-full object-cover" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Taking a break?</h1>
                <p className="text-green-600/80 text-sm mb-8 px-4 leading-relaxed">
                    We'll be here when you need us. Remember to breathe and take care of yourself.
                </p>

                <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 transform transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 mb-4 flex items-center justify-center gap-2"
                >
                    {isLoading ? <><Loader2 size={20} className="animate-spin" /> Signing out...</> : 'Sign Out'}
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="text-sm font-bold text-slate-700 hover:text-slate-900 mb-8 block w-full"
                >
                    Stay a little longer
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-green-600/60 font-medium">
                    <span className="w-2 h-3 border border-current rounded-sm flex items-center justify-center">🔒</span>
                    Your data is safe and encrypted.
                </div>
            </div>
        </div>
    );
}
