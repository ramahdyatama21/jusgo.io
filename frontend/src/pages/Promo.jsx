// frontend/src/pages/Promo.jsx
import { useState, useEffect } from 'react';

export default function Promo() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({
    nama: '',
    tipe: 'persen',
    nilai: '',
    mulai: '',
    selesai: '',
    minBelanja: ''
  });
  const [editIdx, setEditIdx] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('promoList');
    setPromos(data ? JSON.parse(data) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('promoList', JSON.stringify(promos));
  }, [promos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama || !form.nilai || !form.mulai || !form.selesai) return;
    if (editIdx !== null) {
      const updated = [...promos];
      updated[editIdx] = { ...form };
      setPromos(updated);
      setEditIdx(null);
    } else {
      setPromos([...promos, { ...form }]);
    }
    setForm({ nama: '', tipe: 'persen', nilai: '', mulai: '', selesai: '', minBelanja: '' });
  };

  const handleEdit = (idx) => {
    setForm({ ...promos[idx] });
    setEditIdx(idx);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Hapus promo ini?')) {
      setPromos(promos.filter((_, i) => i !== idx));
      setEditIdx(null);
      setForm({ nama: '', tipe: 'persen', nilai: '', mulai: '', selesai: '', minBelanja: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Manajemen Promo</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promo</label>
            <input type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Promo</label>
            <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="persen">Diskon Persen (%)</option>
              <option value="nominal">Diskon Nominal (Rp)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Promo</label>
            <input type="number" value={form.nilai} onChange={e => setForm({ ...form, nilai: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimal Belanja</label>
            <input type="number" value={form.minBelanja} onChange={e => setForm({ ...form, minBelanja: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Mulai</label>
            <input type="date" value={form.mulai} onChange={e => setForm({ ...form, mulai: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Selesai</label>
            <input type="date" value={form.selesai} onChange={e => setForm({ ...form, selesai: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
        </div>
        <div className="flex space-x-3 pt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editIdx !== null ? 'Update' : 'Tambah'} Promo</button>
          {editIdx !== null && (
            <button type="button" onClick={() => { setEditIdx(null); setForm({ nama: '', tipe: 'persen', nilai: '', mulai: '', selesai: '', minBelanja: '' }); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
          )}
        </div>
      </form>
      <h2 className="text-lg font-bold mb-2">Daftar Promo Aktif</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 border">Nama</th>
            <th className="px-2 py-1 border">Tipe</th>
            <th className="px-2 py-1 border">Nilai</th>
            <th className="px-2 py-1 border">Min. Belanja</th>
            <th className="px-2 py-1 border">Periode</th>
            <th className="px-2 py-1 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{p.nama}</td>
              <td className="border px-2 py-1">{p.tipe === 'persen' ? 'Persen' : 'Nominal'}</td>
              <td className="border px-2 py-1 text-right">{p.tipe === 'persen' ? p.nilai + ' %' : parseInt(p.nilai).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
              <td className="border px-2 py-1 text-right">{p.minBelanja ? parseInt(p.minBelanja).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : '-'}</td>
              <td className="border px-2 py-1">{p.mulai} s/d {p.selesai}</td>
              <td className="border px-2 py-1 text-center">
                <button onClick={() => handleEdit(i)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-900">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
