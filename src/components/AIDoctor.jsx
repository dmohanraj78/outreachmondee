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
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const AIDoctor = () => {
  const [healthStatus, setHealthStatus] = useState({
    webhooks: 'idle',
    leads: 'idle',
    smtp: 'idle'
  });
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnostics(prev => [{ timestamp, message, type }, ...prev].slice(0, 10));
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnostics([]);
    setIssues([]);
    addLog("Starting full system diagnostics...", "info");

    // 1. Check Webhooks
    setHealthStatus(prev => ({ ...prev, webhooks: 'loading' }));
    let webhookIssues = 0;
    const webhooksToTest = [
      { name: 'Lead Finder', url: N8N_CONFIG.GET_QUERIES_WEBHOOK },
      { name: 'Lead Fetcher', url: N8N_CONFIG.FETCHER_WEBHOOK },
      { name: 'Mail History', url: N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK }
    ];

    for (const hook of webhooksToTest) {
      try {
        addLog(`Testing ${hook.name} connection...`, "info");
        await axios.get(hook.url);
        addLog(`${hook.name} is ONLINE.`, "success");
      } catch (err) {
        webhookIssues++;
        addLog(`${hook.name} connection FAILED.`, "error");
        setIssues(prev => [...prev, {
          title: `${hook.name} Unreachable`,
          desc: "The n8n webhook is not responding. Ensure n8n is running locally on port 5678.",
          icon: ShieldAlert,
          type: 'error'
        }]);
      }
    }
    setHealthStatus(prev => ({ ...prev, webhooks: webhookIssues === 0 ? 'healthy' : 'issue' }));

    // 2. Scan Lead Health
    addLog("Scanning lead database for data gaps...", "info");
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      const leads = Array.isArray(response.data) ? response.data : [];
      
      const missingEmails = leads.filter(l => !(l.email || l.Email)).length;
      const missingLinkedIn = leads.filter(l => !(l.linkedin || l.LinkedIn)).length;

      if (missingEmails > 0) {
        setIssues(prev => [...prev, {
          title: `Missing Emails (${missingEmails})`,
          desc: `${missingEmails} leads are missing verified emails. Run the 'Email Finder' workflow to enrich them.`,
          icon: Mail,
          type: 'warning'
        }]);
      }
      if (missingLinkedIn > 0) {
        setIssues(prev => [...prev, {
          title: `Missing LinkedIn Profiles (${missingLinkedIn})`,
          desc: `${missingLinkedIn} leads don't have a linked profile. Check your discovery parameters.`,
          icon: Linkedin,
          type: 'warning'
        }]);
      }
      addLog(`Lead scan complete. Found ${missingEmails + missingLinkedIn} data gaps.`, "info");
      setHealthStatus(prev => ({ ...prev, leads: (missingEmails + missingLinkedIn) === 0 ? 'healthy' : 'issue' }));
    } catch (err) {
      addLog("Could not scan lead database.", "error");
    }

    addLog("Diagnostics complete.", "success");
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusCard = ({ label, status, icon: Icon }) => (
    <div className="card" style={{ marginBottom: 0, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'var(--n10)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Icon size={18} color="var(--n100)" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--n100)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>
              {status === 'healthy' ? 'Healthy' : status === 'loading' ? 'Checking...' : status === 'issue' ? 'Action Needed' : 'Idle'}
            </div>
          </div>
        </div>
        {status === 'healthy' ? <CheckCircle size={20} color="#006644" /> : status === 'issue' ? <AlertTriangle size={20} color="var(--accent)" /> : null}
      </div>
    </div>
  );

  return (
    <div className="view-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>AI Diagnostic Center</h1>
          <p className="subtitle">Identify and solve system issues automatically with AI-driven troubleshooting.</p>
        </div>
        <button onClick={runDiagnostics} disabled={loading} className="btn-secondary">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? "Running..." : "Run Diagnostics"}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatusCard label="Engine Connectivity" status={healthStatus.webhooks} icon={Activity} />
        <StatusCard label="Data Integrity" status={healthStatus.leads} icon={Database} />
        <StatusCard label="Outreach Health" status={healthStatus.smtp} icon={Mail} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Issues List */}
        <div>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--accent)" />
            Identified Problems
          </h3>
          {issues.length === 0 && !loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '64px', background: 'var(--n10)', borderStyle: 'dashed' }}>
              <div style={{ color: 'var(--n100)', marginBottom: '16px' }}>No critical problems identified. Your OS is running smoothly!</div>
              <CheckCircle size={48} color="#006644" style={{ opacity: 0.2 }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {issues.map((issue, i) => (
                <div key={i} className="card" style={{ marginBottom: 0, borderLeft: `4px solid ${issue.type === 'error' ? 'var(--accent)' : 'var(--warning-text)'}` }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '8px', 
                      background: issue.type === 'error' ? '#FFF0F0' : 'var(--warning-bg)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <issue.icon size={22} color={issue.type === 'error' ? 'var(--accent)' : 'var(--warning-text)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{issue.title}</div>
                      <div style={{ fontSize: '14px', color: 'var(--n500)', marginBottom: '16px' }}>{issue.desc}</div>
                      <button style={{ 
                        padding: '6px 16px', 
                        fontSize: '12px', 
                        background: 'var(--primary)', 
                        textTransform: 'none',
                        letterSpacing: '0'
                      }}>
                        <Wand2 size={12} /> Solve with AI Assistant
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnostic Logs */}
        <div className="card" style={{ background: '#172B4D', color: 'white', border: 'none' }}>
          <div className="card-title" style={{ color: 'white', fontSize: '14px', marginBottom: '20px' }}>Diagnostic Logs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
            {diagnostics.map((log, i) => (
              <div key={i} style={{ opacity: 1 - (i * 0.1) }}>
                <span style={{ color: 'var(--n100)', marginRight: '8px' }}>[{log.timestamp}]</span>
                <span style={{ 
                  color: log.type === 'success' ? '#4BB543' : log.type === 'error' ? '#FF9494' : 'white' 
                }}>
                  {log.message}
                </span>
              </div>
            ))}
            {loading && <div className="animate-pulse">Analyzing system kernel...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDoctor;
