import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PointMaterial, Points, Sphere } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import './Background3D.css';

function ParticleField() {
  const ref = useRef();
  
  // Use refs for high-frequency animation inputs to avoid React re-render thrashing
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Generate random points in a sphere
  const count = 3000;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.cbrt(Math.random()) * 15; // Radius of 15

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  // Generate colors (mix of electric blue and violet)
  const colors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const color1 = new THREE.Color('#2997ff'); // Electric blue
    const color2 = new THREE.Color('#6c5ce7'); // Violet
    
    for (let i = 0; i < count; i++) {
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return colors;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const scrollY = scrollRef.current;
    
    // 3D rotation & depth reacts dynamically to page scroll without React re-renders
    ref.current.rotation.x = -(scrollY * 0.0006) - (state.clock.getElapsedTime() / 18);
    ref.current.rotation.y = (scrollY * 0.0004) - (state.clock.getElapsedTime() / 22);
    ref.current.position.z = Math.sin(scrollY * 0.0015) * 2;
    
    // Parallax effect based on mouse
    const targetX = mouseRef.current.x * 0.8;
    const targetY = mouseRef.current.y * 0.8;
    
    ref.current.position.x += (targetX - ref.current.position.x) * 0.05;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function CenterGeometry() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 0]} />
        <meshBasicMaterial 
          color="#2997ff" 
          wireframe 
          transparent 
          opacity={0.03} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Float>
  );
}

export default function Background3D() {
  return (
    <div className="background-3d-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 20]} />
        <ParticleField />
        <CenterGeometry />
      </Canvas>
    </div>
  );
}
