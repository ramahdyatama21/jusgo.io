// frontend/src/components/Layout.jsx

import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="layout-container">
      <div className="sidebar">
        <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>POS System</h2>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="/dashboard" className="nav-link">Dashboard</a>
            </li>
            <li className="nav-item">
              <a href="/products" className="nav-link">Produk</a>
            </li>
            <li className="nav-item">
              <a href="/pos" className="nav-link">Kasir</a>
            </li>
            <li className="nav-item">
              <a href="/transactions" className="nav-link">Transaksi</a>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}