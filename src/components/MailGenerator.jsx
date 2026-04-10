import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw, Send, FileText, User, Mail, PenTool, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';
import { useProcessTracking } from '../hooks/useProcessTracking';

const MailGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { startProcess, completeProcess, failProcess, modalProps } = useProcessTracking();
  const [drafts, setDrafts] = useState([]);
  const [pendingLeads, setPendingLeads] = useState([]);

  const fetchPending = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      setPendingLeads(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error(e); }
  };

  const fetchDrafts = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      setDrafts(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPending();
    fetchDrafts();

    const interval = setInterval(() => {
      fetchPending();
      fetchDrafts();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateAll = async () => {
    startProcess("Personalization Swarm", "Synthesizing corporate intelligence into custom-crafted outreach drafts. Our AI is currently modeling the ideal conversation hook for each lead.");
    try {
      await axios.post(N8N_CONFIG.PERSONALIZATION_WEBHOOK);
      setTimeout(() => {
        completeProcess();
        fetchPending();
        fetchDrafts();
      }, 5000);
    } catch (error) {
      failProcess(error);
    }
  };

  const filteredPending = pendingLeads.filter(lead => {
    const leadEmail = (lead.email || lead.Email || "").toLowerCase();
    return !drafts.some(draft => 
      (draft.email || draft.Email || "").toLowerCase() === leadEmail && 
      (draft.subject || draft.Subject || draft.email_body || draft.Body || (draft.status || draft.Status) === "Sent")
    );
  });

  const validDrafts = drafts.filter(d => 
    (d.subject || d.Subject || d.email_body || d.Body || (d.status || d.Status) === "Sent")
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">AI PERSONALIZATION</Badge>
          <span className="text-slate-200">|</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Cognitive Drafting</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
          Personalization <span className="text-primary/70 font-medium">Engine</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
          Transform raw intelligence into custom-crafted outreach using our advanced cognitive drafting protocols.
        </p>
      </header>

      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Clock className="text-primary/50" size={24} />
              Draught Pool
            </CardTitle>
            <p className="text-sm text-slate-500 font-normal">
               {filteredPending.length} intelligence nodes are qualified for personalization.
            </p>
          </div>
          <Button 
            variant="primary"
            size="lg"
            onClick={handleGenerateAll} 
            disabled={loading || filteredPending.length === 0}
            className="w-full md:w-auto h-14 px-10 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-primary/20 group"
          >
            {loading ? <Loader2 className="animate-spin text-white" size={18} /> : <Sparkles className="text-accent" size={18} />}
            {loading ? 'Drafting...' : 'Initialize All Drafts'}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPending.length > 0 ? (
            <Table>
               <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="pl-10">Lead Identity</TableHead>
                  <TableHead>Target Organization</TableHead>
                  <TableHead className="text-right pr-10">Readiness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPending.map((l, i) => (
                   <TableRow key={i} className="group hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-10 py-5">
                       <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-primary font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-all">
                          {(l.name || l.Name || "?")[0]}
                        </div>
                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors tracking-tight text-sm leading-none">{l.name || l.Name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-normal text-sm">
                       {l.company || l.Company}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                       <Badge variant="secondary" className="bg-slate-50 text-slate-400 font-semibold text-[9px] tracking-wider py-1 px-3">QUALIFIED</Badge>
                    </TableCell>
                   </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-20 text-center">
               <EmptyState 
                icon={CheckCircle}
                title="Personalization Queue Clear"
                message="All discovered leads have been successfully processed or handled."
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-8 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
             <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
               <Mail className="text-primary/50" size={24} />
               Active AI Drafts
             </h2>
             <p className="text-sm font-normal text-slate-500">Total generated drafts ready for review: {validDrafts.length}</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchDrafts} className="rounded-full w-10 h-10 border-slate-200 bg-white group shadow-sm">
            <RefreshCw size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </div>
        
        {validDrafts.length === 0 ? (
           <Card className="border-slate-100 bg-slate-50/20 py-20">
             <CardContent>
               <EmptyState 
                icon={FileText}
                title="Draft Archive Empty"
                message="Your custom-crafted email drafts will manifest here after processing."
              />
             </CardContent>
           </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <AnimatePresence>
              {validDrafts.map((d, i) => {
                const isSent = (d.status || d.Status) === "Sent";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={cn(
                      "group border-slate-100 hover:shadow-md hover:border-primary/10 transition-all duration-300 overflow-hidden bg-white",
                      isSent && "opacity-60"
                    )}>
                      <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                             {(d.name || d.Name || "?")[0]}
                           </div>
                           <div className="space-y-1">
                              <div className="font-bold text-slate-900 text-lg tracking-tight leading-none">{d.name || d.Name}</div>
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">{d.company || d.Company}</div>
                           </div>
                        </div>
                        <Badge variant={isSent ? "success" : "primary"} className={cn(
                          "px-3 py-1 font-semibold text-[9px] tracking-wider",
                          isSent ? "bg-emerald-50 text-emerald-600 border-none" : "bg-primary/5 text-primary border-primary/10"
                        )}>
                           {isSent ? 'DISPATCHED' : 'DRAFT READY'}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                           <div className="flex items-start gap-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary/50 shadow-sm flex-shrink-0">
                                 <FileText size={12} />
                              </div>
                              <div className="flex-1 space-y-1 pt-0.5">
                                 <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Intelligence Hook</div>
                                 <div className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                                   {d.subject || d.Subject}
                                 </div>
                              </div>
                           </div>

                           <div className="relative p-6 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:border-primary/5 transition-all">
                              <div className="absolute top-4 right-4 text-emerald-500/10">
                                 <Sparkles size={20} />
                              </div>
                              <div className="text-[9px] font-semibold text-slate-300 uppercase tracking-wider mb-3">Crafted Content</div>
                              <div className="text-sm font-normal text-slate-600 leading-relaxed max-h-[220px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
                                 {d.email_body || d.Body}
                              </div>
                           </div>
                        </div>
                        
                        {!isSent && (
                          <div className="pt-2 flex items-center justify-between gap-4">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Optimized for Conversion</span>
                             </div>
                             <Button variant="ghost" size="sm" className="text-primary font-semibold text-[10px] uppercase tracking-wider hover:bg-primary/5 h-8">
                                Edit Draft
                             </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailGenerator;
