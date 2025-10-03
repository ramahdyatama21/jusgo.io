import React, { useState, useEffect } from 'react';
import { getProducts, createTransaction } from '../services/api';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };
  
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Stok produk habis!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity >= product.stock) {
        alert(`Stok tidak mencukupi! Stok tersedia: ${product.stock}`);
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const product = products.find(p => p.id === productId);
      if (product && quantity > product.stock) {
        alert(`Stok tidak mencukupi! Stok tersedia: ${product.stock}`);
        return;
      }
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };
  
  const getTotal = () => {
    return cart.reduce((total, item) => total + ((item.sell_price || 0) * (item.quantity || 0)), 0);
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const transactionData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name || '',
          price: item.sell_price || 0,
          qty: item.quantity || 0,
          subtotal: (item.sell_price || 0) * (item.quantity || 0)
        })),
        subtotal: getTotal(),
        discount: 0,
        total: getTotal(),
        paymentMethod: 'tunai',
        notes: ''
      };

      const result = await createTransaction(transactionData);
      
      if (result && result.id) {
        alert(`Transaksi berhasil! ID: ${result.id}\nTotal: Rp ${getTotal().toLocaleString()}`);
        setCart([]);
        // Refresh products to update stock
        loadProducts();
      } else {
        throw new Error('Transaksi gagal');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Error: ${error.message || 'Gagal memproses transaksi'}`);
    }
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kasir (POS)</h1>
        <p className="page-subtitle">Sistem Point of Sale</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Product List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daftar Produk</h3>
            <button 
              className="btn btn-secondary" 
              onClick={loadProducts}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Memuat data produk...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              {error}
              <button 
                className="btn btn-primary" 
                onClick={loadProducts}
                style={{ marginTop: '1rem' }}
              >
                Coba Lagi
              </button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>Tidak ada produk tersedia</p>
              <button 
                className="btn btn-primary" 
                onClick={loadProducts}
                style={{ marginTop: '1rem' }}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {products.map((product) => (
                <div key={product.id} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>{product.name}</h4>
                  {product.category && (
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      {product.category}
                    </p>
                  )}
                  <p style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Rp {(product.sell_price || 0).toLocaleString()}
                  </p>
                  <p style={{ 
                    color: product.stock <= (product.min_stock || 5) ? '#ef4444' : '#64748b', 
                    fontSize: '0.875rem', 
                    marginBottom: '1rem',
                    fontWeight: product.stock <= (product.min_stock || 5) ? 'bold' : 'normal'
                  }}>
                    Stok: {product.stock}
                    {product.stock <= (product.min_stock || 5) && ' (Stok Rendah)'}
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    style={{ 
                      width: '100%',
                      opacity: product.stock <= 0 ? 0.5 : 1,
                      cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Shopping Cart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Keranjang Belanja</h3>
          </div>
          
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
              Keranjang kosong
            </p>
          ) : (
            <>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{item.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Rp {(item.sell_price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          border: '1px solid #d1d5db',
                          background: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '2rem', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          border: '1px solid #d1d5db',
                          background: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                borderTop: '2px solid #e5e7eb', 
                paddingTop: '1rem', 
                marginTop: '1rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  <span>Total:</span>
                  <span>Rp {getTotal().toLocaleString()}</span>
                </div>
                
                <button 
                  className="btn btn-success"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  style={{ 
                    width: '100%',
                    opacity: cart.length === 0 ? 0.5 : 1,
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {cart.length === 0 ? 'Keranjang Kosong' : 'Proses Pembayaran'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;