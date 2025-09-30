// frontend/src/pages/POS.jsx

import { useState, useEffect } from 'react';
import { getProducts, createTransaction } from '../services/api';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null); // Tambah state untuk struk
  const [diskonManual, setDiskonManual] = useState('');
  const [promoList, setPromoList] = useState([]);
  const [promoDipilih, setPromoDipilih] = useState('');

  useEffect(() => {
    loadProducts();
    // Ambil promo dari localStorage
    const promos = localStorage.getItem('promoList');
    setPromoList(promos ? JSON.parse(promos) : []);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.qty >= product.stock) {
        alert('Stok tidak mencukupi');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
          : item
      ));
    } else {
      if (product.stock < 1) {
        alert('Stok habis');
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.sellPrice,
        qty: 1,
        subtotal: product.sellPrice,
        stock: product.stock
      }]);
    }
  };

  const updateQty = (productId, newQty) => {
    const item = cart.find(i => i.productId === productId);
    
    if (newQty > item.stock) {
      alert('Stok tidak mencukupi');
      return;
    }
    
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, qty: newQty, subtotal: newQty * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const hitungDiskonPromo = () => {
    const promo = promoList.find(p => p.nama === promoDipilih);
    const total = calculateTotal();
    if (promo && total >= (parseInt(promo.minBelanja) || 0)) {
      if (promo.tipe === 'persen') {
        return Math.round(total * (parseFloat(promo.nilai) / 100));
      } else {
        return Math.min(parseInt(promo.nilai), total);
      }
    }
    return 0;
  };
  const diskon = promoDipilih ? hitungDiskonPromo() : (parseInt(diskonManual) || 0);

  const saveToRiwayatTransaksi = (data) => {
    const prev = JSON.parse(localStorage.getItem('riwayatTransaksi') || '[]');
    localStorage.setItem('riwayatTransaksi', JSON.stringify([
      ...prev,
      data
    ]));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal
        })),
        paymentMethod,
        notes: '',
        diskon,
        promo: promoDipilih,
        createdAt: new Date().toLocaleString('id-ID'),
        status: 'pos',
        id: Date.now()
      };

      await createTransaction(transactionData);
      // Simpan data struk ke state
      setReceipt({
        ...transactionData,
        total: calculateTotal(),
        date: new Date().toLocaleString('id-ID'),
      });
      // Simpan ke riwayat transaksi
      saveToRiwayatTransaksi({
        ...transactionData,
        total: calculateTotal(),
        sentAt: transactionData.createdAt
      });
      alert('Transaksi berhasil!');
      setCart([]);
      setDiskonManual('');
      setPromoDipilih('');
      loadProducts();
    } catch (error) {
      const message = error?.message || (typeof error === 'string' ? error : 'Unknown error');
      alert(`Transaksi gagal: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Point of Sale</h1>
      {receipt && (
        <div className="bg-white rounded-lg shadow p-6 mb-4 print:bg-white" id="struk-area">
          <h2 className="text-xl font-bold mb-2">Struk Transaksi</h2>
          <div className="text-sm text-gray-600 mb-2">{receipt.date}</div>
          <div className="mb-2">Metode: <span className="font-semibold">{receipt.paymentMethod}</span></div>
          <table className="w-full text-sm mb-2">
            <thead>
              <tr className="border-b">
                <th className="text-left">Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right">{formatRupiah(item.price)}</td>
                  <td className="text-right">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Subtotal</span>
            <span>{formatRupiah(calculateTotal())}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Diskon</span>
            <span className="text-red-600">- {formatRupiah(diskon)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-blue-600">{formatRupiah(calculateTotal() - diskon)}</span>
          </div>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
            onClick={() => window.print()}
          >
            Print Struk
          </button>
          <button
            className="mt-4 ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 print:hidden"
            onClick={() => setReceipt(null)}
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`p-4 border rounded-lg text-left hover:shadow-md transition ${
                    product.stock === 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
                  }`}
                >
                  <div className="font-medium text-gray-800 mb-1">{product.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{product.sku}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatRupiah(product.sellPrice)}
                  </div>
                  <div className={`text-sm ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-500'}`}>
                    Stok: {product.stock}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Keranjang</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-600">{formatRupiah(item.price)}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-bold text-gray-800">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & Checkout */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="border-b pb-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatRupiah(calculateTotal())}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tunai">Tunai</option>
                <option value="qris_dummy">QRIS (PRO)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diskon Manual (Rp)</label>
              <input
                type="number"
                value={diskonManual}
                onChange={e => setDiskonManual(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                disabled={!!promoDipilih}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Promo</label>
              <select
                value={promoDipilih}
                onChange={e => setPromoDipilih(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Tidak Pakai Promo --</option>
                {promoList.map((p, i) => (
                  <option key={i} value={p.nama}>{p.nama} ({p.tipe === 'persen' ? p.nilai + '%' : 'Rp' + parseInt(p.nilai).toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Memproses...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}