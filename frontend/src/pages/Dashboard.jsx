// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [salesPerDay, setSalesPerDay] = useState([]);
  const [salesPerWeek, setSalesPerWeek] = useState([]);
  const [salesPerMonth, setSalesPerMonth] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStats();
    // Hitung produk terlaris dari riwayat transaksi dan produk
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const riwayat = JSON.parse(localStorage.getItem('riwayatTransaksi') || '[]');
    // Akumulasi qty dan revenue per produk
    const productMap = {};
    products.forEach(p => {
      productMap[p.name] = { product: p, totalQty: 0, totalRevenue: 0 };
    });
    riwayat.forEach(order => {
      order.items.forEach(item => {
        if (productMap[item.name]) {
          productMap[item.name].totalQty += item.qty;
          productMap[item.name].totalRevenue += (item.subtotal || (item.qty * item.price));
        }
      });
    });
    setTopProducts(Object.values(productMap).filter(p => p.totalQty > 0).sort((a, b) => b.totalQty - a.totalQty));

    // --- Grafik Penjualan ---
    // Helper: format tanggal ke yyyy-mm-dd
    const toDate = (str) => str ? str.slice(0, 10) : '';
    // Per Hari
    const perDay = {};
    riwayat.forEach(order => {
      const tgl = toDate(order.createdAt || order.sentAt);
      perDay[tgl] = (perDay[tgl] || 0) + order.items.reduce((sum, i) => sum + (i.subtotal || (i.qty * i.price)), 0);
    });
    setSalesPerDay(Object.entries(perDay).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date)));
    // Per Minggu
    const getWeek = (dateStr) => {
      const d = new Date(dateStr);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const week = Math.ceil((d.getDate() - 1) / 7) + 1;
      return `${y}-${String(m).padStart(2, '0')}-W${week}`;
    };
    const perWeek = {};
    Object.entries(perDay).forEach(([date, total]) => {
      const week = getWeek(date);
      perWeek[week] = (perWeek[week] || 0) + total;
    });
    setSalesPerWeek(Object.entries(perWeek).map(([week, total]) => ({ week, total })).sort((a, b) => a.week.localeCompare(b.week)));
    // Per Bulan
    const perMonth = {};
    Object.entries(perDay).forEach(([date, total]) => {
      const month = date.slice(0, 7);
      perMonth[month] = (perMonth[month] || 0) + total;
    });
    setSalesPerMonth(Object.entries(perMonth).map(([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month)));
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Omzet Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatRupiah(stats?.today?.revenue || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.today?.transactionCount || 0} transaksi
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Omzet Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatRupiah(stats?.month?.revenue || 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.month?.transactionCount || 0} transaksi
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produk</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats?.products?.total || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Produk aktif</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stok Rendah</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats?.products?.lowStock || 0}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Perlu restok</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Produk Terlaris</h2>
        
        {topProducts.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terjual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                        <div className="text-sm text-gray-500">{item.product.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.totalQty} {item.product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRupiah(item.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Belum ada data penjualan</p>
        )}
      </div>

      {/* Grafik Penjualan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Grafik Penjualan</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Per Hari</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="total" fill="#2563eb" name="Total Penjualan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Per Minggu</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesPerWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="total" fill="#059669" name="Total Penjualan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Per Bulan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesPerMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="total" fill="#f59e42" name="Total Penjualan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}