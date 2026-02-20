import React from "react";
import "./AdminDashboard.css";
import Facilities from "./Facilities";
import AddEvents from "./AddEvents";
import Report from "./Report";
import AddFacilities from "./AddFacilities";
import AddNotification from "./AddNotification";
import AdminChatbotFeeder from "./AdminChatbotFeeder";
import {
  IconHome,
  IconBuilding,
  IconCalendar,
  IconReport,
  IconGlobe,
  IconNotification,
} from "./icons";

import { db } from "./service/firebase";
import { collection, onSnapshot, collectionGroup } from "firebase/firestore";

const ADMIN_SESSION_KEY = "admin_auth";

// Sidebar
const Sidebar: React.FC<{ route: string }> = ({ route }) => {
  const isActive = (r: string) =>
    route === r ? "ad-nav-item active" : "ad-nav-item";

  return (
    <aside className="ad-sidebar">
      <div className="ad-brand">
        <div className="ad-logo">
          <IconGlobe size={22} stroke="#eaf2ff" />
        </div>
        <div className="ad-brand-text">
          <span className="ad-brand-top">PMFTCI</span>
          <span className="ad-brand-bottom">360</span>
        </div>
      </div>

      <nav className="ad-nav">
        <a className={isActive("#/dashboard")} href="#/dashboard">
          <span className="ad-nav-ico">
            <IconHome size={20} stroke="#eaf2ff" />
          </span>
          <span>Dashboard</span>
        </a>

        <a className={isActive("#/facilities")} href="#/facilities">
          <span className="ad-nav-ico">
            <IconBuilding size={20} stroke="#eaf2ff" />
          </span>
          <span>Facilities</span>
        </a>

        <a className={isActive("#/add-events")} href="#/add-events">
          <span className="ad-nav-ico">
            <IconCalendar size={20} stroke="#eaf2ff" />
          </span>
          <span>Add Events</span>
        </a>

        <a className={isActive("#/add-notification")} href="#/add-notification">
          <span className="ad-nav-ico">
            <IconNotification size={20} stroke="#eaf2ff" />
          </span>
          <span>Add Notification</span>
        </a>

        <a className={isActive("#/report")} href="#/report">
          <span className="ad-nav-ico">
            <IconReport size={20} stroke="#eaf2ff" />
          </span>
          <span>Report</span>
        </a>

        <a className={isActive("#/chatbot")} href="#/chatbot">
          <span className="ad-nav-ico">
            <IconGlobe size={20} stroke="#eaf2ff" />
          </span>
          <span>Chatbot KB</span>
        </a>
      </nav>
    </aside>
  );
};

// Stat Card
const Stat: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "indigo" | "blue" | "amber" | "emerald";
}> = ({ title, value, icon, variant = "indigo" }) => (
  <div className={`ad-stat ${variant}`}>
    <div className={`ad-stat-ico ${variant}`} aria-hidden>
      {icon}
    </div>
    <div className="ad-stat-body">
      <div className="ad-stat-title">{title}</div>
      <div className="ad-stat-value">{value}</div>
    </div>
  </div>
);

// Quick Action Card
const QuickAction: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  variant?: "indigo" | "blue" | "emerald" | "amber" | "violet";
}> = ({ title, desc, icon, href, variant = "indigo" }) => (
  <button
    type="button"
    className="ad-qa-item"
    onClick={() => (window.location.hash = href)}
    aria-label={title}
  >
    <div className={`ad-qa-ico ${variant}`} aria-hidden>
      {icon}
    </div>
    <div className="ad-qa-text">
      <div className="ad-qa-title">{title}</div>
      <div className="ad-qa-desc">{desc}</div>
    </div>
  </button>
);

// Donut Chart
const DonutChart: React.FC<{
  data: number[];
  colors: string[];
  size?: number;
  hole?: number;
  centerText?: { title: string; subtitle?: string };
}> = ({ data, colors, size = 220, hole = 0.62, centerText }) => {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const stops = data
    .map((v, i) => {
      const start = (acc / total) * 360;
      acc += v;
      const end = (acc / total) * 360;
      const color = colors[i % colors.length];
      return `${color} ${start}deg ${end}deg`;
    })
    .join(",");

  const outer: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: `conic-gradient(${stops})`,
    position: "relative",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  };
  const inset = (size * (1 - hole)) / 2;
  const inner: React.CSSProperties = {
    position: "absolute",
    left: inset,
    top: inset,
    width: size * hole,
    height: size * hole,
    background: "#fff",
    borderRadius: "50%",
  };
  const label: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    lineHeight: 1.1,
    color: "#111827",
  };

  return (
    <div style={outer} aria-label="Overview distribution">
      <div style={inner} aria-hidden />
      {centerText && (
        <div style={label}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {centerText.title}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {centerText.subtitle}
          </div>
        </div>
      )}
    </div>
  );
};

