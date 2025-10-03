import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { supabase } from '../services/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStock: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [salesPerDay, setSalesPerDay] = useState([]);
  const [salesPerWeek, setSalesPerWeek] = useState([]);
  const [salesPerMonth, setSalesPerMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStats();
    loadTopProducts();
    loadSalesData();
  }, []);

  const loadStats = async () => {
    try {
      // Get products count
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Get transactions count and revenue
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*');
      
      if (transactionsError) throw transactionsError;

      // Calculate stats
      const totalProducts = products?.length || 0;
      const lowStock = products?.filter(p => p.stock <= p.minStock).length || 0;
      const totalSales = transactions?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total || 0), 0) || 0;

      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        lowStock
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      // Get products with sales data
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setTopProducts(products || []);
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      // Get transactions for charts
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;

      // Process sales data
      const perDay = {};
      const perWeek = {};
      const perMonth = {};

      transactions?.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const dayKey = date.toISOString().split('T')[0];
        const weekKey = getWeekKey(date);
        const monthKey = date.toISOString().slice(0, 7);

        perDay[dayKey] = (perDay[dayKey] || 0) + (transaction.total || 0);
        perWeek[weekKey] = (perWeek[weekKey] || 0) + (transaction.total || 0);
        perMonth[monthKey] = (perMonth[monthKey] || 0) + (transaction.total || 0);
      });

      setSalesPerDay(Object.entries(perDay).map(([date, total]) => ({ date, total })));
      setSalesPerWeek(Object.entries(perWeek).map(([week, total]) => ({ week, total })));
      setSalesPerMonth(Object.entries(perMonth).map(([month, total]) => ({ month, total })));
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = Math.ceil((date.getDate() - 1) / 7) + 1;
    return `${year}-${String(month).padStart(2, '0')}-W${week}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Selamat datang, {user.name || 'User'}!</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat success">
          <div className="quick-stat-value">{stats.totalProducts}</div>
          <div className="quick-stat-label">Total Produk</div>
          <div className="quick-stat-change positive">Produk aktif</div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-value">{stats.totalSales}</div>
          <div className="quick-stat-label">Total Transaksi</div>
          <div className="quick-stat-change positive">Semua waktu</div>
        </div>
        
        <div className="quick-stat warning">
          <div className="quick-stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="quick-stat-label">Total Pendapatan</div>
          <div className="quick-stat-change positive">Semua waktu</div>
        </div>
        
        <div className="quick-stat danger">
          <div className="quick-stat-value">{stats.lowStock}</div>
          <div className="quick-stat-label">Stok Rendah</div>
          <div className="quick-stat-change negative">Perlu restok</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pendapatan Bulan Ini</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Target: {formatCurrency(stats.totalRevenue * 1.2)}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Target Bulan Ini</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
            {formatCurrency(stats.totalRevenue * 1.2)}
          </div>
          <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Progress: {Math.round((stats.totalRevenue / (stats.totalRevenue * 1.2)) * 100)}%
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Produk Terlaris</h3>
        </div>
        {topProducts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Harga Jual</th>
                  <th>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                        <div>
                          <div style={{ fontWeight: '600' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.sellPrice)}</td>
                    <td>{product.stock} {product.unit}</td>
                    <td>
                      {product.stock <= product.minStock ? (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '9999px',
                          backgroundColor: '#fecaca',
                          color: '#991b1b'
                        }}>
                          Stok Rendah
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '9999px',
                          backgroundColor: '#dcfce7',
                          color: '#166534'
                        }}>
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Belum ada data produk
          </div>
        )}
      </div>

      {/* Sales Charts */}
      {salesPerDay.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Grafik Penjualan</h3>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Per Hari</h4>
            <div style={{ height: '200px', overflow: 'auto' }}>
              {salesPerDay.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <span>{item.date}</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;