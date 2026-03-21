import { Navbar } from '../Navbar';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Settings, Shield, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccountPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pb-12">
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 pt-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Account</h1>
                    <p className="text-slate-500">Manage your profile and preferences.</p>
                </div>

                <div className="glass-card p-8 flex items-center gap-6">
                    <div className="w-24 h-24 bg-violet-100 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{user?.name || "Guest User"}</h2>
                        <p className="text-slate-500">{user?.email || "Not signed in"}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            Free Plan
                        </span>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm border border-slate-100">
                        <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><UserIcon size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">Personal Details</h3>
                            <p className="text-xs text-slate-400">Update your name and bio</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm border border-slate-100">
                        <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Settings size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">Preferences</h3>
                            <p className="text-xs text-slate-400">Theme, language, and display</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm border border-slate-100">
                        <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Bell size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">Notifications</h3>
                            <p className="text-xs text-slate-400">Manage your alerts</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm border border-slate-100">
                        <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Shield size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">Privacy & Security</h3>
                            <p className="text-xs text-slate-400">Password and connected accounts</p>
                        </div>
                    </div>
                </div>

                <Link to="/signout" className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors w-full">
                    <LogOut size={20} />
                    Sign Out
                </Link>

            </main>
        </div>
    );
}
