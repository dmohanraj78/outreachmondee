import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, RefreshCw, Zap, TrendingUp, Filter, Target } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';
import { useProcessTracking } from '../hooks/useProcessTracking';

const InstantSearch = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formSearch, setFormSearch] = useState({ industry: '', signal: '', filter: '' });
  const [formLoading, setFormLoading] = useState(false);
  const { startProcess, completeProcess, failProcess } = useProcessTracking();

  const fetchRecentLeads = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch leads failed", error);
    }
  };

  useEffect(() => {
    fetchRecentLeads();
  }, []);

  const handleDirectSearch = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    // Miraee Contextual Labels for AI Extraction
    const nodeLabels = [
      "Initiating Cluster Probe...",
      "Identifying Industry Signals...",
      "Scraping Identity Fragments...",
      "Cognitive Synthesis Node...",
      "Validating Lead Accuracy...",
      "Mapping Target Matrix...",
      "Finalizing Protocol Sync...",
      "Optimizing Extraction Result..."
    ];

    startProcess("High-Priority Extraction", "Initializing direct AI-extraction node. We are currently probing selected clusters for high-intent corporate patterns.", nodeLabels);
    
    try {
      await axios.post(N8N_CONFIG.DIRECT_FINDER_WEBHOOK, {
        "Target Industry / Query": formSearch.industry,
        "signal": formSearch.signal,
        "filter": formSearch.filter
      });

      await fetchRecentLeads();
      completeProcess();
    } catch (error) {
      failProcess(error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">TARGETED PROBE</Badge>
          <span className="text-slate-200">|</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Real-time Extraction</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
          Instant <span className="text-accent/70 font-medium">Search</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
          Locate high-priority targets in real-time with our direct AI-extraction intelligence node.
        </p>
      </header>

      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <Target className="text-accent/60" size={22} />
                High-Priority Extraction
              </CardTitle>
              <p className="text-sm text-slate-500 font-normal">Configure parameters for a dedicated, single-pass extraction burst.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/5 rounded-full border border-accent/10">
               <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
               <span className="text-[9px] font-semibold text-accent uppercase tracking-widest">Priority Line Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleDirectSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                Target Industry
              </label>
              <input 
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-accent focus:ring-2 focus:ring-accent/5 transition-all outline-none placeholder:text-slate-300"
                type="text" 
                placeholder="e.g. Fintech" 
                value={formSearch.industry}
                onChange={(e) => setFormSearch({...formSearch, industry: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                Intent Signal
              </label>
              <input 
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-accent focus:ring-2 focus:ring-accent/5 transition-all outline-none placeholder:text-slate-300"
                type="text" 
                placeholder="e.g. Recently Funded" 
                value={formSearch.signal}
                onChange={(e) => setFormSearch({...formSearch, signal: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                Batch Filter
              </label>
              <input 
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-accent focus:ring-2 focus:ring-accent/5 transition-all outline-none placeholder:text-slate-300"
                type="text" 
                placeholder="e.g. Post-Seed" 
                value={formSearch.filter}
                onChange={(e) => setFormSearch({...formSearch, filter: e.target.value})}
                required 
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="accent" disabled={formLoading} className="w-full h-11 font-semibold tracking-wide text-xs uppercase shadow-md shadow-accent/20">
                {formLoading ? <Loader2 className="animate-spin text-white" /> : <Database size={16} className="mr-2" />}
                Dispatch Extractor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary/50" size={20} />
              <CardTitle className="text-xl font-semibold">Targeted Feed</CardTitle>
            </div>
            <p className="text-sm text-slate-500 font-normal">Results prioritized for high-intent extraction.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                className="w-full h-10 bg-white border border-slate-200 rounded-full pl-10 pr-4 text-xs font-semibold focus:border-primary transition-all outline-none placeholder:text-slate-300"
                type="text" 
                placeholder="Probe results..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchRecentLeads} className="h-10 w-10 rounded-full border-slate-200 bg-white group">
              <RefreshCw size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-8 w-16">Seq</TableHead>
                <TableHead>Founder Information</TableHead>
                <TableHead>Target Identity</TableHead>
                <TableHead className="text-right pr-8">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-80">
                    <EmptyState 
                      icon={Zap}
                      title="No Results Found"
                      message="Initiate a targeted extraction above to begin real-time data flow."
                    />
                  </TableCell>
                </TableRow>
              ) : results
                  .filter(r => 
                    (r.name || r.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.company || r.Company || "").toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .reverse()
                  .map((r, i, arr) => (
                  <TableRow key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-8 text-[11px] font-normal text-slate-900">#{arr.length - i}</TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          {(r.name || r.Name || "?")[0]}
                        </div>
                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors tracking-tight text-sm leading-none">{r.name || r.Name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-normal text-sm">{r.company || r.Company || "Undisclosed"}</TableCell>
                    <TableCell className="text-right pr-8">
                      <Badge variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100/50 px-3 py-1 font-semibold text-[10px] tracking-tight gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         DEEP VERIFIED
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

export default InstantSearch;
