# Getting Started with Teams Task Manager

Welcome! This guide will get you up and running in 30 minutes.

## 📚 What You're Building

A Microsoft Teams add-on that uses AI to:
- 📧 Process incoming messages
- ✅ Extract actionable tasks
- 🎯 Assign smart priorities
- 💬 Generate reply suggestions
- 🔄 Dynamically reprioritize work

Perfect for the NYUAD x AppliedAI Hackathon!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies (5 min)

```bash
# Make sure you're in the project directory
cd onit

# Install everything
npm install
cd frontend && npm install && cd ..
```

**✅ Success**: No errors, both `node_modules` folders created

---

### Step 2: Configure Opus (15 min)

#### 2.1 Create Your Opus Workflow

1. Go to [https://app.opus.com](https://app.opus.com)
2. Click **"Create Workflow"** → **"Start from Prompt"**
3. Copy this prompt:

```
Create an AI workflow that processes Microsoft Teams messages for intelligent task management:

INPUTS:
- messages_input (string): Teams messages with sender, subject, content, timestamp
- existing_tasks (string): Current task list with titles, priorities, statuses
- processing_instructions (string): Guidelines for processing

PROCESSING:
1. Parse and analyze each message
2. Extract actionable tasks from message content
3. Categorize messages: urgent, request, question, info, reminder
4. Assign priorities: high (urgent/deadline), medium (important), low (informational)
5. Generate suggested reply for each message
6. Compare with existing tasks to identify duplicates and reprioritization needs

OUTPUT:
Return JSON with:
- extracted_tasks: [{title, description, priority, source_message, category}]
- suggested_replies: [{message_from, suggested_reply, reply_tone}]
- reprioritization_recommendations: [{task_id, reason}]
- summary: {total_messages, urgent_count, tasks_extracted, key_insights}

Use Claude 3 Opus or GPT-4. Apply professional judgment for priorities.
```

4. Click **"Generate Workflow"**
5. Test with sample data (see `OPUS_WORKFLOW_GUIDE.md`)
6. Click **"Publish"**

#### 2.2 Get Your Credentials

1. Copy **Workflow ID** from settings (format: `wf_xxxxx`)
2. Go to **Settings** → **API Keys**
3. Create new key: "Teams Task Manager"
4. Copy the **API Key** (format: `sk_xxxxx`)

#### 2.3 Configure Your Environment

```bash
# Copy the template
cp .env.example .env

# Edit .env and paste your credentials
# Use nano, vim, or any text editor
nano .env
```

Your `.env` should look like:
```env
OPUS_API_KEY=sk_your_actual_key_here
OPUS_WORKFLOW_ID=wf_your_actual_workflow_id_here
OPUS_API_BASE_URL=https://operator.opus.com
PORT=3001
```

**Save and close** (Ctrl+X, then Y, then Enter in nano)

---

### Step 3: Launch the App (2 min)

#### Option A: One-Command Start
```bash
./start.sh
```

#### Option B: Manual Start (If Option A doesn't work)

**Terminal 1** - Backend:
```bash
npm run dev:backend
```

Wait for: `🚀 Server running on http://localhost:3001`

**Terminal 2** - Frontend:
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:3000`

---

## 🎯 Using the Application

### 1. Open the Dashboard

Navigate to: **http://localhost:3000**

You should see:
- Header: "Teams Task Manager"
- Stats: 0 messages, 0 tasks
- Empty message and task panels

### 2. Add Sample Messages

Click the **"Add Sample Messages"** button

You'll see:
- 8 sample Teams messages appear
- Stats update to show message count
- Messages categorized by urgency
- Timestamps showing "X hours ago"

### 3. Process with Opus AI

Click the **"Process with Opus AI"** button

Watch:
- Processing panel appears
- Status: "INITIATING" → "IN PROGRESS" → "COMPLETED"
- Job execution ID displayed
- Results JSON appears

### 4. Review Results

The results will show:
- **Extracted Tasks**: Tasks pulled from messages
- **Priorities**: High/Medium/Low classifications
- **Suggested Replies**: AI-generated responses
- **Insights**: Summary of findings

---

## 📊 Understanding the Results

### Extracted Tasks Structure
```json
{
  "title": "Submit Q1 financial report",
  "description": "Compile data from all departments",
  "priority": "high",
  "source_message": "Sarah Chen - Urgent: Q1 Report",
  "category": "urgent"
}
```

### Priority Levels
- 🔴 **High**: Urgent issues, tight deadlines, blocking problems
- 🟡 **Medium**: Important but not urgent, team coordination
- 🔵 **Low**: Informational, optional items, documentation

---

## 🧪 Testing the Complete Flow

### Test Checklist

1. **Health Check**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Add Messages**
   - Click "Add Sample Messages"
   - Verify messages appear in left panel
   - Check stats update

3. **Process Messages**
   - Click "Process with Opus AI"
   - Watch processing panel
   - Wait for completion (~30 seconds)

4. **Verify Results**
   - Check results JSON
   - Verify tasks were extracted
   - Confirm priorities assigned
   - Review suggested replies

5. **Clear and Repeat**
   - Click "Clear All"
   - Try again with different messages

---

## 📁 Project Files Overview

### Essential Files
- `README.md` - Main documentation
- `OPUS_WORKFLOW_GUIDE.md` - Opus setup instructions
- `SETUP_CHECKLIST.md` - Step-by-step setup
- `DEMO_GUIDE.md` - Presentation script
- `.env` - Your credentials (DO NOT COMMIT!)

### Code Structure
```
backend/
  server.js           - Express server
  services/
    opusService.js    - Opus API client
  routes/
    opus.js           - Opus endpoints
    messages.js       - Message management

frontend/
  src/
    App.jsx           - Main app
    components/       - UI components
```

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
cd frontend && npm install && cd ..
```

### "Port already in use"
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env to 3002
```

### "Opus authentication failed"
- Verify API key in `.env` (no extra spaces)
- Check workflow is published (not draft)
- Ensure API key is active in Opus dashboard

### "Job execution failed"
- Test workflow directly in Opus platform first
- Check Opus dashboard for error logs
- Verify input format matches workflow schema

### Messages don't appear
- Check browser console (F12)
- Verify backend is running
- Refresh the page

---

## 🎬 Ready to Demo?

### Pre-Demo Checklist
- [ ] App runs without errors
- [ ] Can add sample messages
- [ ] Processing works end-to-end
- [ ] Results display correctly
- [ ] Demo script memorized
- [ ] Backup video recorded

### Demo Flow (2-3 minutes)
1. Show empty dashboard (5s)
2. Add sample messages (10s)
3. Click "Process with Opus AI" (5s)
4. Show processing status (30s)
5. Review results (40s)
6. Explain technical approach (30s)
7. Answer questions (30s)

See `DEMO_GUIDE.md` for detailed script!

---

## 📚 Additional Resources

### Documentation Files
- `GETTING_STARTED.md` (this file) - Quick start
- `README.md` - Complete overview
- `OPUS_WORKFLOW_GUIDE.md` - Opus configuration
- `DEMO_GUIDE.md` - Presentation help
- `SETUP_CHECKLIST.md` - Detailed setup
- `PROJECT_SUMMARY.md` - Technical summary

### External Links
- [Opus Documentation](https://developer.opus.com)
- [Opus Help Center](https://help.opus.com)
- [Hackathon Details](https://hackathon.nyuad.edu.ae)

---

## 💡 Pro Tips

1. **Test Early**: Set up Opus workflow ASAP to debug issues
2. **Practice Demo**: Run through 3-5 times before presenting
3. **Backup Plan**: Record video in case live demo fails
4. **Know Your Code**: Be ready to explain architecture
5. **Have Fun**: You built something awesome! 🎉

---

## 🎯 Next Steps

1. ✅ Complete setup (30 minutes)
2. ✅ Test the application (10 minutes)
3. ✅ Practice demo (20 minutes)
4. ✅ Record backup video (10 minutes)
5. ✅ Prepare Q&A answers (10 minutes)
6. 🚀 Present and win! (priceless)

---

## 🤝 Need Help?

### During Development
- Check `SETUP_CHECKLIST.md` for step-by-step guide
- Review `OPUS_WORKFLOW_GUIDE.md` for Opus issues
- Read `README.md` for architecture details

### During Hackathon
- Ask mentors for assistance
- Check Opus documentation
- Review error logs in terminal

### Common Issues & Solutions
All in `SETUP_CHECKLIST.md` troubleshooting section!

---

## 🎉 You're Ready!

If you've completed the 3 steps above:
- ✅ Dependencies installed
- ✅ Opus configured
- ✅ App running

**You're ready to demo!** 

Go show them what you built! 🏆

---

**Good luck at the NYUAD x AppliedAI Hackathon 2026!** 🚀
