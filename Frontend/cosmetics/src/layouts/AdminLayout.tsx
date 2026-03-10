import type { ReactNode } from 'react';
import {  useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import '../assets/styles/admin.css';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '📦' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '🧾' },
    { path: '/admin/invoices', label: 'Hóa đơn', icon: '💰' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <div className="logo-icon">💄</div>
            <div className="logo-text">
              <h2>Cosmetics</h2>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>
        
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {(user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username || 'Admin'}</span>
              <span className="user-role">Quản trị viên</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 className="page-title">Quản trị hệ thống</h1>
          </div>
          
          <div className="header-right">
            <div className="user-menu">
              <span className="welcome-text">Xin chào, {user?.username || 'Admin'}</span>
              <button 
                onClick={logout}
                className="btn btn-danger btn-sm logout-btn"
              >
                <span>🚪</span>
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main">
          <div className="main-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};