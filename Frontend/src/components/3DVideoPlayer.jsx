import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';

// 3D Scene Component with rotating elements
function Scene3D({ isPlaying, topic }) {
  const meshRef = useRef();
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (isPlaying) {
      // Rotate the main mesh
      if (meshRef.current) {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.3;
      }
      // Rotate the entire group
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  // Different 3D scenes based on subject
  const render3DContent = () => {
    switch (topic?.subject) {
      case 'Mathematics':
        return (
          <group ref={groupRef}>
            {/* Mathematical function visualization */}
            <Box ref={meshRef} args={[2, 2, 2]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#3b82f6" wireframe />
            </Box>
            <Sphere args={[1]} position={[3, 0, 0]}>
              <meshStandardMaterial color="#10b981" transparent opacity={0.7} />
            </Sphere>
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color="#1f2937"
              anchorX="center"
              anchorY="middle"
            >
              {topic?.title || 'Mathematics 3D'}
            </Text>
          </group>
        );
      
      case 'Physics':
        return (
          <group ref={groupRef}>
            {/* Physics field lines visualization */}
            {[...Array(8)].map((_, i) => (
              <Box
                key={i}
                args={[0.1, 3, 0.1]}
                position={[
                  Math.cos((i / 8) * Math.PI * 2) * 2,
                  0,
                  Math.sin((i / 8) * Math.PI * 2) * 2
                ]}
                rotation={[0, (i / 8) * Math.PI * 2, 0]}
              >
                <meshStandardMaterial color="#ef4444" />
              </Box>
            ))}
            <Sphere ref={meshRef} args={[0.5]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#f59e0b" />
            </Sphere>
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color="#1f2937"
              anchorX="center"
              anchorY="middle"
            >
              {topic?.title || 'Physics 3D'}
            </Text>
          </group>
        );
      
      case 'Chemistry':
        return (
          <group ref={groupRef}>
            {/* Molecular structure visualization */}
            <Sphere ref={meshRef} args={[0.8]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#8b5cf6" />
            </Sphere>
            {[...Array(4)].map((_, i) => (
              <Sphere
                key={i}
                args={[0.3]}
                position={[
                  Math.cos((i / 4) * Math.PI * 2) * 2.5,
                  Math.sin((i / 4) * Math.PI) * 1,
                  Math.sin((i / 4) * Math.PI * 2) * 2.5
                ]}
              >
                <meshStandardMaterial color="#06b6d4" />
              </Sphere>
            ))}
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color="#1f2937"
              anchorX="center"
              anchorY="middle"
            >
              {topic?.title || 'Chemistry 3D'}
            </Text>
          </group>
        );
      
      case 'Computer Science':
        return (
          <group ref={groupRef}>
            {/* Data structure visualization */}
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                ref={i === 0 ? meshRef : null}
                args={[1, 1, 1]}
                position={[i * 1.5 - 3, Math.sin(i) * 0.5, 0]}
              >
                <meshStandardMaterial 
                  color={i === 0 ? '#f59e0b' : '#3b82f6'} 
                  transparent 
                  opacity={0.8} 
                />
              </Box>
            ))}
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color="#1f2937"
              anchorX="center"
              anchorY="middle"
            >
              {topic?.title || 'CS 3D'}
            </Text>
          </group>
        );
      
      default:
        return (
          <group ref={groupRef}>
            <Box ref={meshRef} args={[2, 2, 2]}>
              <meshStandardMaterial color="#6366f1" />
            </Box>
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color="#1f2937"
              anchorX="center"
              anchorY="middle"
            >
              3D Learning
            </Text>
          </group>
        );
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={0.3} />
      
      {/* 3D Content */}
      {render3DContent()}
    </>
  );
}

// Loading fallback component
function Loading3D() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D Scene...</p>
      </div>
    </div>
  );
}

