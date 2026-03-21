import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageBubbleProps {
    text: string;
    sender: 'user' | 'ai';
    rating?: 'up' | 'down';
    onRate?: (rating: 'up' | 'down') => void;
}

export function MessageBubble({ text, sender, rating, onRate }: MessageBubbleProps) {
    return (
        <div className={`flex flex-col ${sender === 'user' ? 'items-end' : 'items-start'} group`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${sender === 'user'
                ? 'bg-violet-600 text-white rounded-tr-none'
                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                {text}
            </div>
            {sender === 'ai' && onRate && (
                <div className={`flex gap-2 mt-1 px-1 transition-opacity duration-200 ${rating ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                        onClick={() => onRate('up')}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${rating === 'up' ? 'text-green-600' : 'text-slate-400'}`}
                        title="Helpful"
                    >
                        <ThumbsUp size={14} />
                    </button>
                    <button
                        onClick={() => onRate('down')}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${rating === 'down' ? 'text-red-600' : 'text-slate-400'}`}
                        title="Not helpful"
                    >
                        <ThumbsDown size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}