// frontend/src/pages/Reports.jsx

import { useState, useEffect } from 'react';
import { getSalesReport, getProductReport, exportSalesReportCSV, exportOpenOrderCSV, exportStockReportCSV, exportBelanjaBahanCSV } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);


  // Inisialisasi tanggal hanya sekali
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Optimasi: fetch report hanya jika filter berubah dan tidak sedang loading
  useEffect(() => {
    let ignore = false;
    const fetchReport = async () => {
      if (!startDate || !endDate) return;
      setLoading(true);
      try {
        if (reportType === 'sales') {
          const data = await getSalesReport(startDate, endDate);
          if (!ignore) setSalesData(data);
        } else {
          const data = await getProductReport(startDate, endDate);
          if (!ignore) setProductData(data);
        }
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchReport();
    return () => { ignore = true; };
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

      {/* Export CSV Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Export Semua Laporan CSV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={async () => {
              try {
                await exportSalesReportCSV(startDate, endDate);
              } catch (e) {
                alert('Export Laporan Penjualan gagal atau data kosong!');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Export Laporan Penjualan
          </button>
          <button
            onClick={async () => {
              try {
                await exportOpenOrderCSV();
              } catch (e) {
                alert('Export Laporan Open Order gagal atau data kosong!');
              }
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Export Laporan Open Order
          </button>
          <button
            onClick={async () => {
              try {
                await exportStockReportCSV();
              } catch (e) {
                alert('Export Laporan Stok Barang gagal atau data kosong!');
              }
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            Export Laporan Stok Barang
          </button>
          <button
            onClick={async () => {
              try {
                await exportBelanjaBahanCSV(startDate, endDate);
              } catch (e) {
                alert('Export Laporan Belanja Bahan gagal atau data kosong!');
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Export Laporan Belanja Bahan
          </button>
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
