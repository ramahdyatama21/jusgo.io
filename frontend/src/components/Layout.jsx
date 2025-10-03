
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('supabase_user') || '{}');
  const role = user?.app_metadata?.role || user?.role || '';
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/products', label: 'Produk', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/stock', label: 'Stok', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/pos', label: 'POS', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/open-order', label: 'Open Order', icon: 'M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6' },
    { path: '/riwayat-transaksi', label: 'Riwayat Transaksi', icon: 'M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/kalkulator-hpp', label: 'Kalkulator HPP', icon: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v4h14V5a2 2 0 00-2-2H5a2 2 0 00-2 2zm0 4v10a2 2 0 002 2h10a2 2 0 002-2V9H5z' },
    { path: '/promo', label: 'Promo', icon: 'M5 13l4 4L19 7' },
    { path: '/belanja-bahan', label: 'Belanja Bahan', icon: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z' },
    { path: '/reports', label: 'Laporan', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  const menuForKasir = ['/dashboard', '/pos', '/open-order', '/riwayat-transaksi'];
  const visibleMenu = role === 'kasir'
    ? allMenuItems.filter(m => menuForKasir.includes(m.path))
    : allMenuItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
  <div className="relative min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white shadow px-4 py-3">
        <button
          className="text-blue-600 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-blue-600">POS System</h1>
        <div className="w-7 h-7" />
      </div>

      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex md:flex-col w-64 bg-white shadow-lg h-screen fixed top-0 left-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">POS System</h1>
            <p className="text-sm text-gray-600 mt-1">v1.0 Beta</p>
          </div>
          <nav className="px-4 space-y-2 flex-1">
            {visibleMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t w-full">
            <div className="flex flex-col items-center w-full">
              <div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  {(user.email?.charAt(0) || 'U').toUpperCase()}
                </div>
                <div className="text-center w-full">
                  <div className="font-medium text-gray-800">{user.email || 'User'}</div>
                  <div className="text-sm text-gray-500">{role || '-'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col items-center overflow-x-auto">
          {/* Page container */}
          <div className="w-full md:max-w-4xl">
            {children}
          </div>
        </div>
      </div>

      {/* Sidebar Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white shadow-lg h-full flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">POS System</h1>
              <button
                className="text-gray-500 focus:outline-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
              {visibleMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t w-full">
              <div className="flex flex-col items-center w-full">
                <div>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                    {(user.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="text-center w-full">
                    <div className="font-medium text-gray-800">{user.email || 'User'}</div>
                    <div className="text-sm text-gray-500">{role || '-'}</div>
                  </div>
                  <button
                    onClick={() => { setSidebarOpen(false); handleLogout(); }}
                    className="w-full mt-3 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Overlay */}
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
}