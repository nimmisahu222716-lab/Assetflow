import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Printer, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

export const ReportsAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/reports/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#64748b'];

  const exportCSV = () => {
    if (!analytics) return;
    let csv = 'Category,Department,Bookings,MaintenanceCost\n';
    analytics.deptSummary.forEach(d => {
      csv += `N/A,${d.department},${d.count},0\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AssetFlow_ERP_Analytics_Report.csv';
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports & Executive Analytics</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Actionable operational insights across asset utilization, maintenance frequencies, department allocations, and heatmaps.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportCSV} className="glow-btn-secondary" style={{ fontSize: '0.8rem' }}>
            <Download size={15} color="#38bdf8" /> Export CSV Data
          </button>
          <button onClick={() => window.print()} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}>
            <Printer size={15} /> Print / Export PDF
          </button>
        </div>
      </div>

      {analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Row 1 Charts */}
          <div className="chart-grid">

            {/* Asset Status Distribution Pie Chart */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PieIcon size={18} color="#38bdf8" /> Lifecycle Status Distribution
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ _id, count }) => `${_id}: ${count}`}
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111827', borderColor: '#334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department-Wise Allocations Bar Chart */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BarChart3 size={18} color="#8b5cf6" /> Department-Wise Allocation Summary
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.deptSummary}>
                    <XAxis dataKey="department" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#111827', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2 Heatmap & Maintenance */}
          <div className="chart-grid">

            {/* Resource Booking Heatmap */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={18} color="#f59e0b" /> Resource Booking Peak Usage Heatmap (By Hour)
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.hourlyHeatmap}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#111827', borderColor: '#334155', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maintenance Cost by Category */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Maintenance Cost & Frequency by Category</h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Total Repair Events</th>
                      <th>Aggregated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.maintenanceFreq.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No repair metrics recorded yet.</td>
                      </tr>
                    ) : (
                      analytics.maintenanceFreq.map(mf => (
                        <tr key={mf._id}>
                          <td style={{ fontWeight: 600 }}>{mf._id}</td>
                          <td>{mf.count} Events</td>
                          <td><strong style={{ color: '#f59e0b' }}>${mf.totalCost}</strong></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
