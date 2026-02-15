import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import './Stats.css';

function Stats({ messagesCount, tasksCount, urgentCount }) {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-primary">
        <div className="stat-icon">
          <Mail size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{messagesCount}</div>
          <div className="stat-label">Messages</div>
        </div>
      </div>

      <div className="stat-card stat-success">
        <div className="stat-icon">
          <CheckCircle size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{tasksCount}</div>
          <div className="stat-label">Active Tasks</div>
        </div>
      </div>

      <div className="stat-card stat-warning">
        <div className="stat-icon">
          <AlertCircle size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{urgentCount}</div>
          <div className="stat-label">Urgent Items</div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
