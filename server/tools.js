// ── Agent Tools ─────────────────────────────────────────────────────────────
// Each tool has: name, description, input_schema (JSON Schema), and execute()

export const tools = [
  {
    name: 'mood_analyzer',
    description:
      'Analyze the emotional tone and sentiment of the user\'s message. Returns a structured emotion classification with confidence score. Use this when the user shares how they feel or describes their emotional state.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The user text to analyze for emotion',
        },
      },
      required: ['text'],
    },
    execute: async ({ text }) => {
      // Emotion keywords mapping (the agent can use this as quick classification)
      const emotionKeywords = {
        happy: ['happy', 'great', 'awesome', 'wonderful', 'excited', 'joy', 'love', 'amazing', 'fantastic', 'elated'],
        sad: ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'grief', 'crying', 'tearful', 'down'],
        anxious: ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'stressed', 'overwhelmed', 'uneasy'],
        angry: ['angry', 'furious', 'mad', 'frustrated', 'irritated', 'annoyed', 'rage', 'pissed'],
        calm: ['calm', 'peaceful', 'relaxed', 'serene', 'content', 'tranquil', 'zen', 'chill'],
        lonely: ['lonely', 'alone', 'isolated', 'abandoned', 'disconnected', 'nobody'],
        grateful: ['grateful', 'thankful', 'blessed', 'appreciative', 'fortunate'],
        confused: ['confused', 'lost', 'uncertain', 'unsure', 'puzzled', 'bewildered'],
      };

      const lower = text.toLowerCase();
      let detectedEmotion = 'neutral';
      let maxMatches = 0;

      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        const matches = keywords.filter(k => lower.includes(k)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          detectedEmotion = emotion;
        }
      }

      // Calculate a simple confidence
      const confidence = maxMatches > 0 ? Math.min(0.5 + maxMatches * 0.15, 0.95) : 0.3;

      return JSON.stringify({
        emotion: detectedEmotion,
        confidence: confidence,
        analysis: `Detected primary emotion: ${detectedEmotion} (${Math.round(confidence * 100)}% confidence). The user's message conveys a ${detectedEmotion} emotional tone.`,
      });
    },
  },

  {
    name: 'breathing_exercise',
    description:
      'Provide a guided breathing exercise appropriate for the user\'s current emotional state. Use this when the user is anxious, stressed, overwhelmed, or asks for a calming technique.',
    input_schema: {
      type: 'object',
      properties: {
        emotion: {
          type: 'string',
          description: 'Current emotional state of the user (e.g., anxious, stressed, angry, sad)',
        },
        intensity: {
          type: 'string',
          enum: ['mild', 'moderate', 'intense'],
          description: 'How intense the emotion seems',
        },
      },
      required: ['emotion'],
    },
    execute: async ({ emotion, intensity = 'moderate' }) => {
      const exercises = {
        anxious: {
          name: '4-7-8 Breathing',
          steps: [
            'Find a comfortable position and close your eyes gently.',
            'Breathe IN through your nose for 4 seconds.',
            'HOLD your breath for 7 seconds.',
            'Breathe OUT slowly through your mouth for 8 seconds.',
            'Repeat this cycle 4 times.',
          ],
          duration: '3 minutes',
          why: 'This activates your parasympathetic nervous system, reducing anxiety and promoting calm.',
        },
        stressed: {
          name: 'Box Breathing',
          steps: [
            'Sit upright and relax your shoulders.',
            'Breathe IN for 4 seconds.',
            'HOLD for 4 seconds.',
            'Breathe OUT for 4 seconds.',
            'HOLD (empty lungs) for 4 seconds.',
            'Repeat 4-6 times.',
          ],
          duration: '4 minutes',
          why: 'Box breathing is used by Navy SEALs to manage stress. It resets your autonomic nervous system.',
        },
        angry: {
          name: 'Cooling Breath (Sitali)',
          steps: [
            'Curl your tongue into a tube shape (or purse your lips if you can\'t curl).',
            'Breathe IN slowly through your curled tongue.',
            'Close your mouth and breathe OUT through your nose.',
            'Repeat 10 times.',
          ],
          duration: '2 minutes',
          why: 'The cooling sensation on your tongue activates a calming reflex, reducing anger and frustration.',
        },
        sad: {
          name: 'Heart-Centered Breathing',
          steps: [
            'Place one hand on your heart and one on your belly.',
            'Breathe IN deeply for 5 seconds, imagining warmth filling your chest.',
            'Breathe OUT for 5 seconds, releasing heaviness.',
            'With each breath, send yourself compassion.',
            'Continue for 2-3 minutes.',
          ],
          duration: '3 minutes',
          why: 'This self-soothing technique stimulates the vagus nerve and releases oxytocin.',
        },
        default: {
          name: 'Mindful Breathing',
          steps: [
            'Close your eyes and sit comfortably.',
            'Breathe IN naturally for 4 seconds.',
            'Breathe OUT for 6 seconds (longer exhale).',
            'Focus only on the sensation of air moving.',
            'If your mind wanders, gently return to the breath.',
            'Continue for 2-5 minutes.',
          ],
          duration: '3 minutes',
          why: 'Mindful breathing grounds you in the present moment and calms the nervous system.',
        },
      };

      const exercise = exercises[emotion] || exercises.default;

      return JSON.stringify({
        exercise_name: exercise.name,
        steps: exercise.steps,
        duration: exercise.duration,
        rationale: exercise.why,
        intensity_note: intensity === 'intense'
          ? 'Since you\'re feeling this strongly, try to do at least 3 full cycles. It\'s okay if it feels hard at first.'
          : 'Take your time with each step. There\'s no rush.',
      });
    },
  },

  {
    name: 'coping_strategy',
    description:
      'Recommend evidence-based coping strategies based on the user\'s emotional state and situation. Use this when the user needs practical advice for dealing with difficult emotions or situations.',
    input_schema: {
      type: 'object',
      properties: {
        emotion: {
          type: 'string',
          description: 'The user\'s current emotional state',
        },
        context: {
          type: 'string',
          description: 'Brief description of the situation the user is dealing with',
        },
      },
      required: ['emotion'],
    },
    execute: async ({ emotion, context = '' }) => {
      const strategies = {
        anxious: [
          { name: 'Grounding (5-4-3-2-1)', description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This anchors you to the present.' },
          { name: 'Worry Time', description: 'Set aside 15 minutes later today as "worry time." Write down current worries and promise yourself you\'ll address them then — not now.' },
          { name: 'Progressive Muscle Relaxation', description: 'Tense each muscle group for 5 seconds, then release. Start from your toes and work up to your head.' },
        ],
        sad: [
          { name: 'Activity Scheduling', description: 'Plan one small enjoyable activity for the next hour — even something as simple as making tea or listening to a favorite song.' },
          { name: 'Gratitude Micro-Practice', description: 'Write down 3 tiny things that went okay today. They don\'t have to be big — "I drank water" counts.' },
          { name: 'Compassionate Self-Talk', description: 'Imagine your best friend felt this way. What would you say to them? Now say that to yourself.' },
        ],
        angry: [
          { name: 'STOP Technique', description: 'Stop what you\'re doing. Take a breath. Observe your thoughts without judging. Proceed with awareness.' },
          { name: 'Physical Release', description: 'Go for a brisk 10-minute walk, do jumping jacks, or squeeze an ice cube. Physical movement channels the energy.' },
          { name: 'Perspective Shift', description: 'Ask: "Will this matter in 5 years?" and "What would I advise someone else in this situation?"' },
        ],
        lonely: [
          { name: 'Micro-Connection', description: 'Send a simple message to one person: "Hey, just thinking of you." Connection doesn\'t have to be deep to be healing.' },
          { name: 'Self-Date', description: 'Take yourself somewhere — a café, park, or bookstore. Treat yourself the way you\'d treat a friend.' },
          { name: 'Journaling Prompt', description: 'Write about a time you felt deeply connected to someone. What made that moment special? How can you recreate elements of it?' },
        ],
        default: [
          { name: 'Mindful Check-In', description: 'Pause and ask yourself: "What am I feeling right now? Where do I feel it in my body? What do I need?"' },
          { name: 'Nature Break', description: 'Step outside for 5 minutes. Look at the sky, feel the air, notice the trees. Nature is a proven mood regulator.' },
          { name: 'Creative Expression', description: 'Draw, write, sing, or dance — even badly. Creative expression processes emotions the logical mind can\'t.' },
        ],
      };

      const list = strategies[emotion] || strategies.default;

      return JSON.stringify({
        strategies: list,
        context_note: context
          ? `Based on your situation (${context}), I\'d especially recommend trying "${list[0].name}" first.`
          : `Try starting with "${list[0].name}" — it\'s quick and effective.`,
      });
    },
  },

  {
    name: 'crisis_detector',
    description:
      'CRITICAL SAFETY TOOL. Detect if the user\'s message contains crisis language indicating self-harm, suicidal ideation, or danger. Use this IMMEDIATELY if you detect any hint of crisis in the user\'s message. This takes priority over all other tools.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The user message to check for crisis indicators',
        },
      },
      required: ['text'],
    },
    execute: async ({ text }) => {
      const crisisKeywords = [
        'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal',
        'self-harm', 'self harm', 'cut myself', 'hurt myself', 'no reason to live',
        'better off dead', 'can\'t go on', 'end it all', 'not worth living',
        'don\'t want to be alive', 'don\'t want to live', 'overdose',
      ];

      const lower = text.toLowerCase();
      const isCrisis = crisisKeywords.some(k => lower.includes(k));

      if (isCrisis) {
        return JSON.stringify({
          is_crisis: true,
          severity: 'high',
          action: 'PROVIDE HELPLINE INFORMATION IMMEDIATELY',
          helplines: [
            { name: 'National Suicide Prevention Lifeline (US)', number: '988', type: 'call or text' },
            { name: 'Crisis Text Line', number: 'Text HOME to 741741', type: 'text' },
            { name: 'iCall (India)', number: '9152987821', type: 'call' },
            { name: 'Vandrevala Foundation (India)', number: '1860-2662-345', type: 'call' },
            { name: 'International Association for Suicide Prevention', url: 'https://www.iasp.info/resources/Crisis_Centres/', type: 'web' },
          ],
          message: 'The user may be in crisis. Please provide helpline numbers, express genuine care, encourage them to reach out to a professional, and remind them they are not alone.',
        });
      }

      return JSON.stringify({
        is_crisis: false,
        note: 'No crisis indicators detected. Proceed with normal empathetic support.',
      });
    },
  },
];

// Get tool schemas formatted for Claude API
export function getToolSchemas() {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));
}

// Execute a tool by name
export async function executeTool(name, args) {
  const tool = tools.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return await tool.execute(args);
}
