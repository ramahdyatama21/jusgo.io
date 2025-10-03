import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuSections = [
    {
      title: 'MENU',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/products', label: 'Produk', icon: '📦' },
        { path: '/pos', label: 'Kasir', icon: '💰' },
        { path: '/transactions', label: 'Transaksi', icon: '📋' },
        { path: '/reports', label: 'Laporan', icon: '📈' },
        { path: '/stock', label: 'Stok', icon: '📦' },
        { path: '/open-order', label: 'Open Order', icon: '📝', new: true },
        { path: '/belanja-bahan', label: 'Belanja Bahan', icon: '🛒', new: true },
        { path: '/kalkulator-hpp', label: 'Kalkulator HPP', icon: '🧮', new: true },
        { path: '/promo', label: 'Promo', icon: '🎁' },
        { path: '/riwayat-transaksi', label: 'Riwayat', icon: '📜' },
      ]
    },
    {
      title: 'Support',
      items: [
        { path: '/chat', label: 'Chat', icon: '💬' },
        { path: '/support-ticket', label: 'Support Ticket', icon: '🎫', new: true },
        { path: '/email', label: 'Email', icon: '📧' },
      ]
    },
    {
      title: 'Others',
      items: [
        { path: '/charts', label: 'Charts', icon: '📊' },
        { path: '/ui-elements', label: 'UI Elements', icon: '🎨' },
        { path: '/authentication', label: 'Authentication', icon: '🔐' },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-70 bg-slate-800 text-white fixed h-screen overflow-y-auto z-50 shadow-lg border-r border-slate-700">
      <div className="p-6 border-b border-slate-700 bg-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/logo-jusgor.png" 
            alt="JusGor Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="flex items-center space-x-1" style={{display: 'none'}}>
            <span className="text-orange-500 font-bold text-lg">Jus</span>
            <span className="text-white font-bold text-lg">Gor</span>
            <span className="text-white font-bold text-lg">!</span>
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center ml-2">
              <span className="text-white text-sm font-bold">→</span>
            </div>
          </div>
          <span className="text-sm font-medium text-slate-300">POS</span>
        </div>
      </div>

      <nav className="p-4 flex-1">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {section.title}
            </div>
            {section.items.map((item) => (
              <div key={item.path} className="mb-1">
                <button
                  className={`w-full flex items-center px-3 py-3 text-slate-300 transition-all duration-200 font-medium rounded-lg mx-2 relative ${
                    location.pathname === item.path 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-700 hover:text-white'
                  } ${item.new ? 'pr-16' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="w-5 h-5 mr-3 text-lg">{item.icon}</span>
                  {item.label}
                  {item.new && (
                    <span className="absolute right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      New
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">{user.name || 'User'}</div>
            <div className="text-slate-400 text-xs">{user.email || 'user@example.com'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white border-none py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-200 hover:bg-red-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;