import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Zap, MessageSquare, ExternalLink, Loader2, Copy, CheckCircle, ArrowRight, Sparkles, Target, History, Send, RefreshCw, Trash2, Maximize2, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';
import { useProcessTracking } from '../hooks/useProcessTracking';

const LinkedInAuthority = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [customQuery, setCustomQuery] = useState('');
    const [progressStage, setProgressStage] = useState(0);
    const [results, setResults] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [sendingStatus, setSendingStatus] = useState({});
    const { startProcess, completeProcess, failProcess } = useProcessTracking();

    const [previewIndex, setPreviewIndex] = useState(null);

    const getSmartContent = (res) => {
        if (res.Content) return res.Content;
        if (res.content) return res.content;
        
        // Intelligent fallback: Find the longest string that isn't a URL, Title, or ID
        const values = Object.values(res).filter(v => typeof v === 'string');
        const longStrings = values.filter(v => 
            v.length > 50 && 
            !v.startsWith('http') && 
            !v.startsWith('LNK') &&
            v !== res.Title && 
            v !== res.title
        );
        
        return longStrings.length > 0 ? longStrings.reduce((a, b) => a.length > b.length ? a : b) : '';
    };

    const stages = [
        "Initializing research swarm...",
        "Identifying industry perspectives...",
        "Scraping relevant LinkedIn discussions...",
        "Cognitive analysis of trend data...",
        "Drafting authority comment options...",
        "Finalizing intelligence output..."
    ];

    const fetchDrafts = useCallback(async () => {
        try {
            const res = await fetch(N8N_CONFIG.GET_SOCIAL_DRAFTS_WEBHOOK);
            if (res.ok) {
                const rawData = await res.json();
                let data = Array.isArray(rawData) ? rawData : (rawData.data || rawData.items || [rawData]);
                
                if (Array.isArray(data)) {
                    const activeDrafts = data.filter(d => {
                        const status = (d.Status || d.status || '').toLowerCase();
                        return status !== 'deleted' && status !== 'sent';
                    });
                    setResults(activeDrafts);
                }
            }
        } catch (error) {
            console.error("Error fetching social drafts:", error);
        }
    }, []);

    useEffect(() => {
        fetchDrafts();
        const pollInterval = setInterval(fetchDrafts, 15000);
        return () => clearInterval(pollInterval);
    }, [fetchDrafts]);

    useEffect(() => {
        let interval;
        if (loading) {
            setProgressStage(0);
            interval = setInterval(() => {
                setProgressStage((prev) => (prev + 1) % stages.length);
            }, 3000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const triggerSocialResearch = async () => {
        if (!customQuery.trim()) return;

        setLoading(true);
        setStatus(null);
        startProcess("Social Authority Analysis", "Our cognitive agents are currently probing LinkedIn for the latest industry perspectives and trend data. We are drafting expert-level reactions based on real-time intelligence.");
        
        try {
            const response = await fetch(N8N_CONFIG.RESEARCH_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: customQuery }),
            });
            
            if (response.ok) {
                setStatus('success');
                setCustomQuery(''); 
                completeProcess();
                fetchDrafts(); // Fetch newest immediately
            } else {
                setStatus('error');
                failProcess(new Error("Social research workflow failed on the server."));
            }
        } catch (error) {
            console.error('Error triggering research:', error);
            setStatus('error');
            failProcess(error);
        } finally {
            setLoading(false);
        }
    };

    const updateDraftStatus = async (id, status, content = null) => {
        try {
            await fetch(N8N_CONFIG.UPDATE_SOCIAL_DRAFT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ID: id, Status: status, Content: content })
            });
        } catch (e) {
            console.error("Failed to sync Draft update:", e);
        }
    };

    const handleSendEmail = async (idx) => {
        const result = results[idx];
        if (!result) return;
        
        const title = result.Title || result.title || '';
        const link = result.Link || result.link || '';
        const content = getSmartContent(result);

        setSendingStatus(prev => ({ ...prev, [idx]: true }));

        try {
            const response = await axios.post(N8N_CONFIG.SOCIAL_DISPATCH_WEBHOOK, {
                subject: `LinkedIn Opportunity: ${title.substring(0, 50)}...`,
                message: `
                    <h3>Expert LinkedIn Opportunity Found!</h3>
                    <p><strong>Topic:</strong> <a href="${link}" style="color: #FA4D33; font-weight: bold;">${title}</a></p>
                    <div style="background-color: #F9F4F0; padding: 24px; border-radius: 12px; border-left: 5px solid #4F001D; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #4F001D;">Proposed Comments:</h4>
                        <div style="white-space: pre-wrap; line-height: 1.6; color: #172B4D;">${content}</div>
                    </div>
                `
            });

            if (response.data.status === 'success') {
                setResults(results.filter((_, i) => i !== idx)); // Immediately remove from UI
                const id = result.ID || result.id;
                if (id) updateDraftStatus(id, 'Sent', content);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        } finally {
            setSendingStatus(prev => ({ ...prev, [idx]: false }));
        }
    };

    const handleDismiss = (idx) => {
        const result = results[idx];
        setResults(results.filter((_, i) => i !== idx));
        const id = result?.ID || result?.id;
        if (id) {
            updateDraftStatus(id, 'Deleted');
        }
    };

    const handleUpdateContent = (idx, newContent) => {
        const newResults = [...results];
        newResults[idx].Content = newContent;
        newResults[idx].content = newContent; // Fallback
        setResults(newResults);
        
        // Debounce actual db update could go here, for now it updates on Send Mail
    };

    const copyToClipboard = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">SOCIAL GHOST</Badge>
                    <span className="text-slate-200">|</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Profile Authority</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                    LinkedIn <span className="text-accent/70 font-medium">Authority</span>
                </h1>
                <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
                    Convert industry trends into expert authority. Research specific topics and draft high-impact reactions with cognitive agents.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                <Card className="xl:col-span-4 border-slate-100 shadow-sm xl:sticky xl:top-8 overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Target className="text-accent/60" size={20} />
                                Intelligence Probe
                            </CardTitle>
                            <p className="text-sm text-slate-500 font-normal">
                                Define the industry topic or trend to analyze.
                            </p>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                               Trend Analysis Topic
                            </label>
                            <textarea 
                                className="w-full min-h-[160px] bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-sm font-semibold focus:border-accent focus:ring-2 focus:ring-accent/5 transition-all resize-none outline-none placeholder:text-slate-300"
                                placeholder="e.g. Recent shifts in generative AI regulation for FinTech..." 
                                value={customQuery}
                                onChange={(e) => setCustomQuery(e.target.value)}
                            />
                        </div>

                        {loading && (
                            <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-semibold uppercase tracking-widest text-accent animate-pulse">{stages[progressStage]}</span>
                                    <span className="text-[9px] font-semibold text-slate-300">{Math.round(((progressStage + 1) / stages.length) * 100)}%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-accent"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((progressStage + 1) / stages.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        )}

                        <Button 
                            onClick={triggerSocialResearch}
                            disabled={loading || !customQuery.trim()}
                            variant="accent"
                            size="lg"
                            className="w-full h-14 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-accent/20 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Zap className="mr-2 group-hover:rotate-12 transition-transform" size={16} />
                            )}
                            {loading ? "Processing..." : "Run AI Analysis"}
                        </Button>
                    </CardContent>
                </Card>

                <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                         <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                                <History className="text-primary/50" size={20} />
                                Insight Archive
                            </h3>
                            <p className="text-sm text-slate-500 font-normal">Historical intelligence gathered from LinkedIn Perspectives.</p>
                         </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {!loading && results.length === 0 && !status && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="border border-slate-100 bg-white rounded-3xl py-32 flex flex-col items-center justify-center text-center px-10 shadow-sm"
                            >
                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                    <MessageSquare size={28} className="text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-300 uppercase tracking-tight">Pool Empty</h3>
                                <p className="text-slate-300 font-semibold mt-1 uppercase tracking-widest text-[10px]">Execute a research probe to populate insights.</p>
                            </motion.div>
                        )}

                        {results.map((result, idx) => {
                            const title = result.Title || result.title || 'Unknown Post Title';
                            const link = result.Link || result.link || '#';
                            const content = getSmartContent(result);
                            
                            return (
                            <motion.div
                                key={result.ID || idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={cn(
                                    "border-slate-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-accent/10 transition-all duration-300 bg-white",
                                    result.sent && "opacity-60"
                                )}>
                                    <CardHeader className="flex flex-row items-start justify-between p-8 pb-6 border-b border-slate-50 bg-slate-50/30">
                                        <div className="space-y-2 flex-1 pr-10">
                                            <CardTitle className="text-xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                                                {title}
                                            </CardTitle>
                                            <a 
                                                href={link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-[10px] font-semibold text-accent uppercase tracking-wider hover:text-slate-900 transition-colors"
                                            >
                                                Source Authority <ExternalLink size={12} />
                                            </a>
                                        </div>
                                        <Badge variant={result.sent ? "success" : "secondary"} className="bg-white border-slate-100 text-slate-400 font-semibold text-[9px] px-3 py-1 tracking-wider uppercase">
                                            {result.sent ? "DISPATCHED" : "VERIFIED TREND"}
                                        </Badge>
                                    </CardHeader>

                                    <CardContent className="p-8 space-y-6">
                                        <div className="bg-slate-50 p-8 rounded-2xl border-l-4 border-primary relative">
                                            <div className="absolute top-6 right-6 text-primary/10">
                                                <Sparkles size={24} />
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                                <div className="p-1 px-2 bg-primary text-white rounded text-[8px]">GHOST AGENT</div> 
                                                Perspective Draft
                                            </div>
                                            
                                            <textarea 
                                                className="w-full bg-transparent border-none text-lg font-normal text-slate-700 leading-relaxed mb-8 resize-none outline-none focus:ring-0 min-h-[120px]"
                                                value={content}
                                                onChange={(e) => handleUpdateContent(idx, e.target.value)}
                                                disabled={result.sent}
                                            />

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200/50">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        (content || '').length > 280 ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-semibold tracking-wider uppercase",
                                                        (content || '').length > 280 ? "text-red-500" : "text-slate-400"
                                                    )}>
                                                        {(content || '').length} / 300 CHARACTERS
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 w-full md:w-auto">
                                                    {!result.sent && (
                                                        <>
                                                            <Button 
                                                                variant="ghost"
                                                                onClick={() => setPreviewIndex(idx)}
                                                                className="h-10 px-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                            >
                                                                <Maximize2 size={14} /> Preview
                                                            </Button>
                                                            <Button 
                                                                variant="ghost"
                                                                onClick={() => handleDismiss(idx)}
                                                                className="h-10 px-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:bg-red-50 hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </Button>
                                                            <Button 
                                                                variant="primary"
                                                                onClick={() => handleSendEmail(idx)}
                                                                disabled={sendingStatus[idx]}
                                                                className="h-10 px-6 text-[10px] font-semibold uppercase tracking-wider rounded-xl gap-2 shadow-lg shadow-primary/20"
                                                            >
                                                                {sendingStatus[idx] ? (
                                                                    <><Loader2 className="animate-spin" size={14} /> PROCESSING...</>
                                                                ) : (
                                                                    <><Send size={14} /> SEND MAIL</>
                                                                )}
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button 
                                                        variant={copiedIndex === idx ? "outline" : "ghost"}
                                                        onClick={() => copyToClipboard(content, idx)}
                                                        className="h-10 px-4 text-[10px] font-semibold tracking-wider uppercase rounded-xl gap-2"
                                                    >
                                                        {copiedIndex === idx ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {previewIndex !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setPreviewIndex(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                        {results[previewIndex]?.Title || results[previewIndex]?.title || 'Full Insight Preview'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-semibold text-primary border-primary/20 bg-primary/5">GHOST AGENT DRAFT</Badge>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setPreviewIndex(null)}
                                    className="w-10 h-10 p-0 rounded-full hover:bg-slate-200 text-slate-500"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 bg-white">
                                <div className="prose prose-slate max-w-none text-base leading-loose whitespace-pre-wrap text-slate-700">
                                    {getSmartContent(results[previewIndex])}
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <Button 
                                    onClick={() => copyToClipboard(getSmartContent(results[previewIndex]), previewIndex)}
                                    variant={copiedIndex === previewIndex ? "outline" : "secondary"}
                                    className="h-12 px-6 gap-2 text-xs font-semibold uppercase tracking-wider"
                                >
                                    {copiedIndex === previewIndex ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    {copiedIndex === previewIndex ? 'COPIED' : 'COPY ALL'}
                                </Button>
                                <Button 
                                    variant="primary"
                                    disabled={sendingStatus[previewIndex]}
                                    onClick={async () => {
                                        await handleSendEmail(previewIndex);
                                        setPreviewIndex(null);
                                    }}
                                    className="h-12 px-8 text-xs font-semibold uppercase tracking-wider rounded-xl gap-2 shadow-lg shadow-primary/20"
                                >
                                    {sendingStatus[previewIndex] ? (
                                        <><Loader2 className="animate-spin" size={16} /> PROCESSING...</>
                                    ) : (
                                        <><Send size={16} /> SEND MAIL</>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LinkedInAuthority;
