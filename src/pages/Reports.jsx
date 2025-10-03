import React, { useState } from 'react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const reportData = {
    today: {
      revenue: 1250000,
      transactions: 12,
      topProducts: [
        { name: 'Kopi Hitam', sold: 8, revenue: 120000 },
        { name: 'Nasi Goreng', sold: 5, revenue: 125000 },
        { name: 'Teh Manis', sold: 10, revenue: 80000 }
      ]
    },
    week: {
      revenue: 8750000,
      transactions: 85,
      topProducts: [
        { name: 'Kopi Hitam', sold: 45, revenue: 675000 },
        { name: 'Nasi Goreng', sold: 38, revenue: 950000 },
        { name: 'Mie Ayam', sold: 42, revenue: 840000 }
      ]
    },
    month: {
      revenue: 15750000,
      transactions: 156,
      topProducts: [
        { name: 'Kopi Hitam', sold: 89, revenue: 1335000 },
        { name: 'Nasi Goreng', sold: 67, revenue: 1675000 },
        { name: 'Mie Ayam', sold: 78, revenue: 1560000 }
      ]
    }
  };
  
  const currentData = reportData[selectedPeriod];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Laporan Penjualan</h1>
        <p className="page-subtitle">Analisis data penjualan dan performa bisnis</p>
      </div>

      {/* Period Selector */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pilih Periode Laporan</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${selectedPeriod === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedPeriod('today')}
          >
            Hari Ini
          </button>
          <button
            className={`btn ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Minggu Ini
          </button>
          <button
            className={`btn ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
            💰
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            Rp {currentData.revenue.toLocaleString()}
          </div>
          <div className="stat-label">Total Pendapatan</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
            📋
          </div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {currentData.transactions}
          </div>
          <div className="stat-label">Total Transaksi</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
            📊
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            Rp {Math.round(currentData.revenue / currentData.transactions).toLocaleString()}
          </div>
          <div className="stat-label">Rata-rata per Transaksi</div>
        </div>
      </div>
      
      {/* Top Products */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Produk Terlaris</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Nama Produk</th>
                <th>Terjual</th>
                <th>Pendapatan</th>
                <th>Persentase</th>
              </tr>
            </thead>
            <tbody>
              {currentData.topProducts.map((product, index) => (
                <tr key={product.name}>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7c2f',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>{product.name}</td>
                  <td>{product.sold} pcs</td>
                  <td style={{ fontWeight: '500' }}>
                    Rp {product.revenue.toLocaleString()}
                  </td>
                  <td>
                    {Math.round((product.revenue / currentData.revenue) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sales Chart Placeholder */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Grafik Penjualan</h3>
        </div>
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8fafc',
          borderRadius: '0.5rem',
          color: '#64748b'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <p>Grafik penjualan akan ditampilkan di sini</p>
            <p style={{ fontSize: '0.875rem' }}>
              Fitur chart akan ditambahkan dengan library seperti Chart.js atau Recharts
            </p>
          </div>
        </div>
      </div>
      
      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Export Laporan</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">
            📄 Export PDF
          </button>
          <button className="btn btn-secondary">
            📊 Export Excel
          </button>
          <button className="btn btn-success">
            📧 Kirim Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;