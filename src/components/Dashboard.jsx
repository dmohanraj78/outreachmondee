import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  Search, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    queries: 0,
    leads: 0,
    sent: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Queries
        const queriesRes = await axios.get(N8N_CONFIG.GET_QUERIES_WEBHOOK);
        const queriesCount = Array.isArray(queriesRes.data) ? queriesRes.data.length : 0;

        // Fetch Leads
        const leadsRes = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
        const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
        const leadsCount = leads.length;

        // Fetch Sent History
        const sentRes = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
        const allItems = Array.isArray(sentRes.data) ? sentRes.data : [];
        const sentCount = allItems.filter(item => (item.status || item.Status) === "Sent").length;
        const pendingCount = allItems.filter(item => (item.status || item.Status) === "Draft Ready").length;

        setStats({
          queries: queriesCount,
          leads: leadsCount,
          sent: sentCount,
          pending: pendingCount
        });

        setRecentLeads(leads.slice(-5).reverse());
      } catch (error) {
        console.error("Dashboard data fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const MetricCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className="card" style={{ 
      marginBottom: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      animation: `fadeIn 0.5s ease-out ${delay}s both`
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        background: color, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white'
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '14px', color: 'var(--n100)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--n800)' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div className="view-container">
      <header className="page-header">
        <h1>Command Center</h1>
        <p className="subtitle">Real-time overview of your Miraee Agentic OS performance.</p>
      </header>

      {/* Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        <MetricCard 
          icon={Search} 
          label="Active Queries" 
          value={stats.queries} 
          color="var(--primary)" 
          delay={0}
        />
        <MetricCard 
          icon={Users} 
          label="Verified Leads" 
          value={stats.leads} 
          color="var(--accent)" 
          delay={0.1}
        />
        <MetricCard 
          icon={MessageSquare} 
          label="Ready to Send" 
          value={stats.pending} 
          color="#FFB400" 
          delay={0.2}
        />
        <MetricCard 
          icon={Mail} 
          label="Outreach Sent" 
          value={stats.sent} 
          color="#006644" 
          delay={0.3}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Recent Discovery */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent)" />
              Recent Lead Discoveries
            </div>
            <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}>View All</button>
          </div>
          
          <table style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--n100)' }}>
                    No leads discovered yet.
                  </td>
                </tr>
              ) : recentLeads.map((lead, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{lead.name || lead.Name}</td>
                  <td>{lead.company || lead.Company}</td>
                  <td><span className="status-badge status-success">Verified</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Health / Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card" style={{ background: 'var(--n10)', borderStyle: 'dashed' }}>
            <div className="card-title" style={{ marginBottom: '16px', fontSize: '16px' }}>System Health</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} color="#006644" />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>n8n Engine: Online</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} color="#006644" />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>LinkedIn Logic: Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} color="#006644" />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Mail Server: Ready</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Launch Swarm</div>
            <p style={{ fontSize: '13px', color: 'var(--n30)', marginBottom: '20px' }}>Start a fresh discovery scan across all queries.</p>
            <button style={{ width: '100%', background: 'white', color: 'var(--primary)' }}>
              Run Engine <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
