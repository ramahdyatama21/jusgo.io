// frontend/src/pages/Stock.jsx

import { useState, useEffect } from 'react';
import { getProducts, getStockMovements, addStock, removeStock } from '../services/api';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('in'); // 'in' atau 'out'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, movementsData] = await Promise.all([
        getProducts(),
        getStockMovements()
      ]);
      setProducts(productsData || []);
      setMovements(movementsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Terjadi kesalahan saat memuat data. Silakan coba lagi.');
    }
  };

  const handleStockAction = async () => {
    if (!selectedProduct || !selectedProduct.id) {
      alert('Mohon pilih produk terlebih dahulu');
      return;
    }
    
    if (!qty || qty <= 0) {
      alert('Mohon masukkan jumlah yang valid');
      return;
    }

    setLoading(true);
    try {
      if (modalType === 'in') {
        await addStock(selectedProduct.id, parseInt(qty), description);
        alert('Stok berhasil ditambahkan');
      } else {
        await removeStock(selectedProduct.id, parseInt(qty), description);
        alert('Stok berhasil dikurangi');
      }
      setShowModal(false);
      resetForm();
      await loadData(); // Reload data after successful update
    } catch (error) {
      console.error('Stock update error:', error);
      alert(error.message || 'Terjadi kesalahan saat memperbarui stok');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, product) => {
    setModalType(type);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setQty(0);
    setDescription('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen Stok</h1>
        <p className="page-subtitle">Kelola stok produk dan pergerakan barang</p>
      </div>

      {/* Daftar Produk */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Produk</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU</th>
                <th>Stok Saat Ini</th>
                <th>Min. Stok</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ backgroundColor: product.stock <= product.minStock ? '#fef2f2' : '' }}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{product.name}</div>
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: product.stock <= product.minStock ? '#dc2626' : '#1e293b' 
                    }}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td>
                    {product.minStock} {product.unit}
                  </td>
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
                        Normal
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openModal('in', product)}
                      className="btn btn-success"
                      style={{ marginRight: '0.5rem', fontSize: '0.875rem' }}
                    >
                      + Masuk
                    </button>
                    <button
                      onClick={() => openModal('out', product)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.875rem' }}
                    >
                      - Keluar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Stok */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Riwayat Pergerakan Stok</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Produk</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Keterangan</th>
                <th>Oleh</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    {formatDate(movement.created_at)}
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{movement.product?.name || '-'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{movement.product?.sku || ''}</div>
                  </td>
                  <td>
                    {movement.type === 'in' ? (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        backgroundColor: '#dcfce7',
                        color: '#166534'
                      }}>
                        Masuk
                      </span>
                    ) : (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        backgroundColor: '#fecaca',
                        color: '#991b1b'
                      }}>
                        Keluar
                      </span>
                    )}
                  </td>
                  <td>
                    {movement.qty} {movement.product?.unit || ''}
                  </td>
                  <td>
                    {movement.description || '-'}
                  </td>
                  <td>
                    -
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Stok */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '28rem',
            width: '100%'
          }}>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
                {modalType === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Produk</label>
                  <input
                    type="text"
                    value={selectedProduct?.name || ''}
                    disabled
                    className="form-input"
                    style={{ backgroundColor: '#f3f4f6' }}
                  />
                </div>

                <div>
                  <label className="form-label">Stok Saat Ini</label>
                  <input
                    type="text"
                    value={`${selectedProduct?.stock || 0} ${selectedProduct?.unit || ''}`}
                    disabled
                    className="form-input"
                    style={{ backgroundColor: '#f3f4f6' }}
                  />
                </div>

                <div>
                  <label className="form-label">Jumlah</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Keterangan</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                    rows="3"
                    placeholder="Opsional"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleStockAction}
                    disabled={loading}
                    className={`btn ${modalType === 'in' ? 'btn-success' : 'btn-danger'}`}
                    style={{ opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Memproses...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
