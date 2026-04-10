import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

/**
 * ProcessingModal
 * A high-fidelity centered popup for n8n workflow tracking.
 * Includes simulated progress percentage and diagnostic error reporting.
 */
const ProcessingModal = ({ 
  isOpen, 
  isMinimized = false,
  status = 'processing', // 'processing', 'success', 'error'
  title = "Executing Operation",
  message = "Please wait while the system processes your request.",
  percentage = 0,
  elapsedTime = 0,
  currentNode = "Initializing...",
  error = null,
  onClose,
  onMinimize
}) => {
  if (!isOpen || isMinimized) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={status !== 'processing' ? onClose : undefined}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header/Status Indicator (Real-time Pulse) */}
          <div className={cn(
            "h-2 overflow-hidden bg-slate-50 transition-colors duration-500",
            status === 'success' && "bg-emerald-500",
            status === 'error' && "bg-red-500"
          )}>
            {status === 'processing' && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-1/2 h-full bg-primary/40 blur-sm"
              />
            )}
          </div>

          <div className="p-10 space-y-8">
            {/* Top Toolbar */}
            <div className="absolute top-8 right-8 flex items-center gap-2">
              {status === 'processing' && onMinimize && (
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={onMinimize} 
                   className="h-8 w-8 rounded-lg hover:bg-slate-50 text-slate-400"
                   title="Minimize to top bar"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileActive={{ scale: 0.9 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="5" width="10" height="2" rx="1" fill="currentColor"/>
                    </svg>
                  </motion.div>
                </Button>
              )}
            </div>

            {/* Icon & Live Timer Section */}
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                status === 'success' ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" : 
                status === 'error' ? "bg-red-50 text-red-600 shadow-red-100" : 
                "bg-primary/5 text-primary shadow-primary/5"
              )}>
                {status === 'processing' ? (
                  <Loader2 className="animate-spin text-primary" size={32} />
                ) : status === 'success' ? (
                  <CheckCircle size={32} />
                ) : (
                  <XCircle size={32} />
                )}
              </div>
              
              {status === 'processing' && (
                <div className="text-right">
                  <div className="text-4xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Elapsed Duration</div>
                </div>
              )}

              {status !== 'processing' && (
                <div className="text-right">
                   <div className="text-2xl font-bold text-slate-900 tracking-tight">
                     {status === 'success' ? 'Finished' : 'Halted'}
                   </div>
                   <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Operation Status</div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                {status === 'success' ? 'Operation Finalized' : 
                 status === 'error' ? 'Operational Halt' : 
                 currentNode === "Finalizing Kernal Audit..." ? "Audit in Progress" : title}
              </h2>
              <p className="text-base font-normal text-slate-500 leading-relaxed">
                {status === 'error' ? 'An unexpected anomaly was detected in the n8n workflow node.' : 
                 currentNode === "Finalizing Kernal Audit..." ? "Verifying technical integrity with the n8n core..." : message}
              </p>
            </div>

            {/* Diagnostic Box (Error Only) */}
            {status === 'error' && error && (
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest">
                  <AlertCircle size={14} /> 
                  Diagnostic Report
                </div>
                <div className="font-mono text-xs text-red-500 bg-white p-4 rounded-xl border border-red-100/50 break-words shadow-sm">
                  {error.message || error.toString()}
                </div>
              </div>
            )}

            {/* Success Summary (Success Only) */}
            {status === 'success' && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                  <ShieldCheck size={20} />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Kernel Verified</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Successfully completed in {formatTime(elapsedTime)}.</div>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 flex gap-4">
              {status !== 'processing' ? (
                <Button 
                  variant={status === 'success' ? 'primary' : 'outline'} 
                  className={cn(
                    "w-full h-14 font-semibold uppercase tracking-wider text-xs",
                    status === 'error' && "border-red-200 text-red-600 hover:bg-red-50"
                  )}
                  onClick={onClose}
                >
                  {status === 'success' ? 'Proceed to Dashboard' : 'Dismiss Alert'}
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              ) : (
                <div className="w-full h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-6 gap-4">
                  <Terminal size={16} className="text-primary/40" />
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider leading-none">
                      Active Kernal Node
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                      {currentNode}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    <span className="w-1 h-1 bg-primary/60 rounded-full animate-pulse" />
                    <span className="w-1 h-1 bg-primary/60 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-1 bg-primary/60 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProcessingModal;
