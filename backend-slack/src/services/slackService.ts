/**
 * Slack Service - Handles all Slack API interactions
 * 
 * Features:
 * - Fetch messages from channels with pagination
 * - Resolve user IDs to human-readable names
 * - Filter out bot messages and system events
 * - Handle rate limiting
 * - Support public and private channels
 */

import { WebClient } from '@slack/web-api';
import type {
  SlackMessage,
  SlackMessageRaw,
  SlackChannel,
  SlackUser,
  FetchMessagesOptions,
  SlackAPIError
} from '../types/index.js';
import { config } from '../config/index.js';

export class SlackService {
  private client: WebClient;
  private userCache: Map<string, SlackUser>;
  private rateLimitDelayMs: number;
  private maxMessages: number;

  constructor() {
    this.client = new WebClient(config.slack.botToken);
    this.userCache = new Map();
    this.rateLimitDelayMs = config.slack.rateLimitDelayMs;
    this.maxMessages = config.slack.maxMessagesPerChannel;
  }

  /**
   * Test connection to Slack API
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.auth.test();
      console.log('✅ Connected to Slack:', result.team);
      return true;
    } catch (error) {
      console.error('❌ Slack connection failed:', error);
      return false;
    }
  }

  /**
   * List all channels the bot has access to
   */
  async listChannels(): Promise<SlackChannel[]> {
    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true,
        limit: 200
      });

      if (!result.channels) {
        return [];
      }

      return result.channels.map(channel => ({
        id: channel.id!,
        name: channel.name || 'unknown',
        is_private: channel.is_private || false,
        is_member: channel.is_member || false
      }));
    } catch (error: any) {
      throw new Error(`Failed to list channels: ${error.message}`) as SlackAPIError;
    }
  }

  /**
   * Fetch messages from a Slack channel with pagination
   * 
   * Design decisions:
   * - Uses cursor-based pagination for reliability
   * - Implements rate limiting delay between requests
   * - Filters out bots and system messages
   * - Resolves user IDs to names for readability
   */
  async fetchMessages(options: FetchMessagesOptions): Promise<SlackMessage[]> {
    const {
      channelId,
      oldest,
      latest,
      limit = this.maxMessages,
      includeThreads = false
    } = options;

    const allMessages: SlackMessage[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    try {
      // Fetch messages with pagination
      while (hasMore && allMessages.length < limit) {
        const result = await this.client.conversations.history({
          channel: channelId,
          oldest,
          latest,
          cursor,
          limit: Math.min(200, limit - allMessages.length) // Slack max is 200 per request
        });

        if (!result.messages || result.messages.length === 0) {
          break;
        }

        // Filter and process messages
        const filteredMessages = await this.filterAndProcessMessages(
          result.messages as SlackMessageRaw[]
        );

        allMessages.push(...filteredMessages);

        // Check for more messages
        hasMore = result.has_more || false;
        cursor = result.response_metadata?.next_cursor;

        // Rate limiting: wait before next request
        if (hasMore && cursor) {
          await this.delay(this.rateLimitDelayMs);
        }
      }

      console.log(`📥 Fetched ${allMessages.length} messages from channel ${channelId}`);
      return allMessages.slice(0, limit);

    } catch (error: any) {
      if (error.data?.error === 'rate_limited') {
        const retryAfter = parseInt(error.data.retry_after || '60', 10);
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`) as SlackAPIError;
      }
      throw new Error(`Failed to fetch messages: ${error.message}`) as SlackAPIError;
    }
  }

  /**
   * Filter out unwanted messages and resolve user IDs
   * 
   * Filters:
   * - Bot messages (bot_id present)
   * - System messages (subtype: channel_join, channel_leave, etc.)
   * - Messages without user ID
   * - Messages without text content
   */
  private async filterAndProcessMessages(
    messages: SlackMessageRaw[]
  ): Promise<SlackMessage[]> {
    const processed: SlackMessage[] = [];

    for (const msg of messages) {
      // Skip if it's a bot message
      if (msg.bot_id) {
        continue;
      }

      // Skip system messages (joins, leaves, etc.)
      if (msg.subtype && [
        'channel_join',
        'channel_leave',
        'channel_archive',
        'channel_unarchive',
        'pinned_item',
        'unpinned_item'
      ].includes(msg.subtype)) {
        continue;
      }

      // Skip if no user or no text
      if (!msg.user || !msg.text || msg.text.trim() === '') {
        continue;
      }

      // Resolve user ID to name
      const userName = await this.resolveUserId(msg.user);

      // Convert timestamp to ISO format
      const timestamp = this.slackTsToISO(msg.ts);

      processed.push({
        timestamp,
        user: userName,
        text: this.cleanMessageText(msg.text),
        thread_ts: msg.thread_ts,
        reply_count: msg.reply_count
      });
    }

    return processed;
  }

  /**
   * Resolve Slack user ID to human-readable name
   * 
   * Uses caching to minimize API calls:
   * - Check cache first
   * - Fetch from API if not cached
   * - Store in cache for future use
   */
  async resolveUserId(userId: string): Promise<string> {
    // Check cache first
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!.real_name || this.userCache.get(userId)!.name;
    }

    // Fetch from API
    try {
      const result = await this.client.users.info({ user: userId });
      
      if (result.user) {
        const user: SlackUser = {
          id: result.user.id!,
          name: result.user.name || 'Unknown',
          real_name: result.user.real_name || result.user.name || 'Unknown User',
          is_bot: result.user.is_bot || false
        };

        // Cache the user
        this.userCache.set(userId, user);
        
        return user.real_name;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to resolve user ${userId}:`, error);
    }

    return `User-${userId}`;
  }

  /**
   * Convert Slack timestamp (1234567890.123456) to ISO 8601 format
   */
  private slackTsToISO(ts: string): string {
    const [seconds, microseconds] = ts.split('.');
    const milliseconds = parseInt(seconds, 10) * 1000 + parseInt(microseconds?.slice(0, 3) || '0', 10);
    return new Date(milliseconds).toISOString();
  }

  /**
   * Clean Slack message text
   * 
   * Removes:
   * - User ID tags (<@U12345>) -> @username
   * - Channel tags (<#C12345|general>) -> #general
   * - URLs (<https://example.com|Example>) -> Example
   */
  private cleanMessageText(text: string): string {
    return text
      // Replace user mentions with @username (we'll resolve later if needed)
      .replace(/<@([A-Z0-9]+)>/g, '@user')
      // Replace channel mentions
      .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1')
      // Replace links
      .replace(/<([^|>]+)\|([^>]+)>/g, '$2')
      // Remove plain links
      .replace(/<([^>]+)>/g, '$1')
      .trim();
  }

  /**
   * Get channel info by ID
   */
  async getChannelInfo(channelId: string): Promise<{ name: string; is_private: boolean }> {
    try {
      const result = await this.client.conversations.info({ channel: channelId });
      return {
        name: result.channel?.name || 'unknown',
        is_private: result.channel?.is_private || false
      };
    } catch (error: any) {
      throw new Error(`Failed to get channel info: ${error.message}`) as SlackAPIError;
    }
  }

  /**
   * Utility: delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new SlackService();
