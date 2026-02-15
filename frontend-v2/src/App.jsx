import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Calendar from './components/Calendar'
import TaskCard from './components/TaskCard'
import TaskModal from './components/TaskModal'
import SlackSync from './components/SlackSync'
import StatsBar from './components/StatsBar'
import CompletionCelebration from './components/CompletionCelebration'
import { Plus } from 'lucide-react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterPriority, setFilterPriority] = useState('all')
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedTaskTitle, setCompletedTaskTitle] = useState('')

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Load sample tasks
  useEffect(() => {
    const sampleTasks = [
      {
        id: '1',
        title: 'Optimizing Workflow Efficiency',
        description: 'Review and optimize current workflow processes',
        project: 'Project Pulse',
        priority: 'high',
        dueDate: '2026-02-16',
        dueTime: '14:00',
        tags: ['work', 'project'],
        comments: 3,
        attachments: 2,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f857a6 100%)'
      },
      {
        id: '2',
        title: 'Aligning Goals & Actions',
        description: 'Strategic planning session for Q1 goals',
        project: 'Strategic Tracker',
        priority: 'high',
        dueDate: '2026-02-17',
        dueTime: '10:00',
        tags: ['strategy', 'planning'],
        comments: 1,
        attachments: 0,
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      },
      {
        id: '3',
        title: 'Review Security Audit Findings',
        description: 'Address critical vulnerabilities from security audit',
        project: 'Security',
        priority: 'high',
        dueDate: '2026-02-15',
        dueTime: '17:00',
        tags: ['security', 'urgent'],
        comments: 5,
        attachments: 3,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      }
    ]
    setTasks(sampleTasks)
  }, [])

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Add or update task
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t))
    } else {
      const newTask = {
        id: Date.now().toString(),
        ...taskData,
        comments: 0,
        attachments: 0,
        gradient: getRandomGradient()
      }
      setTasks([...tasks, newTask])
    }
    setShowModal(false)
    setEditingTask(null)
  }

  // Delete task (or complete task)
  const handleDeleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setCompletedTaskTitle(task.title)
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
      }, 2000)
    }
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  // Edit task
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  // Random gradient for new tasks
  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f857a6 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }

  // Filter tasks
  const filteredTasks = filterPriority === 'all'
    ? tasks
    : tasks.filter(t => t.priority === filterPriority)

  return (
    <div className="app">
      <Header />
      
      <div className="main-content">
        <div className="sidebar">
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <SlackSync onTasksImported={(newTasks) => setTasks([...tasks, ...newTasks])} />
        </div>

        <div className="content-area">
          <div className="content-header">
            <div>
              <h1 className="page-title">Manage your tasks</h1>
              <p className="page-subtitle">Drag and drop to reorganize</p>
            </div>
            <button className="btn-new-task" onClick={() => {
              setEditingTask(null)
              setShowModal(true)
            }}>
              <Plus size={20} />
              New Task
            </button>
          </div>

          <StatsBar 
            tasks={tasks}
            filterPriority={filterPriority}
            onFilterChange={setFilterPriority}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="tasks-container">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No tasks yet</h3>
                  <p>Create a new task or import from Slack</p>
                </div>
              ) : (
                <SortableContext
                  items={filteredTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="tasks-grid">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </DndContext>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <TaskModal
            task={editingTask}
            onSave={handleSaveTask}
            onClose={() => {
              setShowModal(false)
              setEditingTask(null)
            }}
          />
        )}
        
        {showCelebration && (
          <CompletionCelebration
            taskTitle={completedTaskTitle}
            onClose={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
