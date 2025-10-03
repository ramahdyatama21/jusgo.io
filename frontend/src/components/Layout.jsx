import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Layout = () => {
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
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>POS System</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <div key={item.path} className="nav-item">
                  <button
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''} ${item.new ? 'new' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name || 'User'}</div>
              <div className="sidebar-user-email">{user.email || 'user@example.com'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout"
          >
            Sign out
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