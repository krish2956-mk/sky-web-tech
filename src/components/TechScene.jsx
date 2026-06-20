import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Code2, Cloud, Layout, Zap, Database } from 'lucide-react';

export default function TechScene() {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Use window coordinates for a more pronounced effect across the whole screen
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth springs for parallax
  const springConfig = { damping: 30, stiffness: 100 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    mouseX.set(mousePosition.x);
    mouseY.set(mousePosition.y);
  }, [mousePosition, mouseX, mouseY]);

  // Floating animation variants for bobbing
  const float = (delay, duration) => ({
    animate: {
      y: [0, -15, 0],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]" ref={containerRef}>
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Center 3D Group with Parallax */}
      <motion.div 
        className="relative w-full h-full flex items-center justify-center transform-style-3d pointer-events-auto"
        style={{
          rotateX: useTransform(mouseY, [-1, 1], [10, -10]),
          rotateY: useTransform(mouseX, [-1, 1], [-15, 15]),
        }}
      >
        
        {/* Core Center Sphere/Element */}
        <motion.div 
          className="absolute w-40 h-40 rounded-full border border-orange-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.15)] bg-[#0a0a0f]/60 backdrop-blur-xl z-20"
          style={{ translateZ: 50 }}
        >
          <div className="w-28 h-28 rounded-full border border-orange-400/40 flex items-center justify-center shadow-[inset_0_0_30px_rgba(249,115,22,0.3)] bg-gradient-to-br from-orange-500/10 to-transparent">
            <Zap className="w-12 h-12 text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
          </div>
        </motion.div>

        {/* Orbit Rings (Decorative) */}
        <div className="absolute w-[450px] h-[450px] rounded-full border border-white/5 z-0" style={{ transform: 'translateZ(0px) rotateX(70deg)' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-orange-500/5 border-dashed z-0" style={{ transform: 'translateZ(-50px) rotateX(70deg)' }} />
        
        {/* Card 1: Cloud Architecture */}
        <motion.div 
          className="absolute z-30"
          style={{ translateZ: 120, x: 160, y: -80 }}
          {...float(0, 4)}
        >
          <div className="w-56 p-5 rounded-2xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-orange-500/40 shadow-[0_20px_40px_rgba(249,115,22,0.2)] flex flex-col gap-4 group hover:border-orange-400 transition-colors cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/15 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                <Cloud className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <span className="text-white/90 font-bold text-sm block">Cloud Native</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">Infrastructure</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: UI/UX Engineering */}
        <motion.div 
          className="absolute z-30"
          style={{ translateZ: 80, x: -180, y: 20 }}
          {...float(1, 5)}
        >
           <div className="w-48 p-4 rounded-2xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3 group hover:border-orange-500/40 transition-colors cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-orange-500/10 transition-colors">
                <Layout className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
              </div>
              <span className="text-white/90 font-bold text-sm">UI/UX Engine</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="h-8 rounded-lg bg-white/5 border border-white/5" />
              <div className="h-8 rounded-lg bg-orange-500/20 border border-orange-500/30" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Backend Systems */}
        <motion.div 
          className="absolute z-30"
          style={{ translateZ: 150, x: 40, y: 160 }}
          {...float(2, 4.5)}
        >
           <div className="w-52 p-4 rounded-2xl bg-gradient-to-br from-[#0a0a0f]/90 to-[#15100f]/90 backdrop-blur-xl border border-orange-500/20 shadow-[0_20px_40px_rgba(249,115,22,0.1)] flex flex-col gap-3 group hover:border-orange-500/50 transition-colors cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Database className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-white/90 font-bold text-sm">Scalable DB</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="w-full h-2 bg-white/10 rounded-full" />
              <div className="w-5/6 h-2 bg-white/10 rounded-full" />
              <div className="w-3/4 h-2 bg-orange-500/50 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Code Quality */}
        <motion.div 
          className="absolute z-10"
          style={{ translateZ: 40, x: -120, y: -160 }}
          {...float(1.5, 5.5)}
        >
           <div className="w-44 p-4 rounded-2xl bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col gap-2 cursor-default">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-gray-400" />
              <span className="text-white/70 font-bold text-xs uppercase tracking-wider">Clean Code</span>
            </div>
            <div className="text-[11px] text-orange-400 font-mono mt-2 bg-black/40 p-2 rounded-lg border border-white/5">
              <span className="text-pink-400">const</span>{' build = '}
              <span className="text-blue-400">()</span>{' => {'}
              <br/>
              &nbsp;&nbsp;<span className="text-green-400">return</span>{' <Success />'}
              <br/>
              {'}'}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
