import { Filter } from 'lucide-react'
import './StatsBar.css'

function StatsBar({ tasks, filterPriority, onFilterChange }) {
  const stats = {
    total: tasks.length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  }

  return (
    <div className="stats-bar">
      <div className="stats-items">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        
        <div className="stat-card high">
          <span className="stat-value">{stats.high}</span>
          <span className="stat-label">High Priority</span>
        </div>
        
        <div className="stat-card medium">
          <span className="stat-value">{stats.medium}</span>
          <span className="stat-label">Medium Priority</span>
        </div>
        
        <div className="stat-card low">
          <span className="stat-value">{stats.low}</span>
          <span className="stat-label">Low Priority</span>
        </div>
      </div>

      <div className="filter-section">
        <Filter size={16} />
        <select
          value={filterPriority}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>
    </div>
  )
}

export default StatsBar
