// frontend/src/pages/KalkulatorHPP.jsx
import { useState, useEffect } from 'react';
import { calculateHPP, getBahanHarga } from '../services/belanjaBahanService';

function round(num) {
  return Math.round(num * 100) / 100;
}

export default function KalkulatorHPP() {
  const [namaProduk, setNamaProduk] = useState('');
  const [bahan, setBahan] = useState([]);
  const [bahanInput, setBahanInput] = useState({ nama: '', jumlah: '', harga: '' });
  const [packaging, setPackaging] = useState('');
  const [tenagaKerja, setTenagaKerja] = useState('');
  const [kapasitasProduksi, setKapasitasProduksi] = useState('');
  const [overhead, setOverhead] = useState('');
  const [targetMargin, setTargetMargin] = useState('');
  const [hasil, setHasil] = useState(null);

  // Load harga bahan otomatis saat input nama bahan
  const handleBahanNameChange = async (e) => {
    const namaBahan = e.target.value;
    setBahanInput({ ...bahanInput, nama: namaBahan });
    
    if (namaBahan) {
      try {
        const hargaBahan = await getBahanHarga(namaBahan);
        if (hargaBahan > 0) {
          setBahanInput({ ...bahanInput, nama: namaBahan, harga: hargaBahan.toString() });
        }
      } catch (error) {
        console.error('Error loading bahan harga:', error);
      }
    }
  };

  // Tambah bahan ke list
  const handleAddBahan = (e) => {
    e.preventDefault();
    if (!bahanInput.nama || !bahanInput.jumlah || !bahanInput.harga) return;
    setBahan([...bahan, { ...bahanInput, jumlah: parseFloat(bahanInput.jumlah), harga: parseFloat(bahanInput.harga) }]);
    setBahanInput({ nama: '', jumlah: '', harga: '' });
  };

  const handleRemoveBahan = (idx) => {
    setBahan(bahan.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hitung total bahan
    const totalBahan = bahan.reduce((sum, b) => sum + (b.jumlah * b.harga), 0);
    const totalUnit = bahan.reduce((sum, b) => sum + b.jumlah, 0);
    const packagingPerUnit = parseFloat(packaging) || 0;
    const kapasitas = parseFloat(kapasitasProduksi) || 1;
    const tenagaKerjaPerUnit = (parseFloat(tenagaKerja) && kapasitas) ? parseFloat(tenagaKerja) / kapasitas : 0;
    const overheadPerUnit = (parseFloat(overhead) && kapasitas) ? parseFloat(overhead) / kapasitas : 0;
    const bahanPerUnit = totalUnit > 0 ? totalBahan / totalUnit : 0;
    const hpp = bahanPerUnit + packagingPerUnit + tenagaKerjaPerUnit + overheadPerUnit;
    const margin = parseFloat(targetMargin) || 0;
    // Opsi harga jual
    const hargaMarkup = hpp * 1.2; // markup sederhana 20%
    const hargaMarginTarget = hpp / (1 - margin / 100);
    const hargaKompetitif = hpp * 1.1; // markup kompetitif 10%
    setHasil({
      namaProduk,
      rincian: {
        bahanPerUnit: round(bahanPerUnit),
        packagingPerUnit: round(packagingPerUnit),
        tenagaKerjaPerUnit: round(tenagaKerjaPerUnit),
        overheadPerUnit: round(overheadPerUnit),
        hpp: round(hpp),
        margin: margin
      },
      opsi: [
        {
          strategi: 'Markup Sederhana (20%)',
          harga: round(hargaMarkup),
          margin: round(((hargaMarkup - hpp) / hargaMarkup) * 100),
          kelebihan: 'Mudah, cepat, cocok untuk produk umum',
          risiko: 'Kurang kompetitif jika harga pasar lebih rendah'
        },
        {
          strategi: `Margin Target (${margin}%)`,
          harga: round(hargaMarginTarget),
          margin: margin,
          kelebihan: 'Sesuai target profit, lebih terukur',
          risiko: 'Harga bisa terlalu tinggi jika margin besar'
        },
        {
          strategi: 'Kompetitif (10%)',
          harga: round(hargaKompetitif),
          margin: round(((hargaKompetitif - hpp) / hargaKompetitif) * 100),
          kelebihan: 'Lebih bersaing, cocok untuk pasar sensitif harga',
          risiko: 'Margin lebih tipis, profit kecil'
        }
      ]
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kalkulator HPP Lanjutan</h1>
        <p className="page-subtitle">Hitung Harga Pokok Penjualan dengan detail</p>
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          <strong>Contoh:</strong> Pineapple Punch = 1/4 nanas + 1 apel + 1 jeruk
          <br />
          <strong>Harga Jual:</strong> Rp 25.000/botol
          <br />
          <strong>HPP:</strong> Otomatis berdasarkan harga bahan terbaru
        </div>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Produk</label>
            <input
              type="text"
              value={namaProduk}
              onChange={e => setNamaProduk(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Daftar Bahan</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder="Nama Bahan"
                value={bahanInput.nama}
                onChange={handleBahanNameChange}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Jumlah"
                value={bahanInput.jumlah}
                onChange={e => setBahanInput({ ...bahanInput, jumlah: e.target.value })}
                className="form-input"
                style={{ width: '6rem' }}
                min="0"
              />
              <input
                type="number"
                placeholder="Harga Satuan"
                value={bahanInput.harga}
                onChange={e => setBahanInput({ ...bahanInput, harga: e.target.value })}
                className="form-input"
                style={{ width: '8rem' }}
                min="0"
              />
              <button onClick={handleAddBahan} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Tambah</button>
            </div>
            {bahan.length > 0 && (
              <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Jumlah</th>
                      <th>Harga Satuan</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bahan.map((b, i) => (
                      <tr key={i}>
                        <td>{b.nama}</td>
                        <td style={{ textAlign: 'center' }}>{b.jumlah}</td>
                        <td style={{ textAlign: 'right' }}>{b.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                        <td style={{ textAlign: 'right' }}>{(b.jumlah * b.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                        <td style={{ textAlign: 'center' }}><button type="button" onClick={() => handleRemoveBahan(i)} className="btn btn-danger" style={{ fontSize: '0.875rem' }}>Hapus</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Biaya Packaging per Unit</label>
              <input
                type="number"
                value={packaging}
                onChange={e => setPackaging(e.target.value)}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Biaya Tenaga Kerja per Hari</label>
              <input
                type="number"
                value={tenagaKerja}
                onChange={e => setTenagaKerja(e.target.value)}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Biaya Overhead per Hari</label>
              <input
                type="number"
                value={overhead}
                onChange={e => setOverhead(e.target.value)}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kapasitas Produksi (unit/hari)</label>
              <input
                type="number"
                value={kapasitasProduksi}
                onChange={e => setKapasitasProduksi(e.target.value)}
                className="form-input"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Margin (%)</label>
              <input
                type="number"
                value={targetMargin}
                onChange={e => setTargetMargin(e.target.value)}
                className="form-input"
                min="0"
                max="100"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Hitung HPP</button>
        </form>
      </div>
      
      {hasil && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hasil Perhitungan HPP</h3>
          </div>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table className="table">
              <tbody>
                <tr><td style={{ fontWeight: '500' }}>Nama Produk</td><td>{hasil.namaProduk}</td></tr>
                <tr><td style={{ fontWeight: '500' }}>HPP Bahan per Unit</td><td>{hasil.rincian.bahanPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
                <tr><td style={{ fontWeight: '500' }}>Packaging per Unit</td><td>{hasil.rincian.packagingPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
                <tr><td style={{ fontWeight: '500' }}>Tenaga Kerja per Unit</td><td>{hasil.rincian.tenagaKerjaPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
                <tr><td style={{ fontWeight: '500' }}>Overhead per Unit</td><td>{hasil.rincian.overheadPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
                <tr style={{ backgroundColor: '#dbeafe', fontWeight: 'bold' }}><td>HPP Total per Unit</td><td>{hasil.rincian.hpp.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
              </tbody>
            </table>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Opsi Harga Jual</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Strategi</th>
                  <th>Harga Jual</th>
                  <th>Margin (%)</th>
                  <th>Kelebihan</th>
                  <th>Risiko</th>
                </tr>
              </thead>
              <tbody>
                {hasil.opsi.map((o, i) => (
                  <tr key={i}>
                    <td>{o.strategi}</td>
                    <td style={{ textAlign: 'right' }}>{o.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                    <td style={{ textAlign: 'center' }}>{o.margin}%</td>
                    <td>{o.kelebihan}</td>
                    <td>{o.risiko}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Prompt:</div>
            <div style={{ color: '#1e293b' }}>
              Produk <b>{hasil.namaProduk}</b> dengan HPP <b>{hasil.rincian.hpp.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</b> per unit. Target margin {hasil.rincian.margin}%.<br />
              Berikan 3 opsi harga jual dengan strategi berbeda (markup sederhana, margin target, kompetitif) beserta kelebihan dan risikonya.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
