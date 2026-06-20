import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Layers, Database, Code2, Shield } from 'lucide-react';

const OrbitRing = ({ radius, duration, reverse, dashed, children }) => {
  return (
    <>
      {/* The visible ring */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] ${dashed ? 'border-dashed border-white/30' : 'border-white/20'}`}
        style={{ width: radius * 2, height: radius * 2 }}
      />
      {/* The rotating container */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            duration,
            reverse
          });
        })}
      </motion.div>
    </>
  );
};

const OrbitItem = ({ radius, angle, duration, reverse, children }) => {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <div 
      className="absolute"
      style={{ 
        top: '50%', left: '50%', 
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` 
      }}
    >
      {/* Counter-rotation to keep elements perfectly upright */}
      <motion.div
        animate={{ rotate: reverse ? 360 : -360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function TechScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Center Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center z-10">
        
        {/* Flashes/Twinkles around the center circle */}
        <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-6 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] z-0" />
        <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-2 left-4 w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_15px_3px_rgba(249,115,22,0.8)] z-0" />
        <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-orange-200 rounded-full shadow-[0_0_12px_2px_rgba(253,186,116,0.8)] z-0" />
        <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 3.5, delay: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-2 left-1/3 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_1px_rgba(255,255,255,0.8)] z-0" />

        {/* The Black Core */}
        <div 
          className="relative w-44 h-44 rounded-full bg-black z-10 flex flex-col items-center justify-center"
          style={{
             boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.6)',
             border: 'none'
          }}
        >
          <span className="text-white text-5xl font-bold tracking-tight z-20 relative drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">200+</span>
          <span className="text-white/70 text-[10px] mt-1 uppercase tracking-widest font-bold z-20 relative drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">Client Projects</span>
        </div>
      </div>

      {/* Ring 1 - Inner */}
      <OrbitRing radius={140} duration={20} reverse={false}>
        <OrbitItem radius={140} angle={45}>
           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
             <span className="text-white font-bold text-sm tracking-wider">AS</span>
           </div>
        </OrbitItem>
        <OrbitItem radius={140} angle={225}>
           <div className="w-12 h-12 rounded-2xl bg-[#111] border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
             <Cloud className="w-5 h-5 text-gray-400" />
           </div>
        </OrbitItem>
      </OrbitRing>

      {/* Ring 2 - Middle */}
      <OrbitRing radius={220} duration={35} reverse={true}>
        <OrbitItem radius={220} angle={120}>
           <div className="w-14 h-14 rounded-2xl bg-[#0a0a0f] border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)] flex items-center justify-center">
             <Layers className="w-6 h-6 text-orange-400" />
           </div>
        </OrbitItem>
        <OrbitItem radius={220} angle={300}>
           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
             <span className="text-white font-bold text-sm tracking-wider">MK</span>
           </div>
        </OrbitItem>
      </OrbitRing>

      {/* Ring 3 - Outer */}
      <OrbitRing radius={320} duration={50} reverse={false} dashed>
        <OrbitItem radius={320} angle={0}>
           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
             <span className="text-white font-bold text-sm tracking-wider">JD</span>
           </div>
        </OrbitItem>
        <OrbitItem radius={320} angle={180}>
           <div className="w-12 h-12 rounded-2xl bg-[#111] border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center">
             <Database className="w-5 h-5 text-blue-400" />
           </div>
        </OrbitItem>
        <OrbitItem radius={320} angle={270}>
           <div className="w-12 h-12 rounded-2xl bg-[#111] border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center">
             <Code2 className="w-5 h-5 text-emerald-400" />
           </div>
        </OrbitItem>
        <OrbitItem radius={320} angle={90}>
           <div className="w-10 h-10 rounded-2xl bg-[#111] border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center">
             <Shield className="w-4 h-4 text-purple-400" />
           </div>
        </OrbitItem>
      </OrbitRing>

    </div>
  );
}
