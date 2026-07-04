import { useState } from 'react';
import { motion } from 'framer-motion';

const AssignAssetModal = ({ asset, users, onClose, onAssign }) => {
  const [selectedUser, setSelectedUser] = useState(asset.assignedTo || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(asset.id, selectedUser || null);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card" 
        style={{ width: '100%', maxWidth: '400px', margin: '2rem' }}
      >
        <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Assign Asset</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Select an employee to assign <strong>{asset.name}</strong> ({asset.serialNumber}).
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Employee</label>
            <select 
              className="form-select" 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Unassigned --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.department || 'No Dept'})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ backgroundColor: 'var(--color-light-gray)' }}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assignment</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AssignAssetModal;
