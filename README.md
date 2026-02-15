# Teams Task Manager - NYUAD x AppliedAI Hackathon 2026

![Teams Task Manager](https://img.shields.io/badge/Status-Active-success)
![Hackathon](https://img.shields.io/badge/Hackathon-NYUAD%202026-purple)
![Opus](https://img.shields.io/badge/Powered%20by-Opus%20AI-blue)

An AI-powered Microsoft Teams add-on that intelligently processes incoming messages, generates daily task lists, suggests replies, and dynamically reprioritizes tasks using the Opus workflow engine.

## 🎯 Project Overview

This project demonstrates the **"Intake → Process → Decide → Deliver"** workflow pattern required by the NYUAD x AppliedAI Hackathon challenge:

1. **Intake**: Receives messages from Microsoft Teams
2. **Process**: AI analyzes messages to extract actionable tasks and context
3. **Decide**: Routes based on urgency, categorizes by type, prioritizes tasks
4. **Review**: Optional human review for high-stakes decisions
5. **Deliver**: Outputs organized task list + suggested message replies

## ✨ Features

- 📧 **Message Processing**: Automatically analyze Teams messages
- ✅ **Task Extraction**: AI identifies actionable items from conversations
- 🎯 **Smart Prioritization**: Categorizes by urgency (high/medium/low)
- 💬 **Reply Suggestions**: Generate context-aware response drafts
- 🔄 **Dynamic Reprioritization**: Adjusts task priority based on new messages
- 📊 **Real-time Dashboard**: Clean UI showing messages, tasks, and insights
- 🚀 **Opus API Integration**: Full Job Operator API workflow

## 🏗️ Architecture

```
┌─────────────────────┐
│  Frontend (React)   │
│  - Dashboard UI     │
│  - Message Display  │
│  - Task Management  │
└──────────┬──────────┘
           │
           │ HTTP/REST
           │
┌──────────▼──────────┐
│  Backend (Node.js)  │
│  - Express Server   │
│  - API Routes       │
└──────────┬──────────┘
           │
           │ Opus Job Operator API
           │
┌──────────▼──────────┐
│   Opus Platform     │
│  - AI Workflows     │
│  - Agent Nodes      │
│  - Decision Logic   │
└─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Opus account with API access
- Workflow ID from Opus platform

### 1. Clone and Install

```bash
# Clone the repository
cd onit

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
OPUS_API_KEY=your_opus_service_key_here
OPUS_WORKFLOW_ID=your_workflow_id_here
OPUS_API_BASE_URL=https://operator.opus.com
PORT=3001
```

### 3. Run the Application

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📖 Usage Guide

### Step 1: Add Messages
Click **"Add Sample Messages"** to load demo Teams messages, or integrate with actual Teams webhooks.

### Step 2: Process with Opus
Click **"Process with Opus AI"** to send messages through the workflow:
- Job is initiated
- Messages are analyzed
- AI extracts tasks and priorities
- Results are returned

### Step 3: View Results
The dashboard displays:
- Processed messages with categories
- Extracted tasks with priorities
- Job status and execution details
- AI-generated insights

## 🔧 API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/messages` | Get all messages |
| POST | `/api/messages` | Add new messages |
| GET | `/api/messages/tasks` | Get current tasks |
| POST | `/api/messages/tasks` | Update tasks |
| DELETE | `/api/messages/clear` | Clear all data |
| GET | `/api/opus/workflow` | Get Opus workflow schema |
| POST | `/api/opus/process` | Process messages via Opus |
| GET | `/api/opus/job/:jobId/status` | Check job status |
| GET | `/api/opus/job/:jobId/results` | Get job results |

## 🎨 Opus Workflow Design

### Workflow Prompt (for Opus Platform)

```
Create a workflow that:
1. Accepts a batch of Teams messages as text input
2. Analyzes each message for:
   - Action items and tasks
   - Urgency level (urgent, normal, low priority)
   - Message category (request, question, info, urgent, reminder)
   - Required response type
3. Extracts structured data:
   - Task title
   - Task description
   - Priority (high/medium/low)
   - Due date (if mentioned)
   - Suggested reply for each message
4. Compares with existing tasks to identify:
   - Duplicate tasks
   - Tasks needing reprioritization
   - Related tasks that should be grouped
5. Outputs JSON with:
   - Array of extracted tasks
   - Array of suggested replies
   - Priority recommendations
   - Summary insights
```

### Workflow Nodes (Suggested)

1. **Input Node**: `messages_input` (string), `existing_tasks` (string)
2. **AI Agent Node**: "Message Analyzer" - Extracts tasks and categories
3. **AI Agent Node**: "Priority Assessor" - Determines urgency
4. **AI Agent Node**: "Reply Generator" - Creates suggested responses
5. **Decision Node**: Routes high-priority items for review
6. **Human Review Node** (Optional): For critical tasks
7. **Output Node**: Structured JSON with tasks and replies

## 📦 Project Structure

```
onit/
├── backend/
│   ├── server.js              # Express server
│   ├── services/
│   │   └── opusService.js     # Opus API integration
│   ├── routes/
│   │   ├── opus.js            # Opus endpoints
│   │   └── messages.js        # Message endpoints
│   └── data/
│       └── sampleMessages.js  # Demo data
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── ProcessingPanel.jsx
│   │   └── [CSS files]
│   ├── package.json
│   └── vite.config.js
├── package.json
├── .env.example
└── README.md
```

## 🧪 Testing

### Sample Test Flow

1. Start the application
2. Click "Add Sample Messages" - adds 8 demo messages
3. Observe message categories (urgent, info, request, etc.)
4. Click "Process with Opus AI"
5. Monitor job status panel
6. Review extracted tasks and priorities
7. Check suggested replies in results

### Manual API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Add messages
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"sender": "Test", "content": "Need help with API"}]}'

