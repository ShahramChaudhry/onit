# Opus Workflow Configuration Guide

This guide helps you set up the Opus workflow for the Teams Task Manager application.

## 📋 Workflow Overview

The workflow processes Teams messages and generates:
1. Extracted actionable tasks with priorities
2. Message categorization (urgent, request, info, etc.)
3. Suggested replies for each message
4. Task reprioritization recommendations

## 🎯 Step-by-Step Setup

### 1. Create Workflow in Opus Platform

1. Log into [Opus Platform](https://app.opus.com)
2. Click **"Create Workflow"**
3. Choose **"Start from Prompt"**

### 2. Use This Prompt

```
Create an AI workflow that processes Microsoft Teams messages for intelligent task management:

INPUTS:
- messages_input (string): A text block containing multiple Teams messages with sender, subject, content, and timestamp
- existing_tasks (string): Current task list with titles, priorities, and statuses
- processing_instructions (string): Guidelines for processing

PROCESSING:
1. Parse and analyze each message
2. Extract actionable tasks from message content
3. Categorize messages by type: urgent, request, question, info, reminder
4. Assign priority levels: high (urgent/deadline-driven), medium (important but not urgent), low (informational)
5. Generate suggested reply for each message
6. Compare with existing tasks to identify:
   - Duplicates
   - Related tasks
   - Tasks needing priority adjustment

OUTPUTS:
Return structured JSON with:
{
  "extracted_tasks": [
    {
      "title": "Task description",
      "description": "Full context",
      "priority": "high|medium|low",
      "source_message": "Which message it came from",
      "suggested_due_date": "If mentioned",
      "category": "Message category"
    }
  ],
  "suggested_replies": [
    {
      "message_from": "Sender name",
      "message_subject": "Subject",
      "suggested_reply": "AI-generated reply text",
      "reply_tone": "professional|casual|urgent"
    }
  ],
  "reprioritization_recommendations": [
    {
      "task_id": "Existing task identifier",
      "current_priority": "Current level",
      "recommended_priority": "New level",
      "reason": "Why priority should change"
    }
  ],
  "summary": {
    "total_messages": 0,
    "urgent_count": 0,
    "tasks_extracted": 0,
    "key_insights": "Overall analysis"
  }
}

Use Claude or GPT-4 for analysis. Apply professional judgment for priority assessment. Consider context, deadlines, sender authority, and business impact.
```

### 3. Refine the Workflow

After Opus generates the initial workflow:

1. **Verify Input Nodes**:
   - Ensure three text inputs exist:
     - `messages_input`
     - `existing_tasks`
     - `processing_instructions`

2. **Check AI Agent Node**:
   - Should use Claude 3 Opus or GPT-4
   - System prompt should include task extraction logic
   - Output should be structured JSON

3. **Add Decision Node** (Optional):
   - Route messages with >3 urgent items to human review
   - Auto-approve normal processing

4. **Configure Output Node**:
   - Format: JSON
   - Include all fields from the structure above

### 4. Test the Workflow

1. Click **"Preview"** in Opus
2. Use this test input:

**messages_input**:
```
Message 1:
From: Sarah Chen
Subject: Urgent: Q1 Report Deadline
Content: Hi team, we need to submit the Q1 financial report by end of day Friday. Can someone take the lead on compiling the data from all departments?
Timestamp: 2026-02-15T09:00:00Z
---

Message 2:
From: Michael Torres
Subject: Bug Report: Login Issue
Content: Multiple users are reporting that they can't log in after the latest deployment. Getting "500 Internal Server Error". This is blocking production work.
Timestamp: 2026-02-15T11:30:00Z
---

Message 3:
From: Jessica Park
Subject: Lunch and Learn - Next Week
Content: Hi everyone! I'm organizing a lunch and learn session on microservices architecture next Thursday at 12pm. Pizza will be provided.
Timestamp: 2026-02-15T10:00:00Z
```

**existing_tasks**:
```
Task 1: Complete user authentication module (Priority: high, Status: in-progress)
Task 2: Write unit tests for payment service (Priority: medium, Status: pending)
Task 3: Update project documentation (Priority: low, Status: pending)
```

**processing_instructions**:
```
Analyze the messages and:
1. Extract actionable tasks
2. Generate suggested replies for each message
3. Prioritize tasks based on urgency and importance
4. Identify tasks that need reprioritization
5. Categorize messages by type
```

3. Click **"Run"**
4. Verify output matches expected JSON structure
5. Adjust prompts if needed

### 5. Get Your Workflow ID

1. After testing successfully, click **"Publish"**
2. Go to **Workflow Settings**
3. Copy the **Workflow ID** (format: `wf_xxxxxxxxxxxxx`)
4. Paste it into your `.env` file:
   ```
   OPUS_WORKFLOW_ID=wf_xxxxxxxxxxxxx
   ```

### 6. Get Your API Key

1. Go to **Settings → API Keys**
2. Click **"Create Service Key"**
3. Name it: "Teams Task Manager"
4. Copy the key
5. Paste it into your `.env` file:
   ```
   OPUS_API_KEY=sk_xxxxxxxxxxxxx
   ```

## 🔧 Workflow Node Configuration

### Recommended Node Structure

```
┌─────────────────┐
│  Input Nodes    │
│  - messages     │
│  - tasks        │
│  - instructions │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Agent Node  │
│  "Message       │
│   Analyzer"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Decision Node   │
│ (Urgent check)  │
└────┬───────┬────┘
     │       │
     │       └──────────┐
     ▼                  ▼
┌──────────┐    ┌──────────────┐
│  Output  │    │ Human Review │
└──────────┘    └──────────────┘
```

### AI Agent Configuration

**Model**: Claude 3 Opus or GPT-4 Turbo

**System Prompt**:
```
You are an intelligent task extraction and message analysis system. 

Your role is to:
1. Read Teams messages carefully
2. Extract actionable tasks with clear titles
3. Assign realistic priorities based on:
   - Explicit urgency markers ("urgent", "ASAP", "blocking")
   - Deadlines mentioned
   - Business impact
   - Sender's tone
4. Generate helpful, professional reply suggestions
5. Identify which existing tasks should be reprioritized

Be concise but thorough. Use professional judgment. Output valid JSON only.
```

**Input Variables**:
- `{messages_input}`
- `{existing_tasks}`
- `{processing_instructions}`

**Output Format**: JSON

### Decision Node Configuration

**Condition**: Check if urgent_count > 2

**Routes**:
- **True** → Human Review Node
- **False** → Output Node

## 📊 Expected Output Structure

Your workflow should return JSON like this:

```json
{
  "extracted_tasks": [
    {
      "title": "Submit Q1 financial report",
      "description": "Compile data from all departments for Q1 report",
      "priority": "high",
      "source_message": "Sarah Chen - Urgent: Q1 Report Deadline",
      "suggested_due_date": "2026-02-19",
      "category": "urgent"
    },
    {
      "title": "Fix login authentication bug",
      "description": "Investigate and resolve 500 error on login after deployment",
      "priority": "high",
      "source_message": "Michael Torres - Bug Report",
      "category": "urgent"
    },
    {
      "title": "RSVP to lunch and learn session",
      "description": "Respond to microservices architecture session invitation",
      "priority": "low",
      "source_message": "Jessica Park - Lunch and Learn",
      "suggested_due_date": "2026-02-20",
      "category": "info"
    }
  ],
  "suggested_replies": [
    {
      "message_from": "Sarah Chen",
      "message_subject": "Urgent: Q1 Report Deadline",
      "suggested_reply": "Hi Sarah, I can take the lead on compiling the Q1 report. I'll reach out to department heads today and have a draft ready by Thursday for review. Does that timeline work?",
      "reply_tone": "professional"
    }
  ],
  "reprioritization_recommendations": [
    {
      "task_id": "2",
      "current_priority": "medium",
      "recommended_priority": "low",
      "reason": "Login bug takes precedence; unit tests can be delayed"
    }
  ],
  "summary": {
    "total_messages": 3,
    "urgent_count": 2,
    "tasks_extracted": 3,
    "key_insights": "Two high-priority items require immediate attention: Q1 report deadline and login bug. One low-priority informational item."
  }
}
```

## 🐛 Troubleshooting

### Issue: Workflow doesn't extract tasks

**Solution**: Refine the AI agent prompt to be more explicit:
```
For each message, identify if there is an action item. 
Action items include: requests, questions needing response, 
deadlines, bugs to fix, documents to create.
```

### Issue: Priorities seem random

**Solution**: Add priority criteria to the prompt:
```
HIGH priority: Explicit urgency, tight deadlines, blocking issues
MEDIUM priority: Important but not time-sensitive, team coordination
LOW priority: Informational, optional attendance, documentation
```

### Issue: JSON parsing errors

**Solution**: Add to agent prompt:
```
CRITICAL: Output valid JSON only. No markdown, no explanations.
Start with { and end with }. Escape all quotes in strings.
```

## ✅ Verification Checklist

Before connecting to your app:

- [ ] Workflow has correct input nodes
- [ ] AI agent produces valid JSON
- [ ] Test run completes successfully
- [ ] Output structure matches expected format
- [ ] Workflow ID copied to `.env`
- [ ] API key copied to `.env`
- [ ] Workflow is published (not draft)

## 🔗 Additional Resources

- [Opus Documentation](https://developer.opus.com)
- [Opus Workflow Examples](https://help.opus.com)
- [Job Operator API Reference](https://developer.opus.com/api-reference)

---

Once your workflow is configured and tested, run `npm run dev` to start the application!
