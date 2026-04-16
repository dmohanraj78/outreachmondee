import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import EmailFinder from './components/EmailFinder';
import InstantSearch from './components/InstantSearch';
import MailGenerator from './components/MailGenerator';
import EmailSender from './components/EmailSender';
import ActivityLog from './components/ActivityLog';
import Dashboard from './components/Dashboard';
import LeadCapture from './components/LeadCapture';
import Pricing from './components/Pricing';
import AIDoctor from './components/AIDoctor';
import IntelligenceHub from './components/IntelligenceHub';
import { 
  LayoutDashboard, 
  Search, 
  Zap, 
  PenTool, 
  Send, 
  History, 
  Menu, 
  X, 
  FileText, 
  Stethoscope,
  ChevronRight,
  Bell,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { cn } from './lib/utils';
import { ProcessProvider, useProcess } from './context/ProcessContext';
import ProcessingModal from './components/ui/ProcessingModal';
import axios from 'axios';

// Infinite network resilience for long-running n8n extraction tasks
axios.defaults.timeout = 0;

const MONDEE_LOGO = "https://www.mondee.com/app/uploads/2026/03/Mondee_logo.svg";

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    label: 'Discovery',
    items: [
      { id: 'finder', label: 'Lead Finder', icon: Search, path: '/finder' },
      { id: 'capture', label: 'Capture Form', icon: FileText, path: '/capture' },
      { id: 'instant', label: 'Instant Search', icon: Zap, path: '/instant' },
    ]
  },
  {
    label: 'Outreach',
    items: [
      { id: 'generator', label: 'AI Personalization', icon: PenTool, path: '/generator' },
      { id: 'sender', label: 'Mail Sender', icon: Send, path: '/sender' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'intelligence', label: 'Intelligence Hub', icon: Sparkles, path: '/intelligence' },
      { id: 'doctor', label: 'AI Doctor', icon: Stethoscope, path: '/doctor' },
      { id: 'log', label: 'Activity Log', icon: History, path: '/log' },
    ]
  }
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

function App() {
  return (
    <ProcessProvider>
      <Routes>
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="finder" element={<EmailFinder />} />
          <Route path="capture" element={<LeadCapture />} />
          <Route path="instant" element={<InstantSearch />} />
          <Route path="generator" element={<MailGenerator />} />
          <Route path="sender" element={<EmailSender />} />
          <Route path="intelligence" element={<IntelligenceHub />} />
          <Route path="doctor" element={<AIDoctor />} />
          <Route path="log" element={<ActivityLog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <GlobalUI />
    </ProcessProvider>
  );
}

function GlobalUI() {
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
    close
  } = useProcess();

  return (
    <>
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          className: 'border shadow-lg rounded-lg font-medium text-sm',
          style: { background: '#ffffff', color: '#0f172a', padding: '14px 20px', border: '1px solid #e2e8f0' },
          success: { iconTheme: { primary: '#4F001D', secondary: '#fff' } },
        }} 
      />
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
    </>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { 
    isOpen, 
    isMinimized, 
    status, 
    elapsedTime,
    currentNode, 
    toggleMinimize
  } = useProcess();

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

  const activeItem = ALL_NAV_ITEMS.find(item => 
    item.path === location.pathname || (item.path === '/' && location.pathname === '/')
  ) || ALL_NAV_ITEMS[0];

  // Breadcrumb
  const activeSection = NAV_SECTIONS.find(s => s.items.some(i => i.id === activeItem.id));

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900 font-sans flex overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "sidebar-stable z-[50] flex flex-col",
          isMobile && "fixed inset-y-0 left-0",
          isSidebarOpen ? "w-[260px]" : "w-0 -translate-x-full lg:w-[68px] lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={MONDEE_LOGO} 
              alt="Mondee" 
              className={cn("h-7 w-auto invert brightness-0 opacity-90 transition-all", !isSidebarOpen && "lg:h-6")}
              onError={(e) => { e.target.onerror = null; e.target.src = "https://www.mondee.com/wp-content/uploads/2021/08/mondee-logo-white.png"; }}
            />
          </div>
          {isSidebarOpen && !isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-md hover:bg-white/5"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar-dark">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="mb-1">
              {isSidebarOpen && (
                <div className="px-3 py-2 mt-2 first:mt-0">
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">{section.label}</span>
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative mb-0.5",
                      isActive 
                        ? "bg-white/12 text-white" 
                        : "text-white/50 hover:bg-white/6 hover:text-white/80"
                    )}
                    title={!isSidebarOpen ? item.label : ""}
                  >
                    <Icon 
                      size={18} 
                      className={cn(
                        "flex-shrink-0 transition-colors", 
                        isActive ? "text-white" : "text-white/30 group-hover:text-white/60"
                      )} 
                    />
                    {isSidebarOpen && (
                      <span className="text-[13px] font-medium truncate">{item.label}</span>
                    )}
                    {isActive && isSidebarOpen && (
                      <ChevronRight size={14} className="ml-auto text-white/30" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/8 mt-auto">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-semibold text-white/80">DM</div>
              <div className="truncate flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white/80 truncate">Dhanush</div>
                <div className="text-[10px] text-white/30 font-medium">Admin</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-semibold text-white/80">DM</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between flex-shrink-0 z-[40]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              {activeSection && activeSection.label !== 'Overview' && (
                <>
                  <span className="text-slate-400 font-medium">{activeSection.label}</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </>
              )}
              <span className="text-slate-900 font-semibold">{activeItem.label}</span>
            </div>
          </div>

          {/* Process indicator */}
          {isOpen && isMinimized && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-4 py-1.5 cursor-pointer hover:bg-slate-100 transition-all"
              onClick={toggleMinimize}
            >
              <div className="relative w-10 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0.1 }} 
                  animate={{ opacity: [0.1, 0.25, 0.1] }} 
                  transition={{ duration: 2, repeat: Infinity }} 
                  className={cn("absolute inset-0", status === 'error' ? "bg-red-500" : "bg-primary")} 
                />
                <span className={cn("relative text-[9px] font-semibold tabular-nums", status === 'error' ? "text-red-500" : "text-primary")}>
                  {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-700 leading-none">
                  {status === 'error' ? "Halted" : "Processing…"}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[100px]">{currentNode}</span>
              </div>
            </motion.div>
          )}
          
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto content-breathable">
          <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-[1280px]">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
