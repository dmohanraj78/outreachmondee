import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle,
  Play,
  Settings,
  Database
} from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const AutomationHub = () => {
  const [loading, setLoading] = useState({
    discovery: false,
    personalization: false,
    outreach: false
  });
  const [counts, setCounts] = useState({
    queries: 0,
    verified: 0,
    ready: 0,
    sent: 0
  });

  const fetchData = async () => {
    try {
      // Queries
      const qRes = await axios.get(N8N_CONFIG.GET_QUERIES_WEBHOOK);
      const qCount = Array.isArray(qRes.data) ? qRes.data.length : 0;

      // Leads
      const lRes = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      const lData = Array.isArray(lRes.data) ? lRes.data : [];
      const vCount = lData.length;

      // Drafts
      const dRes = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      const dData = Array.isArray(dRes.data) ? dRes.data : [];
      const rCount = dData.filter(d => !(d.status || d.Status || "").trim() && (d.subject || d.Subject)).length;
      const sCount = dData.filter(d => (d.status || d.Status) === "Sent").length;

      setCounts({
        queries: qCount,
        verified: vCount,
        ready: rCount,
        sent: sCount
      });
    } catch (e) {
      console.error("Fetch data failed", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerWorkflow = async (stage, webhook) => {
    setLoading(prev => ({ ...prev, [stage]: true }));
    try {
      await axios.post(webhook);
      setTimeout(() => {
        setLoading(prev => ({ ...prev, [stage]: false }));
        fetchData();
      }, 5000);
    } catch (e) {
      alert(`Failed to trigger ${stage} workflow.`);
      setLoading(prev => ({ ...prev, [stage]: false }));
    }
  };

  const PipelineStep = ({ icon: Icon, title, subtitle, count, actionLabel, onAction, isLoading, stage }) => (
    <div className="card" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between',
      minHeight: '280px',
      borderTop: `4px solid ${stage === 'discovery' ? 'var(--primary)' : stage === 'personalization' ? 'var(--accent)' : '#006644'}`
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--n10)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Icon size={24} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--n800)', opacity: 0.2 }}>{count}</div>
        </div>
        <h3 style={{ marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--n100)', lineHeight: '1.5' }}>{subtitle}</p>
      </div>
      
      <button 
        onClick={onAction} 
        disabled={isLoading || count === 0 && stage !== 'discovery'}
        style={{ 
          width: '100%', 
          marginTop: '24px',
          background: stage === 'discovery' ? 'var(--primary)' : stage === 'personalization' ? 'var(--accent)' : '#006644'
        }}
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
        {isLoading ? 'Running Node...' : actionLabel}
      </button>
    </div>
  );

  return (
    <div className="view-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Automation Hub</h1>
          <p className="subtitle">Orchestrate your end-to-end Miraee Agentic OS "Super-Flow".</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button className="btn-secondary"><Settings size={16} /> Configure Chain</button>
           <button style={{ background: 'var(--accent)' }} onClick={() => triggerWorkflow('discovery', N8N_CONFIG.FINDER_WEBHOOK)}>
             <Zap size={18} /> Auto-Pilot All
           </button>
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <PipelineStep 
          stage="discovery"
          icon={Search} 
          title="Lead Discovery" 
          subtitle={`Running ${counts.queries} queries to find management-tier prospects.`}
          count={counts.queries}
          actionLabel="Run Discovery Swarm"
          onAction={() => triggerWorkflow('discovery', N8N_CONFIG.FINDER_WEBHOOK)}
          isLoading={loading.discovery}
        />
        <ArrowRight size={32} color="var(--n30)" style={{ flexShrink: 0 }} />
        <PipelineStep 
          stage="personalization"
          icon={Sparkles} 
          title="AI Personalization" 
          subtitle={`${counts.verified} leads waiting for hyper-personalized drafts.`}
          count={counts.verified}
          actionLabel="Personalize Leads"
          onAction={() => triggerWorkflow('personalization', N8N_CONFIG.PERSONALIZATION_WEBHOOK)}
          isLoading={loading.personalization}
        />
        <ArrowRight size={32} color="var(--n30)" style={{ flexShrink: 0 }} />
        <PipelineStep 
          stage="outreach"
          icon={Send} 
          title="Smart Outreach" 
          subtitle={`${counts.ready} drafts ready to be sent via Gmail/LinkedIn.`}
          count={counts.ready}
          actionLabel="Execute Campaign"
          onAction={() => triggerWorkflow('outreach', N8N_CONFIG.SENDER_WEBHOOK)}
          isLoading={loading.outreach}
        />
      </div>

      <div className="card" style={{ background: 'var(--n800)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>Pipeline Success</h3>
            <p style={{ color: 'var(--n40)', margin: 0 }}>{counts.sent} total conversions completed in this cycle.</p>
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '24px', fontWeight: 800 }}>{Math.round((counts.sent / (counts.verified || 1)) * 100)}%</div>
               <div style={{ fontSize: '11px', color: 'var(--n100)', textTransform: 'uppercase' }}>Conv. Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '24px', fontWeight: 800 }}>{counts.sent}</div>
               <div style={{ fontSize: '11px', color: 'var(--n100)', textTransform: 'uppercase' }}>Closed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationHub;
