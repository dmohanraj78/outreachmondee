import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Mail,
  Send,
  XCircle,
  Calendar,
  Sparkles,
  Video,
  Monitor,
  Users,
  Cpu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { cn } from '../lib/utils';
import EmptyState from './EmptyState';
import toast from 'react-hot-toast';

const IntelligenceHub = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [bookingLead, setBookingLead] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({ subject: '', body: '' });
  const [bookingTime, setBookingTime] = useState('');
  const [bookingType, setBookingType] = useState('Demo & Discovery');
  const [bookingNotes, setBookingNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [showPicker, setShowPicker] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(N8N_CONFIG.GET_SEQUENCES_WEBHOOK);
      let rawData = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        rawData = response.data.data || response.data.rows || response.data.leads || response.data.json || Object.values(response.data).find(v => Array.isArray(v)) || [];
      }
      setData(rawData);
    } catch (error) {
      console.error("Intelligence data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (leadId, action, payload = {}) => {
    setActionLoading(true);
    try {
      const scheduleActions = ['CREATE_MEETING', 'CANCEL_MEETING'];
      const webhook = scheduleActions.includes(action) ? N8N_CONFIG.SCHEDULE_MEET_WEBHOOK : N8N_CONFIG.PROCESS_REPLY_WEBHOOK;
      await axios.post(webhook, { leadId, action, ...payload });
      
      const successMsg = action === 'CANCEL_MEETING' ? 'Appointment cancelled' : 
                        (action === 'CREATE_MEETING' ? 'Meeting scheduled!' : 'Action completed');
      
      toast.success(successMsg);
      setSelectedLead(null);
      setBookingLead(null);
      setBookingTime('');
      setBookingNotes('');
      setSelectedTimeSlot(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to connect to n8n.");
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewModal = (lead) => {
    setSelectedLead(lead);
    setReviewDraft({ subject: lead.draft_subject, body: lead.draft_body });
  };

  // Robust data normalization
  const getProp = (obj, key) => {
    const k = key.toLowerCase().replace(/_/g, '').replace(/ /g, '');
    return Object.keys(obj).find(o => o.toLowerCase().replace(/_/g, '').replace(/ /g, '') === k);
  };

  const normalizeData = (items) => {
    return items.map(item => {
      const statusKey = getProp(item, 'sequence_status');
      const stepKey = getProp(item, 'sequence_step');
      const repliedKey = getProp(item, 'replied');
      const nameKey = getProp(item, 'name');
      const companyKey = getProp(item, 'company');
      const subjectKey = getProp(item, 'draft_subject');
      const bodyKey = getProp(item, 'draft_body');
      const aiTagKey = getProp(item, 'ai_tag');
      const priorityKey = getProp(item, 'lead_priority');
      const urgencyKey = getProp(item, 'urgency_score');
      const sentimentKey = getProp(item, 'sentiment');

      const lastSentDate = item.date || item.Date || item[getProp(item, 'lastSentDate')] || item.Last_Sent_Date;
      const step = parseInt(item[stepKey]) || 0;
      
      const parsedDate = new Date(lastSentDate);
      const isValidDate = !isNaN(parsedDate.getTime());
      const daysSinceSent = isValidDate ? Math.floor((new Date() - parsedDate) / (1000 * 60 * 60 * 24)) : 0;
      
      const perStepGaps = [1, 2, 3]; 
      const targetGap = perStepGaps[step] || 3; 
      const daysRemaining = Math.max(0, targetGap - daysSinceSent);
      
      const isCompleted = step >= 3 && (item[statusKey] === 'Sent' || item[statusKey] === 'Completed');
      const isReplied = String(item[repliedKey]).toUpperCase() === 'TRUE' || item[statusKey] === 'Reply Received';
      
      // Extremely robust meeting detection
      const meetingCheck = (str) => String(str || "").toLowerCase().includes('meeting') || String(str || "").toLowerCase().includes('booked');
      const hasMeetingDate = item[getProp(item, 'meeting_date')] || item.Meeting_Date || item['Scheduled Date'] || item.date;
      const isMeeting = meetingCheck(item[statusKey]) || meetingCheck(item[aiTagKey]) || (isReplied && meetingCheck(item[aiTagKey])) || hasMeetingDate;

      let finalStatus = item[statusKey] || "Idle";
      if (isMeeting) finalStatus = 'Meeting Scheduled';
      else if (isReplied) finalStatus = 'Reply Received';
      else if (isCompleted) finalStatus = 'Completed';

      return {
        ...item,
        id: item.id || item.email || item.Email || Math.random().toString(),
        email: item[getProp(item, 'email')] || item.Email || item.email || "",
        name: item[nameKey] || item.Name || item.name || "Unknown Lead",
        company: item[companyKey] || item.Company || item.company || "N/A",
        sequence_status: finalStatus,
        sequence_step: step,
        replied: isReplied,
        draft_subject: item[subjectKey] || "No Subject",
        draft_body: item[bodyKey] || "No Draft Body Ready",
        ai_tag: item[aiTagKey] || "Pending",
        priority: (item[priorityKey] || item.Lead_Priority || "Normal").toLowerCase(),
        urgency: parseInt(item[urgencyKey] || item.Urgency_Score || 0),
        sentiment: item[sentimentKey] || item.Sentiment || "Neutral",
        intent: (item[aiTagKey] || "").split('|')[0]?.trim() || "Analysis Pending",
        next_send: isMeeting ? "Appointment" : (isReplied ? "Action Needed" : (isCompleted ? "Finished" : (daysRemaining <= 0 ? "Ready" : `${daysRemaining}d remaining`))),
        meeting_date: (() => {
          const raw = item[getProp(item, 'meeting_date')] || item.Meeting_Date || item['Scheduled Date'] || "";
          if (!raw) return "";
          const d = new Date(raw);
          return isNaN(d.getTime()) ? raw : d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
        })(),
        meeting_time: (() => {
          const t = item[getProp(item, 'meeting_time')] || item.Meeting_Time || item['Scheduled Time'] || "";
          if (t && t !== "TBD") return t;
          const rawDate = item[getProp(item, 'meeting_date')] || item.Meeting_Date || item['Scheduled Date'] || "";
          if (!rawDate) return "TBD";
          const d = new Date(rawDate);
          return isNaN(d.getTime()) ? "TBD" : d.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
        })(),
        meeting_type: item[getProp(item, 'meeting_type')] || item.Meeting_Type || "General Meeting",
        meeting_link: item[getProp(item, 'meeting_link')] || item.Meeting_Link || item.meeting_url || "",
        meeting_notes: item[getProp(item, 'meeting_notes')] || item.Meeting_Notes || item.description || item.notes || "No specific agenda provided for this meeting.",
        is_ended: (() => {
          const rawDate = item[getProp(item, 'meeting_date')] || item.Meeting_Date || item['Scheduled Date'] || item.date || "";
          const rawTime = item[getProp(item, 'meeting_time')] || item.Meeting_Time || item['Scheduled Time'] || "";
          if (!rawDate) return false;
          
          try {
            const rdStr = String(rawDate).trim();
            const rtStr = String(rawTime).trim();
            
            let mDate;
            if (rdStr.includes('T')) {
              mDate = new Date(rdStr);
            } else {
              const combined = `${rdStr}${rtStr && rtStr !== 'TBD' ? ' ' + rtStr : ''}`;
              mDate = new Date(combined);
            }

            if (isNaN(mDate.getTime())) {
              mDate = new Date(rdStr);
              if (isNaN(mDate.getTime())) return false;
            }
            
            const now = new Date();
            const hasTime = rdStr.includes('T') || (rtStr && rtStr !== 'TBD');
            
            let ended = false;
            if (!hasTime) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const meetingDay = new Date(mDate);
              meetingDay.setHours(0, 0, 0, 0);
              ended = meetingDay < today;
            } else {
              // Mark as ended if current time is past the start time
              ended = now.getTime() > mDate.getTime();
            }

            // Debug log to help identify why it might not reflect
            if (item.name?.includes('Saurabh')) {
              console.log(`Meeting check for ${item.name}: mDate=${mDate.toISOString()}, now=${now.toISOString()}, ended=${ended}`);
            }

            return ended;
          } catch (e) {
            return false;
          }
        })()
      };
    });
  };

  const processedData = normalizeData(data);
  const activeStatusList = ['Sent', 'Approval Required', 'Review Required', 'Active'];
  const sequenceLeads = processedData.filter(l => 
    activeStatusList.includes(l.sequence_status) && l.sequence_status !== 'Completed'
  );
  const inboxLeads = processedData.filter(l => l.sequence_status === 'Reply Received');
  const meetingLeads = processedData.filter(l => l.sequence_status === 'Meeting Scheduled');

  // Calculate Metrics
  const statsBooked = meetingLeads.length;
  const statsConversion = processedData.length > 0 ? Math.round((meetingLeads.length / processedData.length) * 100) : 0;
  const statsUpcoming = meetingLeads.filter(l => !l.is_ended).length;
  const statsAttended = meetingLeads.filter(l => l.is_ended || (l.sequence_status || "").toLowerCase().includes('completed') || (l.sequence_status || "").toLowerCase().includes('attended')).length;

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'Hot': return 'warning';
      case 'Curious': return 'info';
      case 'Frustrated': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Intelligence Hub
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Monitor follow-up sequences and manage AI-classified replies.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit shadow-inner border border-slate-200/50">
          {[
            { id: 'monitor', label: 'Sequences', count: sequenceLeads.length, color: 'text-slate-500' },
            { id: 'inbox', label: 'Inbox', count: inboxLeads.length, color: 'text-accent' },
            { id: 'meetings', label: 'Meetings', count: meetingLeads.length, color: 'text-primary' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-black transition-all relative flex items-center gap-2",
                activeTab === tab.id ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black border-2 border-white text-white",
                  tab.id === 'meetings' ? "bg-primary" : (tab.id === 'inbox' ? "bg-accent" : "bg-slate-400")
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Sequence Monitor Tab */}
      {activeTab === 'monitor' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
            <div className="space-y-0.5">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="text-primary" size={16} />
                Active Sequences
              </CardTitle>
              <CardDescription className="text-xs">Follow-up trajectories for cold outreach</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Recipient</TableHead>
                  <TableHead className="hidden md:table-cell">Progress</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Next</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sequenceLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyState icon={Mail} title="No Active Sequences" message="Enroll leads to start automatic follow-ups." />
                    </TableCell>
                  </TableRow>
                ) : sequenceLeads.sort((a,b) => a.sequence_status === 'Approval Required' ? -1 : 1).map((lead, i) => (
                  <TableRow key={i} className={cn(
                    "group",
                    lead.sequence_status === 'Approval Required' && "bg-primary/[0.02]",
                    lead.priority === 'high' && "border-l-2 border-l-amber-400"
                  )}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0",
                          lead.sequence_status === 'Approval Required' 
                            ? "bg-primary text-white" 
                            : "bg-slate-100 text-slate-500"
                        )}>
                          {(lead.name || "?")[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 text-sm truncate">{lead.name}</span>
                            {lead.priority === 'high' && (
                              <Badge variant="warning" className="text-[9px] px-1.5 py-0">High</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 truncate">{lead.company}</span>
                            {lead.sequence_status === 'Approval Required' && (
                              <Badge variant="success" className="text-[9px] px-1.5 py-0">Draft Ready</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="relative w-32 h-6 flex items-center">
                        {/* Background Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-slate-100 rounded-full" />
                        
                        {/* Progress Line */}
                        <motion.div 
                          className="absolute left-0 h-0.5 bg-primary rounded-full z-0"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (lead.sequence_step / 3) * 100)}%` 
                          }}
                          transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        />

                        {/* Nodes */}
                        <div className="absolute inset-0 flex justify-between items-center z-10">
                          {[0, 1, 2, 3].map((s) => {
                            const isCompleted = s < lead.sequence_step;
                            const isActive = s === lead.sequence_step;
                            return (
                              <div key={s} className="relative flex items-center justify-center">
                                {isActive && (
                                  <motion.div 
                                    className="absolute w-4 h-4 rounded-full bg-primary/20"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  />
                                )}
                                  <div className={cn(
                                  "w-2.5 h-2.5 rounded-full border-2 transition-all duration-500 shadow-sm",
                                  isCompleted ? "bg-primary border-primary scale-110" : 
                                  isActive ? "bg-white border-primary" : 
                                  "bg-white border-slate-200"
                                )} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {lead.sequence_step === 0 ? "Initial" : `Step ${lead.sequence_step}/3`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.sequence_status === 'Approval Required' ? (
                        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                          <CheckCircle2 size={12} /> Review
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock size={12} className="text-slate-300" />
                          {lead.next_send}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-2">
                        {lead.sequence_status === 'Approval Required' ? (
                          <Button size="sm" onClick={() => openReviewModal(lead)} className="h-8 text-xs gap-1">
                            Review <ArrowRight size={12} />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400" disabled>Waiting</Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleAction(lead.id, 'STOP_SEQUENCE')} 
                          className="w-8 h-8 text-slate-300 hover:text-red-500"
                        >
                          <XCircle size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : activeTab === 'meetings' ? (
        <div className="space-y-6">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Booked', value: statsBooked, icon: Calendar, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Conversion', value: `${statsConversion}%`, icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Upcoming', value: statsUpcoming, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Attended', value: statsAttended, icon: CheckCircle2, color: 'text-slate-600', bg: 'bg-slate-50' }
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm shadow-slate-200/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", stat.bg, stat.color)}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meetingLeads.length === 0 ? (
            <Card className="border-dashed h-64 flex items-center justify-center">
              <EmptyState icon={Calendar} title="No Meetings Booked" message="Scheduled demos will appear here for tracking." />
            </Card>
          ) : (
            <div className="flex flex-col gap-8">
              {meetingLeads.sort((a,b) => new Date(a.meeting_date || 0) - new Date(b.meeting_date || 0)).map((lead, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={cn(
                    "relative group flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[160px] transition-all",
                    lead.is_ended && "opacity-75 grayscale-[0.2]"
                  )}>
                    {/* Left: Main Pass Area */}
                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-center gap-3 relative">
                      <div className="space-y-3">
                        {/* Header & Type */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black text-slate-500 border-2 border-white shadow-md">
                              {(lead.name || "?")[0]}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-slate-900 leading-tight">{lead.name}</h3>
                              <p className="text-[10px] text-slate-400 font-bold leading-none">{lead.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.1em] border-primary/20 bg-primary/5 text-primary px-2 py-0 rounded-full">
                              {lead.meeting_type}
                            </Badge>
                            {lead.is_ended && (
                              <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-[0.1em] bg-slate-200 text-slate-600 px-2 py-0 rounded-full">
                                Ended
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Unique Agenda Section */}
                        <div className="relative group/notes max-w-3xl">
                          <div className="absolute inset-0 bg-slate-50 rounded-lg transition-all" />
                          <div className="relative border-l-2 border-primary/20 p-3 rounded-r-lg bg-slate-50/50">
                            <p className="text-[11px] font-medium text-slate-600 leading-snug italic">
                              "{lead.meeting_notes}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Badge */}
                      <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Verified Pass</span>
                      </div>
                    </div>

                    {/* Perforation Line with Cutouts */}
                    <div className="relative w-px h-auto hidden lg:flex items-center justify-center border-l-2 border-dashed border-slate-100 mx-4">
                      {/* Top Semi-circle cutout */}
                      <div className="absolute -top-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 -mt-px shadow-inner" />
                      {/* Bottom Semi-circle cutout */}
                      <div className="absolute -bottom-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 -mb-px shadow-inner" />
                    </div>

                    {/* Right: The Stub (Dates & Actions) */}
                    <div className="w-full lg:w-56 bg-slate-50/50 p-4 flex flex-col items-stretch justify-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                      <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3">
                        <div className="relative inline-block scale-90 lg:scale-100">
                          <div className="absolute inset-0 bg-primary/5 rounded-xl blur-md" />
                          <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200/50 shadow-md flex flex-col items-center justify-center overflow-hidden">
                            <div className="bg-primary w-full text-center text-[8px] font-black text-white py-0.5 uppercase tracking-widest">
                              {lead.meeting_date?.split(' ')[0] || "APR"}
                            </div>
                            <div className="text-2xl font-black text-slate-900 leading-none pt-1">
                              {lead.meeting_date?.split(' ')[1]?.replace(',', '') || "--"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 lg:w-full justify-center">
                          <Clock size={12} className="text-primary" />
                          {lead.meeting_time}
                        </div>
                      </div>

                      <div className="space-y-2 w-full">
                        <Button 
                          className={cn(
                            "w-full h-10 text-white text-[9px] font-black gap-1.5 shadow-md rounded-lg transition-all active:scale-95 flex items-center justify-center tracking-wider",
                            lead.is_ended ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10"
                          )}
                          onClick={() => !lead.is_ended && window.open(lead.meeting_link || 'https://meet.google.com', '_blank')}
                          disabled={lead.is_ended}
                        >
                          <Video size={14} />
                          {lead.is_ended ? "MEETING ENDED" : "JOIN GOOGLE MEET"}
                        </Button>
                        <button 
                          onClick={() => handleAction(lead.id, 'CANCEL_MEETING', { meeting_type: lead.meeting_type })}
                          className="w-full py-0.5 text-[8px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-1 group/cancel"
                        >
                          <XCircle size={10} className="opacity-30 group-hover/cancel:opacity-100" />
                          Cancel Event
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>
    ) : (
        /* Inbox Tab */
        <div className="space-y-4">
          {inboxLeads.length === 0 ? (
            <Card>
              <EmptyState icon={Mail} title="Inbox Empty" message="Replies will appear here when leads respond to your outreach." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {inboxLeads.map((reply, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  key={i}
                >
                  <Card className={cn(
                    "h-full",
                    reply.urgency >= 8 && "ring-1 ring-amber-300 shadow-md"
                  )}>
                    <CardHeader className="p-5 pb-3">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant={getSentimentColor(reply.sentiment)} className="text-[10px]">
                          {reply.sentiment}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {reply.intent}
                        </Badge>
                        {reply.urgency >= 5 && (
                          <Badge variant="default" className="text-[10px] bg-slate-900">
                            Urgent: {reply.urgency}/10
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {reply.name}
                        {reply.priority === 'high' && <Zap size={12} className="text-amber-400 fill-amber-400" />}
                      </CardTitle>
                      <CardDescription className="text-xs">{reply.company}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3">
                      {/* Reply preview */}
                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-100 line-clamp-3 relative">
                        <span className="absolute -top-2 left-3 bg-white px-1.5 text-[9px] font-medium text-slate-400 border border-slate-100 rounded">Reply</span>
                        "{reply.last_reply_body || "New inquiry received."}"
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          className={cn(
                            "w-full h-9 text-xs font-semibold",
                            reply.urgency >= 8 && "bg-amber-500 hover:bg-amber-600"
                          )} 
                          onClick={() => openReviewModal(reply)}
                        >
                          <Sparkles size={14} className="mr-1.5" />
                          Reply with Strategy
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full h-9 text-xs font-semibold gap-1.5"
                          onClick={() => setBookingLead(reply)}
                        >
                          <Calendar size={14} />
                          Schedule Google Meet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Review Draft</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedLead.name} · {selectedLead.company}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="h-8 w-8">
                  <XCircle size={18} />
                </Button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Subject</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                    value={reviewDraft.subject}
                    onChange={(e) => setReviewDraft({...reviewDraft, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Message</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-600 min-h-[180px] leading-relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all resize-none"
                    value={reviewDraft.body}
                    onChange={(e) => setReviewDraft({...reviewDraft, body: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setSelectedLead(null)} className="flex-1 h-10 text-xs">Cancel</Button>
                  <Button 
                    className="flex-[2] h-10 text-xs gap-2"
                    loading={actionLoading}
                    onClick={() => handleAction(selectedLead.id, selectedLead.replied ? 'APPROVE_REBUTTAL' : 'APPROVE_FOLLOWUP', { 
                      email: selectedLead.email, 
                      draft_body: reviewDraft.body, 
                      subject: reviewDraft.subject,
                      sequence_step: selectedLead.sequence_step 
                    })}
                  >
                    <Send size={14} />
                    Finalize & Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">Scheduling Terminal</h3>
                    <p className="text-sm text-slate-500 font-medium">Booking session for {bookingLead.name} at {bookingLead.company}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setBookingLead(null)} className="h-10 w-10 rounded-full hover:bg-slate-200">
                  <XCircle size={22} className="text-slate-400" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-[500px]">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-3 p-8 space-y-8 overflow-y-auto custom-scrollbar border-r border-slate-100">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">01</div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Meeting Parameters</label>
                    </div>
                    
                    <div className="space-y-6">                      <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-700">Appointment Schedule</label>
                        
                        {!showPicker ? (
                          <button 
                            onClick={() => setShowPicker(true)}
                            className={cn(
                              "w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold flex items-center justify-between transition-all group hover:border-primary/30 hover:bg-white"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                selectedTimeSlot ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-400"
                              )}>
                                <Calendar size={18} />
                              </div>
                              <div className="text-left">
                                {selectedTimeSlot ? (
                                  <>
                                    <div className="text-slate-900">{selectedCalendarDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    <div className="text-primary text-[11px] font-black uppercase tracking-wider">{selectedTimeSlot}</div>
                                  </>
                                ) : (
                                  <div className="text-slate-400 italic font-medium">Click to select date & time...</div>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300" />
                          </button>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-primary/20 overflow-hidden"
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Left Panel: Calendar */}
                              <div className="flex-1 p-4 bg-white border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Date</span>
                                    <h4 className="text-sm font-black text-slate-900 leading-none">{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</h4>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); }}>
                                      <ChevronLeft size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); }}>
                                      <ChevronRight size={14} />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-7 gap-1">
                                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                    <div key={day} className="text-[9px] font-black text-slate-300 text-center py-1.5">{day}</div>
                                  ))}
                                  {(() => {
                                    const days = [];
                                    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                                    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                                    const today = new Date(); today.setHours(0,0,0,0);
                                    
                                    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-7" />);
                                    
                                    for (let d = 1; d <= daysInMonth; d++) {
                                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                                      const isSelected = selectedCalendarDate && 
                                                       selectedCalendarDate.getDate() === d && 
                                                       selectedCalendarDate.getMonth() === currentMonth.getMonth() && 
                                                       selectedCalendarDate.getFullYear() === currentMonth.getFullYear();
                                      const isToday = today.getTime() === date.getTime();
                                      const isPast = date < today;
                                      
                                      days.push(
                                        <button
                                          key={d}
                                          disabled={isPast}
                                          onClick={(e) => { e.stopPropagation(); setSelectedCalendarDate(date); }}
                                          className={cn(
                                            "h-7 w-full flex items-center justify-center rounded-lg text-xs font-bold transition-all relative",
                                            isSelected ? "bg-primary text-white shadow-md z-10 scale-105" : 
                                            isToday ? "bg-primary/10 text-primary border border-primary/20" : 
                                            isPast ? "text-slate-200 cursor-not-allowed" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                                          )}
                                        >
                                          <span className="relative z-10">{d}</span>
                                        </button>
                                      );
                                    }
                                    return days;
                                  })()}
                                </div>
                              </div>

                              {/* Right Panel: Time Selection */}
                              <div className="flex-1 p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div className="space-y-4">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Time</span>
                                    <h4 className="text-sm font-black text-slate-900 leading-none">Clock</h4>
                                  </div>
                                  
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        className="w-12 h-12 bg-white border border-slate-200 rounded-xl text-lg font-black text-center text-slate-900 outline-none shadow-sm focus:border-primary/50"
                                        value={hour}
                                        maxLength="2"
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) setHour(val);
                                        }}
                                      />
                                      <div className="text-lg font-black text-slate-300">:</div>
                                      <input 
                                        className="w-12 h-12 bg-white border border-slate-200 rounded-xl text-lg font-black text-center text-slate-900 outline-none shadow-sm focus:border-primary/50"
                                        value={minute}
                                        maxLength="2"
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) setMinute(val.padStart(2, '0').slice(-2));
                                        }}
                                      />
                                      <div className="flex flex-col gap-1">
                                        {['AM', 'PM'].map(t => (
                                          <button
                                            key={t}
                                            onClick={(e) => { e.stopPropagation(); setAmpm(t); }}
                                            className={cn(
                                              "px-2 py-1 rounded-md text-[8px] font-black transition-all border",
                                              ampm === t ? "bg-primary border-primary text-white shadow-sm" : "bg-white text-slate-400"
                                            )}
                                          >
                                            {t}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="w-full p-2 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-2 shadow-sm border-dashed">
                                      <Clock size={12} className="text-primary" />
                                      <div className="text-[10px] font-black text-slate-700 tracking-wider">
                                        {hour || '00'}:{minute || '00'} {ampm}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <Button variant="ghost" className="flex-1 h-9 text-[10px] font-bold" onClick={() => setShowPicker(false)}>Cancel</Button>
                                  <Button 
                                    className="flex-[2] h-9 text-[10px] font-black shadow-lg shadow-primary/10 rounded-xl"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTimeSlot(`${hour}:${minute} ${ampm}`);
                                      setShowPicker(false);
                                    }}
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      
                      <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-700">Select Meeting Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'Demo & Discovery', label: 'Demo & Discovery', dur: '30 min', desc: 'Product tour & needs assessment', icon: Video, color: 'bg-emerald-50 text-emerald-600' },
                            { id: 'Strategic Implementation', label: 'Strategic Implementation', dur: '45 min', desc: 'Strategy & workflow planning', icon: Monitor, color: 'bg-blue-50 text-blue-600' },
                            { id: 'Executive Review', label: 'Executive Review', dur: '15 min', desc: 'Decision maker briefing', icon: Users, color: 'bg-purple-50 text-purple-600' },
                            { id: 'Technical Deep-Dive', label: 'Technical Deep-Dive', dur: '60 min', desc: 'Integration & API review', icon: Cpu, color: 'bg-amber-50 text-amber-600' }
                          ].map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setBookingType(type.id)}
                              className={cn(
                                "flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all duration-200 group relative",
                                bookingType === type.id 
                                  ? "border-primary bg-primary/[0.02] shadow-sm ring-1 ring-primary/10" 
                                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                              )}
                            >
                              <div className={cn(
                                "w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0",
                                type.color
                              )}>
                                <type.icon size={22} />
                              </div>
                              <div className="min-w-0 pr-4">
                                <div className="text-[13px] font-bold text-slate-900 leading-tight">{type.label}</div>
                                <div className="text-[11px] font-semibold text-slate-400 mt-1">{type.dur}</div>
                                <div className="text-[10px] text-slate-400 mt-1.5 leading-snug line-clamp-1">{type.desc}</div>
                              </div>
                              {bookingType === type.id && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle2 size={16} className="text-primary" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">02</div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Custom Meeting Notes</label>
                    </div>
                    <textarea 
                      placeholder="Enter specific notes, agenda items, or custom instructions to be included in the invitation..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm text-slate-600 min-h-[160px] leading-relaxed focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all resize-none shadow-sm"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Panel: Preview & Context */}
                <div className="lg:col-span-2 bg-slate-50/50 p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prospect Context</label>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">
                            {bookingLead.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{bookingLead.name}</div>
                            <div className="text-xs text-slate-500">{bookingLead.email}</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-400">{bookingLead.company}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invitation Preview</label>
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm italic text-xs text-slate-400 leading-relaxed">
                        <p>"Hi {bookingLead.name.split(' ')[0]}, I've scheduled our <strong>{bookingType}</strong>. {selectedTimeSlot ? `I see you're available on ${selectedCalendarDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} at ${selectedTimeSlot}.` : ""} Looking forward to discussing how Miraee can support {bookingLead.company}."</p>
                        {bookingNotes && (
                          <div className="mt-3 pt-3 border-t border-slate-50 font-normal">
                             <span className="font-bold text-slate-900 not-italic block mb-1">Items for Discussion:</span>
                             {bookingNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      className="w-full h-12 text-sm font-bold gap-2 shadow-lg shadow-primary/20"
                      loading={actionLoading}
                      disabled={!selectedTimeSlot}
                      onClick={() => {
                        if (!selectedTimeSlot) return toast.error("Please select a time slot.");
                        
                        // Parse time e.g. "10:00 AM"
                        const [timeStr, modifier] = selectedTimeSlot.split(' ');
                        let [hours, minutes] = timeStr.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                        
                        const startTime = new Date(selectedCalendarDate);
                        startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                        
                        const durationMap = {
                          'Demo & Discovery': 30,
                          'Strategic Implementation': 45,
                          'Executive Review': 15,
                          'Technical Deep-Dive': 60
                        };
                        const duration = durationMap[bookingType] || 30;
                        const endTime = new Date(startTime.getTime() + duration * 60000);
                        
                        handleAction(bookingLead.id, 'CREATE_MEETING', { 
                          email: bookingLead.email,
                          name: bookingLead.name,
                          company: bookingLead.company,
                          startTime: startTime.toISOString(),
                          endTime: endTime.toISOString(),
                          meetingType: bookingType,
                          notes: bookingNotes,
                          summary: `${bookingType}: ${bookingLead.name} x Miraee`,
                          description: bookingNotes || `Scheduled via Miraee Intelligence Hub for ${bookingLead.name} at ${bookingLead.company}.`
                        });
                      }}
                    >
                      <Calendar size={18} />
                      Confirm & Send Invites
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 mt-3 px-4">
                      A Google Meet link will be generated and sent to both parties.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntelligenceHub;
