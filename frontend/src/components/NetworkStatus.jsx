import React from 'react';
import usePWA from '../hooks/usePWA';

const NetworkStatus = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#ef4444',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'white',
        animation: 'pulse 2s infinite'
      }}></div>
      Mode Offline - Data akan disinkronkan saat online
    </div>
  );
};

export default NetworkStatus;
