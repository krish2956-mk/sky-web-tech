import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, MousePointer2, Shield, Cloud, Layers, Cpu,
  Trophy, Award, Medal, Star, Home, Mail, Phone, MapPin,
  Users, Target, Heart, Rocket, Palette, Code2, Server, Headphones,
  ArrowRight, CheckCircle2, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Page Content Definitions ────────────────────────────────────

const NAV_LINKS = [
  { key: 'services', label: 'Services' },
  { key: 'company',  label: 'Company' },
  { key: 'contact',  label: 'Contact' },
];

const PageTabs = ({ activePage, navigate }) => (
  <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-full p-2 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
    <button
      onClick={() => navigate('home')}
      className={`flex items-center justify-center w-11 h-11 rounded-full text-sm font-medium transition-all duration-300 ${
        activePage === 'home' ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)] scale-105' : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      <Home className="w-5 h-5" />
    </button>
    {NAV_LINKS.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => navigate(key)}
        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
          activePage === key ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)] scale-105' : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const SERVICES_CONTENT = ({ activePage, navigate }) => (
  <div className="w-full max-w-6xl mx-auto px-8 md:px-12 pt-16 pb-32 md:py-16">
    <div className="mb-12">
      <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3 drop-shadow-md">What We Do</p>
      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
        Premium Services <br />
        <span className="text-orange-100/70">Built for Growth</span>
      </h2>
      <p className="text-white/80 max-w-xl leading-relaxed text-lg drop-shadow-md">
        End-to-end digital solutions crafted with precision, designed to scale your business to the next level.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[
        {
          title: 'Mobile App Development',
          desc: 'End-to-end mobile application development for iOS and Android platforms using modern frameworks.',
          tags: ['iOS', 'Android', 'React Native'],
        },
        {
          title: 'Web Development',
          desc: 'Scalable, high-performance web applications and enterprise portals built on cutting-edge technology stacks.',
          tags: ['React', 'Node.js', 'Next.js'],
        },
        {
          title: 'Web Design',
          desc: 'Pixel-perfect, modern interfaces tailored to your brand identity. From wireframes to polished prototypes.',
          tags: ['Figma', 'UI/UX', 'Wireframing'],
        },
        {
          title: 'Hire dedicated resources',
          desc: 'Augment your team with our skilled developers, designers, and project managers for dedicated support.',
          tags: ['Staff Augmentation', 'Dedicated Teams'],
        },
        {
          title: 'E-Commerce',
          desc: 'Robust and scalable e-commerce solutions that drive sales and provide seamless shopping experiences.',
          tags: ['Shopify', 'WooCommerce', 'Custom'],
        },
        {
          title: 'Web Hosting',
          desc: 'Secure, reliable, and high-performance web hosting solutions with 99.9% uptime guarantees.',
          tags: ['Cloud', 'VPS', 'Dedicated'],
        },
      ].map(({ title, desc, tags }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-7 hover:bg-white/15 hover:border-orange-400/50 transition-all shadow-xl group"
        >
          <div className="text-white/60 font-mono text-2xl font-black mb-3 tracking-wider group-hover:text-white transition-colors drop-shadow-sm">
            0{i + 1}.
          </div>
          <h3 className="text-white font-bold text-xl mb-3 drop-shadow-md">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed mb-5 drop-shadow-sm">{desc}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold text-white bg-white/20 border border-white/30 px-3 py-1 rounded-full tracking-wider uppercase shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const COMPANY_CONTENT = ({ activePage, navigate }) => (
  <div className="w-full max-w-6xl mx-auto px-8 md:px-12 pt-16 pb-32 md:py-16">
    <div className="mb-12">
      <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3 drop-shadow-md">Who We Are</p>
      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
        ABOUT <span className="text-orange-100/70">SKYWEBTECH</span>
      </h2>
      <p className="text-white/80 max-w-2xl leading-relaxed text-lg drop-shadow-md">
        A Valued Source for user-friendly and cost-effective web development solutions.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl flex flex-col justify-center"
      >
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          SkyWebTech is a leading and globally acknowledged IT solution provider and currently at the forefront of offshore software development to serve the people across the world. We had the expertise knowledge of Web Development, Web Designing & Multimedia, E-Commerce Solutions, Search Engine Optimization, Mobile Application Development i.e Android and IOS, and Business Software Services etc... We also provide Network/Server Management services across the world.
        </p>
        <p className="text-white/80 text-sm leading-relaxed">
          SkyWebTech was founded in 2008 with a view to endowing our clients with the optimum IT solutions in terms of Web, Software, and Mobile. The main functional areas were merely Web Development & Mobile Development. Toiling along a long path of a decade, today SkyWebTech is a well-known name in Web Development, Web Hosting and Mobile App Development Industry.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl flex flex-col justify-center"
      >
        <h3 className="text-orange-300 font-bold text-lg mb-2">SkyWebTech is the one stop solution for various IT Solutions</h3>
        <p className="text-white font-bold text-sm mb-3">Services</p>
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          Our identity is our ability to deliver desired web solutions to clients and end users. We provide a complete bouquet of the web, Mobile and Web Hosting solutions at One place which comprehensively accomplishes our client's Overall IT needs.
        </p>
        <p className="text-white/80 text-sm leading-relaxed">
          We committed ourselves to provide complete web solutions with integrity, excellence, consistent reliability, efficiency and effective performance of our products & services. Our endeavour to achieve growth through highest customer satisfaction only. We consistently improve our servicing areas through continuous feedback mechanism and continual improvement in Quality Management Systems.
        </p>
      </motion.div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[
        { label: 'Founded', value: '2008', sub: 'Global Presence' },
        { label: 'Services', value: 'End-to-End', sub: 'Web, Mobile, Hosting' },
        { label: 'Focus', value: '100%', sub: 'Customer Satisfaction' },
      ].map(({ label, value, sub }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-7 text-center shadow-xl"
        >
          <p className="text-4xl font-black text-white tracking-tight drop-shadow-md">{value}</p>
          <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mt-2">{label}</p>
          <p className="text-white/70 text-sm mt-1">{sub}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const CONTACT_CONTENT = ({ activePage, navigate }) => (
  <div className="w-full max-w-5xl mx-auto px-8 md:px-12 pt-16 pb-32 md:py-16">
    <div className="mb-14 text-center max-w-3xl mx-auto">
      <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-4 drop-shadow-md">Get In Touch</p>
      <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
        Let's Build Something <br />
        <span className="text-orange-100/70">Amazing Together</span>
      </h2>
      <p className="text-white/80 max-w-xl mx-auto leading-relaxed text-xl drop-shadow-md">
        Ready to kick off your project? Reach out through any of these channels and our team will get back to you within 24 hours.
      </p>
    </div>

    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="flex flex-col gap-6"
      >
        {[
          { Icon: Mail, label: 'Email Us', value: 'hello@skywebtech.com', sub: 'We reply within 24 hours' },
          { Icon: Phone, label: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Fri, 9am–6pm IST' },
          { Icon: MapPin, label: 'Visit Us', value: 'Mumbai, India', sub: 'HQ · Remote-first team' },
        ].map(({ Icon, label, value, sub }) => (
          <div key={label} className="flex items-center gap-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-orange-400/50 transition-all shadow-xl group">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <Icon className="w-8 h-8 text-white/80 group-hover:text-white group-hover:scale-110 transition-all drop-shadow-sm" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-1.5">{label}</p>
              <p className="text-white font-bold text-2xl drop-shadow-sm">{value}</p>
              <p className="text-white/70 text-sm mt-1">{sub}</p>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {[
            { region: 'USA & Canada Office', phone: '+1 415 455 6789' },
            { region: 'Australia Office', phone: '+61 02 8006 0705' },
            { region: 'UAE Office', phone: '+971 50 3627878' },
          ].map(({ region, phone }) => (
            <div key={region} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center shadow-xl hover:border-orange-400/50 transition-colors group">
              <MapPin className="w-7 h-7 text-white/80 mx-auto mb-3 drop-shadow-sm group-hover:text-white transition-colors" />
              <p className="text-white font-bold text-sm mb-1">{region}</p>
              <p className="text-orange-200 text-sm font-medium tracking-wide">{phone}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

// ─── Slide animation variants ─────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export default function LandingPage() {
  const [activePage, setActivePage] = useState('home');
  const [direction, setDirection] = useState(1);
  const routerNavigate = useNavigate();

  const navigate = (page) => {
    const currentIdx = ['home', 'services', 'company', 'contact'].indexOf(activePage);
    const targetIdx = ['home', 'services', 'company', 'contact'].indexOf(page);
    setDirection(targetIdx > currentIdx ? 1 : -1);
    setActivePage(page);
  };

  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || '';
  const dashboardPath = userRole === 'Admin' ? '/admin' : '/dashboard';

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(userName);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    routerNavigate('/auth');
  };

  return (
    <motion.div
      initial={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      <div
        className="relative w-full h-screen flex flex-col shrink-0 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 15% 20%, #ffffff 0%, #ea580c 45%, #121217 85%)'
        }}
      >
        <AnimatePresence>
          {activePage !== 'home' && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[5]"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)' }}
            />
          )}
        </AnimatePresence>

        {/* ─── TOP NAVBAR ─────────────────────────────────────────── */}
        <nav className="relative z-20 w-full px-8 md:px-12 pt-8 flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-3 group"
          >
            <div
              className="relative w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-[0_4px_15px_rgba(234,88,12,0.4)] overflow-hidden ring-2 ring-orange-50 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
            >
              <div className="absolute inset-0 bg-white/25" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 80%)' }} />
              <Cloud className="relative z-10 w-4 h-4 fill-white/20 stroke-[2.5px]" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))' }} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[15px] tracking-tight leading-none text-black">
                SkyWeb<span className="text-orange-600">Tech</span>
              </span>
              <span className="text-[9px] font-bold text-black/50 uppercase tracking-[0.2em] leading-none mt-1">Client Portal</span>
            </div>
          </button>

          {/* Center Nav — desktop only */}
          <div className="hidden md:flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/10">
            <button
              onClick={() => navigate('home')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activePage === 'home'
                  ? 'bg-white text-black shadow'
                  : 'text-black/70 hover:text-black hover:bg-white/20'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            {NAV_LINKS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => navigate(key)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activePage === key
                    ? 'bg-white text-black shadow'
                    : 'text-black/70 hover:text-black hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            {!isLoggedIn ? (
              <Link to="/auth" className="text-white font-medium text-sm hover:text-white/80">Log In</Link>
            ) : (
              <div className="flex items-center gap-3 border-r border-white/20 pr-6 mr-[-8px]">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-200 text-xs font-bold">
                  {initials}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 text-white/50 hover:text-orange-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <Link
              to={isLoggedIn ? dashboardPath : "/auth"}
              className="text-white/70 hover:text-white font-medium text-sm flex items-center gap-2 transition-colors"
            >
              {isLoggedIn ? 'Dashboard' : 'Client Portal'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* ─── ANIMATED PAGE AREA ─────────────────────────────────── */}
        <div className="relative z-10 flex-1 w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {activePage === 'home' && (
              <motion.div
                key="home"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center"
              >
                <div className="w-full px-8 md:px-12 flex flex-col justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full lg:w-1/2 relative"
                  >
                    {/* Mobile-only nav removed from here */}

                    <h1 className="text-[2.75rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.5rem] leading-[1.15] md:leading-[1.1] tracking-tight font-bold">
                      <span className="text-[#0a0a0f]">
                        Unlock Seamless <br />
                        Project Delivery <br />
                        You Thought Was <br />
                        Out of Reach –<br />
                      </span>
                      <span className="text-white">
                        Now Just One <br />
                        Click Away!
                      </span>
                    </h1>

                    <p className="text-white/60 text-base md:text-lg lg:text-xl font-light mb-10 mt-6 max-w-xl leading-relaxed">
                      Elevate your business with state-of-the-art UI/UX, scalable architecture, and flawless cloud deployments. The future of your digital presence starts here.
                    </p>

                    <motion.button
                      onClick={() => routerNavigate(isLoggedIn ? dashboardPath : '/auth')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-6 py-3 bg-[#0a0a0f] text-white border border-white/10 rounded-full font-medium text-sm overflow-hidden flex items-center gap-2 shadow-lg transition-all hover:border-orange-500/50 w-fit"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10">Start Project</span>
                      <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform relative z-10" />
                    </motion.button>
                  </motion.div>

                  {/* ── 3D Black Hole / Tech Core — Desktop Only ── */}
                  <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center lg:absolute lg:right-[5%] lg:top-1/2 lg:-translate-y-1/2 h-[520px] pointer-events-none z-10">
                    <div className="bh-scene">
                      {/* Ambient outer glow */}
                      <div className="bh-glow" />
                      
                      {/* Accretion Disk (Horizontal rings) */}
                      <div className="bh-disk-group">
                        <div className="bh-disk disk-1" />
                        <div className="bh-disk disk-2" />
                        <div className="bh-disk disk-3" />
                        
                        {/* Data particles orbiting in the disk */}
                        <div className="data-particle dp-1" />
                        <div className="data-particle dp-2" />
                        <div className="data-particle dp-3" />
                      </div>

                      {/* The Event Horizon (Dark Core + Photon Ring) */}
                      <div className="bh-core">
                        <div className="bh-photon-ring" />
                        <div className="bh-event-horizon" />
                      </div>

                      {/* Vertical Energy Jet (Optional but adds to the tech feel) */}
                      <div className="bh-jet" />

                      {/* Floating service labels synced to the tech theme */}
                      <motion.div
                        animate={{ y: [0, -8, 0], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className="absolute top-[12%] right-[5%] bg-[#0a0a0f]/80 backdrop-blur-md border border-orange-500/30 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                      >
                        <p className="text-orange-400 text-xs font-bold tracking-wider uppercase">UI/UX Design</p>
                        <p className="text-white/60 text-[10px]">Pixel-perfect</p>
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, 10, 0], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                        className="absolute bottom-[18%] left-[0%] bg-[#0a0a0f]/80 backdrop-blur-md border border-orange-500/30 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                      >
                        <p className="text-orange-400 text-xs font-bold tracking-wider uppercase">Full-Stack Dev</p>
                        <p className="text-white/60 text-[10px]">Modern architecture</p>
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -6, 0], opacity: [0.75, 1, 0.75] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 2 }}
                        className="absolute bottom-[8%] right-[8%] bg-[#0a0a0f]/80 backdrop-blur-md border border-orange-500/30 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                      >
                        <p className="text-orange-400 text-xs font-bold tracking-wider uppercase">Cloud Deploy</p>
                        <p className="text-white/60 text-[10px]">Zero downtime</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* ── Mobile Orange Bubbles Animation ── */}
                  <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {[
                      { left: '15%', size: 40, delay: 0, duration: 4, endY: '-40vh' },
                      { left: '35%', size: 60, delay: 1.5, duration: 5, endY: '-60vh' },
                      { left: '55%', size: 30, delay: 0.5, duration: 3.5, endY: '-30vh' },
                      { left: '75%', size: 70, delay: 2.5, duration: 6, endY: '-70vh' },
                      { left: '85%', size: 45, delay: 1, duration: 4.5, endY: '-50vh' },
                      { left: '25%', size: 55, delay: 3, duration: 5.5, endY: '-55vh' },
                    ].map((bubble, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: ['10vh', bubble.endY],
                          x: ['-15px', '15px', '-15px'],
                          opacity: [0, 0.9, 0],
                          scale: [0.5, 1, 1.4]
                        }}
                        transition={{
                          y: { duration: bubble.duration, repeat: Infinity, ease: 'easeOut', delay: bubble.delay },
                          x: { duration: bubble.duration / 2, repeat: Infinity, ease: 'easeInOut', delay: bubble.delay },
                          opacity: { duration: bubble.duration, repeat: Infinity, ease: 'easeOut', delay: bubble.delay },
                          scale: { duration: bubble.duration, repeat: Infinity, ease: 'easeOut', delay: bubble.delay }
                        }}
                        className="absolute bottom-[-10%] rounded-full backdrop-blur-sm"
                        style={{
                          left: bubble.left,
                          width: `${bubble.size}px`,
                          height: `${bubble.size}px`,
                          background: 'rgba(249, 115, 22, 0.15)',
                          border: '1px solid rgba(249, 115, 22, 0.5)',
                          boxShadow: '0 0 20px rgba(249, 115, 22, 0.4), inset 0 0 15px rgba(249, 115, 22, 0.3)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'services' && (
              <motion.div
                key="services"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-y-auto"
              >
                <SERVICES_CONTENT />
              </motion.div>
            )}

            {activePage === 'company' && (
              <motion.div
                key="company"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-y-auto"
              >
                <COMPANY_CONTENT />
              </motion.div>
            )}

            {activePage === 'contact' && (
              <motion.div
                key="contact"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-y-auto"
              >
                <CONTACT_CONTENT />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating glow */}
        {activePage === 'home' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="absolute right-[12%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-3xl pointer-events-none z-0"
          />
        )}
      </div>

      {/* ─── BELOW-FOLD SECTION (only on Home) ────────────────────── */}
      <AnimatePresence>
        {activePage === 'home' && (
          <motion.div
            key="below-fold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-[#0a0a0f] py-24 px-8 md:px-24 flex flex-col items-center z-10 border-t border-white/5 relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl text-center mb-24 mt-8"
            >
              <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-tight mb-6">
                Delivered over <span className="text-orange-400">1000 projects</span> across 31 industries, 50 Countries worldwide
              </h2>
              <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-3xl mx-auto font-light">
                Our portfolio ranges from diverse industry segments, companies and geography with strict adherence to high-quality standards and time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-6xl text-center mb-32"
            >
              <div className="flex flex-col items-center mb-12">
                <Trophy className="w-16 h-16 text-yellow-500 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                <h3 className="text-3xl font-light text-white tracking-[0.2em] uppercase mb-2">Awards</h3>
                <p className="text-white/50 font-medium">No.1 Award winning company</p>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-3 text-white font-semibold text-lg"><Award className="w-8 h-8" /> Google Partner</div>
                <div className="flex items-center gap-3 text-white font-semibold text-lg"><Star className="w-8 h-8" /> App Store</div>
                <div className="flex items-center gap-3 text-white font-semibold text-lg"><Shield className="w-8 h-8" /> CSSDesignAwards</div>
                <div className="flex items-center gap-3 text-white font-semibold text-lg"><Medal className="w-8 h-8" /> CSSmania</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-6xl text-center mb-12"
            >
              <h3 className="text-3xl font-light text-white tracking-[0.2em] uppercase mb-16">Our Clients</h3>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-80">
                <div className="text-2xl font-bold text-red-500 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-[5px] border-red-500 flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                  vodafone
                </div>
                <div className="text-4xl font-black text-white italic tracking-tighter">MTV</div>
                <div className="text-2xl font-bold text-blue-200 flex items-center gap-2"><Cloud className="w-8 h-8" /> Lufthansa</div>
                <div className="text-2xl font-bold text-white flex flex-col items-center gap-1">
                  <div className="border-2 border-blue-400 text-blue-400 rounded-full px-4 py-2 text-sm tracking-wider">TAD</div>
                  <span className="text-[10px] text-white/60 tracking-widest uppercase">The App Developers</span>
                </div>
                <div className="text-xl font-bold text-yellow-500 flex flex-col items-center gap-1">
                  <Shield className="w-8 h-8 text-yellow-500" />
                  <span className="text-[10px] text-white/60 tracking-widest uppercase text-center w-24">The University of Hong Kong</span>
                </div>
                <div className="text-2xl font-bold text-blue-400 flex flex-col items-center gap-1">
                  <Cloud className="w-8 h-8" />
                  ACCU <span className="text-[10px] text-blue-400/80 tracking-widest uppercase">web hosting</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Mobile Nav Dock */}
      <PageTabs activePage={activePage} navigate={navigate} />
    </motion.div>
  );
}
