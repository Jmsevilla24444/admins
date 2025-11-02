import React from 'react';
import './AdminDashboard.css';
import Facilities from './Facilities';
import AddEvents from './AddEvents';
import Report from './Report';
import { IconHome, IconBuilding, IconCalendar, IconReport, IconGlobe } from './icons';
import AddFacilities from './AddFacilities';

const Sidebar: React.FC<{ route: string }> = ({ route }) => {
  const isActive = (r: string) => (route === r ? 'ad-nav-item active' : 'ad-nav-item');
  return (
    <aside className="ad-sidebar">
      <div className="ad-brand">
        <div className="ad-logo"><IconGlobe size={22} stroke="#eaf2ff" /></div>
        <div className="ad-brand-text">
          <span className="ad-brand-top">PMFTCI</span>
          <span className="ad-brand-bottom">360</span>
        </div>
      </div>
      <nav className="ad-nav">
        <a className={isActive('#/dashboard')} href="#/dashboard">
          <span className="ad-nav-ico"><IconHome size={20} stroke="#eaf2ff" /></span>
          <span>Dashboard</span>
        </a>
        <a className={isActive('#/facilities')} href="#/facilities">
          <span className="ad-nav-ico"><IconBuilding size={20} stroke="#eaf2ff" /></span>
          <span>Facilities</span>
        </a>
        <a className={isActive('#/add-events')} href="#/add-events">
          <span className="ad-nav-ico"><IconCalendar size={20} stroke="#eaf2ff" /></span>
          <span>Add Events</span>
        </a>
        <a className={isActive('#/report')} href="#/report">
          <span className="ad-nav-ico"><IconReport size={20} stroke="#eaf2ff" /></span>
          <span>Report</span>
        </a>
      </nav>
    </aside>
  );
};

const Stat: React.FC<{ title: string; value: string; icon: React.ReactNode; variant?: 'indigo'|'blue'|'amber' }> = ({ title, value, icon, variant = 'indigo' }) => (
  <div className={`ad-stat ${variant}`}>
    <div className={`ad-stat-ico ${variant}`} aria-hidden>{icon}</div>
    <div className="ad-stat-body">
      <div className="ad-stat-title">{title}</div>
      <div className="ad-stat-value">{value}</div>
    </div>
  </div>
);

const QuickAction: React.FC<{ title: string; desc: string; icon: React.ReactNode; href: string; variant?: 'indigo'|'blue'|'emerald'|'amber'|'violet' }> = ({ title, desc, icon, href, variant = 'indigo' }) => (
  <button
    type="button"
    className="ad-qa-item"
    onClick={() => (window.location.hash = href)}
    aria-label={title}
  >
    <div className={`ad-qa-ico ${variant}`} aria-hidden>{icon}</div>
    <div className="ad-qa-text">
      <div className="ad-qa-title">{title}</div>
      <div className="ad-qa-desc">{desc}</div>
    </div>
  </button>
);

// Lightweight donut chart using CSS conic-gradient (no external deps)
const DonutChart: React.FC<{
  data: number[];
  colors: string[];
  size?: number;
  hole?: number;
  centerText?: { title: string; subtitle?: string };
}> = ({ data, colors, size = 220, hole = 0.62, centerText }) => {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const stops = data.map((v, i) => {
    const start = (acc / total) * 360;
    acc += v;
    const end = (acc / total) * 360;
    const color = colors[i % colors.length];
    return `${color} ${start}deg ${end}deg`;
  }).join(', ');

  const outer: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `conic-gradient(${stops})`,
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,.08)'
  };
  const inset = size * (1 - hole) / 2;
  const inner: React.CSSProperties = {
    position: 'absolute',
    left: inset,
    top: inset,
    width: size * hole,
    height: size * hole,
    background: '#fff',
    borderRadius: '50%'
  };
  const label: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    lineHeight: 1.1,
    color: '#111827'
  };

  return (
    <div style={outer} aria-label="Overview distribution">
      <div style={inner} aria-hidden />
      {centerText && (
        <div style={label}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{centerText.title}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{centerText.subtitle}</div>
        </div>
      )}
    </div>
  );
};

