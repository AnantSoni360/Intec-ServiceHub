import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Key } from 'lucide-react';

const AdminUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Employee', department: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/auth/users/${editUserId}`
        : `${import.meta.env.VITE_API_URL}/auth/users`;
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });
      
      if (res.ok) {
        await fetchUsers();
        handleCloseModal();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save user');
    }
  };

  const handleEditClick = (u) => {
    setNewUser({ name: u.name, email: u.email, role: u.role, department: u.department });
    setEditUserId(u.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        await fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Are you sure you want to reset this user's password to the default?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("Password reset successfully.");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditUserId(null);
    setNewUser({ name: '', email: '', role: 'Employee', department: '' });
  };

  if (user.role !== 'Admin') {
    return <div>Access Denied. Admins only.</div>;
  }

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Admin': return <span className="badge badge-red">{role}</span>;
      case 'Engineer': return <span className="badge badge-orange">{role}</span>;
      case 'Employee': return <span className="badge badge-green">{role}</span>;
      default: return <span className="badge">{role}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>#{u.id.substring(0, 8)}...</td>
                <td style={{ fontWeight: '500' }}>{u.name}</td>
                <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                <td>{getRoleBadge(u.role)}</td>
                <td>{u.department}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" onClick={() => handleEditClick(u)} title="Edit User" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-light-gray)' }}><Edit2 size={14} /></button>
                  <button className="btn" onClick={() => handleResetPassword(u.id)} title="Reset Password" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-light-gray)' }}><Key size={14} /></button>
                  <button className="btn" onClick={() => handleDeleteClick(u.id)} title="Delete User" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="card-title">{isEditing ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="e.g. Alice Johnson" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="e.g. alice@intec.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option>Employee</option>
                  <option>Engineer</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" required value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} placeholder="e.g. Human Resources" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={handleCloseModal} style={{ backgroundColor: 'var(--color-light-gray)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
