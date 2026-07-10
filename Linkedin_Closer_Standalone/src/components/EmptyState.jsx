import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, message }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-10 text-center"
  >
    <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary/20 mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
      <Icon size={48} strokeWidth={1} />
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black text-primary/30 uppercase tracking-tighter leading-tight">
        {title}
      </h3>
      <p className="text-sm font-bold text-primary/10 max-w-xs italic leading-relaxed">
        {message}
      </p>
    </div>
  </motion.div>
);

export default EmptyState;
