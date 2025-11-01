import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Skill visualization component based on visualization type
const SkillShape = ({ visualization, skillName }) => {
  const meshRef = useRef();

  React.useEffect(() => {
    if (meshRef.current) {
      // Add animation based on visualization type
      const animate = () => {
        if (meshRef.current && visualization.animation) {
          switch (visualization.animation.type) {
            case 'pulse':
              meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.1);
              break;
            case 'rotate':
              meshRef.current.rotation.y += 0.01;
              break;
            case 'float':
              meshRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.3;
              break;
            default:
              break;
          }
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [visualization]);

  const getShape = () => {
    switch (visualization.geometry.shape) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.7, 32, 32]} />;
      case 'mesh':
        return <octahedronGeometry args={[0.7]} />;
      case 'tree':
        return <coneGeometry args={[0.7, 1.5, 8]} />;
      case 'network':
        return <tetrahedronGeometry args={[0.8]} />;
      case 'molecule':
        return <icosahedronGeometry args={[0.6]} />;
      default:
        return <sphereGeometry args={[0.7, 32, 32]} />;
    }
  };

  const primaryColor = new THREE.Color(visualization.colorScheme.primary);
  const secondaryColor = new THREE.Color(visualization.colorScheme.secondary);
  const accentColor = new THREE.Color(visualization.colorScheme.accent);

  return (
    <group ref={meshRef}>
      <mesh>
        {getShape()}
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.5}
          roughness={0.3}
          emissive={accentColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Additional decorative elements */}
      <mesh position={[0, 0, -1.2]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshStandardMaterial
          color={secondaryColor}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Skill name text */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color={primaryColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {skillName}
      </Text>
    </group>
  );
};

const SkillVisualization3D = ({ skillData, onClose }) => {
  const visualization = skillData?.visualization || {
    type: 'abstract',
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4'
    },
    geometry: {
      shape: 'sphere',
      complexity: 'medium'
    },
    animation: {
      type: 'float',
      speed: 'slow'
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-lg p-3 backdrop-blur-md transition-all duration-300"
          aria-label="Close visualization"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Info panel */}
        <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs">
          <h3 className="text-white font-bold text-lg mb-2">{skillData?.skillName || 'Skill'}</h3>
          <p className="text-white/80 text-sm">{visualization.description || 'Visual representation of this skill'}</p>
        </div>

        {/* 3D Canvas */}
        <div className="w-full h-full">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />
              <pointLight position={[5, -5, 5]} intensity={0.5} color="#8b5cf6" />

              <SkillShape visualization={visualization} skillName={skillData?.skillName || 'Skill'} />

              <OrbitControls
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                autoRotate={true}
                autoRotateSpeed={0.5}
                minDistance={3}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/40 backdrop-blur-md rounded-lg p-3 text-white/80 text-sm">
          <p>🎮 Click and drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
};

export default SkillVisualization3D;
