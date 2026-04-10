import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, RefreshCw, PlusCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { N8N_CONFIG } from '../config';
import EmptyState from './EmptyState';

const EmailFinder = () => {
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleAddQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Adding query to Google Sheet...');
    try {
      await axios.post(N8N_CONFIG.SAVE_QUERY_WEBHOOK, { 
        Query: newQuery.query, 
        Signal: newQuery.signal 
      });
      
      const addedQuery = { Query: newQuery.query, Signal: newQuery.signal };
      setQueries(prev => [addedQuery, ...prev]);
      setNewQuery({ ...newQuery, query: '' });
      toast.success("Success! Source query added.", { id: toastId });
      setTimeout(fetchQueries, 5000);
    } catch (error) {
      console.error("Save Query Error:", error);
      toast.error("Failed to append row.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDiscovery = async () => {
    setLoading(true);
    const toastId = toast.loading('Scanning for leads...');
    try {
      await axios.post(N8N_CONFIG.FINDER_WEBHOOK);
      setTimeout(() => {
        setLoading(false);
        fetchRecentLeads();
      }, 5000);
      toast.success("Discovery started! Results will appear below.", { id: toastId });
    } catch (error) {
      toast.error("Start discovery failed.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <header>
        <h1>Email Finder Dashboard</h1>
        <p className="subtitle">Manage your search queries and monitor incoming verified leads.</p>
      </header>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="card-title">Manage Search Queries (Source)</div>
          <button onClick={fetchQueries} className="btn-secondary">
            <RefreshCw size={14} /> Sync Now
          </button>
        </div>
        
        <form onSubmit={handleAddQuery} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '20px', marginBottom: '32px' }}>
          <input 
            type="text" 
            placeholder="e.g. AI startups in India" 
            value={newQuery.query}
            onChange={(e) => setNewQuery({...newQuery, query: e.target.value})}
            required 
          />
          <select value={newQuery.signal} onChange={(e) => setNewQuery({...newQuery, signal: e.target.value})}>
            <option>Funding</option>
            <option>Hiring</option>
            <option>Expansion</option>
          </select>
          <button type="submit" disabled={loading}>
            <PlusCircle size={18} />
            Append Row
          </button>
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
                  <td colSpan="2">
                    <EmptyState 
                      icon={Database}
                      title="No Queries Found"
                      message="Add your first search query above to start discovering leads."
                    />
                  </td>
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

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary)', border: 'none' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>Launch Discovery Engine</h2>
          <p style={{ margin: 0, color: 'var(--n40)' }}>Process {queries.length} source queries to find and verify new verified leads.</p>
        </div>
        <button 
          onClick={handleTriggerDiscovery} 
          disabled={loading}
          style={{ background: 'var(--accent)', padding: '16px 32px' }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={22} />}
          Start Discovery Scan
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="card-title">Verified Leads (Live)</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Filter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px' }}
            />
            <button onClick={fetchRecentLeads} className="btn-secondary">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>S.No</th>
              <th>Lead</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <EmptyState 
                    icon={Search}
                    title="No Leads Found"
                    message="Start a Discovery Scan above to find verified leads."
                  />
                </td>
              </tr>
            ) : results
                .filter(r => 
                  (r.name || r.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (r.company || r.Company || "").toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice().reverse().map((r, i, arr) => (
                <tr key={i}>
                  <td style={{ color: 'var(--n100)' }}>{arr.length - i}</td>
                  <td style={{ fontWeight: 600 }}>{r.name || r.Name}</td>
                  <td>{r.company || r.Company}</td>
                  <td><span className="status-badge status-success">Verified</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailFinder;
