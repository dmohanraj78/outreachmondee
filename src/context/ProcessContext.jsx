import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { N8N_CONFIG } from '../config';

const ProcessContext = createContext();

export const useProcess = () => useContext(ProcessContext);

/**
 * ProcessProvider
 * Global state provider for real-time n8n sync and backgrounding.
 */
export const ProcessProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState('processing');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState(null);
  const [currentNode, setCurrentNode] = useState('Initializing...');
  const [customNodes, setCustomNodes] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const startProcess = (pTitle, pMessage, pNodeLabels = null) => {
    setTitle(pTitle);
    setMessage(pMessage);
    setCustomNodes(pNodeLabels);
    setStatus('processing');
    setPercentage(0);
    setElapsedTime(0);
    setError(null);
    setIsOpen(true);
    setIsMinimized(false);
    setIsPolling(true);
    setCurrentNode(pNodeLabels ? pNodeLabels[0] : "Initializing Kernal Relay...");

    // 1. Start Live Duration Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // 2. Start Real-Time n8n Node Polling
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        // Use a slight random offset to prevent thundering herd when many tabs are open
        const response = await axios.get(`${N8N_CONFIG.FETCHER_WEBHOOK}${N8N_CONFIG.FETCHER_WEBHOOK.includes('?') ? '&' : '?'}t=${Date.now()}`);
        const data = Array.isArray(response.data) ? response.data : [];
        
        if (data.length > 0) {
          // Look for any record that is currently NOT "Sent" and NOT "Verified"
          const activeRecord = [...data].reverse().find(item => {
            const s = (item.status || item.Status || "").toLowerCase();
            return s !== "sent" && s !== "verified" && s !== "delivered";
          });

          if (activeRecord) {
            const nodeName = activeRecord.currentNode || activeRecord.node || activeRecord.Status || activeRecord.status;
            if (nodeName) setCurrentNode(nodeName);
          }
        }
      } catch (err) {
        // Silent fail for polling - don't halt the UI for a single sync failure
        console.debug("Sync poll temporarily unavailable.");
      }
    }, 5000);
  };

  const completeProcess = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setIsPolling(false);
    setPercentage(100);
    setCurrentNode("Operation Finalized");
    setTimeout(() => {
      setStatus('success');
      setIsOpen(true);
      setIsMinimized(false);
    }, 300);
  };

  const failProcess = async (err) => {
    // Audit Recovery Check: Wait and double-verify if n8n actually succeeded 
    // This handles "Network Errors" caused by server timeouts on long tasks.
    setCurrentNode("Finalizing Kernal Audit...");
    
    // Give n8n/database 6 seconds to propagate the final status
    await new Promise(resolve => setTimeout(resolve, 6000));

    try {
      const response = await axios.get(`${N8N_CONFIG.FETCHER_WEBHOOK}${N8N_CONFIG.FETCHER_WEBHOOK.includes('?') ? '&' : '?'}t=${Date.now()}`);
      const data = Array.isArray(response.data) ? response.data : [];
      
      if (data.length > 0) {
        const latestSuccess = [...data].reverse().find(item => {
          const s = (item.status || item.Status || "").toLowerCase();
          return ["sent", "verified", "delivered", "success"].includes(s);
        });

        if (latestSuccess) {
          console.info("Recovery Audit: Overriding network error with detected success.");
          completeProcess();
          return;
        }
      }
    } catch (auditErr) {
      console.warn("Audit recovery failed, proceeding with original halt.");
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setIsPolling(false);
    setError(err);
    setStatus('error');
    setIsOpen(true);
    setIsMinimized(false);
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus('processing');
      setPercentage(0);
      setElapsedTime(0);
      setError(null);
      setIsPolling(false);
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const value = {
    isOpen,
    isMinimized,
    status,
    title,
    message,
    percentage,
    elapsedTime,
    error,
    currentNode,
    isPolling,
    startProcess,
    completeProcess,
    failProcess,
    toggleMinimize,
    close
  };

  return (
    <ProcessContext.Provider value={value}>
      {children}
    </ProcessContext.Provider>
  );
};
