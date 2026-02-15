import { CheckCircle, Circle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import './TaskList.css';

function TaskList({ tasks }) {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    return colors[priority] || 'priority-medium';
  };

  return (
    <div className="card">
      <div className="card-header">
        <CheckCircle size={24} color="#10b981" />
        <h2 className="card-title">Tasks</h2>
        <span className="badge badge-success">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={64} />
          <p>No tasks yet</p>
          <p className="empty-subtitle">Process messages to generate tasks</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task, index) => (
            <div key={task.id || index} className="task-item fade-in">
              <div className="task-main">
                <div className="task-checkbox">
                  {task.status === 'completed' ? (
                    <CheckCircle size={20} color="#10b981" />
                  ) : (
                    <Circle size={20} color="#9ca3af" />
                  )}
                </div>
                
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  
                  <div className="task-meta">
                    {task.dueDate && (
                      <div className="task-due">
                        <Calendar size={14} />
                        <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {task.assignee && (
                      <span className="task-assignee">{task.assignee}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`task-priority ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
