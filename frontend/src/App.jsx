// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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

function ProtectedRoute({ children }) {
  const session = localStorage.getItem('supabase_session');
  return session ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <Layout><Products /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/stock" element={
          <ProtectedRoute>
            <Layout><Stock /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/pos" element={
          <ProtectedRoute>
            <Layout><POS /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/open-order" element={
          <ProtectedRoute>
            <Layout><OpenOrder /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/riwayat-transaksi" element={
          <ProtectedRoute>
            <Layout><RiwayatTransaksi /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/kalkulator-hpp" element={
          <ProtectedRoute>
            <Layout><KalkulatorHPP /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/promo" element={
          <ProtectedRoute>
            <Layout><Promo /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/belanja-bahan" element={
          <ProtectedRoute>
            <Layout><BelanjaBahan /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;