import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Clock, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu,
  Scale,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddExpenseModal from '../components/AddExpenseModal';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Compute user initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="modal-overlay" 
          onClick={toggleSidebar}
          style={{ zIndex: 35, display: 'block' }}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Scale size={20} />
          </div>
          <div className="sidebar-title">Court Tracker</div>
          {sidebarOpen && (
            <button className="mobile-menu-btn" onClick={toggleSidebar} style={{ marginLeft: 'auto' }}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/expenses" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Receipt size={20} />
            <span>Expenses</span>
          </NavLink>
          <NavLink to="/timeline" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Clock size={20} />
            <span>Case Timeline</span>
          </NavLink>
          <NavLink to="/reports" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>
          <button 
            className="nav-item" 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', marginTop: '0.5rem', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="header-title">Family Property Case</h2>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle size={18} />
              <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>Record Expense</span>
            </button>
            
            <div 
              className="user-profile" 
              onClick={() => navigate('/settings')}
              style={{ cursor: 'pointer' }}
              title="Go to Account Settings"
            >
              <div className="avatar">{initials}</div>
              <div style={{ display: window.innerWidth > 768 ? 'block' : 'none', textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>

      {/* Global Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
