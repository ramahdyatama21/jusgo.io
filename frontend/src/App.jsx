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
  
  // Simple test first
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Jusgo.io POS System</h1>
        <p className="text-gray-600 mb-8">Sistem Kasir & Inventory</p>
        <div className="space-y-4">
          <a href="/login" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Login
          </a>
          <a href="/dashboard" className="block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;