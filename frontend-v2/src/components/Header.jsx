import { Sparkles, User } from 'lucide-react'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <Sparkles className="logo-icon" />
            <span className="logo-text">Task Organizer</span>
          </div>
          <span className="badge-ai">AI Powered</span>
        </div>
        <div className="header-right">
          <button className="user-avatar">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
