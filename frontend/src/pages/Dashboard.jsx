import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { supabase } from '../services/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStock: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [salesPerDay, setSalesPerDay] = useState([]);
  const [salesPerWeek, setSalesPerWeek] = useState([]);
  const [salesPerMonth, setSalesPerMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStats();
    loadTopProducts();
    loadSalesData();
  }, []);

  const loadStats = async () => {
    try {
      // Get products count
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Get transactions count and revenue
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*');
      
      if (transactionsError) throw transactionsError;

      // Calculate stats
      const totalProducts = products?.length || 0;
      const lowStock = products?.filter(p => p.stock <= p.min_stock).length || 0;
      const totalSales = transactions?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total || 0), 0) || 0;

      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        lowStock
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      // Get products with sales data
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setTopProducts(products || []);
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      // Get transactions for charts
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Process sales data
      const perDay = {};
      const perWeek = {};
      const perMonth = {};

      transactions?.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const dayKey = date.toISOString().split('T')[0];
        const weekKey = getWeekKey(date);
        const monthKey = date.toISOString().slice(0, 7);

        perDay[dayKey] = (perDay[dayKey] || 0) + (transaction.total || 0);
        perWeek[weekKey] = (perWeek[weekKey] || 0) + (transaction.total || 0);
        perMonth[monthKey] = (perMonth[monthKey] || 0) + (transaction.total || 0);
      });

      setSalesPerDay(Object.entries(perDay).map(([date, total]) => ({ date, total })));
      setSalesPerWeek(Object.entries(perWeek).map(([week, total]) => ({ week, total })));
      setSalesPerMonth(Object.entries(perMonth).map(([month, total]) => ({ month, total })));
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = Math.ceil((date.getDate() - 1) / 7) + 1;
    return `${year}-${String(month).padStart(2, '0')}-W${week}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <div className="text-lg text-gray-600">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-blue-100 mt-1 text-sm sm:text-base">Selamat datang, {user.name || 'User'}! 👋</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Produk</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">Produk aktif</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <span className="text-2xl sm:text-3xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Transaksi</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stats.totalSales}</p>
                <p className="text-xs sm:text-sm text-blue-600 mt-1">Semua waktu</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <span className="text-2xl sm:text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pendapatan</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs sm:text-sm text-yellow-600 mt-1">Semua waktu</p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                <span className="text-2xl sm:text-3xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Stok Rendah</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stats.lowStock}</p>
                <p className="text-xs sm:text-sm text-red-600 mt-1">Perlu restok</p>
              </div>
              <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                <span className="text-2xl sm:text-3xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold">💵 Pendapatan Bulan Ini</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-2">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-green-100 text-xs sm:text-sm">
              Target: {formatCurrency(stats.totalRevenue * 1.2)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold">🎯 Target Bulan Ini</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-2">
              {formatCurrency(stats.totalRevenue * 1.2)}
            </div>
            <div className="flex items-center">
              <div className="flex-1 bg-blue-400 rounded-full h-3 mr-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500" 
                  style={{ width: `${Math.min(Math.round((stats.totalRevenue / (stats.totalRevenue * 1.2)) * 100), 100)}%` }}
                ></div>
              </div>
              <span className="text-blue-100 text-xs sm:text-sm font-semibold">
                {Math.round((stats.totalRevenue / (stats.totalRevenue * 1.2)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">🏆 Produk Terlaris</h3>
          </div>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Kategori</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Harga</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📦</span>
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden md:table-cell">{product.category}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{formatCurrency(product.sell_price)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{product.stock}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {product.stock <= product.min_stock ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Low
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-500">Belum ada data produk</p>
            </div>
          )}
        </div>

        {/* Sales Charts */}
        {salesPerDay.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">📈 Grafik Penjualan</h3>
            </div>
            <div className="p-4 sm:p-6">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Penjualan Per Hari</h4>
              <div className="max-h-64 sm:max-h-72 overflow-auto">
                {salesPerDay.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 hover:bg-gray-50 px-2 sm:px-0">
                    <span className="text-xs sm:text-sm text-gray-600">{item.date}</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-600">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;