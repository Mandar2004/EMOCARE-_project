// ── Agent Loop — ReAct with Google Gemini ────────────────────────────────────
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getToolSchemas, executeTool } from './tools.js';

// Lazy init — wait for dotenv to load env vars before creating the client
let _model = null;
function getModel() {
  if (!_model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    _model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
  }
  return _model;
}

const SYSTEM_PROMPT = `You are Emo, the EMOCARE+ Wellness Companion — a warm, empathetic AI dedicated to emotional well-being.

## Your Personality
- You are compassionate, patient, and genuinely caring
- You speak like a supportive best friend, not a clinical therapist
- You use gentle humor when appropriate, but never dismiss feelings
- You use emojis sparingly but warmly (💙, 🌟, ✨, 🤗)
- You keep responses concise (2-4 sentences usually) unless the user needs more

## Your Approach
1. ALWAYS acknowledge the user's feelings first before offering help
2. Use their name if you know it
3. Ask follow-up questions to understand deeper — don't assume
4. When the user seems distressed, use the crisis_detector tool FIRST
5. Offer breathing exercises or coping strategies only when appropriate — don't force them
6. Remember what the user has said earlier in the conversation

## Tool Usage Rules
- Use mood_analyzer when the user shares emotional content and you want to understand their state better
- Use breathing_exercise when the user is anxious, stressed, or asks for a calming technique
- Use coping_strategy when the user needs practical advice for difficult situations
- Use crisis_detector IMMEDIATELY if you detect ANY hint of self-harm, suicidal thoughts, or danger — this is your #1 priority
- You can use multiple tools in sequence if needed

## What You Should NEVER Do
- Never diagnose mental health conditions
- Never prescribe medication
- Never dismiss or minimize feelings
- Never say "just think positive" or similar toxic positivity
- Never pretend to be a licensed therapist — if someone needs professional help, encourage them to seek it
- Never share the user's information or conversations`;

const MAX_ITERATIONS = 5;

/**
 * Convert tool schemas from our format to Gemini's functionDeclarations format
 */
function getGeminiTools() {
  const schemas = getToolSchemas();
  return [{
    functionDeclarations: schemas.map(s => ({
      name: s.name,
      description: s.description,
      parameters: s.input_schema,
    })),
  }];
}

/**
 * Run the agent loop for a chat message
 * @param {string} userMessage - The user's latest message
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @returns {Promise<{reply: string, sentiment: string|null, tools_used: string[]}>}
 */
export async function runAgentLoop(userMessage, conversationHistory = []) {
  const toolsUsed = [];
  let sentiment = null;

  // Build Gemini-compatible history
  const history = conversationHistory.map(msg => ({
    role: msg.role === 'ai' || msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || msg.text }],
  }));

  const model = getModel();
  const chat = model.startChat({
    history,
    tools: getGeminiTools(),
  });

  let currentMessage = userMessage;

  // ReAct loop
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const result = await chat.sendMessage(currentMessage);
    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    // Check for function calls
    const functionCalls = parts.filter(p => p.functionCall);

    if (functionCalls.length === 0) {
      // No function call → Extract final text
      const textParts = parts.filter(p => p.text);
      const reply = textParts.map(p => p.text).join('\n') ||
        "I'm here for you. Could you tell me more about how you're feeling?";
      return { reply, sentiment, tools_used: toolsUsed };
    }

    // Process function calls
    const functionResponses = [];

    for (const part of functionCalls) {
      const { name, args } = part.functionCall;
      console.log(`[Agent] Tool call: ${name}`, args);
      toolsUsed.push(name);

      let toolResult;
      try {
        toolResult = await executeTool(name, args);
      } catch (err) {
        toolResult = JSON.stringify({ error: String(err) });
      }

      // Extract sentiment from mood_analyzer
      if (name === 'mood_analyzer') {
        try {
          const parsed = JSON.parse(toolResult);
          sentiment = parsed.emotion;
        } catch {}
      }

      console.log(`[Agent] Tool result:`, toolResult);

      functionResponses.push({
        functionResponse: {
          name,
          response: JSON.parse(toolResult),
        },
      });
    }

    // Send tool results back to Gemini
    const toolResult = await chat.sendMessage(functionResponses);
    const toolResponse = toolResult.response;
    const responseParts = toolResponse.candidates?.[0]?.content?.parts || [];

    // Check if Gemini wants to call more tools
    const moreCalls = responseParts.filter(p => p.functionCall);
    if (moreCalls.length > 0) {
      // Process additional function calls in next iteration
      // Build the text to send as a prompt for next loop
      const textFromResponse = responseParts.filter(p => p.text).map(p => p.text).join('\n');
      if (textFromResponse) {
        // There's both text and more function calls — unusual, handle gracefully
        currentMessage = textFromResponse;
      }
      continue;
    }

    // Final text response after tool processing
    const finalText = responseParts.filter(p => p.text).map(p => p.text).join('\n') ||
      "I'm here for you. Could you tell me more about how you're feeling?";
    return { reply: finalText, sentiment, tools_used: toolsUsed };
  }

  return {
    reply: "I'm still thinking about the best way to help you. Could you share a bit more?",
    sentiment: null,
    tools_used: toolsUsed,
  };
}

/**
 * Analyze text sentiment only (for EmotionDetector)
 * @param {string} text
 * @returns {Promise<{emotion: string, score: number, suggested_response: string}>}
 */
export async function analyzeText(text) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are an emotion analysis AI. Analyze the emotional content of the given text and respond ONLY with a valid JSON object (no markdown, no code fences, no extra text) with these exact fields:
- "emotion": the primary emotion (one of: happy, sad, anxious, angry, calm, lonely, grateful, confused, neutral)
- "score": confidence score between 0.0 and 1.0
- "suggested_response": a warm, empathetic one-sentence response to this emotional state`,
  });

  const result = await model.generateContent(text);
  const responseText = result.response.text();

  try {
    // Handle potential markdown code fences in response
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { emotion: 'neutral', score: 0.5, suggested_response: 'Thank you for sharing your thoughts.' };
  }
}
