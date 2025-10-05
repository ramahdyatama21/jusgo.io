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
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen Promo</h1>
        <p className="page-subtitle">Kelola promo dan diskon</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nama Promo</label>
              <input type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipe Promo</label>
              <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="form-input">
                <option value="persen">Diskon Persen (%)</option>
                <option value="nominal">Diskon Nominal (Rp)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nilai Promo</label>
              <input type="number" value={form.nilai} onChange={e => setForm({ ...form, nilai: e.target.value })} className="form-input" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Minimal Belanja</label>
              <input type="number" value={form.minBelanja} onChange={e => setForm({ ...form, minBelanja: e.target.value })} className="form-input" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Periode Mulai</label>
              <input type="date" value={form.mulai} onChange={e => setForm({ ...form, mulai: e.target.value })} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Periode Selesai</label>
              <input type="date" value={form.selesai} onChange={e => setForm({ ...form, selesai: e.target.value })} className="form-input" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">{editIdx !== null ? 'Update' : 'Tambah'} Promo</button>
            {editIdx !== null && (
              <button type="button" onClick={() => { setEditIdx(null); setForm({ nama: '', tipe: 'persen', nilai: '', mulai: '', selesai: '', minBelanja: '' }); }} className="btn btn-secondary">Batal</button>
            )}
          </div>
        </form>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Promo Aktif</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Nilai</th>
                <th>Min. Belanja</th>
                <th>Periode</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p, i) => (
                <tr key={i}>
                  <td>{p.nama}</td>
                  <td>{p.tipe === 'persen' ? 'Persen' : 'Nominal'}</td>
                  <td style={{ textAlign: 'right' }}>{p.tipe === 'persen' ? p.nilai + ' %' : parseInt(p.nilai).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                  <td style={{ textAlign: 'right' }}>{p.minBelanja ? parseInt(p.minBelanja).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : '-'}</td>
                  <td>{p.mulai} s/d {p.selesai}</td>
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
    </div>
  );
}
