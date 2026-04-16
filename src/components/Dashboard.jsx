import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Zap, 
  TrendingUp, 
  Search, 
  MessageSquare,
  ArrowRight,
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
    startProcess("Universal Discovery Swarm", "Initializing cross-platform intelligence scan.");
    try {
      await axios.post(N8N_CONFIG.FINDER_WEBHOOK);
      setTimeout(() => {
        completeProcess();
        fetchDashboardData();
      }, 5000);
    } catch (error) {
      failProcess(error);
    }
  };

  const Skeleton = ({ className }) => (
    <div className={cn("skeleton", className)} />
  );

  const MetricCard = ({ icon: Icon, label, value, description, accent = false, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={cn(
        "h-full",
        accent && "border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent"
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{value}</h3>
              )}
            </div>
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              accent ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
            )}>
              <Icon size={17} />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" className="text-[10px] px-2">System Online</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Command Center
        </h1>
        <p className="text-sm text-slate-500 max-w-lg">
          {loading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            <>
              <span className="text-slate-700 font-medium">{stats.leads} leads</span> identified across <span className="text-slate-700 font-medium">{stats.queries} nodes</span>.
            </>
          )}
        </p>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          accent
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
            <div className="space-y-0.5">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="text-slate-400" size={16} />
                Recent Intelligence
              </CardTitle>
              <CardDescription className="text-xs">Latest leads from discovery swarm</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Recipient</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-5"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right pr-5"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : recentLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-400 text-sm">
                      No leads found yet. Run a discovery scan to get started.
                    </TableCell>
                  </TableRow>
                ) : recentLeads.map((lead, i) => (
                  <TableRow key={i} className="group">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                          {(lead.name || lead.Name || "?")[0]}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{lead.name || lead.Name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{lead.company || lead.Company}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">Verified</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary">
                        <ArrowRight size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Agent Health */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HeartPulse className="text-emerald-500" size={16} />
                Agent Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {[
                { label: 'Cloud Sync', status: 'Online', icon: Globe, color: 'bg-emerald-500' },
                { label: 'Security', status: 'Protected', icon: ShieldCheck, color: 'bg-emerald-500' },
                { label: 'n8n Engine', status: 'Optimal', icon: Zap, color: 'bg-emerald-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                    <span className="text-xs text-slate-500">{item.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Discovery CTA */}
          <Card className="bg-[#4F001D] text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 -mr-20 -mt-20 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="relative z-10 p-5 pb-2">
              <CardTitle className="text-white text-base font-semibold">Intelligence Swarm</CardTitle>
              <p className="text-white/50 text-xs mt-1">Execute a cross-platform discovery scan.</p>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-3">
              <Button 
                variant="accent" 
                onClick={handleRunDiscovery}
                className="w-full h-10 text-xs font-semibold gap-2"
              >
                Run Discovery
                <ArrowRight size={14} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
