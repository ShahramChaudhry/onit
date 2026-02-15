import { Mail, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './MessageList.css';

function MessageList({ messages }) {
  const getCategoryColor = (category) => {
    const colors = {
      urgent: 'badge-danger',
      request: 'badge-warning',
      info: 'badge-primary',
      question: 'badge-success'
    };
    return colors[category] || 'badge-primary';
  };

  return (
    <div className="card">
      <div className="card-header">
        <Mail size={24} color="#6366f1" />
        <h2 className="card-title">Messages</h2>
        <span className="badge badge-primary">{messages.length}</span>
      </div>

      {messages.length === 0 ? (
        <div className="empty-state">
          <Mail size={64} />
          <p>No messages yet</p>
          <p className="empty-subtitle">Add sample messages to get started</p>
        </div>
      ) : (
        <div className="message-list">
          {messages.map((message, index) => (
            <div key={message.id || index} className="message-item fade-in">
              <div className="message-header">
                <div className="message-sender">
                  <User size={16} />
                  <span className="sender-name">{message.sender}</span>
                </div>
                {message.category && (
                  <span className={`badge ${getCategoryColor(message.category)}`}>
                    {message.category}
                  </span>
                )}
              </div>
              
              <div className="message-subject">{message.subject}</div>
              
              <div className="message-content">{message.content}</div>
              
              <div className="message-footer">
                <div className="message-time">
                  <Clock size={14} />
                  <span>
                    {message.timestamp 
                      ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
                      : 'Just now'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageList;
