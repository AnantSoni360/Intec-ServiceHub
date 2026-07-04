import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Network, Loader2 } from 'lucide-react';

const CommandCenterLoader = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Spinning ring & Logo (0-1s)
    // Phase 1: Booting modules (1-2s)
    // Phase 2: Connecting map nodes (2-3s)
    // Phase 3: Complete -> transition to dashboard (3.5s)
    
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => onComplete(), 3800)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'var(--color-navy)', color: 'white', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Animated Map / Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 0.2 : 0 }}
        transition={{ duration: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }}
      />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Spinning Ring Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-azure)', borderRadius: '50%' }}
          />
          <ShieldAlert size={40} color="var(--color-azure)" />
        </motion.div>

        {/* Text Sequence */}
        <div style={{ height: '60px', textAlign: 'center' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '1.25rem', fontWeight: '500', fontFamily: 'var(--font-heading)' }}
          >
            {phase === 0 && 'Authenticating Identity...'}
            {phase === 1 && 'Initializing Command Center...'}
            {phase === 2 && 'Establishing Secure Network...'}
            {phase === 3 && 'Access Granted.'}
          </motion.h2>
          
          <motion.div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {phase >= 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ padding: '0.25rem 0.75rem', background: 'rgba(16,185,129,0.2)', color: '#10B981', borderRadius: '4px', fontSize: '0.75rem' }}>Modules Loaded</motion.div>
            )}
            {phase >= 2 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ padding: '0.25rem 0.75rem', background: 'rgba(37,99,235,0.2)', color: '#3B82F6', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Network size={12} /> Nodes Connected
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '2rem', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: phase === 0 ? '30%' : phase === 1 ? '60%' : phase === 2 ? '90%' : '100%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: 'var(--color-azure)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CommandCenterLoader;
