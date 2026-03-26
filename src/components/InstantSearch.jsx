import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';
import EmptyState from './EmptyState';

const InstantSearch = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formSearch, setFormSearch] = useState({ industry: '', signal: '', filter: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchRecentLeads = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch leads failed", error);
    }
  };

  useEffect(() => {
    fetchRecentLeads();
  }, []);

  const handleDirectSearch = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await axios.post(N8N_CONFIG.DIRECT_FINDER_WEBHOOK, {
        "Target Industry / Query": formSearch.industry,
        "signal": formSearch.signal,
        "filter": formSearch.filter
      });
      
      const newLeads = Array.isArray(response.data) ? response.data : [];
      if (newLeads.length > 0) {
        setResults(prev => [...newLeads, ...prev]);
        alert(`Success! Found ${newLeads.length} new verified founders.`);
      } else {
        alert("No founders found for these specific criteria.");
      }
    } catch (error) {
      console.error("Direct search failed", error);
      alert("Failed to run direct search.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="view-container">
      <header>
        <h1>Instant Search</h1>
        <p className="subtitle">Locate specific founders in real-time without adding to the discovery queue.</p>
      </header>

      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="card-title">Manual Parameter Entry</div>
        <p className="subtitle" style={{ marginBottom: '24px' }}>Input your criteria below to trigger an immediate targeted scan.</p>
        
        <form onSubmit={handleDirectSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', background: 'var(--n10)', padding: '24px', borderRadius: '4px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--n100)', marginBottom: '8px' }}>TARGET INDUSTRY</label>
            <input 
              type="text" 
              placeholder="e.g. HealthTech" 
              value={formSearch.industry}
              onChange={(e) => setFormSearch({...formSearch, industry: e.target.value})}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--n100)', marginBottom: '8px' }}>SIGNAL</label>
            <input 
              type="text" 
              placeholder="e.g. Expansion to USA" 
              value={formSearch.signal}
              onChange={(e) => setFormSearch({...formSearch, signal: e.target.value})}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--n100)', marginBottom: '8px' }}>FILTERS</label>
            <input 
              type="text" 
              placeholder="e.g. Series B" 
              value={formSearch.filter}
              onChange={(e) => setFormSearch({...formSearch, filter: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={formLoading} style={{ background: 'var(--accent)' }}>
              {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
              Instant Search
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="card-title">Verified Results</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Filter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '200px' }}
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
                    icon={Database}
                    title="No Results Found"
                    message="Run a Targeted Search above to find specific founders for your campaign."
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

export default InstantSearch;
