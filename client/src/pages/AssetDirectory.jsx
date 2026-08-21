import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  QrCode,
  History,
  Clock,
  Wrench,
  User,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const AssetDirectory = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(searchParams.get('action') === 'register');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);

  // Registration Form
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: '',
    serialNumber: '',
    acquisitionCost: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    condition: 'Good',
    location: '',
    department: '',
    isBookable: false,
    notes: '',
    photo: ''
  });

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const queryStr = new URLSearchParams();
      if (searchQuery) queryStr.append('search', searchQuery);
      if (statusFilter) queryStr.append('status', statusFilter);
      if (categoryFilter) queryStr.append('category', categoryFilter);
      if (deptFilter) queryStr.append('department', deptFilter);

      const [assetList, catList, deptList] = await Promise.all([
        fetchAPI(`/assets?${queryStr.toString()}`),
        fetchAPI('/categories'),
        fetchAPI('/departments')
      ]);

      setAssets(assetList);
      setCategories(catList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Directory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, [searchQuery, statusFilter, categoryFilter, deptFilter]);

  // Open asset detail timeline modal
  const openAssetDetail = async (assetId) => {
    try {
      const data = await fetchAPI(`/assets/${assetId}`);
      setSelectedAssetDetail(data);
      setShowDetailModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit asset registration
  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/assets', {
        method: 'POST',
        body: JSON.stringify(assetForm)
      });
      setShowRegisterModal(false);
      setAssetForm({
        name: '',
        category: '',
        serialNumber: '',
        acquisitionCost: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        condition: 'Good',
        location: '',
        department: '',
        isBookable: false,
        notes: '',
        photo: ''
      });
      loadDirectory();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Asset Registration & Central Directory</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Register new equipment, track asset lifecycle states, generate QR codes, and view complete history timelines.
          </p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
          <button onClick={() => setShowRegisterModal(true)} className="glow-btn-primary">
            <Plus size={16} /> Register New Asset
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel filter-toolbar" style={{ padding: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search Asset Tag, Serial, Name, Location..."
            className="input-field"
            style={{ paddingLeft: '2.2rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="input-field"
          style={{ width: 'auto', flex: '1 1 140px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Reserved">Reserved</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Lost">Lost</option>
          <option value="Retired">Retired</option>
          <option value="Disposed">Disposed</option>
        </select>

        <select
          className="input-field"
          style={{ width: 'auto', flex: '1 1 150px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          className="input-field"
          style={{ width: 'auto', flex: '1 1 150px' }}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Asset Table Listing */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Holder / Dept</th>
                <th>Location</th>
                <th>Status</th>
                <th>QR / Timeline</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No assets found matching current filters.
                  </td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset._id}>
                    <td>
                      <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {asset.assetTag}
                      </strong>
                      {asset.isBookable && (
                        <span style={{ marginLeft: '0.35rem', fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                          Shared
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{asset.name}</td>
                    <td>{asset.category?.name}</td>
                    <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>{asset.serialNumber}</td>
                    <td>
                      {asset.currentHolder ? (
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{asset.currentHolder.name}</span>
                      ) : asset.department ? (
                        <span style={{ color: '#cbd5e1' }}>{asset.department.name}</span>
                      ) : (
                        <em style={{ color: '#64748b' }}>Unassigned</em>
                      )}
                    </td>
                    <td>{asset.location}</td>
                    <td><StatusBadge status={asset.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => { setQrAsset(asset); setShowQrModal(true); }}
                          title="Generate QR Code"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() => openAssetDetail(asset._id)}
                          style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '0.25rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          <History size={12} /> Timeline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Registration Modal */}
      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Enterprise Asset">
        <form onSubmit={handleRegisterAsset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Asset Name *</label>
            <input required type="text" className="input-field" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} placeholder="e.g. Dell XPS 15 Laptop" />
          </div>

          <div className="form-grid-2col">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category *</label>
              <select required className="input-field" value={assetForm.category} onChange={e => setAssetForm({ ...assetForm, category: e.target.value })}>
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Serial Number *</label>
              <input required type="text" className="input-field" value={assetForm.serialNumber} onChange={e => setAssetForm({ ...assetForm, serialNumber: e.target.value })} placeholder="SN-99281-X" />
            </div>
          </div>

          <div className="form-grid-2col">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Acquisition Cost ($) *</label>
              <input required type="number" className="input-field" value={assetForm.acquisitionCost} onChange={e => setAssetForm({ ...assetForm, acquisitionCost: e.target.value })} placeholder="2499" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Acquisition Date</label>
              <input type="date" className="input-field" value={assetForm.acquisitionDate} onChange={e => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })} />
            </div>
          </div>

          <div className="form-grid-2col">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Physical Location *</label>
              <input required type="text" className="input-field" value={assetForm.location} onChange={e => setAssetForm({ ...assetForm, location: e.target.value })} placeholder="Building A - Floor 2 - Bay 4" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Department</label>
              <select className="input-field" value={assetForm.department} onChange={e => setAssetForm({ ...assetForm, department: e.target.value })}>
                <option value="">-- Unassigned --</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <input type="checkbox" checked={assetForm.isBookable} onChange={e => setAssetForm({ ...assetForm, isBookable: e.target.checked })} />
              Flag as Shared / Bookable Resource (e.g. Conference Room, Shuttle Vehicle)
            </label>
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Register Asset & Auto-Generate Tag
          </button>
        </form>
      </Modal>

      {/* QR Code Generator Modal */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title={`Asset QR Tag - ${qrAsset?.assetTag}`}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
            <img src={qrAsset?.qrCodeUrl} alt="QR Tag" style={{ width: '200px', height: '200px' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{qrAsset?.assetTag}</h3>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{qrAsset?.name}</p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>Serial: {qrAsset?.serialNumber}</p>
        </div>
      </Modal>

      {/* Per-Asset Timeline Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Asset Timeline - ${selectedAssetDetail?.asset?.assetTag}`}>
        {selectedAssetDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{selectedAssetDetail.asset.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Serial: {selectedAssetDetail.asset.serialNumber} | Cost: ${selectedAssetDetail.asset.acquisitionCost}</p>
                </div>
                <StatusBadge status={selectedAssetDetail.asset.status} />
              </div>
            </div>

            {/* Allocation History */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> Allocation History Timeline
              </h4>
              {selectedAssetDetail.allocationHistory?.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No previous allocations logged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedAssetDetail.allocationHistory.map(a => (
                    <div key={a._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Holder: {a.user?.name || a.department?.name}</strong>
                        <span style={{ color: a.status === 'Active' ? '#34d399' : '#94a3b8' }}>{a.status}</span>
                      </div>
                      <p style={{ color: '#94a3b8', marginTop: '0.2rem' }}>
                        Allocated: {new Date(a.allocationDate).toLocaleDateString()} {a.expectedReturnDate ? `| Expected Return: ${new Date(a.expectedReturnDate).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance History */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={16} /> Maintenance Repair Timeline
              </h4>
              {selectedAssetDetail.maintenanceHistory?.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No repair history logged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedAssetDetail.maintenanceHistory.map(m => (
                    <div key={m._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: '#fbbf24' }}>{m.issueDescription}</strong>
                        <span>{m.status}</span>
                      </div>
                      <p style={{ color: '#94a3b8', marginTop: '0.2rem' }}>
                        Priority: {m.priority} | Cost: ${m.cost || 0} | Tech: {m.assignedTechnician || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
