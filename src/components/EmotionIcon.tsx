import { Smile, Frown, Meh } from 'lucide-react';

interface EmotionIconProps {
    emotion: string;
    size?: 'sm' | 'md' | 'lg';
}

export function EmotionIcon({ emotion, size = 'md' }: EmotionIconProps) {
    const sizeMap = {
        sm: 24,
        md: 36,
        lg: 60
    };

    const s = sizeMap[size];
    const e = emotion.toLowerCase();

    // Positive / best
    if (['happy', 'joy', 'positive', 'calm', 'energetic'].includes(e)) {
        return <Smile size={s} className="text-green-500" />;
    }
    // Negative / worst
    if (['sad', 'angry', 'fear', 'negative', 'surprise', 'stress', 'frustrated'].includes(e)) {
        return <Frown size={s} className="text-red-500" />;
    }
    // Middle / neutral
    return <Meh size={s} className="text-yellow-500" />;
}
