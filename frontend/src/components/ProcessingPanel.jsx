import { CheckCircle, XCircle, Loader, Activity } from 'lucide-react';
import './ProcessingPanel.css';

function ProcessingPanel({ status, results }) {
  const getStatusIcon = () => {
    switch (status?.status) {
      case 'COMPLETED':
        return <CheckCircle size={24} color="#10b981" />;
      case 'FAILED':
        return <XCircle size={24} color="#ef4444" />;
      case 'IN PROGRESS':
      case 'INITIATING':
        return <Loader size={24} color="#6366f1" className="spin" />;
      default:
        return <Activity size={24} color="#6366f1" />;
    }
  };

  const getStatusClass = () => {
    switch (status?.status) {
      case 'COMPLETED':
        return 'processing-success';
      case 'FAILED':
        return 'processing-error';
      default:
        return 'processing-active';
    }
  };

  return (
    <div className={`processing-panel ${getStatusClass()} fade-in`}>
      <div className="processing-header">
        {getStatusIcon()}
        <div>
          <div className="processing-title">
            {status?.status || 'Processing'}
          </div>
          <div className="processing-message">
            {status?.message || 'Working on your request...'}
          </div>
        </div>
      </div>

      {status?.jobExecutionId && (
        <div className="processing-details">
          <div className="detail-row">
            <span className="detail-label">Job ID:</span>
            <code className="detail-value">{status.jobExecutionId}</code>
          </div>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="results-header">
            <Activity size={20} />
            <span>Results</span>
          </div>
          <div className="results-content">
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessingPanel;
