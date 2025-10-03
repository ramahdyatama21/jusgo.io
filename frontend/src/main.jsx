// frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Simple error boundary
class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fef2f2',
          color: '#dc2626',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Terjadi Kesalahan!</h2>
            <p style={{ marginBottom: '20px' }}>
              Maaf, terjadi kesalahan yang tidak terduga.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render app
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <SimpleErrorBoundary>
      <App />
    </SimpleErrorBoundary>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fef2f2;
      color: #dc2626;
      padding: 20px;
      text-align: center;
    ">
      <div>
        <h2>Gagal Memuat Aplikasi</h2>
        <p>Terjadi kesalahan saat memuat aplikasi. Silakan muat ulang halaman.</p>
        <button onclick="window.location.reload()" style="
          padding: 10px 20px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">
          Muat Ulang
        </button>
      </div>
    </div>
  `;
}