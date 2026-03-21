import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
    BookOpen, Video, Phone, ExternalLink, Heart, Bookmark,
    Search, X, Brain, Headphones, Leaf, Shield, Sparkles, Sun,
    MessageCircle, Activity
} from 'lucide-react';

interface Resource {
    id: number;
    title: string;
    description: string;
    category: string;
    url: string;
    tags: string[];
    icon_type: string;
    color: string;
    bookmarked: boolean;
}

const iconMap: Record<string, any> = {
    book: BookOpen,
    video: Video,
    phone: Phone,
    heart: Heart,
    external: ExternalLink,
    brain: Brain,
    headphones: Headphones,
    leaf: Leaf,
    shield: Shield,
    sparkles: Sparkles,
    sun: Sun,
    chat: MessageCircle,
    activity: Activity,
};

const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
    red: 'bg-red-50 text-red-500',
    rose: 'bg-rose-50 text-rose-500',
    indigo: 'bg-indigo-50 text-indigo-500',
    green: 'bg-green-50 text-green-500',
    amber: 'bg-amber-50 text-amber-500',
    teal: 'bg-teal-50 text-teal-500',
    sky: 'bg-sky-50 text-sky-500',
    violet: 'bg-violet-50 text-violet-500',
    emerald: 'bg-emerald-50 text-emerald-500',
    orange: 'bg-orange-50 text-orange-500',
};

