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

      {/* ── INTERSTELLAR BLACK HOLE CORE ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center z-10">
        
        {/* Intense background glow */}
        <div className="absolute w-64 h-64 bg-orange-600/30 rounded-full blur-[50px] z-0 pointer-events-none" />

        {/* Top Halo (Bent Light from behind) */}
        <div className="absolute w-44 h-44 rounded-full border-[8px] border-transparent border-t-orange-300 border-r-orange-500/40 border-l-orange-500/40 opacity-90 z-0 shadow-[0_-10px_40px_rgba(251,146,60,0.8)] blur-[2px] pointer-events-none" style={{ transform: 'scaleY(1.15) translateY(-5px)' }} />

        {/* Bottom Halo (Bent Light from behind) */}
        <div className="absolute w-44 h-44 rounded-full border-[6px] border-transparent border-b-orange-500 border-r-orange-500/30 border-l-orange-500/30 opacity-70 z-0 shadow-[0_10px_30px_rgba(234,88,12,0.6)] blur-[2px] pointer-events-none" style={{ transform: 'scaleY(1.15) translateY(5px)' }} />

        {/* Event Horizon (Pure Black Circle) */}
        <div className="absolute w-40 h-40 rounded-full bg-[#000000] z-10 shadow-[0_0_20px_rgba(251,146,60,0.5)]" />

        {/* Accretion Disk (Front glowing sweep) */}
        {/* We use a wide, squashed ellipse with only the bottom border visible to simulate the front of the ring */}
        <div className="absolute w-[420px] h-[120px] rounded-[50%] border-[4px] border-transparent border-b-white/90 z-20 shadow-[0_10px_30px_rgba(251,146,60,1),0_20px_60px_rgba(234,88,12,0.8)] blur-[1px] pointer-events-none" style={{ transform: 'translateY(-30px)' }} />
        
        {/* Inner intense disk glow (the hottest part) */}
        <div className="absolute w-[400px] h-[80px] rounded-[50%] border-[6px] border-transparent border-b-orange-400 z-20 blur-[3px] pointer-events-none" style={{ transform: 'translateY(-20px)' }} />

        {/* The horizontal piercing light (Doppler beaming effect on the sides) */}
        <div className="absolute w-[440px] h-[4px] bg-gradient-to-r from-transparent via-orange-300 to-transparent z-20 blur-[2px] pointer-events-none" style={{ transform: 'translateY(15px)' }} />
        <div className="absolute w-[350px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent z-20 blur-[1px] pointer-events-none" style={{ transform: 'translateY(15px)' }} />

        {/* Text over Black Hole */}
        <div className="absolute z-30 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-white text-5xl font-bold tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,1), 0 0 30px rgba(251,146,60,0.8)' }}>200+</span>
          <span className="text-orange-100/90 text-[10px] mt-1 uppercase tracking-widest font-bold" style={{ textShadow: '0 2px 10px rgba(0,0,0,1)' }}>Client Projects</span>
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
