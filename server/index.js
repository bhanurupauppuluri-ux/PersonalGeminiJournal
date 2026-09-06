import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import secretRoutes from './routes/secret.js';
import journalRoutes from './routes/journal.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const clientDistPath = path.join(__dirname, '../client/dist');

// Security & CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// Serve static frontend assets if built
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Healthcheck Route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Personal Gemini Journal API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/secret', secretRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route handler: Serves React SPA index.html if dist exists, or informative API status
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({
    message: 'Personal Gemini Journal API Backend is active.',
    webAppUrl: 'http://localhost:5173',
    healthCheck: `http://localhost:${PORT}/health`,
    endpoints: [
      '/api/secret',
      '/api/journal/entry',
      '/api/journal/entries',
      '/api/analytics/resilience'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Personal Gemini Journal Backend running on port ${PORT}`);
  console.log(`  Frontend Web UI: http://localhost:5173 / http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
