import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Briefcase, Hash, MessageSquare, Send } from 'lucide-react';

const TicketSidePanel = ({ ticket, isOpen, onClose, getStatusBadge, getPriorityBadge, getAssigneeName, users, user, onUpdateTicket }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ticket) return null;

  const requester = users.find(u => u.id === ticket.requestedBy);
  const assignee = users.find(u => u.id === ticket.assignedTo);
  const formattedId = `TKT-${ticket.id.substring(ticket.id.length - 6).toUpperCase()}`;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        onUpdateTicket(updatedTicket);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', maxWidth: '100vw',
              backgroundColor: 'var(--color-white)', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)',
              zIndex: 101, display: 'flex', flexDirection: 'column', overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--color-light-gray)', position: 'sticky', top: 0, zIndex: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Hash size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-muted)' }}>{formattedId}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', lineHeight: 1.3 }}>{ticket.title}</h2>
              </div>
              <button className="btn" onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Category</div>
                  <div><span className="badge badge-neutral">{ticket.category || 'Other'}</span></div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Status</div>
                  <div>{getStatusBadge(ticket.status)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Priority</div>
                  <div>{getPriorityBadge(ticket.priority)}</div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Description</div>
                <div style={{ backgroundColor: 'var(--color-light-gray)', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {ticket.description}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1rem', border: '1px solid var(--color-gray-border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={16} color="var(--color-text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Requested By</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-navy)' }}>{requester ? requester.name : 'Unknown'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Briefcase size={16} color="var(--color-text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Assigned Engineer</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-navy)' }}>{assignee ? assignee.name : <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Unassigned</span>}</div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline & Comments */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '0.5rem' }}>Activity & Comments</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem', marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '5px', bottom: '5px', width: '2px', backgroundColor: 'var(--color-gray-border)' }} />
                  
                  {/* Creation event */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1rem', top: '0.25rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-white)', border: '2px solid var(--color-azure)' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-navy)' }}>Ticket Created by {requester?.name || 'Unknown'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      <Clock size={12} /> {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Comments */}
                  {ticket.comments && ticket.comments.map((comment, idx) => {
                    const author = users.find(u => u.id === comment.authorId);
                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-1.15rem', top: '0.25rem', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--color-light-gray)', border: '1px solid var(--color-gray-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <MessageSquare size={8} color="var(--color-text-muted)" />
                        </div>
                        <div style={{ backgroundColor: 'var(--color-light-gray)', padding: '0.75rem 1rem', borderRadius: '8px', borderTopLeftRadius: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-navy)' }}>{author?.name || 'Unknown'}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Comment Input */}
                <div style={{ marginTop: 'auto', position: 'sticky', bottom: '-1.5rem', backgroundColor: 'var(--color-white)', padding: '1rem 0', borderTop: '1px solid var(--color-gray-border)' }}>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <input 
                       type="text" 
                       className="form-input" 
                       placeholder="Add a comment or update..." 
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                       disabled={isSubmitting}
                     />
                     <button 
                       className="btn btn-primary" 
                       style={{ padding: '0 1rem' }}
                       onClick={handleAddComment}
                       disabled={!newComment.trim() || isSubmitting}
                     >
                       <Send size={16} />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TicketSidePanel;
