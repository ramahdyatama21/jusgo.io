import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Produk', icon: '📦' },
    { path: '/pos', label: 'Kasir', icon: '💰' },
    { path: '/transactions', label: 'Transaksi', icon: '📋' },
    { path: '/reports', label: 'Laporan', icon: '📈' },
    { path: '/stock', label: 'Stok', icon: '📦' },
    { path: '/open-order', label: 'Open Order', icon: '📝' },
    { path: '/belanja-bahan', label: 'Belanja Bahan', icon: '🛒' },
    { path: '/kalkulator-hpp', label: 'Kalkulator HPP', icon: '🧮' },
    { path: '/promo', label: 'Promo', icon: '🎁' },
    { path: '/riwayat-transaksi', label: 'Riwayat', icon: '📜' },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>POS System</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.path} className="nav-item">
              <button
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #334155' }}>
          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Selamat datang, {user.name || 'User'}
          </p>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.75rem' }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {/* Header Bar like TailAdmin */}
        <div className="header-bar">
          <div className="header-left">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
              />
            </div>
          </div>
          
          <div className="header-right">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
            
            <div className="user-menu">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name || 'User'}</div>
                <div className="user-email">{user.email || 'user@example.com'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;