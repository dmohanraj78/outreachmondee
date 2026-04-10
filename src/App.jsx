import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import EmailFinder from './components/EmailFinder';
import InstantSearch from './components/InstantSearch';
import MailGenerator from './components/MailGenerator';
import EmailSender from './components/EmailSender';
import ActivityLog from './components/ActivityLog';
import CloserAgent from './components/CloserAgent';
import LinkedInAuthority from './components/LinkedInAuthority';
import Dashboard from './components/Dashboard';
import LeadCapture from './components/LeadCapture';
import AIDoctor from './components/AIDoctor';
import { 
  LayoutDashboard, 
  Search, 
  Zap, 
  PenTool, 
  Send, 
  History, 
  Share2, 
  Menu, 
  X, 
  UserPlus, 
  FileText, 
  Stethoscope,
  ChevronRight,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { cn } from './lib/utils';
import { ProcessProvider, useProcess } from './context/ProcessContext';
import ProcessingModal from './components/ui/ProcessingModal';
import axios from 'axios';

// Infinite network resilience for long-running n8n extraction tasks
axios.defaults.timeout = 0;

const MONDEE_LOGO = "https://www.mondee.com/app/uploads/2026/03/Mondee_logo.svg";

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: <Dashboard /> },
  { id: 'finder', label: 'Lead Finder', icon: Search, component: <EmailFinder /> },
  { id: 'capture', label: 'Capture Form', icon: FileText, component: <LeadCapture /> },
  { id: 'instant', label: 'Instant Search', icon: Zap, component: <InstantSearch /> },
  { id: 'generator', label: 'AI Personalization', icon: PenTool, component: <MailGenerator /> },
  { id: 'sender', label: 'Mail Sender', icon: Send, component: <EmailSender /> },
  { id: 'linkedin', label: 'LinkedIn Ghost', icon: Share2, component: <LinkedInAuthority /> },
  { id: 'closer', label: 'Closer Agent', icon: UserPlus, component: <CloserAgent /> },
  { id: 'doctor', label: 'AI Doctor', icon: Stethoscope, component: <AIDoctor /> },
  { id: 'log', label: 'Activity Log', icon: History, component: <ActivityLog /> },
];

function App() {
  return (
    <ProcessProvider>
      <AppLayout />
    </ProcessProvider>
  );
}

function AppLayout() {
  const { 
    isOpen, 
    isMinimized, 
    status, 
    title, 
    message, 
    percentage, 
    elapsedTime,
    error, 
    currentNode, 
    toggleMinimize, 
    close,
    startProcess,
    completeProcess,
    failProcess
  } = useProcess();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeItem = NAV_ITEMS.find(item => item.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* Rock-Solid Stable Sidebar */}
      <aside 
        className={cn(
          "sidebar-stable z-[50] flex flex-col",
          isMobile && "fixed inset-y-0 left-0",
          isSidebarOpen ? "w-[280px]" : "w-0 -translate-x-full lg:w-[80px] lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="h-24 flex items-center px-8 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0">
              <img 
                src={MONDEE_LOGO} 
                alt="Mondee" 
                className="h-9 w-auto invert brightness-0 opacity-90" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://www.mondee.com/wp-content/uploads/2021/08/mondee-logo-white.png";
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar-dark">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
                title={!isSidebarOpen ? item.label : ""}
              >
                <Icon size={20} className={cn("transition-transform flex-shrink-0", isActive ? "text-accent" : "text-white/20 group-hover:text-white/60")} />
                {isSidebarOpen && (
                  <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                )}
                {isActive && isSidebarOpen && (
                  <ChevronRight size={14} className="ml-auto text-white/20" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-white/5 mt-auto">
          {isSidebarOpen ? (
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold ring-2 ring-white/10">
                  DM
                </div>
                <div className="truncate w-24">
                  <div className="text-[11px] font-semibold text-white truncate">Dhanush</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Admin</div>
                </div>
              </div>
              <button className="text-white/20 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
             <div className="flex justify-center">
               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">DM</div>
             </div>
          )}
        </div>
      </aside>

      {/* Breathable Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header (Breathable & Clean) */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between flex-shrink-0 z-[40]">
          <div className="flex items-center gap-6">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="hover:bg-slate-100 text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {activeItem.label}
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Professional</span>
            </h2>
          </div>

          {/* Minimized Progress Pill */}
          {isOpen && isMinimized && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-5 py-1.5 cursor-pointer hover:bg-slate-100 transition-all shadow-sm group"
              onClick={toggleMinimize}
            >
              <div className="relative w-12 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0.1 }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "absolute inset-0 transition-colors",
                    status === 'error' ? "bg-red-500" : "bg-primary"
                  )}
                />
                <span className={cn("relative text-[9px] font-bold tabular-nums", status === 'error' ? "text-red-500" : "text-primary")}>
                  {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-900 leading-none uppercase tracking-wider">
                  {status === 'error' ? "Operation Halted" : (percentage === 100 ? "Ready" : "Processing...")}
                </span>
                <span className="text-[9px] font-medium text-slate-400 leading-tight truncate max-w-[120px]">
                  {status === 'error' ? "System Diagnostics Needed" : currentNode}
                </span>
              </div>
            </motion.div>
          )}
          
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-900">
               <Bell size={18} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
             </Button>
             <div className="h-6 w-px bg-slate-200 mx-1" />
             <Button variant="ghost" size="sm" className="font-semibold text-slate-700 hover:bg-slate-100 gap-2">
               <User size={16} />
               Profile
             </Button>
          </div>
        </header>

        {/* Scrollable Main Area (Comfortable Padding) */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar content-breathable">
          <div className="p-8 lg:p-12 xl:p-16 max-w-[1400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeItem.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          className: 'border-border shadow-2xl rounded-2xl font-semibold text-sm',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            padding: '16px 24px',
            border: '1px solid #e2e8f0',
          },
          success: {
            iconTheme: { primary: '#4F001D', secondary: '#fff' },
          },
        }} 
      />
      
      {/* Global Processing Terminal */}
      <ProcessingModal 
        isOpen={isOpen}
        isMinimized={isMinimized}
        status={status}
        title={title}
        message={message}
        percentage={percentage}
        elapsedTime={elapsedTime}
        error={error}
        currentNode={currentNode}
        onClose={close}
        onMinimize={toggleMinimize}
      />
    </div>
  );
}

export default App;
