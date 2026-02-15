import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import MessageList from './components/MessageList';
import TaskList from './components/TaskList';
import ProcessingPanel from './components/ProcessingPanel';
import Stats from './components/Stats';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfJobStatus, setPdfJobStatus] = useState(null);
  const [pdfResults, setPdfResults] = useState(null);

  // Load sample data
  const loadSampleData = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data.messages || []);
      
      const tasksResponse = await axios.get('/api/messages/tasks');
      setTasks(tasksResponse.data.tasks || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Process messages through Opus
  const processMessages = async () => {
    if (messages.length === 0) {
      alert('No messages to process. Add some messages first!');
      return;
    }

    setProcessing(true);
    setJobStatus({ status: 'INITIATING', message: 'Starting job...' });

    try {
      const response = await axios.post('/api/opus/process', {
        messages: messages,
        existingTasks: tasks
      });

      setJobStatus({ 
        status: 'COMPLETED', 
        message: 'Processing complete!',
        jobExecutionId: response.data.jobExecutionId
      });
      
      setResults(response.data.results);
      
      // Parse results and update tasks
      if (response.data.results && response.data.results.data) {
        // This will depend on your Opus workflow output structure
        // For now, we'll show the raw results
        console.log('Job Results:', response.data.results);
      }
    } catch (error) {
      console.error('Error processing messages:', error);
      setJobStatus({ 
        status: 'FAILED', 
        message: error.response?.data?.message || 'Processing failed'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Add sample messages
  const addSampleMessages = async () => {
    try {
      // Import sample data dynamically
      const sampleMessages = [
        {
          sender: 'Sarah Chen',
          senderEmail: 'sarah.chen@company.com',
          subject: 'Urgent: Q1 Report Deadline',
          content: 'Hi team, we need to submit the Q1 financial report by end of day Friday. Can someone take the lead on compiling the data from all departments?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          category: 'urgent'
        },
        {
          sender: 'Michael Torres',
          senderEmail: 'michael.torres@company.com',
          subject: 'Team Meeting Notes',
          content: 'Here are the notes from today\'s standup:\n- Sprint review scheduled for next Tuesday\n- Bob will present the new feature\n- Need volunteers for user testing next week',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          category: 'info'
        },
        {
          sender: 'Jessica Park',
          senderEmail: 'jessica.park@company.com',
          subject: 'Client Request - API Documentation',
          content: 'Our client from Acme Corp is asking for updated API documentation. They mentioned they need it before their integration sprint starts on Monday.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          category: 'request'
        }
      ];

      const response = await axios.post('/api/messages', { messages: sampleMessages });
      setMessages(prev => [...prev, ...response.data.messages]);
    } catch (error) {
      console.error('Error adding sample messages:', error);
    }
  };

  // Process PDF through Opus workflow (EJ8PrEHf8b4zNenS)
  const processPdf = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setPdfProcessing(true);
    setPdfJobStatus({ status: 'INITIATING', message: 'Uploading PDF...' });

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await axios.post('/api/opus/process-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPdfJobStatus({
        status: 'COMPLETED',
        message: 'Processing complete!',
        jobExecutionId: response.data.jobExecutionId
      });
      setPdfResults(response.data.results);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfJobStatus({
        status: 'FAILED',
        message: error.response?.data?.message || 'PDF processing failed'
      });
    } finally {
      setPdfProcessing(false);
    }
  };

  // Clear all data
  const clearData = async () => {
    try {
      await axios.delete('/api/messages/clear');
      setMessages([]);
      setTasks([]);
      setResults(null);
      setJobStatus(null);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  useEffect(() => {
    loadSampleData();
  }, []);

  return (
    <div className="app">
      <Header />
      
      <div className="container">
        <Stats 
          messagesCount={messages.length}
          tasksCount={tasks.length}
          urgentCount={messages.filter(m => m.category === 'urgent').length}
        />

        <div className="action-bar">
          <button 
            className="btn btn-primary" 
            onClick={addSampleMessages}
          >
            Add Sample Messages
          </button>
          <button 
            className="btn btn-success" 
            onClick={processMessages}
            disabled={processing || messages.length === 0}
          >
            {processing ? 'Processing...' : 'Process Messages with Opus'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={clearData}
          >
            Clear All
          </button>
        </div>

        {/* PDF Upload Section - Workflow EJ8PrEHf8b4zNenS */}
        <div className="card pdf-upload-section" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">PDF Processing (Opus Workflow)</h2>
            <span className="badge badge-primary">Workflow: EJ8PrEHf8b4zNenS</span>
          </div>
          <div className="action-bar">
            <label className="btn btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPdfFile(file || null);
                  if (file) {
                    setPdfResults(null);
                    setPdfJobStatus(null);
                  }
                }}
                style={{ display: 'none' }}
              />
              {pdfFile ? `Selected: ${pdfFile.name}` : 'Choose PDF File'}
            </label>
            <button
              className="btn btn-success"
              onClick={processPdf}
              disabled={pdfProcessing || !pdfFile}
            >
              {pdfProcessing ? 'Processing PDF...' : 'Process PDF with Opus'}
            </button>
          </div>
          {pdfJobStatus && (
            <ProcessingPanel 
              status={pdfJobStatus} 
              results={pdfResults}
            />
          )}
        </div>

        {jobStatus && (
          <ProcessingPanel 
            status={jobStatus} 
            results={results}
          />
        )}

        <div className="main-content">
          <MessageList messages={messages} />
          <TaskList tasks={tasks} />
        </div>
      </div>
    </div>
  );
}

export default App;
