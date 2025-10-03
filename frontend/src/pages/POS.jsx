import React, { useState } from 'react';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Kopi Hitam', price: 15000, stock: 50 },
    { id: 2, name: 'Nasi Goreng', price: 25000, stock: 25 },
    { id: 3, name: 'Teh Manis', price: 8000, stock: 100 },
    { id: 4, name: 'Mie Ayam', price: 20000, stock: 15 }
  ]);
  
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
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
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };
  
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Simulate checkout
    alert(`Transaksi berhasil! Total: Rp ${getTotal().toLocaleString()}`);
    setCart([]);
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
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {products.map((product) => (
              <div key={product.id} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                textAlign: 'center'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{product.name}</h4>
                <p style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Rp {product.price.toLocaleString()}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Stok: {product.stock}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => addToCart(product)}
                  style={{ width: '100%' }}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
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
                        Rp {item.price.toLocaleString()}
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
                  style={{ width: '100%' }}
                >
                  Proses Pembayaran
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