# Opus Workflow Configuration for Slack

Guide to creating an Opus workflow that processes Slack messages and extracts tasks.

---

## 🎯 Workflow Purpose

Transform Slack channel conversations into structured, prioritized task lists using AI.

**Input**: Raw Slack messages with timestamps, senders, and content  
**Output**: Structured JSON with tasks, owners, urgencies, and deadlines

---

## 🚀 Quick Setup

### Step 1: Create Workflow in Opus

1. Go to https://app.opus.com
2. Click **"Create Workflow"**
3. Choose **"Start from Prompt"**
4. Copy and paste the prompt below

---

## 📝 Opus Workflow Prompt

```
Create an AI workflow that extracts actionable tasks from Slack messages.

INPUTS:
1. messages_input (string): Slack messages formatted as:
   Message 1:
   From: Alice Johnson
   Time: 2026-02-15T09:00:00Z
   Content: Please review the PR before noon
   ---
   
2. existing_tasks (string): Current tasks (optional)

3. processing_instructions (string): Guidelines for task extraction

PROCESSING STEPS:
1. Parse each Slack message
2. Identify actionable items (ignore casual chat)
3. Extract task details:
   - Task description (clear, concise)
   - Owner (from mentions, context, or "Unassigned")
   - Urgency level (high/medium/low)
   - Deadline (if mentioned)
   - Source message timestamp
   - Category (urgent/request/question/info/reminder)

4. Apply urgency rules:
   HIGH: 
   - Deadlines today or very soon
   - Words: "urgent", "ASAP", "critical", "blocker"
   - Emojis: ⚠️ 🔥 ⏰ 🚨
   - Production issues, security, approvals
   
   MEDIUM:
   - Important but flexible timing
   - Team coordination needed
   - Documentation requests
   - Code reviews (non-blocking)
   
   LOW:
   - Future ideas, suggestions
   - Optional improvements
   - FYI items, announcements

5. Infer ownership from:
   - Direct @mentions
   - "I'll handle this" statements
   - Previous task assignments
   - Context clues
   - Mark as "Unassigned" if unclear

6. Group related tasks together

OUTPUT FORMAT (STRICT JSON):
{
  "summary": "Brief summary of work discussed",
  "tasks": [
    {
      "task": "Clear, actionable task description",
      "owner": "Person Name or Unassigned",
      "urgency": "high|medium|low",
      "deadline": "2026-02-15T12:00:00Z or null",
      "source_message_ts": "2026-02-15T09:15:30Z",
      "context": "Additional context",
      "category": "urgent|request|question|info|reminder"
    }
  ],
  "reprioritization_recommendations": [
    {
      "task_id": "existing task identifier",
      "current_priority": "medium",
      "recommended_priority": "high",
      "reason": "New blocker discovered"
    }
  ]
}

GUIDELINES:
- Extract ONLY real, actionable tasks
- Ignore: greetings, reactions, emoji-only, "thanks", "ok", casual chat
- Be conservative: if unclear, don't create a task
- Preserve context and urgency from messages
- Use professional language in task descriptions
- Default to "Unassigned" rather than guessing owner

AI MODEL:
Use Claude 3 Opus, GPT-4 Turbo, or equivalent for best results.
```

---

## 🎨 Step 2: Refine in Visual Builder

After Opus generates the workflow:

### Input Nodes

Ensure three text input nodes exist:

1. **messages_input**
   - Type: `str` (string)
   - Display Name: "Slack Messages"
   - Required: Yes

2. **existing_tasks**
   - Type: `str` (string)
   - Display Name: "Existing Tasks"
   - Required: No (can be empty)

3. **processing_instructions**
   - Type: `str` (string)
   - Display Name: "Processing Instructions"
   - Required: Yes

### AI Agent Node

- **Model**: Claude 3 Opus or GPT-4 Turbo
- **System Prompt**: Include task extraction guidelines
- **Temperature**: 0.3 (for consistent results)
- **Max Tokens**: 4096
- **Output Format**: JSON

### Decision Node (Optional)

Add routing logic:

- **Condition**: Count of high-urgency tasks > 3
- **Route A (True)**: Send to Human Review
- **Route B (False)**: Auto-approve

### Output Node

- **Format**: JSON
- **Schema**: Match the output structure above

---

## 🧪 Step 3: Test the Workflow

### Test Input 1: Single Urgent Task

**messages_input**:
```
Message 1:
From: Alice Chen
Time: 2026-02-15T09:00:00Z
Content: @Bob urgent - production is down! Need the fix deployed ASAP 🔥
---
```

**Expected Output**:
```json
{
  "summary": "Production outage requires immediate fix",
  "tasks": [
    {
      "task": "Deploy production fix for outage",
      "owner": "Bob",
      "urgency": "high",
      "deadline": null,
      "source_message_ts": "2026-02-15T09:00:00Z",
      "context": "Production is down",
      "category": "urgent"
    }
  ]
}
```

### Test Input 2: Multiple Tasks

**messages_input**:
```
Message 1:
From: David Kim
Time: 2026-02-15T10:00:00Z
Content: Can someone update the API docs? Client needs them by Friday.
---

Message 2:
From: Sarah Lee
Time: 2026-02-15T10:15:00Z
Content: I'll take the docs. Also need to review those PRs this week.
---

Message 3:
From: Mike Torres
Time: 2026-02-15T10:30:00Z
Content: Reminder: team standup tomorrow at 10am
---
```

