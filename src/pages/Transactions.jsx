import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';
import PrintReceipt from '../components/PrintReceipt';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (transaction) => {
    // Prepare transaction data for receipt
    const receiptData = {
      id: transaction.id,
      items: transaction.items || [],
      subtotal: transaction.subtotal || transaction.total || 0,
      discount: transaction.discount || 0,
      tax: transaction.tax || 0,
      total: transaction.total || 0,
      payment: transaction.payment || transaction.total || 0,
      change: transaction.change || 0,
      paymentMethod: transaction.paymentMethod || transaction.payment_method || 'tunai',
      cashier: transaction.cashier || 'Admin',
      created_at: transaction.created_at || new Date()
    };
    
    setSelectedTransaction(receiptData);
    setShowReceipt(true);
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || (transaction.status || '').toLowerCase() === filter;
    const transactionId = (transaction.id || '').toString().toLowerCase();
    const itemsText = Array.isArray(transaction.items) 
      ? transaction.items.map(item => item.name || '').join(' ').toLowerCase()
      : (transaction.items || '').toString().toLowerCase();
    const matchesSearch = transactionId.includes(searchTerm.toLowerCase()) ||
                         itemsText.includes(searchTerm.toLowerCase());
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
                  <td style={{ fontWeight: '500' }}>#{(transaction.id || '').slice(0, 8)}</td>
                  <td>
                    <div>
                      {new Date(transaction.created_at || transaction.date).toLocaleDateString('id-ID')}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {new Date(transaction.created_at || transaction.date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td>
                    {Array.isArray(transaction.items) 
                      ? transaction.items.map(item => item.name).join(', ')
                      : transaction.items || '-'
                    }
                  </td>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        onClick={() => handlePrintReceipt(transaction)}
                      >
                        🖨️ Print
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                      >
                        👁️ Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            {loading ? 'Memuat transaksi...' : 'Tidak ada transaksi yang ditemukan'}
          </div>
        )}
      </div>

      {/* Print Receipt Modal */}
      {showReceipt && selectedTransaction && (
        <PrintReceipt 
          transaction={selectedTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default Transactions;
