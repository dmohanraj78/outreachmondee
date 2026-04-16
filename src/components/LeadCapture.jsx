import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, ArrowRight, Mail, Globe, ShieldCheck, Table as TableIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';

const LeadCapture = () => {
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchLeads = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const response = await axios.get(N8N_CONFIG.GET_CAPTURE_FORM_WEBHOOK);
            const data = Array.isArray(response.data) ? response.data : [];
            setLeads(data.reverse());
        } catch (error) {
            console.error("Failed to fetch leads", error);
            toast.error("Could not sync with database.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const getLeadValue = (lead, keys) => {
        for (const key of keys) {
            if (lead[key]) return lead[key];
            if (lead[key.toLowerCase()]) return lead[key.toLowerCase()];
            if (lead[key.toUpperCase()]) return lead[key.toUpperCase()];
        }
        return '';
    };

    const getLeadName = (lead) => getLeadValue(lead, ['name', 'Name', 'fullName', 'Lead Name']) || 'Anonymous';
    const getLeadEmail = (lead) => getLeadValue(lead, ['email', 'Email', 'email_address']) || 'No Email';
    const getLeadCompany = (lead) => getLeadValue(lead, ['company', 'Company', 'organization', 'Organization']) || 'N/A';
    const getLeadRole = (lead) => getLeadValue(lead, ['role', 'Role', 'date', 'Position', 'Title']) || 'Executive';
    const getLeadLinkedin = (lead) => getLeadValue(lead, ['linkedin', 'LinkedIn', 'linkedin_url', 'LinkedIn Profile']);

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Captured Leads</h1>
                    <p className="text-sm text-slate-500 max-w-lg">
                        Leads gathered via RB2B tracking, intent signals, and automated search.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchLeads(true)} disabled={isRefreshing} className="h-9 text-xs gap-1.5">
                    <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                    {isRefreshing ? "Syncing..." : "Refresh"}
                </Button>
            </header>

            {/* Main Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <TableIcon size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-base">Intelligence Database</CardTitle>
                            <CardDescription className="text-xs">{leads.length} records found</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{leads.length} Records</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs text-slate-400">Loading...</p>
                        </div>
                    ) : leads.length === 0 ? (
                        <EmptyState icon={TableIcon} title="No Leads Captured" message="Leads will appear here from RB2B tracking and search queries." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-5">Lead</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="text-right pr-5">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map((lead, i) => {
                                    const name = getLeadName(lead);
                                    const email = getLeadEmail(lead);
                                    const company = getLeadCompany(lead);
                                    const role = getLeadRole(lead);
                                    const linkedin = getLeadLinkedin(lead);

                                    return (
                                        <TableRow key={i} className="group">
                                            <TableCell className="pl-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 text-sm">{name}</div>
                                                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                            <Mail size={9} /> {email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-slate-700">{company}</div>
                                                <div className="text-[11px] text-slate-400">{role}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    (lead.source || '').toLowerCase().includes('rb2b') ? "default" : "outline"
                                                } className="text-[10px]">
                                                    {lead.source || "External"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-5">
                                                <div className="flex items-center justify-end gap-1">
                                                    {linkedin && (
                                                        <a href={linkedin} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-300 hover:text-primary">
                                                                <ExternalLink size={14} />
                                                            </Button>
                                                        </a>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-300 hover:text-slate-600">
                                                        <ArrowRight size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                    <div className="flex gap-4 items-start">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 text-sm">Security</h4>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">All data is validated and de-duplicated before ingestion.</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-[#4F001D] text-white border-none p-5">
                    <div className="flex gap-4 items-start">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 flex-shrink-0">
                            <Globe size={16} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-sm">RB2B Tracking</h4>
                            <p className="text-xs text-white/50 mt-0.5 leading-relaxed">Pixel active. Visitors auto-populate the database.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LeadCapture;
