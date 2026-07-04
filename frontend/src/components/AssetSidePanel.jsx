import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Cpu, Hash, Activity } from 'lucide-react';

const AssetSidePanel = ({ asset, isOpen, onClose, getStatusBadge, getTypeIcon, users }) => {
  if (!asset) return null;

  const assignee = users.find(u => u.id === asset.assignedTo);
  const formattedId = asset.serialNumber;

  // Ensure history exists, defaulting to empty array
  const history = asset.history || [];

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
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', lineHeight: 1.3 }}>{asset.name}</h2>
              </div>
              <button className="btn" onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Type</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{getTypeIcon(asset.type)} <span style={{ fontSize: '0.875rem' }}>{asset.type}</span></div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Status</div>
                  <div>{getStatusBadge(asset.status)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1rem', border: '1px solid var(--color-gray-border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={16} color="var(--color-text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Currently Assigned To</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-navy)' }}>{assignee ? assignee.name : <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Unassigned</span>}</div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '0.5rem' }}>Lifecycle History</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem', marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '5px', bottom: '5px', width: '2px', backgroundColor: 'var(--color-gray-border)' }} />
                  
                  {history.length === 0 && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginLeft: '0.5rem' }}>
                      No history available.
                    </div>
                  )}

                  {/* History Events */}
                  {history.slice().reverse().map((entry, idx) => {
                    const actor = users.find(u => u.id === entry.userId);
                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-1.15rem', top: '0.25rem', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--color-white)', border: '2px solid var(--color-azure)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           {/* Small inner dot */}
                           <div style={{ width: '4px', height: '4px', backgroundColor: 'var(--color-azure)', borderRadius: '50%' }} />
                        </div>
                        <div style={{ backgroundColor: 'var(--color-white)', padding: '0 0.5rem', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.15rem' }}>{entry.action}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><User size={12}/> {actor?.name || 'System'}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12}/> {new Date(entry.date).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AssetSidePanel;
