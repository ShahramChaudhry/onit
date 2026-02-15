import express from 'express';

const router = express.Router();

// In-memory storage for demo purposes
let messagesStore = [];
let tasksStore = [];

/**
 * GET /api/messages
 * Get all messages
 */
router.get('/', (req, res) => {
  res.json({ messages: messagesStore });
});

/**
 * POST /api/messages
 * Add new messages (simulating Teams webhook)
 */
router.post('/', (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  
  const newMessages = messages.map(msg => ({
    id: Date.now() + Math.random(),
    ...msg,
    receivedAt: new Date().toISOString(),
    processed: false
  }));
  
  messagesStore.push(...newMessages);
  res.json({ 
    success: true, 
    messages: newMessages,
    count: newMessages.length
  });
});

/**
 * GET /api/messages/tasks
 * Get current tasks
 */
router.get('/tasks', (req, res) => {
  res.json({ tasks: tasksStore });
});

/**
 * POST /api/messages/tasks
 * Update tasks
 */
router.post('/tasks', (req, res) => {
  const { tasks } = req.body;
  
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'tasks array is required' });
  }
  
  tasksStore = tasks;
  res.json({ 
    success: true, 
    tasks: tasksStore,
    count: tasksStore.length
  });
});

/**
 * DELETE /api/messages/clear
 * Clear all messages and tasks (for testing)
 */
router.delete('/clear', (req, res) => {
  messagesStore = [];
  tasksStore = [];
  res.json({ 
    success: true, 
    message: 'All data cleared' 
  });
});

export default router;
