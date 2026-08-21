import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Bell, ShieldAlert, History, User, Terminal } from 'lucide-react';

export const ActivityNotifications = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifData, logsData] = await Promise.all([
        fetchAPI('/notifications'),
        fetchAPI('/logs').catch(() => [])
      ]);

      setNotifications(notifData.notifications || []);
      setAuditLogs(logsData || []);
    } catch (err) {
      console.error('Activity logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Activity Logs & Notifications Feed</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Audit trail of organization actions and real-time alert event notifications.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('notifications')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'notifications' ? '#38bdf8' : 'transparent',
            background: activeTab === 'notifications' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'notifications' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <Bell size={16} /> Notification Event Feed ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'logs' ? '#38bdf8' : 'transparent',
            background: activeTab === 'logs' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'logs' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <Terminal size={16} /> Immutable System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlignment: 'center', textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No notifications logged.
              </p>
            ) : (
              notifications.map(n => (
                <div key={n._id} style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: n.type === 'Overdue Alert' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                        color: n.type === 'Overdue Alert' ? '#f87171' : '#38bdf8'
                      }}>
                        {n.type}
                      </span>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{n.title}</strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{n.message}</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SYSTEM AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Performed By</th>
                  <th>Role</th>
                  <th>Action Code</th>
                  <th>Target Entity</th>
                  <th>Audit Event Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No audit logs found or insufficient permissions.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log._id}>
                      <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{log.userName}</td>
                      <td>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.userRole}
                        </span>
                      </td>
                      <td><strong style={{ color: '#38bdf8', fontSize: '0.8rem' }}>{log.action}</strong></td>
                      <td>{log.entity}</td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
