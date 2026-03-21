import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { StatCard } from './StatCard';
import { MoodChart } from './MoodChart';
import { EmotionDetector } from './EmotionDetector';
import { Smile, Mic, Play, ArrowRight, Sparkles } from 'lucide-react';
import avatarImg from '../assets/avatar.png';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function Dashboard() {
    const [showDetector, setShowDetector] = useState(false);
    const [lastMood, setLastMood] = useState<{ emotion: string; confidence: number; response?: string } | null>(null);
    const requireAuth = useRequireAuth();
    const [stats, setStats] = useState<{ total_checkins: number; active_days: number; last_mood?: any } | null>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setStats(data);
            if (data.last_mood) {
                setLastMood({
                    emotion: data.last_mood.emotion,
                    confidence: Math.round(data.last_mood.score * 100),
                    response: data.last_mood.suggested_response
                });
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
            // Fallback to mock stats for demo purposes
            setStats({
                total_checkins: 12,
                active_days: 3,
                last_mood: { emotion: 'calm', score: 0.9 }
            });
            setLastMood({
                emotion: 'calm',
                confidence: 90,
                response: "Peace comes from within."
            });
        }
    };

    // Fetch on mount and when detector closes (to refresh stats)
    useEffect(() => {
        fetchStats();
    }, [showDetector]);

    const handleMoodResult = (result: any) => {
        if (result && (result.dominant_emotion || result.emotion)) {
            const newMood = {
                emotion: result.dominant_emotion || result.emotion,
                confidence: Math.round((result.score || 0.85) * 100),
                response: result.suggested_response
            };
            setLastMood(newMood);
        }

        // Immediately refresh stats to show updated counts
        setTimeout(fetchStats, 500);
    }

    return (
        <div className="min-h-screen pb-12">
            <Navbar />

            {showDetector && (
                <EmotionDetector
                    onClose={() => setShowDetector(false)}
                    onResult={handleMoodResult}
                />
            )}

            <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Avatar Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                        <img
                            src={avatarImg}
                            alt="Emo Avatar"
                            className="w-full max-w-sm object-contain drop-shadow-2xl z-10 hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-6 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm z-20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_2px_rgba(74,222,128,0.5)]"></span>
                            Emo is listening
                        </div>
                    </div>

                    {/* Greeting & Input Card */}
                    <div className="glass-card p-10 flex flex-col justify-center">
                        <h4 className="text-indigo-500 uppercase tracking-widest text-xs font-bold mb-2">Welcome Back</h4>
                        <h1 className="text-5xl font-bold text-slate-800 mb-2 leading-tight">
                            How are you <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">feeling</span> today?
                        </h1>
                        <p className="text-slate-500 mb-8 max-w-md">
                            Share your thoughts, or just speak your mind. Our AI senses your mood to provide the best support.
                        </p>

                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex items-center gap-2 mb-6">
                            <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                <Smile size={24} />
                            </button>
                            <input
                                type="text"
                                placeholder="I'm feeling a bit overwhelmed today..."
                                className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-lg"
                                onFocus={requireAuth(() => {})}
                            />
                            <button
                                onClick={requireAuth(() => setShowDetector(true))}
                                className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-200 transition-colors"
                            >
                                Check-in
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center text-[10px] text-yellow-700 font-bold">+2k</div>
                            </div>
                            <span>Join 2,000+ others finding peace today</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Live Mood Analysis */}
                    <div className="glass-card p-6 md:col-span-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Live Mood Analysis</h3>
                                <p className="text-slate-400 text-xs">Real-time emotion detection active</p>
                            </div>
                            <div className={`p-2 rounded-full ${lastMood ? 'bg-violet-100 text-violet-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                                <Mic size={18} />
                            </div>
                        </div>
                        <MoodChart key={stats?.total_checkins} /> {/* Force re-render chart on update */}
                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                            <div>
                                <span className="text-xs text-slate-400 uppercase font-bold">Current State</span>
                                <p className="text-slate-800 font-bold capitalize">
                                    {lastMood ? lastMood.emotion : "No Data"}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 uppercase font-bold">Confidence</span>
                                <p className="text-violet-600 font-bold">
                                    {lastMood ? `${lastMood.confidence}%` : "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Daily Insight */}
                    <div className="glass-card p-6 md:col-span-1 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-yellow-100/50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-yellow-200/50"></div>

                        <div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Daily AI Insight</h3>
                                    <p className="text-slate-400 text-xs">Your reflection for today</p>
                                </div>
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
                                    <Sparkles size={18} />
                                </div>
                            </div>

                            <blockquote className="text-slate-700 italic font-medium leading-relaxed relative z-10">
                                {lastMood
                                    ? (lastMood.response || "Reflecting on your mood...")
                                    : "Check in with us to get your daily AI-generated insight based on your mood."}
                            </blockquote>
                        </div>

                        <div className="flex items-center justify-between mt-6 bg-white/50 p-3 rounded-2xl cursor-pointer hover:bg-white transition-colors relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                                    <Play size={14} fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">Mindfulness Tip</h4>
                                    <p className="text-[10px] text-slate-500">3 min exercise</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-400" />
                        </div>
                    </div>

                    {/* Small Stats Column */}
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <StatCard
                            title="Total Check-ins"
                            value={stats?.total_checkins?.toString() || "0"}
                            trend="All time"
                            trendUp={true}
                        />
                        <div className="grid grid-cols-2 gap-6 bg-transparent h-full">
                            <StatCard
                                title="Mood Stability"
                                value={lastMood ? (['happy', 'calm', 'neutral'].includes(lastMood.emotion) ? 'High' : 'Var') : '-'}
                                trend="Today"
                                trendUp={true}
                                className='bg-gradient-to-br from-indigo-50/50 to-white/80'
                            />
                            <StatCard
                                title="Active Days"
                                value={`${stats?.active_days || 0} Days`}
                                subtitle="Streak"
                                className='bg-gradient-to-br from-blue-50/50 to-white/80'
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
