import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Network, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('john.doe@intec.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
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
        body: JSON.stringify({ token: credentialResponse.credential })
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
            <button 
              type="button" 
              className="btn btn-outline" 
              disabled
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--color-gray-border)', color: 'var(--color-text-muted)', backgroundColor: 'rgba(0,0,0,0.02)', cursor: 'not-allowed' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" style={{ filter: 'grayscale(100%)', opacity: 0.5 }}>
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Continue with Google (Coming Soon)
            </button>
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Demo Accounts Available:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral">john.doe@... (Employee)</span>
              <span className="badge badge-neutral">jane.smith@... (Engineer)</span>
              <span className="badge badge-neutral">admin@... (Admin)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
