# Setup Checklist

Follow this checklist to get your Teams Task Manager running for the hackathon.

## ☑️ Phase 1: Installation (10 minutes)

### 1.1 Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor ready (VS Code, Cursor, etc.)

### 1.2 Repository Setup
- [ ] Project cloned or unzipped
- [ ] Navigate to project directory: `cd onit`
- [ ] Check files are present: `ls -la`

### 1.3 Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

- [ ] Backend dependencies installed (no errors)
- [ ] Frontend dependencies installed (no errors)
- [ ] Both package-lock.json files created

---

## ☑️ Phase 2: Opus Configuration (15-20 minutes)

### 2.1 Create Opus Account
- [ ] Go to [https://opus.com](https://opus.com)
- [ ] Sign up or log in
- [ ] Verify email if needed

### 2.2 Create Workflow
- [ ] Click "Create Workflow"
- [ ] Choose "Start from Prompt"
- [ ] Copy prompt from `OPUS_WORKFLOW_GUIDE.md`
- [ ] Paste and generate workflow
- [ ] Review generated nodes
- [ ] Test with sample data
- [ ] Publish workflow

### 2.3 Get Credentials
- [ ] Copy Workflow ID from settings
- [ ] Go to Settings → API Keys
- [ ] Create new service key named "Teams Task Manager"
- [ ] Copy API key (save securely!)

### 2.4 Configure Environment
- [ ] Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- [ ] Edit `.env` file
- [ ] Paste Workflow ID
- [ ] Paste API Key
- [ ] Save file

**Your `.env` should look like:**
```env
OPUS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxx
OPUS_WORKFLOW_ID=wf_xxxxxxxxxxxxxxxxxxxxxxxxxx
OPUS_API_BASE_URL=https://operator.opus.com
PORT=3001
```

---

## ☑️ Phase 3: Testing (5 minutes)

### 3.1 Start Backend
```bash
# In project root
npm run dev:backend
```

- [ ] Server starts without errors
- [ ] See message: "🚀 Server running on http://localhost:3001"
- [ ] Keep this terminal open

### 3.2 Start Frontend (New Terminal)
```bash
# In project root
npm run dev:frontend
```

- [ ] Frontend starts without errors
- [ ] See message: "Local: http://localhost:3000"
- [ ] Keep this terminal open

### 3.3 Open Application
- [ ] Open browser
- [ ] Navigate to `http://localhost:3000`
- [ ] Dashboard loads successfully
- [ ] No console errors (F12 to check)

### 3.4 Test Basic Functions
- [ ] Click "Add Sample Messages"
- [ ] Messages appear in left panel
- [ ] Stats update (messages count)
- [ ] Click "Process with Opus AI"
- [ ] Processing panel appears
- [ ] Status updates to "COMPLETED"
- [ ] Results display in panel
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## ☑️ Phase 4: Demo Preparation (10 minutes)

### 4.1 Practice Demo
- [ ] Run through full demo flow 3 times
- [ ] Time yourself (should be 2-3 minutes)
- [ ] Note any slow parts
- [ ] Practice speaking points

### 4.2 Record Backup Video
- [ ] Clear browser cache
- [ ] Close extra tabs/apps
- [ ] Start screen recording
- [ ] Run through demo smoothly
- [ ] Stop recording
- [ ] Watch video to verify quality
- [ ] Save in safe location

### 4.3 Prepare Materials
- [ ] Print demo script
- [ ] Create slides (optional)
- [ ] Prepare Q&A answers
- [ ] Test on presentation computer if possible

---

## ☑️ Phase 5: Final Checks (5 minutes)

### 5.1 Code Review
- [ ] README.md is complete
- [ ] No console.log() left in production code
- [ ] No TODO comments forgotten
- [ ] .env file NOT committed to git
- [ ] All files saved

### 5.2 Presentation Ready
- [ ] Demo script memorized
- [ ] Backup video accessible
- [ ] Laptop charged
- [ ] Backup laptop ready (if available)
- [ ] Internet connection verified
- [ ] Presentation mode settings configured

### 5.3 Submission Requirements
- [ ] Working Opus workflow ✅
- [ ] Frontend/Dashboard ✅
- [ ] Sample data ✅
- [ ] 2-3 minute demo ready ✅
- [ ] README documentation ✅

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution**: 
```bash
npm install
```

### Issue: "EADDRINUSE: Port 3001 already in use"
**Solution**: 
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env to 3002
```

### Issue: "Opus API authentication failed"
**Solution**:
- Double-check API key in `.env`
- Ensure no extra spaces
- Verify key is active in Opus dashboard
- Check if workflow is published (not draft)

### Issue: "Job execution failed"
**Solution**:
- Test workflow in Opus platform first
- Verify input format matches workflow schema
- Check Opus dashboard for error logs
- Review workflow prompt for clarity

### Issue: Messages don't appear
**Solution**:
- Check browser console for errors (F12)
- Verify backend is running
- Check network tab for failed API calls
- Try refreshing the page

### Issue: Frontend won't start
**Solution**:
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 📞 Getting Help

### During Hackathon
- Ask mentors for assistance
- Check Opus help center: [help.opus.com](https://help.opus.com)
- Review API docs: [developer.opus.com](https://developer.opus.com)

### Common Resources
- `README.md` - Project overview
- `OPUS_WORKFLOW_GUIDE.md` - Workflow setup
- `DEMO_GUIDE.md` - Presentation help

---

## ✅ Pre-Submission Checklist

Final verification before submitting:

- [ ] All features working
- [ ] Demo video recorded
- [ ] README complete
- [ ] Code clean and commented
- [ ] No sensitive data in code
- [ ] Git history clean
- [ ] Project zip/link ready
- [ ] Team member info complete

---

## 🎉 You're Ready!

If all checkboxes are marked, you're ready to present. Take a deep breath, trust your preparation, and show off your amazing work!

**Good luck!** 🚀
