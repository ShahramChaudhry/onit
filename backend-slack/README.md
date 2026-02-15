# Slack + Opus Task Extractor

**Production-ready backend service** that extracts actionable tasks from Slack messages using Opus AI workflows.

## 🎯 What It Does

1. **Connects to Slack** using official Slack APIs
2. **Reads messages** from public/private channels (with proper permissions)
3. **Filters intelligently** - removes bots, system messages, noise
4. **Resolves user IDs** to human-readable names (cached for performance)
5. **Processes with Opus AI** - sends to your Opus workflow
6. **Extracts tasks** with priorities, owners, deadlines
7. **Returns structured output** - ready for task managers

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Slack Channel  │
│  (Messages)     │
└────────┬────────┘
         │
         │ Slack Web API
         │ (conversations.history)
         ▼
┌─────────────────┐
│  SlackService   │
│  - Fetch msgs   │
│  - Resolve IDs  │
│  - Filter bots  │
└────────┬────────┘
         │
         │ Cleaned messages
         ▼
┌─────────────────┐
│  OpusService    │
│  - Format data  │
│  - Initiate job │
│  - Poll status  │
└────────┬────────┘
         │
         │ Opus Job Operator API
         │ (operator.opus.com)
         ▼
┌─────────────────┐
│  Opus Workflow  │
│  - AI Analysis  │
│  - Task Extract │
│  - Prioritize   │
└────────┬────────┘
         │
         │ Structured JSON
         ▼
┌─────────────────┐
│  Task List      │
│  - Title        │
│  - Owner        │
│  - Urgency      │
│  - Deadline     │
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Slack workspace admin access
- Opus account with API access

### 1. Install Dependencies

```bash
cd backend-slack
npm install
```

### 2. Configure Slack App

See [SLACK_SETUP.md](./SLACK_SETUP.md) for detailed Slack OAuth configuration.

**Quick version:**

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "Task Extractor Bot"
4. Add Bot Token Scopes:
   - `channels:history`
   - `groups:history`
   - `users:read`
   - `channels:read`
   - `groups:read`
5. Install app to workspace
6. Copy **Bot User OAuth Token** (starts with `xoxb-`)

### 3. Configure Opus Workflow

1. Log into [app.opus.com](https://app.opus.com)
2. Create workflow (see [OPUS_WORKFLOW.md](./OPUS_WORKFLOW.md))
3. Copy **Workflow ID** and **API Key**

### 4. Set Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

```env
SLACK_BOT_TOKEN=xoxb-your-token-here
OPUS_API_KEY=sk-your-key-here
OPUS_WORKFLOW_ID=wf-your-workflow-id-here
```

### 5. Run the Service

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server starts at: **http://localhost:3002**

---

## 📡 API Endpoints

### 1. Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "services": {
    "slack": "connected",
    "opus": "connected"
  },
  "timestamp": "2026-02-15T10:00:00.000Z"
}
```

### 2. List Channels

```bash
GET /api/channels
```

**Response:**
```json
{
  "channels": [
    {
      "id": "C12345678",
      "name": "general",
      "is_private": false,
      "is_member": true
    },
    {
      "id": "C87654321",
      "name": "dev-team",
      "is_private": true,
      "is_member": true
    }
  ]
}
```

### 3. Process Channel (Main Endpoint)

```bash
POST /api/process-channel
Content-Type: application/json

{
  "channelId": "C12345678",
  "oldest": "1708001234.567890",  // optional: Unix timestamp
  "latest": "1708012345.678901",  // optional: Unix timestamp
  "includeThreads": false         // optional: default false
}
```

**Response:**
```json
{
  "success": true,
  "channelId": "C12345678",
  "channelName": "general",
  "jobExecutionId": "job_abc123def456",
  "result": {
    "summary": "Extracted 5 actionable tasks from 42 messages",
    "tasks": [
      {
        "task": "Review pull request #234",
        "owner": "Alice Johnson",
        "urgency": "high",
        "deadline": "2026-02-15T17:00:00Z",
        "source_message_ts": "2026-02-15T09:15:30Z",
        "context": "Blocking release",
        "category": "urgent"
      },
      {
        "task": "Update API documentation",
        "owner": "Bob Smith",
        "urgency": "medium",
        "deadline": null,
        "source_message_ts": "2026-02-15T10:20:15Z",
        "context": "Client request",
        "category": "request"
      }
    ],
    "metadata": {
      "total_messages": 42,
      "messages_with_tasks": 5,
      "processing_time_ms": 8500,
      "channel_name": "general"
    }
  }
}
```

### 4. Check Job Status

```bash
GET /api/opus/job/:jobId/status
```

**Response:**
```json
{
  "status": "COMPLETED"
}
```

### 5. Get Job Results

```bash
GET /api/opus/job/:jobId/results
```

**Response:**
```json
{
  "jobExecutionId": "job_abc123",
  "status": "COMPLETED",
  "results": {
    "summary": "...",
    "data": { ... }
  }
}
```

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SLACK_BOT_TOKEN` | Yes | - | Bot token (xoxb-...) |
| `OPUS_API_KEY` | Yes | - | Opus API key |
| `OPUS_WORKFLOW_ID` | Yes | - | Workflow ID |
| `OPUS_API_BASE_URL` | No | `https://operator.opus.com` | Opus API base |
| `PORT` | No | `3002` | Server port |
| `SLACK_RATE_LIMIT_DELAY_MS` | No | `1000` | Delay between API calls |
| `MAX_MESSAGES_PER_CHANNEL` | No | `200` | Max messages to fetch |

