import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Network, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = ({ onLogin }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/companies`);
        const data = await response.json();
        if (data.success) {
          setCompanies(data.data);
          if (data.data.length > 0) {
            setSelectedCompanyId(data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch companies', err);
      }
    };
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, companyId: selectedCompanyId })
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          onLogin(data.user);
          navigate('/dashboard');
        } else {
          setError(data.message);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to connect to server: ' + err.message);
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential, companyId: selectedCompanyId })
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
        navigate('/dashboard');
      } else {
        setError(data.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Google Authentication Failed.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Left Side - Animated Graphic */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-azure) 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.5 }}
        />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white' }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Network size={60} color="white" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}
          >
            Centralized IT Control
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '400px', margin: '0 auto' }}
          >
            Manage infrastructure, resolve tickets, and track assets with enterprise-grade precision.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Glass Login Form */}
      <div style={{ flex: 1, backgroundColor: 'var(--color-light-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="card"
          style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem', border: '1px solid var(--color-white)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Sign in to continue to ServiceHub</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)', display: 'block', marginBottom: '0.5rem' }}>Company Workspace</label>
              <select 
                className="form-select"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                required
              >
                <option value="" disabled>Select your company</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem' }}>Corporate Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@intec.com"
                required
                style={{ padding: '0.875rem 1rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ padding: '0.875rem 1rem', paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: 'var(--color-error)', marginBottom: '1.5rem', fontSize: '0.875rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '1rem' }}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-gray-border)' }}></div>
            <div style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>OR</div>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-gray-border)' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => setError('Google Authentication Failed.')}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Don't have a portal yet? <span onClick={() => navigate('/onboarding')} style={{ color: 'var(--color-azure)', cursor: 'pointer', fontWeight: '600' }}>Create a new Company Portal</span>
              </p>
              <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Demo Accounts Available:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral">karan.nair8@intec-demo.com (Employee)</span>
                <span className="badge badge-neutral">rohan.gowda1@intec-demo.com (Engineer)</span>
                <span className="badge badge-neutral">kavita.reddy@intec-demo.com (Admin)</span>
              </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
