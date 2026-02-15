/**
 * Main Express Server
 * Slack + Opus Task Extraction Service
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import slackService from './services/slackService.js';
import opusService from './services/opusService.js';
import type {
  ProcessChannelRequest,
  ProcessChannelResponse,
  HealthCheckResponse,
  ListChannelsResponse
} from './types/index.js';

const app = express();
const PORT = config.server.port;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', async (req: Request, res: Response<HealthCheckResponse>) => {
  try {
    const slackConnected = await slackService.testConnection();
    const opusConnected = await opusService.testConnection();

    res.json({
      status: slackConnected && opusConnected ? 'ok' : 'error',
      services: {
        slack: slackConnected ? 'connected' : 'error',
        opus: opusConnected ? 'connected' : 'error'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      services: {
        slack: 'error',
        opus: 'error'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/channels
 * List all Slack channels the bot has access to
 */
app.get('/api/channels', async (req: Request, res: Response<ListChannelsResponse>) => {
  try {
    const channels = await slackService.listChannels();
    
    res.json({
      channels: channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        is_private: ch.is_private,
        is_member: ch.is_member
      }))
    });
  } catch (error: any) {
    res.status(500).json({
      channels: [],
      error: error.message
    } as any);
  }
});

/**
 * POST /api/process-channel
 * Process a Slack channel's messages through Opus
 * 
 * Request body:
 * {
 *   "channelId": "C12345678",
 *   "oldest": "1234567890.123456" (optional),
 *   "latest": "1234567890.123456" (optional),
 *   "includeThreads": false (optional)
 * }
 */
app.post('/api/process-channel', async (
  req: Request<{}, {}, ProcessChannelRequest>,
  res: Response<ProcessChannelResponse>
) => {
  const { channelId, oldest, latest, includeThreads = false } = req.body;

  if (!channelId) {
    return res.status(400).json({
      success: false,
      channelId: '',
      channelName: '',
      error: 'channelId is required'
    });
  }

  try {
    console.log(`\n🚀 Starting processing for channel: ${channelId}`);

    // Step 1: Get channel info
    const channelInfo = await slackService.getChannelInfo(channelId);
    console.log(`📺 Channel: ${channelInfo.name} (private: ${channelInfo.is_private})`);

    // Step 2: Fetch messages
    const messages = await slackService.fetchMessages({
      channelId,
      oldest,
      latest,
      includeThreads
    });

    if (messages.length === 0) {
      return res.json({
        success: true,
        channelId,
        channelName: channelInfo.name,
        result: {
          summary: 'No messages found in the specified time range',
          tasks: [],
          metadata: {
            total_messages: 0,
            messages_with_tasks: 0,
            processing_time_ms: 0,
            channel_name: channelInfo.name
          }
        }
      });
    }

    // Step 3: Convert to Opus format
    const opusMessages = messages.map(msg => ({
      timestamp: msg.timestamp,
      sender: msg.user,
      text: msg.text,
      channel: channelInfo.name,
      thread_ts: msg.thread_ts
    }));

    // Step 4: Process through Opus
    const result = await opusService.processSlackMessages(
      opusMessages,
      channelInfo.name
    );

    console.log(`✅ Processing complete! Extracted ${result.results.tasks.length} tasks`);

    res.json({
      success: true,
      channelId,
      channelName: channelInfo.name,
      jobExecutionId: result.jobExecutionId,
      result: result.results
    });

  } catch (error: any) {
    console.error('❌ Error processing channel:', error);
    
    res.status(500).json({
      success: false,
      channelId,
      channelName: req.body.channelName || 'unknown',
      error: error.message
    });
  }
});

/**
 * GET /api/opus/job/:jobId/status
 * Check Opus job status
 */
app.get('/api/opus/job/:jobId/status', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const status = await opusService.getJobStatus(jobId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/opus/job/:jobId/results
 * Get Opus job results
 */
app.get('/api/opus/job/:jobId/results', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const results = await opusService.getJobResults(jobId);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🚀 Slack + Opus Task Extraction Service                ║
║                                                          ║
║  Server:  http://localhost:${PORT}                      ║
║  Health:  http://localhost:${PORT}/health               ║
║                                                          ║
║  Endpoints:                                              ║
║    GET  /health                                          ║
║    GET  /api/channels                                    ║
║    POST /api/process-channel                             ║
║                                                          ║
║  Status: Running ✓                                       ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