### Slack Message Filtering

The service automatically filters out:

- ✅ **Bot messages** - Messages with `bot_id` present
- ✅ **System events** - `channel_join`, `channel_leave`, etc.
- ✅ **Empty messages** - Messages without text
- ✅ **Reactions-only** - Events that are just reactions

### User ID Resolution

- **Caching**: User IDs are cached after first lookup
- **Fallback**: If resolution fails, uses `User-<id>` format
- **Performance**: Minimizes API calls

### Rate Limiting

- **Delay**: 1 second between requests (configurable)
- **Pagination**: Handles Slack's cursor-based pagination
- **Error Handling**: Retries with exponential backoff

---

## 📚 Additional Documentation

- **[SLACK_SETUP.md](./SLACK_SETUP.md)** - Detailed Slack OAuth setup
- **[OPUS_WORKFLOW.md](./OPUS_WORKFLOW.md)** - Opus workflow configuration
- **[EXAMPLES.md](./EXAMPLES.md)** - Usage examples and recipes
- **[API.md](./API.md)** - Complete API reference

---

## 🧪 Testing

### Manual Test

```bash
# 1. Check health
curl http://localhost:3002/health

# 2. List channels
curl http://localhost:3002/api/channels

# 3. Process a channel
curl -X POST http://localhost:3002/api/process-channel \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "C12345678"
  }'
```

### Test with Real Slack Channel

1. Create a test channel in Slack
2. Invite your bot: `/invite @Task Extractor Bot`
3. Post some test messages
4. Call the API with the channel ID

---

## 🐛 Troubleshooting

### "not_in_channel" error

**Problem**: Bot hasn't been invited to the channel

**Solution**: In Slack, type `/invite @Task Extractor Bot` in the channel

### "invalid_auth" error

**Problem**: Bot token is invalid or expired

**Solution**: 
1. Go to https://api.slack.com/apps
2. Select your app → OAuth & Permissions
3. Reinstall app to workspace
4. Copy new token

### "rate_limited" error

**Problem**: Too many API requests

**Solution**: Increase `SLACK_RATE_LIMIT_DELAY_MS` in `.env`

### Opus job fails

**Problem**: Workflow not configured correctly

**Solution**:
1. Test workflow in Opus dashboard first
2. Verify input schema matches
3. Check Opus logs for errors

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Rotate tokens** - Update bot token periodically
3. **Use OAuth scopes minimally** - Only request needed permissions
4. **Validate input** - Always validate channel IDs
5. **Rate limiting** - Respect API limits
6. **Error messages** - Don't expose sensitive data in errors

---

## 📊 Performance

- **Message fetching**: ~200 messages/minute (with rate limiting)
- **User ID caching**: ~100x faster on subsequent lookups
- **Opus processing**: ~5-10 seconds per job
- **Memory usage**: ~50MB baseline

---

## 🚀 Production Deployment

### Docker (Recommended)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

### Environment Variables

Use secrets management:
- AWS Secrets Manager
- Kubernetes Secrets
- Environment variables from platform

### Monitoring

Add logging and monitoring:
- Application logs → CloudWatch / Datadog
- Error tracking → Sentry
- Performance → New Relic

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) file

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and improve!

---

## 🏆 Built For

**NYUAD x AppliedAI Hackathon 2026**

Using Opus (Applied AI) workflow platform for intelligent task extraction.

---

**Questions?** Check the documentation files or create an issue!
