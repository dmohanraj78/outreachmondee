import React, { useState, useEffect } from 'react';
import { Search, Database, RefreshCw, PlusCircle, TrendingUp, Sparkles, List } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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
  const { startProcess, completeProcess, failProcess } = useProcessTracking();
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
      toast.success("Query deployed.", { id: toastId });
      setTimeout(fetchQueries, 3000);
    } catch (error) {
      toast.error("Failed to save query.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDiscovery = async () => {
    startProcess("Discovery Swarm", "Scanning for verified corporate leads.", [
      "Serper Discovery", "Jina Scraping", "AI Extraction", "LinkedIn Mapping", "Email Verification"
    ]);
    try {
      await axios.post(N8N_CONFIG.FINDER_WEBHOOK);
    } catch (error) {
      failProcess(error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Finder</h1>
        <p className="text-sm text-slate-500 max-w-lg">
          Manage discovery queries and run intelligence scans.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Queries */}
        <Card className="flex flex-col h-full">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between p-5">
            <div className="space-y-0.5">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="text-slate-400" size={16} />
                Target Queries
              </CardTitle>
              <CardDescription className="text-xs">Configure search parameters</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchQueries} className="h-8 w-8 text-slate-400">
              <RefreshCw size={14} />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <form onSubmit={handleAddQuery} className="p-5 space-y-3 border-b border-slate-100">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm font-medium focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                    type="text" 
                    placeholder="e.g. Fintech CEOs in London" 
                    value={newQuery.query}
                    onChange={(e) => setNewQuery({...newQuery, query: e.target.value})}
                    required 
                  />
                </div>
                <select 
                  className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs font-medium text-slate-600 outline-none cursor-pointer"
                  value={newQuery.signal} 
                  onChange={(e) => setNewQuery({...newQuery, signal: e.target.value})}
                >
                  <option>Funding</option>
                  <option>Hiring</option>
                  <option>Expansion</option>
                </select>
                <Button type="submit" loading={loading} className="h-10 px-4 text-xs gap-1.5">
                  <PlusCircle size={14} />
                  Add
                </Button>
              </div>
            </form>

            <div className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Query</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead className="text-right pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <EmptyState icon={List} title="No Queries" message="Add a search term above to begin." />
                      </TableCell>
                    </TableRow>
                  ) : queries.map((q, i) => (
                    <TableRow key={i} className="group">
                      <TableCell className="pl-5">
                        <span className="font-medium text-slate-900 text-sm">"{q.query || q.Query}"</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{q.signal || q.Signal}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Badge variant="success" className="text-[10px]">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="space-y-4">
          <Card className="bg-[#4F001D] text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 -mr-20 -mt-20 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="relative z-10 p-6 pb-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-accent" />
              </div>
              <CardTitle className="text-white text-lg font-semibold">Launch Discovery</CardTitle>
              <p className="text-white/50 text-xs mt-1">Scan for {queries.length} active queries.</p>
            </CardHeader>
            <CardContent className="relative z-10 p-6 pt-3">
              <Button variant="accent" onClick={handleTriggerDiscovery} disabled={loading} className="w-full h-10 text-xs font-semibold gap-2">
                <TrendingUp size={14} /> Run Swarm
              </Button>
            </CardContent>
          </Card>

          <Card className="p-5">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Database size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Tip</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Use niche queries like <span className="text-primary font-medium">"SaaS Founders in SF"</span> for best results.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="text-slate-400" size={16} />
              Verified Results
            </CardTitle>
            <CardDescription className="text-xs">Leads verified by discovery swarm</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                className="h-8 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-xs font-medium outline-none placeholder:text-slate-400 w-48 focus:w-56 transition-all"
                type="text" 
                placeholder="Filter..." 
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
                    <EmptyState icon={Search} title="No Leads" message="Run a discovery scan to find leads." />
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
                  <TableCell className="text-slate-500 text-sm">{r.company || r.Company || "Independent"}</TableCell>
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

export default EmailFinder;
