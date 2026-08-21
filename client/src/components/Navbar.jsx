import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { fetchAPI } from '../utils/api';
import { Bell, Search, Shield, Sun, Moon, Menu, Boxes } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleMobileSidebar } = useSidebar();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await fetchAPI('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Notification error', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetchAPI('/notifications/read-all', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="dashboard-header-container">
      {/* Left side: Hamburger button on mobile + Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          className="dashboard-mobile-toggle"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation drawer"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile Brand Title (Shown when sidebar is hidden on small screens) */}
        <div className="dashboard-mobile-brand">
          <Boxes size={18} color="#38bdf8" />
          <span style={{ fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(90deg, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AssetFlow
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="dashboard-search-wrap">
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Tag, Serial..."
            className="input-field"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.8rem', fontSize: '0.8rem', height: '36px', width: '100%' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                navigate(`/dashboard/assets?search=${encodeURIComponent(e.target.value)}`);
              }
            }}
          />
        </div>
      </div>

      {/* Right side: Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            padding: 0,
            flexShrink: 0
          }}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="#f59e0b" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ) : (
            <Moon size={18} color="#6366f1" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          )}
        </button>

        {/* Dept Badge */}
        {user?.department && (
          <span className="dashboard-dept-badge" style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'var(--accent-purple)',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0
          }}>
            <Shield size={12} />
            <span className="dept-badge-text">{user.department.name || 'Department'}</span>
          </span>
        )}

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative', marginRight: '0.35rem' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              flexShrink: 0
            }}
          >
            <Bell size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.62rem',
                fontWeight: 700,
                minWidth: '16px',
                height: '16px',
                padding: '0 3px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                lineHeight: 1,
                pointerEvents: 'none'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer Popup */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '45px',
              width: '320px',
              maxWidth: 'calc(100vw - 2rem)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
              padding: '1rem',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No notifications</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div key={n._id} style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '6px',
                    background: n.read ? 'transparent' : 'rgba(56, 189, 248, 0.08)',
                    marginBottom: '0.4rem',
                    borderLeft: n.type === 'Overdue Alert' ? '3px solid #ef4444' : '3px solid var(--accent-cyan)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: n.type === 'Overdue Alert' ? '#f87171' : 'var(--accent-cyan)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
