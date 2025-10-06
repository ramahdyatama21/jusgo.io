import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { simpleTest } from '../utils/simpleTest';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sell_price: '',
    stock: '',
    category: 'ColdPressJuice',
    description: '',
    sku: '',
    min_stock: 5,
    unit: 'pcs'
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Simple connection test
      console.log('🔍 Testing Supabase connection...');
      const test = await simpleTest();
      
      if (!test.success) {
        throw new Error(`Database connection failed: ${test.error}`);
      }
      
      console.log('✅ Supabase connection successful');
      
      // Load products
      const data = await productService.getProducts();
      setProducts(data || []);
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError(`Database error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        sell_price: parseFloat(formData.sell_price),
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock)
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
      sell_price: product.sell_price || '',
      stock: product.stock || '',
      category: 'ColdPressJuice',
      description: product.description || '',
      sku: product.sku || '',
      min_stock: product.min_stock || 5,
      unit: product.unit || 'pcs'
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
      sell_price: '',
      stock: '',
      category: 'ColdPressJuice',
      description: '',
      sku: '',
      min_stock: 5,
      unit: 'pcs'
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <div className="text-lg text-gray-600">Memuat produk...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">📦 Manajemen Produk</h1>
          <p className="text-purple-100 mt-1 text-sm sm:text-base">Kelola produk dan stok</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-3">{error}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium" 
              onClick={() => {
                setError(null);
                loadProducts();
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-800">Daftar Produk</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="🔍 Cari produk..."
                  className="flex-1 sm:flex-none sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <button 
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? '✕ Batal' : '➕ Tambah Produk'}
                </button>
              </div>
            </div>
          </div>
        
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <label className="form-label">Harga Jual</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.sell_price}
                  onChange={(e) => setFormData({...formData, sell_price: e.target.value})}
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
                  placeholder="5"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Satuan</label>
                <select
                  className="form-input"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="gram">Gram</option>
                  <option value="liter">Liter</option>
                  <option value="ml">ML</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <div style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  ColdPressJuice (Otomatis)
                </div>
              </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Deskripsi produk (opsional)"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-2">
                <button type="submit" className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  {editingProduct ? '✓ Update Produk' : '✓ Simpan Produk'}
                </button>
                <button type="button" className="flex-1 sm:flex-none bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors" onClick={resetForm}>
                  ✕ Batal
                </button>
              </div>
            </form>
          )}
        
          <div className="p-4 sm:p-6">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">{searchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk'}</p>
                <p className="text-sm text-gray-400 mt-2">Klik "Tambah Produk" untuk memulai</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 mt-1">{product.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{product.sku || '-'}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">Rp {product.sell_price?.toLocaleString() || '0'}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={product.stock <= product.min_stock ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                              {product.stock || 0} {product.unit || 'pcs'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {product.stock <= product.min_stock ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Low</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">OK</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium" onClick={() => handleEdit(product)}>
                                Edit
                              </button>
                              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium" onClick={() => handleDelete(product.id)}>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">{product.name}</h3>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                          )}
                          {product.sku && (
                            <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
                          )}
                        </div>
                        {product.stock <= product.min_stock ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 ml-2">Low</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 ml-2">OK</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">Harga:</span>
                          <p className="font-semibold text-blue-600">Rp {product.sell_price?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Stok:</span>
                          <p className={`font-semibold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-green-600'}`}>
                            {product.stock || 0} {product.unit || 'pcs'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" 
                          onClick={() => handleEdit(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" 
                          onClick={() => handleDelete(product.id)}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;