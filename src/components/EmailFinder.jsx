import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, RefreshCw, PlusCircle, CheckCircle, Trash2 } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const EmailFinder = () => {
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [newQuery, setNewQuery] = useState({ query: '', signal: 'Funding' });

  // 1. Fetch Google Sheet Queries (The source list)
  const fetchQueries = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.GET_QUERIES_WEBHOOK);
      setQueries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.warn("Could not fetch queries list. Ensure GET_QUERIES_WEBHOOK is set.");
    }
  };

  // 2. Fetch Verified Results (The final leads)
  const fetchRecentLeads = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch leads failed", error);
    }
  };

  useEffect(() => {
    fetchQueries();
    fetchRecentLeads();
  }, []);

  // 3. Add/Append new Query to Google Sheet via n8n
  const handleAddQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Saving query to n8n (GET):", { Query: newQuery.query, Signal: newQuery.signal });
      await axios.post(N8N_CONFIG.SAVE_QUERY_WEBHOOK, { 
        Query: newQuery.query, 
        Signal: newQuery.signal 
      });
      
      // Optimistic Update: Add to local state immediately
      const addedQuery = { Query: newQuery.query, Signal: newQuery.signal };
      setQueries(prev => [addedQuery, ...prev]);
      
      setNewQuery({ ...newQuery, query: '' });
      alert("Success! Source query added to Google Sheet.");
      
      // Refresh from source after 5 seconds to ensure n8n/Google Sheets is updated
      setTimeout(fetchQueries, 5000);
    } catch (error) {
      console.error("Save Query Error:", error);
      alert("Failed to append row. Please check if your n8n 'save-query' workflow is active and accepting GET requests.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Trigger the actual discovery workflow
  const handleTriggerDiscovery = async () => {
    setLoading(true);
    try {
      await axios.post(N8N_CONFIG.FINDER_WEBHOOK);
      alert("Full scan started! Results will appear below as they are found.");
    } catch (error) {
      alert("Start discovery failed.");
    } finally {
      setLoading(false);
      setTimeout(fetchRecentLeads, 5000);
    }
  };

  return (
    <div className="view-container">
      <header>
        <h1>Email Finder Dashboard</h1>
        <p className="subtitle">Manage your search queries and monitor incoming verified leads.</p>
      </header>

      {/* Query Manager Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Manage Search Queries (Source)</div>
          <button onClick={fetchQueries} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            <RefreshCw size={14} /> Sync Now
          </button>
        </div>
        <p className="subtitle" style={{ marginBottom: '24px' }}>These are the queries n8n will process during a scan.</p>
        
        <form onSubmit={handleAddQuery} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '20px', marginBottom: '32px', background: 'var(--n10)', padding: '24px', borderRadius: '4px', border: '1px solid var(--n30)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--n500)', marginBottom: '8px' }}>SEARCH QUERY</label>
            <input 
              type="text" 
              placeholder="e.g. AI startups in India" 
              value={newQuery.query}
              onChange={(e) => setNewQuery({...newQuery, query: e.target.value})}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--n500)', marginBottom: '8px' }}>SIGNAL</label>
            <select value={newQuery.signal} onChange={(e) => setNewQuery({...newQuery, signal: e.target.value})}>
              <option>Funding</option>
              <option>Hiring</option>
              <option>Expansion</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
              Append Row
            </button>
          </div>
        </form>

        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {queries.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', color: 'var(--n100)', padding: '40px' }}>No queries added yet.</td>
                </tr>
              ) : queries.map((q, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{q.query || q.Query || "No Query"}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'var(--n30)', color: 'var(--primary)' }}>
                      {q.signal || q.Signal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discovery Trigger Section */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary)', border: 'none' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>Launch Discovery Engine</h2>
          <p style={{ margin: 0, color: 'var(--n40)', fontSize: '15px' }}>Process {queries.length} source queries to find and verify new verified leads.</p>
        </div>
        <button 
          onClick={handleTriggerDiscovery} 
          disabled={loading}
          style={{ background: 'var(--accent)', padding: '16px 32px', fontSize: '16px' }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={22} />}
          Start Discovery Scan
        </button>
      </div>

      {/* Results Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Verified Leads (Live)</div>
          <button onClick={fetchRecentLeads} className="btn-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--n100)', padding: '60px' }}>No verified leads found yet. Start a scan to begin.</td>
              </tr>
            ) : results.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.name || r.Name}</td>
                <td>{r.company || r.Company}</td>
                <td style={{ color: 'var(--n500)' }}>{r.email || r.Email}</td>
                <td>
                   <span className="status-badge status-success">Verified</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailFinder;
