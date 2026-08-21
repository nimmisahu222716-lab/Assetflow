import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Boxes,
  ShieldCheck,
  Repeat,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  FileCheck,
  Menu,
  X
} from 'lucide-react';

export const LandingHome = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? 'radial-gradient(circle at 50% 0%, #1e293b 0%, #090d16 100%)' : '#f8fafc',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Landing Navigation Header */}
      <header className="landing-header">
        {/* LEFT CORNER: AssetFlow ERP Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* 1. AssetFlow ERP Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              flexShrink: 0,
              position: 'relative'
            }}>
              <Boxes size={24} color="#ffffff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #0284c7, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap'
            }}>
              AssetFlow ERP
            </span>
          </div>

          {/* 2. Desktop Navigation: Features, Workflows, Enterprise Roles */}
          <nav className="landing-nav-desktop">
            <button
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection('workflows')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Workflows
            </button>

            <button
              onClick={() => scrollToSection('roles')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Enterprise Roles
            </button>
          </nav>
        </div>

        {/* RIGHT CORNER: Desktop Action Links (Sign In, Sign Up, Launch Dashboard) & Dark/Light Mode */}
        <div className="landing-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link to="/login" className="glow-btn-secondary" style={{ fontSize: '0.85rem', textDecoration: 'none', padding: '0.55rem 1.15rem', whiteSpace: 'nowrap' }}>
            Sign In
          </Link>
          <Link to="/signup" className="glow-btn-secondary" style={{ fontSize: '0.85rem', textDecoration: 'none', padding: '0.55rem 1.15rem', whiteSpace: 'nowrap' }}>
            Sign Up
          </Link>
          <button onClick={() => navigate('/dashboard')} className="glow-btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem', whiteSpace: 'nowrap' }}>
            Launch ERP Dashboard <ArrowRight size={16} />
          </button>

          {/* Dark/Light Mode Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: '0.35rem',
              position: 'relative',
              padding: 0
            }}
          >
            {theme === 'dark' ? (
              <Sun size={20} color="#f59e0b" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ) : (
              <Moon size={20} color="#6366f1" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            )}
          </button>
        </div>

        {/* MOBILE CONTROLS: Theme toggle + Hamburger Menu Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={toggleTheme}
            className="landing-mobile-toggle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="landing-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="landing-mobile-drawer">
          <button
            onClick={() => scrollToSection('features')}
            className="landing-mobile-nav-link"
          >
            Features <ArrowRight size={16} color="var(--text-muted)" />
          </button>

          <button
            onClick={() => scrollToSection('workflows')}
            className="landing-mobile-nav-link"
          >
            Workflows <ArrowRight size={16} color="var(--text-muted)" />
          </button>

          <button
            onClick={() => scrollToSection('roles')}
            className="landing-mobile-nav-link"
          >
            Enterprise Roles <ArrowRight size={16} color="var(--text-muted)" />
          </button>

          <div className="landing-mobile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="glow-btn-secondary"
              style={{ width: '100%', textDecoration: 'none', textAlign: 'center', padding: '0.75rem' }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="glow-btn-secondary"
              style={{ width: '100%', textDecoration: 'none', textAlign: 'center', padding: '0.75rem' }}
            >
              Employee Signup
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
              className="glow-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              Launch ERP Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section style={{ padding: '5rem 2rem 4rem 2rem', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={14} /> Next-Generation Enterprise Asset & Resource ERP
        </div>

        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem'
        }}>
          Master Asset Lifecycles & Resource Bookings with <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero Overlaps</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '780px',
          margin: '0 auto 2.5rem auto',
          lineHeight: '1.6'
        }}>
          Prevent double-allocations, automate maintenance approvals, enforce time-slot booking validation, run audit verification cycles, and surface operational intelligence—all in one unified platform.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} className="glow-btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Open ERP Dashboard <ArrowRight size={18} />
          </button>
          <Link to="/login" className="glow-btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', textDecoration: 'none' }}>
            Sign In
          </Link>
          <Link to="/signup" className="glow-btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', textDecoration: 'none' }}>
            Employee Signup
          </Link>
        </div>

        {/* Hero Interactive ERP Snapshot Card */}
        <div className="glass-panel" style={{
          marginTop: '3.5rem',
          padding: '2rem',
          textAlign: 'left',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-glow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live System Snapshot</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Real-Time Operational Fleet Metrics</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '100%' }}>
              <span className="status-pill status-Available">Available: 34</span>
              <span className="status-pill status-Allocated">Allocated: 89</span>
              <span className="status-pill status-Under-Maintenance">Maintenance: 4</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Conflict Block Rate</span>
                <ShieldCheck size={16} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.3rem', color: '#10b981' }}>100%</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Zero duplicate holdings allowed</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Booking Overlaps</span>
                <CalendarDays size={16} color="#38bdf8" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.3rem', color: '#38bdf8' }}>0 Overlaps</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Time-slot collision engine</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Repair Workflow</span>
                <Wrench size={16} color="#f59e0b" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.3rem', color: '#f59e0b' }}>Auto-Flipped</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Under Maintenance state sync</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Audit Discrepancies</span>
                <ClipboardCheck size={16} color="#8b5cf6" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.3rem', color: '#8b5cf6' }}>Auto-Reported</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cycle lock updates missing items</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Engineered for Enterprise Operational Excellence</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
            Everything organization departments need to track equipment, shared resources, and maintenance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Feature 1 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', marginBottom: '1.25rem', position: 'relative' }}>
              <Repeat size={22} color="#38bdf8" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Double-Allocation Prevention</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              System checks current asset state before assignment. If an asset is currently held by someone else, allocation is blocked with full holder context and a seamless Transfer Request prompt.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', marginBottom: '1.25rem', position: 'relative' }}>
              <CalendarDays size={22} color="#8b5cf6" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Time-Slot Overlap Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Book shared conference rooms, EV shuttles, and lab test devices by specific time slots. Our overlap engine automatically detects collisions and prevents double bookings.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', marginBottom: '1.25rem', position: 'relative' }}>
              <Wrench size={22} color="#f59e0b" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Approval Repair Workflows</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Route repair requests through manager approval before work begins. Approving a request automatically flips the asset status to <em>Under Maintenance</em> and back to <em>Available</em> upon resolution.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', marginBottom: '1.25rem', position: 'relative' }}>
              <ClipboardCheck size={22} color="#10b981" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Audit Verification Cycles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Run scheduled audit verification runs by department or location. Auditors check items as Verified, Missing, or Damaged, generating automated discrepancy reports.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', marginBottom: '1.25rem', position: 'relative' }}>
              <BarChart3 size={22} color="#ec4899" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Operational Analytics & Heatmaps</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Surface asset utilization trends, category maintenance frequencies, department allocation summaries, and peak resource booking time heatmaps with CSV/PDF exports.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel glass-panel-interactive" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', marginBottom: '1.25rem', position: 'relative' }}>
              <ShieldCheck size={22} color="#38bdf8" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Strict Role-Based Access Control</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Secure account creation policy. All signups register as Employee by default. Admins elevate Department Heads and Asset Managers directly from the Employee Directory.
            </p>
          </div>
        </div>
      </section>

      {/* END-TO-END WORKFLOWS SECTION */}
      <section id="workflows" style={{ padding: '4rem 2rem', background: 'rgba(0,0,0,0.06)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Lifecycle Operations</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.3rem' }}>Automated System Workflows</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
              How AssetFlow handles asset transitions from registration to retirement.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.75rem' }}>
                <GitPullRequest size={18} /> Asset Allocation & Transfer Flow
              </div>
              <ol style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.7' }}>
                <li>Asset enters system in <strong>Available</strong> state.</li>
                <li>Allocated to employee/dept with Expected Return Date.</li>
                <li>If duplicate allocation attempted, system blocks action & offers Transfer Request.</li>
                <li>Transfer request approved by Manager → Asset reallocated automatically.</li>
                <li>On Return check-in, asset reverts to <strong>Available</strong>.</li>
              </ol>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Wrench size={18} /> Repair & Maintenance Workflow
              </div>
              <ol style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.7' }}>
                <li>Employee/Holder raises repair request with priority.</li>
                <li>Asset Manager approves request → Asset status flips to <strong>Under Maintenance</strong>.</li>
                <li>Technician assigned → Repair set to In Progress.</li>
                <li>Maintenance resolved with diagnostic notes & costs.</li>
                <li>Asset status automatically flips back to <strong>Available</strong>.</li>
              </ol>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginBottom: '0.75rem' }}>
                <FileCheck size={18} /> Audit Verification Cycle Workflow
              </div>
              <ol style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.7' }}>
                <li>Admin sets Audit Cycle title, scope (Dept/Location), and dates.</li>
                <li>Assigned Auditors check items as Verified, Missing, or Damaged.</li>
                <li>System auto-generates live discrepancy report.</li>
                <li>Lock Audit Cycle → locks cycle permanently.</li>
                <li>Missing items automatically updated to <strong>Lost</strong> status.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE ROLES SHOWCASE */}
      <section id="roles" style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Tailored Role-Based Workflows</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
              Every organizational role receives a custom operational perspective.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #38bdf8' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>ROLE 1</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0' }}>Super Admin</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', lineHeight: '1.6' }}>
                <li>Department & Category master setup</li>
                <li>Employee role promotion tool</li>
                <li>Create audit cycles & assign auditors</li>
                <li>System-wide logs & analytics</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>ROLE 2</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0' }}>Asset Manager</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', lineHeight: '1.6' }}>
                <li>Register & tag new assets</li>
                <li>Allocate assets & process returns</li>
                <li>Approve transfer requests</li>
                <li>Approve & resolve maintenance</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6' }}>ROLE 3</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0' }}>Department Head</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', lineHeight: '1.6' }}>
                <li>View department allocated assets</li>
                <li>Approve intra-dept transfers</li>
                <li>Book shared assets for department</li>
                <li>Review department usage reports</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>ROLE 4</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0' }}>Employee</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', lineHeight: '1.6' }}>
                <li>View personal allocated assets</li>
                <li>Book shared resources by time slot</li>
                <li>Raise asset repair requests</li>
                <li>Initiate asset transfer requests</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Boxes size={20} color="#38bdf8" />
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>AssetFlow ERP</span>
        </div>
        <p>Enterprise Asset & Resource Management System. Built with MERN Stack Architecture.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}>© 2026 AssetFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
