import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, BookOpen, AlertCircle, Wifi, MonitorSmartphone, Key } from 'lucide-react';

const faqData = [
  {
    category: 'Network & Access',
    icon: <Wifi size={20} />,
    questions: [
      {
        q: 'How do I connect to the secure Wi-Fi network?',
        a: 'Use your domain credentials to log into the "Intec-Secure" network. If you are on a guest device, please request a temporary pass via a Low Priority ticket.'
      },
      {
        q: 'I forgot my password, how can I reset it?',
        a: 'If you cannot access your account at all, please contact your manager who can request an IT Administrator to reset it for you.'
      }
    ]
  },
  {
    category: 'Hardware & Devices',
    icon: <MonitorSmartphone size={20} />,
    questions: [
      {
        q: 'How do I request a new monitor or peripheral?',
        a: 'Submit a new Ticket with the category "Hardware". Please include a brief justification in the description.'
      },
      {
        q: 'My laptop won\'t turn on.',
        a: 'First, ensure the charger is securely connected and the outlet has power. Hold the power button for 30 seconds. If it still does not boot, submit a High Priority ticket and select your assigned laptop under "Linked Asset".'
      }
    ]
  },
  {
    category: 'Software & Security',
    icon: <Key size={20} />,
    questions: [
      {
        q: 'How do I get access to a specific software tool?',
        a: 'Submit an "Access Request" ticket. Make sure to specify the exact software and if it requires a paid license.'
      },
      {
        q: 'I received a suspicious email. What should I do?',
        a: 'Do not click any links or download attachments. Please forward the email to security@intec.com and delete the original message.'
      }
    ]
  }
];

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredData = faqData.map(category => {
    const filteredQuestions = category.questions.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions: filteredQuestions };
  }).filter(category => category.questions.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center', backgroundColor: 'var(--color-navy)', color: 'white', padding: '3rem 1rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
        <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Knowledge Base & FAQ</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>Find answers to common issues before submitting a ticket to get help instantly.</p>
        
        <div className="search-bar" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--color-white)', padding: '0.5rem' }}>
          <Search size={20} color="var(--color-text-muted)" style={{ marginLeft: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search for answers..." 
            className="search-input"
            style={{ fontSize: '1rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <AlertCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No results found</h3>
            <p>We couldn't find any articles matching your search.</p>
          </div>
        ) : (
          filteredData.map((category, catIdx) => (
            <div key={catIdx} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-navy)', paddingBottom: '0.5rem', borderBottom: '2px solid var(--color-gray-border)' }}>
                {category.icon}
                <h2 style={{ fontSize: '1.25rem' }}>{category.category}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {category.questions.map((item, qIdx) => {
                  const globalIdx = `${catIdx}-${qIdx}`;
                  const isExpanded = expandedIndex === globalIdx;
                  return (
                    <div key={qIdx} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'all 0.2s' }}>
                      <button 
                        onClick={() => toggleExpand(globalIdx)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 500, color: isExpanded ? 'var(--color-azure)' : 'var(--color-navy)' }}>{item.q}</span>
                        {isExpanded ? <ChevronUp size={20} color="var(--color-azure)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ padding: '0 1.5rem 1.25rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}
                          >
                            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-gray-border)' }}>
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default KnowledgeBase;
