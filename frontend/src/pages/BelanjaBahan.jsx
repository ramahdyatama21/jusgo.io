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
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Belanja Bahan & Resep</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
          <input type="text" value={form.namaProduk} onChange={e => setForm({ ...form, namaProduk: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Bahan</label>
          {form.bahan.map((b, i) => (
            <div key={i} className="flex space-x-2 mb-2">
              <input type="text" placeholder="Nama Bahan" value={b.nama} onChange={e => handleBahanChange(i, 'nama', e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg" required />
              <input type="number" placeholder="Qty per Produk" value={b.qty} onChange={e => handleBahanChange(i, 'qty', e.target.value)} className="w-32 px-2 py-1 border border-gray-300 rounded-lg" min="0" required />
              {form.bahan.length > 1 && <button type="button" onClick={() => handleRemoveBahan(i)} className="text-red-600 hover:text-red-800">Hapus</button>}
            </div>
          ))}
          <button type="button" onClick={handleAddBahan} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 mt-2">Tambah Bahan</button>
        </div>
        <div className="flex space-x-3 pt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editIdx !== null ? 'Update' : 'Tambah'} Resep</button>
          {editIdx !== null && (
            <button type="button" onClick={() => { setEditIdx(null); setForm({ namaProduk: '', bahan: [{ nama: '', qty: '' }] }); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
          )}
        </div>
      </form>
      <h2 className="text-lg font-bold mb-2">Daftar Resep Produk</h2>
      <table className="w-full text-sm border mb-8">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 border">Produk</th>
            <th className="px-2 py-1 border">Bahan</th>
            <th className="px-2 py-1 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {resep.map((r, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{r.namaProduk}</td>
              <td className="border px-2 py-1">
                <ul className="list-disc pl-4">
                  {r.bahan.map((b, j) => (
                    <li key={j}>{b.nama} x {b.qty}</li>
                  ))}
                </ul>
              </td>
              <td className="border px-2 py-1 text-center">
                <button onClick={() => handleEdit(i)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-900">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-lg font-bold mb-2">Kebutuhan Belanja Bahan (berdasarkan Open Order)</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 border">Nama Bahan</th>
            <th className="px-2 py-1 border">Total Qty</th>
          </tr>
        </thead>
        <tbody>
          {kebutuhan.map((b, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{b.nama}</td>
              <td className="border px-2 py-1 text-right">{b.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
