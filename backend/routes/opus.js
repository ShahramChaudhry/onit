import express from 'express';
import opusService from '../services/opusService.js';

const router = express.Router();

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
 * GET /api/opus/job/:jobId/status
 * Get job status
 */
router.get('/job/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
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
