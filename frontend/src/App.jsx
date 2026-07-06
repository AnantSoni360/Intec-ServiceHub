import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Assets from './pages/Assets';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import KnowledgeBase from './pages/KnowledgeBase';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommandCenterLoader from './components/CommandCenterLoader';
import Onboarding from './pages/Onboarding';
import './index.css';

// Wrapper for animated page transitions
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggingIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const finishLoading = () => {
    setIsLoggingIn(false);
  };

  // If user just logged in, show the command center loader
  if (isLoggingIn) {
    return <CommandCenterLoader onComplete={finishLoading} />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/onboarding" element={!user ? <Onboarding /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes (Shell) */}
        <Route path="/*" element={
          user ? (
            <div className="app-container">
              {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
              <Sidebar user={user} isOpen={sidebarOpen} onClose={closeSidebar} />
              <div className="main-content">
                <Navbar user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} onToggleSidebar={toggleSidebar} />
                <div className="page-content" onClick={() => sidebarOpen && closeSidebar()}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/dashboard" element={<PageWrapper><Dashboard user={user} /></PageWrapper>} />
                      <Route path="/tickets" element={<PageWrapper><Tickets user={user} /></PageWrapper>} />
                      <Route path="/knowledge" element={<PageWrapper><KnowledgeBase user={user} /></PageWrapper>} />
                      <Route path="/assets" element={<PageWrapper><Assets user={user} /></PageWrapper>} />
                      <Route path="/users" element={<PageWrapper><AdminUsers user={user} /></PageWrapper>} />
                      <Route path="/settings" element={<PageWrapper><Settings user={user} /></PageWrapper>} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
