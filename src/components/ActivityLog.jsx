import React, { useState, useEffect } from 'react';
import { History, RefreshCw, CheckCircle, Search, Calendar } from 'lucide-react';
import axios from 'axios';
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

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => 
    (log.name || log.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.company || log.Company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Log</h1>
        <p className="text-sm text-slate-500 max-w-lg">Record of all outreach deliveries.</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="text-slate-400" size={16} />
              Dispatched Operations
            </CardTitle>
            <CardDescription className="text-xs">{logs.length} deliveries indexed</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                className="h-8 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-xs font-medium outline-none placeholder:text-slate-400 w-44 focus:w-52 transition-all"
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchLogs} className="h-8 w-8 text-slate-400">
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 w-12">#</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-5">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState icon={History} title="No Activity" message="Sent emails will appear here." />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.map((log, i, arr) => (
                <TableRow key={i} className="group">
                  <TableCell className="pl-5 text-xs text-slate-400">#{arr.length - i}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                        {(log.name || log.Name || "?")[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{log.name || log.Name}</div>
                        <div className="text-[11px] text-slate-400">{log.company || log.Company || "Independent"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">{log.subject || log.Subject || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle size={10} /> Sent
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <span className="text-xs text-slate-500">{log.timestamp || "Active"}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit note */}
      <Card className="p-5">
        <div className="flex gap-4 items-start">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
            <Calendar size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Audit Trail</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">All deliveries are synced automatically from the n8n engine.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityLog;
