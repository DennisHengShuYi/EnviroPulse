import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

const Globe = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial 
        color="#00f0ff" 
        wireframe 
        transparent 
        opacity={0.2} 
      />
      
      {/* Outer rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.01, 16, 100]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.1} />
      </mesh>
      
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3.2, 0.005, 16, 100]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.05} />
      </mesh>
    </mesh>
  );
};

const GlobeVisualization = () => {
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Globe />
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* Background radial lines effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: -1
      }}></div>
    </div>
  );
};

export default GlobeVisualization;
