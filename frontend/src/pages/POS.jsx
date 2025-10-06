import React, { useState, useEffect } from 'react';
import { getProducts, createTransaction } from '../services/api';
import PrintReceipt from '../components/PrintReceipt';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading products...');
      
      // Load products directly without unnecessary tests
      const data = await getProducts();
      console.log('✅ Products loaded:', data?.length || 0, 'items');
      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading products:', err);
      setError(`Gagal memuat data produk: ${err.message}`);
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
        // Prepare transaction data for receipt
        const receiptData = {
          id: result.id,
          items: cart,
          subtotal: getTotal(),
          discount: 0,
          tax: 0,
          total: getTotal(),
          payment: 0,
          change: 0,
          paymentMethod: 'tunai',
          cashier: 'Admin',
          created_at: new Date()
        };
        
        setLastTransaction(receiptData);
        setShowReceipt(true);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">Kasir (POS)</h1>
          <p className="text-sm sm:text-base text-gray-600">Sistem Point of Sale</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Product List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Daftar Produk</h3>
            <button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors" 
              onClick={loadProducts}
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Memuat produk...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors" 
                onClick={loadProducts}
              >
                Coba Lagi
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Tidak ada produk tersedia</p>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors" 
                onClick={loadProducts}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow bg-white cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1 line-clamp-2">{product.name}</h4>
                  {product.category && (
                    <p className="text-gray-500 text-xs mb-2">
                      {product.category}
                    </p>
                  )}
                  <p className="text-blue-600 font-bold text-base sm:text-lg mb-2">
                    Rp {(product.sell_price || 0).toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs sm:text-sm font-medium ${product.stock <= (product.min_stock || 5) ? 'text-red-600' : 'text-gray-600'}`}>
                      Stok: {product.stock}
                    </span>
                    {product.stock <= (product.min_stock || 5) && product.stock > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Low</span>
                    )}
                  </div>
                  <button 
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.stock <= 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? '❌ Habis' : '➕ Tambah'}
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        
        {/* Shopping Cart */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
            <h3 className="text-lg sm:text-xl font-semibold text-white">🛒 Keranjang</h3>
            {cart.length > 0 && (
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                {cart.length}
              </span>
            )}
          </div>
          
          <div className="p-4 sm:p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500">Keranjang kosong</p>
              <p className="text-sm text-gray-400 mt-2">Tambahkan produk untuk memulai</p>
            </div>
          ) : (
            <>
              <div className="max-h-[40vh] sm:max-h-96 overflow-y-auto space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                        <p className="text-blue-600 font-semibold text-sm">
                          Rp {(item.sell_price || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                        title="Hapus"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 font-semibold text-gray-800 min-w-[3rem] text-center border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-bold text-gray-800">
                          Rp {((item.sell_price || 0) * (item.quantity || 0)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Pembayaran:</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rp {getTotal().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <button 
                  className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all transform active:scale-95 ${
                    cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                  }`}
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  {cart.length === 0 ? '🛒 Keranjang Kosong' : '💳 Proses Pembayaran'}
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
      </div>

      {/* Print Receipt Modal */}
      {showReceipt && lastTransaction && (
        <PrintReceipt 
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default POS;