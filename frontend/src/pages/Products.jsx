import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    sku: '',
    min_stock: 0
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock) || 0
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Gagal menyimpan produk');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || '',
      description: product.description || '',
      sku: product.sku || '',
      min_stock: product.min_stock || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await productService.deleteProduct(id);
        await loadProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Gagal menghapus produk');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      sku: '',
      min_stock: 0
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await productService.searchProducts(query);
        setProducts(data || []);
      } catch (err) {
        console.error('Error searching products:', err);
      }
    } else {
      await loadProducts();
    }
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
      <div className="page-header">
        <h1 className="page-title">Manajemen Produk</h1>
        <p className="page-subtitle">Kelola produk dan stok</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setError(null);
              loadProducts();
            }}
          >
            Coba Lagi
          </button>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Produk</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Cari produk..."
              className="form-input"
              style={{ width: '200px' }}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Batal' : 'Tambah Produk'}
            </button>
          </div>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="Kode produk"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Harga</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stok</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Min. Stok</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Snack">Snack</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Deskripsi produk (opsional)"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-success">
                {editingProduct ? 'Update Produk' : 'Simpan Produk'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Batal
              </button>
            </div>
          </form>
        )}
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>SKU</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Min. Stok</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    {searchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk'}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{product.name}</div>
                      {product.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td>{product.sku || '-'}</td>
                    <td>Rp {product.price?.toLocaleString() || '0'}</td>
                    <td>
                      <span style={{ 
                        color: product.stock <= product.min_stock ? '#ef4444' : '#10b981',
                        fontWeight: '500'
                      }}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td>{product.min_stock || 0}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.stock <= product.min_stock ? (
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
                        className="btn btn-secondary" 
                        style={{ marginRight: '0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleDelete(product.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;