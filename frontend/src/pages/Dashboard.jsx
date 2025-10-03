// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [salesPerDay, setSalesPerDay] = useState([]);
  const [salesPerWeek, setSalesPerWeek] = useState([]);
  const [salesPerMonth, setSalesPerMonth] = useState([]);
  const [costPerDay, setCostPerDay] = useState([]);
  const [profitPerDay, setProfitPerDay] = useState([]);
  const [todayHPP, setTodayHPP] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [monthHPP, setMonthHPP] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [totalBelanjaBahan, setTotalBelanjaBahan] = useState(0);
  const [lowStockList, setLowStockList] = useState([]);
  const user = JSON.parse(localStorage.getItem('supabase_user') || '{}');

  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    loadStats();
    try {
      // Hitung produk terlaris dari riwayat transaksi dan produk
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const riwayatRaw = JSON.parse(localStorage.getItem('riwayatTransaksi') || '[]');
      const riwayat = Array.isArray(riwayatRaw)
        ? riwayatRaw.map((order) => {
            let items = [];
            if (Array.isArray(order?.items)) items = order.items;
            else if (typeof order?.items === 'string') {
              try { items = JSON.parse(order.items); } catch { items = []; }
            } else { items = []; }
            return { ...order, items };
          })
        : [];
    // Akumulasi qty, revenue, dan HPP per produk
    const productMap = {};
    products.forEach(p => {
      productMap[p.name] = { product: p, totalQty: 0, totalRevenue: 0, totalHPP: 0 };
    });
    riwayat.forEach(order => {
      (order.items || []).forEach(item => {
        if (productMap[item.name]) {
          productMap[item.name].totalQty += item.qty;
          productMap[item.name].totalRevenue += (item.subtotal || (item.qty * item.price));
          const buyPrice = Number(productMap[item.name].product?.buyPrice || 0);
          productMap[item.name].totalHPP += (Number(item.qty) * buyPrice);
        }
      });
    });
    setTopProducts(Object.values(productMap).filter(p => p.totalQty > 0).sort((a, b) => b.totalQty - a.totalQty));

    // Low stock list (lokal)
    const lowList = products.filter(p => typeof p.stock === 'number' && typeof p.minStock === 'number' && p.stock <= p.minStock);
    setLowStockList(lowList);

    // --- Grafik Penjualan ---
    // Helper: format tanggal ke yyyy-mm-dd
    const toDate = (str) => str ? str.slice(0, 10) : '';
    // Per Hari (Revenue, HPP/Cost, Profit)
    const perDay = {};
    const costDay = {};
    const profitDay = {};
    riwayat.forEach(order => {
      const tgl = toDate(order.created_at || order.sentAt);
      const revenue = (order.items || []).reduce((sum, i) => sum + (i.subtotal || (i.qty * i.price)), 0);
      perDay[tgl] = (perDay[tgl] || 0) + revenue;
      const hpp = (order.items || []).reduce((sum, i) => {
        const prod = products.find(p => p.id === i.productId || p.name === i.name);
        const buyPrice = Number(prod?.buyPrice || 0);
        return sum + (Number(i.qty) * buyPrice);
      }, 0);
      costDay[tgl] = (costDay[tgl] || 0) + hpp;
      profitDay[tgl] = (profitDay[tgl] || 0) + (revenue - hpp);
    });
    setSalesPerDay(Object.entries(perDay).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date)));
    setCostPerDay(Object.entries(costDay).map(([date, cost]) => ({ date, cost })).sort((a, b) => a.date.localeCompare(b.date)));
    setProfitPerDay(Object.entries(profitDay).map(([date, profit]) => ({ date, profit })).sort((a, b) => a.date.localeCompare(b.date)));
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
    // Totals: Today & Month
    const todayKey = toDate(new Date().toISOString());
    const monthKey = todayKey.slice(0, 7);
    const todayCost = costDay[todayKey] || 0;
    const todayRevenue = perDay[todayKey] || 0;
    setTodayHPP(todayCost);
    setTodayProfit(Math.max(0, todayRevenue - todayCost));

    const monthCost = Object.entries(costDay)
      .filter(([d]) => d && d.startsWith(monthKey))
      .reduce((s, [, v]) => s + v, 0);
    const monthRevenue = Object.entries(perDay)
      .filter(([d]) => d && d.startsWith(monthKey))
      .reduce((s, [, v]) => s + v, 0);
    setMonthHPP(monthCost);
    setMonthProfit(Math.max(0, monthRevenue - monthCost));

    // Total belanja bahan sepanjang riwayat lokal
    const totalCostAll = Object.values(costDay).reduce((s, v) => s + v, 0);
    setTotalBelanjaBahan(totalCostAll);
    } catch (error) {
      console.error('Error processing dashboard data:', error);
    }
  }, []);

  const loadStats = async () => {
    try {
      console.log('Loading dashboard stats...');
      const data = await getDashboardStats();
      console.log('Dashboard stats loaded:', data);
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(error.message);
      // Set a default stats object to prevent blank screen
      setStats({
        today: { revenue: 0, transactionCount: 0 },
        month: { revenue: 0, transactionCount: 0 },
        products: { total: 0, lowStock: 0 }
      });
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

  console.log('Dashboard render - loading:', loading, 'stats:', stats);
  
  if (loading) {
    console.log('Dashboard showing loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!stats) {
    console.log('Dashboard showing error state - no stats');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Gagal memuat data dashboard.</div>
      </div>
    );
  }
  
  console.log('Dashboard rendering main content');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user.email || 'User'}!</p>
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-2">
            <strong>Warning:</strong> {error}
          </div>
        )}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M4 15h10M4 11h7M4 7h13" />
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
                {lowStockList.length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          {lowStockList.length === 0 ? (
            <p className="text-sm text-green-600 mt-2">Stok aman</p>
          ) : (
            <div className="text-sm text-red-600 mt-2">
              Perlu restok: {lowStockList.map(p => p.name).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* HPP & Profit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">HPP (Hari Ini)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(todayHPP)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Profit (Hari Ini)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(todayProfit)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">HPP (Bulan Ini)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(monthHPP)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Profit (Bulan Ini)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(monthProfit)}</p>
        </div>
      </div>

      {/* Total Belanja Bahan */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Total Belanja Bahan</h2>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatRupiah(totalBelanjaBahan)}</p>
          </div>
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
          <h3 className="font-semibold mb-2">Belanja Bahan per Hari (HPP)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="cost" fill="#ef4444" name="Belanja Bahan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Profit per Hari</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={profitPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="profit" fill="#10b981" name="Profit" />
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