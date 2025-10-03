// frontend/src/pages/BelanjaBahan.jsx
import { useState, useEffect } from 'react';

export default function BelanjaBahan() {
  const [resep, setResep] = useState([]);
  const [form, setForm] = useState({ namaProduk: '', bahan: [{ nama: '', qty: '' }] });
  const [editIdx, setEditIdx] = useState(null);
  const [openOrders, setOpenOrders] = useState([]);
  const [kebutuhan, setKebutuhan] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('resepList');
    setResep(data ? JSON.parse(data) : []);
    const oo = localStorage.getItem('openOrders');
    setOpenOrders(oo ? JSON.parse(oo) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('resepList', JSON.stringify(resep));
    hitungKebutuhan();
    // eslint-disable-next-line
  }, [resep, openOrders]);

  const handleBahanChange = (idx, field, value) => {
    const newBahan = [...form.bahan];
    newBahan[idx][field] = value;
    setForm({ ...form, bahan: newBahan });
  };

  const handleAddBahan = () => {
    setForm({ ...form, bahan: [...form.bahan, { nama: '', qty: '' }] });
  };

  const handleRemoveBahan = (idx) => {
    setForm({ ...form, bahan: form.bahan.filter((_, i) => i !== idx) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.namaProduk || form.bahan.some(b => !b.nama || !b.qty)) return;
    if (editIdx !== null) {
      const updated = [...resep];
      updated[editIdx] = { ...form, bahan: form.bahan.map(b => ({ ...b, qty: parseFloat(b.qty) })) };
      setResep(updated);
      setEditIdx(null);
    } else {
      setResep([...resep, { ...form, bahan: form.bahan.map(b => ({ ...b, qty: parseFloat(b.qty) })) }]);
    }
    setForm({ namaProduk: '', bahan: [{ nama: '', qty: '' }] });
  };

  const handleEdit = (idx) => {
    setForm({ ...resep[idx], bahan: resep[idx].bahan.map(b => ({ ...b })) });
    setEditIdx(idx);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Hapus resep ini?')) {
      setResep(resep.filter((_, i) => i !== idx));
      setEditIdx(null);
      setForm({ namaProduk: '', bahan: [{ nama: '', qty: '' }] });
    }
  };

  // Hitung kebutuhan bahan berdasarkan open order
  const hitungKebutuhan = () => {
    // Akumulasi qty produk di open order
    const produkQty = {};
    openOrders.forEach(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      items.forEach(item => {
        produkQty[item.name] = (produkQty[item.name] || 0) + item.qty;
      });
    });
    // Hitung kebutuhan bahan
    const kebutuhanBahan = {};
    resep.forEach(r => {
      const qtyProduk = produkQty[r.namaProduk] || 0;
      r.bahan.forEach(b => {
        kebutuhanBahan[b.nama] = (kebutuhanBahan[b.nama] || 0) + (qtyProduk * b.qty);
      });
    });
    setKebutuhan(Object.entries(kebutuhanBahan).map(([nama, qty]) => ({ nama, qty })));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Belanja Bahan & Resep</h1>
        <p className="page-subtitle">Kelola resep dan hitung kebutuhan bahan</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Produk</label>
            <input type="text" value={form.namaProduk} onChange={e => setForm({ ...form, namaProduk: e.target.value })} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Daftar Bahan</label>
            {form.bahan.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="text" placeholder="Nama Bahan" value={b.nama} onChange={e => handleBahanChange(i, 'nama', e.target.value)} className="form-input" required />
                <input type="number" placeholder="Qty per Produk" value={b.qty} onChange={e => handleBahanChange(i, 'qty', e.target.value)} className="form-input" style={{ width: '8rem' }} min="0" required />
                {form.bahan.length > 1 && <button type="button" onClick={() => handleRemoveBahan(i)} className="btn btn-danger" style={{ fontSize: '0.875rem' }}>Hapus</button>}
              </div>
            ))}
            <button type="button" onClick={handleAddBahan} className="btn btn-primary" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Tambah Bahan</button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">{editIdx !== null ? 'Update' : 'Tambah'} Resep</button>
            {editIdx !== null && (
              <button type="button" onClick={() => { setEditIdx(null); setForm({ namaProduk: '', bahan: [{ nama: '', qty: '' }] }); }} className="btn btn-secondary">Batal</button>
            )}
          </div>
        </form>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Resep Produk</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Bahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {resep.map((r, i) => (
                <tr key={i}>
                  <td>{r.namaProduk}</td>
                  <td>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1rem' }}>
                      {r.bahan.map((b, j) => (
                        <li key={j}>{b.nama} x {b.qty}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleEdit(i)} className="btn btn-secondary" style={{ marginRight: '0.5rem', fontSize: '0.875rem' }}>Edit</button>
                    <button onClick={() => handleDelete(i)} className="btn btn-danger" style={{ fontSize: '0.875rem' }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Kebutuhan Belanja Bahan (berdasarkan Open Order)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Bahan</th>
                <th>Total Qty</th>
              </tr>
            </thead>
            <tbody>
              {kebutuhan.map((b, i) => (
                <tr key={i}>
                  <td>{b.nama}</td>
                  <td style={{ textAlign: 'right' }}>{b.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
