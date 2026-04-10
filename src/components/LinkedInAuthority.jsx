import React, { useState, useEffect } from 'react';
import { Share2, Zap, MessageSquare, ExternalLink, Loader2, Copy, CheckCircle, ArrowRight, Sparkles, Target, History } from 'lucide-react';
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
    const { startProcess, completeProcess, failProcess } = useProcessTracking();

    const stages = [
        "Initializing research swarm...",
        "Identifying industry perspectives...",
        "Scraping relevant LinkedIn discussions...",
        "Cognitive analysis of trend data...",
        "Drafting authority comment options...",
        "Finalizing intelligence output..."
    ];

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
        setResults([]);
        startProcess("Social Authority Analysis", "Our cognitive agents are currently probing LinkedIn for the latest industry perspectives and trend data. We are drafting expert-level reactions based on real-time intelligence.");
        
        try {
            const response = await fetch(N8N_CONFIG.RESEARCH_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: customQuery }),
            });
            
            if (response.ok) {
                const data = await response.json();
                const formattedResults = Array.isArray(data) ? data : [data];
                setResults(formattedResults);
                setStatus('success');
                setCustomQuery(''); 
                completeProcess();
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

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
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
                {/* Left Column: Research Input */}
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

                {/* Right Column: Insight Feed */}
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

                        {results.map((result, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-accent/10 transition-all duration-300 bg-white">
                                    <CardHeader className="flex flex-row items-start justify-between p-8 pb-6 border-b border-slate-50 bg-slate-50/30">
                                        <div className="space-y-2 flex-1 pr-10">
                                            <CardTitle className="text-xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                                                {result.title}
                                            </CardTitle>
                                            <a 
                                                href={result.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-[10px] font-semibold text-accent uppercase tracking-wider hover:text-slate-900 transition-colors"
                                            >
                                                Source Authority <ExternalLink size={12} />
                                            </a>
                                        </div>
                                        <Badge variant="secondary" className="bg-white border-slate-100 text-slate-400 font-semibold text-[9px] px-3 py-1 tracking-wider">VERIFIED TREND</Badge>
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
                                            
                                            <p className="text-lg font-normal text-slate-700 leading-relaxed mb-8">
                                                "{result.content}"
                                            </p>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200/50">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        (result.content || '').length > 280 ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-semibold tracking-wider uppercase",
                                                        (result.content || '').length > 280 ? "text-red-500" : "text-slate-400"
                                                    )}>
                                                        {(result.content || '').length} / 300 CHARACTERS
                                                    </span>
                                                </div>

                                                <Button 
                                                    variant={copiedIndex === idx ? "outline" : "primary"}
                                                    onClick={() => copyToClipboard(result.content, idx)}
                                                    className="w-full md:w-auto h-12 px-8 text-[10px] font-semibold tracking-wider uppercase rounded-xl gap-2"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <><CheckCircle size={16} className="text-emerald-500" /> Copied</>
                                                    ) : (
                                                        <><Copy size={16} /> Copy Draft</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LinkedInAuthority;
