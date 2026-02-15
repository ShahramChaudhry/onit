import express from 'express';
import multer from 'multer';
import opusService from '../services/opusService.js';

const router = express.Router();

// Multer memory storage for PDF uploads (no disk write)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * GET /api/opus/workflow
 * Get workflow details and schema
 */
router.get('/workflow', async (req, res) => {
  try {
    const workflow = await opusService.getWorkflowDetails();
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch workflow details',
      message: error.message 
    });
  }
});

/**
 * POST /api/opus/process-pdf
 * Process PDF file through Opus workflow (workflow ID EJ8PrEHf8b4zNenS)
 * Accepts multipart/form-data with file field 'pdf'
 */
router.post('/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'PDF file is required (multipart/form-data, field name: pdf)'
      });
    }

    const { title, description } = req.body || {};
    const result = await opusService.processPdf(req.file.buffer, {
      title: title || 'PDF Document Processing',
      description: description || 'Processing uploaded PDF document'
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process PDF',
      message: error.message
    });
  }
});

/**
 * POST /api/opus/process
 * Process messages through Opus workflow
 */
router.post('/process', async (req, res) => {
  try {
    const { messages, existingTasks } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'messages array is required' 
      });
    }

    const result = await opusService.processMessages(messages, existingTasks || []);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process messages',
      message: error.message 
    });
  }
});

/**
 * Validate job ID - must be a numeric string (Opus job IDs are numbers)
 */
const validateJobId = (jobId) => {
  if (!jobId || jobId === 'JOB_EXECUTION_ID' || isNaN(Number(jobId))) {
    return false;
  }
  return true;
};

/**
 * GET /api/opus/job/:jobId/status
 * Get job status
 */
router.get('/job/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!validateJobId(jobId)) {
      return res.status(400).json({
        error: 'Invalid job ID',
        message: 'Use a numeric job ID (e.g. 9761). Get it from process-pdf response or uploads/ filename.'
      });
    }
    const status = await opusService.getJobStatus(jobId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch job status',
      message: error.message 
    });
  }
});

/**
 * GET /api/opus/job/:jobId/results
 * Get job results
 */
router.get('/job/:jobId/results', async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!validateJobId(jobId)) {
      return res.status(400).json({
        error: 'Invalid job ID',
        message: 'Use a numeric job ID (e.g. 9761).'
      });
    }
    const results = await opusService.getJobResults(jobId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch job results',
      message: error.message 
    });
  }
});

/**
 * GET /api/opus/job/:jobId/audit
 * Get job audit log
 */
router.get('/job/:jobId/audit', async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!validateJobId(jobId)) {
      return res.status(400).json({
        error: 'Invalid job ID',
        message: 'Use a numeric job ID (e.g. 9761).'
      });
    }
    const audit = await opusService.getJobAuditLog(jobId);
    res.json(audit);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch job audit log',
      message: error.message 
    });
  }
});

export default router;
