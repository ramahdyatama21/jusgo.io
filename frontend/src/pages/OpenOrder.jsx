// frontend/src/pages/OpenOrder.jsx
import { useState, useEffect } from 'react';
import { getProducts, createTransaction, getOpenOrders, saveOpenOrder, deleteOpenOrder } from '../services/api';
import { markOpenOrderSent } from '../services/api';

export default function OpenOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customer, setCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [editOrderId, setEditOrderId] = useState(null);
  const [riwayatTransaksi, setRiwayatTransaksi] = useState(() => {
    const data = localStorage.getItem('riwayatTransaksi');
    return data ? JSON.parse(data) : [];
  });
  const [diskonManual, setDiskonManual] = useState('');
  const [promoList, setPromoList] = useState([]);
  const [promoDipilih, setPromoDipilih] = useState('');

  useEffect(() => {
    loadProducts();
    // Ambil promo dari localStorage
    const promos = localStorage.getItem('promoList');
    setPromoList(promos ? JSON.parse(promos) : []);
    // Ambil open orders dari Supabase
    async function fetchOrders() {
      const data = await getOpenOrders();
      setOrders(data || []);
    }
    fetchOrders();
  }, []);

  // Tidak perlu sync ke localStorage lagi

  useEffect(() => {
    localStorage.setItem('riwayatTransaksi', JSON.stringify(riwayatTransaksi));
  }, [riwayatTransaksi]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setProducts([]);
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
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
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

  const handleEditOrder = (order) => {
    setEditOrderId(order.id);
    setCustomer(order.customer);
    setNotes(''); // notes not in schema
    setCart((typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map(item => ({ ...item })));
    setDiskonManual(''); // diskon not in schema
    setPromoDipilih(order.promo || '');
    setShowForm(true);
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!customer || cart.length === 0) return;
    if (editOrderId) {
      // Update order di Supabase
      // (implementasi updateOpenOrder bisa ditambahkan di api.js jika diperlukan)
      // Untuk sekarang, hanya hapus dan tambah baru
      await deleteOpenOrder(editOrderId);
      await saveOpenOrder({
        id: editOrderId,
        customer,
        items: cart,
        total: Number(cart.reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0)),
        created_at: new Date().toISOString(),
        status: 'open'
      });
      setEditOrderId(null);
    } else {
      await saveOpenOrder({
        id: crypto.randomUUID(),
        customer,
        items: cart,
        total: Number(cart.reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0)),
        created_at: new Date().toISOString(),
        status: 'open'
      });
    }
    // Refresh orders
    const data = await getOpenOrders();
    setOrders(data || []);
    setCustomer('');
    setNotes('');
    setCart([]);
    setDiskonManual('');
    setPromoDipilih('');
    setShowForm(false);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Yakin ingin menghapus order ini?')) {
      await deleteOpenOrder(id);
      // Refresh orders
      const data = await getOpenOrders();
      setOrders(data || []);
      // Jika sedang edit order yang dihapus, reset form
      if (editOrderId === id) {
        setEditOrderId(null);
        setShowForm(false);
        setCustomer('');
        setNotes('');
        setCart([]);
      }
    }
  };

  const handleSendOrder = async (order) => {
    try {
      // Parse items if it's a JSON string
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      const subtotal = items.reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0);
      const discount = Number(order.diskon) || 0;
      const payload = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal || (item.qty * item.price)
        })),
        paymentMethod: 'tunai',
        subtotal,
        discount,
        total: Math.max(0, subtotal - discount),
        notes: order.notes || ''
      };

      await createTransaction(payload);

      // Tandai open order sebagai sent di Supabase
      try {
        await markOpenOrderSent(order.id);
      } catch (e) {
        console.error('Gagal menandai order sent:', e);
      }

      // Refresh daftar open orders dari Supabase
      try {
        const data = await getOpenOrders();
        setOrders(data || []);
      } catch {}

      // Pindahkan order ke riwayatTransaksi (lokal) untuk kompatibilitas lama
      setRiwayatTransaksi(prev => [
        ...prev,
        {
          ...order,
          status: 'sent',
          sentAt: new Date().toISOString()
        }
      ]);

      // Hapus dari daftar open orders
      setOrders(orders.filter(o => o.id !== order.id));
      if (editOrderId === order.id) {
        setEditOrderId(null);
        setShowForm(false);
        setCustomer('');
        setNotes('');
        setCart([]);
      }

      alert('Order berhasil dikirim sebagai transaksi');
    } catch (err) {
      console.error('Gagal mengirim order:', err);
      alert(`Gagal mengirim order: ${err?.message || 'Unknown error'}`);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Open Order</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Tambah Order
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-2">Order Baru</h2>
          <form onSubmit={handleSaveOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Customer</label>
              <input
                type="text"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari & Tambah Produk</label>
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`p-4 border rounded-lg text-left hover:shadow-md transition ${
                      product.stock === 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
                    }`}
                  >
                    <div className="font-medium text-gray-800 mb-1">{product.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{product.sku}</div>
                    <div className="text-lg font-bold text-blue-600">{product.sellPrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
                    <div className={`text-sm ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-500'}`}>Stok: {product.stock}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 mt-4">Keranjang</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
                        </div>
                        <button
                          type="button"
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
                            type="button"
                            onClick={() => updateQty(item.productId, item.qty - 1)}
                            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.qty + 1)}
                            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-bold text-gray-800">
                          {(item.subtotal).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Subtotal</span>
              <span>{cart.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Diskon</span>
              <span className="text-red-600">- {diskon.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-blue-600">{(cart.reduce((sum, item) => sum + item.subtotal, 0) - diskon).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
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
            <div className="flex space-x-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" disabled={cart.length === 0}>Simpan Order</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Daftar Open Order</h2>
        {orders.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Belum ada order terbuka</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th>Waktu</th>
                <th>Customer</th>
                <th>Pesanan</th>
                <th>Catatan</th>
                <th>Status</th>
                <th>Total Harga</th>
                <th>Diskon</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.created_at}</td>
                  <td>{order.customer}</td>
                  <td>
                    <ul>
                      {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item, idx) => (
                        <li key={idx}>{item.name} x {item.qty}</li>
                      ))}
                    </ul>
                  </td>
                  <td>-</td>
                  <td><span className="text-yellow-600 font-semibold">Open</span></td>
                  <td>
                    {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                  </td>
                  <td>-</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleEditOrder(order)}
                      className="inline-block text-blue-600 hover:text-blue-900 px-2 py-1 rounded transition border border-blue-100 hover:bg-blue-50 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="inline-block text-red-600 hover:text-red-900 px-2 py-1 rounded transition border border-red-100 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOrder(order)}
                      className="inline-block text-green-600 hover:text-green-900 px-2 py-1 rounded transition border border-green-100 hover:bg-green-50 ml-2"
                    >
                      Kirim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
