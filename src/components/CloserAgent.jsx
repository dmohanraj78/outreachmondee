import React, { useState, useEffect } from 'react';
import { UserPlus, MessageSquare, CheckCircle, Loader2, Users, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const CloserAgent = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingId, setSendingId] = useState(null);
    const [status, setStatus] = useState({}); // {leadId: 'success' | 'error' | 'loading'}

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
            const fetchedLeads = Array.isArray(response.data) ? response.data : [];
            setLeads(fetchedLeads);
            
            // Sync status state with what's already in the sheet
            const initialStatus = {};
            fetchedLeads.forEach((lead, idx) => {
                const sheetStatus = lead.Status || lead.status || lead['Connection request'] || '';
                if (sheetStatus === 'Invitations sent' || sheetStatus === 'Invite Sent' || sheetStatus.toLowerCase().includes('sent')) {
                    initialStatus[idx] = 'success';
                }
            });
            setStatus(initialStatus);
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const sendInvite = async (lead, index) => {
        setSendingId(index);
        setStatus(prev => ({ ...prev, [index]: 'loading' }));

        try {
            const response = await fetch(N8N_CONFIG.CLOSER_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_name: lead.name || lead.Name,
                    lead_company: lead.company || lead.Company,
                    lead_linkedin: lead.linkedin || lead.LinkedIn_URL,
                    row_number: lead.row_number || lead.Row_Number || lead.row_index, 
                    topic_title: "LinkedIn Networking",
                    research_content: "Direct outreach from Miraee Closer Agent."
                }),
            });

            if (response.ok) {
                setStatus(prev => ({ ...prev, [index]: 'success' }));
            } else {
                setStatus(prev => ({ ...prev, [index]: 'error' }));
            }
        } catch (error) {
            console.error('Closer Agent Error:', error);
            setStatus(prev => ({ ...prev, [index]: 'error' }));
        } finally {
            setSendingId(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const name = (lead.name || lead.Name || '').toLowerCase();
        const company = (lead.company || lead.Company || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || company.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="view-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px' }}>
                    Closer <span style={{ color: 'var(--accent)' }}>Agent</span>
                </h1>
                <p className="subtitle" style={{ fontSize: '18px', maxWidth: '700px' }}>
                    The ultimate command center for LinkedIn outreach. Convert your sourced leads into connections with AI-powered, single-click invitations.
                </p>
            </header>

            <div className="card" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
                <Search size={20} color="var(--n400)" />
                <input 
                    type="text" 
                    placeholder="Search leads by name or company..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '16px', flex: 1, boxShadow: 'none' }}
                />
                <button onClick={fetchLeads} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Refresh Leads'}
                </button>
            </div>

            {loading && leads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent)" />
                    <p style={{ marginTop: '16px', color: 'var(--n500)' }}>Scanning Lead Database...</p>
                </div>
            ) : filteredLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'var(--n10)', borderRadius: '12px', border: '2px dashed var(--n30)' }}>
                    <Users size={48} color="var(--n300)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--n600)' }}>No leads found.</h3>
                    <p style={{ color: 'var(--n500)' }}>Try adjusting your search or source more leads first.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {/* Active Leads Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <UserPlus size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Ready to Close</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {filteredLeads.filter(l => {
                                const originalIdx = leads.indexOf(l);
                                return !status[originalIdx] || status[originalIdx] !== 'success';
                            }).map((lead, idx) => {
                                const originalIdx = leads.indexOf(lead);
                                return (
                                    <div key={originalIdx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'var(--bg-creme)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '20px' }}>
                                                    {(lead.name || lead.Name || '?')[0]}
                                                </div>
                                                <div className="status-badge status-neutral">Ready</div>
                                            </div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{lead.name || lead.Name}</h3>
                                            <p style={{ color: 'var(--n500)', fontSize: '14px', marginBottom: '16px' }}>
                                                {lead.title || lead.Title || 'Professional'} at <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{lead.company || lead.Company}</span>
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => sendInvite(lead, originalIdx)}
                                            disabled={sendingId === originalIdx}
                                            style={{ width: '100%', marginTop: '16px' }}
                                        >
                                            {status[originalIdx] === 'loading' ? <><Loader2 className="animate-spin" size={18} /> Closing...</> : <><UserPlus size={18} /> Send Invitation</>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Invitations Sent Section */}
                    {Object.values(status).includes('success') && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                <CheckCircle size={20} color="var(--success-text)" />
                                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Invitations Sent</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', opacity: 0.8 }}>
                                {filteredLeads.filter(l => {
                                    const originalIdx = leads.indexOf(l);
                                    return status[originalIdx] === 'success';
                                }).map((lead, idx) => {
                                    const originalIdx = leads.indexOf(lead);
                                    return (
                                        <div key={originalIdx} className="card" style={{ border: '1px solid var(--success-bg)', background: 'var(--success-bg-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{lead.name || lead.Name}</h3>
                                                    <p style={{ color: 'var(--n500)', fontSize: '13px' }}>{lead.company || lead.Company}</p>
                                                </div>
                                                <div className="status-badge status-success">Sent</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CloserAgent;
