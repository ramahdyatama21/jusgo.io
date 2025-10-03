import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="app">
      <Sidebar />
      
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