# Process with Opus
curl -X POST http://localhost:3001/api/opus/process \
  -H "Content-Type: application/json" \
  -d '{"messages": [...], "existingTasks": [...]}'
```

## 🎯 Hackathon Criteria Checklist

- ✅ **Data Intake**: Teams messages via API
- ✅ **AI Processing**: Opus Agent analyzes and categorizes
- ✅ **Decision Logic**: Priority routing and categorization
- ✅ **Review Integration**: Human review checkpoint (configurable in Opus)
- ✅ **Output Delivery**: Structured task list + reply suggestions
- ✅ **API Integration**: Full Opus Job Operator API implementation
- ✅ **Frontend Dashboard**: Clean, functional UI
- ✅ **Sample Data**: 8+ realistic test messages included

## 🚧 Future Enhancements

- [ ] Real Microsoft Teams API integration via webhooks
- [ ] User authentication and multi-user support
- [ ] Task completion tracking and analytics
- [ ] Email notification for urgent items
- [ ] Calendar integration for due dates
- [ ] Mobile-responsive design improvements
- [ ] Export tasks to external project management tools

## 📝 Hackathon Submission

### Demo Video Script

1. **Introduction** (30s)
   - Show dashboard overview
   - Explain the use case

2. **Add Messages** (30s)
   - Click "Add Sample Messages"
   - Show different message types

3. **Process with Opus** (60s)
   - Click "Process with Opus AI"
   - Show job status updates
   - Reveal results panel

4. **Show Results** (30s)
   - Highlight extracted tasks
   - Show priority levels
   - Display AI insights

**Total: 2-3 minutes**

## 🤝 Team

Created for the NYUAD x AppliedAI Hackathon 2026

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Opus Platform](https://opus.com) - AI workflow engine
- [AppliedAI](https://appliedai.com) - Hackathon organizers
- NYUAD - Host institution

---

**Built with ❤️ for the NYUAD x AppliedAI Hackathon 2026**
