import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Ticket, Laptop, Activity, Users, FileText, Bell, 
  Shield, Zap, Server, Globe, Headset, CheckCircle, 
  ChevronRight
} from 'lucide-react';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', overflow: 'hidden', position: 'relative' }}>
      
      {/* Animated Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}
        />
      </div>

      {/* Navbar */}
      <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', height: '80px', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4rem' }}>
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Intec ServiceHub Logo" style={{ height: '36px', borderRadius: '8px' }} />
          <span style={{ color: 'var(--color-navy)', fontWeight: '800', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>ServiceHub</span>
        </a>
        <div style={{ display: 'flex', gap: '2.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>
          <a href="#features" className="hover-link" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Features</a>
          <a href="#solutions" className="hover-link" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Solutions</a>
          <a href="#about" className="hover-link" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>About</a>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>Sign In</Link>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '999px' }}>Get Started</Link>
        </div>
      </nav>

      {/* Main Content Wrapper (above fixed background) */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Hero Section */}
        <section id="home" style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '4rem', paddingRight: '4rem', display: 'flex', gap: '4rem', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
          {/* Text */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ flex: 1 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37,99,235,0.1)', color: 'var(--color-azure)', padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: '600', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
               v2.0 Now Available
            </div>
            <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem', color: 'var(--color-navy)' }}>
              Manage IT Operations<br/>
              <span style={{ color: 'transparent', backgroundImage: 'linear-gradient(90deg, var(--color-azure), #8B5CF6)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>Smarter. Faster.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '600px', lineHeight: '1.8' }}>
              The unified Enterprise IT Service Desk & Asset Management Platform designed for modern organizations. Resolve issues faster and keep your team productive.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/onboarding" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '999px', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)' }}>
                Start Free Trial <ChevronRight size={20} />
              </Link>
              <button className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '999px', backgroundColor: 'white', border: '1px solid var(--color-gray-border)' }}>
                Watch Demo
              </button>
            </div>
            
            {/* Trusted By */}
            <div style={{ marginTop: '4rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Trusted by innovative teams</p>
              <div style={{ display: 'flex', gap: '2rem', opacity: 0.5, filter: 'grayscale(100%)' }}>
                {/* Placeholder logos using text for now */}
                <span style={{ fontWeight: '800', fontSize: '1.2rem', fontFamily: 'serif' }}>Acme Corp</span>
                <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-1px' }}>GLOBAL</span>
                <span style={{ fontWeight: '800', fontSize: '1.2rem', fontStyle: 'italic' }}>TechSys</span>
              </div>
            </div>
          </motion.div>

          {/* Abstract Floating Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            style={{ flex: 1, position: 'relative', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', perspective: '1000px' }}>
              <motion.div 
                animate={{ y: [0, -20, 0], rotateY: [0, 5, 0], rotateX: [0, 5, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="glass"
                style={{ position: 'absolute', top: '15%', right: '5%', width: '85%', height: '70%', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-azure), #8B5CF6)' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '16px', width: '120px', background: '#E5E7EB', borderRadius: '8px', marginBottom: '8px' }}></div>
                      <div style={{ height: '12px', width: '80px', background: '#F3F4F6', borderRadius: '8px' }}></div>
                    </div>
                  </div>
                  <div style={{ width: '100px', height: '30px', background: '#E5E7EB', borderRadius: '999px' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ height: '120px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}></div>
                  <div style={{ height: '120px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}></div>
                </div>
                <div style={{ height: '140px', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}></div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="glass"
                style={{ position: 'absolute', bottom: '10%', left: '0%', padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-md)', background: 'white', border: 'none' }}
              >
                <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '12px' }}><CheckCircle size={24} /></div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--color-navy)' }}>Ticket #1042 Resolved</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Just now via Automation</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '8rem 4rem', backgroundColor: 'white', borderTop: '1px solid var(--color-gray-border)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem auto' }}>
              <div style={{ color: 'var(--color-azure)', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Capabilities</div>
              <h2 style={{ fontSize: '3rem', color: 'var(--color-navy)', lineHeight: '1.2' }}>Everything you need to run a flawless IT operation.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              {[
                { title: 'Intelligent Ticket Routing', desc: 'Automatically assign tickets to the right agents based on skills, load, and priority.', icon: <Ticket size={28} />, color: 'var(--color-azure)' },
                { title: 'Lifecycle Asset Tracking', desc: 'Track hardware and software from procurement to retirement with automated discovery.', icon: <Laptop size={28} />, color: 'var(--color-success)' },
                { title: 'Predictive Analytics', desc: 'Identify trends and prevent incidents before they impact your business operations.', icon: <Activity size={28} />, color: 'var(--color-warning)' },
                { title: 'Granular Access Control', desc: 'Manage permissions across your organization with advanced role-based access.', icon: <Shield size={28} />, color: '#8B5CF6' },
                { title: 'Automated Workflows', desc: 'Build visual workflows to automate repetitive tasks and standard operating procedures.', icon: <Zap size={28} />, color: '#EC4899' },
                { title: 'Global IT Service Desk', desc: 'Support distributed teams with multi-language and timezone-aware routing.', icon: <Globe size={28} />, color: '#14B8A6' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', borderColor: 'transparent' }}
                  style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-gray-border)', transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'white', color: feature.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-navy)' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" style={{ padding: '8rem 4rem', backgroundColor: '#F8FAFC' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
              <div style={{ color: '#8B5CF6', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Solutions</div>
              <h2 style={{ fontSize: '3rem', color: 'var(--color-navy)' }}>Built for modern workflows</h2>
            </div>

            {/* Solution 1 */}
            <div style={{ display: 'flex', gap: '6rem', alignItems: 'center', marginBottom: '8rem' }}>
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                style={{ flex: 1 }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--color-azure)', marginBottom: '1.5rem' }}>
                  <Headset size={24} />
                </div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-navy)', lineHeight: '1.2' }}>Unify your IT Service Management</h3>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.8' }}>
                  Break down silos between IT, HR, and Facilities. Provide a single portal for employees to get help, request services, and find answers faster.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['Self-service knowledge base', 'Omnichannel ticketing support', 'SLA management & escalations'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'var(--color-text-main)' }}>
                      <CheckCircle size={20} color="var(--color-success)" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                style={{ flex: 1, position: 'relative' }}
              >
                <div style={{ background: 'linear-gradient(135deg, #E0E7FF, #EDE9FE)', borderRadius: '32px', padding: '3rem', position: 'relative' }}>
                  <div className="glass" style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ width: '100%', height: '250px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed var(--color-gray-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket size={64} color="var(--color-azure)" opacity={0.2} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Solution 2 */}
            <div style={{ display: 'flex', gap: '6rem', alignItems: 'center', flexDirection: 'row-reverse' }}>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                style={{ flex: 1 }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', marginBottom: '1.5rem' }}>
                  <Server size={24} />
                </div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-navy)', lineHeight: '1.2' }}>Total visibility into your assets</h3>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.8' }}>
                  Gain complete control over your hardware and software inventory. Track costs, manage warranties, and ensure compliance effortlessly.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['Automated network discovery', 'Software license management', 'Depreciation & lifecycle tracking'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'var(--color-text-main)' }}>
                      <CheckCircle size={20} color="var(--color-success)" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                style={{ flex: 1, position: 'relative' }}
              >
                <div style={{ background: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)', borderRadius: '32px', padding: '3rem', position: 'relative' }}>
                  <div className="glass" style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ width: '100%', height: '250px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed var(--color-gray-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Laptop size={64} color="var(--color-success)" opacity={0.2} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About / Stats Section */}
        <section id="about" style={{ padding: '8rem 4rem', backgroundColor: 'var(--color-navy)', color: 'white' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem auto' }}>
              <div style={{ color: '#60A5FA', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Our Mission</div>
              <h2 style={{ fontSize: '3rem', color: 'white', lineHeight: '1.2', marginBottom: '1.5rem' }}>Empowering IT teams to focus on innovation, not administration.</h2>
              <p style={{ fontSize: '1.25rem', color: '#93C5FD', lineHeight: '1.8' }}>
                Since our founding, we've believed that robust IT service management shouldn't require months of deployment and clunky interfaces. ServiceHub is designed for speed, flexibility, and a beautiful user experience.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
              {[
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '10k+', label: 'Active Users' },
                { value: '< 2min', label: 'Avg. Resolution Time' },
                { value: '24/7', label: 'Global Support' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#93C5FD', fontWeight: '500' }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '6rem 4rem', backgroundColor: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, #F0F5FF, #F3F4F6)', padding: '5rem 3rem', borderRadius: '32px', border: '1px solid var(--color-gray-border)' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-navy)', marginBottom: '1.5rem' }}>Ready to transform your IT desk?</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Join thousands of organizations delivering exceptional employee experiences.</p>
            <Link to="/onboarding" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.25rem', borderRadius: '999px', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)' }}>
              Get Started for Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '5rem 4rem 2rem 4rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <img src="/logo.png" alt="Intec ServiceHub Logo" style={{ height: '36px', borderRadius: '8px', filter: 'brightness(0) invert(1)' }} />
                <span style={{ color: 'white', fontWeight: '800', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>ServiceHub</span>
              </div>
              <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>The unified Enterprise IT Service Desk & Asset Management Platform designed for modern organizations.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Twitter</a>
                <a href="#" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>GitHub</a>
                <a href="#" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>LinkedIn</a>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1.5rem' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>Features</a></li>
                <li><a href="#solutions" style={{ color: '#94A3B8', textDecoration: 'none' }}>Solutions</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Pricing</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1.5rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#about" style={{ color: '#94A3B8', textDecoration: 'none' }}>About Us</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Careers</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Blog</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1.5rem' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</a></li>
                <li><a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Security</a></li>
              </ul>
            </div>
          </div>
          <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>&copy; {new Date().getFullYear()} IT ServiceHub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
