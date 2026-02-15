# 🚀 Quick Start Guide - Task Organizer

Get your beautiful task organizer running in 2 minutes!

---

## ✅ You Have Everything Ready!

- ✅ Dependencies installed
- ✅ Beautiful UI components created
- ✅ Drag & drop functionality configured
- ✅ Slack integration built-in
- ✅ Responsive design

---

## 🎯 Step 1: Start the Frontend

```bash
cd /Users/shahram/Documents/onit/onit/frontend-v2
npm run dev
```

**Opens at:** http://localhost:3000

---

## 🎯 Step 2: Start the Backend (if using Slack import)

In a **new terminal**:

```bash
cd /Users/shahram/Documents/onit/onit/backend-slack
npm run dev
```

**Backend runs on:** http://localhost:3002

---

## 🎨 What You'll See

### Main Screen:
- **Header** with "Task Organizer" logo
- **"Manage your tasks"** title
- **Calendar** on the left sidebar
- **Slack Sync** button on left sidebar
- **Stats Bar** showing task counts
- **Task Cards** in beautiful gradient colors
- **New Task** button (top right)

### Try These Actions:

1. **Create a Task**
   - Click "New Task"
   - Fill in: Title, Description, Priority
   - Pick a date and time
   - Add tags
   - Click "Create Task"

2. **Drag & Drop**
   - Click and hold any task card
   - Drag to reorder
   - Release to drop
   - Watch it smoothly reorganize!

3. **Import from Slack** (if backend running)
   - Click "Import from Slack"
   - Select a channel
   - Click "Import Tasks"
   - Watch AI-extracted tasks appear!

4. **Filter Tasks**
   - Use dropdown in stats bar
   - Filter by High/Medium/Low priority
   - See counts update

5. **Edit a Task**
   - Click ⋮ menu on any task card
   - Click "Edit"
   - Update details
   - Save changes

---

## 🎨 Features Overview

### ✨ Beautiful Design
- Dark theme with gradients
- Smooth animations
- Modern card-based layout
- Responsive (works on mobile!)

### 🔄 Drag & Drop
- Click and hold to grab
- Drag to reorder
- Smooth transitions
- Visual feedback

### 📅 Calendar
- Month view
- Date selection
- Today highlight
- Easy navigation

### 🏷️ Priority System
- **🔴 High**: Red badge, urgent tasks
- **🟡 Medium**: Orange badge, important
- **🟢 Low**: Green badge, optional

### 💬 Slack Integration
- List all channels
- Import messages
- AI extracts tasks
- Auto-assign priorities

### 📊 Smart Stats
- Total task count
- Priority breakdown
- Real-time updates
- Visual filtering

---

## 🎯 Sample Tasks Included

The app comes with 3 beautiful sample tasks:

1. **Optimizing Workflow Efficiency**
   - Priority: High
   - Blue → Purple → Pink gradient
   - Due: Tomorrow at 2 PM

2. **Aligning Goals & Actions**
   - Priority: High
   - Teal → Pink gradient
   - Strategic planning

3. **Review Security Audit**
   - Priority: High
   - Purple → Pink gradient
   - Critical vulnerabilities

---

## 🛠️ Customization

### Change Colors

Edit `src/index.css`:

```css
:root {
  --accent-blue: #667eea;    /* Change to your blue */
  --accent-purple: #764ba2;   /* Change to your purple */
  --accent-pink: #f857a6;     /* Change to your pink */
}
```

### Add More Gradients

Edit `App.jsx`, find `getRandomGradient()`:

```javascript
const gradients = [
  'linear-gradient(135deg, #your-color 0%, #your-color 100%)',
  // Add your custom gradients here!
]
```

### Change Font

Edit `index.html`, replace Google Fonts link:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;600;700&display=swap" rel="stylesheet">
```

---

## 🔌 Connecting to Backend

### For Slack Integration:

1. **Backend must be running:**
   ```bash
   cd /Users/shahram/Documents/onit/onit/backend-slack
   npm run dev
   ```

2. **Backend needs:**
   - Slack bot token
   - Opus API credentials
   - (See backend-slack README for setup)

3. **Frontend auto-connects** via proxy:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3002
   - Proxy configured in `vite.config.js`

---

## 📱 Responsive Breakpoints

- **Desktop (>1024px)**: Full layout with sidebar
- **Tablet (768px-1024px)**: Adaptive grid
- **Mobile (<768px)**: Single column, stacked

---

## 🎬 Keyboard Shortcuts (Future)

Planning to add:
- `N` - New task
- `F` - Filter
- `S` - Slack sync
- `/` - Search
- `Esc` - Close modal

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js
```

### Drag & drop not working

- Check browser compatibility (Chrome, Firefox, Safari, Edge)
- Clear browser cache
- Restart dev server

### Styles not loading

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Slack import fails

- Make sure backend is running (port 3002)
- Check backend `.env` has valid tokens
- Verify backend health: http://localhost:3002/health

---

## 📚 File Structure

```
frontend-v2/
├── src/
│   ├── components/        # All UI components
│   ├── App.jsx           # Main app
│   ├── App.css           # App styles
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.js        # Build config
└── package.json          # Dependencies
```

---

## 🎉 You're Ready!

Your task organizer is fully functional with:
- ✅ Beautiful gradient cards
- ✅ Drag & drop reordering
- ✅ Calendar integration
- ✅ Priority management
- ✅ Slack sync ready
- ✅ Responsive design

---

## 🚀 Next Steps

1. **Customize colors** to match your brand
2. **Add more sample tasks** to test drag & drop
3. **Connect to Slack** for real task import
4. **Deploy** when ready for production
5. **Show it off** at the hackathon! 🏆

---

**Need help?** Check:
- `README.md` - Full documentation
- `QUICKSTART.md` - This guide
- Backend docs in `backend-slack/`

---

**Happy organizing!** 🎯✨
