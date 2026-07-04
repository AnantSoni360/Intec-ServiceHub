import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Lock, Save, CheckCircle } from 'lucide-react';

const Settings = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg(data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your personal account details and security preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Account Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-gray-border)' }}>
            <User size={24} color="var(--color-azure)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: 0 }}>Profile Information</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-light-gray)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-border)', color: 'var(--color-text-muted)' }}>
                <User size={18} style={{ marginRight: '0.5rem' }} />
                {user?.name || 'Unknown User'}
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-light-gray)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-border)', color: 'var(--color-text-muted)' }}>
                <Mail size={18} style={{ marginRight: '0.5rem' }} />
                {user?.email || 'user@example.com'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Account Role</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-light-gray)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-border)', color: 'var(--color-text-muted)' }}>
                <Shield size={18} style={{ marginRight: '0.5rem' }} />
                <span className={`badge ${user?.role === 'Admin' ? 'badge-error' : 'badge-neutral'}`} style={{ marginLeft: '-4px' }}>
                  {user?.role || 'Employee'}
                </span>
              </div>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Note: Profile details are managed by your IT administrator. If you need to change your name or email, please submit a ticket.
          </p>
        </motion.div>

        {/* Change Password Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-gray-border)' }}>
            <Lock size={24} color="var(--color-warning)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: 0 }}>Security & Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} style={{ maxWidth: '500px' }}>
            
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle size={18} /> {successMsg}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Current Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter current password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>New Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter new password (min 8 chars)" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Re-enter new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Update Password
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Settings;
