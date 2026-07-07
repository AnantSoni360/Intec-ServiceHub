import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCircle, Download, Upload, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Step 1 Data
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 3 Data
  const [usersFile, setUsersFile] = useState(null);
  const [assetsFile, setAssetsFile] = useState(null);
  const [ticketsFile, setTicketsFile] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    // Validate inputs locally, API call deferred to Step 3
    if (!companyName || !userName || !email || !password) {
      setError('Please fill in all details.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!usersFile || !assetsFile || !ticketsFile) {
      setError('All three CSV files are mandatory.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('userName', userName);
      formData.append('email', email);
      formData.append('password', password);
      
      formData.append('users', usersFile);
      formData.append('assets', assetsFile);
      formData.append('tickets', ticketsFile);

      const res = await fetch(`${API_URL}/onboarding/register-and-upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Workspace creation failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    window.location.href = '/dashboard';
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-light-gray)', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}
      />
      
      <div style={{ width: '100%', maxWidth: '600px', zIndex: 10, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--color-azure), #8B5CF6)', boxShadow: 'var(--shadow-lg)', marginBottom: '1.5rem' }}>
            <Building2 size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-navy)', marginBottom: '1.5rem' }}>Setup Your Workspace</h2>
          
          {/* Progress Bar */}
          <div style={{ position: 'relative', marginTop: '2rem', marginBottom: '3rem' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'var(--color-gray-border)', transform: 'translateY(-50%)', zIndex: 0 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    backgroundColor: step >= s ? 'var(--color-azure)' : 'var(--color-light-gray)',
                    border: `4px solid ${step >= s ? 'var(--color-azure)' : 'var(--color-gray-border)'}`,
                    color: step >= s ? 'white' : 'var(--color-text-muted)',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {step > s ? <CheckCircle2 size={20} color="white" /> : s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card glass" style={{ padding: '3rem 2.5rem', overflow: 'hidden' }}>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.875rem' }}>{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Company Details</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Let's start by creating your company portal.</p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Company Name</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="form-input" placeholder="Acme Corp" style={{ paddingLeft: '3rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-gray-border)', paddingTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Super Admin Account</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>You will use this to manage your company portal.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Your Name</label>
                      <div style={{ position: 'relative' }}>
                        <UserCircle size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} className="form-input" placeholder="John Doe" style={{ paddingLeft: '3rem' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Email Address</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="admin@acmecorp.com" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Password</label>
                      <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}>
                  Next Step <ChevronRight size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.5rem' }} />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                    <Download size={32} color="var(--color-azure)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Download Data Templates</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                    To import your existing data, please download these CSV templates and fill them out with your company's information. <strong>This is mandatory.</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <a href={`${API_URL.replace('/api', '')}/data_templates/users.csv`} download target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--color-gray-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', transition: 'all 0.2s ease', cursor: 'pointer', textDecoration: 'none' }} className="hover:shadow-md">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Users Template</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>users.csv</span>
                    </div>
                    <Download size={20} color="var(--color-azure)" />
                  </a>
                  <a href={`${API_URL.replace('/api', '')}/data_templates/assets.csv`} download target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--color-gray-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', transition: 'all 0.2s ease', cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Assets Template</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>assets.csv</span>
                    </div>
                    <Download size={20} color="var(--color-azure)" />
                  </a>
                  <a href={`${API_URL.replace('/api', '')}/data_templates/tickets.csv`} download target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--color-gray-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)', transition: 'all 0.2s ease', cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Tickets Template</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>tickets.csv</span>
                    </div>
                    <Download size={20} color="var(--color-azure)" />
                  </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem' }}>
                  <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                    <Upload size={32} color="var(--color-azure)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Upload Your Data</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                    Upload the completed CSV templates to populate your workspace and finalize your account creation. <strong>All files are required.</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Users (users.csv) *</label>
                    <input type="file" required accept=".csv" onChange={(e) => setUsersFile(e.target.files[0])} style={{ width: '100%', padding: '0.5rem', border: '1px dashed var(--color-gray-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-light-gray)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Assets (assets.csv) *</label>
                    <input type="file" required accept=".csv" onChange={(e) => setAssetsFile(e.target.files[0])} style={{ width: '100%', padding: '0.5rem', border: '1px dashed var(--color-gray-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-light-gray)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Tickets (tickets.csv) *</label>
                    <input type="file" required accept=".csv" onChange={(e) => setTicketsFile(e.target.files[0])} style={{ width: '100%', padding: '0.5rem', border: '1px dashed var(--color-gray-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-light-gray)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem' }}>
                  <button type="submit" disabled={loading || !usersFile || !assetsFile || !ticketsFile} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', opacity: (!usersFile || !assetsFile || !ticketsFile) ? 0.5 : 1 }}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Workspace & Upload'}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ display: 'inline-flex', padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}
                >
                  <CheckCircle2 size={64} color="var(--color-success)" />
                </motion.div>
                <div>
                  <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-navy)' }}>You're all set!</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                    Your workspace is created and your data is successfully uploaded. You can now access your dashboard.
                  </p>
                </div>
                <button onClick={handleFinish} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
