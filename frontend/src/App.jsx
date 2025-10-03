// frontend/src/App.jsx

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

  if (loading) return null; // or spinner
  if (!session) return <Navigate to="/login" />;

  const role = session?.user?.app_metadata?.role || '';
  if (Array.isArray(allow) && allow.length > 0 && !allow.includes(role)) {
    // If unauthorized, send kasir to POS, others to dashboard
    return <Navigate to={role === 'kasir' ? '/pos' : '/dashboard'} replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allow={["admin"]}>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
        
        <Route path="/products" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><Products /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/stock" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><Stock /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/pos" element={
          <ProtectedRoute allow={["admin","kasir"]}>
            <Layout><POS /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/open-order" element={
          <ProtectedRoute allow={["admin","kasir"]}>
            <Layout><OpenOrder /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/riwayat-transaksi" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><RiwayatTransaksi /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/kalkulator-hpp" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><KalkulatorHPP /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/promo" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><Promo /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/belanja-bahan" element={
          <ProtectedRoute allow={["admin"]}>
            <Layout><BelanjaBahan /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;