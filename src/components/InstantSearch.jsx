import React, { useState, useEffect } from 'react';
import { Search, Database, RefreshCw, Zap, TrendingUp, Target } from 'lucide-react';
import axios from 'axios';
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

  useEffect(() => { fetchRecentLeads(); }, []);

  const handleDirectSearch = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    startProcess("High-Priority Extraction", "Probing for high-intent corporate patterns.");
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
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Instant Search</h1>
        <p className="text-sm text-slate-500 max-w-lg">Real-time targeted extraction for high-priority leads.</p>
      </header>

      {/* Search Form */}
      <Card>
        <CardHeader className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="text-accent" size={16} />
                Targeted Extraction
              </CardTitle>
              <CardDescription className="text-xs">Configure for a single-pass extraction burst</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/5 rounded-md border border-accent/10">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-medium text-accent">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleDirectSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Industry</label>
              <input 
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400"
                type="text" placeholder="e.g. Fintech" 
                value={formSearch.industry}
                onChange={(e) => setFormSearch({...formSearch, industry: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Intent Signal</label>
              <input 
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400"
                type="text" placeholder="e.g. Recently Funded" 
                value={formSearch.signal}
                onChange={(e) => setFormSearch({...formSearch, signal: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Filter</label>
              <input 
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium focus:border-accent/30 focus:ring-2 focus:ring-accent/10 transition-all outline-none placeholder:text-slate-400"
                type="text" placeholder="e.g. Post-Seed" 
                value={formSearch.filter}
                onChange={(e) => setFormSearch({...formSearch, filter: e.target.value})}
                required 
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="accent" loading={formLoading} className="w-full h-10 text-xs font-semibold gap-2">
                <Database size={14} /> Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="text-slate-400" size={16} />
              Results
            </CardTitle>
            <CardDescription className="text-xs">Prioritized for high-intent extraction</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                className="h-8 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-xs font-medium outline-none placeholder:text-slate-400 w-44 focus:w-52 transition-all"
                type="text" placeholder="Filter..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchRecentLeads} className="h-8 w-8 text-slate-400">
              <RefreshCw size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 w-12">#</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="text-right pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState icon={Zap} title="No Results" message="Run a targeted extraction to begin." />
                  </TableCell>
                </TableRow>
              ) : results
                  .filter(r => 
                    (r.name || r.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.company || r.Company || "").toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .reverse()
                  .map((r, i, arr) => (
                <TableRow key={i} className="group">
                  <TableCell className="pl-5 text-xs text-slate-400">#{arr.length - i}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                        {(r.name || r.Name || "?")[0]}
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{r.name || r.Name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{r.company || r.Company || "Undisclosed"}</TableCell>
                  <TableCell className="text-right pr-5">
                    <Badge variant="success" className="text-[10px]">Verified</Badge>
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
