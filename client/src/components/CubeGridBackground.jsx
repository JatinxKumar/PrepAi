import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

function GlowingCube() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Very subtle floating animation on Y-axis
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#050816" transparent={true} opacity={0.9} />
      <Edges linewidth={2} color="#00FFFF" />
    </mesh>
  );
}

function CubeGroup() {
  const groupRef = useRef();
  const size = 5; // 5x5 grid
  const spacing = 1.5;

  useFrame((state, delta) => {
    if (groupRef.current && state.pointer) {
      // Parallax effect based on mouse movement
      const rotateX = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (state.pointer.y - 0.5) * 0.5, // Map [-0.5, 0.5] to rotation
        0.1
      );
      const rotateY = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        (state.pointer.x - 0.5) * 0.5,
        0.1
      );
      groupRef.current.rotation.set(rotateX, rotateY, groupRef.current.rotation.z);
    }
  });

  // Initial isometric/diamond perspective rotation
  const initialRotation = [0.5, 0.75, 0];

  return (
    <group ref={groupRef} rotation={initialRotation}>
      {[...Array(size)].flatMap((_, x) => 
        [...Array(size)].map((_, y) => (
          <GlowingCube 
            key={`${x}-${y}`} 
            position={[
              (x - size/2) * spacing, 
              0, 
              (y - size/2) * spacing
            ]} 
          />
        ))
      )}
    </group>
  );
}

export default function CubeGridBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050816]">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 35 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <CubeGroup />
      </Canvas>
    </div>
  );
}