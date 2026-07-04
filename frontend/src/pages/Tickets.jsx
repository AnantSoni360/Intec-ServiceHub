import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, Edit, UserPlus, FileText, CheckCircle2 } from 'lucide-react';
import TicketSidePanel from '../components/TicketSidePanel';

const Tickets = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filters & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Modals & Panels
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Medium', category: 'Other' });
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchTickets();
    if (user.role === 'Admin' || user.role === 'Engineer') {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    let result = Array.isArray(tickets) ? [...tickets] : [];

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (searchQuery.trim() !== '') {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => {
        const titleMatch = t.title ? String(t.title).toLowerCase().includes(lowerQ) : false;
        const formattedId = `tkt-${t.id.substring(t.id.length - 6).toLowerCase()}`;
        const idMatch = formattedId.includes(lowerQ) || (t.id ? String(t.id).toLowerCase().includes(lowerQ) : false);
        const descMatch = t.description ? String(t.description).toLowerCase().includes(lowerQ) : false;
        
        let userMatch = false;
        if (users.length > 0) {
          const requester = users.find(u => u.id === t.requestedBy);
          const assignee = users.find(u => u.id === t.assignedTo);
          if (requester && String(requester.name).toLowerCase().includes(lowerQ)) userMatch = true;
          if (assignee && String(assignee.name).toLowerCase().includes(lowerQ)) userMatch = true;
        }

        return titleMatch || idMatch || descMatch || userMatch;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'Name (A-Z)') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'Name (Z-A)') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });

    if (sortBy === 'Oldest') {
      result.reverse();
    }

    setFilteredTickets(result);
    setCurrentPage(1);
    setSelectedTicketIds([]); // Reset selection on filter change
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy, tickets, users]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchTickets = async () => {
    try {
      const endpoint = (user.role === 'Admin' || user.role === 'Engineer') 
        ? `${import.meta.env.VITE_API_URL}/tickets` 
        : `${import.meta.env.VITE_API_URL}/tickets/user/${user.id}`;
      const token = localStorage.getItem('token');
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...newTicket, requestedBy: user.id })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTicket({ title: '', description: '', priority: 'Medium', category: 'Other' });
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdate = async (updateData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/bulk/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ticketIds: selectedTicketIds, updateData })
      });
      if (res.ok) {
        setSelectedTicketIds([]);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTicketIds.length} tickets? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/bulk/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ticketIds: selectedTicketIds })
      });
      if (res.ok) {
        setSelectedTicketIds([]);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.length === currentTickets.length && currentTickets.length > 0) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(currentTickets.map(t => t.id));
    }
  };

  const toggleSelectTicket = (e, id) => {
    e.stopPropagation();
    if (selectedTicketIds.includes(id)) {
      setSelectedTicketIds(selectedTicketIds.filter(tId => tId !== id));
    } else {
      setSelectedTicketIds([...selectedTicketIds, id]);
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Low': return <span className="badge" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>🟢 Low</span>;
      case 'Medium': return <span className="badge" style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.2)' }}>🟡 Medium</span>;
      case 'High': return <span className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>🔴 High</span>;
      default: return <span>{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return <span className="badge" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>🔵 Open</span>;
      case 'In Progress': return <span className="badge" style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04' }}>🟡 In Progress</span>;
      case 'Resolved': return <span className="badge" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>🟢 Resolved</span>;
      default: return <span>{status}</span>;
    }
  };

  const formatId = (id) => `TKT-${id.substring(id.length - 6).toUpperCase()}`;

  const getUserName = (userId) => {
    if (!userId) return null;
    const u = users.find(u => u.id === userId);
    return u ? u.name : userId;
  };

  const kpiStats = {
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    critical: tickets.filter(t => t.priority === 'High').length
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const ActionMenu = ({ t }) => (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button 
        className="btn" 
        style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}
        onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
      >
        <MoreVertical size={18} />
      </button>
      
      <AnimatePresence>
        {activeMenuId === t.id && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ 
              position: 'absolute', right: 0, top: '100%', 
              backgroundColor: 'var(--color-white)', 
              boxShadow: 'var(--shadow-lg)', 
              borderRadius: '8px', 
              padding: '0.5rem',
              zIndex: 50,
              minWidth: '180px',
              border: '1px solid var(--color-gray-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <button 
              className="menu-action-btn"
              style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
              onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-light-gray)'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
              onClick={() => { setSelectedTicket(t); setActiveMenuId(null); }}
            >
              <FileText size={14} /> View Details
            </button>
            {user.role === 'Admin' && (
              <button 
                className="menu-action-btn"
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-light-gray)'}
                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                onClick={() => { setSelectedTicket(t); setActiveMenuId(null); }}
              >
                <UserPlus size={14} /> Assign Engineer
              </button>
            )}
            <button 
              className="menu-action-btn"
              style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
              onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-light-gray)'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
              onClick={() => { setSelectedTicket(t); setActiveMenuId(null); }}
            >
              <Edit size={14} /> Update Status
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Support Tickets</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Manage and track all IT requests and incidents.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Raise Ticket
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Open Tickets', value: kpiStats.open, color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
          { label: 'In Progress', value: kpiStats.inProgress, color: '#ca8a04', bg: 'rgba(234,179,8,0.1)' },
          { label: 'Resolved', value: kpiStats.resolved, color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Critical (High)', value: kpiStats.critical, color: '#dc2626', bg: 'rgba(239,68,68,0.1)' }
        ].map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${kpi.color}` }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>{kpi.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '0.25rem 1rem',
              borderRadius: '999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: statusFilter === status ? `1px solid var(--color-azure)` : '1px solid var(--color-gray-border)',
              backgroundColor: statusFilter === status ? 'rgba(37,99,235,0.1)' : 'var(--color-white)',
              color: statusFilter === status ? 'var(--color-azure)' : 'var(--color-text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Advanced Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: '1 1 200px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-gray-border)' }}>
          <Search size={16} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Search tickets, IDs, employee names..." 
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select className="form-select" style={{ width: 'auto', flexShrink: 0 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">Category: All</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
          <option value="Access Request">Access Request</option>
          <option value="Other">Other</option>
        </select>
        
        <select className="form-select" style={{ width: 'auto', flexShrink: 0 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="All">Priority: All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High (Critical)</option>
        </select>
        
        <select className="form-select" style={{ width: 'auto', flexShrink: 0 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="Newest">Sort: Newest First</option>
          <option value="Oldest">Sort: Oldest First</option>
          <option value="Name (A-Z)">Title (A-Z)</option>
          <option value="Name (Z-A)">Title (Z-A)</option>
        </select>
      </div>

      {/* Table Content Area */}
      <div className="card table-container" style={{ padding: 0, minHeight: '400px', position: 'relative' }}>
        <table>
          <thead>
            <tr>
              {(user.role === 'Admin' || user.role === 'Engineer') && (
                <th style={{ width: '40px', paddingRight: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={currentTickets.length > 0 && selectedTicketIds.length === currentTickets.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Requested By</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((t, idx) => (
              <motion.tr 
                key={t.id} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: (idx % itemsPerPage) * 0.02 }}
                onClick={() => setSelectedTicket(t)}
                style={{ cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: selectedTicketIds.includes(t.id) ? 'var(--color-hover-bg)' : 'transparent' }}
                onMouseEnter={e => { if (!selectedTicketIds.includes(t.id)) e.currentTarget.style.backgroundColor = 'var(--color-light-gray)' }}
                onMouseLeave={e => { if (!selectedTicketIds.includes(t.id)) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {(user.role === 'Admin' || user.role === 'Engineer') && (
                  <td style={{ paddingRight: 0 }} onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedTicketIds.includes(t.id)}
                      onChange={(e) => toggleSelectTicket(e, t.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                )}
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-muted)' }}>{formatId(t.id)}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{t.title}</td>
                <td><span className="badge badge-neutral">{t.category || 'Other'}</span></td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                    👤 {getUserName(t.requestedBy) || 'Unknown'}
                  </span>
                </td>
                <td>
                  {t.assignedTo ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                      🛠️ {getUserName(t.assignedTo)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>Unassigned</span>
                  )}
                </td>
                <td>{getPriorityBadge(t.priority)}</td>
                <td>{getStatusBadge(t.status)}</td>
                <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <ActionMenu t={t} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
           <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
             <h3 style={{ color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Tickets Found</h3>
             <p>Try changing your filters or search query.</p>
             <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setSearchQuery(''); setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); }}>Reset Filters</button>
           </div>
        )}
      </div>

      {/* Floating Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedTicketIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--color-navy)',
              color: 'var(--color-white)',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 90
            }}
          >
            <div style={{ fontWeight: 600 }}>{selectedTicketIds.length} Selected</div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ color: 'var(--color-white)', backgroundColor: 'rgba(255,255,255,0.1)' }} onClick={() => handleBulkUpdate({ status: 'Resolved' })}>
                Mark Resolved
              </button>
              <button className="btn" style={{ color: 'var(--color-white)', backgroundColor: 'rgba(255,255,255,0.1)' }} onClick={() => handleBulkUpdate({ status: 'In Progress' })}>
                Mark In Progress
              </button>
              {user.role === 'Admin' && (
                <button className="btn" style={{ color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.2)' }} onClick={handleBulkDelete}>
                  Delete
                </button>
              )}
            </div>
            
            <button className="btn" style={{ color: 'var(--color-text-muted)', marginLeft: '1rem', padding: '0.5rem' }} onClick={() => setSelectedTicketIds([])}>
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card" 
            style={{ width: '100%', maxWidth: '500px', margin: '2rem' }}
          >
            <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Raise a Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Issue Title</label>
                <input className="form-input" required value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} placeholder="Brief description of the issue" />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Category</label>
                <select className="form-select" value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                  <option value="Access Request">Access Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Detailed Description</label>
                <textarea className="form-input" required rows="4" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} placeholder="Provide as much detail as possible..." />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Priority</label>
                <select className="form-select" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High (Critical)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)} style={{ backgroundColor: 'var(--color-light-gray)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Slide-out Ticket Details Panel */}
      <TicketSidePanel 
        ticket={selectedTicket} 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        getAssigneeName={getUserName}
        users={users}
        user={user}
        onUpdateTicket={(updatedTicket) => {
          setSelectedTicket(updatedTicket);
          setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        }}
      />

    </motion.div>
  );
};

export default Tickets;
