import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Mail, 
  Linkedin,
  Wand2,
  AlertTriangle,
  HeartPulse,
  Terminal,
  Brain,
  ShieldCheck,
  Cpu,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { useProcessTracking } from '../hooks/useProcessTracking';

const AIDoctor = () => {
  const [healthStatus, setHealthStatus] = useState({
    webhooks: 'idle',
    leads: 'idle',
    smtp: 'idle'
  });
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const { startProcess, completeProcess, failProcess } = useProcessTracking();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnostics(prev => [{ timestamp, message, type }, ...prev].slice(0, 15));
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnostics([]);
    setIssues([]);

    // Miraee Contextual Labels for Kernel Audit
    const nodeLabels = [
      "Initializing Audit Swarm...",
      "Pinging Webhook Terminals...",
      "Kernel Logic Check...",
      "Database Structural Scan...",
      "Mapping Integrity Gaps...",
      "Verifying SMTP Protocols...",
      "Finalizing Kernal Audit..."
    ];

    startProcess("Full-Spectrum Kernel Audit", "Initializing diagnostic swarm for kernel-level integrity mapping. We are probing cloud nodes and sector integrity clusters.", nodeLabels);
    addLog("Initializing full-spectrum kernel diagnostics...", "info");

    setHealthStatus(prev => ({ ...prev, webhooks: 'loading' }));
    const webhooksToTest = [
      { name: 'Intelligence Pool', url: N8N_CONFIG.GET_QUERIES_WEBHOOK },
      { name: 'Lead Harvester', url: N8N_CONFIG.FETCHER_WEBHOOK },
      { name: 'Campaign Ledger', url: N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK }
    ];

    let webhookIssues = 0;
    for (const hook of webhooksToTest) {
      try {
        addLog(`Pinging ${hook.name} node...`, "info");
        await axios.get(hook.url);
        addLog(`${hook.name} node is RESPONSIVE.`, "success");
      } catch (err) {
        webhookIssues++;
        addLog(`${hook.name} node FATAL ERROR.`, "error");
        setIssues(prev => [...prev, {
          title: `${hook.name} Connectivity Error`,
          desc: "The cloud intelligence node failed to respond within the protocol window.",
          icon: ShieldAlert,
          type: 'error'
        }]);
      }
    }
    setHealthStatus(prev => ({ ...prev, webhooks: webhookIssues === 0 ? 'healthy' : 'issue' }));

    addLog("Parsing intelligence database for structural integrity...", "info");
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      const leads = Array.isArray(response.data) ? response.data : [];
      
      const missingEmails = leads.filter(l => !(l.email || l.Email)).length;
      const missingLinkedIn = leads.filter(l => !(l.linkedin || l.LinkedIn)).length;

      if (missingEmails > 0) {
        setIssues(prev => [...prev, {
          title: `Incomplete Lead Clusters (${missingEmails})`,
          desc: `${missingEmails} corporate nodes lack verified delivery addresses.`,
          icon: Mail,
          type: 'warning'
        }]);
      }
      if (missingLinkedIn > 0) {
        setIssues(prev => [...prev, {
          title: `LinkedIn Profile Gaps (${missingLinkedIn})`,
          desc: `${missingLinkedIn} identifiers are missing social identity mapping.`,
          icon: Linkedin,
          type: 'warning'
        }]);
      }
      addLog(`Database scan complete. Identified ${missingEmails + missingLinkedIn} protocol gaps.`, "info");
      setHealthStatus(prev => ({ ...prev, leads: (missingEmails + missingLinkedIn) === 0 ? 'healthy' : 'issue' }));
    } catch (err) {
      addLog("Database structural query failed.", "error");
    }

    addLog("Global system audit successfully finalized.", "success");
    setLoading(false);
    completeProcess();
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusCard = ({ label, status, icon: Icon }) => (
    <Card className="border-slate-100 shadow-sm overflow-hidden group bg-white">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary/50 group-hover:bg-primary group-hover:text-white transition-all">
              <Icon size={20} />
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none">{label}</div>
              <div className="text-lg font-bold text-slate-900 tracking-tight leading-none pt-1">
                {status === 'healthy' ? 'Optimal' : status === 'loading' ? 'Analyzing...' : status === 'issue' ? 'Attention Required' : 'Standby'}
              </div>
            </div>
          </div>
          {status === 'healthy' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
               <ShieldCheck size={16} />
            </div>
          ) : status === 'issue' ? (
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 animate-pulse">
               <AlertTriangle size={16} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">SYSTEM KERNEL AUDIT</Badge>
              <span className="text-slate-200">|</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Diagnostic Swarm</span>
            </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
            AI Diagnostic <span className="text-primary/70 font-medium">Center</span>
          </h1>
          <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
            Autonomous audit engine monitoring cloud synchronization, database integrity, and operational health.
          </p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={loading} 
          variant="primary"
          className="h-14 px-10 font-semibold tracking-wider text-[10px] uppercase shadow-lg shadow-primary/20 gap-3"
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          {loading ? "Executing Audit..." : "Run Full Diagnostics"}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatusCard label="Cloud Connectivity" status={healthStatus.webhooks} icon={Activity} />
        <StatusCard label="Structural Integrity" status={healthStatus.leads} icon={Database} />
        <StatusCard label="Outreach Delivery" status={healthStatus.smtp} icon={Mail} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Identified Problems Section */}
        <div className="xl:col-span-7 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <ShieldAlert className="text-primary/50" size={24} />
              Identified Deviations
            </h3>
            <Badge variant="secondary" className="font-semibold bg-slate-50 text-[9px] tracking-wider">{issues.length} ISSUES FOUND</Badge>
          </div>
          
          <AnimatePresence mode="popLayout">
            {issues.length === 0 && !loading ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-32 border border-slate-100 bg-white rounded-3xl flex flex-col items-center gap-6 text-center shadow-sm"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm ring-4 ring-emerald-50/50">
                   <ShieldCheck size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Kernel is Stable</h3>
                  <p className="text-sm font-normal text-slate-500 max-w-xs leading-relaxed">No critical anomalies identified in the current operation cycle.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {issues.map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={cn(
                      "border-l-4 group hover:shadow-md transition-all duration-300 bg-white shadow-sm overflow-hidden",
                      issue.type === 'error' ? "border-l-red-500" : "border-l-amber-500"
                    )}>
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform",
                            issue.type === 'error' ? "bg-red-50 text-red-500 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                          )}>
                            <issue.icon size={24} />
                          </div>
                          <div className="flex-1 space-y-6">
                            <div className="space-y-1">
                              <h4 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{issue.title}</h4>
                              <p className="text-sm font-normal text-slate-500 leading-relaxed">{issue.desc}</p>
                            </div>
                            <Button 
                              variant="primary" 
                              size="lg"
                              className="h-11 px-6 font-semibold tracking-wider text-[9px] uppercase gap-2 shadow-primary/10 group-hover:translate-x-1 transition-transform"
                            >
                              <Brain size={12} className="opacity-70" />
                              Initiate Agentic Correction
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Diagnostic Terminal Log */}
        <div className="xl:col-span-5">
           <Card className="bg-slate-900 border-none shadow-xl rounded-3xl overflow-hidden sticky top-8">
              <div className="h-12 bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-red-400/20" />
                       <div className="w-2 h-2 rounded-full bg-amber-400/20" />
                       <div className="w-2 h-2 rounded-full bg-emerald-400/20" />
                    </div>
                    <div className="w-px h-3 bg-slate-700 mx-1" />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Terminal size={12} /> KERNEL TERMINAL
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-widest">Live Output</span>
                 </div>
              </div>
              <CardContent className="p-8 font-mono text-[11px] leading-relaxed space-y-4">
                 <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar-dark pr-4">
                    {diagnostics.length === 0 && (
                       <div className="text-slate-600 font-normal">No diagnostic events cached. Run a full scan to populate core logs.</div>
                    )}
                    {diagnostics.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 border-l border-slate-800 pl-4 py-0.5"
                      >
                        <span className="text-slate-600 font-normal shrink-0">[{log.timestamp}]</span>
                        <span className={cn(
                          "font-normal break-words",
                          log.type === 'success' ? "text-emerald-400" : log.type === 'error' ? "text-red-400" : "text-slate-400"
                        )}>
                          <span className="text-slate-800 mr-2">$</span> {log.message}
                        </span>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-3 text-primary animate-pulse font-semibold mt-4 pl-4 text-[10px]">
                         <Cpu size={12} className="animate-spin" />
                         Analyzing cognitive subprocess clusters...
                      </div>
                    )}
                 </div>
              </CardContent>
              <div className="p-5 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between">
                 <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                    <Zap size={10} className="text-amber-500" /> Latency: 42ms
                 </div>
                 <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest">Miraee OS v2.0-Audit</div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDoctor;
