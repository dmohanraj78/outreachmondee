import React, { useState } from 'react';
import { Shield, Target, Users, Zap, LayoutDashboard, Database } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import LinkedInAuthority from './components/LinkedInAuthority';
import CloserAgent from './components/CloserAgent';
import { Badge } from './components/ui/Badge';
import { cn } from './lib/utils';
import { ProcessProvider } from './context/ProcessContext.jsx';
import { useProcessTracking } from './hooks/useProcessTracking.js';
import ProcessingModal from './components/ui/ProcessingModal.jsx';

function AppContent() {
  const [activeTab, setActiveTab] = useState('linkedin');
  const { modalProps } = useProcessTracking();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#4F001D] text-white flex flex-col border-r border-white/5 flex-shrink-0 sticky top-0 h-screen">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              <Zap className="text-white fill-white/20" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">AGENTIC</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">LinkedIn Suite</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-grow space-y-2 mt-4">
          <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Core Modules</p>
          
          <button 
            onClick={() => setActiveTab('linkedin')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold whitespace-nowrap overflow-hidden",
              activeTab === 'linkedin' ? "bg-white/10 text-white shadow-lg shadow-black/10" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Shield className={cn("transition-colors", activeTab === 'linkedin' ? "text-accent" : "text-white/30 group-hover:text-white/60")} size={20} />
            <span>LinkedIn Authority</span>
          </button>

          <button 
            onClick={() => setActiveTab('closer')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold whitespace-nowrap overflow-hidden",
              activeTab === 'closer' ? "bg-white/10 text-white shadow-lg shadow-black/10" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Target className={cn("transition-colors", activeTab === 'closer' ? "text-accent" : "text-white/30 group-hover:text-white/60")} size={20} />
            <span>Closer Agent</span>
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                <Database className="text-emerald-400" size={16} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Network Status</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/40">n8n Cluster</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500/50" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] uppercase font-bold py-1">Standalone Mode</Badge>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {activeTab === 'linkedin' ? <LinkedInAuthority /> : <CloserAgent />}
        </div>
      </main>

      <Toaster position="top-right" />
      <ProcessingModal {...modalProps} />
    </div>
  );
}

function App() {
  return (
    <ProcessProvider>
      <AppContent />
    </ProcessProvider>
  );
}

export default App;
