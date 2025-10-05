import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Stock from './pages/Stock';
import OpenOrder from './pages/OpenOrder';
import BelanjaBahan from './pages/BelanjaBahan';
import KalkulatorHPP from './pages/KalkulatorHPP';
import Promo from './pages/Promo';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import SupabaseTest from './components/SupabaseTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="pos" element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          } />
          <Route path="transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="stock" element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          } />
          <Route path="open-order" element={
            <ProtectedRoute>
              <OpenOrder />
            </ProtectedRoute>
          } />
          <Route path="belanja-bahan" element={
            <ProtectedRoute>
              <BelanjaBahan />
            </ProtectedRoute>
          } />
          <Route path="kalkulator-hpp" element={
            <ProtectedRoute>
              <KalkulatorHPP />
            </ProtectedRoute>
          } />
          <Route path="promo" element={
            <ProtectedRoute>
              <Promo />
            </ProtectedRoute>
          } />
          <Route path="riwayat-transaksi" element={
            <ProtectedRoute>
              <RiwayatTransaksi />
            </ProtectedRoute>
          } />
          <Route path="supabase-test" element={<SupabaseTest />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;