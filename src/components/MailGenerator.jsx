import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Send, FileText, Mail, PenTool, CheckCircle, Clock } from 'lucide-react';
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
  const { startProcess, completeProcess, failProcess } = useProcessTracking();
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
    const interval = setInterval(() => { fetchPending(); fetchDrafts(); }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateAll = async () => {
    startProcess("Personalization Swarm", "Crafting custom outreach drafts for each lead.");
    try {
      await axios.post(N8N_CONFIG.PERSONALIZATION_WEBHOOK);
      setTimeout(() => { completeProcess(); fetchPending(); fetchDrafts(); }, 5000);
    } catch (error) { failProcess(error); }
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
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Personalization</h1>
        <p className="text-sm text-slate-500 max-w-lg">Generate custom outreach drafts using AI intelligence.</p>
      </header>

      {/* Pending Queue */}
      <Card>
        <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="text-slate-400" size={16} />
              Draft Queue
            </CardTitle>
            <CardDescription className="text-xs">{filteredPending.length} leads ready for personalization</CardDescription>
          </div>
          <Button onClick={handleGenerateAll} disabled={loading || filteredPending.length === 0} className="h-9 px-5 text-xs gap-2">
            <Sparkles size={14} />
            Generate All Drafts
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPending.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Lead</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right pr-5">Readiness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPending.map((l, i) => (
                  <TableRow key={i} className="group">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                          {(l.name || l.Name || "?")[0]}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{l.name || l.Name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{l.company || l.Company}</TableCell>
                    <TableCell className="text-right pr-5">
                      <Badge variant="secondary" className="text-[10px]">Qualified</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={CheckCircle} title="Queue Clear" message="All leads have been processed." />
          )}
        </CardContent>
      </Card>

      {/* Drafts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="text-slate-400" size={16} />
              AI Drafts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{validDrafts.length} drafts generated</p>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchDrafts} className="h-8 w-8 text-slate-400">
            <RefreshCw size={14} />
          </Button>
        </div>
        
        {validDrafts.length === 0 ? (
          <Card>
            <EmptyState icon={FileText} title="No Drafts" message="Drafts will appear here after processing." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {validDrafts.map((d, i) => {
                const isSent = (d.status || d.Status) === "Sent";
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={cn("h-full", isSent && "opacity-60")}>
                      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {(d.name || d.Name || "?")[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{d.name || d.Name}</div>
                            <div className="text-xs text-slate-400">{d.company || d.Company}</div>
                          </div>
                        </div>
                        <Badge variant={isSent ? "success" : "info"} className="text-[10px]">
                          {isSent ? 'Sent' : 'Draft'}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 space-y-3">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-[10px] font-medium text-slate-400 mb-1">Subject</div>
                          <div className="text-sm font-semibold text-slate-900">{d.subject || d.Subject}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-100">
                          <div className="text-[10px] font-medium text-slate-400 mb-1">Message</div>
                          <div className="text-sm text-slate-600 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                            {d.email_body || d.Body}
                          </div>
                        </div>
                        {!isSent && (
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              <span className="text-[10px] text-slate-400">Ready to send</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">Edit</Button>
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
