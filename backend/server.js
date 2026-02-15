import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import opusRoutes from './routes/opus.js';
import messagesRoutes from './routes/messages.js';

dotenv.config();

if (!process.env.OPUS_API_KEY) {
  console.warn('⚠️  OPUS_API_KEY not set in .env — PDF/Opus API calls will fail with 401');
  console.warn('   Add OPUS_API_KEY=your_x_service_key to .env and restart');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/opus', opusRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Teams Task Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});
