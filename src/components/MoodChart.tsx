import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export function MoodChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mood/history')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch mood history:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="h-32 w-full mt-4 flex items-center justify-center text-xs text-slate-400 animate-pulse">Loading history...</div>;

    return (
        <div className="h-32 w-full mt-4">
            {data.length > 0 && data.some((d: any) => d.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#1e293b'
                            }}
                        />
                        <Bar dataKey="calm" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} barSize={20} />
                        <Bar dataKey="stress" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 gap-2 border-2 border-dashed border-slate-100 rounded-xl">
                    <span className="bg-slate-50 p-2 rounded-full">📊</span>
                    No mood history yet
                </div>
            )}
        </div>
    );
}
