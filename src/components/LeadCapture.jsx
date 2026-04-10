import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, RefreshCw, LayoutTemplate, Monitor, ExternalLink, Globe, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

const LeadCapture = () => {
    const [formUrl, setFormUrl] = useState(() => {
        return localStorage.getItem('miraee_capture_url') || '';
    });
    
    const [inputUrl, setInputUrl] = useState(formUrl);

    const saveUrlConfig = (e) => {
        e.preventDefault();
        let finalUrl = inputUrl.trim();
        if (finalUrl && !finalUrl.startsWith('http')) {
            finalUrl = 'https://' + finalUrl;
        }

        setFormUrl(finalUrl);
        setInputUrl(finalUrl);
        localStorage.setItem('miraee_capture_url', finalUrl);
        toast.success("Operational Sync: Global capture endpoint locked.");
    };

    return (
        <div className="flex flex-col space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">LIVE VIEWPORT</Badge>
                      <span className="text-slate-200">|</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Operational Sync</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Lead <span className="text-accent/70 font-medium">Capture</span>
                    </h1>
                    <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
                        Interface for synchronizing and monitoring external acquisition endpoints within the environment.
                    </p>
                </div>
            </header>

            {/* Viewport Control Terminal */}
            <Card className="border-slate-100 shadow-sm shrink-0 overflow-hidden bg-white">
                <form onSubmit={saveUrlConfig} className="p-8 flex flex-col lg:flex-row gap-6 items-center bg-slate-50/30">
                    <div className="flex items-center gap-4 flex-1 w-full bg-white border border-slate-200 rounded-2xl px-6 h-14 group hover:border-accent/30 focus-within:border-accent/50 transition-all shadow-sm">
                        <Globe size={18} className="text-slate-300 group-hover:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Connect external form URL (e.g., Typeform, Tally, Custom)..." 
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-semibold text-slate-900 flex-1 focus:ring-0 placeholder:text-slate-300"
                        />
                    </div>
                    
                    <div className="flex gap-4 w-full lg:w-auto">
                        <Button 
                            type="submit" 
                            variant="accent" 
                            disabled={inputUrl === formUrl}
                            className="h-14 px-8 font-semibold tracking-wide text-xs uppercase gap-3 shadow-lg shadow-accent/20 flex-1 lg:flex-none"
                        >
                            <Save size={16} /> Initialize Endpoint
                        </Button>
                        
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                                const currentUrl = formUrl;
                                setFormUrl('');
                                setTimeout(() => setFormUrl(currentUrl), 100);
                            }} 
                            className="h-14 w-14 p-0 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 flex-shrink-0"
                            title="Reset Terminal Connection"
                        >
                            <RefreshCw size={20} className="text-slate-400" />
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Embedded Viewport Wrapper */}
            <motion.div 
                layout
                className={cn(
                    "flex-1 min-h-[500px] overflow-hidden rounded-3xl border border-slate-100 transition-all duration-700 bg-white",
                    !formUrl && "bg-slate-50 border-dashed border-slate-200 flex items-center justify-center p-20"
                )}
            >
                <AnimatePresence mode="wait">
                    {!formUrl ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col items-center gap-8 text-center"
                        >
                            <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-sm">
                                <LayoutTemplate size={32} className="text-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-300 tracking-tight uppercase">Terminal Decoupled</h2>
                                <p className="text-sm font-semibold text-slate-300 max-w-sm uppercase tracking-widest leading-relaxed">Define a capture endpoint above to synchronize the live viewport.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="iframe"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full relative"
                        >
                           <div className="absolute top-6 left-6 z-10">
                              <Badge variant="outline" className="bg-white/90 backdrop-blur-md border-slate-200 py-2 px-4 text-[10px] font-semibold tracking-wide gap-2 shadow-sm">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 SECURE CONNECTION ACTIVE
                              </Badge>
                           </div>
                           
                           <div className="absolute top-6 right-6 z-10 flex gap-3">
                                <a href={formUrl} target="_blank" rel="noopener noreferrer">
                                   <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md border-slate-200 shadow-sm hover:scale-105 transition-transform">
                                       <ExternalLink size={16} className="text-slate-600" />
                                   </Button>
                                </a>
                            </div>
                            
                            <div className="w-full h-full p-4 md:p-6 pt-20 md:pt-20">
                               <div className="w-full h-full rounded-2xl border border-slate-100 overflow-hidden shadow-inner bg-slate-50 relative group">
                                  <iframe 
                                      src={formUrl} 
                                      className="w-full h-full border-none bg-white transition-opacity duration-700"
                                      title="Embedded Operational Endpoint"
                                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  />
                               </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LeadCapture;
