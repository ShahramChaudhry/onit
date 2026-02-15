import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Clock, MessageCircle, Paperclip, MoreVertical, Trash2, Edit, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useState, useRef } from 'react'
import './TaskCard.css'

function TaskCard({ task, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const [slidePosition, setSlidePosition] = useState(0)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const sliderRef = useRef(null)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  // Handle slider drag
  const handleSliderStart = (e) => {
    e.stopPropagation()
    setIsDraggingSlider(true)
  }

  const handleSliderMove = (e) => {
    if (!isDraggingSlider || !sliderRef.current) return
    
    const slider = sliderRef.current
    const rect = slider.getBoundingClientRect()
    const maxWidth = rect.width - 50 // 50px is the button width
    
    let clientX
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX
    } else {
      clientX = e.clientX
    }
    
    const newPosition = Math.max(0, Math.min(clientX - rect.left - 25, maxWidth))
    setSlidePosition(newPosition)
    
    // If slid past 80%, complete the task
    if (newPosition > maxWidth * 0.8) {
      completeTask()
    }
  }

  const handleSliderEnd = () => {
    if (!isDraggingSlider) return
    
    setIsDraggingSlider(false)
    
    // Reset if not completed
    if (slidePosition < (sliderRef.current?.offsetWidth - 50) * 0.8) {
      setSlidePosition(0)
    }
  }

  const completeTask = () => {
    setIsCompleting(true)
    const maxPosition = (sliderRef.current?.offsetWidth || 250) - 50
    setSlidePosition(maxPosition)
    
    setTimeout(() => {
      onDelete(task.id) // Remove task after completion
    }, 800)
  }

  // Global mouse/touch event listeners
  useState(() => {
    if (isDraggingSlider) {
      document.addEventListener('mousemove', handleSliderMove)
      document.addEventListener('mouseup', handleSliderEnd)
      document.addEventListener('touchmove', handleSliderMove)
      document.addEventListener('touchend', handleSliderEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleSliderMove)
        document.removeEventListener('mouseup', handleSliderEnd)
        document.removeEventListener('touchmove', handleSliderMove)
        document.removeEventListener('touchend', handleSliderEnd)
      }
    }
  }, [isDraggingSlider])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card animate-scale-in"
      {...attributes}
      {...listeners}
    >
      <div className="task-card-gradient" style={{ background: task.gradient }} />
      
      <div className="task-card-content">
        <div className="task-header">
          <span className={`priority-badge priority-${task.priority}`}>
            {getPriorityLabel(task.priority)}
          </span>
          <div className="task-menu">
            <button 
              className="task-menu-btn"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="task-menu-dropdown">
                <button onClick={() => {
                  onEdit(task)
                  setShowMenu(false)
                }}>
                  <Edit size={14} />
                  Edit
                </button>
                <button onClick={() => {
                  onDelete(task.id)
                  setShowMenu(false)
                }} className="delete-btn">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {task.project && (
          <div className="task-project">{task.project}</div>
        )}

        <h3 className="task-title">{task.title}</h3>
        
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          {task.dueDate && (
            <div className="meta-item">
              <Calendar size={14} />
              <span>{format(new Date(task.dueDate), 'dd MMM')}</span>
            </div>
          )}
          {task.dueTime && (
            <div className="meta-item">
              <Clock size={14} />
              <span>{task.dueTime}</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {task.comments > 0 || task.attachments > 0 ? (
          <div className="task-stats">
            {task.comments > 0 && (
              <div className="stat-item">
                <MessageCircle size={14} />
                <span>{task.comments}</span>
              </div>
            )}
            {task.attachments > 0 && (
              <div className="stat-item">
                <Paperclip size={14} />
                <span>{task.attachments}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Slide to Complete */}
        <div 
          className={`slide-to-complete ${isCompleting ? 'completing' : ''}`}
          ref={sliderRef}
          onMouseMove={handleSliderMove}
          onMouseUp={handleSliderEnd}
          onMouseLeave={handleSliderEnd}
          onTouchMove={handleSliderMove}
          onTouchEnd={handleSliderEnd}
        >
          <span className="slide-text">Set As Done</span>
          <button
            className="slide-button"
            style={{ transform: `translateX(${slidePosition}px)` }}
            onMouseDown={handleSliderStart}
            onTouchStart={handleSliderStart}
          >
            <Check size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
