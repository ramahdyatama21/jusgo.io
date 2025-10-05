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
    const arr = data ? JSON.parse(data) : [];
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) => {
      const tb = new Date(b?.sentAt || b?.created_at || b?.date || 0).getTime();
      const ta = new Date(a?.sentAt || a?.created_at || a?.date || 0).getTime();
      return tb - ta;
    });
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
        price: product.sell_price,
        qty: 1,
        subtotal: product.sell_price,
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
      setRiwayatTransaksi(prev => {
        const normalizedItems = Array.isArray(order.items)
          ? order.items
          : (typeof order.items === 'string' ? (() => { try { return JSON.parse(order.items); } catch { return []; } })() : []);
        const entry = { ...order, items: normalizedItems, status: 'sent', sentAt: new Date().toISOString() };
        const next = [entry, ...prev];
        return next.sort((a, b) => {
          const tb = new Date(b?.sentAt || b?.created_at || b?.date || 0).getTime();
          const ta = new Date(a?.sentAt || a?.created_at || a?.date || 0).getTime();
          return tb - ta;
        });
      });

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
    <div>
      <div className="page-header">
        <h1 className="page-title">Open Order</h1>
        <p className="page-subtitle">Kelola pesanan yang belum selesai</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div></div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + Tambah Order
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Order Baru</h3>
          </div>
          <form onSubmit={handleSaveOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Customer</label>
              <input
                type="text"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Cari & Tambah Produk</label>
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      textAlign: 'left',
                      backgroundColor: product.stock === 0 ? '#f3f4f6' : 'white',
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                      opacity: product.stock === 0 ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (product.stock > 0) {
                        e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        e.target.style.borderColor = '#3b82f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (product.stock > 0) {
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '0.25rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{product.sku}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#3b82f6' }}>{product.sell_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
                    <div style={{ fontSize: '0.875rem', color: product.stock <= product.min_stock ? '#dc2626' : '#64748b' }}>Stok: {product.stock}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1rem' }}>Keranjang</h3>
              {cart.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Keranjang kosong</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cart.map((item) => (
                    <div key={item.productId} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', color: '#1e293b' }}>{item.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          style={{ color: '#dc2626', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.target.style.color = '#991b1b'}
                          onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.qty - 1)}
                            style={{
                              width: '2rem',
                              height: '2rem',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#d1d5db'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                          >
                            -
                          </button>
                          <span style={{ width: '3rem', textAlign: 'center' }}>{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.qty + 1)}
                            style={{
                              width: '2rem',
                              height: '2rem',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#d1d5db'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                          {(item.subtotal).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
              <span>Subtotal</span>
              <span>{cart.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Diskon</span>
              <span style={{ color: '#dc2626' }}>- {diskon.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
              <span>Total</span>
              <span style={{ color: '#3b82f6' }}>{(cart.reduce((sum, item) => sum + item.subtotal, 0) - diskon).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="form-group">
              <label className="form-label">Catatan</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Diskon Manual (Rp)</label>
              <input
                type="number"
                value={diskonManual}
                onChange={e => setDiskonManual(e.target.value)}
                className="form-input"
                min="0"
                disabled={!!promoDipilih}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pilih Promo</label>
              <select
                value={promoDipilih}
                onChange={e => setPromoDipilih(e.target.value)}
                className="form-input"
              >
                <option value="">-- Tidak Pakai Promo --</option>
                {promoList.map((p, i) => (
                  <option key={i} value={p.nama}>{p.nama} ({p.tipe === 'persen' ? p.nilai + '%' : 'Rp' + parseInt(p.nilai).toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={cart.length === 0}>Simpan Order</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Open Order</h3>
        </div>
        {orders.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Belum ada order terbuka</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Customer</th>
                  <th>Pesanan</th>
                  <th>Catatan</th>
                  <th>Status</th>
                  <th>Total Harga</th>
                  <th>Diskon</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
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
                  <td><span style={{ color: '#d97706', fontWeight: '600' }}>Open</span></td>
                  <td>
                    {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).reduce((sum, item) => sum + (item.subtotal || (item.qty * item.price)), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                  </td>
                  <td>-</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleEditOrder(order)}
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', fontSize: '0.875rem' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="btn btn-danger"
                      style={{ marginRight: '0.5rem', fontSize: '0.875rem' }}
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOrder(order)}
                      className="btn btn-success"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Kirim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
