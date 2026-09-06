import express from 'express';
import { getGeminiApiKey } from '../services/secretManager.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/secret
 * Helper endpoint to safely check Gemini Secret Manager / Env state.
 * Never leaks the actual secret string to the client.
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const key = await getGeminiApiKey();
    return res.json({
      success: true,
      configured: Boolean(key),
      provider: process.env.GOOGLE_CLOUD_PROJECT ? 'GCP Secret Manager' : 'Environment Variable (Fallback)'
    });
  } catch (err) {
    console.error('[SecretRoute] Error checking secret status:', err);
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

export default router;
