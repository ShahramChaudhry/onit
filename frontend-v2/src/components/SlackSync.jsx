import { useState } from 'react'
import { Slack, Download, Loader } from 'lucide-react'
import axios from 'axios'
import './SlackSync.css'

function SlackSync({ onTasksImported }) {
  const [loading, setLoading] = useState(false)
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState('')
  const [showChannels, setShowChannels] = useState(false)

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/channels')
      setChannels(response.data.channels || [])
      setShowChannels(true)
    } catch (error) {
      console.error('Error fetching channels:', error)
      alert('Failed to fetch Slack channels. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const importTasks = async () => {
    if (!selectedChannel) {
      alert('Please select a channel')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/api/process-channel', {
        channelId: selectedChannel
      })

      if (response.data.success && response.data.result) {
        const newTasks = response.data.result.tasks.map(task => ({
          id: Date.now() + Math.random(),
          title: task.task,
          description: task.context || '',
          project: response.data.channelName,
          priority: task.urgency,
          dueDate: task.deadline ? task.deadline.split('T')[0] : '',
          dueTime: task.deadline ? task.deadline.split('T')[1]?.substring(0, 5) : '',
          tags: [task.category || 'slack'],
          comments: 0,
          attachments: 0,
          gradient: getRandomGradient()
        }))

        onTasksImported(newTasks)
        alert(`Successfully imported ${newTasks.length} tasks from #${response.data.channelName}`)
        setShowChannels(false)
        setSelectedChannel('')
      }
    } catch (error) {
      console.error('Error importing tasks:', error)
      alert('Failed to import tasks from Slack')
    } finally {
      setLoading(false)
    }
  }

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f857a6 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }

  return (
    <div className="slack-sync-widget">
      <div className="slack-sync-header">
        <div className="slack-sync-title">
          <Slack size={20} />
          <span>Slack Sync</span>
        </div>
      </div>

      {!showChannels ? (
        <button 
          className="btn-slack-connect"
          onClick={fetchChannels}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="spinner" size={18} />
              Loading...
            </>
          ) : (
            <>
              <Download size={18} />
              Import from Slack
            </>
          )}
        </button>
      ) : (
        <div className="channel-selector">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a channel...</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                #{channel.name} {channel.is_private ? '🔒' : ''}
              </option>
            ))}
          </select>

          <div className="channel-actions">
            <button
              className="btn-import"
              onClick={importTasks}
              disabled={loading || !selectedChannel}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={16} />
                  Processing...
                </>
              ) : (
                'Import Tasks'
              )}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowChannels(false)
                setSelectedChannel('')
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="slack-sync-info">
        <p>Connect to Slack to automatically import tasks from channel messages</p>
      </div>
    </div>
  )
}

export default SlackSync
