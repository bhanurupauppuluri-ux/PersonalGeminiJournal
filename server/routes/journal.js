import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { analyzeJournalEntry, sanitizeInput } from '../services/gemini.js';
import { saveJournalEntry, getUserJournalEntries } from '../services/firestore.js';

const router = express.Router();

/**
 * POST /api/journal/entry
 * Authenticates request, analyzes journal text with Gemini API,
 * and saves to isolated path /users/{req.user.uid}/journals
 */
router.post('/entry', verifyAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const sanitizedText = sanitizeInput(content);

    if (!sanitizedText || sanitizedText.length < 3) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Journal entry must contain at least 3 non-whitespace characters.'
      });
    }

    // Call Gemini API to extract summary, takeaways, emotional tone
    const aiAnalysis = await analyzeJournalEntry(sanitizedText);

    // Save to user isolated Firestore document path
    const savedDoc = await saveJournalEntry(req.user.uid, {
      content: sanitizedText,
      summary: aiAnalysis.summary,
      keyTakeaways: aiAnalysis.keyTakeaways,
      emotionalTone: aiAnalysis.emotionalTone
    });

    return res.status(201).json({
      success: true,
      entry: savedDoc
    });
  } catch (err) {
    console.error('[JournalRoute] POST /entry error:', err);
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to process journal entry.'
    });
  }
});

/**
 * GET /api/journal/entries
 * Fetches all stored journal logs strictly isolated to the authenticated user's UID
 */
router.get('/entries', verifyAuth, async (req, res) => {
  try {
    const entries = await getUserJournalEntries(req.user.uid);
    return res.json({
      success: true,
      count: entries.length,
      userId: req.user.uid,
      entries
    });
  } catch (err) {
    console.error('[JournalRoute] GET /entries error:', err);
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to fetch journal entries.'
    });
  }
});

export default router;
