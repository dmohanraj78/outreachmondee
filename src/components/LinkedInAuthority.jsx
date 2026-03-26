import React, { useState, useEffect } from 'react';
import { Share2, Zap, MessageSquare, ExternalLink, Loader2, Copy, CheckCircle, ArrowRight, UserPlus, Users } from 'lucide-react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const LinkedInAuthority = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [customQuery, setCustomQuery] = useState('');
    const [progressStage, setProgressStage] = useState(0);
    const [results, setResults] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [sendingCloser, setSendingCloser] = useState(null); // Track index of card being closed
    const [closerStatus, setCloserStatus] = useState({}); // {index: 'success' | 'error' | 'loading'}
    const [sourcedLeads, setSourcedLeads] = useState([]); // Database of previously found leads
    const [selectedLeads, setSelectedLeads] = useState({}); // {resultIndex: leadObject}

    const stages = [
        "Connecting to Miraee nodes...",
        "Searching LinkedIn for relevant posts...",
        "Extracting 'Perspectives' data...",
        "AI analyzing industry context...",
        "Drafting expert comment options...",
        "Formatting results for your dashboard..."
    ];

    const fetchSourcedLeads = async () => {
        try {
            const response = await axios.get(N8N_CONFIG.FETCHER_WEBHOOK);
            setSourcedLeads(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch sourced leads", error);
        }
    };

    useEffect(() => {
        fetchSourcedLeads();
        let interval;
        if (loading) {
            setProgressStage(0);
            interval = setInterval(() => {
                setProgressStage((prev) => (prev + 1) % stages.length);
            }, 3000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const triggerSocialResearch = async () => {
        if (!customQuery.trim()) return;

        setLoading(true);
        setStatus(null);
        setResults([]);
        try {
            const response = await fetch(N8N_CONFIG.RESEARCH_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: customQuery }),
            });
            
            if (response.ok) {
                const data = await response.json();
                // n8n returns an array or single object. We want to handle both.
                const formattedResults = Array.isArray(data) ? data : [data];
                setResults(formattedResults);
                setStatus('success');
                setCustomQuery(''); 
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error triggering research:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const sendCloserAgent = async (result, index) => {
        setSendingCloser(index);
        setCloserStatus(prev => ({ ...prev, [index]: 'loading' }));

        try {
            const selectedLead = selectedLeads[index];
            if (!selectedLead) {
                alert("Please select a sourced lead first!");
                return;
            }

            const response = await fetch(N8N_CONFIG.CLOSER_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_name: selectedLead.name || selectedLead.Name,
                    lead_company: selectedLead.company || selectedLead.Company,
                    lead_linkedin: selectedLead.linkedin || selectedLead.LinkedIn_URL,
                    row_number: selectedLead.row_number || selectedLead.Row_Number || selectedLead.row_index, 
                    topic_title: result.title,
                    research_content: result.content
                }),
            });

            if (response.ok) {
                setCloserStatus(prev => ({ ...prev, [index]: 'success' }));
            } else {
                setCloserStatus(prev => ({ ...prev, [index]: 'error' }));
            }
        } catch (error) {
            console.error('Closer Agent Error:', error);
            setCloserStatus(prev => ({ ...prev, [index]: 'error' }));
        } finally {
            setSendingCloser(null);
        }
    };

    return (
        <div className="view-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px' }}>
                    LinkedIn Authority <span style={{ color: 'var(--accent)' }}>Ghost</span>
                </h1>
                <p className="subtitle" style={{ fontSize: '18px', maxWidth: '700px' }}>
                    Turn industry trends into professional authority. Our AI agents research, analyze, and draft your expert responses in seconds.
                </p>
            </header>

            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
                {/* Left Column: Input & Controls */}
                <aside>
                    <div className="card" style={{ position: 'sticky', top: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <Share2 size={20} color="var(--accent)" />
                            <h3 style={{ fontSize: '18px' }}>Daily Research</h3>
                        </div>
                        
                        <p style={{ color: 'var(--n100)', fontSize: '14px', marginBottom: '16px' }}>
                            What's trending in your world today? Paste a topic to start the agentic swarm.
                        </p>
                        
                        <textarea 
                            placeholder="e.g. New GST rules for Indian startups, Zoho travel features, or Airline disruptions..." 
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            style={{ 
                                minHeight: '120px', 
                                marginBottom: '20px',
                                resize: 'none'
                            }}
                        />

                        {loading && (
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{stages[progressStage]}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--n100)' }}>{Math.round(((progressStage + 1) / stages.length) * 100)}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--n20)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${((progressStage + 1) / stages.length) * 100}%`, 
                                        background: 'var(--accent)',
                                        transition: 'width 0.4s ease'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={triggerSocialResearch}
                            disabled={loading || !customQuery.trim()}
                            style={{ width: '100%', height: '54px' }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Agents Working...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    <span>Run AI Research</span>
                                </>
                            )}
                        </button>

                        {status === 'error' && (
                            <div className="status-badge status-warning" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
                                Connection to Agent OS failed.
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Column: Results Feed */}
                <main>
                    {!loading && results.length === 0 && !status && (
                        <div style={{ 
                            padding: '60px', 
                            textAlign: 'center', 
                            background: 'var(--n10)', 
                            borderRadius: 'var(--radius)', 
                            border: '2px dashed var(--n30)' 
                        }}>
                            <MessageSquare size={48} color="var(--n40)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--n100)' }}>No results yet. Start a research query.</h3>
                        </div>
                    )}

                    {(loading || results.length > 0) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {results.map((result, idx) => (
                                <div key={idx} className="card" style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                                                {result.title}
                                            </h4>
                                            <a 
                                                href={result.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
                                            >
                                                View Original Post <ExternalLink size={12} />
                                            </a>
                                        </div>
                                        <div className="status-badge status-success">Verified Trend</div>
                                    </div>

                                    <div style={{ background: 'var(--bg-creme)', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <Zap size={16} color="var(--primary)" />
                                            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)', textTransform: 'uppercase' }}>Miraee AI Drafts</span>
                                        </div>
                                        
                                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--n800)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                                            {result.content}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 700, 
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                background: (result.content || '').length > 280 ? 'var(--warning-bg)' : 'var(--n20)',
                                                color: (result.content || '').length > 280 ? 'var(--warning-text)' : 'var(--n500)'
                                            }}>
                                                {(result.content || '').length} / 300 Characters
                                            </span>
                                        </div>

                                        <div style={{ background: 'white', border: '1px solid var(--n30)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--n500)' }}>
                                                <Users size={14} />
                                                <span style={{ fontSize: '13px', fontWeight: 600 }}>Target a Sourced Lead</span>
                                            </div>
                                            <select 
                                                style={{ marginBottom: 0 }}
                                                onChange={(e) => setSelectedLeads(prev => ({ ...prev, [idx]: JSON.parse(e.target.value) }))}
                                                value={selectedLeads[idx] ? JSON.stringify(selectedLeads[idx]) : ''}
                                            >
                                                <option value="">Select a Lead from Database...</option>
                                                {sourcedLeads.map((lead, lIdx) => (
                                                    <option key={lIdx} value={JSON.stringify(lead)}>
                                                        {lead.name || lead.Name} ({lead.company || lead.Company})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button 
                                                className="btn-secondary"
                                                onClick={() => copyToClipboard(result.content, idx)}
                                                style={{ borderRadius: '8px', padding: '10px 20px', fontSize: '13px', flex: 1 }}
                                            >
                                                {copiedIndex === idx ? (
                                                    <><CheckCircle size={14} /> Copied!</>
                                                ) : (
                                                    <><Copy size={14} /> Copy Comment</>
                                                )}
                                            </button>

                                            <button 
                                                onClick={() => sendCloserAgent(result, idx)}
                                                disabled={sendingCloser === idx || closerStatus[idx] === 'success' || !selectedLeads[idx]}
                                                style={{ 
                                                    borderRadius: '8px', 
                                                    padding: '10px 20px', 
                                                    fontSize: '13px', 
                                                    flex: 1,
                                                    background: closerStatus[idx] === 'success' ? 'var(--success-bg)' : 'var(--primary)',
                                                    color: closerStatus[idx] === 'success' ? 'var(--success-text)' : 'white'
                                                }}
                                            >
                                                {closerStatus[idx] === 'loading' ? (
                                                    <><Loader2 className="animate-spin" size={14} /> Sending...</>
                                                ) : closerStatus[idx] === 'success' ? (
                                                    <><CheckCircle size={14} /> Outreach Sent</>
                                                ) : (
                                                    <><UserPlus size={14} /> {selectedLeads[idx] ? `Close ${selectedLeads[idx].name || selectedLeads[idx].Name}` : 'Select Lead'}</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Responsive Styles (inline for simplicity/speed in this context) */}
            <style>
                {`
                @media (max-width: 900px) {
                    .grid-layout {
                        grid-template-columns: 1fr !important;
                    }
                    aside {
                        position: static !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default LinkedInAuthority;
