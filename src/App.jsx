import React, { useState } from 'react';
import EmailFinder from './components/EmailFinder';
import InstantSearch from './components/InstantSearch';
import MailGenerator from './components/MailGenerator';
import EmailSender from './components/EmailSender';
import ActivityLog from './components/ActivityLog';
import CloserAgent from './components/CloserAgent';
import LinkedInAuthority from './components/LinkedInAuthority';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, Calendar, Search, Zap, PenTool, Send, History, Share2, Menu, X, UserPlus } from 'lucide-react';

const MONDEE_LOGO = "https://www.mondee.com/app/uploads/2026/03/Mondee_logo.svg";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Set Dashboard as default for today
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'finder': return <EmailFinder />;
      case 'instant': return <InstantSearch />;
      case 'generator': return <MailGenerator />;
      case 'sender': return <EmailSender />;
      case 'linkedin': return <LinkedInAuthority />;
      case 'closer': return <CloserAgent />;
      case 'log': return <ActivityLog />;
      default: return <Dashboard />;
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <div className="mobile-header" style={{ 
        display: 'none', 
        padding: '16px 24px', 
        background: 'var(--primary)', 
        color: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <img src={MONDEE_LOGO} alt="Mondee Logo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ background: 'transparent', padding: '8px', border: 'none', boxShadow: 'none' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <img src={MONDEE_LOGO} alt="Mondee Logo" className="logo" />
        </div>
        
        <nav className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'finder' ? 'active' : ''}`} onClick={() => handleTabClick('finder')}>
            <Search size={18} />
            <span>Lead Finder</span>
          </div>
          <div className={`nav-item ${activeTab === 'instant' ? 'active' : ''}`} onClick={() => handleTabClick('instant')}>
            <Zap size={18} />
            <span>Instant Search</span>
          </div>
          <div className={`nav-item ${activeTab === 'generator' ? 'active' : ''}`} onClick={() => handleTabClick('generator')}>
            <PenTool size={18} />
            <span>AI Personalization</span>
          </div>
          <div className={`nav-item ${activeTab === 'sender' ? 'active' : ''}`} onClick={() => handleTabClick('sender')}>
            <Send size={18} />
            <span>Mail Sender</span>
          </div>
          <div className={`nav-item ${activeTab === 'linkedin' ? 'active' : ''}`} onClick={() => handleTabClick('linkedin')}>
            <Share2 size={18} />
            <span>LinkedIn Authority</span>
          </div>
          <div className={`nav-item ${activeTab === 'closer' ? 'active' : ''}`} onClick={() => handleTabClick('closer')}>
            <UserPlus size={18} />
            <span>Closer Agent</span>
          </div>
          <div className={`nav-item ${activeTab === 'log' ? 'active' : ''}`} onClick={() => handleTabClick('log')}>
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

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 280px !important;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0 !important;
            padding-top: 60px;
          }
          .page-container {
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
