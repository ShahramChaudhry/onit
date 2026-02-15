/**
 * Opus Service - Integrates with Applied AI Opus Platform
 * 
 * Handles the complete Opus Job Operator API workflow:
 * 1. Get workflow schema
 * 2. Initiate job
 * 3. Execute job with message payload
 * 4. Poll for completion
 * 5. Retrieve results
 * 
 * Reference: https://developer.opus.com
 */

import axios, { AxiosInstance } from 'axios';
import type {
  OpusMessage,
  TaskExtractionResult,
  OpusJobInitiateResponse,
  OpusJobStatus,
  OpusJobResults,
  OpusAPIError
} from '../types/index.js';
import { config } from '../config/index.js';

export class OpusService {
  private client: AxiosInstance;
  private workflowId: string;

  constructor() {
    this.workflowId = config.opus.workflowId;
    
    this.client = axios.create({
      baseURL: config.opus.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': config.opus.apiKey
      }
    });
  }

  /**
   * Test connection to Opus API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getWorkflowDetails();
      console.log('✅ Connected to Opus:', response.jobPayloadSchema ? 'Workflow found' : 'Check workflow');
      return true;
    } catch (error) {
      console.error('❌ Opus connection failed:', error);
      return false;
    }
  }

  /**
   * Step 1: Get workflow details and schema
   */
  async getWorkflowDetails(): Promise<any> {
    try {
      const response = await this.client.get(`/workflow/${this.workflowId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch workflow details');
    }
  }

  /**
   * Step 2: Initiate a new job
   */
  async initiateJob(title: string, description: string): Promise<string> {
    try {
      const response = await this.client.post<OpusJobInitiateResponse>('/job/initiate', {
        workflowId: this.workflowId,
        title,
        description
      });
      
      console.log('🚀 Job initiated:', response.data.jobExecutionId);
      return response.data.jobExecutionId;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to initiate job');
    }
  }

  /**
   * Step 3: Execute job with payload
   */
  async executeJob(jobExecutionId: string, payload: Record<string, any>): Promise<void> {
    try {
      await this.client.post('/job/execute', {
        jobExecutionId,
        jobPayloadSchemaInstance: payload
      });
      
      console.log('▶️ Job executing:', jobExecutionId);
    } catch (error: any) {
      throw this.handleError(error, 'Failed to execute job');
    }
  }

  /**
   * Step 4: Check job status
   */
  async getJobStatus(jobExecutionId: string): Promise<OpusJobStatus> {
    try {
      const response = await this.client.get<OpusJobStatus>(
        `/job/${jobExecutionId}/status`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get job status');
    }
  }

  /**
   * Step 5: Get job results
   */
  async getJobResults(jobExecutionId: string): Promise<OpusJobResults> {
    try {
      const response = await this.client.get<OpusJobResults>(
        `/job/${jobExecutionId}/results`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get job results');
    }
  }

  /**
   * Poll job status until completion
   * 
   * Design decisions:
   * - Polls every 3 seconds (configurable)
   * - Max 60 attempts = 3 minutes timeout
   * - Returns results automatically when complete
   */
  async pollJobUntilComplete(
    jobExecutionId: string,
    intervalMs: number = 3000,
    maxAttempts: number = 60
  ): Promise<OpusJobResults> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getJobStatus(jobExecutionId);

      console.log(`⏳ Job status [${attempts + 1}/${maxAttempts}]:`, status.status);

      if (status.status === 'COMPLETED') {
        console.log('✅ Job completed successfully');
        return await this.getJobResults(jobExecutionId);
      }

      if (status.status === 'FAILED') {
        throw new Error('Job execution failed') as OpusAPIError;
      }

      attempts++;
      await this.delay(intervalMs);
    }

    throw new Error('Job polling timeout - exceeded max attempts') as OpusAPIError;
  }

  /**
   * Complete workflow: Process Slack messages through Opus
   * 
   * This is the main method that:
   * 1. Formats Slack messages for Opus
   * 2. Initiates job
   * 3. Executes with payload
   * 4. Polls until complete
   * 5. Returns structured task list
   */
  async processSlackMessages(
    messages: OpusMessage[],
    channelName: string,
    existingTasks: any[] = []
  ): Promise<{
    jobExecutionId: string;
    status: string;
    results: TaskExtractionResult;
  }> {
    const startTime = Date.now();

    try {
      // Step 1: Initiate job
      const jobExecutionId = await this.initiateJob(
        `Slack Channel: ${channelName}`,
        `Processing ${messages.length} messages from ${channelName}`
      );

      // Step 2: Prepare payload for Opus workflow
      const payload = this.buildMessagePayload(messages, channelName, existingTasks);

      // Step 3: Execute job
      await this.executeJob(jobExecutionId, payload);

      // Step 4: Poll until complete
      const results = await this.pollJobUntilComplete(jobExecutionId);

      // Step 5: Parse and structure results
      const processingTime = Date.now() - startTime;
      const taskResult = this.parseOpusResults(results, messages.length, processingTime, channelName);

      return {
        jobExecutionId,
        status: 'COMPLETED',
        results: taskResult
      };
    } catch (error: any) {
      console.error('❌ Error processing messages:', error.message);
      throw error;
    }
  }

  /**
   * Build payload for Opus workflow
   * 
   * Formats Slack messages into the structure expected by the Opus workflow.
   * Customize this based on your actual workflow schema.
   */
  private buildMessagePayload(
    messages: OpusMessage[],
    channelName: string,
    existingTasks: any[]
  ): Record<string, any> {
    // Format messages for Opus - matches Teams backend format
    const messagesText = messages.map((msg, idx) =>
      `Message ${idx + 1}:\n` +
      `From: ${msg.sender}\n` +
      `Subject: Slack message from #${channelName}\n` +
      `Content: ${msg.text}\n` +
      `Timestamp: ${msg.timestamp}\n` +
      `---`
    ).join('\n\n');

    const tasksText = existingTasks.length > 0
      ? existingTasks.map((task, idx) =>
          `Task ${idx + 1}: ${task.title} (Priority: ${task.priority}, Status: ${task.status})`
        ).join('\n')
      : 'No existing tasks';

    // This structure matches your existing Opus workflow inputs
    // Using exact same variable names and display names as Teams backend
    return {
      'messages_input': {
        value: messagesText,
        type: 'str',
        displayName: 'Messages Input'  // ✅ Matches Teams backend
      },
      'existing_tasks': {
        value: tasksText,
        type: 'str',
        displayName: 'Existing Tasks'
      },
      'processing_instructions': {
        value: this.getProcessingInstructions(channelName),
        type: 'str',
        displayName: 'Processing Instructions'
      }
    };
  }

  /**
   * Processing instructions for Opus AI
   * 
   * These instructions guide the Opus workflow on how to process messages.
   * Customize based on your team's needs.
   */
  private getProcessingInstructions(channelName: string): string {
    return `Analyze the messages from Slack channel "${channelName}" and:
1. Extract actionable tasks
2. Generate suggested replies for each message
3. Prioritize tasks based on urgency and importance
4. Identify tasks that need reprioritization
5. Categorize messages by type (request, FYI, urgent, meeting, question)

Additional Guidelines:
- Extract ONLY real, actionable tasks (ignore casual chat, greetings, reactions)
- Assign urgency based on:
  * Time pressure (today, ASAP, urgent, EOD)
  * Imperative language (must, need to, should)
  * Emojis indicating urgency (⚠️ 🔥 ⏰ 🚨)
  * Explicit deadlines mentioned
  * Context (releases, blockers, approvals, production issues, security)
- Infer task owner from:
  * Direct mentions (@username)
  * Context ("I'll handle this", "I can take that")
  * Previous task assignments
  * Mark as "Unassigned" if unclear
- Identify and extract explicit deadlines when mentioned

Urgency Levels:
- HIGH: Deadlines today, blockers, production issues, security issues, approvals needed
- MEDIUM: Important but flexible timing, team coordination, documentation requests
- LOW: Suggestions, future ideas, optional improvements, FYI items

Message Categories:
- urgent: Critical, time-sensitive, blocking work
- request: Someone asking for action or help
- question: Needs a response or clarification  
- info: FYI, announcements, updates
- reminder: Upcoming deadlines or events
- meeting: Meeting-related content`;
  }

  /**
   * Parse Opus results into structured task format
   */
  private parseOpusResults(
    opusResults: OpusJobResults,
    messageCount: number,
    processingTime: number,
    channelName: string
  ): TaskExtractionResult {
    try {
      // Opus returns results in results.data or results.summary
      const data = opusResults.results?.data || {};
      
      // Try to parse if it's a JSON string
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch {
          // If parsing fails, structure it manually
          parsedData = { summary: data };
        }
      }

      return {
        summary: parsedData.summary || `Processed ${messageCount} messages from ${channelName}`,
        tasks: parsedData.tasks || parsedData.extracted_tasks || [],
        reprioritization_recommendations: parsedData.reprioritization_recommendations || [],
        metadata: {
          total_messages: messageCount,
          messages_with_tasks: parsedData.tasks?.length || 0,
          processing_time_ms: processingTime,
          channel_name: channelName
        }
      };
    } catch (error) {
      console.error('⚠️ Error parsing Opus results:', error);
      
      // Return a safe default structure
      return {
        summary: `Processed ${messageCount} messages (parsing incomplete)`,
        tasks: [],
        metadata: {
          total_messages: messageCount,
          messages_with_tasks: 0,
          processing_time_ms: processingTime,
          channel_name: channelName
        }
      };
    }
  }

  /**
   * Error handler with detailed logging
   */
  private handleError(error: any, context: string): OpusAPIError {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    const statusCode = error.response?.status;
    
    console.error(`❌ ${context}:`, {
      message,
      statusCode,
      data: error.response?.data
    });

    const opusError = new Error(`${context}: ${message}`) as OpusAPIError;
    opusError.statusCode = statusCode;
    return opusError;
  }

  /**
   * Utility: delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new OpusService();
