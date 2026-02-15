/**
 * Type definitions for Slack + Opus Task Extractor
 */

// ============================================================================
// SLACK TYPES
// ============================================================================

export interface SlackMessage {
  timestamp: string;
  user: string;
  text: string;
  thread_ts?: string;
  reply_count?: number;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}

export interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  is_bot: boolean;
}

export interface SlackMessageRaw {
  type: string;
  subtype?: string;
  user?: string;
  bot_id?: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
}

export interface SlackConversationHistory {
  messages: SlackMessageRaw[];
  has_more: boolean;
  response_metadata?: {
    next_cursor?: string;
  };
}

// ============================================================================
// OPUS TYPES (Applied AI Platform)
// ============================================================================

export interface OpusMessage {
  timestamp: string;
  sender: string;
  text: string;
  channel?: string;
  thread_ts?: string;
}

export interface ExtractedTask {
  task: string;
  owner: string;
  urgency: 'low' | 'medium' | 'high';
  deadline?: string;
  source_message_ts: string;
  context?: string;
  category?: string;
}

export interface TaskExtractionResult {
  summary: string;
  tasks: ExtractedTask[];
  reprioritization_recommendations?: Array<{
    task_id: string;
    current_priority: string;
    recommended_priority: string;
    reason: string;
  }>;
  metadata?: {
    total_messages: number;
    messages_with_tasks: number;
    processing_time_ms: number;
    channel_name?: string;
  };
}

// Opus Job Operator API Types
export interface OpusJobInitiateResponse {
  jobExecutionId: string;
}

export interface OpusJobStatus {
  status: 'IN PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface OpusJobResults {
  jobExecutionId: string;
  status: string;
  results: {
    summary?: string;
    data?: any;
    outputFiles?: string[];
  };
}

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

export interface SlackServiceConfig {
  botToken: string;
  rateLimitDelayMs: number;
  maxMessagesPerChannel: number;
}

export interface OpusServiceConfig {
  apiKey: string;
  workflowId: string;
  baseUrl: string;
}

export interface FetchMessagesOptions {
  channelId: string;
  oldest?: string;
  latest?: string;
  limit?: number;
  includeThreads?: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ProcessChannelRequest {
  channelId: string;
  channelName?: string;
  oldest?: string;
  latest?: string;
  includeThreads?: boolean;
}

export interface ProcessChannelResponse {
  success: boolean;
  channelId: string;
  channelName: string;
  jobExecutionId?: string;
  result?: TaskExtractionResult;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  services: {
    slack: 'connected' | 'disconnected' | 'error';
    opus: 'connected' | 'disconnected' | 'error';
  };
  timestamp: string;
}

export interface ListChannelsResponse {
  channels: Array<{
    id: string;
    name: string;
    is_private: boolean;
    is_member: boolean;
    num_members?: number;
  }>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class SlackAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SlackAPIError';
  }
}

export class OpusAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OpusAPIError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