const HeaderBar: React.FC<{ title: string }> = ({ title }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <header className="ad-header">
      <h1 className="ad-title">{title}</h1>
      <div className="ad-profile-wrap" ref={ref}>
        <span className="ad-profile">Hi, Admin <button className="ad-avatar" aria-label="Open menu" onClick={() => setOpen((v) => !v)} /></span>
        {open && (
          <div className="ad-menu">
            <button className="ad-menu-item danger" type="button" onClick={() => { window.location.hash = '#/login'; setOpen(false); }}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

const AdminDashboard: React.FC = () => {
  const [route, setRoute] = React.useState<string>(window.location.hash || '#/dashboard');

  React.useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/dashboard';
    const onHashChange = () => setRoute(window.location.hash || '#/dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const renderContent = () => {
    switch (route) {
      case '#/facilities':
        return (
          <>
            <HeaderBar title="Facilities" />
            <Facilities />
          </>
        );
      case '#/add-events':
        return (
          <>
            <HeaderBar title="Add Events" />
            <AddEvents />
          </>
        );
      case '#/add-facilities':
        return (
          <>
            <HeaderBar title="Add New Facilities" />
            <AddFacilities />
          </>
        );
      case '#/report':
        return (
          <>
            <HeaderBar title="Report" />
            <Report />
          </>
        );
      default:
        return (
          <>
            <HeaderBar title="Admin Dashboard" />

            <section className="ad-stats">
              <Stat title="Facilities" value="18" icon={<IconBuilding />} variant="indigo" />
              <Stat title="Events" value="8" icon={<IconCalendar />} variant="blue" />
              <Stat title="Reports" value="6" icon={<IconReport />} variant="amber" />
            </section>

            <section className="ad-section">
              <h2 className="ad-section-title">Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: 16, alignItems: 'center' }}>
                <DonutChart
                  data={[18, 8, 6]}
                  colors={["#4f46e5", "#2563eb", "#f59e0b"]}
                  size={220}
                  centerText={{ title: String(18 + 8 + 6), subtitle: 'Total Items' }}
                />
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 12, height: 12, background: '#4f46e5', borderRadius: 3 }} />
                    <span style={{ color: '#111827', fontWeight: 600 }}>Facilities</span>
                    <span style={{ color: '#6b7280' }}>(18)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 12, height: 12, background: '#2563eb', borderRadius: 3 }} />
                    <span style={{ color: '#111827', fontWeight: 600 }}>Events</span>
                    <span style={{ color: '#6b7280' }}>(8)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 3 }} />
                    <span style={{ color: '#111827', fontWeight: 600 }}>Reports</span>
                    <span style={{ color: '#6b7280' }}>(6)</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="ad-section">
              <h2 className="ad-section-title">Quick Actions</h2>
              <div className="ad-qa-grid">
                <QuickAction title="Add Facility" desc="Register new campus facilities" icon={<IconBuilding stroke="#fff" />} href="#/facilities" variant="emerald" />
                <QuickAction title="Create Events" desc="Publish upcoming events" icon={<IconCalendar stroke="#fff" />} href="#/add-events" variant="blue" />
                <QuickAction title="List of Facilities" desc="View all campus facilities" icon={<IconBuilding stroke="#fff" />} href="#/facilities" variant="violet" />
                <QuickAction title="View Reports" desc="Check feedback and issues" icon={<IconReport stroke="#fff" />} href="#/report" variant="amber" />
              </div>
            </section>

            <section className="ad-section">
              <h2 className="ad-section-title">Recent Activities</h2>
              <div className="ad-activity">
                <div className="ad-activity-item">Create event "Foundation day" - 10:29am</div>
                <div className="ad-activity-item">Create account "superuser01" - 9:08am</div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="ad-layout">
      <Sidebar route={route} />
      <main className="ad-main">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;
