import React, { useState, useEffect } from 'react';
import { UserPlus, MessageSquare, CheckCircle, Loader2, Users, Search, RefreshCw, Share2, Zap, Target, Navigation, ArrowUpRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG, UNIPILE_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';
import { useProcessTracking } from '../hooks/useProcessTracking';

const CloserAgent = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const { startProcess, completeProcess, failProcess, modalProps } = useProcessTracking();
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingId, setSendingId] = useState(null);
    const [status, setStatus] = useState({});
    const [unipileStatus, setUnipileStatus] = useState({});

    const fetchLeads = async () => {
        setLoading(true);
        const toastId = toast.loading('Syncing target connections...');
        try {
            const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
            const fetchedLeads = Array.isArray(response.data) ? response.data : [];
            setLeads(fetchedLeads);
            
            const initialStatus = {};
            fetchedLeads.forEach((lead, idx) => {
                const sheetStatus = lead.Status || lead.status || lead['Connection request'] || '';
                if (sheetStatus === 'Invitations sent' || sheetStatus === 'Invite Sent' || sheetStatus.toLowerCase().includes('sent')) {
                    initialStatus[idx] = 'success';
                }
            });
            setStatus(initialStatus);
            toast.success(`Database sync complete.`, { id: toastId });
        } catch (error) {
            toast.error("Database connection timeout.", { id: toastId });
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
        startProcess("Dispatching Agent", `Deploying cognitive outreach operative to engage with ${lead.name || lead.Name}. Initializing AI shadowing and identity mirroring protocols...`);

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
                    research_content: "Professional outreach via AI Mirroring."
                }),
            });

            if (response.ok) {
                setStatus(prev => ({ ...prev, [index]: 'success' }));
                completeProcess();
            } else {
                setStatus(prev => ({ ...prev, [index]: 'error' }));
                const errData = await response.json().catch(() => ({}));
                failProcess(errData.message || "The invitation node encountered a structural failure in the n8n cluster.");
            }
        } catch (error) {
            setStatus(prev => ({ ...prev, [index]: 'error' }));
            failProcess(error);
        } finally {
            setSendingId(null);
        }
    };

    const sendUnipileInvite = async (lead, index) => {
        const linkedinUrl = lead.linkedin || lead.LinkedIn_URL;
        if (!linkedinUrl) {
            toast.error("LinkedIn Identifier Missing.");
            return;
        }

        setSendingId(index);
        setUnipileStatus(prev => ({ ...prev, [index]: 'loading' }));
        startProcess("Unipile Resolution", `Resolving LinkedIn identifier for ${lead.name || lead.Name} via Unipile secure bridge. Synchronizing session tokens and resolving provider IDs...`);

        try {
            let publicId = linkedinUrl;
            if (linkedinUrl.includes('/in/')) {
                publicId = linkedinUrl.split('/in/')[1].split('/')[0].split('?')[0].replace('/', '');
            } else if (linkedinUrl.includes('linkedin.com/')) {
                publicId = linkedinUrl.split('.com/')[1].split('/')[0].split('?')[0].replace('/', '');
            }

            if (!publicId) throw new Error("Identifier Resolution Failed: LinkedIn URL may be malformed.");

            const resolveRes = await axios.get(`${UNIPILE_CONFIG.BASE_URL}/users/${publicId}`, {
                params: { account_id: UNIPILE_CONFIG.ACCOUNT_ID },
                headers: { 'X-API-KEY': UNIPILE_CONFIG.API_KEY, 'accept': 'application/json' }
            });

            const providerId = resolveRes.data.provider_id;
            if (!providerId) throw new Error("Provider Resolution Failed: Target profile is not reachable via the current Unipile account.");

            const firstName = (lead.name || lead.Name || "there").split(' ')[0];
            const company = (lead.company || lead.Company || "your team").substring(0, 30);
            const inviteMsg = `Hi ${firstName}, noticed your growth at ${company}. Reaching out from Miraee (Agentic OS)—we develop AI for corporate travel & expense automation. Would love to connect!`;
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
                
                try {
                    await axios.post(N8N_CONFIG.CLOSER_WEBHOOK, {
                        row_number: lead.row_number || lead.Row_Number || lead.row_index,
                        status: 'Sent (Unipile)',
                        lead_name: lead.name || lead.Name,
                        update_only: true 
                    });
                    setStatus(prev => ({ ...prev, [index]: 'success' }));
                } catch (e) {}
                
                completeProcess();
            } else {
                throw new Error("The Unipile dispatch node returned an abnormal status. Connection request may not have been finalized.");
            }
        } catch (error) {
            setUnipileStatus(prev => ({ ...prev, [index]: 'error' }));
            const errorTitle = error.response?.data?.title || error.message || 'Direct Send Failed';
            toast.error(errorTitle, { id: toastId });
        } finally {
            setSendingId(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const name = (lead.name || lead.Name || '').toLowerCase();
        const company = (lead.company || lead.Company || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || company.includes(searchTerm.toLowerCase());
    });

    const activeLeads = filteredLeads.filter(l => {
        const originalIdx = leads.indexOf(l);
        return !(status[originalIdx] === 'success' || unipileStatus[originalIdx] === 'success');
    });

    const sentLeads = filteredLeads.filter(l => {
        const originalIdx = leads.indexOf(l);
        return status[originalIdx] === 'success' || unipileStatus[originalIdx] === 'success';
    });

    return (
        <div className="space-y-10">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">OUTREACH TERMINAL</Badge>
                    <span className="text-slate-200">|</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Lead Conversion</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                    Closer <span className="text-primary/70 font-medium">Agent</span>
                </h1>
                <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
                    Personalized LinkedIn engagement module. Convert high-intent leads into direct connections with AI-assisted dispatches.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-6 items-center">
                <Card className="flex-1 w-full bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 px-6 py-4 h-14">
                        <Search className="text-slate-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter candidates by name or organization..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-semibold text-slate-900 flex-1 focus:ring-0 placeholder:text-slate-300"
                        />
                        <div className="w-px h-6 bg-slate-100 mx-1" />
                        <Button variant="ghost" size="sm" onClick={fetchLeads} className="font-semibold tracking-wider text-[10px] uppercase gap-2 hover:bg-slate-50">
                            {loading ? <Loader2 className="animate-spin text-primary" size={14} /> : <RefreshCw size={12} />}
                            Sync DB
                        </Button>
                    </div>
                </Card>
            </div>

            <AnimatePresence mode="popLayout">
                {loading && leads.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-40 space-y-6"
                    >
                        <Loader2 className="animate-spin text-primary/50" size={48} />
                        <p className="text-primary font-semibold tracking-widest text-[10px] uppercase animate-pulse">Initializing Connectivity Swarm...</p>
                    </motion.div>
                ) : filteredLeads.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-40 border border-slate-100 bg-white rounded-3xl flex flex-col items-center justify-center text-center px-10 shadow-sm"
                    >
                        <Users size={48} className="text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-300 tracking-tight uppercase">No Match Found</h3>
                        <p className="text-slate-300 font-semibold mt-1 uppercase tracking-widest text-[10px]">Adjust search filters or run a discovery scan.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-12 pb-20">
                        {/* Ready Section */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                        <Target className="text-primary/50" size={24} />
                                        Qualified Connections
                                    </h2>
                                    <p className="text-sm font-normal text-slate-500">Total high-intent leads awaiting outreach: {activeLeads.length}</p>
                                </div>
                                <Badge variant="primary" className="bg-primary/5 text-primary border-primary/10 h-7 px-3 font-semibold text-[10px]">ACTIVE QUEUE</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {activeLeads.map((lead) => {
                                    const originalIdx = leads.indexOf(lead);
                                    return (
                                        <motion.div
                                            key={originalIdx}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                        >
                                            <Card className="group hover:shadow-md hover:border-primary/10 transition-all duration-300 overflow-hidden flex flex-col h-full bg-white border-slate-100">
                                                <CardContent className="p-8 relative flex-grow space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
                                                            {(lead.name || lead.Name || '?')[0]}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 text-[9px] font-semibold">QUALIFIED</Badge>
                                                            {lead.LinkedIn_URL && (
                                                                <a 
                                                                    href={lead.LinkedIn_URL} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="text-slate-300 hover:text-primary transition-colors"
                                                                >
                                                                    <ArrowUpRight size={16} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">{lead.name || lead.Name}</h3>
                                                        <p className="text-sm font-normal text-slate-500 leading-relaxed">
                                                            {lead.title || lead.Title || 'Founder'} at <span className="text-slate-900 font-semibold">{lead.company || lead.Company}</span>
                                                        </p>
                                                    </div>
                                                </CardContent>
                                                
                                                <CardContent className="p-8 pt-4 border-t border-slate-50 bg-slate-50/20 flex flex-col sm:flex-row gap-3">
                                                    <Button 
                                                        variant="outline"
                                                        size="lg"
                                                        onClick={() => sendInvite(lead, originalIdx)}
                                                        disabled={sendingId !== null}
                                                        className="flex-1 h-12 border-slate-200 font-semibold tracking-wide text-[9px] uppercase whitespace-nowrap"
                                                    >
                                                        {status[originalIdx] === 'loading' ? <Loader2 className="animate-spin text-primary" size={14} /> : <Zap size={14} className="mr-2 text-primary" />}
                                                        Send (N8N)
                                                    </Button>
                                                    
                                                    <Button 
                                                        variant="primary"
                                                        size="lg"
                                                        onClick={() => sendUnipileInvite(lead, originalIdx)}
                                                        disabled={sendingId !== null}
                                                        className="flex-1 h-12 font-semibold tracking-wide text-[9px] uppercase whitespace-nowrap shadow-primary/10"
                                                    >
                                                        {unipileStatus[originalIdx] === 'loading' ? (
                                                            <Loader2 className="animate-spin" size={14} />
                                                        ) : (
                                                            <Share2 size={14} className="mr-2 text-accent" />
                                                        )}
                                                        Send (Unipile)
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sent Section */}
                        {sentLeads.length > 0 && (
                            <div className="space-y-8 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                                      Dispatched Connections 
                                      <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 font-semibold text-[10px]">{sentLeads.length}</Badge>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {sentLeads.map((lead) => (
                                        <Card key={leads.indexOf(lead)} className="bg-white border-slate-100 shadow-sm opacity-60">
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div className="space-y-0.5 truncate pr-4">
                                                    <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate">{lead.name || lead.Name}</h3>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest truncate">{lead.company || lead.Company}</p>
                                                </div>
                                                <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg flex-shrink-0">
                                                    <CheckCircle size={14} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CloserAgent;
