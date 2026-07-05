import { useState, useEffect } from 'react';
import { Plus, Laptop, Server, Printer, Settings, CheckCircle2, AlertTriangle, MonitorSmartphone, Search, Filter, LayoutGrid, List as ListIcon, MoreVertical, Edit, UserPlus, Trash, Monitor, Smartphone, Tablet, Cpu, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AssetSidePanel from '../components/AssetSidePanel';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Assets = ({ user }) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  
  // UI State
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  // Filters & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Modals & Menus
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Laptop', serialNumber: '' });
  const [users, setUsers] = useState([]);
  
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchAssets();
  }, [user, searchQuery, statusFilter, typeFilter, sortBy, currentPage]);

  useEffect(() => {
    if (user.role === 'Admin' || user.role === 'Engineer') {
      fetchUsers();
    }
  }, [user]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchAssets = async () => {
    try {
      const endpoint = (user.role === 'Admin' || user.role === 'Engineer') 
        ? `${import.meta.env.VITE_API_URL}/assets` 
        : `${import.meta.env.VITE_API_URL}/assets/user/${user.id}`;
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        type: typeFilter,
        sortBy: sortBy,
        search: searchQuery
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`${endpoint}?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.data) {
        setAssets(data.data);
        setTotalPages(Math.ceil(data.totalCount / itemsPerPage) || 1);
      }
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

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAsset)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewAsset({ name: '', type: 'Laptop', serialNumber: '' });
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAssetAssignment = async (assetId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assets/${assetId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          assignedTo: userId, 
          status: userId ? 'Assigned' : 'Available' 
        })
      });
      if (res.ok) fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdate = async (updateData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assets/bulk/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ assetIds: selectedAssetIds, updateData })
      });
      if (res.ok) {
        setSelectedAssetIds([]);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedAssetIds.length} assets? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assets/bulk/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ assetIds: selectedAssetIds })
      });
      if (res.ok) {
        setSelectedAssetIds([]);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedAssetIds.length === assets.length && assets.length > 0) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map(a => a.id));
    }
  };

  const toggleSelectAsset = (e, id) => {
    e.stopPropagation();
    if (selectedAssetIds.includes(id)) {
      setSelectedAssetIds(selectedAssetIds.filter(aId => aId !== id));
    } else {
      setSelectedAssetIds([...selectedAssetIds, id]);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Laptop': return <Laptop size={16} color="var(--color-navy)" />;
      case 'Desktop': return <Monitor size={16} color="var(--color-navy)" />;
      case 'Phone': return <Smartphone size={16} color="var(--color-navy)" />;
      case 'Tablet': return <Tablet size={16} color="var(--color-navy)" />;
      case 'Server': return <Server size={16} color="var(--color-navy)" />;
      default: return <Cpu size={16} color="var(--color-navy)" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available': return <span className="badge" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>🟢 Available</span>;
      case 'Assigned': return <span className="badge" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>🔵 Assigned</span>;
      case 'Maintenance': return <span className="badge" style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04' }}>🟡 Maintenance</span>;
      case 'Retired': return <span className="badge" style={{ backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569' }}>⚫ Retired</span>;
      default: return <span>{status}</span>;
    }
  };

  const getUserName = (userId) => {
    if (!userId) return null;
    const u = users.find(u => u.id === userId);
    return u ? u.name : userId;
  };

  const kpiStats = {
    total: assets.length,
    available: assets.filter(a => a.status === 'Available').length,
    assigned: assets.filter(a => a.status === 'Assigned').length,
    maintenance: assets.filter(a => a.status === 'Maintenance').length
  };

  // Pagination logic (now handled by backend)
  const currentAssets = assets;

  const exportCSV = async () => {
    try {
      const endpoint = (user.role === 'Admin' || user.role === 'Engineer') 
        ? `${import.meta.env.VITE_API_URL}/assets` 
        : `${import.meta.env.VITE_API_URL}/assets/user/${user.id}`;
      
      const queryParams = new URLSearchParams({
        status: statusFilter, type: typeFilter, sortBy: sortBy, search: searchQuery, export: 'true'
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`${endpoint}?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      const exportAssets = data.data || [];

      const headers = ['Name', 'Type', 'Serial Number', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...exportAssets.map(a => [
          `"${(a.name || '').replace(/"/g, '""')}"`,
          a.type,
          a.serialNumber,
          a.status,
          new Date(a.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch(err) {
      console.error('Export failed', err);
    }
  };

  const exportPDF = async () => {
    try {
      const endpoint = (user.role === 'Admin' || user.role === 'Engineer') 
        ? `${import.meta.env.VITE_API_URL}/assets` 
        : `${import.meta.env.VITE_API_URL}/assets/user/${user.id}`;
      
      const queryParams = new URLSearchParams({
        status: statusFilter, type: typeFilter, sortBy: sortBy, search: searchQuery, export: 'true'
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`${endpoint}?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      const exportAssets = data.data || [];

      const doc = new jsPDF();
      doc.text('IT Assets Report', 14, 15);
      
      const tableData = exportAssets.map(a => [
        a.name,
        a.type,
        a.serialNumber,
        a.status,
        new Date(a.createdAt).toLocaleDateString()
      ]);
      
      doc.autoTable({
        head: [['Name', 'Type', 'Serial Number', 'Status', 'Created At']],
        body: tableData,
        startY: 25,
        styles: { fontSize: 8 }
      });
      
      doc.save(`assets_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch(err) {
      console.error('Export failed', err);
    }
  };

  const ActionMenu = ({ a }) => (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button 
        className="btn" 
        style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}
        onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)}
      >
        <MoreVertical size={18} />
      </button>
      
      <AnimatePresence>
        {activeMenuId === a.id && (
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
              onClick={() => { setSelectedAsset(a); setActiveMenuId(null); }}
            >
              <Cpu size={14} /> View Details
            </button>
            {user.role === 'Admin' && (
              <button 
                className="menu-action-btn"
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-light-gray)'}
                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                onClick={() => {
                  const newUserId = window.prompt("Enter User ID to assign (leave blank to unassign):", a.assignedTo || "");
                  if (newUserId !== null) {
                    updateAssetAssignment(a.id, newUserId || null);
                  }
                  setActiveMenuId(null);
                }}
              >
                <UserPlus size={14} /> {a.assignedTo ? 'Reassign' : 'Assign to User'}
              </button>
            )}
            {user.role === 'Admin' && (
               <button 
                 className="menu-action-btn"
                 style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                 onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-light-gray)'}
                 onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                 onClick={async () => {
                    const token = localStorage.getItem('token');
                    await fetch(`${import.meta.env.VITE_API_URL}/assets/${a.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ status: a.status === 'Maintenance' ? 'Available' : 'Maintenance' })
                    });
                    fetchAssets();
                    setActiveMenuId(null);
                 }}
               >
                 <Edit size={14} /> Toggle Maintenance
               </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Asset Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Track hardware inventory and assignments.</p>
        </div>
        {user.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={exportCSV}><Download size={14} style={{marginRight: '4px'}}/> CSV</button>
            <button className="btn btn-outline" onClick={exportPDF}><Download size={14} style={{marginRight: '4px'}}/> PDF</button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Add Asset
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Assets', value: kpiStats.total, color: '#0f172a', bg: 'rgba(15,23,42,0.1)' },
          { label: 'Available', value: kpiStats.available, color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Assigned', value: kpiStats.assigned, color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
          { label: 'In Maintenance', value: kpiStats.maintenance, color: '#ca8a04', bg: 'rgba(234,179,8,0.1)' }
        ].map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${kpi.color}` }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>{kpi.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: '1 1 200px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-gray-border)' }}>
          <Search size={16} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="search-input"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            onKeyDown={e => { if (e.key === 'Enter') fetchAssets(); }}
          />
        </div>
        
        <select className="form-select" style={{ width: 'auto', flexShrink: 0 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
        
        <select className="form-select" style={{ width: 'auto', flexShrink: 0 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="All">Type: All</option>
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Phone">Phone</option>
          <option value="Tablet">Tablet</option>
          <option value="Server">Server</option>
          <option value="Other">Other</option>
        </select>
        
        <select className="form-select" style={{ width: 'auto', flexShrink: 0 }} value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
          <option value="Newest">Sort: Newest</option>
          <option value="Oldest First">Sort: Oldest</option>
        </select>

        <div style={{ display: 'flex', border: '1px solid var(--color-gray-border)', borderRadius: '8px', overflow: 'hidden', marginLeft: 'auto' }}>
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`} 
            style={{ borderRadius: 0, padding: '0.5rem 0.75rem', border: 'none', backgroundColor: viewMode === 'list' ? 'var(--color-azure)' : 'var(--color-white)', color: viewMode === 'list' ? '#fff' : 'var(--color-text-muted)' }}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <ListIcon size={18} />
          </button>
          <button 
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : ''}`} 
            style={{ borderRadius: 0, padding: '0.5rem 0.75rem', border: 'none', backgroundColor: viewMode === 'grid' ? 'var(--color-azure)' : 'var(--color-white)', color: viewMode === 'grid' ? '#fff' : 'var(--color-text-muted)' }}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'list' ? (
        <div className="card table-container" style={{ padding: 0, minHeight: '400px' }}>
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Employee</th>
                <th>Status</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {currentAssets.map((a, idx) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (idx % itemsPerPage) * 0.02 }}>
                  <td style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{a.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getTypeIcon(a.type)} {a.type}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{a.serialNumber}</td>
                  <td>
                    {a.assignedTo ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                        👤 {getUserName(a.assignedTo)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td>{getStatusBadge(a.status)}</td>
                  <td>
                    {(user.role === 'Admin' || user.role === 'Engineer') && <ActionMenu a={a} />}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {currentAssets.length === 0 && (
             <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
               <Search size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
               <p>No assets match your filters.</p>
             </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', minHeight: '400px', alignContent: 'start' }}>
          {currentAssets.map((a, idx) => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (idx % itemsPerPage) * 0.02 }}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', cursor: 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {(user.role === 'Admin' || user.role === 'Engineer') && (
                    <input 
                      type="checkbox" 
                      checked={selectedAssetIds.includes(a.id)}
                      onChange={(e) => toggleSelectAsset(e, a.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-navy)' }}>
                    {getTypeIcon(a.type)}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{a.type}</span>
                  </div>
                </div>
                {(user.role === 'Admin' || user.role === 'Engineer') && <ActionMenu a={a} />}
              </div>
              
              <div style={{ marginBottom: '1rem', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{a.name}</h3>
                <div style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{a.serialNumber}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-gray-border)' }}>
                {a.assignedTo ? (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-navy)', fontWeight: 500 }}>
                     👤 {getUserName(a.assignedTo)}
                   </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Unassigned</span>
                )}
                {getStatusBadge(a.status)}
              </div>
            </motion.div>
          ))}
          {currentAssets.length === 0 && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
               <Search size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
               <p>No assets match your filters.</p>
             </div>
          )}
        </div>
      )}

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

      {/* Add Asset Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card" 
            style={{ width: '100%', maxWidth: '500px', margin: '2rem' }}
          >
            <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add New Asset</h2>
            <form onSubmit={handleCreateAsset}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Asset Name / Model</label>
                <input className="form-input" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. MacBook Pro M3" />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Asset Type</label>
                <select className="form-select" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})}>
                  <option>Laptop</option>
                  <option>Desktop</option>
                  <option>Printer</option>
                  <option>Network</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Serial Number</label>
                <input className="form-input" required value={newAsset.serialNumber} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} placeholder="e.g. C02X..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-gray-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)} style={{ backgroundColor: 'var(--color-light-gray)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Asset</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedAssetIds.length > 0 && (
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
            <div style={{ fontWeight: 600 }}>{selectedAssetIds.length} Selected</div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ color: 'var(--color-white)', backgroundColor: 'rgba(255,255,255,0.1)' }} onClick={() => handleBulkUpdate({ status: 'Available', assignedTo: null })}>
                Make Available
              </button>
              <button className="btn" style={{ color: 'var(--color-white)', backgroundColor: 'rgba(255,255,255,0.1)' }} onClick={() => handleBulkUpdate({ status: 'Maintenance' })}>
                Send to Maintenance
              </button>
              {user.role === 'Admin' && (
                <button className="btn" style={{ color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.2)' }} onClick={handleBulkDelete}>
                  Delete
                </button>
              )}
            </div>
            
            <button className="btn" style={{ color: 'var(--color-text-muted)', marginLeft: '1rem', padding: '0.5rem' }} onClick={() => setSelectedAssetIds([])}>
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AssetSidePanel 
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        getStatusBadge={getStatusBadge}
        getTypeIcon={getTypeIcon}
        users={users}
      />
    </motion.div>
  );
};

export default Assets;
