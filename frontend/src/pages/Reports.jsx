// frontend/src/pages/Reports.jsx

import { useState, useEffect } from 'react';
import { getSalesReport, getProductReport } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadReport();
    }
  }, [startDate, endDate, reportType]);

  const loadReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'sales') {
        const data = await getSalesReport(startDate, endDate);
        setSalesData(data);
      } else {
        const data = await getProductReport(startDate, endDate);
        setProductData(data);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    let data = [];
    let filename = '';

    if (reportType === 'sales' && salesData) {
      data = salesData.data.map(item => ({
        'Tanggal': item.date,
        'Pendapatan': item.revenue,
        'Jumlah Transaksi': item.transactionCount,
        'Item Terjual': item.itemsSold
      }));
      filename = 'laporan-penjualan.csv';
    } else if (reportType === 'product') {
      data = productData.map(item => ({
        'SKU': item.product.sku,
        'Nama Produk': item.product.name,
        'Kategori': item.product.category,
        'Jumlah Terjual': item.totalQty,
        'Total Pendapatan': item.totalRevenue,
        'Profit': item.profit
      }));
      filename = 'laporan-produk.csv';
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Laporan</h1>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full">
            ⭐ PRO
          </span>
          <span className="text-sm text-gray-600">Custom Report Builder</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Penjualan</option>
              <option value="product">Produk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {reportType === 'sales' && salesData && (
            <>
              {/* Summary Cards */}
              {/* ... (rest of your original code remains unchanged) ... */}
            </>
          )}

          {/* Product Report */}
          {reportType === 'product' && productData.length > 0 && (
            <>
              {/* ... (rest of your original code remains unchanged) ... */}
            </>
          )}
        </>
      )}
    </div>
  );
}
