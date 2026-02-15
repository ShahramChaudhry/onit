/**
 * Configuration loader with validation
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates required environment variables
 */
function validateEnv(): void {
  const required = [
    'SLACK_BOT_TOKEN',
    'OPUS_API_KEY',
    'OPUS_WORKFLOW_ID'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file.`
    );
  }

  // Validate Slack token format
  if (!process.env.SLACK_BOT_TOKEN?.startsWith('xoxb-')) {
    throw new Error('SLACK_BOT_TOKEN must start with "xoxb-"');
  }
}

// Only validate if not in test mode
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

export const config = {
  // Slack Configuration
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN!,
    appToken: process.env.SLACK_APP_TOKEN,
    rateLimitDelayMs: parseInt(process.env.SLACK_RATE_LIMIT_DELAY_MS || '1000', 10),
    maxMessagesPerChannel: parseInt(process.env.MAX_MESSAGES_PER_CHANNEL || '200', 10)
  },

  // Opus Configuration (Applied AI)
  opus: {
    apiKey: process.env.OPUS_API_KEY!,
    workflowId: process.env.OPUS_WORKFLOW_ID!,
    baseUrl: process.env.OPUS_API_BASE_URL || 'https://operator.opus.com'
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3002', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  }
} as const;

export default config;
