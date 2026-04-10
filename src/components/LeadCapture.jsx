import React, { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, RefreshCw, LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadCapture = () => {
    // 1. Initialize state from localStorage, or use a blank state
    const [formUrl, setFormUrl] = useState(() => {
        return localStorage.getItem('miraee_capture_url') || '';
    });
    
    // 2. Holds the temporary input value while editing
    const [inputUrl, setInputUrl] = useState(formUrl);

    // 3. Save URL mapping to state and local storage
    const saveUrlConfig = (e) => {
        e.preventDefault();
        
        // Basic formatting to ensure http prefix
        let finalUrl = inputUrl.trim();
        if (finalUrl && !finalUrl.startsWith('http')) {
            finalUrl = 'https://' + finalUrl;
        }

        setFormUrl(finalUrl);
        setInputUrl(finalUrl);
        localStorage.setItem('miraee_capture_url', finalUrl);
        
        toast.success("Form URL automatically saved to dashboard.");
    };

    return (
        <div className="view-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                        Live <span style={{ color: 'var(--accent)' }}>Capture Board</span>
                    </h1>
                    <p className="subtitle" style={{ fontSize: '14px', margin: 0 }}>
                        Host your live website forms safely within the agentic dashboard.
                    </p>
                </div>
            </header>

            {/* Control Bar */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px 24px', background: 'white' }}>
                <form onSubmit={saveUrlConfig} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <LinkIcon size={20} color="var(--n400)" />
                        <input 
                            type="text" 
                            placeholder="Paste your live website form URL here (e.g., https://yourwebsite.com/capture)..." 
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px 0', 
                                fontSize: '15px', 
                                border: 'none', 
                                background: 'transparent',
                                borderBottom: '2px solid transparent',
                                boxShadow: 'none',
                                outline: 'none'
                             }}
                        />
                    </div>
                    
                    <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '13px' }} disabled={inputUrl === formUrl}>
                        <Save size={16} /> Save Link
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => {
                            setFormUrl('');
                            setTimeout(() => setFormUrl(inputUrl), 100);
                        }} 
                        className="btn-secondary" 
                        style={{ padding: '10px', borderRadius: '8px' }}
                        title="Reload Viewport"
                    >
                        <RefreshCw size={16} />
                    </button>
                </form>
            </div>

            {/* Iframe Viewport Container */}
            <div 
                className="card" 
                style={{ 
                    flex: 1, 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: '16px', 
                    background: formUrl ? 'white' : 'var(--n10)',
                    border: formUrl ? '1px solid var(--n40)' : '2px dashed var(--n100)',
                    display: 'flex'
                }}>
                
                {!formUrl ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.6 }}>
                        <LayoutTemplate size={60} color="var(--n100)" style={{ marginBottom: '16px' }} />
                        <h2 style={{ color: 'var(--n800)', fontSize: '20px' }}>Viewport is Empty</h2>
                        <p style={{ color: 'var(--n500)' }}>Paste a URL in the control bar above to embed your website form.</p>
                    </div>
                ) : (
                    <iframe 
                        src={formUrl} 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Embedded Lead Form"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                )}
            </div>
        </div>
    );
};

export default LeadCapture;
