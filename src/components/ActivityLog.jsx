import React, { useState, useEffect } from 'react';
import { History, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      // Only show "Sent" emails in the log
      const sentItems = (Array.isArray(response.data) ? response.data : [])
        .filter(item => (item.status || item.Status) === "Sent")
        .reverse(); // Show newest first
      setLogs(sentItems);
    } catch (error) {
      console.error("Fetch logs failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="view-container">
      <header>
        <h1>Activity Log</h1>
        <p className="subtitle">Permanent record of all successfully delivered email campaigns.</p>
      </header>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div className="card-title" style={{ marginBottom: '8px' }}>Outreach Success History</div>
            <div className="subtitle">{logs.length} successfully delivered emails recorded</div>
          </div>
          <button onClick={fetchLogs} className="btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
            Refresh History
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Campaign Subject</th>
              <th>Status</th>
              <th>Date Delivered</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '64px', color: 'var(--n100)', background: 'var(--n10)' }}>
                  <History size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <div>No sent messages found in your process history.</div>
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--n800)' }}>{log.name || log.Name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--n100)' }}>{log.email || log.Email}</div>
                  </td>
                  <td style={{ color: 'var(--n500)' }}>
                    {log.subject || log.Subject}
                  </td>
                  <td>
                    <span className="status-badge status-success">Delivered</span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--n100)' }}>
                    {log.timestamp || "Today"}
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

export default ActivityLog;
