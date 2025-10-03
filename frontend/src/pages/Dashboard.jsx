// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  
  // Simple user data
  const user = JSON.parse(localStorage.getItem('supabase_user') || '{}');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="loading-container">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user.email || 'User'}!</p>
        </div>

        {/* Simple Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="text-lg font-semibold text-gray-800">Omzet Hari Ini</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">Rp 0</p>
            <p className="text-sm text-gray-500">0 transaksi</p>
          </div>

          <div className="stat-card">
            <h3 className="text-lg font-semibold text-gray-800">Omzet Bulan Ini</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">Rp 0</p>
            <p className="text-sm text-gray-500">0 transaksi</p>
          </div>

          <div className="stat-card">
            <h3 className="text-lg font-semibold text-gray-800">Total Produk</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">0</p>
            <p className="text-sm text-gray-500">Produk aktif</p>
          </div>

          <div className="stat-card">
            <h3 className="text-lg font-semibold text-gray-800">Stok Rendah</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">0</p>
            <p className="text-sm text-gray-500">Stok aman</p>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Dashboard Berhasil Dimuat!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Dashboard Anda sudah berfungsi dengan baik. Mulai tambahkan produk dan transaksi untuk melihat data yang lebih detail.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}