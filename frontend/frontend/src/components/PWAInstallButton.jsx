import React from 'react';
import usePWA from '../hooks/usePWA';

const PWAInstallButton = () => {
  const { isInstalled, showInstallPrompt, installApp, dismissInstallPrompt } = usePWA();

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  const handleInstallClick = async () => {
    await installApp();
  };

  return (
    <div className="pwa-install-banner" style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          📱
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
            Install JusGo POS
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Akses cepat dari home screen
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          Install
        </button>
        <button
          onClick={dismissInstallPrompt}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PWAInstallButton;