// ── Curated Wellness Resources ──────────────────────────────────────────────
const allResources: Resource[] = [
    // ── Hotlines ────────────────────────────────
    {
        id: 1,
        title: 'National Suicide Prevention Lifeline',
        description: 'Free, confidential 24/7 support for people in distress. Call or text 988 anytime.',
        category: 'Hotline',
        url: 'https://988lifeline.org',
        tags: ['crisis', 'suicide prevention', '24/7'],
        icon_type: 'phone',
        color: 'red',
        bookmarked: false,
    },
    {
        id: 2,
        title: 'Crisis Text Line',
        description: 'Text HOME to 741741 to connect with a trained crisis counselor. Available 24/7.',
        category: 'Hotline',
        url: 'https://www.crisistextline.org',
        tags: ['crisis', 'text support', '24/7'],
        icon_type: 'chat',
        color: 'rose',
        bookmarked: false,
    },
    {
        id: 3,
        title: 'iCall — TISS (India)',
        description: 'Psychosocial helpline by TISS. Call 9152987821, Mon–Sat, 8 AM – 10 PM IST.',
        category: 'Hotline',
        url: 'https://icallhelpline.org',
        tags: ['India', 'counseling', 'mental health'],
        icon_type: 'phone',
        color: 'red',
        bookmarked: false,
    },
    {
        id: 4,
        title: 'Vandrevala Foundation (India)',
        description: '24/7 mental health helpline. Call 1860-2662-345 or 1800-2333-330 (toll-free).',
        category: 'Hotline',
        url: 'https://www.vandrevalafoundation.com',
        tags: ['India', 'toll-free', '24/7'],
        icon_type: 'phone',
        color: 'red',
        bookmarked: false,
    },

    // ── Articles & Guides ───────────────────────
    {
        id: 5,
        title: 'Understanding Anxiety — NIMH',
        description: 'Comprehensive guide by the National Institute of Mental Health on anxiety disorders, symptoms, and treatments.',
        category: 'Article',
        url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
        tags: ['anxiety', 'education', 'research'],
        icon_type: 'book',
        color: 'blue',
        bookmarked: false,
    },
    {
        id: 6,
        title: 'The Science of Gratitude',
        description: 'How practicing gratitude rewires your brain for happiness — research-backed insights from UC Berkeley.',
        category: 'Article',
        url: 'https://greatergood.berkeley.edu/topic/gratitude',
        tags: ['gratitude', 'neuroscience', 'happiness'],
        icon_type: 'sparkles',
        color: 'amber',
        bookmarked: false,
    },
    {
        id: 7,
        title: 'Cognitive Behavioral Therapy (CBT) Basics',
        description: 'Learn the fundamentals of CBT — the gold standard therapy for depression and anxiety.',
        category: 'Article',
        url: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral',
        tags: ['CBT', 'therapy', 'self-help'],
        icon_type: 'brain',
        color: 'purple',
        bookmarked: false,
    },
    {
        id: 8,
        title: 'How to Build Emotional Resilience',
        description: 'A practical guide from the American Psychological Association on bouncing back from adversity.',
        category: 'Article',
        url: 'https://www.apa.org/topics/resilience',
        tags: ['resilience', 'coping', 'mental strength'],
        icon_type: 'shield',
        color: 'emerald',
        bookmarked: false,
    },
    {
        id: 9,
        title: 'Sleep & Mental Health',
        description: 'Harvard Medical School explains the deep connection between sleep quality and emotional well-being.',
        category: 'Article',
        url: 'https://www.health.harvard.edu/newsletter_article/sleep-and-mental-health',
        tags: ['sleep', 'health', 'research'],
        icon_type: 'sun',
        color: 'sky',
        bookmarked: false,
    },

    // ── Meditation & Mindfulness ────────────────
    {
        id: 10,
        title: 'Headspace — Guided Meditation',
        description: 'Award-winning meditation app with guided sessions for stress, anxiety, sleep, and focus.',
        category: 'Meditation',
        url: 'https://www.headspace.com',
        tags: ['meditation', 'app', 'guided'],
        icon_type: 'headphones',
        color: 'orange',
        bookmarked: false,
    },
    {
        id: 11,
        title: 'Insight Timer — Free Meditations',
        description: 'World\'s largest free meditation library with 150,000+ guided sessions from expert teachers.',
        category: 'Meditation',
        url: 'https://insighttimer.com',
        tags: ['meditation', 'free', 'community'],
        icon_type: 'headphones',
        color: 'teal',
        bookmarked: false,
    },
    {
        id: 12,
        title: 'Mindful Breathing Exercises',
        description: 'Interactive breathing exercises (box breathing, 4-7-8, etc.) with visual guides you can follow along.',
        category: 'Meditation',
        url: 'https://www.breathwrk.com',
        tags: ['breathing', 'anxiety relief', 'interactive'],
        icon_type: 'leaf',
        color: 'green',
        bookmarked: false,
    },

    // ── Videos ──────────────────────────────────
    {
        id: 13,
        title: 'How to Make Stress Your Friend — TED',
        description: 'Kelly McGonigal\'s viral TED talk on reframing stress as a positive force. 16M+ views.',
        category: 'Video',
        url: 'https://www.ted.com/talks/kelly_mcgonigal_how_to_make_stress_your_friend',
        tags: ['stress', 'TED talk', 'mindset'],
        icon_type: 'video',
        color: 'indigo',
        bookmarked: false,
    },
    {
        id: 14,
        title: 'The Power of Vulnerability — Brené Brown',
        description: 'One of the most watched TED talks ever. Brené Brown explores how vulnerability is the birthplace of connection.',
        category: 'Video',
        url: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability',
        tags: ['vulnerability', 'TED talk', 'connection'],
        icon_type: 'video',
        color: 'purple',
        bookmarked: false,
    },
    {
        id: 15,
        title: 'Yoga With Adriene — Yoga for Anxiety',
        description: 'Free 20-minute yoga session specifically designed to relieve anxiety and calm your nervous system.',
        category: 'Video',
        url: 'https://www.youtube.com/watch?v=hJbRpHZr_d0',
        tags: ['yoga', 'anxiety', 'free'],
        icon_type: 'activity',
        color: 'violet',
        bookmarked: false,
    },
    {
        id: 16,
        title: 'What Is Depression? — WHO',
        description: 'World Health Organization\'s animated explainer on depression — accessible, clear, and stigma-free.',
        category: 'Video',
        url: 'https://www.youtube.com/watch?v=z-IR48Mb3W0',
        tags: ['depression', 'education', 'WHO'],
        icon_type: 'video',
        color: 'blue',
        bookmarked: false,
    },

    // ── Self-Help Tools ─────────────────────────
    {
        id: 17,
        title: 'MoodTools — Depression & Anxiety',
        description: 'Free evidence-based app with thought diary, safety plan, and activity scheduling tools.',
        category: 'Self-Help',
        url: 'https://www.moodtools.org',
        tags: ['app', 'depression', 'CBT tools'],
        icon_type: 'heart',
        color: 'rose',
        bookmarked: false,
    },
    {
        id: 18,
        title: 'Woebot — AI Therapy Chatbot',
        description: 'AI-powered mental health chatbot using CBT techniques. Available 24/7 on iOS and Android.',
        category: 'Self-Help',
        url: 'https://woebothealth.com',
        tags: ['AI', 'CBT', 'chatbot'],
        icon_type: 'brain',
        color: 'indigo',
        bookmarked: false,
    },
    {
        id: 19,
        title: 'Journaling Prompts for Mental Health',
        description: '50+ therapeutic journaling prompts to explore your emotions, patterns, and path to healing.',
        category: 'Self-Help',
        url: 'https://positivepsychology.com/journaling-for-mindfulness/',
        tags: ['journaling', 'self-reflection', 'free'],
        icon_type: 'book',
        color: 'amber',
        bookmarked: false,
    },
    {
        id: 20,
        title: 'Grounding Techniques for Anxiety',
        description: '10 grounding exercises you can do anywhere — 5-4-3-2-1 technique, cold water, body scan, and more.',
        category: 'Self-Help',
        url: 'https://www.therapistaid.com/therapy-worksheet/grounding-techniques',
        tags: ['grounding', 'anxiety', 'worksheets'],
        icon_type: 'leaf',
        color: 'green',
        bookmarked: false,
    },

    // ── Community ───────────────────────────────
    {
        id: 21,
        title: 'NAMI — National Alliance on Mental Illness',
        description: 'The largest grassroots mental health organization. Find local support groups and educational programs.',
        category: 'Community',
        url: 'https://www.nami.org',
        tags: ['support groups', 'community', 'education'],
        icon_type: 'heart',
        color: 'teal',
        bookmarked: false,
    },
    {
        id: 22,
        title: '7 Cups — Free Online Therapy & Counseling',
        description: 'Connect with trained volunteer listeners 24/7. Free peer support and affordable online therapy.',
        category: 'Community',
        url: 'https://www.7cups.com',
        tags: ['peer support', 'free', 'listeners'],
        icon_type: 'chat',
        color: 'emerald',
        bookmarked: false,
    },
    {
        id: 23,
        title: 'r/MentalHealth — Reddit Community',
        description: 'Supportive Reddit community with 1M+ members sharing experiences, advice, and solidarity.',
        category: 'Community',
        url: 'https://www.reddit.com/r/mentalhealth/',
        tags: ['reddit', 'community', 'peer support'],
        icon_type: 'chat',
        color: 'orange',
        bookmarked: false,
    },

    // ── Professional Help ───────────────────────
    {
        id: 24,
        title: 'BetterHelp — Online Therapy',
        description: 'Connect with a licensed therapist from the comfort of your home. Chat, phone, or video sessions.',
        category: 'Professional',
        url: 'https://www.betterhelp.com',
        tags: ['therapy', 'online', 'licensed'],
        icon_type: 'shield',
        color: 'sky',
        bookmarked: false,
    },
    {
        id: 25,
        title: 'Psychology Today — Find a Therapist',
        description: 'The #1 therapist directory. Search by location, specialty, insurance, and more.',
        category: 'Professional',
        url: 'https://www.psychologytoday.com/us/therapists',
        tags: ['therapist finder', 'directory', 'in-person'],
        icon_type: 'external',
        color: 'blue',
        bookmarked: false,
    },
];

