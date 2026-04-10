import React, { useState, useEffect } from 'react';
import { History, RefreshCw, CheckCircle, ExternalLink, Activity, Search, Calendar, User } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      const sentItems = (Array.isArray(response.data) ? response.data : [])
        .filter(item => (item.status || item.Status) === "Sent")
        .reverse();
      setLogs(sentItems);
    } catch (error) {
      console.error("Fetch logs failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.name || log.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.company || log.Company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">AUDIT TRAIL</Badge>
          <span className="text-slate-200">|</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Operation Archive</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Activity <span className="text-primary/70 font-medium">Log</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
          Chronological record of all agentic outreach operations and successful campaign deliveries.
        </p>
      </header>

      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Activity className="text-primary/50" size={22} />
              <CardTitle className="text-xl font-semibold">Dispatched Operations</CardTitle>
            </div>
            <p className="text-sm text-slate-500 font-normal">{logs.length} successful deliveries currently indexed in audit.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  className="w-full h-10 bg-white border border-slate-200 rounded-full pl-10 pr-4 text-xs font-semibold focus:border-primary transition-all outline-none placeholder:text-slate-300"
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchLogs} className="h-10 w-10 rounded-full border-slate-200 bg-white group">
                <RefreshCw size={14} className={cn("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
              </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-8 w-16">Seq</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Payload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-8">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-80">
                    <EmptyState 
                      icon={History}
                      title="Archive is Silent"
                      message="No successful dispatches found matching your current parameters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, i, arr) => (
                  <TableRow key={i} className="group hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 text-[11px] font-normal text-slate-900">#{arr.length - i}</TableCell>
                    <TableCell className="py-5">
                       <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          {(log.name || log.Name || "?")[0]}
                        </div>
                        <div className="space-y-0.5">
                           <div className="font-semibold text-slate-900 text-sm tracking-tight leading-none group-hover:text-primary transition-colors">{log.name || log.Name}</div>
                           <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{log.company || log.Company || "Independent"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm font-normal text-slate-500 line-clamp-1 max-w-sm">{log.subject || log.Subject || "Bulk Intelligence Packet"}</div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100/50 px-3 py-1 font-semibold text-[10px] tracking-tight gap-2">
                          <CheckCircle size={10} className="text-emerald-500" /> DISPATCHED
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex flex-col items-end">
                          <div className="text-xs font-semibold text-slate-900 tracking-tight">{log.timestamp || "Active"}</div>
                          <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">GMT +5:30</div>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Transparency Card */}
      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-8">
         <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-primary/50 shadow-sm flex-shrink-0">
            <Calendar size={24} />
         </div>
         <div className="flex-1 space-y-1">
            <h4 className="font-bold text-slate-900 text-lg tracking-tight leading-none">Enterprise Audit Integrity</h4>
            <p className="text-sm text-slate-500 font-normal leading-relaxed max-w-4xl">This log serves as a immutable record of agentic operations. All successful connections and deliveries are synced automatically from the system kernel.</p>
         </div>
         <div className="flex flex-col md:items-end gap-1 shrink-0">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Operation Observers</div>
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-slate-50 flex items-center justify-center shadow-sm">
                   <User size={12} className="text-slate-400" />
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ActivityLog;
