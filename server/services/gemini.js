import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from './secretManager.js';

/**
 * Sanitizes and cleans user text input before passing to Gemini API
 * Enforces Workspace Constitution Rule #4
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // remove control chars
    .slice(0, 10000); // limit max entry length to prevent excessive tokens/abuse
}

/**
 * Generates structured AI summary, key takeaways, and emotional tone analysis
 * using model gemini-1.5-flash
 */
export async function analyzeJournalEntry(rawText) {
  const text = sanitizeInput(rawText);
  if (!text) {
    throw new Error('Journal entry text cannot be empty');
  }

  const apiKey = await getGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analyze the following user journal/brainstorming entry.
Extract:
1. "summary": A concise 2-3 sentence summary of the entry.
2. "keyTakeaways": An array of 3-5 clear, actionable bullet points or key takeaways.
3. "emotionalTone": An object with:
   - "primaryEmotion": The dominant emotion (e.g. Hopeful, Anxious, Determined, Overwhelmed, Reflective, Joyful).
   - "sentimentScore": A numeric score from 1 (very negative) to 10 (very positive).
   - "toneTags": An array of 2-4 descriptive tone tags (e.g. ["Ambitious", "Cautious", "Growth-Minded"]).
   - "resilienceScore": A numeric resilience rating from 1 to 10 reflecting how effectively the writer is coping with or adapting to challenges.

Format your response strictly as valid JSON matching this schema:
{
  "summary": "string",
  "keyTakeaways": ["string"],
  "emotionalTone": {
    "primaryEmotion": "string",
    "sentimentScore": 7,
    "toneTags": ["string"],
    "resilienceScore": 8
  }
}

User Journal Entry:
"""
${text}
"""`;

      // gemini-1.5-flash query with responseMimeType
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        const cleanedJsonText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanedJsonText);
        return {
          summary: parsed.summary || 'Summary unavailable.',
          keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
          emotionalTone: {
            primaryEmotion: parsed.emotionalTone?.primaryEmotion || 'Reflective',
            sentimentScore: Number(parsed.emotionalTone?.sentimentScore) || 7,
            toneTags: Array.isArray(parsed.emotionalTone?.toneTags) ? parsed.emotionalTone.toneTags : ['Reflective'],
            resilienceScore: Number(parsed.emotionalTone?.resilienceScore) || 7
          }
        };
      }
    } catch (err) {
      console.warn(`[Gemini API] Primary model request encountered issue: ${err.message}. Using defensive fallback.`);
    }
  }

  // Defensive fallback analysis when API key is unconfigured or offline
  return generateFallbackEntryAnalysis(text);
}

/**
 * Generates resilience analytics and micro-coaching based on past entries
 */
export async function analyzeResilience(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      resilienceIndex: 7.5,
      trend: 'stable',
      summaryText: 'No journal entries recorded yet. Begin journaling to track your emotional resilience trajectory.',
      microCoaching: {
        title: 'Start Your Practice',
        advice: 'Write your first journal entry today to establish your emotional baseline and receive personalized AI micro-coaching.',
        actionableSteps: ['Write down 3 things on your mind', 'Reflect on a recent win or challenge']
      },
      trajectory: []
    };
  }

  const apiKey = await getGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const promptData = entries.slice(0, 10).map((e, idx) => ({
        index: idx + 1,
        date: e.createdAt,
        contentSample: e.content ? e.content.slice(0, 200) : '',
        primaryEmotion: e.emotionalTone?.primaryEmotion || 'Neutral',
        resilienceScore: e.emotionalTone?.resilienceScore || 7
      }));

      const prompt = `You are an expert psychological resilience coach analyzing a user's recent journal trajectory over ${entries.length} entries.

Entry Data:
${JSON.stringify(promptData, null, 2)}

Provide a comprehensive resilience analysis in JSON format:
{
  "resilienceIndex": 8.2, // Overall resilience index (1-10)
  "trend": "rising", // "rising", "stable", or "declining"
  "summaryText": "Brief 2-3 sentence overview of their recent emotional trajectory.",
  "microCoaching": {
    "title": "Short Inspiring Coaching Title",
    "advice": "Personalized, actionable micro-coaching advice based on patterns found.",
    "actionableSteps": ["Step 1", "Step 2", "Step 3"]
  },
  "trajectory": [
    { "date": "YYYY-MM-DD", "score": 8, "emotion": "Hopeful" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      });

      const responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const cleanedJsonText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanedJsonText);
        return {
          resilienceIndex: Number(parsed.resilienceIndex) || 7.8,
          trend: ['rising', 'stable', 'declining'].includes(parsed.trend) ? parsed.trend : 'stable',
          summaryText: parsed.summaryText || 'Your emotional trajectory demonstrates steady cognitive flexibility and adaptive problem solving.',
          microCoaching: {
            title: parsed.microCoaching?.title || 'Maintain Cognitive Reframing',
            advice: parsed.microCoaching?.advice || 'Continue acknowledging challenges while actively identifying factors within your direct control.',
            actionableSteps: Array.isArray(parsed.microCoaching?.actionableSteps)
              ? parsed.microCoaching.actionableSteps
              : ['Practice 5 minutes of mindful grounding', 'Break down daunting goals into micro-tasks']
          },
          trajectory: Array.isArray(parsed.trajectory) ? parsed.trajectory : entries.map(e => ({
            date: e.createdAt ? e.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            score: e.emotionalTone?.resilienceScore || 7,
            emotion: e.emotionalTone?.primaryEmotion || 'Reflective'
          }))
        };
      }
    } catch (err) {
      console.warn(`[Gemini API] Resilience analytics model request encountered issue: ${err.message}. Using defensive fallback.`);
    }
  }

  // Defensive fallback calculation
  return generateFallbackResilienceAnalysis(entries);
}

