import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { ChevronRight, Check, AlertTriangle, ShieldCheck, TrendingUp, BookOpen, Heart, Phone } from 'lucide-react';

const questions = [
    { id: 1, text: "Feeling nervous, anxious, or on edge" },
    { id: 2, text: "Not being able to stop or control worrying" },
    { id: 3, text: "Worrying too much about different things" },
    { id: 4, text: "Trouble relaxing" },
    { id: 5, text: "Being so restless that it is hard to sit still" },
    { id: 6, text: "Becoming easily annoyed or irritable" },
    { id: 7, text: "Feeling afraid, as if something awful might happen" }
];

const options = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
];

interface SeverityInfo {
    level: string;
    color: string;
    bg: string;
    icon: JSX.Element;
    description: string;
    recommendations: string[];
}

interface HistoryItem {
    id: number;
    score: number;
    severity_level: string;
    timestamp: string;
}

export function Questionnaire() {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/gad7/history?limit=5');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (e) {
            console.error('Failed to fetch GAD-7 history', e);
        }
    };

    const handleSelect = (qId: number, value: number) => {
        setAnswers(prev => {
            const updated = { ...prev, [qId]: value };
            console.log('Selected:', { qId, value, totalAnswers: Object.keys(updated).length });
            return updated;
        });
    };

    const calculateScore = () => {
        const total = Object.values(answers).reduce((a, b) => a + b, 0);
        return total;
    };

    const getSeverityInfo = (score: number): SeverityInfo => {
        if (score <= 4) {
            return {
                level: "Minimal Anxiety",
                color: "text-green-600",
                bg: "bg-green-100",
                icon: <ShieldCheck size={32} />,
                description: "Your responses indicate minimal anxiety symptoms. This is a healthy range.",
                recommendations: [
                    "Maintain healthy lifestyle habits like regular exercise and good sleep",
                    "Continue practicing stress management techniques",
                    "Stay connected with supportive friends and family"
                ]
            };
        }
        if (score <= 9) {
            return {
                level: "Mild Anxiety",
                color: "text-yellow-600",
                bg: "bg-yellow-100",
                icon: <Check size={32} />,
                description: "Your responses suggest mild anxiety symptoms. These are manageable with self-care strategies.",
                recommendations: [
                    "Practice daily breathing exercises and mindfulness meditation",
                    "Identify and challenge anxious thoughts with cognitive techniques",
                    "Maintain a regular sleep schedule and limit caffeine",
                    "Engage in regular physical activity (at least 30 minutes daily)"
                ]
            };
        }
        if (score <= 14) {
            return {
                level: "Moderate Anxiety",
                color: "text-orange-600",
                bg: "bg-orange-100",
                icon: <AlertTriangle size={32} />,
                description: "Your responses indicate moderate anxiety that may be interfering with daily activities.",
                recommendations: [
                    "Consider scheduling an appointment with a mental health professional",
                    "Practice structured relaxation techniques (progressive muscle relaxation)",
                    "Try journaling to process anxious thoughts and feelings",
                    "Limit alcohol and avoid self-medication",
                    "Explore therapy options like Cognitive Behavioral Therapy (CBT)"
                ]
            };
        }
        return {
            level: "Severe Anxiety",
            color: "text-red-600",
            bg: "bg-red-100",
            icon: <AlertTriangle size={32} />,
            description: "Your responses suggest severe anxiety that is significantly impacting your well-being.",
            recommendations: [
                "Consult with a healthcare provider or mental health professional soon",
                "Contact a crisis helpline if you're in immediate distress (988)",
                "Avoid making major life decisions until symptoms improve",
                "Build a support system - reach out to trusted friends or family",
                "Consider both therapy and medication options with professional guidance"
            ]
        };
    };

    const submitResults = async () => {
        console.log('Submit clicked! Answers:', answers);
        console.log('Is complete?', isComplete, 'Score:', calculateScore());

        setSubmitting(true);
        const score = calculateScore();
        const severity = getSeverityInfo(score);

        console.log('Submitting:', { score, severity: severity.level });

        try {
            const response = await fetch('/api/gad7/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: score,
                    severity_level: severity.level,
                    answers: answers
                })
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                setShowResult(true);
                fetchHistory(); // Refresh history
            } else {
                console.error('Failed to submit:', response.statusText);
                // Still show results even if backend fails
                setShowResult(true);
            }
        } catch (e) {
            console.error('Failed to submit GAD-7 results', e);
            // Still show results even if backend fails
            setShowResult(true);
        } finally {
            setSubmitting(false);
        }
    };

    const isComplete = questions.every(q => answers[q.id] !== undefined);
    console.log('Render - Form complete?', isComplete, 'Answers count:', Object.keys(answers).length);
    const score = calculateScore();
    const severityInfo = getSeverityInfo(score);

    return (
        <div className="min-h-screen pb-12">
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 pt-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">GAD-7 Anxiety Screening</h1>
                    <p className="text-slate-500">Over the last 2 weeks, how often have you been bothered by the following problems?</p>
                </div>

                {/* History Section */}
                {history.length > 0 && !showResult && (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-violet-600" size={20} />
                            <h3 className="font-semibold text-slate-800">Your Screening History</h3>
                        </div>
                        <div className="space-y-2">
                            {history.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <span className="text-sm font-medium text-slate-700">{item.severity_level}</span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            {new Date(item.timestamp).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">{item.score}/21</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!showResult ? (
                    <div className="space-y-6">
                        {questions.map((q) => (
                            <div key={q.id} className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${q.id * 100}ms` }}>
                                <h3 className="font-semibold text-slate-800 mb-4">{q.id}. {q.text}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(q.id, opt.value)}
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${answers[q.id] === opt.value
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 scale-105'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end pt-4">
                            <button
                                disabled={!isComplete || submitting}
                                onClick={submitResults}
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {submitting ? 'Submitting...' : 'See Results'} <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="glass-card p-10 text-center animate-in zoom-in duration-300">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${severityInfo.bg} ${severityInfo.color}`}>
                                {severityInfo.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Result: {severityInfo.level}</h2>
                            <p className="text-4xl font-bold text-violet-600 mb-4">{score}/21</p>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                {severityInfo.description}
                            </p>
                        </div>

                        {/* Recommendations */}
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Heart className="text-violet-600" size={24} />
                                Recommended Next Steps
                            </h3>
                            <ul className="space-y-3">
                                {severityInfo.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-semibold">
                                            {idx + 1}
                                        </span>
                                        <span className="text-slate-700">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources */}
                        {score > 9 && (
                            <div className="glass-card p-8 bg-gradient-to-br from-violet-50 to-indigo-50">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="text-violet-600" size={24} />
                                    Helpful Resources
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <a href="/resources" className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold">
                                        Browse Wellness Resources →
                                    </a>
                                    <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                                        <Phone className="text-red-600 flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <p className="font-semibold text-red-800 mb-1">24/7 Crisis Support</p>
                                            <p className="text-red-700">If you're in immediate distress, call or text <strong>988</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm flex items-start gap-3">
                            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                            <p><strong>Disclaimer:</strong> This screening tool is for informational purposes only and does not constitute a medical diagnosis. Always consult with a healthcare professional for clinical advice.</p>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => { setShowResult(false); setAnswers({}); }}
                                className="text-violet-600 font-semibold hover:text-violet-700 hover:underline"
                            >
                                Retake Assessment
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
