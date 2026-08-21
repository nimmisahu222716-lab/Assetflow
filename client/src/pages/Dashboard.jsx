import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  PackageCheck,
  Wrench,
  CalendarDays,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [overdueAllocations, setOverdueAllocations] = useState([]);
  const [recentAssets, setRecentAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiData, allocData, assetData] = await Promise.all([
        fetchAPI('/reports/kpis'),
        fetchAPI('/allocations'),
        fetchAPI('/assets?limit=5')
      ]);

      setKpis(kpiData);
      setOverdueAllocations(allocData.filter(a => a.isOverdue));
      setRecentAssets(assetData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            Welcome back, <span style={{ color: '#38bdf8' }}>{user?.name}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Real-time ERP operational overview for <strong style={{ color: '#cbd5e1' }}>{user?.role}</strong> role.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="btn-group-responsive">
          {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
            <button onClick={() => navigate('/dashboard/assets?action=register')} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}>
              <PlusCircle size={15} /> Register Asset
            </button>
          )}
          <button onClick={() => navigate('/dashboard/bookings?action=book')} className="glow-btn-secondary" style={{ fontSize: '0.8rem' }}>
            <Calendar size={15} color="#38bdf8" /> Book Resource
          </button>
          <button onClick={() => navigate('/dashboard/maintenance?action=raise')} className="glow-btn-secondary" style={{ fontSize: '0.8rem' }}>
            <Wrench size={15} color="#f59e0b" /> Raise Maintenance
          </button>
        </div>
      </div>

      {/* OVERDUE RETURNS ALERT BANNER (Past Expected Return Date) */}
      {overdueAllocations.length > 0 && (
        <div className="glass-panel" style={{
          padding: '1rem 1.25rem',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              background: '#ef4444',
              color: '#fff',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171' }}>
                CRITICAL ALERT: {overdueAllocations.length} Overdue Asset Allocation(s)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                These assets have passed their Expected Return Date and require immediate return or manager extension.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {overdueAllocations.map(alloc => (
              <div key={alloc._id} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.82rem'
              }}>
                <div>
                  <strong style={{ color: '#fff' }}>{alloc.asset?.name} ({alloc.asset?.assetTag})</strong>
                  <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                    Held by: <em style={{ color: '#38bdf8' }}>{alloc.user?.name || alloc.department?.name}</em>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    Due: {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigate('/dashboard/allocations')}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Manage Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6 Real-time KPI Cards Grid */}
      <div className="kpi-grid">
        {/* KPI 1: Available Assets */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assets Available</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {kpis ? kpis.availableAssets : 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Ready for allocation</span>
        </div>

        {/* KPI 2: Assets Allocated */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assets Allocated</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <PackageCheck size={20} color="#3b82f6" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {kpis ? kpis.allocatedAssets : 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Currently in deployment</span>
        </div>

        {/* KPI 3: Maintenance Today */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Maintenance Active</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Wrench size={20} color="#f59e0b" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {kpis ? kpis.maintenanceToday : 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#d97706' }}>Under repair / pending</span>
        </div>

        {/* KPI 4: Active Bookings */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Bookings</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <CalendarDays size={20} color="#8b5cf6" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {kpis ? kpis.activeBookings : 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed' }}>Shared resource slots</span>
        </div>

        {/* KPI 5: Pending Transfers */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending Transfers</span>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <ArrowRightLeft size={20} color="#38bdf8" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {kpis ? kpis.pendingTransfers : 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Awaiting manager response</span>
        </div>

        {/* KPI 6: Upcoming Returns */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Upcoming Returns</span>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Clock size={20} color="#ec4899" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {kpis ? kpis.upcomingReturns : 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#ec4899' }}>Expected back soon</span>
        </div>
      </div>

      {/* Recent Assets Directory Snapshot */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Asset Inventory Directory Overview</h3>
          <button onClick={() => navigate('/dashboard/assets')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
            View All Assets →
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map(asset => (
                <tr key={asset._id}>
                  <td>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{asset.assetTag}</strong>
                  </td>
                  <td>{asset.name}</td>
                  <td>{asset.category?.name}</td>
                  <td>{asset.location}</td>
                  <td>{asset.department?.name || 'Unassigned'}</td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
