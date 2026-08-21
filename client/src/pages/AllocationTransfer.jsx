import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import {
  Repeat,
  UserCheck,
  ArrowRightLeft,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';

export const AllocationTransfer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('allocations');

  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Allocation Modal
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocForm, setAllocForm] = useState({
    assetId: '',
    userId: '',
    departmentId: '',
    expectedReturnDate: '',
    notes: ''
  });

  // Double-Allocation Conflict Warning State
  const [conflictData, setConflictData] = useState(null);

  // Return Check-in Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnAlloc, setSelectedReturnAlloc] = useState(null);
  const [returnForm, setReturnForm] = useState({ checkInCondition: 'Good', notes: '' });

  // Transfer Request Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ assetId: '', toUserId: '', reason: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [allocList, transList, assetList, empList, deptList] = await Promise.all([
        fetchAPI('/allocations'),
        fetchAPI('/transfers'),
        fetchAPI('/assets'),
        fetchAPI('/users'),
        fetchAPI('/departments')
      ]);

      setAllocations(allocList);
      setTransfers(transList);
      setAllAssets(assetList);
      setAvailableAssets(assetList.filter(a => a.status === 'Available'));
      setEmployees(empList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Allocation page load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit New Allocation (Triggers Double-Allocation Prevention Engine)
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setConflictData(null);
    try {
      await fetchAPI('/allocations', {
        method: 'POST',
        body: JSON.stringify(allocForm)
      });
      setShowAllocateModal(false);
      setAllocForm({ assetId: '', userId: '', departmentId: '', expectedReturnDate: '', notes: '' });
      loadData();
    } catch (err) {
      if (err.data && err.data.code === 'DOUBLE_ALLOCATION_CONFLICT') {
        // DOUBLE ALLOCATION BLOCKED! Show interactive conflict banner with Transfer Option!
        setConflictData(err.data);
      } else {
        alert(err.message);
      }
    }
  };

  // Submit Return Check-In (Reverts Asset to Available)
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI(`/allocations/${selectedReturnAlloc._id}/return`, {
        method: 'POST',
        body: JSON.stringify(returnForm)
      });
      setShowReturnModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit Transfer Request
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/transfers', {
        method: 'POST',
        body: JSON.stringify(transferForm)
      });
      setShowTransferModal(false);
      setTransferForm({ assetId: '', toUserId: '', reason: '' });
      setConflictData(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Approve / Reject Transfer Request
  const handleTransferRespond = async (transferId, status) => {
    try {
      await fetchAPI(`/transfers/${transferId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Asset Allocation & Transfer Workflows</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage active employee holdings, prevent double-allocations, approve transfers, and process asset returns.
          </p>
        </div>

        <div className="btn-group-responsive">
          {(user?.role === 'Admin' || user?.role === 'Asset Manager' || user?.role === 'Department Head') && (
            <button onClick={() => { setConflictData(null); setShowAllocateModal(true); }} className="glow-btn-primary">
              <Plus size={16} /> Allocate Asset
            </button>
          )}
          <button onClick={() => setShowTransferModal(true)} className="glow-btn-secondary">
            <ArrowRightLeft size={16} color="#38bdf8" /> Initiate Transfer Request
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="btn-group-responsive" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('allocations')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'allocations' ? '#38bdf8' : 'transparent',
            background: activeTab === 'allocations' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'allocations' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <UserCheck size={16} /> Active Allocations ({allocations.length})
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'transfers' ? '#38bdf8' : 'transparent',
            background: activeTab === 'transfers' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'transfers' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <ArrowRightLeft size={16} /> Transfer Requests ({transfers.length})
        </button>
      </div>

      {/* ACTIVE ALLOCATIONS TAB */}
      {activeTab === 'allocations' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Name</th>
                  <th>Assigned Holder</th>
                  <th>Allocated Date</th>
                  <th>Expected Return</th>
                  <th>Overdue Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(alloc => (
                  <tr key={alloc._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{alloc.asset?.assetTag}</strong></td>
                    <td style={{ fontWeight: 600 }}>{alloc.asset?.name}</td>
                    <td>
                      {alloc.user ? (
                        <span style={{ color: '#fff', fontWeight: 600 }}>{alloc.user.name} ({alloc.user.role})</span>
                      ) : (
                        <span style={{ color: '#c084fc' }}>Dept: {alloc.department?.name}</span>
                      )}
                    </td>
                    <td>{new Date(alloc.allocationDate).toLocaleDateString()}</td>
                    <td>{alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      {alloc.isOverdue ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.3)' }}>
                          ⚠️ OVERDUE
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '0.75rem' }}>On Schedule</span>
                      )}
                    </td>
                    <td>
                      {alloc.status === 'Active' && (user?.role === 'Admin' || user?.role === 'Asset Manager' || user?.role === 'Department Head') && (
                        <button
                          onClick={() => { setSelectedReturnAlloc(alloc); setShowReturnModal(true); }}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <RotateCcw size={12} /> Check-In Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSFER REQUESTS TAB */}
      {activeTab === 'transfers' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Name</th>
                  <th>Current Holder</th>
                  <th>Target Recipient</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(tr => (
                  <tr key={tr._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{tr.asset?.assetTag}</strong></td>
                    <td>{tr.asset?.name}</td>
                    <td>{tr.fromUser?.name || 'Unassigned'}</td>
                    <td><strong style={{ color: '#c084fc' }}>{tr.toUser?.name}</strong></td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{tr.reason}</td>
                    <td>
                      <span className={`status-pill ${tr.status === 'Approved' ? 'status-Available' : tr.status === 'Pending' ? 'status-Under-Maintenance' : 'status-Lost'}`}>
                        {tr.status}
                      </span>
                    </td>
                    <td>
                      {tr.status === 'Pending' && (user?.role === 'Admin' || user?.role === 'Asset Manager' || user?.role === 'Department Head') && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleTransferRespond(tr._id, 'Approved')}
                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleTransferRespond(tr._id, 'Rejected')}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALLOCATE ASSET MODAL (with Double-Allocation Block warning banner) */}
      <Modal isOpen={showAllocateModal} onClose={() => setShowAllocateModal(false)} title="Allocate Asset to Employee / Dept">
        <form onSubmit={handleAllocateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* DOUBLE ALLOCATION CONFLICT WARNING BANNER */}
          {conflictData && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '1rem',
              color: '#f87171'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <AlertTriangle size={18} /> DOUBLE-ALLOCATION PREVENTED BY SYSTEM
              </div>
              <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: '1.4' }}>
                {conflictData.message}
              </p>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllocateModal(false);
                    setTransferForm({
                      assetId: allocForm.assetId,
                      toUserId: allocForm.userId,
                      reason: `Transfer requested due to allocation conflict (Held by ${conflictData.heldBy})`
                    });
                    setShowTransferModal(true);
                  }}
                  style={{
                    background: '#38bdf8',
                    color: '#090d16',
                    border: 'none',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Request Transfer From {conflictData.heldBy} Instead
                </button>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select Asset *</label>
            <select required className="input-field" value={allocForm.assetId} onChange={e => setAllocForm({ ...allocForm, assetId: e.target.value })}>
              <option value="">-- Choose Asset --</option>
              {allAssets.map(a => (
                <option key={a._id} value={a._id}>
                  {a.assetTag} - {a.name} [{a.status}] {a.currentHolder ? `(Held by ${a.currentHolder.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2col">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Target Employee</label>
              <select className="input-field" value={allocForm.userId} onChange={e => setAllocForm({ ...allocForm, userId: e.target.value, departmentId: '' })}>
                <option value="">-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e._id} value={e._id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>OR Target Department</label>
              <select className="input-field" value={allocForm.departmentId} onChange={e => setAllocForm({ ...allocForm, departmentId: e.target.value, userId: '' })}>
                <option value="">-- Select Department --</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Expected Return Date</label>
            <input type="date" className="input-field" value={allocForm.expectedReturnDate} onChange={e => setAllocForm({ ...allocForm, expectedReturnDate: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Allocation Notes</label>
            <textarea className="input-field" rows={2} value={allocForm.notes} onChange={e => setAllocForm({ ...allocForm, notes: e.target.value })} placeholder="Reason for allocation..." />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Confirm Asset Allocation
          </button>
        </form>
      </Modal>

      {/* RETURN CHECK-IN MODAL */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title={`Asset Return Check-In: ${selectedReturnAlloc?.asset?.assetTag}`}>
        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Returned Condition *</label>
            <select className="input-field" value={returnForm.checkInCondition} onChange={e => setReturnForm({ ...returnForm, checkInCondition: e.target.value })}>
              <option value="New">New / Unused</option>
              <option value="Good">Good Condition</option>
              <option value="Fair">Fair / Minor Wear</option>
              <option value="Poor">Poor Condition</option>
              <option value="Damaged">Damaged (Needs Repair)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Check-In Notes</label>
            <textarea className="input-field" rows={3} value={returnForm.notes} onChange={e => setReturnForm({ ...returnForm, notes: e.target.value })} placeholder="Verification notes upon return..." />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Process Return & Revert Asset Status to Available
          </button>
        </form>
      </Modal>

      {/* INITIATE TRANSFER REQUEST MODAL */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Initiate Asset Transfer Request">
        <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Asset to Transfer *</label>
            <select required className="input-field" value={transferForm.assetId} onChange={e => setTransferForm({ ...transferForm, assetId: e.target.value })}>
              <option value="">-- Select Asset --</option>
              {allAssets.map(a => (
                <option key={a._id} value={a._id}>
                  {a.assetTag} - {a.name} {a.currentHolder ? `(Held by ${a.currentHolder.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Transfer Target Recipient *</label>
            <select required className="input-field" value={transferForm.toUserId} onChange={e => setTransferForm({ ...transferForm, toUserId: e.target.value })}>
              <option value="">-- Select Employee --</option>
              {employees.map(e => (
                <option key={e._id} value={e._id}>{e.name} ({e.department?.name || 'No Dept'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Reason for Transfer *</label>
            <textarea required className="input-field" rows={3} value={transferForm.reason} onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })} placeholder="Project requirement, role reassignment..." />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Submit Transfer Request
          </button>
        </form>
      </Modal>
    </div>
  );
};
