import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPUS_API_BASE = process.env.OPUS_API_BASE_URL || 'https://operator.opus.com';
const OPUS_API_KEY = process.env.OPUS_API_KEY;
const OPUS_WORKFLOW_ID = process.env.OPUS_WORKFLOW_ID;

/**
 * Opus Job Operator Service
 * Handles all interactions with the Opus API
 */
class OpusService {
  constructor() {
    this.baseURL = OPUS_API_BASE;
    this.apiKey = OPUS_API_KEY;
    this.workflowId = OPUS_WORKFLOW_ID;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': this.apiKey
      }
    });
  }

  /**
   * Step 1: Get workflow schema
   */
  async getWorkflowDetails() {
    try {
      const response = await this.client.get(`/workflow/${this.workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 2: Initiate a new job
   */
  async initiateJob(title, description) {
    try {
      const response = await this.client.post('/job/initiate', {
        workflowId: this.workflowId,
        title: title || 'Teams Message Processing',
        description: description || 'Processing Teams messages for task extraction and prioritization'
      });
      return response.data.jobExecutionId;
    } catch (error) {
      console.error('Error initiating job:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 3: Execute job with payload
   */
  async executeJob(jobExecutionId, payload) {
    try {
      const response = await this.client.post('/job/execute', {
        jobExecutionId,
        jobPayloadSchemaInstance: payload
      });
      return response.data;
    } catch (error) {
      console.error('Error executing job:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 4: Check job status
   */
  async getJobStatus(jobExecutionId) {
    try {
      const response = await this.client.get(`/job/${jobExecutionId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job status:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 5: Get job results
   */
  async getJobResults(jobExecutionId) {
    try {
      const response = await this.client.get(`/job/${jobExecutionId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job results:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 6: Get job audit log
   */
  async getJobAuditLog(jobExecutionId) {
    try {
      const response = await this.client.get(`/job/${jobExecutionId}/audit`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job audit log:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Poll job status until completion
   */
  async pollJobUntilComplete(jobExecutionId, intervalMs = 3000, maxAttempts = 60) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const status = await this.getJobStatus(jobExecutionId);
      
      if (status.status === 'COMPLETED') {
        return await this.getJobResults(jobExecutionId);
      }
      
      if (status.status === 'FAILED') {
        throw new Error('Job execution failed');
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error('Job polling timeout');
  }

  /**
   * Complete workflow: Initiate → Execute → Poll → Results
   */
  async processMessages(messages, existingTasks = []) {
    try {
      // Step 1: Initiate job
      const jobExecutionId = await this.initiateJob(
        'Teams Message Processing',
        `Processing ${messages.length} messages`
      );

      // Step 2: Prepare payload
      const payload = this.buildMessagePayload(messages, existingTasks);

      // Step 3: Execute job
      await this.executeJob(jobExecutionId, payload);

      // Step 4: Poll until complete
      const results = await this.pollJobUntilComplete(jobExecutionId);

      return {
        jobExecutionId,
        status: 'COMPLETED',
        results: results.results
      };
    } catch (error) {
      console.error('Error processing messages:', error);
      throw error;
    }
  }

  /**
   * Build payload for message processing
   * This will be customized based on your actual Opus workflow schema
   */
  buildMessagePayload(messages, existingTasks) {
    // Convert messages to structured format
    const messagesText = messages.map((msg, idx) => 
      `Message ${idx + 1}:\nFrom: ${msg.sender}\nSubject: ${msg.subject || 'N/A'}\nContent: ${msg.content}\nTimestamp: ${msg.timestamp}\n---`
    ).join('\n\n');

    const tasksText = existingTasks.map((task, idx) =>
      `Task ${idx + 1}: ${task.title} (Priority: ${task.priority}, Status: ${task.status})`
    ).join('\n');

    // This is a template - adjust based on your actual workflow schema
    return {
      'messages_input': {
        value: messagesText,
        type: 'str',
        displayName: 'Messages Input'
      },
      'existing_tasks': {
        value: tasksText || 'No existing tasks',
        type: 'str',
        displayName: 'Existing Tasks'
      },
      'processing_instructions': {
        value: `Analyze the messages and:
1. Extract actionable tasks
2. Generate suggested replies for each message
3. Prioritize tasks based on urgency and importance
4. Identify tasks that need reprioritization
5. Categorize messages by type (request, FYI, urgent, meeting)`,
        type: 'str',
        displayName: 'Processing Instructions'
      }
    };
  }
}

export default new OpusService();
