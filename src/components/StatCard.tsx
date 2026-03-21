import React from 'react';


interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: string;
    trendUp?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export function StatCard({ title, value, subtitle, trend, trendUp, icon, className = "" }: StatCardProps) {
    return (
        <div className={`glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 ${className}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
                    <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
                        {value}
                        {trend && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                {trend}
                            </span>
                        )}
                    </div>
                </div>
                {icon && <div className="p-2 bg-white/60 rounded-xl">{icon}</div>}
            </div>
            {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
        </div>
    );
}
