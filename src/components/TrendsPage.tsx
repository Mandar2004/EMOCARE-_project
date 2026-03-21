import { Navbar } from './Navbar';
import { MoodTrendsChart } from './MoodTrendsChart';
import { StatCard } from './StatCard';
import { Smile, Frown, Meh, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const mockCalendarData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    mood: Math.random() > 0.8 ? 'stress' : Math.random() > 0.5 ? 'neutral' : 'happy'
}));

export function TrendsPage() {
    return (
        <div className="min-h-screen pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Your Emotional Trends</h1>
                    <p className="text-slate-500">Track your progress and understand your patterns.</p>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Average Mood" value="Positive" icon={<TrendingUp size={20} className="text-green-500" />} />
                    <StatCard title="Primary Trigger" value="Work Load" icon={<AlertCircle size={20} className="text-orange-500" />} />
                    <StatCard title="Monthly Check-ins" value="24" icon={<Calendar size={20} className="text-violet-500" />} />
                </div>

                {/* Main Chart */}
                <div className="glass-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Resilience vs Stress</h3>
                        <select className="bg-slate-50 border-none text-slate-500 text-sm rounded-lg px-3 py-2 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <MoodTrendsChart />
                </div>

                {/* Calendar Heatmap */}
                <div className="glass-card p-8">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Monthly Mood Calendar</h3>
                    <div className="grid grid-cols-7 gap-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-slate-400 text-xs font-bold uppercase">{day}</div>
                        ))}
                        {mockCalendarData.map((d, i) => (
                            <div key={i} className="aspect-square rounded-2xl flex flex-col items-center justify-center relative group transition-all hover:scale-110 bg-slate-50 shadow-sm border border-slate-100">
                                {d.mood === 'happy' ? (
                                    <Smile className="text-green-500 w-8 h-8 mb-1" />
                                ) : d.mood === 'stress' ? (
                                    <Frown className="text-red-500 w-8 h-8 mb-1" />
                                ) : (
                                    <Meh className="text-yellow-500 w-8 h-8 mb-1" />
                                )}
                                <span className="text-[10px] font-bold text-slate-400 absolute bottom-1 right-2">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
