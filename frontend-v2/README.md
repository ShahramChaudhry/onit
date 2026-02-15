# Task Organizer - Modern Frontend

Beautiful, intuitive task management interface with drag-and-drop functionality inspired by modern mobile UI design.

## ✨ Features

- 🎨 **Beautiful Gradient Cards** - Stunning visual design with custom gradients
- 🔄 **Drag & Drop** - Intuitively reorganize tasks by dragging
- 📅 **Calendar Integration** - Visual date selection
- 🏷️ **Priority Levels** - High, Medium, Low with color coding
- 💬 **Slack Sync** - Import tasks from Slack channels
- 🎯 **Smart Filtering** - Filter by priority
- ✏️ **Easy Editing** - Create and edit tasks with modal
- 📊 **Real-time Stats** - See task counts and priorities at a glance

## 🚀 Quick Start

### Install Dependencies

```bash
cd frontend-v2
npm install
```

### Run Development Server

```bash
npm run dev
```

Opens at: **http://localhost:3000**

### Build for Production

```bash
npm run build
```

## 🎯 Usage

### Creating Tasks

1. Click **"New Task"** button
2. Fill in task details:
   - Title (required)
   - Description
   - Project name
   - Priority (High/Medium/Low)
   - Due date & time
   - Tags
3. Click **"Create Task"**

### Drag & Drop

- **Click and hold** any task card
- **Drag** to reorder
- **Release** to drop in new position
- Tasks automatically reorder

### Importing from Slack

1. Click **"Import from Slack"** in sidebar
2. Select a channel
3. Click **"Import Tasks"**
4. AI-extracted tasks appear automatically

### Filtering

- Use dropdown in stats bar
- Filter by priority: All / High / Medium / Low
- Counts update in real-time

## 🎨 Design System

### Colors

- **Background**: Dark gradients (#0f0f1e → #1a1a2e)
- **Accent Blue**: #667eea
- **Accent Purple**: #764ba2
- **Accent Pink**: #f857a6
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444

### Gradients

Each task card has a unique gradient:
- Blue → Purple → Pink
- Teal → Light Pink
- Pink → Red
- Blue → Cyan
- Green → Turquoise
- Pink → Yellow

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 📦 Dependencies

- **react**: UI framework
- **react-dom**: React DOM rendering
- **@dnd-kit**: Drag and drop functionality
- **axios**: HTTP client
- **date-fns**: Date formatting
- **lucide-react**: Icon library
- **framer-motion**: Animation library
- **vite**: Build tool

## 🏗️ Project Structure

```
frontend-v2/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Top navigation
│   │   ├── Calendar.jsx       # Date picker widget
│   │   ├── TaskCard.jsx       # Draggable task card
│   │   ├── TaskModal.jsx      # Create/Edit modal
│   │   ├── SlackSync.jsx      # Slack integration
│   │   └── StatsBar.jsx       # Statistics bar
│   ├── App.jsx                # Main app component
│   ├── App.css                # App styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies
```

## 🔌 API Integration

### Backend Endpoints

- `GET /api/channels` - List Slack channels
- `POST /api/process-channel` - Import tasks from Slack
- `GET /api/health` - Backend health check

### Configuration

Backend proxy configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3002',
    changeOrigin: true
  }
}
```

## 🎬 Animations

- **Fade In**: Task cards appear smoothly
- **Scale In**: Modals scale up elegantly
- **Slide In**: Sidebar animations
- **Drag**: Smooth dragging with opacity
- **Hover**: Cards lift on hover

## 📱 Responsive Design

- **Desktop**: Full layout with sidebar
- **Tablet**: Adaptive grid
- **Mobile**: Single column, stacked layout

## 🎨 Customization

### Change Gradient

Edit `getRandomGradient()` in `App.jsx`:

```javascript
const gradients = [
  'linear-gradient(135deg, #your-color 0%, #your-color 100%)',
  // Add more gradients...
]
```

### Change Theme Colors

Edit CSS variables in `index.css`:

```css
:root {
  --bg-dark: #0f0f1e;
  --accent-blue: #667eea;
  /* ... more variables */
}
```

## 🐛 Troubleshooting

### Tasks won't drag

- Check `@dnd-kit` is installed
- Ensure no conflicting CSS
- Verify `useSortable` hook is used

### Slack import fails

- Backend must be running on port 3002
- Check Slack bot token in backend `.env`
- Verify Opus credentials configured

### Styles not loading

- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server

## 🚀 Performance

- **Lazy Loading**: Components load on demand
- **Optimized Renders**: React.memo where needed
- **Virtual Scrolling**: For large task lists (future)
- **Code Splitting**: Vite handles automatically

## 📄 License

MIT License

## 🎉 Credits

- Design inspired by modern mobile task managers
- Built for NYUAD x AppliedAI Hackathon 2026
- Powered by Opus AI workflows

---

**Enjoy organizing your tasks!** 🎯
