import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LandingHome } from './pages/LandingHome';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { OrgSetup } from './pages/OrgSetup';
import { AssetDirectory } from './pages/AssetDirectory';
import { AllocationTransfer } from './pages/AllocationTransfer';
import { ResourceBooking } from './pages/ResourceBooking';
import { MaintenanceManagement } from './pages/MaintenanceManagement';
import { AssetAudit } from './pages/AssetAudit';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { ActivityNotifications } from './pages/ActivityNotifications';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#38bdf8' }}>
        <h2>Loading AssetFlow ERP...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/org-setup" element={<OrgSetup />} />
            <Route path="/assets" element={<AssetDirectory />} />
            <Route path="/allocations" element={<AllocationTransfer />} />
            <Route path="/bookings" element={<ResourceBooking />} />
            <Route path="/maintenance" element={<MaintenanceManagement />} />
            <Route path="/audit" element={<AssetAudit />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/activity" element={<ActivityNotifications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingHome />} />
      <Route path="/home" element={<LandingHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard/*" element={<ProtectedLayout />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default App;
