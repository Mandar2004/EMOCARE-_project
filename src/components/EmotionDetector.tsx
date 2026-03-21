import { useRef, useState, useEffect } from 'react';
import { Camera, Mic, X, Activity, RefreshCw } from 'lucide-react';
import { EmotionIcon } from './EmotionIcon';
import { AudioVisualizer } from './AudioVisualizer';

interface AnalysisResult {
    dominant_emotion?: string;
    emotions?: Record<string, number>;
    score?: number;
    emotion?: string;
    video_result?: any;
    audio_result?: any;
    suggested_response?: string;
}

export function EmotionDetector({ onClose, onResult }: {
    onClose: () => void;
    onResult?: (result: AnalysisResult) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState('');
    // Use ref for stream to ensure cleanup has access to latest instance
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null); // Keep state for UI updates

    const [textInput, setTextInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [activeTab, setActiveTab] = useState<'live' | 'text'>('live');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recentMoods, setRecentMoods] = useState<Array<{ emotion: string, timestamp: string }>>([]);

    // Fetch recent moods on mount
    useEffect(() => {
        const fetchRecentMoods = async () => {
            try {
                const response = await fetch('/api/mood/recent?limit=3');
                if (response.ok) {
                    const data = await response.json();
                    setRecentMoods(data);
                }
            } catch (e) {
                console.error('Failed to fetch recent moods', e);
            }
        };
        fetchRecentMoods();
    }, []);

    // Audio Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const activeTabRef = useRef(activeTab); // To check current tab in async calls
    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

    const initLiveSession = async () => {
        setError(null);
        setStream(null);

        try {
            console.log("Requesting camera/mic access...");
            // Request both video and audio
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            if (activeTabRef.current === 'live') {
                streamRef.current = mediaStream;
                setStream(mediaStream);
                startRecording(mediaStream);
            } else {
                // Cleanup if user switched tabs during load
                mediaStream.getTracks().forEach(track => track.stop());
            }
        } catch (err: any) {
            console.error("Error accessing camera/microphone:", err);

            // Detailed Error Message
            let msg = "Could not access camera/microphone.";
            if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow camera/microphone access in your browser settings.";
            if (err.name === 'NotFoundError') msg = "No camera or microphone found on this device.";
            if (err.name === 'NotReadableError') msg = "Camera/Microphone is being used by another application.";

            // Fallback to video only
            try {
                console.log("Attempting video-only fallback...");
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (activeTabRef.current === 'live') {
                    streamRef.current = videoStream;
                    setStream(videoStream);
                    // Note: Audio recording won't work in this fallback
                } else {
                    videoStream.getTracks().forEach(track => track.stop());
                }
            } catch (e) {
                console.error("Error accessing camera fallback:", e);
                if (activeTabRef.current === 'live') setError(msg);
            }
        }
    };

    useEffect(() => {
        const cleanupLiveSession = () => {
            stopRecording();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                setStream(null);
            }
        };

        if (activeTab === 'live') {
            initLiveSession();
        } else {
            cleanupLiveSession();
            setResult(null);
        }
        return () => {
            cleanupLiveSession();
        };
    }, [activeTab]);

    // Ensure video element gets the stream when it renders
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const startRecording = (mediaStream: MediaStream) => {
        try {
            // Use the audio tracks from the stream we already have
            const audioTracks = mediaStream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.warn("No audio tracks found");
                return;
            }

            const mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error setting up recorder:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const captureImage = () => {
        if (!videoRef.current) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg');
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setResult(null);
        setAnalysisProgress('Preparing analysis...');

        try {
            let videoResult: any = null;
            let audioResult: any = null;

            if (activeTab === 'live') {
                setAnalysisProgress('Capturing video frame...');
                // 1. Capture Image
                const imageBase64 = captureImage();

                setAnalysisProgress('Stopping audio recording...');
                // 2. Stop Audio to get the blob
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.requestData(); // Flush current
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                    // Wait a tick for ondataavailable
                    await new Promise(r => setTimeout(r, 100));
                }

                // Prepare Audio Blob
                let audioBase64 = null;
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    audioBase64 = await blobToBase64(audioBlob);
                }

                // Parallel Requests
                const promises = [];
                if (imageBase64) {
                    setAnalysisProgress('Analyzing facial expressions...');
                    promises.push(
                        fetch('/api/analyze/face', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: imageBase64 }),
                        }).then(r => r.json()).then(d => ({ type: 'video', data: d }))
                    );
                }

                if (audioBase64) {
                    setAnalysisProgress('Analyzing vocal tone...');
                    promises.push(
                        fetch('/api/analyze/audio', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ audio: audioBase64 }),
                        }).then(r => r.json()).then(d => ({ type: 'audio', data: d }))
                    );
                }

                const results = await Promise.all(promises);
                setAnalysisProgress('Combining results...');

                // Combine Results
                const combined: AnalysisResult = {};
                results.forEach(r => {
                    if (r.type === 'video') videoResult = r.data;
                    if (r.type === 'audio') audioResult = r.data;
                });

                // Scoring Logic
                const videoScore = videoResult?.score || 0;
                const audioScore = audioResult?.score || 0;

                combined.video_result = videoResult;
                combined.audio_result = audioResult;

                if (videoScore > audioScore) {
                    combined.dominant_emotion = videoResult?.dominant_emotion || videoResult?.emotion;
                    combined.score = videoScore;
                    combined.suggested_response = videoResult?.suggested_response;
                } else if (audioScore > 0) {
                    combined.dominant_emotion = audioResult?.emotion;
                    combined.score = audioScore;
                    combined.suggested_response = audioResult?.suggested_response;
                } else {
                    combined.dominant_emotion = videoResult?.dominant_emotion || "neutral";
                    combined.score = videoScore;
                    combined.suggested_response = videoResult?.suggested_response;
                }

                // Get all emotions data for visualization
                combined.emotions = videoResult?.emotions;

                setAnalysisProgress('Saving to history...');
                // SAVE TO BACKEND
                await fetch('/api/mood', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emotion: combined.dominant_emotion,
                        score: combined.score,
                        source: 'live'
                    })
                });

                setResult(combined);
                if (onResult) onResult(combined);

            } else if (activeTab === 'text') {
                setAnalysisProgress('Analyzing sentiment...');
                const response = await fetch('/api/analyze/text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput }),
                });
                const data = await response.json();

                setAnalysisProgress('Saving to history...');
                // SAVE TO BACKEND
                await fetch('/api/mood', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emotion: data.emotion,
                        score: data.score,
                        source: 'text'
                    })
                });

                setResult(data);
                if (onResult) onResult(data);
            }

        } catch (err) {
            console.error("Error analyzing:", err);
            setAnalysisProgress('Analysis failed');
            setResult({ emotion: "error", score: 0 });
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress('');
        }
    };

    const handleTryAgain = () => {
        setResult(null);
        if (activeTab === 'live') {
            audioChunksRef.current = [];
            if (stream) {
                startRecording(stream);
            }
        }

        // Refresh recent moods after completing an analysis
        const fetchRecentMoods = async () => {
            try {
                const response = await fetch('/api/mood/recent?limit=3');
                if (response.ok) {
                    const data = await response.json();
                    setRecentMoods(data);
                }
            } catch (e) {
                console.error('Failed to fetch recent moods', e);
            }
        };
        fetchRecentMoods();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Emotion Check-in</h2>
                        <p className="text-slate-500 text-sm">We're listening and watching to understand you better</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`flex-1 py-4 font-medium text-sm transition-colors relative ${activeTab === 'live' ? 'text-violet-600 bg-violet-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <div className="flex gap-0.5">
                                <Camera size={18} />
                                <Mic size={18} />
                            </div>
                            Live Analysis
                        </span>
                        {activeTab === 'live' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-4 font-medium text-sm transition-colors relative ${activeTab === 'text' ? 'text-violet-600 bg-violet-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="flex items-center justify-center gap-2"><Activity size={18} /> Journal</span>
                        {activeTab === 'text' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"></div>}
                    </button>
                </div>

                {/* Recent Moods Timeline */}
                {recentMoods.length > 0 && !result && (
                    <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Recent Check-ins</p>
                            <span className="text-xs text-violet-500">{recentMoods.length} recent</span>
                        </div>
                        <div className="flex gap-3">
                            {recentMoods.map((mood, idx) => {
                                const timeAgo = new Date(mood.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                });
                                return (
                                    <div
                                        key={idx}
                                        className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-violet-100 flex flex-col items-center gap-1 hover:shadow-md transition-shadow"
                                    >
                                        <EmotionIcon emotion={mood.emotion} size="sm" />
                                        <span className="text-xs font-medium text-slate-700 capitalize">{mood.emotion}</span>
                                        <span className="text-[10px] text-slate-400">{timeAgo}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="relative aspect-video bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group">

                    {/* RESULTS OVERLAY */}
                    {result && !isAnalyzing && (
                        <div className="absolute inset-0 z-20 bg-gradient-to-br from-violet-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in zoom-in duration-300 p-8 overflow-y-auto">
                            <div className="max-w-md w-full space-y-6">
                                {/* Main Emotion */}
                                <div className="text-center space-y-3">
                                    <EmotionIcon emotion={result.dominant_emotion || result.emotion || 'neutral'} size="lg" />
                                    <h3 className="text-4xl font-bold capitalize">{result.dominant_emotion || result.emotion}</h3>
                                    <p className="text-violet-200 text-sm">
                                        Detected with {Math.round((result.score || 0) * 100)}% confidence
                                    </p>
                                </div>

                                {/* Emotion Distribution */}
                                {result.emotions && Object.keys(result.emotions).length > 0 && (
                                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-2">
                                        <h4 className="text-xs font-semibold text-violet-200 uppercase tracking-wide mb-3">Emotion Breakdown</h4>
                                        {Object.entries(result.emotions)
                                            .sort(([, a], [, b]) => (b as number) - (a as number))
                                            .slice(0, 5)
                                            .map(([emotion, value]) => (
                                                <div key={emotion} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="capitalize font-medium">{emotion}</span>
                                                        <span className="text-violet-200">{Math.round((value as number) * 100) / 100}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min((value as number), 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Analysis Sources */}
                                <div className="flex gap-4 justify-center text-sm text-violet-200">
                                    {result.video_result && (
                                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                                            <Camera size={14} />
                                            <span className="capitalize">{result.video_result.dominant_emotion}</span>
                                        </span>
                                    )}
                                    {result.audio_result && (
                                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                                            <Mic size={14} />
                                            <span className="capitalize">{result.audio_result.emotion}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Suggested Response */}
                                {result.suggested_response && (
                                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center">
                                        <p className="text-xs font-semibold text-violet-200 uppercase tracking-wide mb-2">💭 For You</p>
                                        <p className="text-white leading-relaxed italic">"{result.suggested_response}"</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleTryAgain}
                                    className="w-full px-8 py-3 bg-white text-slate-900 hover:bg-violet-50 rounded-full font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Check Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* LIVE MODE */}
                    {activeTab === 'live' && (
                        <>
                            {error ? (
                                <div className="text-red-500 flex flex-col items-center gap-4 p-6 text-center">
                                    <div className="bg-red-50 p-4 rounded-full">
                                        <X size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg">Camera Error</h3>
                                    <p className="max-w-xs">{error}</p>
                                    <button
                                        onClick={() => { setError(null); initLiveSession(); }}
                                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Retry Access
                                    </button>
                                </div>
                            ) : !stream ? (
                                <div className="text-slate-400 flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Camera size={48} className="text-slate-300" />
                                        <Mic size={24} className="absolute -bottom-1 -right-1 text-slate-400 bg-slate-50 rounded-full p-0.5" />
                                    </div>
                                    <p>Starting Camera & Microphone...</p>
                                    <p className="text-xs text-slate-300 max-w-xs text-center">Please allow access when prompted by your browser.</p>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover transform -scale-x-100 ${isAnalyzing ? 'opacity-80' : ''}`}
                                    />

                                    {/* Recording Indicator */}
                                    {isRecording && !isAnalyzing && (
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium border border-white/10">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                Listening & Watching
                                            </div>
                                            <AudioVisualizer stream={stream} />
                                        </div>
                                    )}
                                </>
                            )}

                            {isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className="w-full h-1 bg-violet-400 absolute top-1/2 shadow-[0_0_20px_rgba(167,139,250,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                    <div className="bg-slate-900/80 backdrop-blur rounded-2xl px-8 py-5 text-white font-medium flex flex-col items-center gap-3 max-w-sm">
                                        <Activity size={24} className="animate-pulse text-violet-400" />
                                        <p className="text-center">{analysisProgress || 'Analyzing expressions & tone...'}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* TEXT MODE */}
                    {activeTab === 'text' && (
                        <div className="w-full h-full p-6 bg-white">
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="How was your day? Write down your thoughts..."
                                className="w-full h-full p-4 bg-slate-50 rounded-2xl resize-none outline-none focus:ring-2 ring-violet-100 text-slate-700 placeholder:text-slate-400 text-lg"
                            />
                        </div>
                    )}

                </div>

                {/* Controls */}
                <div className="p-8 flex justify-center gap-6 bg-slate-50 shrink-0">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (activeTab === 'live' && !stream) || (activeTab === 'text' && !textInput.trim())}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Activity />}
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Mood'}
                    </button>
                </div>

            </div>
        </div>
    );
}
