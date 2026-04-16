import React, { useState, useEffect } from 'react';
import { Send, Clock, RefreshCw, Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';
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
  const { startProcess, completeProcess, failProcess } = useProcessTracking();
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
    startProcess("Dispatch Campaign", "Queueing drafts for delivery.", [
      "Connecting Relay", "Queueing Drafts", "Transport Verification", "Final Dispatch"
    ]);
    try {
      await axios.post(N8N_CONFIG.SENDER_WEBHOOK);
    } catch (error) {
      failProcess(error);
    }
  };

  const readyToSend = campaignData.filter(l => !(l.status || l.Status || "").trim() && (l.subject || l.Subject || l.email_body || l.Body));

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mail Sender</h1>
          <p className="text-sm text-slate-500 max-w-lg">Review and dispatch outreach campaigns.</p>
        </div>
        <Button variant="accent" onClick={handleStartCampaign} disabled={sending || readyToSend.length === 0} className="h-10 px-6 text-xs font-semibold gap-2">
          <Send size={14} />
          {sending ? "Dispatching..." : "Start Campaign"}
        </Button>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Ready</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{readyToSend.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Total Synced</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{campaignData.length}</h3>
          </CardContent>
        </Card>
        <Card className={cn(readyToSend.length > 0 && "border-primary/20 bg-primary/[0.02]")}>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", readyToSend.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              <span className="text-sm font-semibold text-slate-900">{readyToSend.length > 0 ? "Ready" : "Idle"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="text-slate-400" size={16} />
              Dispatch Queue
            </CardTitle>
            <CardDescription className="text-xs">Verified drafts awaiting delivery</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchCampaignStatus} className="h-8 text-xs gap-1.5 text-slate-400">
            <RefreshCw size={14} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 w-12">#</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readyToSend.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState icon={Mail} title="Queue Empty" message="Complete personalization first." />
                  </TableCell>
                </TableRow>
              ) : readyToSend.map((l, i, arr) => (
                <TableRow key={i} className="group">
                  <TableCell className="pl-5 text-xs text-slate-400">#{arr.length - i}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                        {(l.name || l.Name || "?")[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{l.name || l.Name}</div>
                        <div className="text-[11px] text-slate-400">{l.email || l.Email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">{l.subject || "No Subject"}</TableCell>
                  <TableCell className="text-right pr-5">
                    <Badge variant="warning" className="text-[10px] gap-1">
                      <Clock size={10} /> Queued
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSender;
