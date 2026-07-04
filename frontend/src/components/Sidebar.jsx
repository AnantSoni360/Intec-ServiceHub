import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Laptop, Users, ChevronsRight, Settings } from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Tickets', path: '/tickets', icon: <Ticket size={22} /> },
  ];

  if (role === 'Admin' || role === 'Engineer') {
    navItems.push({ name: 'Assets', path: '/assets', icon: <Laptop size={22} /> });
  } else {
    navItems.push({ name: 'My Assets', path: '/assets', icon: <Laptop size={22} /> });
  }

  if (role === 'Admin') {
    navItems.push({ name: 'Users', path: '/users', icon: <Users size={22} /> });
  }

  // Add settings at the bottom for all roles
  navItems.push({ name: 'Settings', path: '/settings', icon: <Settings size={22} /> });

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ justifyContent: 'center' }}>
        <div className="sidebar-logo">
          <div style={{ background: 'var(--color-azure)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}>Intec</div>
          <span>ServiceHub</span>
        </div>
        {/* We keep an icon visible when collapsed, but here we just hide the text via css on hover */}
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            title={item.name}
          >
            <div className="icon-container">{item.icon}</div>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-indicator">
        <ChevronsRight size={20} />
      </div>
    </div>
  );
};

export default Sidebar;
