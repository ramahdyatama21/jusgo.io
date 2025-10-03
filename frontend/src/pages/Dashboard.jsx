import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Gagal memuat data dashboard');
        // Set default stats if API fails
        setStats({
          todayRevenue: 0,
          monthRevenue: 0,
          totalProducts: 0,
          lowStock: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const safeStats = stats || {
    todayRevenue: 0,
    monthRevenue: 0,
    totalProducts: 0,
    lowStock: 0
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Selamat datang di POS System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
            💰
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            Rp {safeStats.todayRevenue?.toLocaleString() || '0'}
          </div>
          <div className="stat-label">Omzet Hari Ini</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
            📊
          </div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            Rp {safeStats.monthRevenue?.toLocaleString() || '0'}
          </div>
          <div className="stat-label">Omzet Bulan Ini</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
            📦
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {safeStats.totalProducts || 0}
          </div>
          <div className="stat-label">Total Produk</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
            ⚠️
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {safeStats.lowStock || 0}
          </div>
          <div className="stat-label">Stok Rendah</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ringkasan Hari Ini</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>12</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Transaksi Hari Ini</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>8</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Produk Terjual</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>Rp 104,167</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Rata-rata per Transaksi</div>
          </div>
        </div>
      </div>
    </div>
  );
}