import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import POS from './pages/POS';
import Reports from './pages/Reports';
import OpenOrder from './pages/OpenOrder';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import KalkulatorHPP from './pages/KalkulatorHPP';
import Promo from './pages/Promo';
import BelanjaBahan from './pages/BelanjaBahan';
import { supabase } from './services/supabase';

function ProtectedRoute({ children, allow }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>;
  if (!session) return <Navigate to="/login" />;

  const role = session?.user?.app_metadata?.role || '';
  if (Array.isArray(allow) && allow.length > 0 && !allow.includes(role)) {
    // If unauthorized, send kasir to POS, others to dashboard
    return <Navigate to={role === 'kasir' ? '/pos' : '/dashboard'} replace />;
  }

  return children;
}

function App() {
  console.log('App component rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#2563eb', 
          marginBottom: '1rem',
          margin: '0 0 1rem 0'
        }}>
          Jusgo.io POS System
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem',
          fontSize: '1.2rem',
          margin: '0 0 2rem 0'
        }}>
          Sistem Kasir & Inventory
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            Dashboard
          </button>
        </div>
        <div style={{ 
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#9ca3af'
        }}>
          <p>Backend: http://localhost:5000</p>
          <p>Frontend: http://localhost:5173</p>
        </div>
      </div>
    </div>
  );
}

export default App;