import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads');
const OUTPUTS_DIR = path.join(PROJECT_ROOT, 'outputs');

const OPUS_API_BASE = process.env.OPUS_API_BASE_URL || 'https://operator.opus.com';
const OPUS_API_KEY = process.env.OPUS_API_KEY;
const OPUS_WORKFLOW_ID = process.env.OPUS_WORKFLOW_ID || 'EJ8PrEHf8b4zNenS';

/**
 * Ensure directory exists (create if not)
 */
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Opus Job Operator Service
 * Uses fetch API per Opus documentation
 */
class OpusService {
  constructor() {
    this.baseURL = OPUS_API_BASE;
    this.apiKey = OPUS_API_KEY;
    this.workflowId = OPUS_WORKFLOW_ID;
  }

  /**
   * Step 1: Get workflow schema
   * GET https://operator.opus.com/workflow/{workflowId}
   */
  async getWorkflowDetails() {
    try {
      const response = await fetch(
        `${this.baseURL}/workflow/${this.workflowId}`,
        {
          method: 'GET',
          headers: { 'x-service-key': this.apiKey },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching workflow details:', error.message);
      throw error;
    }
  }

  /**
   * Step 2: Initiate a new job
   * POST https://operator.opus.com/job/initiate
   */
  async initiateJob(title, description) {
    try {
      const response = await fetch(`${this.baseURL}/job/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.apiKey,
        },
        body: JSON.stringify({
          workflowId: this.workflowId,
          title: title || 'Teams Message Processing',
          description: description || 'Processing Teams messages for task extraction and prioritization',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      return data.jobExecutionId;
    } catch (error) {
      console.error('Error initiating job:', error.message);
      throw error;
    }
  }

  /**
   * Step 3: Execute job with payload
   * POST https://operator.opus.com/job/execute
   */
  async executeJob(jobExecutionId, payload) {
    try {
      console.log('[Opus] Executing job...');
      const response = await fetch(`${this.baseURL}/job/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.apiKey,
        },
        body: JSON.stringify({
          jobExecutionId,
          jobPayloadSchemaInstance: payload,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.message || `HTTP ${response.status}`;
        const friendly = typeof msg === 'string' && (msg.includes('502') || msg.includes('Bad gateway'))
          ? 'Opus workflow service temporarily unavailable (502). Please try again in a few minutes.'
          : msg.substring(0, 300);
        throw new Error(friendly);
      }
      return data;
    } catch (error) {
      console.error('Error executing job:', error.message);
      throw error;
    }
  }

  /**
   * Step 4: Check job status
   * GET https://operator.opus.com/job/{jobExecutionId}/status
   */
  async getJobStatus(jobExecutionId) {
    try {
      const response = await fetch(
        `${this.baseURL}/job/${jobExecutionId}/status`,
        {
          method: 'GET',
          headers: { 'x-service-key': this.apiKey },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching job status:', error.message);
      throw error;
    }
  }

  /**
   * Step 5: Get job results
   * GET https://operator.opus.com/job/{jobExecutionId}/results
   */
  async getJobResults(jobExecutionId) {
    try {
      const response = await fetch(
        `${this.baseURL}/job/${jobExecutionId}/results`,
        {
          method: 'GET',
          headers: { 'x-service-key': this.apiKey },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching job results:', error.message);
      throw error;
    }
  }

  /**
   * Step 6: Get job audit log
   * GET https://operator.opus.com/job/{jobExecutionId}/audit
   */
  async getJobAuditLog(jobExecutionId) {
    try {
      const response = await fetch(
        `${this.baseURL}/job/${jobExecutionId}/audit`,
        {
          method: 'GET',
          headers: { 'x-service-key': this.apiKey },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching job audit log:', error.message);
      throw error;
    }
  }

  /**
   * Get Upload URL - POST /job/file/upload
   * Returns presignedUrl (for S3 PUT) and fileUrl (for jobPayloadSchemaInstance)
   */
  async getUploadUrl(fileExtension, accessScope = 'organization') {
    try {
      const response = await fetch(`${this.baseURL}/job/file/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': this.apiKey,
        },
        body: JSON.stringify({ fileExtension, accessScope }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
      return { presignedUrl: data.presignedUrl, fileUrl: data.fileUrl };
    } catch (error) {
      console.error('Error getting upload URL:', error.message);
      throw error;
    }
  }

  /**
   * Save output from API results to outputs/ folder
   * Handles: user_notification_messages, summary, tasks, or full results
   */
  async saveTextOutput(jobExecutionId, results) {
    await ensureDir(OUTPUTS_DIR);
    const r = results?.results || results || {};
    const notifications = r.user_notification_messages;
    const summary = r.summary;
    const data = r.data;
    const tasks = r.tasks;
    const items = r.items;
    const list = Array.isArray(data) ? data
      : Array.isArray(tasks) ? tasks
      : Array.isArray(items) ? items
      : Array.isArray(r) ? r : null;

    let textContent = null;
    if (notifications && Array.isArray(notifications) && notifications.length > 0) {
      // Format user_notification_messages: one section per user
      textContent = notifications.map((n, i) => {
        const uid = n.user_id || `User ${i + 1}`;
        const msg = n.notification_message || '';
        return `=== ${uid} ===\n${msg}`;
      }).join('\n\n');
    } else if (typeof summary === 'string') {
      textContent = summary;
    } else if (typeof data === 'string') {
      textContent = data;
    } else if (list && list.length > 0) {
      textContent = list.map((item, i) => {
        const s = typeof item === 'object' ? JSON.stringify(item) : String(item);
        return `${i + 1}. ${s}`;
      }).join('\n');
    }

    const savedPaths = [];
    if (textContent) {
      const txtPath = path.join(OUTPUTS_DIR, `${jobExecutionId}_output.txt`);
      await fs.writeFile(txtPath, textContent, 'utf8');
      savedPaths.push({ localPath: txtPath, filename: `${jobExecutionId}_output.txt`, type: 'text' });
      console.log('[Opus] Saved text output:', txtPath);
    }
    // Always save full results as JSON
    const jsonPath = path.join(OUTPUTS_DIR, `${jobExecutionId}_results.json`);
    await fs.writeFile(jsonPath, JSON.stringify(r, null, 2), 'utf8');
    savedPaths.push({ localPath: jsonPath, filename: `${jobExecutionId}_results.json`, type: 'json' });
    console.log('[Opus] Saved results JSON:', jsonPath);
    return savedPaths;
  }

  /**
   * Save output files from job results to local outputs/ folder
   * Per HOW_TO_SUBMIT_JOB: Step 6 - Retrieve results, including output files
   */
  async saveOutputFiles(jobExecutionId, outputFiles) {
    if (!outputFiles || !Array.isArray(outputFiles) || outputFiles.length === 0) {
      return [];
    }
    await ensureDir(OUTPUTS_DIR);
    const savedPaths = [];
    for (let i = 0; i < outputFiles.length; i++) {
      const url = outputFiles[i];
      if (!url || typeof url !== 'string') continue;
      try {
        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = path.extname(new URL(url).pathname) || '.bin';
        const filename = `${jobExecutionId}_output_${i}${ext}`;
        const filepath = path.join(OUTPUTS_DIR, filename);
        await fs.writeFile(filepath, buffer);
        savedPaths.push({ url, localPath: filepath, filename });
        console.log('[Opus] Saved output file:', filename);
      } catch (e) {
        console.error('[Opus] Failed to save output file:', url, e.message);
      }
    }
    return savedPaths;
  }

  /**
   * Upload File - PUT to presignedUrl (AWS S3, NOT Opus API)
   * Per docs: This request goes to AWS S3. Do NOT include x-service-key header.
   */
  async uploadFileToPresignedUrl(presignedUrl, fileBuffer, contentType) {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: fileBuffer,
      });
      if (!response.ok) {
        throw new Error(`Upload failed: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error.message);
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
        let detail = 'unknown';
        try {
          const resp = await this.getJobResults(jobExecutionId);
          console.error('[Opus] Failed job response:', JSON.stringify(resp, null, 2));
          const r = resp?.results || resp || {};
          detail = r.error || r.message || r.summary || r.reason || resp.error || resp.message;
          if (!detail && typeof r === 'object' && Object.keys(r).length > 0) {
            detail = JSON.stringify(r);
          }
        } catch (e) {
          detail = e.message || 'Could not fetch details';
        }
        throw new Error(`Opus job failed: ${detail}. View job in Opus dashboard: jobExecutionId=${jobExecutionId}`);
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
   * Complete workflow: Initiate → Upload PDF → Execute → Poll → Results
   * For workflow EJ8PrEHf8b4zNenS (or any workflow with PDF file input)
   */
  async processPdf(pdfBuffer, options = {}) {
    try {
      const { title = 'PDF Processing', description = 'Processing uploaded PDF document' } = options;

      // Step 1: Get workflow schema
      const workflowDetails = await this.getWorkflowDetails();
      const schema = workflowDetails.jobPayloadSchema || {};
      const fields = Object.entries(schema);

      const fileInputs = fields.filter(([_, f]) => f && (f.type === 'file' || f.type === 'array_files'));
      if (fileInputs.length === 0) {
        throw new Error('Workflow has no file input - cannot process PDF');
      }

      const [fileVarName, fileFieldDef] = fileInputs[0];

      // Step 2: Initiate job
      const jobExecutionId = await this.initiateJob(title, description);

      // Step 2b: Save input PDF to uploads/ folder (audit/staging)
      await ensureDir(UPLOADS_DIR);
      const inputPath = path.join(UPLOADS_DIR, `${jobExecutionId}_input.pdf`);
      await fs.writeFile(inputPath, pdfBuffer);
      console.log('[Opus] Saved input PDF:', inputPath);

      // Step 3: Get presigned URL and upload PDF
      const { presignedUrl, fileUrl } = await this.getUploadUrl('.pdf');
      await this.uploadFileToPresignedUrl(presignedUrl, pdfBuffer, 'application/pdf');

      // Step 4: Build payload - include ALL schema fields (workflow may require all)
      // Per Opus docs: array_files expects value as array of URLs, file expects single URL
      const payload = {};
      for (const [varName, field] of fields) {
        const type = field.type || 'str';
        const displayName = field.display_name || varName;
        if (varName === fileVarName) {
          const fileValue = type === 'array_files' ? [fileUrl] : fileUrl;
          payload[varName] = { value: fileValue, type, displayName };
        } else {
          const def = field.is_nullable ? null
            : type === 'str' ? '' : type === 'float' ? 0 : type === 'bool' ? false
            : type === 'date' ? new Date().toISOString().split('T')[0] : '';
          payload[varName] = { value: def, type, displayName };
        }
      }

      console.log('[Opus] Schema keys:', fields.map(([k]) => k));
      console.log('[Opus] Payload keys:', Object.keys(payload));

      // Step 5: Execute job
      await this.executeJob(jobExecutionId, payload);

      // Step 6: Poll until complete
      const results = await this.pollJobUntilComplete(jobExecutionId);

      // Step 7: Save outputs to outputs/ folder
      // Opus returns { jobResultsPayloadSchema: { varName: { value, ... } } } - extract values for display
      const outputSchema = results?.jobResultsPayloadSchema || results?.results || {};
      const r = {};
      for (const [key, obj] of Object.entries(outputSchema)) {
        if (obj && typeof obj === 'object' && 'value' in obj) {
          r[key] = obj.value;
        } else {
          r[key] = obj;
        }
      }
      const outputFiles = r.outputFiles || results?.results?.outputFiles || [];
      const savedOutputs = await this.saveOutputFiles(jobExecutionId, outputFiles);
      const savedTextOutputs = await this.saveTextOutput(jobExecutionId, r);
      const allOutputs = [...savedOutputs, ...savedTextOutputs];

      return {
        jobExecutionId,
        status: 'COMPLETED',
        results: r,
        inputPath,
        outputPaths: allOutputs.map(o => o.localPath),
        outputFiles: savedOutputs,
        textOutputPath: savedTextOutputs.find(o => o.type === 'text')?.localPath,
        resultsJsonPath: savedTextOutputs.find(o => o.type === 'json')?.localPath
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
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
