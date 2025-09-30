// frontend/src/pages/KalkulatorHPP.jsx
import { useState } from 'react';

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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Kalkulator HPP Lanjutan</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
          <input
            type="text"
            value={namaProduk}
            onChange={e => setNamaProduk(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Bahan</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Nama Bahan"
              value={bahanInput.nama}
              onChange={e => setBahanInput({ ...bahanInput, nama: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Jumlah"
              value={bahanInput.jumlah}
              onChange={e => setBahanInput({ ...bahanInput, jumlah: e.target.value })}
              className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
              min="0"
            />
            <input
              type="number"
              placeholder="Harga Satuan"
              value={bahanInput.harga}
              onChange={e => setBahanInput({ ...bahanInput, harga: e.target.value })}
              className="w-32 px-2 py-1 border border-gray-300 rounded-lg"
              min="0"
            />
            <button onClick={handleAddBahan} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">Tambah</button>
          </div>
          {bahan.length > 0 && (
            <table className="w-full text-sm border mb-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 border">Nama</th>
                  <th className="px-2 py-1 border">Jumlah</th>
                  <th className="px-2 py-1 border">Harga Satuan</th>
                  <th className="px-2 py-1 border">Subtotal</th>
                  <th className="px-2 py-1 border"></th>
                </tr>
              </thead>
              <tbody>
                {bahan.map((b, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{b.nama}</td>
                    <td className="border px-2 py-1 text-center">{b.jumlah}</td>
                    <td className="border px-2 py-1 text-right">{b.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                    <td className="border px-2 py-1 text-right">{(b.jumlah * b.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                    <td className="border px-2 py-1 text-center"><button type="button" onClick={() => handleRemoveBahan(i)} className="text-red-600 hover:text-red-800">Hapus</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Packaging per Unit</label>
            <input
              type="number"
              value={packaging}
              onChange={e => setPackaging(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Tenaga Kerja per Hari</label>
            <input
              type="number"
              value={tenagaKerja}
              onChange={e => setTenagaKerja(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Overhead per Hari</label>
            <input
              type="number"
              value={overhead}
              onChange={e => setOverhead(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Produksi (unit/hari)</label>
            <input
              type="number"
              value={kapasitasProduksi}
              onChange={e => setKapasitasProduksi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Margin (%)</label>
            <input
              type="number"
              value={targetMargin}
              onChange={e => setTargetMargin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="0"
              max="100"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Hitung HPP</button>
      </form>
      {hasil && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2 text-blue-700">Hasil Perhitungan HPP</h2>
          <table className="w-full text-sm border mb-4">
            <tbody>
              <tr><td className="font-medium">Nama Produk</td><td>{hasil.namaProduk}</td></tr>
              <tr><td className="font-medium">HPP Bahan per Unit</td><td>{hasil.rincian.bahanPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
              <tr><td className="font-medium">Packaging per Unit</td><td>{hasil.rincian.packagingPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
              <tr><td className="font-medium">Tenaga Kerja per Unit</td><td>{hasil.rincian.tenagaKerjaPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
              <tr><td className="font-medium">Overhead per Unit</td><td>{hasil.rincian.overheadPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
              <tr className="bg-blue-50 font-bold"><td>HPP Total per Unit</td><td>{hasil.rincian.hpp.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td></tr>
            </tbody>
          </table>
          <h3 className="text-lg font-bold mb-2">Opsi Harga Jual</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 border">Strategi</th>
                <th className="px-2 py-1 border">Harga Jual</th>
                <th className="px-2 py-1 border">Margin (%)</th>
                <th className="px-2 py-1 border">Kelebihan</th>
                <th className="px-2 py-1 border">Risiko</th>
              </tr>
            </thead>
            <tbody>
              {hasil.opsi.map((o, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{o.strategi}</td>
                  <td className="border px-2 py-1 text-right">{o.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                  <td className="border px-2 py-1 text-center">{o.margin}%</td>
                  <td className="border px-2 py-1">{o.kelebihan}</td>
                  <td className="border px-2 py-1">{o.risiko}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="font-bold mb-2">Prompt:</div>
            <div className="text-gray-800">
              Produk <b>{hasil.namaProduk}</b> dengan HPP <b>{hasil.rincian.hpp.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</b> per unit. Target margin {hasil.rincian.margin}%.<br />
              Berikan 3 opsi harga jual dengan strategi berbeda (markup sederhana, margin target, kompetitif) beserta kelebihan dan risikonya.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
