import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Zap, 
  TrendingUp, 
  Search, 
  MessageSquare,
  ArrowRight,
  Activity,
  HeartPulse,
  ShieldCheck,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import { useProcessTracking } from '../hooks/useProcessTracking';

const Dashboard = () => {
  const [stats, setStats] = useState({
    queries: 0,
    leads: 0,
    sent: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);
  const { startProcess, completeProcess, failProcess } = useProcessTracking();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const queriesRes = await axios.get(N8N_CONFIG.GET_QUERIES_WEBHOOK);
      const queriesCount = Array.isArray(queriesRes.data) ? queriesRes.data.length : 0;

      const leadsRes = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
      const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
      const leadsCount = leads.length;

      const sentRes = await axios.get(N8N_CONFIG.DRAFTS_FETCHER_WEBHOOK);
      const allItems = Array.isArray(sentRes.data) ? sentRes.data : [];
      const sentCount = allItems.filter(item => (item.status || item.Status) === "Sent").length;
      const pendingCount = allItems.filter(item => (item.status || item.Status) === "Draft Ready").length;

      setStats({
        queries: queriesCount,
        leads: leadsCount,
        sent: sentCount,
        pending: pendingCount
      });

      setRecentLeads(leads.slice(-6).reverse());
    } catch (error) {
      console.error("Dashboard data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunDiscovery = async () => {
    startProcess("Universal Discovery Swarm", "Initializing cross-platform intelligence scan. We are currently searching for verified corporate identities across multiple cloud nodes.");
    try {
      await axios.post(N8N_CONFIG.FINDER_WEBHOOK);
      // Give it a small delay for sheet sync before completion
      setTimeout(() => {
        completeProcess();
        fetchDashboardData();
      }, 5000);
    } catch (error) {
      failProcess(error);
    }
  };

  const MetricCard = ({ icon: Icon, label, value, description, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card className="h-full border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Icon size={18} />
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 font-medium">
             {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 font-semibold">System Optimal</Badge>
          <span className="text-slate-200">|</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">v2.0.26 Production</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
          Command <span className="text-primary/70 font-medium">Center</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
          Operational overview: <span className="text-slate-900 font-semibold">{stats.leads} total leads</span> identified across <span className="text-slate-900 font-semibold">{stats.queries} active nodes</span>.
        </p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={Search} 
          label="Discovery Nodes" 
          value={stats.queries} 
          description="Active search parameters"
          delay={0}
        />
        <MetricCard 
          icon={Users} 
          label="Total Database" 
          value={stats.leads} 
          description="Verified corporate leads"
          delay={0.05}
        />
        <MetricCard 
          icon={MessageSquare} 
          label="AI Drafts Ready" 
          value={stats.pending} 
          description="Pending human review"
          delay={0.1}
        />
        <MetricCard 
          icon={Mail} 
          label="Closed Outreach" 
          value={stats.sent} 
          description="Campaigns dispatched"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Lead Discoveries */}
        <Card className="xl:col-span-2 border-slate-100 overflow-hidden shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 p-8">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="text-primary/50" size={20} />
                Recent Intelligence
              </CardTitle>
              <p className="text-sm text-slate-500 font-normal">Latest corporate leads identified by discovery swarm.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-6 font-semibold text-[10px] uppercase tracking-widest bg-white border-slate-200">
              View Database
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="pl-8">Recipient</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center text-slate-400 font-medium">
                      Swarm is currently idle. No new leads found.
                    </TableCell>
                  </TableRow>
                ) : recentLeads.map((lead, i) => (
                  <TableRow key={i} className="group hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-all">
                          {(lead.name || lead.Name || "?")[0]}
                        </div>
                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">{lead.name || lead.Name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-normal text-sm">{lead.company || lead.Company}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 px-3 font-semibold text-[10px]">Verified</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary hover:bg-slate-50 h-8 w-8">
                        <ArrowRight size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Health & Quick Intelligence */}
        <div className="space-y-6">
           <Card className="border-slate-100 bg-white shadow-sm">
             <CardHeader className="p-6 pb-4">
               <CardTitle className="text-lg font-semibold flex items-center gap-2">
                 <HeartPulse className="text-emerald-500" size={18} />
                 Agent Health
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 pt-0 space-y-5">
               {[
                 { label: 'Cloud Synchronizer', status: 'Online', icon: Globe },
                 { label: 'Security Firewall', status: 'Protected', icon: ShieldCheck },
                 { label: 'n8n Engine Core', status: 'Optimal', icon: Zap }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                     <item.icon size={15} className="text-slate-300 group-hover:text-primary transition-colors" />
                     <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{item.label}</span>
                   </div>
                   <Badge variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-[9px] font-semibold">{item.status}</Badge>
                 </div>
               ))}
             </CardContent>
           </Card>

           <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
             <CardHeader className="relative z-10 p-6">
               <CardTitle className="text-white text-xl font-bold tracking-tight">Intelligence Swarm</CardTitle>
               <p className="text-white/60 text-xs font-normal mt-1 leading-relaxed">Execute a fresh cross-platform deep-discovery scan.</p>
             </CardHeader>
             <CardContent className="relative z-10 p-6 pt-0">
               <Button 
                 variant="accent" 
                 onClick={handleRunDiscovery}
                 className="w-full h-12 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-accent/20 group/btn"
               >
                 Run Discovery Now
                 <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
               </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
