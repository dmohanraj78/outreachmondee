import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => (
  <div style={{ 
    padding: '80px 40px', 
    textAlign: 'center', 
    background: 'white',
    borderRadius: '16px',
    border: '1px solid var(--n30)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
    margin: '20px'
  }}>
    <div style={{ 
      background: 'rgba(250, 77, 51, 0.05)',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px auto',
      color: 'var(--accent)'
    }}>
      <Icon size={48} strokeWidth={1.5} />
    </div>
    <h3 style={{ 
      color: 'var(--n800)', 
      margin: '0 0 12px 0',
      fontSize: '24px',
      fontWeight: '700'
    }}>{title}</h3>
    <p style={{ 
      color: 'var(--n100)', 
      margin: 0, 
      maxWidth: '340px', 
      margin: '0 auto',
      fontSize: '15px',
      lineHeight: '1.6'
    }}>{message}</p>
  </div>
);

export default EmptyState;