// Helper: Defensive heuristic fallback for entry analysis
function generateFallbackEntryAnalysis(text) {
  const wordCount = text.split(/\s+/).length;
  const isPositive = /good|great|happy|excited|accomplished|proud|learning|hope|future|win|progress/i.test(text);
  const isChallenging = /hard|stress|difficult|overwhelmed|struggle|tired|anxious|problem|worry/i.test(text);

  let primaryEmotion = 'Reflective';
  let sentimentScore = 7;
  let toneTags = ['Thoughtful', 'Introspective'];
  let resilienceScore = 7.5;

  if (isPositive && !isChallenging) {
    primaryEmotion = 'Optimistic';
    sentimentScore = 8.5;
    toneTags = ['Energized', 'Goal-Oriented'];
    resilienceScore = 8.5;
  } else if (isChallenging) {
    primaryEmotion = 'Resilient under stress';
    sentimentScore = 5.5;
    toneTags = ['Processing', 'Determined'];
    resilienceScore = 7.0;
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  const summary = sentences.slice(0, 2).join(' ') || (text.slice(0, 150) + '...');

  const keyTakeaways = [
    `Captured core reflections across ${wordCount} words.`,
    isChallenging ? 'Identified ongoing challenges with a mindset geared toward resolution.' : 'Emphasized positive momentum and personal agency.',
    'Saved to your isolated personal journal log.'
  ];

  return {
    summary,
    keyTakeaways,
    emotionalTone: {
      primaryEmotion,
      sentimentScore,
      toneTags,
      resilienceScore
    }
  };
}

// Helper: Defensive heuristic fallback for resilience analytics
function generateFallbackResilienceAnalysis(entries) {
  const scores = entries.map(e => e.emotionalTone?.resilienceScore || 7);
  const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  const formattedAvg = Number(avgScore.toFixed(1));

  let trend = 'stable';
  if (scores.length >= 2) {
    const recent = scores[0];
    const older = scores[scores.length - 1];
    if (recent > older + 0.5) trend = 'rising';
    else if (recent < older - 0.5) trend = 'declining';
  }

  const trajectory = entries.map((e, idx) => ({
    date: e.createdAt ? e.createdAt.split('T')[0] : `Day ${entries.length - idx}`,
    score: e.emotionalTone?.resilienceScore || (7 + (idx % 3) * 0.5),
    emotion: e.emotionalTone?.primaryEmotion || 'Reflective'
  })).reverse();

  return {
    resilienceIndex: formattedAvg || 7.5,
    trend,
    summaryText: `Based on your recent ${entries.length} journal entry reflections, your resilience index is ${formattedAvg}/10 with a ${trend} trend trajectory.`,
    microCoaching: {
      title: 'Focus on Micro-Wins',
      advice: 'Consistent reflection builds strong psychological immunity. Pay special attention to small daily progress points.',
      actionableSteps: [
        'Acknowledge one stressor and reframe it as a growth opportunity',
        'Maintain daily journaling consistency',
        'Celebrate small task completions at the end of each day'
      ]
    },
    trajectory
  };
}
