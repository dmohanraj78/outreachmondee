import React, { useState } from 'react';
import EmailFinder from './components/EmailFinder';
import MailGenerator from './components/MailGenerator';
import EmailSender from './components/EmailSender';
import ActivityLog from './components/ActivityLog';
import { Search, PenTool, Send, History, Settings, ExternalLink, User } from 'lucide-react';

const MONDEE_LOGO = "https://www.mondee.com/app/uploads/2026/03/Mondee_logo.svg";

function App() {
  const [activeTab, setActiveTab] = useState('finder');

  const renderContent = () => {
    switch (activeTab) {
      case 'finder': return <EmailFinder />;
      case 'generator': return <MailGenerator />;
      case 'sender': return <EmailSender />;
      case 'log': return <ActivityLog />;
      default: return <EmailFinder />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={MONDEE_LOGO} alt="Mondee Logo" className="logo" />
        </div>
        
        <nav className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'finder' ? 'active' : ''}`}
            onClick={() => setActiveTab('finder')}
          >
            <Search size={18} />
            <span>Lead Finder</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <PenTool size={18} />
            <span>AI Personalization</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'sender' ? 'active' : ''}`}
            onClick={() => setActiveTab('sender')}
          >
            <Send size={18} />
            <span>Mail Sender</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            <History size={18} />
            <span>Activity Log</span>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