**Expected Output**:
```json
{
  "summary": "Documentation update requested for Friday, PR reviews planned",
  "tasks": [
    {
      "task": "Update API documentation",
      "owner": "Sarah Lee",
      "urgency": "high",
      "deadline": "2026-02-19T23:59:59Z",
      "source_message_ts": "2026-02-15T10:00:00Z",
      "context": "Client needs by Friday",
      "category": "request"
    },
    {
      "task": "Review pull requests",
      "owner": "Sarah Lee",
      "urgency": "medium",
      "deadline": null,
      "source_message_ts": "2026-02-15T10:15:00Z",
      "context": "This week",
      "category": "info"
    }
  ]
}
```

---

## 📊 Step 4: Publish Workflow

1. Click **"Test Run"** - verify output is correct
2. Click **"Publish"**
3. Copy **Workflow ID** (format: `wf_xxxxxxxxxxxxx`)
4. Go to **Settings** → **API Keys**
5. Create new API key: "Slack Task Extractor"
6. Copy **API Key** (format: `sk_xxxxxxxxxxxxx`)

Update your `.env`:
```env
OPUS_WORKFLOW_ID=wf_your_workflow_id_here
OPUS_API_KEY=sk_your_api_key_here
```

---

## 🎯 Advanced Features

### Feature 1: Context Awareness

Add a fourth input for channel context:

```
channel_context (string): Information about the channel
Example: "This is #dev-team - technical discussions and sprint planning"
```

This helps the AI understand priorities better.

### Feature 2: Custom Priority Rules

Add organization-specific rules:

```
priority_rules (string): 
"Security issues: always high
Documentation: medium unless client-requested
Tests: low unless blocking release"
```

### Feature 3: Team Knowledge

Include team member info:

```
team_info (string):
"Alice: Security lead
Bob: Backend engineer
Carol: Frontend specialist"
```

Improves owner assignment accuracy.

---

## 🐛 Troubleshooting

### Issue: Tasks not extracted

**Problem**: AI is too conservative

**Fix**: Update prompt:
```
Be more liberal in task extraction. Include:
- Questions that need answers
- Requests for review
- Mentioned action items
```

### Issue: Wrong urgency levels

**Problem**: AI doesn't understand context

**Fix**: Add more examples in prompt:
```
Examples of HIGH urgency:
- "deploy this now"
- "prod is broken"
- "client needs by EOD"

Examples of MEDIUM:
- "when you get a chance"
- "this week"
- "no rush but important"
```

### Issue: Owner always "Unassigned"

**Problem**: AI can't infer from context

**Fix**: Add owner hints:
```
Look for patterns:
- @mentions
- "I'll do this"
- "Can [name] handle?"
- Previous similar tasks
```

### Issue: Too many non-actionable tasks

**Problem**: AI extracts everything

**Fix**: Add exclusion rules:
```
DO NOT extract:
- Greetings ("hi", "thanks")
- Reactions ("👍", "lol")
- Questions without action ("how's it going?")
- FYIs unless critical
```

---

## 📈 Optimization Tips

### 1. Improve Accuracy

- Test with real messages from your team
- Adjust prompts based on results
- Add team-specific examples
- Use feedback loop

### 2. Reduce Costs

- Use `claude-3-sonnet` instead of Opus for simpler channels
- Batch messages (process 100 at a time)
- Cache common patterns

### 3. Speed Up Processing

- Use faster models for low-priority channels
- Parallel processing for multiple channels
- Reduce max tokens if output is simple

---

## 🎨 Workflow Variations

### Variation 1: Quick Triage

For high-volume channels, create a two-stage workflow:

**Stage 1**: Fast filter (Sonnet)
- Extract only high-urgency items
- Pass low/medium to Stage 2

**Stage 2**: Detailed analysis (Opus)
- Full task extraction
- Context analysis
- Ownership inference

### Variation 2: Automated Responses

Add output node that:
- Generates Slack reply
- Posts confirmation
- Creates calendar events

### Variation 3: Integration

Connect to external tools:
- Jira: Create tickets
- Asana: Add tasks
- Google Calendar: Schedule
- Email: Send digests

---

## 📚 Resources

- [Opus Documentation](https://developer.opus.com)
- [Opus Workflow Examples](https://help.opus.com)
- [API Reference](https://developer.opus.com/api-reference)
- [Community Forums](https://community.opus.com)

---

## ✅ Workflow Checklist

Before going live:

- [ ] Workflow tested with real data
- [ ] Output format matches expected JSON
- [ ] Edge cases handled (empty, noise)
- [ ] Error handling configured
- [ ] Human review optional but available
- [ ] Workflow published (not draft)
- [ ] API key secured in `.env`
- [ ] Monitoring set up
- [ ] Team trained on outputs

---

## 🎉 You're Ready!

Once your workflow is published:

```bash
# Test the connection
curl http://localhost:3002/health

# Process a channel
curl -X POST http://localhost:3002/api/process-channel \
  -H "Content-Type: application/json" \
  -d '{"channelId": "C12345678"}'
```

The service will automatically:
1. Fetch Slack messages
2. Format for your workflow
3. Submit to Opus
4. Poll for results
5. Return structured tasks

**Happy task extracting!** 🚀
