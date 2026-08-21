import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { Modal } from '../components/Modal';
import { Building2, Layers, Users, Plus, ShieldCheck, Edit, CheckCircle, XCircle } from 'lucide-react';

export const OrgSetup = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('departments');

  // Data states
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', head: '', description: '' });

  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '', warrantyPeriodMonths: 12, maintenanceIntervalDays: 90 });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleForm, setRoleForm] = useState({ role: 'Employee', department: '' });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [depts, cats, users] = await Promise.all([
        fetchAPI('/departments'),
        fetchAPI('/categories'),
        fetchAPI('/users')
      ]);
      setDepartments(depts);
      setCategories(cats);
      setEmployees(users);
    } catch (err) {
      console.error('Org Setup load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Department submit
  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/departments', {
        method: 'POST',
        body: JSON.stringify(deptForm)
      });
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', head: '', description: '' });
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Category submit
  const handleSaveCat = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/categories', {
        method: 'POST',
        body: JSON.stringify(catForm)
      });
      setShowCatModal(false);
      setCatForm({ name: '', code: '', description: '', warrantyPeriodMonths: 12, maintenanceIntervalDays: 90 });
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Role Promotion submit (Admin ONLY constraint)
  const handlePromoteRole = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI(`/users/${selectedUser._id}/role`, {
        method: 'PUT',
        body: JSON.stringify(roleForm)
      });
      setShowRoleModal(false);
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
        <h2>Access Denied</h2>
        <p style={{ marginTop: '0.5rem', color: '#cbd5e1' }}>Organization Master Setup requires Administrator privileges.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Organization Setup & Master Data</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Maintain baseline departments, asset categories, and control role-based employee access.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('departments')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'departments' ? '#38bdf8' : 'transparent',
            background: activeTab === 'departments' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'departments' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <Building2 size={16} /> Tab A: Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'categories' ? '#38bdf8' : 'transparent',
            background: activeTab === 'categories' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'categories' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <Layers size={16} /> Tab B: Asset Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className="glow-btn-secondary"
          style={{
            borderColor: activeTab === 'directory' ? '#38bdf8' : 'transparent',
            background: activeTab === 'directory' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'directory' ? '#38bdf8' : '#94a3b8'
          }}
        >
          <Users size={16} /> Tab C: Employee Directory & Role Promotion ({employees.length})
        </button>
      </div>

      {/* TAB A: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Department Directory & Hierarchy</h3>
            <button onClick={() => setShowDeptModal(true)} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}>
              <Plus size={16} /> Add Department
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dept Code</th>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{d.code}</strong></td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>{d.head ? `${d.head.name} (${d.head.role})` : <em style={{ color: '#64748b' }}>Unassigned</em>}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{d.description || 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${d.status === 'Active' ? 'status-Available' : 'status-Retired'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB B: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Asset Classification Categories</h3>
            <button onClick={() => setShowCatModal(true)} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}>
              <Plus size={16} /> Create Category
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Warranty Period</th>
                  <th>Maint. Interval</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c._id}>
                    <td><strong style={{ color: '#8b5cf6' }}>{c.code}</strong></td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.description}</td>
                    <td>{c.warrantyPeriodMonths} Months</td>
                    <td>Every {c.maintenanceIntervalDays} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: EMPLOYEE DIRECTORY & ROLE PROMOTION */}
      {activeTab === 'directory' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Employee Master Directory</h3>
              <p style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px' }}>
                Note: Admin promotes employees to Asset Manager or Dept Head here.
              </p>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Work Email</th>
                  <th>Department</th>
                  <th>Current Role</th>
                  <th>Account Status</th>
                  <th>Role Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td style={{ color: '#94a3b8' }}>{emp.email}</td>
                    <td>{emp.department?.name || 'Unassigned'}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: emp.role === 'Admin' ? 'rgba(56, 189, 248, 0.15)' : emp.role === 'Asset Manager' ? 'rgba(16, 185, 129, 0.15)' : emp.role === 'Department Head' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: emp.role === 'Admin' ? '#38bdf8' : emp.role === 'Asset Manager' ? '#34d399' : emp.role === 'Department Head' ? '#c084fc' : '#cbd5e1'
                      }}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${emp.status === 'Active' ? 'status-Available' : 'status-Retired'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUser(emp);
                          setRoleForm({ role: emp.role, department: emp.department?._id || '' });
                          setShowRoleModal(true);
                        }}
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Promote / Assign Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      <Modal isOpen={showDeptModal} onClose={() => setShowDeptModal(false)} title="Create New Department">
        <form onSubmit={handleSaveDept} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Department Name</label>
            <input required type="text" className="input-field" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="e.g. Legal & Compliance" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Department Code (Short Code)</label>
            <input required type="text" className="input-field" value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="e.g. LGL" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Assign Department Head</label>
            <select className="input-field" value={deptForm.head} onChange={e => setDeptForm({ ...deptForm, head: e.target.value })}>
              <option value="">-- Select Department Head --</option>
              {employees.map(e => (
                <option key={e._id} value={e._id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
            <textarea className="input-field" rows={3} value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Responsibilities of this department..." />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Save Department</button>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Create Asset Category">
        <form onSubmit={handleSaveCat} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category Name</label>
            <input required type="text" className="input-field" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Test Equipment & Lab Gear" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category Code</label>
            <input required type="text" className="input-field" value={catForm.code} onChange={e => setCatForm({ ...catForm, code: e.target.value })} placeholder="e.g. LAB" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Warranty (Months)</label>
              <input type="number" className="input-field" value={catForm.warrantyPeriodMonths} onChange={e => setCatForm({ ...catForm, warrantyPeriodMonths: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Maintenance (Days)</label>
              <input type="number" className="input-field" value={catForm.maintenanceIntervalDays} onChange={e => setCatForm({ ...catForm, maintenanceIntervalDays: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
            <textarea className="input-field" rows={2} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Save Category</button>
        </form>
      </Modal>

      {/* Role Promotion Modal (Admin ONLY) */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={`Promote Role for ${selectedUser?.name}`}>
        <form onSubmit={handlePromoteRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Target User: <strong style={{ color: '#fff' }}>{selectedUser?.email}</strong>
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select Role</label>
            <select className="input-field" value={roleForm.role} onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}>
              <option value="Employee">Employee (Default)</option>
              <option value="Department Head">Department Head</option>
              <option value="Asset Manager">Asset Manager</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Assign Department</label>
            <select className="input-field" value={roleForm.department} onChange={e => setRoleForm({ ...roleForm, department: e.target.value })}>
              <option value="">-- No Department --</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Update System Privileges
          </button>
        </form>
      </Modal>
    </div>
  );
};
