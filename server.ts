import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { isEmergencyQuery, EMERGENCY_ALERT_TEXT } from './src/utils/emergency.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI lazily or safely with User-Agent telemetry
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Care AI API' });
});

// API Emergency Checker
app.post('/api/check-emergency', (req, res) => {
  const { text } = req.body;
  const isEmergency = isEmergencyQuery(text || '');
  res.json({ isEmergency, alertMessage: isEmergency ? EMERGENCY_ALERT_TEXT : null });
});

// Google OAuth URL Endpoint
app.get('/api/auth/google/url', (req, res) => {
  const clientId = process.env.CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId) {
    return res.status(200).json({
      configured: false,
      error: 'CLIENT_ID environment variable is missing in project settings.'
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, configured: true, redirectUri });
});

// Google OAuth Callback Handler
app.get(['/api/auth/google/callback', '/api/auth/google/callback/'], async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.send(`
      <html>
        <body style="background:#0d1117;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error || 'No authorization code received'}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <h3>Authentication Failed</h3>
          <p>${error || 'No authorization code received.'}</p>
        </body>
      </html>
    `);
  }

  try {
    const clientId = process.env.CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for access token.');
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    const userPayload = JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name || userData.email?.split('@')[0] || 'Google User',
      picture: userData.picture,
    });

    res.send(`
      <html>
        <body style="background:#0d1117;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;">
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                user: ${userPayload}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <h3 style="color:#10b981;">Sign-In Successful!</h3>
          <p>Redirecting to Care AI...</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('Google OAuth Callback error:', err);
    res.send(`
      <html>
        <body style="background:#0d1117;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <h3 style="color:#ef4444;">Authentication Error</h3>
          <p>${err.message}</p>
        </body>
      </html>
    `);
  }
});

const HIGH_TRAFFIC_ALERT = "⚠️ Care AI is experiencing high traffic right now. Please wait a few seconds and try clicking 'Ask Care AI' again!";

function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('GEMINI_TIMEOUT'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// API Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], profile } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // High Priority Emergency Guardrail Check
    if (isEmergencyQuery(message)) {
      return res.json({
        role: 'assistant',
        content: EMERGENCY_ALERT_TEXT,
        isEmergency: true,
        metadata: {
          riskLevel: 'emergency',
          suggestedActions: [
            'Call 911 or Local Emergency Services Immediately',
            'Proceed to Nearest Emergency Room',
            'Contact National Suicide & Crisis Lifeline (Dial 988 in the US)'
          ]
        }
      });
    }

    const ai = getGenAI();

    // Construct personalized system instruction
    const name = profile?.name || 'Patient';
    const age = profile?.age ? `${profile.age} years old` : 'Age unspecified';
    const healthGoals = profile?.healthGoals?.length ? profile.healthGoals.join(', ') : 'General Wellness';
    const allergies = profile?.allergies?.length ? profile.allergies.join(', ') : 'None specified';
    const dietaryNotes = profile?.dietaryNotes?.length ? profile.dietaryNotes.join(', ') : 'No specific dietary restrictions';
    const sleepHours = profile?.sleepHours ? `${profile.sleepHours} hours/night` : 'Not specified';
    const exerciseHabits = profile?.exerciseHabits || 'Not specified';
    const currentSymptoms = profile?.currentSymptoms?.length ? profile.currentSymptoms.join(', ') : 'None currently reported';
    const medicalNotes = profile?.medicalHistoryNotes || 'None provided';

    const systemInstruction = `
You are Care AI, an empathetic, highly knowledgeable, friendly, and encouraging personalized AI Health & Wellness Coach.

PATIENT CONTEXT:
- Name: ${name}
- Age: ${age}
- Health Goals: ${healthGoals}
- Known Allergies: ${allergies}
- Dietary Restrictions: ${dietaryNotes}
- Sleep Habits: ${sleepHours}
- Exercise Habits: ${exerciseHabits}
- Current Reported Symptoms/Concerns: ${currentSymptoms}
- Medical History Notes: ${medicalNotes}

CRITICAL RULES FOR PERSONA & LOGIC:
1. Always address the patient by name ("${name}").
2. STRICT WORD COUNT REQUIREMENT: Every response MUST be between a MINIMUM of 50 words and a MAXIMUM of 200 words (50–200 words). Never generate a response shorter than 50 words or longer than 200 words. Balance rich, practical wellness guidance with concise, scannable advice.
3. CROSS-REFERENCE SAFETY & ALLERGIES: Whenever giving dietary or lifestyle suggestions, verify against their known allergies (${allergies}) and dietary notes (${dietaryNotes}). Explicitly point out safety precautions (e.g., "Since you are allergic to ${allergies}, make sure to avoid...").
4. CONTEXTUAL WELLNESS TIPS: Tailor advice to their age (${age}), sleep habits (${sleepHours}), exercise routine (${exerciseHabits}), and goals (${healthGoals}).
5. TONE: Warm, caring, professional, clear, and reassuring. Use clean Markdown formatting with headers, bullet points, and concise key takeaways while staying strictly within 50 to 200 words.
6. MEDICAL DISCLAIMER BOUNDARY: Never claim to diagnose diseases or prescribe medications. Provide actionable holistic guidance (hydration, rest, stress management, sleep hygiene, gentle movement, balanced nutrition).
7. EMERGENCY OVERRIDE: If the user describes any emergency condition (chest pain, shortness of breath, severe bleeding, thoughts of self harm, sudden weakness/numbness, etc.), immediately urge them to seek emergency medical care.

Formulate a supportive, personalized response for ${name} that is strictly between 50 and 200 words in length.
`.trim();

    // Format chat contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent history if available
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (h.role === 'user' || h.role === 'assistant') {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let response: any;
    try {
      response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        15000
      );
    } catch (apiErr: any) {
      console.error('Gemini API timeout or error:', apiErr);
      return res.status(503).json({
        error: HIGH_TRAFFIC_ALERT,
        isHighTraffic: true,
      });
    }

    const replyText = response?.text || "I'm here for you! Could you tell me a bit more about how you're feeling today?";

    res.json({
      role: 'assistant',
      content: replyText,
      isEmergency: false,
      metadata: {
        riskLevel: 'low',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(503).json({
      error: HIGH_TRAFFIC_ALERT,
      isHighTraffic: true,
    });
  }
});

// API Endpoint for generating personalized wellness plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { profile } = req.body;
    const ai = getGenAI();

    const name = profile?.name || 'Patient';
    const prompt = `Generate a customized 24-hour daily wellness plan for ${name} based on their profile:
- Age: ${profile?.age || 'Unspecified'}
- Goals: ${profile?.healthGoals?.join(', ') || 'General fitness'}
- Allergies: ${profile?.allergies?.join(', ') || 'None'}
- Dietary Notes: ${profile?.dietaryNotes?.join(', ') || 'None'}
- Sleep: ${profile?.sleepHours || 7} hours/night
- Exercise: ${profile?.exerciseHabits || 'Moderate'}
- Current Symptoms: ${profile?.currentSymptoms?.join(', ') || 'None'}

Please respond with JSON in this structure:
{
  "title": "Care AI Personalized Wellness Plan for ${name}",
  "summary": "Brief 2-sentence encouraging summary",
  "morningRoutine": ["Step 1", "Step 2", "Step 3"],
  "afternoonRoutine": ["Step 1", "Step 2", "Step 3"],
  "eveningRoutine": ["Step 1", "Step 2", "Step 3"],
  "nutritionTips": ["Nutritional recommendation 1", "Nutritional recommendation 2"],
  "allergyWarnings": ["Allergy safety notice 1"],
  "sleepRecommendations": ["Sleep hygiene tip 1", "Sleep hygiene tip 2"]
}`;

    let response: any;
    try {
      response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        15000
      );
    } catch (apiErr: any) {
      console.error('Gemini generate-plan timeout or error:', apiErr);
      return res.status(503).json({
        error: HIGH_TRAFFIC_ALERT,
        isHighTraffic: true,
      });
    }

    const planJson = JSON.parse(response?.text || '{}');
    res.json(planJson);
  } catch (error: any) {
    console.error('Error in /api/generate-plan:', error);
    res.status(503).json({
      error: HIGH_TRAFFIC_ALERT,
      isHighTraffic: true,
    });
  }
});

// Vite Integration (Dev Mode & Production Mode)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Care AI Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
