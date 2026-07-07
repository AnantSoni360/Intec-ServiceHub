import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

const SecretAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'anantsoni@gmail.com' && password === '[REDACTED]') {
      setIsAuthenticated(true);
      fetchCompanies();
    } else {
      alert('Invalid credentials');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/companies`);
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch companies');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to completely delete ${name} and ALL its data?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/companies/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          alert('Deleted successfully');
          fetchCompanies();
        } else {
          alert('Failed to delete');
        }
      } catch (err) {
        alert('Error deleting');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#1f2937' }}>Secret Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button 
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '2rem', fontWeight: 'bold' }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
        
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', color: '#1f2937' }}>Delete Workspaces</h1>
        
        {companies.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No companies found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {companies.map(c => (
              <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{c.name}</span>
                <button 
                  onClick={() => handleDelete(c._id, c.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  <Trash2 size={16} /> Delete Completely
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretAdmin;
