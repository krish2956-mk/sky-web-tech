import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const DENSE_COUNT = 200; // Dense cluster

const BubbleSwarm = () => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions to create a spherical cluster
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < DENSE_COUNT; i++) {
      // Distribute in a spherical volume
      const r = 8 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const scale = Math.random() * 0.6 + 0.15; // Varying bubble sizes
      const speed = Math.random() * 0.2 + 0.1;
      const factor = Math.random() * 100;
      temp.push({ x, y, z, scale, speed, factor });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Complex, organic floating motion
      const t = particle.factor + time * particle.speed;
      
      dummy.position.set(
        particle.x + Math.cos(t) * 1.5,
        particle.y + Math.sin(t) * 1.5,
        particle.z + Math.cos(t * 0.8) * 1.5
      );
      
      dummy.scale.set(particle.scale, particle.scale, particle.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Slowly rotate the entire swarm
    meshRef.current.rotation.y = time * 0.08;
    meshRef.current.rotation.x = time * 0.04;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, DENSE_COUNT]}>
      <sphereGeometry args={[1, 64, 64]} />
      {/* Premium glowing orange glass material */}
      <meshPhysicalMaterial
        color="#fb923c"
        emissive="#ea580c"
        emissiveIntensity={0.1}
        roughness={0.05}
        metalness={0.2}
        transmission={0.95} // High transmission for glass look
        thickness={0.8}
        ior={1.3}
        clearcoat={1}
        clearcoatRoughness={0.1}
        opacity={1}
        transparent={true}
      />
    </instancedMesh>
  );
};

export default function BubbleScene() {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 18], fov: 45 }} className="pointer-events-none">
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#fb923c" />
        <directionalLight position={[-10, -10, -10]} intensity={1} color="#ea580c" />
        
        {/* Soft, beautiful lighting reflections on the glass bubbles */}
        <Environment preset="city" />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <BubbleSwarm />
        </Float>
      </Canvas>
    </div>
  );
}
