import React, { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, Clock, RefreshCw, Mail, Sparkles, Navigation, ShieldCheck } from 'lucide-react';
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

const EmailSender = () => {
  const [sending, setSending] = useState(false);
  const { startProcess, completeProcess, failProcess, modalProps } = useProcessTracking();
  const [campaignData, setCampaignData] = useState([]);

  const fetchCampaignStatus = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      setCampaignData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch campaign failed", error);
    }
  };

  useEffect(() => {
    fetchCampaignStatus();
    const interval = setInterval(fetchCampaignStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCampaign = async () => {
    startProcess("Dispatch Campaign", "Initializing relay connection and queueing active drafts for delivery. Our system is currently verifying transport protocols.");
    try {
      await axios.post(N8N_CONFIG.SENDER_WEBHOOK);
      // Typically we wait a few seconds or polling starts
      setTimeout(() => {
        completeProcess();
        fetchCampaignStatus();
      }, 4000);
    } catch (error) {
      failProcess(error);
    }
  };

  const readyToSend = campaignData.filter(l => !(l.status || l.Status || "").trim() && (l.subject || l.Subject || l.email_body || l.Body));

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">DELIVERY TERMINAL</Badge>
            <span className="text-slate-200">|</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Active Dispatch</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Campaign <span className="text-accent/70 font-medium">Sender</span>
          </h1>
          <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
            Operational interface for review and dispatch of high-priority outreach campaigns.
          </p>
        </div>
        
        <Button 
          variant="accent"
          size="lg"
          onClick={handleStartCampaign} 
          disabled={sending || readyToSend.length === 0}
          className="h-14 px-8 font-semibold uppercase tracking-wider text-xs gap-3 shadow-lg shadow-accent/20"
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          {sending ? "Dispatching..." : "Start Dispatch Campaign"}
        </Button>
      </header>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <Card className="border-slate-100 shadow-sm bg-white">
           <CardContent className="p-6">
             <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ready for Delivery</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{readyToSend.length}</h3>
           </CardContent>
         </Card>
         <Card className="border-slate-100 shadow-sm bg-white">
           <CardContent className="p-6">
             <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Synced</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{campaignData.length}</h3>
           </CardContent>
         </Card>
         <Card className="border-slate-100 shadow-sm bg-primary/5 border-primary/10">
           <CardContent className="p-6">
             <p className="text-[11px] font-semibold text-primary/60 uppercase tracking-wider">Dispatch Status</p>
             <div className="flex items-center gap-2 mt-1">
               <div className={cn("w-2 h-2 rounded-full", readyToSend.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
               <h3 className="text-sm font-semibold text-slate-900">{readyToSend.length > 0 ? "Ready to Armed" : "Idle"}</h3>
             </div>
           </CardContent>
         </Card>
      </div>

      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <Clock className="text-slate-400" size={20} />
              Awaiting Dispatch
            </CardTitle>
            <p className="text-sm text-slate-500 font-normal">Verified packets waiting for campaign initialization.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCampaignStatus} className="h-10 px-4 font-semibold text-xs tracking-tight border-slate-200 bg-white">
            <RefreshCw size={14} className="mr-2 text-slate-400" /> Refresh Status
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-8 w-16">Seq</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right pr-8">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readyToSend.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64">
                    <EmptyState 
                      icon={Mail}
                      title="No Packets Ready"
                      message="Ensure personalization is complete before starting dispatch."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                readyToSend.map((l, i, arr) => (
                  <TableRow key={i} className="group hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 text-[11px] font-normal text-slate-900">#{arr.length - i}</TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-primary font-semibold text-xs transition-all group-hover:bg-primary group-hover:text-white">
                            {(l.name || l.Name || "?")[0]}
                         </div>
                         <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 text-sm tracking-tight group-hover:text-primary transition-colors">{l.name || l.Name}</div>
                            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{l.email || l.Email}</div>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-normal text-slate-500 line-clamp-1 max-w-sm">{l.subject || "No Subject Defined"}</div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Badge variant="outline" className="bg-amber-50/50 text-amber-600 border-amber-100/50 px-3 py-1 font-semibold text-[10px] tracking-tight gap-2">
                        <Clock size={10} className="animate-spin text-amber-400" />
                        Awaiting Sync
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSender;
