// frontend/src/pages/Stock.jsx

import { useState, useEffect } from 'react';
import { getProducts, getStockMovements, addStock, removeStock } from '../services/api';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('in'); // 'in' atau 'out'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, movementsData] = await Promise.all([
        getProducts(),
        getStockMovements()
      ]);
      setProducts(productsData || []);
      setMovements(movementsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Terjadi kesalahan saat memuat data. Silakan coba lagi.');
    }
  };

  const handleStockAction = async () => {
    if (!selectedProduct || !selectedProduct.id) {
      alert('Mohon pilih produk terlebih dahulu');
      return;
    }
    
    if (!qty || qty <= 0) {
      alert('Mohon masukkan jumlah yang valid');
      return;
    }

    setLoading(true);
    try {
      if (modalType === 'in') {
        await addStock(selectedProduct.id, parseInt(qty), description);
        alert('Stok berhasil ditambahkan');
      } else {
        await removeStock(selectedProduct.id, parseInt(qty), description);
        alert('Stok berhasil dikurangi');
      }
      setShowModal(false);
      resetForm();
      await loadData(); // Reload data after successful update
    } catch (error) {
      console.error('Stock update error:', error);
      alert(error.message || 'Terjadi kesalahan saat memperbarui stok');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, product) => {
    setModalType(type);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setQty(0);
    setDescription('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">📊 Manajemen Stok</h1>
          <p className="text-orange-100 mt-1 text-sm sm:text-base">Kelola stok produk dan pergerakan barang</p>
        </div>

        {/* Daftar Produk */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">📦 Daftar Produk</h3>
          </div>
          <div className="p-4 sm:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className={product.stock <= product.min_stock ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}>
                      <td className="px-4 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-4 py-4">
                        <span className={`font-bold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{product.min_stock} {product.unit}</td>
                      <td className="px-4 py-4">
                        {product.stock <= product.min_stock ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Low</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openModal('in', product)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium">
                            + Masuk
                          </button>
                          <button onClick={() => openModal('out', product)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium">
                            - Keluar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <div key={product.id} className={`border-2 rounded-lg p-4 ${product.stock <= product.min_stock ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                    </div>
                    {product.stock <= product.min_stock ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 ml-2">⚠️ Low</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 ml-2">✓ OK</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Stok Saat Ini:</span>
                      <p className={`font-bold text-lg ${product.stock <= product.min_stock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock} {product.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Min. Stok:</span>
                      <p className="font-semibold text-lg text-gray-700">{product.min_stock} {product.unit}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => openModal('in', product)} 
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ➕ Masuk
                    </button>
                    <button 
                      onClick={() => openModal('out', product)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ➖ Keluar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Riwayat Stok */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">📜 Riwayat Pergerakan Stok</h3>
          </div>
          <div className="p-4 sm:p-6">
            {movements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500">Belum ada riwayat pergerakan stok</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-xs text-gray-600">{formatDate(movement.created_at)}</td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{movement.product?.name || '-'}</div>
                            <div className="text-xs text-gray-500">{movement.product?.sku || ''}</div>
                          </td>
                          <td className="px-4 py-4">
                            {movement.type === 'in' ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Masuk</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Keluar</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">{movement.qty} {movement.product?.unit || ''}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{movement.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
                  {movements.map((movement) => (
                    <div key={movement.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{movement.product?.name || '-'}</h4>
                          <p className="text-xs text-gray-500">{formatDate(movement.created_at)}</p>
                        </div>
                        {movement.type === 'in' ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 ml-2">➕ Masuk</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 ml-2">➖ Keluar</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">{movement.qty} {movement.product?.unit || ''}</span>
                        <span className="text-xs text-gray-500">{movement.description || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Form Stok */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className={`p-4 sm:p-6 rounded-t-lg ${modalType === 'in' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {modalType === 'in' ? '➕ Stok Masuk' : '➖ Stok Keluar'}
                </h2>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Produk</label>
                  <input
                    type="text"
                    value={selectedProduct?.name || ''}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok Saat Ini</label>
                  <input
                    type="text"
                    value={`${selectedProduct?.stock || 0} ${selectedProduct?.unit || ''}`}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Opsional"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    ✕ Batal
                  </button>
                  <button
                    onClick={handleStockAction}
                    disabled={loading}
                    className={`flex-1 ${modalType === 'in' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-60`}
                  >
                    {loading ? '⏳ Memproses...' : '✓ Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
