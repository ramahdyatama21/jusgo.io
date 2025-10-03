import React, { useState } from 'react';

const Transactions = () => {
  const [transactions] = useState([
    {
      id: 'TXN001',
      date: '2024-01-15',
      time: '14:30',
      items: 'Kopi Hitam, Nasi Goreng',
      total: 40000,
      paymentMethod: 'Cash',
      status: 'Completed'
    },
    {
      id: 'TXN002',
      date: '2024-01-15',
      time: '15:45',
      items: 'Teh Manis, Mie Ayam',
      total: 28000,
      paymentMethod: 'QRIS',
      status: 'Completed'
    },
    {
      id: 'TXN003',
      date: '2024-01-15',
      time: '16:20',
      items: 'Kopi Hitam',
      total: 15000,
      paymentMethod: 'Cash',
      status: 'Completed'
    }
  ]);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status.toLowerCase() === filter;
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.items.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const getTotalRevenue = () => {
    return transactions.reduce((total, transaction) => total + transaction.total, 0);
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Riwayat Transaksi</h1>
        <p className="page-subtitle">Lihat semua transaksi yang telah dilakukan</p>
      </div>
      
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
            💰
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            Rp {getTotalRevenue().toLocaleString()}
          </div>
          <div className="stat-label">Total Pendapatan</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
            📋
          </div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {transactions.length}
          </div>
          <div className="stat-label">Total Transaksi</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
            📊
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            Rp {Math.round(getTotalRevenue() / transactions.length).toLocaleString()}
          </div>
          <div className="stat-label">Rata-rata per Transaksi</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Filter Transaksi</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Cari Transaksi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Cari berdasarkan ID atau item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="completed">Selesai</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Transaksi</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal & Waktu</th>
                <th>Items</th>
                <th>Total</th>
                <th>Metode Pembayaran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td style={{ fontWeight: '500' }}>{transaction.id}</td>
                  <td>
                    <div>{transaction.date}</div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {transaction.time}
                    </div>
                  </td>
                  <td>{transaction.items}</td>
                  <td style={{ fontWeight: '500' }}>
                    Rp {transaction.total.toLocaleString()}
                  </td>
                  <td>{transaction.paymentMethod}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: transaction.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                      color: transaction.status === 'Completed' ? '#166534' : '#92400e'
                    }}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Tidak ada transaksi yang ditemukan
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
