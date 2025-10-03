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
      const lowStock = products?.filter(p => p.stock <= p.minStock).length || 0;
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
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user.name || 'User'}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produk</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Produk aktif</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalSales}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">Semua waktu</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">Semua waktu</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stok Rendah</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.lowStock}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">Perlu restok</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pendapatan Bulan Ini</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-gray-500 mt-2">
            Target: {formatCurrency(stats.totalRevenue * 1.2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Target Bulan Ini</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(stats.totalRevenue * 1.2)}
          </div>
          <div className="text-gray-500 mt-2">
            Progress: {Math.round((stats.totalRevenue / (stats.totalRevenue * 1.2)) * 100)}%
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Produk Terlaris</h3>
        </div>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📦</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.sellPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock} {product.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock <= product.minStock ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Stok Rendah
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Tersedia
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada data produk
          </div>
        )}
      </div>

      {/* Sales Charts */}
      {salesPerDay.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Grafik Penjualan</h3>
          </div>
          <div className="p-6">
            <h4 className="font-semibold mb-4">Per Hari</h4>
            <div className="h-48 overflow-auto">
              {salesPerDay.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;