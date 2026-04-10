import React, { useState, useEffect } from 'react';
import { UserPlus, MessageSquare, CheckCircle, Loader2, Users, Search, Filter, Share2, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { N8N_CONFIG, UNIPILE_CONFIG } from '../config';

const CloserAgent = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingId, setSendingId] = useState(null);
    const [status, setStatus] = useState({}); // {leadId: 'success' | 'error' | 'loading'}
    const [unipileStatus, setUnipileStatus] = useState({}); // {leadId: 'success' | 'error' | 'loading'}

    const fetchLeads = async () => {
        setLoading(true);
        const toastId = toast.loading('Syncing Closer Database...');
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
            toast.success(`Synced ${fetchedLeads.length} leads.`, { id: toastId });
        } catch (error) {
            console.error("Failed to fetch leads", error);
            toast.error("Failed to sync database.", { id: toastId });
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
        const toastId = toast.loading(`Dispatching Agent for ${lead.name || lead.Name}...`);

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
                toast.success(`Invitation successfully sent to ${lead.company || lead.Company}!`, { id: toastId });
            } else {
                setStatus(prev => ({ ...prev, [index]: 'error' }));
                toast.error(`Agent failed for ${lead.name || lead.Name}.`, { id: toastId });
            }
        } catch (error) {
            console.error('Closer Agent Error:', error);
            setStatus(prev => ({ ...prev, [index]: 'error' }));
            toast.error('Network Error during dispatch.', { id: toastId });
        } finally {
            setSendingId(null);
        }
    };

    const sendUnipileInvite = async (lead, index) => {
        const linkedinUrl = lead.linkedin || lead.LinkedIn_URL;
        if (!linkedinUrl) {
            toast.error("LinkedIn URL missing for this lead!");
            return;
        }

        setSendingId(index);
        setUnipileStatus(prev => ({ ...prev, [index]: 'loading' }));
        const toastId = toast.loading(`Unipile: Connecting to ${lead.name || lead.Name}...`);

        try {
            // STEP 1: Resolve Profile to get Provider ID
            // Handle variations: /in/name, /in/name/, /in/name?param, or just the handle
            let publicId = linkedinUrl;
            if (linkedinUrl.includes('/in/')) {
                publicId = linkedinUrl.split('/in/')[1].split('/')[0].split('?')[0].replace('/', '');
            } else if (linkedinUrl.includes('linkedin.com/')) {
                publicId = linkedinUrl.split('.com/')[1].split('/')[0].split('?')[0].replace('/', '');
            }

            if (!publicId) throw new Error("Could not parse LinkedIn profile handle");

            const resolveRes = await axios.get(`${UNIPILE_CONFIG.BASE_URL}/users/${publicId}`, {
                params: { account_id: UNIPILE_CONFIG.ACCOUNT_ID },
                headers: { 'X-API-KEY': UNIPILE_CONFIG.API_KEY, 'accept': 'application/json' }
            });

            const providerId = resolveRes.data.provider_id;
            if (!providerId) throw new Error("Could not find internal Provider ID");

            // STEP 2: Send Invitation with Message (Strict 150 Chars)
            const firstName = (lead.name || lead.Name || "there").split(' ')[0];
            const company = (lead.company || lead.Company || "your team").substring(0, 30);
            const inviteMsg = `Hi ${firstName}, saw your work at ${company}. I'm from Miraee (Agentic OS)—we automate corporate travel & expenses via AI. Love to connect!`;
            
            // Hard safety truncation at 148 chars
            const finalMsg = inviteMsg.length > 148 ? inviteMsg.substring(0, 145) + "..." : inviteMsg;

            const inviteRes = await axios.post(`${UNIPILE_CONFIG.BASE_URL}/users/invite`, {
                account_id: UNIPILE_CONFIG.ACCOUNT_ID,
                provider_id: providerId,
                message: finalMsg
            }, {
                headers: { 'X-API-KEY': UNIPILE_CONFIG.API_KEY, 'accept': 'application/json' }
            });

            if (inviteRes.status === 201 || inviteRes.status === 200) {
                setUnipileStatus(prev => ({ ...prev, [index]: 'success' }));
                toast.success(`Unipile: Connection request sent!`, { id: toastId });

                // PERSIST TO SHEET: Tell n8n to mark this lead as "Sent (Unipile)" 
                try {
                    await axios.post(N8N_CONFIG.CLOSER_WEBHOOK, {
                        row_number: lead.row_number || lead.Row_Number || lead.row_index,
                        status: 'Sent (Unipile)',
                        lead_name: lead.name || lead.Name,
                        update_only: true 
                    });
                    // Move to "Sent" section in UI
                    setStatus(prev => ({ ...prev, [index]: 'success' }));
                } catch (sheetError) {
                    console.error("Failed to update sheet status", sheetError);
                }
            } else {
                throw new Error("Unipile API returned an error");
            }

        } catch (error) {
            console.error('Unipile Error Detail:', error.response?.data);
            setUnipileStatus(prev => ({ ...prev, [index]: 'error' }));
            
            // Get the specific error from Unipile (e.g. "Invite already sent")
            const errorTitle = error.response?.data?.title || error.response?.data?.message || error.message || 'Unipile Error';
            toast.error(`Unipile: ${errorTitle}`, { id: toastId });
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
                                const isSent = status[originalIdx] === 'success' || unipileStatus[originalIdx] === 'success';
                                return !isSent;
                            }).map((lead, idx) => {
                                const originalIdx = leads.indexOf(lead);
                                const isLoading = status[originalIdx] === 'loading' || unipileStatus[originalIdx] === 'loading';
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
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                            <button 
                                                onClick={() => sendInvite(lead, originalIdx)}
                                                disabled={sendingId !== null}
                                                className="btn-secondary"
                                                style={{ flex: 1, fontSize: '12px', padding: '10px' }}
                                            >
                                                {status[originalIdx] === 'loading' ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                                                <span>n8n Queue</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => sendUnipileInvite(lead, originalIdx)}
                                                disabled={sendingId !== null}
                                                style={{ 
                                                    flex: 1, 
                                                    fontSize: '12px', 
                                                    padding: '10px',
                                                    background: 'var(--primary)',
                                                    color: 'white'
                                                }}
                                            >
                                                {unipileStatus[originalIdx] === 'loading' ? (
                                                    <Loader2 className="animate-spin" size={14} />
                                                ) : (
                                                    <Share2 size={14} />
                                                )}
                                                <span>Unipile Direct</span>
                                            </button>
                                        </div>
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', opacity: 1 }}>
                                {filteredLeads.filter(l => {
                                    const originalIdx = leads.indexOf(l);
                                    return status[originalIdx] === 'success' || unipileStatus[originalIdx] === 'success';
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
