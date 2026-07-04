import { useState, useEffect } from 'react';
import { Ticket, Laptop, Activity, ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Simple Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}</>;
};

const mockChartData = [
  { name: 'Mon', tickets: 4 },
  { name: 'Tue', tickets: 7 },
  { name: 'Wed', tickets: 5 },
  { name: 'Thu', tickets: 12 },
  { name: 'Fri', tickets: 8 },
  { name: 'Sat', tickets: 2 },
  { name: 'Sun', tickets: 3 },
];

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({ tickets: 0, openTickets: 0, assets: 0, resolved: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [myWorkload, setMyWorkload] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const fetchOptions = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const ticketRes = await fetch(user.role === 'Admin' || user.role === 'Engineer' 
          ? `${import.meta.env.VITE_API_URL}/tickets` 
          : `${import.meta.env.VITE_API_URL}/tickets/user/${user.id}`, fetchOptions);
        const tickets = await ticketRes.json();
        
        const assetRes = await fetch(user.role === 'Admin' 
          ? `${import.meta.env.VITE_API_URL}/assets` 
          : `${import.meta.env.VITE_API_URL}/assets/user/${user.id}`, fetchOptions);
        const assets = await assetRes.json();

        setStats({
          tickets: tickets.length,
          openTickets: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
          resolved: tickets.filter(t => t.status === 'Resolved').length,
          assets: assets.length
        });

        setRecentTickets(tickets.slice(0, 4));

        if (user.role === 'Engineer') {
          setMyWorkload(tickets.filter(t => t.assignedTo === user.id && t.status !== 'Resolved'));
        }
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      }
    };
    fetchData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{user.role} Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Welcome back, {user.name}. Here is what's happening with your IT operations today.</p>
        </div>
        {user.role === 'Employee' && (
          <Link to="/tickets" className="btn btn-primary">
            <Ticket size={18} /> Raise a Ticket
          </Link>
        )}
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Tickets', value: stats.tickets, icon: <Ticket size={24} />, color: 'var(--color-azure)', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Active Issues', value: stats.openTickets, icon: <Activity size={24} />, color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Resolved', value: stats.resolved, icon: <Briefcase size={24} />, color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Managed Assets', value: stats.assets, icon: <Laptop size={24} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: kpi.bg, padding: '1rem', borderRadius: '12px', color: kpi.color }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{kpi.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-navy)', lineHeight: 1 }}>
                <AnimatedCounter value={kpi.value} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Chart Section */}
        {(user.role === 'Admin' || user.role === 'Engineer') && (
          <motion.div variants={itemVariants} className="card" style={{ flex: '2', minWidth: '400px', minHeight: '350px' }}>
            <h2 className="card-title">Weekly Ticket Volume</h2>
            <div style={{ width: '100%', height: '300px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-azure)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-azure)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-gray-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--color-white)', color: 'var(--color-text-main)' }} />
                  <Area type="monotone" dataKey="tickets" stroke="var(--color-azure)" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Timeline / Recent Activity */}
        <motion.div variants={itemVariants} className="card" style={{ flex: '1', minWidth: '350px' }}>
          <h2 className="card-title">{user.role === 'Engineer' ? 'My Active Workload' : 'Recent Activity'}</h2>
          
          <div className="timeline" style={{ marginTop: '1.5rem' }}>
            {(user.role === 'Engineer' ? myWorkload : recentTickets).length > 0 ? (
              (user.role === 'Engineer' ? myWorkload : recentTickets).map((ticket, i) => (
                <motion.div 
                  key={ticket.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="timeline-item"
                >
                  <div className="timeline-dot" style={{ backgroundColor: ticket.status === 'Resolved' ? 'var(--color-success)' : ticket.status === 'In Progress' ? 'var(--color-warning)' : 'var(--color-azure)' }}></div>
                  <div className="glass" style={{ padding: '1rem', borderRadius: '12px', marginLeft: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-navy)' }}>{ticket.title}</div>
                      <span className={`badge ${ticket.status === 'Resolved' ? 'badge-success' : ticket.status === 'In Progress' ? 'badge-warning' : 'badge-error'}`} style={{ fontSize: '0.65rem' }}>
                        {ticket.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {user.role === 'Employee' ? 'You created this ticket' : `Priority: ${ticket.priority}`} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                <Briefcase size={32} style={{ color: 'var(--color-gray-border)', margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Nothing to display.</p>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/tickets" style={{ fontSize: '0.875rem', color: 'var(--color-azure)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
