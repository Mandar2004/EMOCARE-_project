// ── EMOCARE+ Agent Server ───────────────────────────────────────────────────
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from parent dir (local dev) — skip on Render (env vars injected directly)
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import express from 'express';
import cors from 'cors';
import { runAgentLoop, analyzeText } from './agent.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from Netlify frontend + localhost for dev
app.use(cors({
  origin: [
    'https://emocare2026.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '10mb' }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'emo-companion', model: 'gemini-2.0-flash' });
});

// ── Chat endpoint (main agent) ──────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`\n[Chat] User: "${message.substring(0, 100)}..."`);

    const result = await runAgentLoop(message, conversationHistory);

    console.log(`[Chat] Agent: "${result.reply.substring(0, 100)}..."`);
    console.log(`[Chat] Sentiment: ${result.sentiment}, Tools: [${result.tools_used.join(', ')}]\n`);

    res.json({
      reply: result.reply,
      sentiment: result.sentiment,
      tools_used: result.tools_used,
    });
  } catch (error) {
    console.error('[Chat] Error:', error.message);

    // Specific error handling
    if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID') || error.status === 401) {
      return res.status(500).json({
        error: 'Gemini API key is missing or invalid. Please set GEMINI_API_KEY in your .env file.',
      });
    }

    res.status(500).json({
      error: 'Something went wrong. The AI agent encountered an error.',
      details: error.message,
    });
  }
});

// ── Text analysis endpoint (for EmotionDetector) ────────────────────────────
app.post('/api/analyze/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`[Analyze] Text: "${text.substring(0, 80)}..."`);

    const result = await analyzeText(text);

    console.log(`[Analyze] Result:`, result);

    res.json(result);
  } catch (error) {
    console.error('[Analyze] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Stub endpoints (for features that don't have a backend yet) ─────────────
// These prevent 404 errors from the frontend

app.get('/api/stats', (_req, res) => {
  res.json({
    total_checkins: 0,
    active_days: 0,
    last_mood: null,
  });
});

app.get('/api/mood/recent', (_req, res) => {
  res.json([]);
});

app.post('/api/mood', (req, res) => {
  console.log('[Mood] Saved:', req.body);
  res.json({ success: true });
});

app.post('/api/analyze/face', (_req, res) => {
  res.json({
    dominant_emotion: 'neutral',
    score: 0.5,
    emotions: { neutral: 50, happy: 20, sad: 10, angry: 5, surprised: 15 },
    suggested_response: 'Face analysis requires additional ML models not yet integrated.',
  });
});

app.post('/api/analyze/audio', (_req, res) => {
  res.json({
    emotion: 'neutral',
    score: 0.5,
    suggested_response: 'Audio analysis requires additional ML models not yet integrated.',
  });
});

// ── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🧠 EMOCARE+ Agent Server`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Model: gemini-2.0-flash`);
  console.log(`   API Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing! Set GEMINI_API_KEY in .env'}`);
  console.log(`   Endpoints:`);
  console.log(`     POST /api/chat          → Agent conversation`);
  console.log(`     POST /api/analyze/text   → Sentiment analysis`);
  console.log(`     GET  /api/health         → Health check\n`);
});
