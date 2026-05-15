import React from 'react';
import { 
  Truck,
  LayoutDashboard, 
  BarChart2, 
  Activity, 
  FileText, 
  User,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, isCollapsed, onToggleCollapse }) => {
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
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        {!isCollapsed && (
          <>
            <h1 style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px' }}>ENVIROWATCH</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>TERMINAL_v4.0.1</p>
          </>
        )}
        {isCollapsed && (
          <h1 style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}>EW</h1>
        )}
      </div>
      
      <nav className="nav-menu" style={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={18} />
            {!isCollapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
        <div className="nav-link" title={isCollapsed ? 'SYS_ADMIN_01' : ''}>
          <User size={18} />
          {!isCollapsed && <span>SYS_ADMIN_01</span>}
        </div>
        
        <button 
          className="collapse-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
