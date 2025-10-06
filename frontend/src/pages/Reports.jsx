import React, { useState } from 'react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const reportData = {
    today: {
      revenue: 1250000,
      transactions: 12,
      topProducts: [
        { name: 'Kopi Hitam', sold: 8, revenue: 120000 },
        { name: 'Nasi Goreng', sold: 5, revenue: 125000 },
        { name: 'Teh Manis', sold: 10, revenue: 80000 }
      ]
    },
    week: {
      revenue: 8750000,
      transactions: 85,
      topProducts: [
        { name: 'Kopi Hitam', sold: 45, revenue: 675000 },
        { name: 'Nasi Goreng', sold: 38, revenue: 950000 },
        { name: 'Mie Ayam', sold: 42, revenue: 840000 }
      ]
    },
    month: {
      revenue: 15750000,
      transactions: 156,
      topProducts: [
        { name: 'Kopi Hitam', sold: 89, revenue: 1335000 },
        { name: 'Nasi Goreng', sold: 67, revenue: 1675000 },
        { name: 'Mie Ayam', sold: 78, revenue: 1560000 }
      ]
    }
  };
  
  const currentData = reportData[selectedPeriod];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">📊 Laporan Penjualan</h1>
          <p className="text-purple-100 mt-1 text-sm sm:text-base">Analisis data penjualan dan performa bisnis</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">📅 Pilih Periode</h3>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedPeriod === 'today' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('today')}
            >
              📆 Hari Ini
            </button>
            <button
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedPeriod === 'week' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('week')}
            >
              📅 Minggu Ini
            </button>
            <button
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedPeriod === 'month' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('month')}
            >
              🗓️ Bulan Ini
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center mb-3">
              <div className="bg-green-500 rounded-full p-3 mr-3">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-green-700">Total Pendapatan</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              Rp {currentData.revenue.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <div className="bg-blue-500 rounded-full p-3 mr-3">
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-blue-700">Total Transaksi</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {currentData.transactions}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
            <div className="flex items-center mb-3">
              <div className="bg-purple-500 rounded-full p-3 mr-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-purple-700">Rata-rata</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              Rp {Math.round(currentData.revenue / currentData.transactions).toLocaleString()}
            </div>
          </div>
        </div>
      
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">🏆 Produk Terlaris</h3>
          </div>
          
          <div className="p-4 sm:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terjual</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">%</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.topProducts.map((product, index) => (
                    <tr key={product.name} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">{product.name}</td>
                      <td className="px-4 py-4 text-center text-gray-700">{product.sold} pcs</td>
                      <td className="px-4 py-4 text-right font-semibold text-green-600">
                        Rp {product.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {Math.round((product.revenue / currentData.revenue) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {currentData.topProducts.map((product, index) => (
                <div key={product.name} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                        index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-500">#{index + 1} Ranking</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {Math.round((product.revenue / currentData.revenue) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Terjual</p>
                      <p className="font-bold text-lg text-gray-900">{product.sold} pcs</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pendapatan</p>
                      <p className="font-bold text-lg text-green-600">Rp {product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      
        {/* Sales Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">📈 Grafik Penjualan</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl mb-4">📈</div>
                <p className="text-gray-700 font-medium mb-2 text-sm sm:text-base">Grafik penjualan akan ditampilkan di sini</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Fitur chart akan ditambahkan dengan library seperti Chart.js atau Recharts
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">💾 Export Laporan</h3>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <span>📄</span>
              <span>Export PDF</span>
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <span>📊</span>
              <span>Export Excel</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <span>📧</span>
              <span>Kirim Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;