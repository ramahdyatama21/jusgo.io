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
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Selamat datang di POS System</p>
        </div>
      </div>

      {/* Quick Stats like TailAdmin */}
      <div className="quick-stats">
        <div className="quick-stat success">
          <div className="quick-stat-value">
            Rp {safeStats.todayRevenue?.toLocaleString() || '0'}
          </div>
          <div className="quick-stat-label">Omzet Hari Ini</div>
          <div className="quick-stat-change positive">+11.01%</div>
        </div>

        <div className="quick-stat">
          <div className="quick-stat-value">
            Rp {safeStats.monthRevenue?.toLocaleString() || '0'}
          </div>
          <div className="quick-stat-label">Omzet Bulan Ini</div>
          <div className="quick-stat-change positive">+9.05%</div>
        </div>

        <div className="quick-stat warning">
          <div className="quick-stat-value">
            {safeStats.totalProducts || 0}
          </div>
          <div className="quick-stat-label">Total Produk</div>
          <div className="quick-stat-change positive">+5.2%</div>
        </div>

        <div className="quick-stat danger">
          <div className="quick-stat-value">
            {safeStats.lowStock || 0}
          </div>
          <div className="quick-stat-label">Stok Rendah</div>
          <div className="quick-stat-change negative">Perhatian!</div>
        </div>
      </div>

      {/* Two Column Layout like TailAdmin */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left Column - Charts/Data */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Sales</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>View More</button>
              <button className="btn btn-danger" style={{ fontSize: '0.75rem' }}>Delete</button>
            </div>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '1rem' }}>📊</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Rp 1,250,000</div>
            <div style={{ color: '#64748b' }}>Total Penjualan Bulan Ini</div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>+10%</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>You earn Rp 328,700 today, it's higher than last month. Keep up your good work!</div>
            </div>
          </div>
        </div>

        {/* Right Column - Target/Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Target</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>View More</button>
              <button className="btn btn-danger" style={{ fontSize: '0.75rem' }}>Delete</button>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Target</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>Rp 20K</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>Rp 20K</div>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Today</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>Rp 20K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table like TailAdmin */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Orders</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>Filter</button>
            <button className="btn btn-primary" style={{ fontSize: '0.75rem' }}>See all</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Products</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2rem', height: '2rem', background: '#f3f4f6', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Macbook pro 13"</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>2 Variants</div>
                    </div>
                  </div>
                </td>
                <td>Laptop</td>
                <td>Rp 23,990,000</td>
                <td><span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600', background: '#dcfce7', color: '#166534' }}>Delivered</span></td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2rem', height: '2rem', background: '#f3f4f6', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⌚</div>
                    <div>
                      <div style={{ fontWeight: '600' }}>Apple Watch Ultra</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>1 Variants</div>
                    </div>
                  </div>
                </td>
                <td>Watch</td>
                <td>Rp 8,790,000</td>
                <td><span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600', background: '#fef3c7', color: '#d97706' }}>Pending</span></td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2rem', height: '2rem', background: '#f3f4f6', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</div>
                    <div>
                      <div style={{ fontWeight: '600' }}>iPhone 15 Pro Max</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>2 Variants</div>
                    </div>
                  </div>
                </td>
                <td>SmartPhone</td>
                <td>Rp 18,690,000</td>
                <td><span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600', background: '#dcfce7', color: '#166534' }}>Delivered</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}