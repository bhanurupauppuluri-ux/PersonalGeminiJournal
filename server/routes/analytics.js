import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { getUserJournalEntries } from '../services/firestore.js';
import { analyzeResilience } from '../services/gemini.js';

const router = express.Router();

/**
 * GET /api/analytics/resilience
 * Fetches recent entries for the authenticated user and synthesizes:
 * a) Emotional trajectory score (1-10 resilience index over time)
 * b) Personalized micro-coaching recommendation
 */
router.get('/resilience', verifyAuth, async (req, res) => {
  try {
    const userEntries = await getUserJournalEntries(req.user.uid);
    const analytics = await analyzeResilience(userEntries);

    return res.json({
      success: true,
      userId: req.user.uid,
      analytics
    });
  } catch (err) {
    console.error('[AnalyticsRoute] GET /resilience error:', err);
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to generate resilience analytics.'
    });
  }
});

export default router;
