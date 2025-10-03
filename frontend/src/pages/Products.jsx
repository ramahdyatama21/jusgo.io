import React, { useState } from 'react';

const Products = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Kopi Hitam', price: 15000, stock: 50, category: 'Minuman' },
    { id: 2, name: 'Nasi Goreng', price: 25000, stock: 25, category: 'Makanan' },
    { id: 3, name: 'Teh Manis', price: 8000, stock: 100, category: 'Minuman' },
    { id: 4, name: 'Mie Ayam', price: 20000, stock: 15, category: 'Makanan' }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: products.length + 1,
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock)
    };
    setProducts([...products, newProduct]);
    setFormData({ name: '', price: '', stock: '', category: '' });
    setShowForm(false);
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen Produk</h1>
        <p className="page-subtitle">Kelola produk dan stok</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Produk</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Batal' : 'Tambah Produk'}
          </button>
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
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-success">Simpan Produk</button>
          </form>
        )}
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Kategori</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>Rp {product.price.toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      color: product.stock < 20 ? '#ef4444' : '#10b981',
                      fontWeight: '500'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;