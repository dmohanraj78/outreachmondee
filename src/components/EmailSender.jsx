import React, { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const EmailSender = () => {
  const [sending, setSending] = useState(false);
  const [campaignData, setCampaignData] = useState([]);

  // Fetch data from the "With Content" sheet to see who is ready/sent
  const fetchCampaignStatus = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      setCampaignData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch campaign failed", error);
    }
  };

  useEffect(() => {
    fetchCampaignStatus();
    
    // Auto-refresh every 10 seconds during campaign
    const interval = setInterval(fetchCampaignStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCampaign = async () => {
    setSending(true);
    try {
      await axios.post(N8N_CONFIG.SENDER_WEBHOOK);
      alert("Campaign started! n8n is now sending emails. Status will update automatically.");
    } catch (error) {
      alert("Failed to start campaign.");
    } finally {
      setSending(false);
    }
  };

  const readyToSend = campaignData.filter(l => !(l.status || l.Status || "").trim() && (l.subject || l.Subject || l.email_body || l.Body));
  const sentHistory = campaignData.filter(l => (l.status || l.Status) === "Sent");

  return (
    <div className="view-container">
      <header>
        <h1>Mail Sender</h1>
        <p className="subtitle">Launch your outreach campaign and monitor delivery status in real-time.</p>
      </header>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary)', border: 'none', padding: '40px' }}>
        <div style={{ flex: 1 }}>
          <div className="card-title" style={{ color: 'var(--n40)', marginBottom: '8px' }}>Launch Campaign</div>
          <h2 style={{ color: 'white', margin: 0 }}>Ready for Outreach</h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--n30)' }}>
            There are <strong>{readyToSend.length}</strong> personalized drafts awaiting delivery.
          </p>
        </div>
        <button 
          onClick={handleStartCampaign} 
          disabled={sending || readyToSend.length === 0}
          style={{ background: 'var(--accent)', padding: '16px 32px' }}
        >
          {sending ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
          {sending ? "Processing..." : "Start Campaign"}
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Pending Campaign Outreach ({readyToSend.length})</div>
          <button onClick={fetchCampaignStatus} className="btn-secondary">
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Subject Line</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {readyToSend.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '48px', color: 'var(--n100)', background: 'var(--n10)' }}>
                  No drafts ready for sending. Personalization is required first.
                </td>
              </tr>
            ) : (
              readyToSend.map((l, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--n800)' }}>{l.name || l.Name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--n100)' }}>{l.email || l.Email}</div>
                  </td>
                  <td style={{ color: 'var(--n500)' }}>{l.subject || "No Subject"}</td>
                  <td>
                    <span className="status-badge status-warning">
                       Awaiting Send
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailSender;
