import React from 'react';
import { 
  Truck,
  LayoutDashboard, 
  BarChart2, 
  Activity, 
  FileText, 
  User,
  Bell,
  ShieldCheck,
  Users
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart2 },
    { id: 'sensors', label: 'SENSORS', icon: Activity },
    { id: 'reports', label: 'REPORTS', icon: FileText },
    { id: 'supply', label: 'SUPPLY_CHAIN', icon: Truck },
    { id: 'compliance', label: 'COMPLIANCE_INTEL', icon: ShieldCheck },
    { id: 'workers', label: 'WORKER_RISK', icon: Users },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <h1 style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px' }}>ENVIROWATCH</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>TERMINAL_v4.0.1</p>
      </div>
      
      <nav className="nav-menu" style={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
        <div className="nav-link">
          <User size={18} />
          <span>SYS_ADMIN_01</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
