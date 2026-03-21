import { useState, useRef, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Send, Sparkles, Trash2, Brain, Heart, Shield } from 'lucide-react';
import avatarImg from '../assets/avatar.png';
import { MessageBubble } from './MessageBubble';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    sentiment?: string;
    rating?: 'up' | 'down';
    tools_used?: string[];
}

// Helper for local sentiment analysis fallback (used when backend is offline)
const getLocalSentiment = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.match(/(sad|bad|depressed|unhappy|anxious|scared|worry|tired|lonely|hurt|pain)/)) return 'negative';
    if (lower.match(/(happy|good|great|awesome|excited|love|joy|calm|peace|wonderful)/)) return 'positive';
    return 'neutral';
};

const getLocalFallbackResponse = (sentiment: string): string => {
    const responses: Record<string, string[]> = {
        positive: [
            "That's wonderful to hear! 😊 What's been making your day special?",
            "I love hearing that! Keep holding onto that positive energy.",
            "You deserve to feel this way. Tell me more!",
        ],
        negative: [
            "I'm really sorry you're going through this. I'm here with you. 💙",
            "That sounds really tough. It's okay to feel this way — your feelings are valid.",
            "I hear you. Take things one step at a time, and be gentle with yourself.",
        ],
        neutral: [
            "Thanks for sharing. I'm listening — feel free to tell me more.",
            "I'm here for you. How can I support you right now?",
            "Take your time. I'm all ears. 🤍",
        ],
    };
    const key = sentiment in responses ? sentiment : 'neutral';
    const list = responses[key];
    return list[Math.floor(Math.random() * list.length)];
};

// Sentiment badge component
function SentimentBadge({ sentiment }: { sentiment?: string }) {
    if (!sentiment) return null;

    const badgeConfig: Record<string, { bg: string; text: string; emoji: string }> = {
        happy: { bg: 'bg-amber-50', text: 'text-amber-700', emoji: '😊' },
        sad: { bg: 'bg-blue-50', text: 'text-blue-700', emoji: '😢' },
        anxious: { bg: 'bg-purple-50', text: 'text-purple-700', emoji: '😰' },
        angry: { bg: 'bg-red-50', text: 'text-red-700', emoji: '😤' },
        calm: { bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '😌' },
        lonely: { bg: 'bg-indigo-50', text: 'text-indigo-700', emoji: '🥺' },
        grateful: { bg: 'bg-yellow-50', text: 'text-yellow-700', emoji: '🙏' },
        confused: { bg: 'bg-orange-50', text: 'text-orange-700', emoji: '🤔' },
        neutral: { bg: 'bg-slate-50', text: 'text-slate-600', emoji: '😐' },
        positive: { bg: 'bg-green-50', text: 'text-green-700', emoji: '✨' },
        negative: { bg: 'bg-rose-50', text: 'text-rose-700', emoji: '💙' },
    };

    const config = badgeConfig[sentiment] || badgeConfig.neutral;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.text} capitalize`}>
            {config.emoji} {sentiment}
        </span>
    );
}

export function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi there! I'm Emo, your AI wellness companion. 💙 How are you feeling right now?", sender: 'ai' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [agentOnline, setAgentOnline] = useState<boolean | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check if agent backend is online
    useEffect(() => {
        fetch('/api/health')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(() => setAgentOnline(true))
            .catch(() => setAgentOnline(false));
    }, []);

    const clearChat = () => {
        if (window.confirm("Start a new conversation?")) {
            setMessages([{ id: Date.now(), text: "Hi there! I'm Emo, your AI wellness companion. 💙 How are you feeling right now?", sender: 'ai' }]);
        }
    };

    const handleRate = (id: number, rating: 'up' | 'down') => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, rating: msg.rating === rating ? undefined : rating } : msg
        ));
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        try {
            // Build conversation history for context (last 20 messages)
            const history = messages.slice(-20).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    conversationHistory: history,
                }),
            });

            if (!response.ok) {
                throw new Error('API unavailable');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const aiMsg: Message = {
                id: Date.now() + 1,
                text: data.reply,
                sender: 'ai',
                sentiment: data.sentiment,
                tools_used: data.tools_used,
            };
            setMessages(prev => [...prev, aiMsg]);
            setAgentOnline(true);

        } catch {
            // Fallback to local responses when backend is offline
            const sentiment = getLocalSentiment(currentInput);
            const reply = getLocalFallbackResponse(sentiment);
            const aiMsg: Message = {
                id: Date.now() + 1,
                text: reply,
                sender: 'ai',
                sentiment: sentiment,
            };
            setMessages(prev => [...prev, aiMsg]);
            setAgentOnline(false);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col h-[calc(100vh-80px)]">

                {/* Chat Header */}
                <div className="bg-white rounded-t-3xl p-6 shadow-sm border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center relative overflow-hidden">
                            <img src={avatarImg} alt="AI" className="w-10 h-10 object-contain" />
                            <span className={`absolute bottom-1 right-1 w-3 h-3 ${agentOnline ? 'bg-green-400' : 'bg-amber-400'} border-2 border-white rounded-full`}></span>
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                Emo Companion
                                {agentOnline !== null && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                        agentOnline
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {agentOnline ? '🧠 AI Agent' : '📴 Offline Mode'}
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Sparkles size={10} className="text-violet-500" /> 
                                {agentOnline ? 'Powered by Claude • Understanding your emotions' : 'Using local responses • Start server for full AI'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Feature indicators */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                <Brain size={10} /> Context-Aware
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                <Heart size={10} /> Empathetic
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                <Shield size={10} /> Safe
                            </div>
                        </div>
                        <button onClick={clearChat} title="Clear Chat" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-white overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                    {messages.map((msg) => (
                        <div key={msg.id}>
                            <MessageBubble
                                text={msg.text}
                                sender={msg.sender}
                                rating={msg.rating}
                                onRate={msg.sender === 'ai' ? (r) => handleRate(msg.id, r) : undefined}
                            />
                            {/* Sentiment badge under AI messages */}
                            {msg.sender === 'ai' && msg.sentiment && (
                                <div className="flex justify-start mt-1 ml-1">
                                    <SentimentBadge sentiment={msg.sentiment} />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                <span className="ml-2 text-xs text-slate-400">Emo is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white rounded-b-3xl p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-2 border border-slate-100 focus-within:ring-2 ring-violet-100 transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Tell me how you're feeling..."
                            className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-700 placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
