import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { Modal } from '../components/Modal';
import {
  ClipboardCheck,
  Plus,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';

export const AssetAudit = () => {
  const { user } = useAuth();

  const [auditCycles, setAuditCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [cycleDetail, setCycleDetail] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Cycle Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    title: '',
    scopeType: 'All',
    scopeValue: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const loadAuditCycles = async () => {
    try {
      setLoading(true);
      const [cycles, deptList, empList] = await Promise.all([
        fetchAPI('/audits'),
        fetchAPI('/departments'),
        fetchAPI('/users')
      ]);

      setAuditCycles(cycles);
      setDepartments(deptList);
      setEmployees(empList);

      if (cycles.length > 0 && !selectedCycleId) {
        setSelectedCycleId(cycles[0]._id);
      }
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCycleDetail = async (cycleId) => {
    try {
      const data = await fetchAPI(`/audits/${cycleId}`);
      setCycleDetail(data);
    } catch (err) {
      console.error('Cycle detail fetch error:', err);
    }
  };

  useEffect(() => {
    loadAuditCycles();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      loadCycleDetail(selectedCycleId);
    }
  }, [selectedCycleId]);

  // Create Audit Cycle submit (Admin only)
  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      const newCycle = await fetchAPI('/audits', {
        method: 'POST',
        body: JSON.stringify(cycleForm)
      });
      setShowCreateModal(false);
      setSelectedCycleId(newCycle._id);
      loadAuditCycles();
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark verification entry (Verified / Missing / Damaged)
  const handleVerifyAsset = async (assetId, status) => {
    if (!selectedCycleId) return;
    try {
      await fetchAPI(`/audits/${selectedCycleId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ assetId, status })
      });
      loadCycleDetail(selectedCycleId);
    } catch (err) {
      alert(err.message);
    }
  };

  // Lock Cycle & Update Missing assets to 'Lost' status!
  const handleLockCycle = async () => {
    if (!window.confirm('Locking this audit cycle will finalize the discrepancy report and automatically update confirmed missing assets to Lost status. Proceed?')) {
      return;
    }
    try {
      await fetchAPI(`/audits/${selectedCycleId}/lock`, { method: 'PUT' });
      loadAuditCycles();
      loadCycleDetail(selectedCycleId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Asset Audit & Verification Cycles</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Run structured physical audit cycles, generate automated discrepancy reports, and lock cycles to update lost items.
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button onClick={() => setShowCreateModal(true)} className="glow-btn-primary">
            <Plus size={16} /> Create Audit Cycle
          </button>
        )}
      </div>

      {/* Cycle Selector Bar */}
      <div className="glass-panel filter-toolbar" style={{ padding: '1rem' }}>
        <strong style={{ fontSize: '0.85rem', color: '#94a3b8', flexShrink: 0 }}>Audit Cycles:</strong>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0, maxWidth: '100%' }}>
          {auditCycles.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCycleId(c._id)}
              className="glow-btn-secondary"
              style={{
                borderColor: selectedCycleId === c._id ? '#38bdf8' : 'transparent',
                background: selectedCycleId === c._id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: selectedCycleId === c._id ? '#38bdf8' : '#94a3b8',
                fontSize: '0.8rem',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                maxWidth: '100%',
                textAlign: 'left'
              }}
            >
              {c.title} [{c.status}]
            </button>
          ))}
        </div>
      </div>

      {cycleDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Cycle Overview & Actions Header */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, wordBreak: 'break-word' }}>{cycleDetail.cycle.title}</h2>
                <span className={`status-pill ${cycleDetail.cycle.status === 'Locked' ? 'status-Lost' : 'status-Available'}`}>
                  {cycleDetail.cycle.status}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', wordBreak: 'break-word' }}>
                Scope: {cycleDetail.cycle.scopeType} | Dates: {new Date(cycleDetail.cycle.startDate).toLocaleDateString()} to {new Date(cycleDetail.cycle.endDate).toLocaleDateString()}
              </p>
            </div>

            {cycleDetail.cycle.status !== 'Locked' && (user?.role === 'Admin' || user?.role === 'Asset Manager') && (
              <button onClick={handleLockCycle} className="glow-btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%' }}>
                <Lock size={15} style={{ flexShrink: 0 }} /> Close & Lock Audit Cycle (Updates Lost Assets)
              </button>
            )}
          </div>

          {/* AUTO-GENERATED DISCREPANCY REPORT SUMMARY */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} /> Automated Discrepancy & Verification Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total In Scope</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{cycleDetail.discrepancyReport.totalInScope}</h3>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Verified Intact</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{cycleDetail.discrepancyReport.verifiedCount}</h3>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Flagged Missing</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{cycleDetail.discrepancyReport.missingCount}</h3>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Flagged Damaged</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{cycleDetail.discrepancyReport.damagedCount}</h3>
              </div>
            </div>
          </div>

          {/* AUDITOR CHECKLIST TABLE */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Auditor Verification Checklist</h3>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Current Audit Status</th>
                    <th>Auditor Verification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycleDetail.checklist.map(item => (
                    <tr key={item.asset._id}>
                      <td><strong style={{ color: '#38bdf8' }}>{item.asset.assetTag}</strong></td>
                      <td style={{ fontWeight: 600 }}>{item.asset.name}</td>
                      <td>{item.asset.category?.name}</td>
                      <td>{item.asset.department?.name || 'N/A'}</td>
                      <td>{item.asset.location}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'Verified' ? 'status-Available' : item.status === 'Missing' ? 'status-Lost' : item.status === 'Damaged' ? 'status-Under-Maintenance' : 'status-Retired'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {cycleDetail.cycle.status !== 'Locked' ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleVerifyAsset(item.asset._id, 'Verified')}
                              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyAsset(item.asset._id, 'Missing')}
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Mark Missing
                            </button>
                            <button
                              onClick={() => handleVerifyAsset(item.asset._id, 'Damaged')}
                              style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Mark Damaged
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cycle Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE AUDIT CYCLE MODAL (Admin Only) */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Audit Verification Cycle">
        <form onSubmit={handleCreateCycle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cycle Title *</label>
            <input required type="text" className="input-field" value={cycleForm.title} onChange={e => setCycleForm({ ...cycleForm, title: e.target.value })} placeholder="e.g. Q3 Engineering Floor Audit" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Scope Type *</label>
            <select className="input-field" value={cycleForm.scopeType} onChange={e => setCycleForm({ ...cycleForm, scopeType: e.target.value })}>
              <option value="All">All Assets Organization-Wide</option>
              <option value="Department">By Department</option>
              <option value="Location">By Physical Location</option>
            </select>
          </div>

          {cycleForm.scopeType === 'Department' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select Target Department</label>
              <select className="input-field" value={cycleForm.scopeValue} onChange={e => setCycleForm({ ...cycleForm, scopeValue: e.target.value })}>
                <option value="">-- Choose Department --</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid-2col">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Start Date *</label>
              <input required type="date" className="input-field" value={cycleForm.startDate} onChange={e => setCycleForm({ ...cycleForm, startDate: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>End Date *</label>
              <input required type="date" className="input-field" value={cycleForm.endDate} onChange={e => setCycleForm({ ...cycleForm, endDate: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Initialize Audit Cycle & Assign Auditors
          </button>
        </form>
      </Modal>
    </div>
  );
};