// Main 3D Video Player Component
const VideoPlayer3D = ({ topic, videoUrl, isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const [showExplain, setShowExplain] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const containerRef = useRef();
  const iframeRef = useRef();

  // Initialize video playback on mount or when videoUrl changes
  useEffect(() => {
    if (videoUrl && !isPlaying) {
      // Auto-play when component mounts or videoUrl changes
      setIsPlaying(true);
      setIsMuted(false); // Unmute for better experience
    }
  }, [videoUrl]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Build an embeddable URL that can request autoplay/mute for providers like YouTube
  const buildVideoSrc = () => {
    if (!videoUrl) return '';
    
    // Check if it's a YouTube URL
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    
    if (isYouTube) {
      // Extract video ID from URL
      let videoId = '';
      const match = videoUrl.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (match) {
        videoId = match[1];
      }
      
      if (videoId) {
        // Build proper YouTube embed URL
        const muteParam = isMuted ? '&mute=1' : '';
        const autoplayParam = isPlaying ? '&autoplay=1' : '';
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&controls=1${autoplayParam}${muteParam}`;
      }
    }
    
    // For other URLs, just append parameters
    const hasQuery = videoUrl.includes('?');
    const sep = hasQuery ? '&' : '?';
    return `${videoUrl}${sep}autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`;
  };

  // Handle play/pause – for iframe we trigger by changing the src with autoplay param
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
    setVideoKey(k => k + 1);
  };

  // Reset 3D scene
  const reset3DScene = () => {
    setIsPlaying(false);
    // Could add camera reset logic here
  };

  if (!isVisible) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-gray-900 rounded-xl overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'
      }`}
    >
      {/* Video Layer (when available) */}
      {videoUrl && (
        <iframe
          ref={iframeRef}
          key={videoKey}
          src={buildVideoSrc()}
          title={topic?.title || '3D Educational Video'}
          className={`absolute inset-0 w-full h-full ${show3D ? 'opacity-50' : 'opacity-100'}`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullscreen
          frameBorder="0"
        />
      )}

      {/* 3D Canvas Layer */}
      {show3D && (
        <div className="absolute inset-0 w-full h-full">
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <Scene3D isPlaying={isPlaying} topic={topic} />
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={isPlaying}
                autoRotateSpeed={2}
              />
            </Suspense>
          </Canvas>
          
          {/* Loading Overlay */}
          <Suspense fallback={<Loading3D />}>
            <div />
          </Suspense>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlayPause}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => { setIsMuted(m => !m); setVideoKey(k => k + 1); }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={reset3DScene}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              title="Reset 3D Scene"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Center - Topic Title */}
          <div className="text-center">
            <h3 className="font-medium text-sm">{topic?.title || '3D Learning'}</h3>
            <p className="text-xs text-white/70">{topic?.subject}</p>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExplain(v => !v)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                showExplain ? 'bg-emerald-500 text-white' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle Concept Guide"
            >
              Guide
            </button>
            <button
              onClick={() => setShow3D(!show3D)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                show3D 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              3D
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Scene Info */}
      {show3D && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>3D Interactive Mode</span>
          </div>
        </div>
      )}

      {/* Concept Guide Drawer (lightweight explanation) */}
      {showExplain && (
        <div className="absolute top-0 right-0 h-full w-72 bg-black/60 text-white p-4 overflow-auto">
          <h4 className="font-semibold mb-2">Concept Guide</h4>
          <ul className="space-y-2 text-sm text-white/90 list-disc list-inside">
            {(topic?.notes || topic?.content?.notes || '')
              .split('\n')
              .filter(line => line.trim() && !line.trim().startsWith('#'))
              .slice(0, 10)
              .map((line, idx) => (
                <li key={idx}>{line.replace(/^[-*]\s?/, '')}</li>
              ))}
            {!(topic?.notes || topic?.content?.notes) && (
              <li>Watch the video and use the 3D toggle to explore the structure.</li>
            )}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default VideoPlayer3D;
