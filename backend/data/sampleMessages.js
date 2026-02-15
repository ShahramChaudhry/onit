/**
 * Sample Teams messages for testing
 */
export const sampleMessages = [
  {
    sender: 'Sarah Chen',
    senderEmail: 'sarah.chen@company.com',
    subject: 'Urgent: Q1 Report Deadline',
    content: 'Hi team, we need to submit the Q1 financial report by end of day Friday. Can someone take the lead on compiling the data from all departments?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    category: 'urgent',
    hasAttachment: false
  },
  {
    sender: 'Michael Torres',
    senderEmail: 'michael.torres@company.com',
    subject: 'Team Meeting Notes',
    content: 'Here are the notes from today\'s standup:\n- Sprint review scheduled for next Tuesday\n- Bob will present the new feature\n- Need volunteers for user testing next week',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    category: 'info',
    hasAttachment: true
  },
  {
    sender: 'Jessica Park',
    senderEmail: 'jessica.park@company.com',
    subject: 'Client Request - API Documentation',
    content: 'Our client from Acme Corp is asking for updated API documentation. They mentioned they need it before their integration sprint starts on Monday. Can we prioritize this?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    category: 'request',
    hasAttachment: false
  },
  {
    sender: 'David Kim',
    senderEmail: 'david.kim@company.com',
    subject: 'Bug Report: Login Issue',
    content: 'Multiple users are reporting that they can\'t log in after the latest deployment. Getting "500 Internal Server Error". This is blocking production work.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    category: 'urgent',
    hasAttachment: false
  },
  {
    sender: 'Emily Rodriguez',
    senderEmail: 'emily.rodriguez@company.com',
    subject: 'Lunch and Learn - Next Week',
    content: 'Hi everyone! I\'m organizing a lunch and learn session on microservices architecture next Thursday at 12pm. Pizza will be provided. Let me know if you\'re interested!',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    category: 'info',
    hasAttachment: false
  },
  {
    sender: 'Rachel Green',
    senderEmail: 'rachel.green@company.com',
    subject: 'Performance Review Schedule',
    content: 'Reminder that performance reviews are coming up next month. Please start preparing your self-assessments. The deadline for submission is March 15th.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    category: 'reminder',
    hasAttachment: false
  },
  {
    sender: 'Tom Wilson',
    senderEmail: 'tom.wilson@company.com',
    subject: 'Quick Question - Database Schema',
    content: 'Hey, quick question about the user table schema. Should the email field be unique? I\'m working on the registration flow and want to make sure I handle duplicates correctly.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    category: 'question',
    hasAttachment: false
  },
  {
    sender: 'Lisa Anderson',
    senderEmail: 'lisa.anderson@company.com',
    subject: 'Security Audit Findings',
    content: 'The security audit identified 3 critical vulnerabilities that need immediate attention:\n1. SQL injection risk in search functionality\n2. Exposed API keys in client-side code\n3. Missing rate limiting on auth endpoints\nWe need to address these ASAP.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    category: 'urgent',
    hasAttachment: true
  }
];

export const sampleExistingTasks = [
  {
    id: 1,
    title: 'Complete user authentication module',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-02-20',
    assignee: 'You'
  },
  {
    id: 2,
    title: 'Write unit tests for payment service',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-02-22',
    assignee: 'You'
  },
  {
    id: 3,
    title: 'Update project documentation',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-02-25',
    assignee: 'You'
  }
];
