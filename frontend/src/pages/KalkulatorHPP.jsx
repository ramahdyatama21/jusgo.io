// frontend/src/pages/KalkulatorHPP.jsx
import { useState, useEffect } from 'react';
import { calculateHPP, getBahanHarga } from '../services/belanjaBahanService';

function round(num) {
  return Math.round(num * 100) / 100;
}

export default function KalkulatorHPP() {
  // Product Information
  const [namaProduk, setNamaProduk] = useState('');
  const [kategoriProduk, setKategoriProduk] = useState('');
  const [gambarProduk, setGambarProduk] = useState(null);
  const [gambarPreview, setGambarPreview] = useState('');
  
  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Manual Calculation
  const [bahan, setBahan] = useState([]);
  const [bahanInput, setBahanInput] = useState({ 
    nama: '', 
    jumlah: '', 
    satuan: '', 
    harga: '', 
    totalHarga: '', 
    jumlahBeli: '', 
    satuanBeli: '' 
  });
  const [biayaProduksi, setBiayaProduksi] = useState({
    packaging: '',
    tenagaKerja: '',
    overhead: '',
    lainnya: ''
  });
  const [kapasitasProduksi, setKapasitasProduksi] = useState('');
  const [hasil, setHasil] = useState(null);
  
  // AI Pricing Suggestion
  const [aiPricing, setAiPricing] = useState(null);
  
  // Target & Projection
  const [targetLaba, setTargetLaba] = useState('');
  const [hargaJualPilihan, setHargaJualPilihan] = useState('');
  const [proyeksi, setProyeksi] = useState(null);
  
  // Chart data
  const [chartData, setChartData] = useState(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambarProduk(file);
      const reader = new FileReader();
      reader.onload = (e) => setGambarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // AI Analysis function
  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis - replace with actual OpenAI API call
      const analysis = {
        estimatedHPP: 15000,
        suggestedPricing: {
          competitive: 18000,
          premium: 25000,
          budget: 16000
        },
        recommendations: [
          "Gunakan bahan berkualitas tinggi untuk diferensiasi",
          "Fokus pada packaging yang menarik",
          "Pertimbangkan harga kompetitif untuk penetrasi pasar"
        ]
      };
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    const totalHarga = parseFloat(bahanInput.jumlah) * parseFloat(bahanInput.harga);
    setBahan([...bahan, { 
      ...bahanInput, 
      jumlah: parseFloat(bahanInput.jumlah), 
      harga: parseFloat(bahanInput.harga),
      totalHarga: totalHarga
    }]);
    setBahanInput({ 
      nama: '', 
      jumlah: '', 
      satuan: '', 
      harga: '', 
      totalHarga: '', 
      jumlahBeli: '', 
      satuanBeli: '' 
    });
  };

  const handleRemoveBahan = (idx) => {
    setBahan(bahan.filter((_, i) => i !== idx));
  };

  // Calculate projection
  const calculateProjection = () => {
    if (!targetLaba || !hargaJualPilihan) return;
    
    const targetLabaNum = parseFloat(targetLaba);
    const hargaJualNum = parseFloat(hargaJualPilihan);
    const hpp = hasil?.rincian?.hpp || 0;
    
    const marginPerUnit = hargaJualNum - hpp;
    const targetJualPerBulan = Math.ceil(targetLabaNum / marginPerUnit);
    const targetJualPerHari = Math.ceil(targetJualPerBulan / 30);
    const potensiOmset = targetJualPerBulan * hargaJualNum;
    const totalBiayaProduk = targetJualPerBulan * hpp;
    const biayaTetap = parseFloat(biayaProduksi.overhead) || 0;
    const proyeksiLaba = potensiOmset - totalBiayaProduk - biayaTetap;
    
    setProyeksi({
      targetJualPerHari,
      targetJualPerBulan,
      potensiOmset,
      totalBiayaProduk,
      biayaTetap,
      proyeksiLaba
    });
    
    // Generate chart data
    const chartData = [];
    for (let i = 1; i <= 12; i++) {
      const bulanJual = targetJualPerBulan * i;
      const omsetBulan = bulanJual * hargaJualNum;
      const biayaBulan = bulanJual * hpp + biayaTetap;
      const labaBulan = omsetBulan - biayaBulan;
      chartData.push({
        bulan: `Bulan ${i}`,
        omset: omsetBulan,
        biaya: biayaBulan,
        laba: labaBulan
      });
    }
    setChartData(chartData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hitung total bahan
    const totalBahan = bahan.reduce((sum, b) => sum + b.totalHarga, 0);
    const totalUnit = bahan.reduce((sum, b) => sum + b.jumlah, 0);
    const packagingPerUnit = parseFloat(biayaProduksi.packaging) || 0;
    const kapasitas = parseFloat(kapasitasProduksi) || 1;
    const tenagaKerjaPerUnit = (parseFloat(biayaProduksi.tenagaKerja) && kapasitas) ? parseFloat(biayaProduksi.tenagaKerja) / kapasitas : 0;
    const overheadPerUnit = (parseFloat(biayaProduksi.overhead) && kapasitas) ? parseFloat(biayaProduksi.overhead) / kapasitas : 0;
    const lainnyaPerUnit = (parseFloat(biayaProduksi.lainnya) && kapasitas) ? parseFloat(biayaProduksi.lainnya) / kapasitas : 0;
    const bahanPerUnit = totalUnit > 0 ? totalBahan / totalUnit : 0;
    const hpp = bahanPerUnit + packagingPerUnit + tenagaKerjaPerUnit + overheadPerUnit + lainnyaPerUnit;
    
    // Opsi harga jual
    const hargaMarkup = hpp * 1.2; // markup sederhana 20%
    const hargaMarginTarget = hpp * 1.3; // margin target 30%
    const hargaKompetitif = hpp * 1.1; // markup kompetitif 10%
    
    setHasil({
      namaProduk,
      rincian: {
        bahanPerUnit: round(bahanPerUnit),
        packagingPerUnit: round(packagingPerUnit),
        tenagaKerjaPerUnit: round(tenagaKerjaPerUnit),
        overheadPerUnit: round(overheadPerUnit),
        lainnyaPerUnit: round(lainnyaPerUnit),
        hpp: round(hpp)
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
          strategi: 'Margin Target (30%)',
          harga: round(hargaMarginTarget),
          margin: round(((hargaMarginTarget - hpp) / hargaMarginTarget) * 100),
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Kalkulator HPP Lanjutan</h1>
          <p className="text-sm sm:text-base text-gray-600">Hitung Harga Pokok Penjualan dengan AI Analysis & Proyeksi Bisnis</p>
      </div>
      
        {/* Product Information Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Informasi Produk</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
            <input
              type="text"
              value={namaProduk}
              onChange={e => setNamaProduk(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama produk"
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Produk</label>
              <select
                value={kategoriProduk}
                onChange={e => setKategoriProduk(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Kategori</option>
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {gambarPreview && (
                  <img src={gambarPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6">
            <button
              onClick={analyzeWithAI}
              disabled={!namaProduk || isAnalyzing}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isAnalyzing ? 'Menganalisis...' : 'Analisis AI Otomatis'}
            </button>
          </div>
        </div>
        {/* AI Analysis Results */}
        {aiAnalysis && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Analisis AI</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-blue-800">HPP Estimasi</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                  {aiAnalysis.estimatedHPP.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-green-800">Harga Kompetitif</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  {aiAnalysis.suggestedPricing.competitive.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-purple-800">Harga Premium</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                  {aiAnalysis.suggestedPricing.premium.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Rekomendasi AI:</h4>
              <ul className="list-disc list-inside space-y-1">
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Manual Calculation Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Perhitungan Manual</h2>
          
          {/* Bahan Input Form */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Rincian Bahan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4">
              <input
                type="text"
                placeholder="Nama Bahan"
                value={bahanInput.nama}
                onChange={handleBahanNameChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Jumlah"
                value={bahanInput.jumlah}
                onChange={e => setBahanInput({ ...bahanInput, jumlah: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <input
                type="text"
                placeholder="Satuan"
                value={bahanInput.satuan}
                onChange={e => setBahanInput({ ...bahanInput, satuan: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Harga Satuan"
                value={bahanInput.harga}
                onChange={e => setBahanInput({ ...bahanInput, harga: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <input
                type="number"
                placeholder="Jumlah Beli"
                value={bahanInput.jumlahBeli}
                onChange={e => setBahanInput({ ...bahanInput, jumlahBeli: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button 
                onClick={handleAddBahan} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base w-full sm:w-auto"
              >
                Tambah
              </button>
            </div>
            
            {/* Bahan Table */}
            {bahan.length > 0 && (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Jml</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Satuan</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Harga</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {bahan.map((b, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{b.nama}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{b.jumlah}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{b.satuan}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden md:table-cell">{b.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{b.totalHarga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              <button 
                                onClick={() => handleRemoveBahan(i)} 
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
        </div>

          {/* Biaya Produksi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Packaging per Unit</label>
              <input
                type="number"
                value={biayaProduksi.packaging}
                onChange={e => setBiayaProduksi({ ...biayaProduksi, packaging: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Tenaga Kerja per Hari</label>
              <input
                type="number"
                value={biayaProduksi.tenagaKerja}
                onChange={e => setBiayaProduksi({ ...biayaProduksi, tenagaKerja: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Overhead per Hari</label>
              <input
                type="number"
                value={biayaProduksi.overhead}
                onChange={e => setBiayaProduksi({ ...biayaProduksi, overhead: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Lainnya per Hari</label>
              <input
                type="number"
                value={biayaProduksi.lainnya}
                onChange={e => setBiayaProduksi({ ...biayaProduksi, lainnya: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas Produksi (unit/hari)</label>
              <input
                type="number"
                value={kapasitasProduksi}
                onChange={e => setKapasitasProduksi(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit} 
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 text-sm sm:text-base"
          >
            Hitung HPP
          </button>
        </div>
        {/* Hasil Perhitungan HPP */}
        {hasil && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Hasil Perhitungan HPP</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-blue-800">HPP Bahan per Unit</h3>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {hasil.rincian.bahanPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-green-800">Packaging per Unit</h3>
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {hasil.rincian.packagingPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-orange-800">Biaya Lainnya per Unit</h3>
                <p className="text-lg sm:text-xl font-bold text-orange-600">
                  {hasil.rincian.lainnyaPerUnit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-purple-800">HPP Total per Unit</h3>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {hasil.rincian.hpp.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Strategi</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Margin</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Kelebihan</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Risiko</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {hasil.opsi.map((o, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{o.strategi}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium">{o.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{o.margin}%</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden md:table-cell">{o.kelebihan}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{o.risiko}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Target & Proyeksi Penjualan */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Target & Proyeksi Penjualan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Laba Bersih per Bulan</label>
              <input
                type="number"
                value={targetLaba}
                onChange={e => setTargetLaba(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan target laba"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual Pilihan</label>
              <input
                type="number"
                value={hargaJualPilihan}
                onChange={e => setHargaJualPilihan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan harga jual"
                min="0"
              />
            </div>
          </div>
          
          <button 
            onClick={calculateProjection}
            disabled={!targetLaba || !hargaJualPilihan}
            className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Hitung Proyeksi
          </button>
        </div>

        {/* Hasil Proyeksi */}
        {proyeksi && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Hasil Proyeksi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-blue-800">Target Jual per Hari</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{proyeksi.targetJualPerHari} unit</p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-green-800">Target Jual per Bulan</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{proyeksi.targetJualPerBulan} unit</p>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-purple-800">Potensi Omset per Bulan</h3>
                <p className="text-base sm:text-lg md:text-xl font-bold text-purple-600">
                  {proyeksi.potensiOmset.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-orange-800">Total Biaya Produk per Bulan</h3>
                <p className="text-base sm:text-lg md:text-xl font-bold text-orange-600">
                  {proyeksi.totalBiayaProduk.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-red-800">Total Biaya Tetap per Bulan</h3>
                <p className="text-base sm:text-lg md:text-xl font-bold text-red-600">
                  {proyeksi.biayaTetap.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-indigo-800">Proyeksi Laba Bersih per Bulan</h3>
                <p className="text-base sm:text-lg md:text-xl font-bold text-indigo-600">
                  {proyeksi.proyeksiLaba.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </p>
              </div>
          </div>
          </div>
        )}

        {/* Chart Proyeksi */}
        {chartData && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Grafik Proyeksi Laba Bersih</h2>
            
            {/* Simple Bar Chart */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Proyeksi Laba per Bulan</h3>
              <div className="h-48 sm:h-56 md:h-64 flex items-end justify-between space-x-1 bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto">
                {chartData.map((data, index) => {
                  const maxLaba = Math.max(...chartData.map(d => d.laba));
                  const height = (data.laba / maxLaba) * 200;
                  const isPositive = data.laba >= 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full rounded-t ${isPositive ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300 hover:opacity-80`}
                        style={{ height: `${Math.max(height, 4)}px` }}
                        title={`${data.bulan}: ${data.laba.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`}
                      />
                      <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Bulan 1</span>
                <span>Bulan 6</span>
                <span>Bulan 12</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">Laba Positif</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-700">Laba Negatif</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Target: {targetLaba && parseFloat(targetLaba).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Omset</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biaya</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laba Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chartData.slice(0, 6).map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{data.bulan}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{data.omset.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{data.biaya.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${data.laba >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.laba.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Grafik menunjukkan proyeksi laba bersih per bulan selama 12 bulan ke depan berdasarkan target penjualan yang dihitung</p>
            </div>
          </div>
        )}
        </div>
    </div>
  );
}
