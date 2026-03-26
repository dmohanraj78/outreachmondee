import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Mail, 
  MessageSquare, 
  ChevronRight, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp,
  History,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const DripManager = () => {
  const [activeDrip, setActiveDrip] = useState(true);
  const [enrollees, setEnrollees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Synchronized Drip Sequence Data (Matches n8n logic)
  const [steps, setSteps] = useState([
    { id: 1, name: 'Initial AI Outreach', delay: 'Completed', subject: '={{ $json.subject }}', body: '={{ $json.email_body }}', status: 'sent', aiContext: false },
    { id: 2, name: 'Follow-up: The Evidence', delay: '24 Hours', subject: 'Re: {{ $json.subject }}', body: "AI-Generated based on 'Initial AI Outreach' context...", status: 'active', aiContext: true }
  ]);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      setEnrollees(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleResumeCampaign = async () => {
    setLoading(true);
    try {
      await axios.post(N8N_CONFIG.DRIP_ENROLL_WEBHOOK);
      alert('Campaign Resume Signal Sent to n8n! 🚀');
      fetchLeads();
    } catch (e) {
      console.error(e);
      alert('Failed to connect to n8n. Check if your webhook is active.');
    } finally {
      setLoading(false);
    }
  };

  const DripStep = ({ step, index }) => (
    <div style={{ position: 'relative' }}>
      <div className="card" style={{ 
        marginBottom: 0, 
        borderLeft: `4px solid ${step.status === 'active' ? 'var(--accent)' : 'var(--n40)'}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <span style={{ 
              width: '32px', 
              height: '32px', 
              minWidth: '32px',
              borderRadius: '50%', 
              background: 'var(--primary)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 800
            }}>{index + 1}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{step.name}</h3>
                {step.status === 'sent' && (
                  <span style={{ 
                    fontSize: '9px', 
                    background: '#006644', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}>INITIAL SENT</span>
                )}
                {step.aiContext && (
                  <span style={{ 
                    fontSize: '9px', 
                    background: 'var(--accent)', 
                    color: 'var(--n800)', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}>AI CONTEXT ACTIVE</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--n100)', fontSize: '11px', marginTop: '2px' }}>
                <Clock size={12} /> {step.status === 'sent' ? 'Execution Completed' : `Wait Duration: ${step.delay}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="btn-secondary" style={{ padding: '0 12px', fontSize: '11px', height: '32px', whiteSpace: 'nowrap' }}>Edit Logic</button>
             <button className="btn-secondary" style={{ padding: '0 8px', height: '32px' }}><Settings size={14} /></button>
          </div>
        </div>
        
        <div style={{ background: 'var(--n10)', padding: '16px', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--n20)' }}>
          <div style={{ marginBottom: '8px', color: 'var(--n800)' }}><strong>Subject:</strong> {step.subject}</div>
          <div style={{ color: 'var(--n500)', fontStyle: 'italic', lineHeight: '1.5' }}>"{step.body}"</div>
        </div>
      </div>

      {index < steps.length - 1 && (
        <div style={{ 
          padding: '20px 0 20px 52px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ 
            width: '2px', 
            height: '40px', 
            background: 'linear-gradient(to bottom, var(--primary), var(--accent))' 
          }}></div>
          <div style={{ 
            background: 'var(--n10)', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '10px', 
            fontWeight: 700, 
            color: 'var(--primary)',
            border: '1px solid var(--n20)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={12} /> SMART GUARD: 24H WAIT + REPLY CHECK ACTIVE
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="view-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Drip Campaign Manager</h1>
          <p className="subtitle">Set up multi-touch email sequences that stop once a lead replies.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleResumeCampaign}
            disabled={loading}
            style={{ 
              background: loading ? 'var(--n30)' : (activeDrip ? '#006644' : 'var(--primary)'), 
              padding: '12px 28px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? <Clock className="animate-spin" size={18} /> : (activeDrip ? <Pause size={18} /> : <Play size={18} />)}
              {loading ? 'Connecting...' : (activeDrip ? 'Campaign Active' : 'Resume Campaign')}
            </div>
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
        {/* Sequence List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {steps.map((step, i) => (
            <DripStep key={step.id} step={step} index={i} />
          ))}
          <button style={{ 
            background: 'transparent', 
            border: '2px dashed var(--n30)', 
            color: 'var(--n100)', 
            padding: '24px',
            width: '100%'
          }}>
            <Plus size={20} /> Add Follow-up Step
          </button>
        </div>

        {/* Analytics & Enrollees */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
             <div className="card-title" style={{ color: 'white', marginBottom: '24px' }}>
               <TrendingUp size={20} color="var(--accent)" />
               Sequence Performance
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                   <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>{enrollees.length}</div>
                   <div style={{ fontSize: '10px', color: 'var(--n40)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Active Enrollees</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                   <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>84%</div>
                   <div style={{ fontSize: '10px', color: 'var(--n40)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Open Rate</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                   <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>12</div>
                   <div style={{ fontSize: '10px', color: 'var(--n40)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px', whiteSpace: 'nowrap' }}>Replies Found</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                   <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>4</div>
                   <div style={{ fontSize: '10px', color: 'var(--n40)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Opt-outs</div>
                </div>
             </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: '20px' }}>
              <History size={18} color="var(--primary)" />
              Real-Time Enrolment Queue
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {enrollees.length === 0 && <div style={{ fontSize: '12px', color: 'var(--n100)', textAlign: 'center', padding: '20px' }}>No active enrollees found. Click Resume to start.</div>}
              {enrollees.slice(0, 8).map((l, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  background: l.replied === 'yes' ? 'var(--warning-bg)' : 'transparent',
                  borderRadius: '8px',
                  border: l.replied === 'yes' ? '1px solid var(--warning-text)' : '1px solid transparent'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: l.replied === 'yes' ? 'var(--warning-text)' : 'var(--n800)' }}>
                      {l.name || l.Name || l.email}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--n100)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {l.replied === 'yes' ? (
                        <><AlertCircle size={10} /> STOPPED: REPLY DETECTED</>
                      ) : (
                        <><Clock size={10} /> STEP 1 SENT • 24H WAIT ACTIVE</>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--n30)" />
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '20px', fontSize: '12px' }}>View Full History</button>
          </div>

          <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-text)' }}>
             <div style={{ display: 'flex', gap: '12px' }}>
                <AlertCircle size={20} color="var(--warning-text)" />
                <div>
                   <div style={{ fontWeight: 700, color: 'var(--warning-text)', fontSize: '14px', marginBottom: '4px' }}>Reply Detection Active</div>
                   <p style={{ fontSize: '12px', color: 'var(--n800)', margin: 0 }}>Sequence will automatically stop for any lead who responds to Email 1 or Email 2.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DripManager;
