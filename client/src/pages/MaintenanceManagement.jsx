import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { useSearchParams } from 'react-router-dom';
import { Wrench, Plus, CheckCircle, XCircle, UserCheck, DollarSign } from 'lucide-react';

export const MaintenanceManagement = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [userAssets, setUserAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRaiseModal, setShowRaiseModal] = useState(searchParams.get('action') === 'raise');
  const [raiseForm, setRaiseForm] = useState({
    assetId: '',
    issueDescription: '',
    priority: 'Medium',
    photo: ''
  });

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', cost: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintList, assetList] = await Promise.all([
        fetchAPI('/maintenance'),
        fetchAPI('/assets')
      ]);

      setRequests(maintList);
      setUserAssets(assetList);
    } catch (err) {
      console.error('Maintenance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Raise Maintenance Request
  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/maintenance', {
        method: 'POST',
        body: JSON.stringify(raiseForm)
      });
      setShowRaiseModal(false);
      setRaiseForm({ assetId: '', issueDescription: '', priority: 'Medium', photo: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Approve / Reject Maintenance (Triggers Asset Status Flip to 'Under Maintenance')
  const handleApprove = async (requestId, status) => {
    try {
      await fetchAPI(`/maintenance/${requestId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Resolve Maintenance (Triggers Asset Status Flip back to 'Available')
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI(`/maintenance/${selectedMaint._id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({
          ...resolveForm,
          cost: resolveForm.cost !== '' ? Number(resolveForm.cost) : 0
        })
      });
      setShowResolveModal(false);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Asset Repair & Maintenance Management</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Route repair requests through approval workflows. Approving flips asset status to Under Maintenance.
          </p>
        </div>

        <button onClick={() => setShowRaiseModal(true)} className="glow-btn-primary">
          <Plus size={16} /> Raise Repair Request
        </button>
      </div>

      {/* Requests Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Requested By</th>
                <th>Issue Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Technician / Cost</th>
                <th>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No maintenance requests logged.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{req.asset?.assetTag}</strong></td>
                    <td style={{ fontWeight: 600 }}>{req.asset?.name}</td>
                    <td>{req.requestedBy?.name}</td>
                    <td style={{ color: '#cbd5e1', maxWidth: '200px' }}>{req.issueDescription}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: req.priority === 'Critical' ? 'rgba(239,68,68,0.2)' : req.priority === 'High' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                        color: req.priority === 'Critical' ? '#f87171' : req.priority === 'High' ? '#fbbf24' : '#cbd5e1'
                      }}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {req.assignedTechnician || 'Unassigned'} {req.cost ? `($${req.cost})` : ''}
                      </span>
                    </td>
                    <td>
                      {/* Approval Actions for Asset Managers */}
                      {req.status === 'Pending' && (user?.role === 'Admin' || user?.role === 'Asset Manager') && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleApprove(req._id, 'Approved')}
                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(req._id, 'Rejected')}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Resolution Action */}
                      {(req.status === 'Approved' || req.status === 'In Progress') && (user?.role === 'Admin' || user?.role === 'Asset Manager') && (
                        <button
                          onClick={() => { setSelectedMaint(req); setResolveForm({ resolutionNotes: '', cost: '' }); setShowResolveModal(true); }}
                          style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Resolve & Revert to Available
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAISE REPAIR REQUEST MODAL */}
      <Modal isOpen={showRaiseModal} onClose={() => setShowRaiseModal(false)} title="Raise Asset Repair Request">
        <form onSubmit={handleRaiseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select Asset *</label>
            <select required className="input-field" value={raiseForm.assetId} onChange={e => setRaiseForm({ ...raiseForm, assetId: e.target.value })}>
              <option value="">-- Select Asset --</option>
              {userAssets.map(a => (
                <option key={a._id} value={a._id}>{a.assetTag} - {a.name} [{a.status}]</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Priority Level *</label>
            <select className="input-field" value={raiseForm.priority} onChange={e => setRaiseForm({ ...raiseForm, priority: e.target.value })}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical Breakdown</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Issue Description *</label>
            <textarea required className="input-field" rows={3} value={raiseForm.issueDescription} onChange={e => setRaiseForm({ ...raiseForm, issueDescription: e.target.value })} placeholder="Describe failure or damage..." />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Submit Maintenance Request
          </button>
        </form>
      </Modal>

      {/* RESOLVE MAINTENANCE MODAL */}
      <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title={`Resolve Maintenance - ${selectedMaint?.asset?.assetTag}`}>
        <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Repair Cost ($)</label>
            <input type="number" min="0" step="any" className="input-field" value={resolveForm.cost} onChange={e => setResolveForm({ ...resolveForm, cost: e.target.value })} placeholder="Enter cost..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Resolution & Tech Notes</label>
            <textarea className="input-field" rows={3} value={resolveForm.resolutionNotes} onChange={e => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })} placeholder="Parts replaced, diagnostic notes..." />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Complete Maintenance & Revert Asset Status to Available
          </button>
        </form>
      </Modal>
    </div>
  );
};
