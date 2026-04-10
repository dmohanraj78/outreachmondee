import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw, Send, FileText } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';
import EmptyState from './EmptyState';

const MailGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [pendingLeads, setPendingLeads] = useState([]);

  // Fetch leads waiting for personalization
  const fetchPending = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      setPendingLeads(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error(e); }
  };

  // Fetch final drafts from the "With Content" sheet
  const fetchDrafts = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      setDrafts(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPending();
    fetchDrafts();

    // Poll for updates every 15 seconds if nothing is loading
    const interval = setInterval(() => {
      fetchPending();
      fetchDrafts();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateAll = async () => {
    setLoading(true);
    try {
      await axios.post(N8N_CONFIG.PERSONALIZATION_WEBHOOK);
      // Keep loading as true for a few seconds to account for n8n processing start
      setTimeout(() => {
        setLoading(false);
        fetchPending();
        fetchDrafts();
      }, 5000);
      alert("AI personalization started! The dashboard will refresh automatically.");
    } catch (error) {
      alert("Failed to start personalization: " + (error.message || error.toString()));
      setLoading(false);
    }
  };

  // Filter leads to ONLY those that don't have a valid draft yet
  const filteredPending = pendingLeads.filter(lead => {
    const leadEmail = (lead.email || lead.Email || "").toLowerCase();
    // Only exclude if there is a draft that HAS content or is Sent
    return !drafts.some(draft => 
      (draft.email || draft.Email || "").toLowerCase() === leadEmail && 
      (draft.subject || draft.Subject || draft.email_body || draft.Body || (draft.status || draft.Status) === "Sent")
    );
  });

  const validDrafts = drafts.filter(d => 
    (d.subject || d.Subject || d.email_body || d.Body || (d.status || d.Status) === "Sent")
  );

  return (
    <div className="view-container">
      <header>
        <h1>AI Personalization</h1>
        <p className="subtitle">Transform verified leads into high-converting personalized email drafts.</p>
      </header>

      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="card-title">Pending Personalization</div>
            <div className="subtitle">{filteredPending.length} leads ready for AI drafting</div>
          </div>
          <button 
            onClick={handleGenerateAll} 
            disabled={loading || filteredPending.length === 0}
            style={{ background: 'var(--accent)' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? 'Processing...' : 'Generate AI Drafts'}
          </button>
        </div>

        {filteredPending.length > 0 ? (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Company</th>
                  <th>Execution Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{l.name || l.Name}</td>
                    <td>{l.company || l.Company}</td>
                    <td><span className="status-badge status-neutral">Ready</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            icon={Sparkles}
            title="All Caught Up!"
            message="No leads waiting for personalization. Great job!"
          />
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Generated Drafts ({validDrafts.length})</div>
          <button onClick={fetchDrafts} className="btn-secondary">
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>
        
        {validDrafts.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No Drafts Ready"
            message="Your AI-generated email drafts will appear here once you trigger the personalization process."
          />
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {validDrafts.map((d, i) => {
              const isSent = (d.status || d.Status) === "Sent";
              return (
                <div key={i} style={{ border: '1px solid var(--n30)', borderRadius: '4px', padding: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                       <div style={{ width: '32px', height: '32px', background: 'var(--n40)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--n800)', fontWeight: 700, fontSize: '13px' }}>
                        {(d.name || d.Name || "?")[0]}
                       </div>
                       <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--n800)' }}>{d.name || d.Name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--n100)' }}>{d.email || d.Email} • {d.company || d.Company}</div>
                       </div>
                    </div>
                    <span className={`status-badge ${isSent ? 'status-success' : (d.subject || d.Subject || d.email_body || d.Body) ? 'status-warning' : 'status-neutral'}`}>
                       {isSent ? 'Sent' : (d.subject || d.Subject || d.email_body || d.Body) ? 'Draft Ready' : 'AI Processing'}
                    </span>
                  </div>
                  
                  <div style={{ padding: '16px', background: 'var(--n10)', borderRadius: '4px', borderLeft: '3px solid var(--n40)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n100)', textTransform: 'uppercase', marginBottom: '12px' }}>Personalized Message</div>
                    <div style={{ fontSize: '13px', color: 'var(--n800)' }}>
                      <strong>Subject:</strong> {d.subject || d.Subject}
                      <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{d.email_body || d.Body}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MailGenerator;
