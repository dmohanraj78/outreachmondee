import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <div className="space-y-2 max-w-xs">
      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {message}
      </p>
    </div>
    {actionLabel && onAction && (
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-6"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    )}
  </motion.div>
);

export default EmptyState;
