import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, Moon, Sun, Menu } from 'lucide-react';

const Navbar = ({ user, onLogout, theme, toggleTheme, onToggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate initials for avatar
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-btn" onClick={onToggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--color-navy)', cursor: 'pointer', display: 'none' }}>
          <Menu size={24} />
        </button>
        {/* Search */}
        <div className="search-bar">
          <Search size={18} color="var(--color-text-muted)" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        <button className="btn" onClick={toggleTheme} style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="btn" style={{ padding: '0.5rem', color: 'var(--color-text-muted)', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', backgroundColor: 'var(--color-error)', borderRadius: '50%', border: '2px solid white' }}></span>
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'right', display: 'none' }}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-navy)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.role}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-azure), #8B5CF6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
              {initials}
            </div>
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '120%', right: '0', width: '200px', borderRadius: '12px', padding: '0.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 100, backgroundColor: 'var(--color-white)', border: '1px solid var(--color-gray-border)' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-gray-border)', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-navy)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.email}</div>
              </div>
              <Link to="/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-text-main)', padding: '0.5rem 1rem', textDecoration: 'none' }} onClick={() => setShowDropdown(false)}>
                <Settings size={16} /> Settings
              </Link>
              <button onClick={onLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-error)', padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
