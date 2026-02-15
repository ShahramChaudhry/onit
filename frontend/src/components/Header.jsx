import { BrainCircuit } from 'lucide-react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <BrainCircuit size={40} className="header-icon" />
          <div>
            <h1 className="header-title">Teams Task Manager</h1>
            <p className="header-subtitle">AI-Powered Message Processing with Opus</p>
          </div>
        </div>
        <div className="header-right">
          <span className="header-badge">NYUAD Hackathon 2026</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