// Header
const HeaderBar: React.FC<{ title: string; onLogout: () => void }> = ({
  title,
  onLogout,
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <header className="ad-header">
      <h1 className="ad-title">{title}</h1>
      <div className="ad-profile-wrap" ref={ref}>
        <span className="ad-profile">
          Hi, Admin{" "}
          <button
            className="ad-avatar"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          />
        </span>
        {open && (
          <div className="ad-menu">
            <button
              className="ad-menu-item danger"
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// Admin Dashboard
const AdminDashboard: React.FC = () => {
  const [route, setRoute] = React.useState<string>(
    window.location.hash || "#/dashboard",
  );

  const [facilityCount, setFacilityCount] = React.useState(0);
  const [eventCount, setEventCount] = React.useState(0);
  const [reportCount, setReportCount] = React.useState(0);
  const [notificationCount, setNotificationCount] = React.useState(0);

  // Logout
  const logout = React.useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.hash = "#/login";
  }, []);

  // Session check
  React.useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) logout();
  }, [logout]);

  // Hash routing
  React.useEffect(() => {
    if (!window.location.hash) window.location.hash = "#/dashboard";
    const onHashChange = () => setRoute(window.location.hash || "#/dashboard");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Firestore real-time counts
  React.useEffect(() => {
    const unsubFacilities = onSnapshot(collection(db, "facilities"), (snap) =>
      setFacilityCount(snap.size),
    );
    const unsubEvents = onSnapshot(collection(db, "Events"), (snap) =>
      setEventCount(snap.size),
    );
    const unsubNotifications = onSnapshot(
      collection(db, "Notifications"),
      (snap) => setNotificationCount(snap.size),
    );
    // ✅ Track all reports across admins using collectionGroup
    const unsubReports = onSnapshot(collectionGroup(db, "reports"), (snap) =>
      setReportCount(snap.size),
    );

    return () => {
      unsubFacilities();
      unsubEvents();
      unsubNotifications();
      unsubReports();
    };
  }, []);

  const renderContent = () => {
    switch (route) {
      case "#/facilities":
        return (
          <>
            <HeaderBar title="Facilities" onLogout={logout} />
            <Facilities />
          </>
        );
      case "#/add-events":
        return (
          <>
            <HeaderBar title="Add Events" onLogout={logout} />
            <AddEvents />
          </>
        );
      case "#/add-facilities":
        return (
          <>
            <HeaderBar title="Add New Facilities" onLogout={logout} />
            <AddFacilities />
          </>
        );
      case "#/report":
        return (
          <>
            <HeaderBar title="Report" onLogout={logout} />
            <Report />
          </>
        );
      case "#/add-notification":
        return (
          <>
            <HeaderBar title="Add Notification" onLogout={logout} />
            <AddNotification />
          </>
        );
      case "#/chatbot":
        return (
          <>
            <HeaderBar title="Chatbot Knowledge Base" onLogout={logout} />
            <AdminChatbotFeeder />
          </>
        );
      default:
        return (
          <>
            <HeaderBar title="Admin Dashboard" onLogout={logout} />

            {/* Stats */}
            <section className="ad-stats">
              <Stat
                title="Facilities"
                value={facilityCount}
                icon={<IconBuilding />}
                variant="indigo"
              />
              <Stat
                title="Events"
                value={eventCount}
                icon={<IconCalendar />}
                variant="blue"
              />
              <Stat
                title="Reports"
                value={reportCount}
                icon={<IconReport />}
                variant="amber"
              />
              <Stat
                title="Notifications"
                value={notificationCount}
                icon={<IconNotification />}
                variant="emerald"
              />
            </section>

            {/* Overview Donut */}
            <section className="ad-section">
              <h2 className="ad-section-title">Overview</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 260px) 1fr",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <DonutChart
                  data={[
                    facilityCount,
                    eventCount,
                    reportCount,
                    notificationCount,
                  ]}
                  colors={["#4f46e5", "#2563eb", "#f59e0b", "#10b981"]}
                  size={220}
                  centerText={{
                    title: String(
                      facilityCount +
                        eventCount +
                        reportCount +
                        notificationCount,
                    ),
                    subtitle: "Total Items",
                  }}
                />
                <div style={{ display: "grid", gap: 8 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: "#4f46e5",
                        borderRadius: 3,
                      }}
                    />
                    <span style={{ color: "#111827", fontWeight: 600 }}>
                      Facilities
                    </span>
                    <span style={{ color: "#6b7280" }}>({facilityCount})</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: "#2563eb",
                        borderRadius: 3,
                      }}
                    />
                    <span style={{ color: "#111827", fontWeight: 600 }}>
                      Events
                    </span>
                    <span style={{ color: "#6b7280" }}>({eventCount})</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: "#f59e0b",
                        borderRadius: 3,
                      }}
                    />
                    <span style={{ color: "#111827", fontWeight: 600 }}>
                      Reports
                    </span>
                    <span style={{ color: "#6b7280" }}>({reportCount})</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: "#10b981",
                        borderRadius: 3,
                      }}
                    />
                    <span style={{ color: "#111827", fontWeight: 600 }}>
                      Notifications
                    </span>
                    <span style={{ color: "#6b7280" }}>
                      ({notificationCount})
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="ad-section">
              <h2 className="ad-section-title">Quick Actions</h2>
              <div className="ad-qa-grid">
                <QuickAction
                  title="Add Facility"
                  desc="Register new campus facilities"
                  icon={<IconBuilding stroke="#fff" />}
                  href="#/facilities"
                  variant="emerald"
                />
                <QuickAction
                  title="Create Events"
                  desc="Publish upcoming events"
                  icon={<IconCalendar stroke="#fff" />}
                  href="#/add-events"
                  variant="blue"
                />
                <QuickAction
                  title="View Reports"
                  desc="Check feedback and issues"
                  icon={<IconReport stroke="#fff" />}
                  href="#/report"
                  variant="amber"
                />
                <QuickAction
                  title="Add Notification"
                  desc="Create new system notification"
                  icon={<IconNotification stroke="#fff" />}
                  href="#/add-notification"
                  variant="violet"
                />
                <QuickAction
                  title="Chatbot KB"
                  desc="Add & edit chatbot knowledge base"
                  icon={<IconGlobe stroke="#fff" />}
                  href="#/chatbot"
                  variant="indigo"
                />
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