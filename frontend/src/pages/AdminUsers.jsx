import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

const AdminUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    // For static data, we just update local state since there is no POST /users endpoint yet.
    // In a real app, this would be an API call.
    const createdUser = {
      id: (users.length + 1).toString(),
      ...newUser
    };
    setUsers([...users, createdUser]);
    setShowModal(false);
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
                <td>#{u.id}</td>
                <td style={{ fontWeight: '500' }}>{u.name}</td>
                <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                <td>{getRoleBadge(u.role)}</td>
                <td>{u.department}</td>
                <td>
                  <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-light-gray)' }}>Edit</button>
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
            <h2 className="card-title">Add New User</h2>
            <form onSubmit={handleCreateUser}>
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
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ backgroundColor: 'var(--color-light-gray)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