// Extract unique categories
const allCategories = ['All', ...Array.from(new Set(allResources.map(r => r.category)))];

export function ResourcesPage() {
    const navigate = useNavigate();
    const [resources, setResources] = useState<Resource[]>(allResources);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResources = resources.filter(r => {
        const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
    });

    const toggleBookmark = (resourceId: number) => {
        setResources(prev => prev.map(r =>
            r.id === resourceId ? { ...r, bookmarked: !r.bookmarked } : r
        ));
    };

    const handleResourceClick = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Wellness Resources</h1>
                    <p className="text-slate-500">Curated tools, articles, and support to nurture your mental well-being.</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search resources by title, description, or tags..."
                        className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-100 text-slate-700 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Category Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {allCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                <p className="text-sm text-slate-500">
                    {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
                </p>

                {/* Resources Grid */}
                {filteredResources.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500">No resources found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((item) => {
                            const Icon = iconMap[item.icon_type] || ExternalLink;
                            const colorClass = colorMap[item.color] || 'bg-slate-50 text-slate-500';

                            return (
                                <div
                                    key={item.id}
                                    className="glass-card p-6 flex flex-col hover:scale-[1.02] transition-transform group relative"
                                >
                                    {/* Bookmark Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleBookmark(item.id);
                                        }}
                                        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${item.bookmarked
                                                ? 'bg-violet-100 text-violet-600'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        title={item.bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                                    >
                                        <Bookmark size={16} fill={item.bookmarked ? 'currentColor' : 'none'} />
                                    </button>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${colorClass}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-violet-600 transition-colors pr-8">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-4 flex-1">
                                        {item.description}
                                    </p>

                                    {/* Tags */}
                                    {item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-violet-50 text-violet-600 text-xs rounded-md"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleResourceClick(item.url)}
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 group-hover:text-violet-600 transition-colors"
                                    >
                                        {item.category === 'Hotline' ? 'Get Help' : 'Explore'} <ExternalLink size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Chat with Emo CTA */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-violet-200">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Need someone to talk to?</h2>
                        <p className="opacity-90 max-w-lg">Our AI Companion "Emo" is here to listen and provide non-judgmental support 24/7.</p>
                    </div>
                    <button
                        onClick={() => navigate('/chat')}
                        className="px-8 py-3 bg-white text-violet-600 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
                    >
                        Chat with Emo
                    </button>
                </div>
            </main>
        </div>
    );
}
