import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => (
  <div style={{ padding: '64px', textAlign: 'center', background: 'white' }}>
    <div style={{ color: '#DFE1E6', marginBottom: '16px' }}>
      <Icon size={64} style={{ margin: '0 auto' }} strokeWidth={1.5} />
    </div>
    <h3 style={{ color: '#172B4D', margin: '0 0 8px 0' }}>{title}</h3>
    <p style={{ color: '#7A869A', margin: 0, maxWidth: '300px', margin: '0 auto' }}>{message}</p>
  </div>
);

export default EmptyState;
