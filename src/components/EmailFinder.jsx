import React, { useState, useEffect } from 'react';
import { Search, Loader2, Database, RefreshCw, PlusCircle, TrendingUp, Sparkles, Filter, List } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';
import { useProcessTracking } from '../hooks/useProcessTracking';

const EmailFinder = () => {
  const [loading, setLoading] = useState(false);
  const { startProcess, completeProcess, failProcess, modalProps } = useProcessTracking();
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newQuery, setNewQuery] = useState({ query: '', signal: 'Funding' });

  const fetchQueries = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.GET_QUERIES_WEBHOOK);
      setQueries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.warn("Could not fetch queries list.");
    }
  };

  const fetchRecentLeads = async () => {
    try {
      const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch leads failed", error);
    }
  };

  useEffect(() => {
    fetchQueries();
    fetchRecentLeads();
  }, []);

  const handleAddQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Syncing source query...');
    try {
      await axios.post(N8N_CONFIG.SAVE_QUERY_WEBHOOK, { 
        Query: newQuery.query, 
        Signal: newQuery.signal 
      });
      
      setQueries(prev => [{ Query: newQuery.query, Signal: newQuery.signal }, ...prev]);
      setNewQuery({ ...newQuery, query: '' });
      toast.success("Query deployed to discovery pool.", { id: toastId });
      setTimeout(fetchQueries, 3000);
    } catch (error) {
      toast.error("Failed to update lead sheet.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDiscovery = async () => {
    startProcess("Discovery Swarm", "Initializing lead harvester and sector mapping. This may take a few moments as we index new corporate clusters across search indices.");
    try {
      await axios.post(N8N_CONFIG.FINDER_WEBHOOK);
      // Give it a small delay for sheet sync before completion
      setTimeout(() => {
        completeProcess();
        fetchRecentLeads();
      }, 5000);
    } catch (error) {
      failProcess(error);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] py-1 uppercase font-semibold text-slate-400 border-slate-200">LEAD INTELLIGENCE</Badge>
          <span className="text-slate-200">|</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Autonomous Harvester</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Lead <span className="text-primary/70 font-medium">Finder</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
          Operational interface for discovery query management and real-time database indexing.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Manage Search Queries */}
        <Card className="border-slate-100 shadow-sm flex flex-col h-full bg-white">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between py-6 px-8">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Search className="text-primary/50" size={20} />
                Target Queries
              </CardTitle>
              <p className="text-sm text-slate-500 font-normal">Configure search parameters for the discovery swarm.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchQueries} className="text-slate-400 hover:text-primary h-8 w-8">
              <RefreshCw size={14} />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <form onSubmit={handleAddQuery} className="p-8 space-y-4 bg-slate-50/10 border-b border-slate-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/5 transition-all outline-none placeholder:text-slate-300"
                    type="text" 
                    placeholder="e.g. Fintech CEOs in London" 
                    value={newQuery.query}
                    onChange={(e) => setNewQuery({...newQuery, query: e.target.value})}
                    required 
                  />
                </div>
                <select 
                  className="h-11 bg-white border border-slate-200 rounded-xl px-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600 outline-none focus:border-primary transition-all cursor-pointer"
                  value={newQuery.signal} 
                  onChange={(e) => setNewQuery({...newQuery, signal: e.target.value})}
                >
                  <option>Funding</option>
                  <option>Hiring</option>
                  <option>Expansion</option>
                </select>
                <Button type="submit" variant="primary" disabled={loading} className="h-11 px-6 whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                  <PlusCircle size={16} className="mr-2" />
                  Append
                </Button>
              </div>
            </form>

            <div className="flex-1 min-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="pl-8">Source Query</TableHead>
                    <TableHead>Intent Signal</TableHead>
                    <TableHead className="text-right pr-8">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-64">
                         <EmptyState 
                          icon={List}
                          title="No Active Queries"
                          message="Enter a search term above to begin intelligence gathering."
                        />
                      </TableCell>
                    </TableRow>
                  ) : queries.map((q, i) => (
                    <TableRow key={i} className="group hover:bg-slate-50/30 transition-colors">
                      <TableCell className="pl-8 py-5">
                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm leading-tight">
                          "{q.query || q.Query || "No Query"}"
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-[10px] font-semibold">{q.signal || q.Signal}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 text-[10px] font-semibold">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-10">
           {/* CTA Card */}
           <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />
              <CardHeader className="relative z-10 p-10 pb-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={28} className="text-accent" />
                </div>
                <CardTitle className="text-2xl text-white font-bold tracking-tight leading-tight">
                  Launch Intelligent <br /> Discovery Swarm
                </CardTitle>
                <p className="text-white/60 font-normal text-sm mt-2">
                  Execute cross-platform scans for {queries.length} active queries.
                </p>
              </CardHeader>
              <CardContent className="relative z-10 p-10 pt-6">
                <Button 
                  variant="accent"
                  size="lg"
                  onClick={handleTriggerDiscovery} 
                  disabled={loading}
                  className="w-full h-14 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-accent/20 group/btn"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} className="mr-2 group-hover/btn:translate-x-1 transition-transform" />}
                  Process Intelligence
                </Button>
              </CardContent>
           </Card>

           {/* Quick Stats/Tip Card */}
           <Card className="border-slate-100 bg-white shadow-sm overflow-hidden">
             <CardContent className="p-8 flex gap-6">
               <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary/50 flex-shrink-0">
                 <Filter size={20} />
               </div>
               <div className="space-y-1">
                 <h4 className="font-bold text-slate-900 text-sm">Optimization Tip</h4>
                 <p className="text-sm text-slate-500 leading-relaxed font-normal">For maximum accuracy, use niche-specific queries like <span className="text-primary font-semibold">"SaaS Founders in San Francisco"</span> instead of generic terms.</p>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Verified Leads Live Feed */}
      <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-50 bg-slate-50/30 p-8 px-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary/50" size={22} />
              <CardTitle className="text-xl font-semibold">Verified Results Feed</CardTitle>
            </div>
            <p className="text-sm text-slate-500 font-normal">Real-time incoming leads verified by the agentic discovery loop.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                className="w-full h-10 bg-white border border-slate-200 rounded-full pl-10 pr-4 text-xs font-semibold focus:border-primary transition-all outline-none placeholder:text-slate-300"
                type="text" 
                placeholder="Filter database..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchRecentLeads} className="rounded-full h-10 w-10 border-slate-200 bg-white group">
              <RefreshCw size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-10 w-20">Rank</TableHead>
                <TableHead>Lead Information</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="text-right pr-10">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-80">
                    <EmptyState 
                      icon={Search}
                      title="No Leads Found"
                      message="Run a discovery swarm scan to identify target corporate leads."
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
                    <TableCell className="pl-10 text-[11px] font-normal text-slate-900">#{arr.length - i}</TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          {(r.name || r.Name || "?")[0]}
                        </div>
                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors tracking-tight text-sm leading-none">{r.name || r.Name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-normal text-sm">{r.company || r.Company || "Independent"}</TableCell>
                    <TableCell className="text-right pr-10">
                      <Badge variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100/50 px-3 py-1 text-[10px] font-semibold tracking-tight gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         SHARP VERIFIED
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

export default EmailFinder;
