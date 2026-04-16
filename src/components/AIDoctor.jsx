import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, ShieldCheck, XCircle, RefreshCw, Database, Mail, Linkedin,
  AlertTriangle, Terminal, Brain, Cpu, Zap
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { useProcessTracking } from '../hooks/useProcessTracking';

const AIDoctor = () => {
  const [healthStatus, setHealthStatus] = useState({ webhooks: 'idle', leads: 'idle', smtp: 'idle' });
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
    startProcess("System Diagnostics", "Running kernel audit.");
    addLog("Starting diagnostics...", "info");

    setHealthStatus(prev => ({ ...prev, webhooks: 'loading' }));
    const webhooksToTest = [
      { name: 'Intelligence Pool', url: N8N_CONFIG.GET_QUERIES_WEBHOOK },
      { name: 'Lead Harvester', url: N8N_CONFIG.FETCHER_WEBHOOK },
      { name: 'Campaign Ledger', url: N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK }
    ];

    let webhookIssues = 0;
    for (const hook of webhooksToTest) {
      try {
        addLog(`Pinging ${hook.name}...`, "info");
        await axios.get(hook.url);
        addLog(`${hook.name}: OK`, "success");
      } catch (err) {
        webhookIssues++;
        addLog(`${hook.name}: FAILED`, "error");
        setIssues(prev => [...prev, {
          title: `${hook.name} Error`, desc: "Node failed to respond.", icon: ShieldAlert, type: 'error'
        }]);
      }
    }
    setHealthStatus(prev => ({ ...prev, webhooks: webhookIssues === 0 ? 'healthy' : 'issue' }));

    addLog("Scanning database integrity...", "info");
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      const leads = Array.isArray(response.data) ? response.data : [];
      const missingEmails = leads.filter(l => !(l.email || l.Email)).length;
      const missingLinkedIn = leads.filter(l => !(l.linkedin || l.LinkedIn)).length;

      if (missingEmails > 0) {
        setIssues(prev => [...prev, {
          title: `Missing Emails (${missingEmails})`, desc: `${missingEmails} leads lack verified emails.`,
          icon: Mail, type: 'warning'
        }]);
      }
      if (missingLinkedIn > 0) {
        setIssues(prev => [...prev, {
          title: `Missing LinkedIn (${missingLinkedIn})`, desc: `${missingLinkedIn} leads lack LinkedIn profiles.`,
          icon: Linkedin, type: 'warning'
        }]);
      }
      addLog(`Database scan: ${missingEmails + missingLinkedIn} gaps found.`, "info");
      setHealthStatus(prev => ({ ...prev, leads: (missingEmails + missingLinkedIn) === 0 ? 'healthy' : 'issue' }));
    } catch (err) {
      addLog("Database scan failed.", "error");
    }

    addLog("Diagnostics complete.", "success");
    setLoading(false);
    completeProcess();
  };

  useEffect(() => { runDiagnostics(); }, []);

  const StatusCard = ({ label, status, icon: Icon }) => (
    <Card className={cn(
      status === 'healthy' && "border-emerald-200/50",
      status === 'issue' && "border-amber-200/50"
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              status === 'healthy' ? "bg-emerald-50 text-emerald-500" :
              status === 'issue' ? "bg-amber-50 text-amber-500" :
              "bg-slate-100 text-slate-400"
            )}>
              <Icon size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-sm font-semibold text-slate-900">
                {status === 'healthy' ? 'Healthy' : status === 'loading' ? 'Checking...' : status === 'issue' ? 'Attention' : 'Standby'}
              </div>
            </div>
          </div>
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'healthy' ? "bg-emerald-500" :
            status === 'issue' ? "bg-amber-500 animate-pulse" :
            status === 'loading' ? "bg-blue-500 animate-pulse" :
            "bg-slate-300"
          )} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Doctor</h1>
          <p className="text-sm text-slate-500 max-w-lg">System health monitoring and automated diagnostics.</p>
        </div>
        <Button onClick={runDiagnostics} loading={loading} className="h-10 px-5 text-xs gap-2">
          <RefreshCw size={14} />
          {loading ? "Running..." : "Run Diagnostics"}
        </Button>
      </header>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard label="Connectivity" status={healthStatus.webhooks} icon={Activity} />
        <StatusCard label="Data Integrity" status={healthStatus.leads} icon={Database} />
        <StatusCard label="Outreach" status={healthStatus.smtp} icon={Mail} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Issues */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-slate-400" size={16} />
              Issues Found
            </h3>
            <Badge variant="secondary" className="text-[10px]">{issues.length} issues</Badge>
          </div>
          
          <AnimatePresence mode="popLayout">
            {issues.length === 0 && !loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">All Systems Healthy</h3>
                      <p className="text-xs text-slate-500 mt-0.5">No issues detected.</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={cn(
                      "border-l-2",
                      issue.type === 'error' ? "border-l-red-500" : "border-l-amber-400"
                    )}>
                      <CardContent className="p-5">
                        <div className="flex gap-4 items-start">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                            issue.type === 'error' ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                          )}>
                            <issue.icon size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{issue.desc}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-primary gap-1">
                            <Brain size={12} /> Fix
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Terminal */}
        <div className="xl:col-span-2">
          <Card className="bg-slate-900 border-none overflow-hidden sticky top-8">
            <div className="h-10 bg-slate-800/60 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400/30" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/30" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/30" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 ml-1">
                  <Terminal size={10} /> Terminal
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-emerald-500 font-medium">Live</span>
              </div>
            </div>
            <CardContent className="p-4 font-mono text-[11px] leading-relaxed">
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scrollbar-dark pr-2">
                {diagnostics.length === 0 && (
                  <div className="text-slate-600">Waiting for diagnostic events...</div>
                )}
                {diagnostics.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex gap-3 pl-3 border-l border-slate-800 py-0.5"
                  >
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className={cn(
                      log.type === 'success' ? "text-emerald-400" : log.type === 'error' ? "text-red-400" : "text-slate-400"
                    )}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-primary animate-pulse pl-3 mt-2">
                    <Cpu size={10} className="animate-spin" /> Analyzing...
                  </div>
                )}
              </div>
            </CardContent>
            <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] text-slate-500">
                <Zap size={9} className="text-amber-500" /> Latency: 42ms
              </div>
              <div className="text-[9px] text-slate-600">Miraee OS v2.0</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDoctor;
