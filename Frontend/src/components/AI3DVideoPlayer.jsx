import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, Torus, Cylinder, Plane, OrbitControls, Text, Cone } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Info,
  BookOpen,
  Lightbulb,
  Target,
  Brain,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';
import { aiVideoAPI } from '../api/api';

// Enhanced 3D Scene Component with AI-generated content
function AIScene3D({ isPlaying, topic, sceneConfig, educationalContent }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const fieldLinesRef = useRef();
  const particlesRef = useRef();

  useFrame((state, delta) => {
    if (isPlaying && sceneConfig) {
      // Rotate the main mesh
      if (meshRef.current) {
        meshRef.current.rotation.x += delta * (sceneConfig.animations?.rotation?.speed || 0.5);
        meshRef.current.rotation.y += delta * (sceneConfig.animations?.rotation?.speed || 0.3);
      }
      
      // Rotate the entire group
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.1;
      }

      // Animate field lines
      if (fieldLinesRef.current) {
        fieldLinesRef.current.children.forEach((line, index) => {
          line.position.y += Math.sin(state.clock.elapsedTime + index) * 0.01;
        });
      }

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.children.forEach((particle, index) => {
          particle.position.x += Math.sin(state.clock.elapsedTime + index) * 0.02;
          particle.position.z += Math.cos(state.clock.elapsedTime + index) * 0.02;
        });
      }
    }
  });

  // Render different 3D content based on topic
  const renderAIContent = () => {
    if (!sceneConfig) return null;

    // Check for electromagnetism topics (more flexible matching)
    const isElectromagnetism = topic?.title?.toLowerCase().includes('electromagnet') || 
                              topic?.title?.toLowerCase().includes('electric') ||
                              topic?.title?.toLowerCase().includes('magnetic');

    switch (true) {
      case isElectromagnetism:
        return (
          <group ref={groupRef}>
            {/* Central Electromagnet - More realistic */}
            <group position={[0, 0, 0]}>
              {/* Iron Core */}
              <Cylinder
                args={[0.3, 0.3, 2]}
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
              >
                <meshStandardMaterial 
                  color="#8B4513" 
                  metalness={0.8}
                  roughness={0.2}
                />
              </Cylinder>
              
              {/* Copper Wire Coils */}
              {[...Array(20)].map((_, i) => (
                <Torus
                  key={i}
                  args={[0.4 + i * 0.05, 0.02, 8, 16]}
                  position={[0, 0, 0]}
                  rotation={[Math.PI / 2, 0, i * 0.3]}
                >
                  <meshStandardMaterial 
                    color="#B87333" 
                    emissive="#B87333"
                    emissiveIntensity={0.1}
                  />
                </Torus>
              ))}
            </group>

            {/* Magnetic Field Lines - More realistic */}
            <group>
              {[...Array(12)].map((_, i) => (
                <group key={i}>
                  {/* Field line path */}
                  <Torus
                    args={[1.5 + i * 0.3, 0.03, 8, 32]}
                    position={[0, 0, 0]}
                    rotation={[Math.PI / 2, 0, i * Math.PI / 6]}
                  >
                    <meshStandardMaterial 
                      color="#00ff88" 
                      transparent 
                      opacity={0.8}
                      emissive="#00ff88"
                      emissiveIntensity={0.2}
                    />
                  </Torus>
                  
                  {/* Field direction arrows */}
                  {[...Array(8)].map((_, j) => (
                    <Cone
                      key={j}
                      args={[0.05, 0.2, 4]}
                      position={[
                        Math.cos(i * Math.PI / 6 + j * Math.PI / 4) * (1.5 + i * 0.3),
                        Math.sin(i * Math.PI / 6 + j * Math.PI / 4) * (1.5 + i * 0.3),
                        0
                      ]}
                      rotation={[0, 0, i * Math.PI / 6 + j * Math.PI / 4]}
                    >
                      <meshStandardMaterial 
                        color="#00ff88" 
                        emissive="#00ff88"
                        emissiveIntensity={0.5}
                      />
                    </Cone>
                  ))}
                </group>
              ))}
            </group>

            {/* Electric Current Flow - Visual representation */}
            <group ref={particlesRef}>
              {[...Array(15)].map((_, i) => (
                <Sphere
                  key={i}
                  args={[0.08]}
                  position={[
                    Math.cos(i * 0.4) * 0.5,
                    Math.sin(i * 0.4) * 0.5,
                    Math.sin(i * 0.3) * 0.2
                  ]}
                >
                  <meshStandardMaterial 
                    color="#ff6b35" 
                    emissive="#ff6b35"
                    emissiveIntensity={0.8}
                  />
                </Sphere>
              ))}
            </group>

            {/* Compass Needle - Shows magnetic field direction */}
            <group position={[2, 0, 0]}>
              <Cylinder
                args={[0.1, 0.1, 0.05]}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial color="#333" />
              </Cylinder>
              <Box
                args={[0.3, 0.05, 0.02]}
                position={[0, 0, 0.03]}
                rotation={[0, 0, Math.PI / 4]}
              >
                <meshStandardMaterial 
                  color="#ff0000" 
                  emissive="#ff0000"
                  emissiveIntensity={0.3}
                />
              </Box>
            </group>

            {/* Light Bulb - Shows electricity in action */}
            <group position={[-2, 1, 0]}>
              <Sphere
                args={[0.2]}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial 
                  color="#ffff88" 
                  emissive="#ffff88"
                  emissiveIntensity={0.6}
                />
              </Sphere>
              <Cylinder
                args={[0.1, 0.1, 0.3]}
                position={[0, -0.25, 0]}
              >
                <meshStandardMaterial color="#666" />
              </Cylinder>
            </group>

            {/* Wires connecting components */}
            <group>
              <Cylinder
                args={[0.02, 0.02, 4]}
                position={[1, 0, 0]}
                rotation={[0, 0, 0]}
              >
                <meshStandardMaterial color="#B87333" />
              </Cylinder>
              <Cylinder
                args={[0.02, 0.02, 4]}
                position={[-1, 0, 0]}
                rotation={[0, 0, 0]}
              >
                <meshStandardMaterial color="#B87333" />
              </Cylinder>
            </group>
          </group>
        );

      case topic?.title?.toLowerCase().includes('wave') || topic?.title?.toLowerCase().includes('optics'):
        return (
          <group ref={groupRef}>
            {/* Wave surfaces */}
            {[...Array(5)].map((_, i) => (
              <Plane
                key={i}
                args={[8, 8, 32, 32]}
                position={[0, 0, i * 0.5 - 1]}
                rotation={[0, 0, 0]}
              >
                <meshStandardMaterial 
                  color={sceneConfig.materials?.primary || '#3b82f6'} 
                  transparent 
                  opacity={0.3}
                  wireframe
                />
              </Plane>
            ))}

            {/* Wave sources */}
            <group>
              {[...Array(3)].map((_, i) => (
                <Sphere
                  key={i}
                  args={[0.3]}
                  position={[i * 2 - 2, 0, 0]}
                >
                  <meshStandardMaterial 
                    color={sceneConfig.materials?.secondary || '#10b981'}
                    emissive={sceneConfig.materials?.secondary || '#10b981'}
                    emissiveIntensity={0.5}
                  />
                </Sphere>
              ))}
            </group>

            {/* Title will be shown as HTML overlay */}
          </group>
        );

      case 'Molecular Structures in 3D':
        return (
          <group ref={groupRef}>
            {/* Central atom */}
            <Sphere
              ref={meshRef}
              args={[0.5]}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial 
                color={sceneConfig.materials?.primary || '#3b82f6'}
                emissive={sceneConfig.materials?.primary || '#3b82f6'}
                emissiveIntensity={0.2}
              />
            </Sphere>

            {/* Bonded atoms */}
            {[...Array(4)].map((_, i) => {
              const angle = (i * Math.PI) / 2;
              const x = Math.cos(angle) * 2;
              const z = Math.sin(angle) * 2;
              return (
                <group key={i}>
                  <Sphere
                    args={[0.3]}
                    position={[x, 0, z]}
                  >
                    <meshStandardMaterial 
                      color={sceneConfig.materials?.secondary || '#10b981'}
                    />
                  </Sphere>
                  {/* Bond line */}
                  <Cylinder
                    args={[0.05, 0.05, 2]}
                    position={[x / 2, 0, z / 2]}
                    rotation={[0, 0, Math.atan2(z, x)]}
                  >
                    <meshStandardMaterial 
                      color={sceneConfig.materials?.accent || '#f59e0b'}
                    />
                  </Cylinder>
                </group>
              );
            })}

            {/* Title will be shown as HTML overlay */}
          </group>
        );

      case 'Database Design':
        return (
          <group ref={groupRef}>
            {/* Database Tables Visualization */}
            <Box ref={meshRef} args={[1.5, 0.3, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#8b5cf6" />
            </Box>
            <Box args={[1.2, 0.3, 0.8]} position={[2.5, 0, 0]}>
              <meshStandardMaterial color="#06b6d4" />
            </Box>
            <Box args={[1, 0.3, 0.6]} position={[4.5, 0, 0]}>
              <meshStandardMaterial color="#10b981" />
            </Box>
            {/* Connection lines */}
            <Plane args={[0.1, 0.1]} position={[1.25, 0, 0]} rotation={[0, 0, Math.PI/4]}>
              <meshStandardMaterial color="#6b7280" />
            </Plane>
            <Plane args={[0.1, 0.1]} position={[3.5, 0, 0]} rotation={[0, 0, Math.PI/4]}>
              <meshStandardMaterial color="#6b7280" />
            </Plane>
            {/* Title will be shown as HTML overlay */}
          </group>
        );

      case 'SQL Queries':
        return (
          <group ref={groupRef}>
            {/* SQL Query Visualization */}
            <Cylinder ref={meshRef} args={[0.5, 0.5, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#3b82f6" />
            </Cylinder>
            <Cylinder args={[0.4, 0.4, 0.8]} position={[2, 0, 0]}>
              <meshStandardMaterial color="#10b981" />
            </Cylinder>
            <Cylinder args={[0.3, 0.3, 0.6]} position={[4, 0, 0]}>
              <meshStandardMaterial color="#f59e0b" />
            </Cylinder>
            {/* Title will be shown as HTML overlay */}
          </group>
        );

      case 'Database Security':
        return (
          <group ref={groupRef}>
            {/* Database Security Visualization */}
            <Torus ref={meshRef} args={[1, 0.3, 8, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#ef4444" />
            </Torus>
            <Torus args={[0.8, 0.2, 6, 12]} position={[2.5, 0, 0]}>
              <meshStandardMaterial color="#f97316" />
            </Torus>
            <Torus args={[0.6, 0.15, 4, 8]} position={[5, 0, 0]}>
              <meshStandardMaterial color="#eab308" />
            </Torus>
            {/* Title will be shown as HTML overlay */}
          </group>
        );

      // Chemistry topics mapping
      case 'Organic Chemistry':
        return (
          <group ref={groupRef}>
            <Sphere ref={meshRef} args={[0.5]} position={[0, 0, 0]}>
              <meshStandardMaterial color={sceneConfig.materials?.primary || '#3b82f6'} />
            </Sphere>
            {[...Array(3)].map((_, i) => (
              <Cylinder key={i} args={[0.05, 0.05, 1.5]} position={[Math.cos(i*2*Math.PI/3)*1.2, 0, Math.sin(i*2*Math.PI/3)*1.2]} rotation={[0, 0, i]}>
                <meshStandardMaterial color={sceneConfig.materials?.accent || '#f59e0b'} />
              </Cylinder>
            ))}
          </group>
        );
      case 'Physical Chemistry':
        return (
          <group ref={groupRef}>
            {[...Array(5)].map((_, i) => (
              <Plane key={i} args={[6, 6, 16, 16]} position={[0, 0, i*0.3-0.6]}>
                <meshStandardMaterial color={sceneConfig.materials?.secondary || '#10b981'} wireframe />
              </Plane>
            ))}
          </group>
        );
      case 'Inorganic Chemistry':
        return (
          <group ref={groupRef}>
            {[...Array(4)].map((_, i) => (
              <Sphere key={i} args={[0.3]} position={[Math.cos(i*Math.PI/2)*2, 0, Math.sin(i*Math.PI/2)*2]}>
                <meshStandardMaterial color={i%2? '#3b82f6':'#10b981'} />
              </Sphere>
            ))}
          </group>
        );
      case 'Analytical Chemistry':
        return (
          <group ref={groupRef}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} args={[1.2,0.2,0.8]} position={[i*1.8-1.8, 0, 0]}>
                <meshStandardMaterial color={['#8b5cf6','#06b6d4','#10b981'][i]} />
              </Box>
            ))}
          </group>
        );

      default:
        return (
          <group ref={groupRef}>
            <Box ref={meshRef} args={[2, 2, 2]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color={sceneConfig.materials?.primary || '#3b82f6'} 
                wireframe 
              />
            </Box>
            <Sphere args={[1]} position={[3, 0, 0]}>
              <meshStandardMaterial 
                color={sceneConfig.materials?.secondary || '#10b981'} 
                transparent 
                opacity={0.7} 
              />
            </Sphere>
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color={sceneConfig.materials?.accent || '#f59e0b'}
            >
              AI 3D Visualization
            </Text>
          </group>
        );
    }
  };

  return (
    <>
      {renderAIContent()}
      <OrbitControls 
        enablePan={sceneConfig?.interactions?.pan || true}
        enableZoom={sceneConfig?.interactions?.zoom || true}
        enableRotate={sceneConfig?.interactions?.orbit || true}
        autoRotate={isPlaying && (sceneConfig?.interactions?.autoRotate || true)}
        autoRotateSpeed={2}
      />
    </>
  );
}

// Loading component for 3D content
function Loading3D() {
  return (
    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Generating AI 3D Content...</p>
        <p className="text-gray-400 text-sm">Creating interactive visualization</p>
      </div>
    </div>
  );
}

// Main AI 3D Video Player Component
const AI3DVideoPlayer = ({ topic, isVisible = true, onVideoComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const [showExplain, setShowExplain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneConfig, setSceneConfig] = useState(null);
  const [educationalContent, setEducationalContent] = useState(null);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(300); // 5 minutes default
  const speechSynthesisRef = useRef(null);
  const containerRef = useRef();

  // Generate AI content when component mounts
  useEffect(() => {
    const generateAIContent = async () => {
      if (!topic) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user is authenticated before making API call
        const token = localStorage.getItem('token') || localStorage.getItem('edulearn_token');
        
        if (!token) {
          console.log('⚠️ No authentication token found, using fallback 3D content');
          const fallbackConfig = generateFallbackSceneConfig(topic);
          setSceneConfig(fallbackConfig.sceneConfig);
          setEducationalContent(fallbackConfig.educationalContent);
          setError(null);
          return;
        }

        // Try to generate AI content (this might fail if API is not available or if not authenticated)
        const response = await aiVideoAPI.generate({
          topic: topic.title || topic,
          subject: topic.subject || 'Physics',
          grade: '12th'
        });
        
        if (response.status === 'success') {
          setSceneConfig(response.data.sceneConfig);
          setEducationalContent(response.data.educationalContent);
        } else {
          throw new Error(response.message || 'Failed to generate AI content');
        }
      } catch (err) {
        console.log('AI Content Generation Error (401 or other):', err.message);
        console.log('⚠️ Using fallback 3D content instead of AI-generated content');
        
        // Always use fallback content instead of showing error
        // This happens when:
        // 1. User is not authenticated (401 error)
        // 2. AI video generation API is down
        // 3. Network issues
        const fallbackConfig = generateFallbackSceneConfig(topic);
        setSceneConfig(fallbackConfig.sceneConfig);
        setEducationalContent(fallbackConfig.educationalContent);
        setError(null); // Clear error since we have fallback content
      } finally {
        setIsLoading(false);
      }
    };

    generateAIContent();
  }, [topic]);

  // Generate explanations for the topic - Better timing and content
  const generateExplanations = (topic) => {
    const topicName = topic.title || topic || 'General';
    const subject = topic.subject || 'Physics';
    
    return [
      {
        time: 0,
        text: `Welcome to our interactive lesson on ${topicName}. Today we'll explore this fascinating topic in ${subject} with a detailed 3D visualization.`
      },
      {
        time: 25,
        text: `Look at the center - you can see an electromagnet with an iron core wrapped in copper wire coils. This is the heart of our demonstration.`
      },
      {
        time: 50,
        text: `The glowing green lines show magnetic field lines. Notice how they form complete loops from one end of the magnet to the other.`
      },
      {
        time: 75,
        text: `The orange particles represent electric current flowing through the wire. Watch how they move in a circular pattern around the core.`
      },
      {
        time: 100,
        text: `On the right, you can see a compass needle. It points in the direction of the magnetic field, showing us the field's orientation.`
      },
      {
        time: 125,
        text: `The glowing light bulb on the left demonstrates how electricity can be converted into light energy through electromagnetic principles.`
      },
      {
        time: 150,
        text: `The brown wires connect all components, showing how electricity flows through a complete circuit to power our devices.`
      },
      {
        time: 175,
        text: `This entire system demonstrates Faraday's law - when electric current flows through a wire, it creates a magnetic field around it.`
      },
      {
        time: 200,
        text: `Electromagnets are used in electric motors, generators, MRI machines, and many other technologies we use every day.`
      },
      {
        time: 225,
        text: `The strength of the magnetic field depends on the amount of current and the number of wire turns around the core.`
      },
      {
        time: 250,
        text: `When we turn off the electricity, the magnetic field disappears. This is why electromagnets are so useful - we can control them.`
      },
      {
        time: 275,
        text: `That completes our exploration of ${topicName}. You've seen how electricity and magnetism work together to create powerful forces.`
      }
    ];
  };

  // Text-to-Speech functionality - Improved for smooth speech
  const speakText = (text) => {
    if (isMuted) return;
    
    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 0.9; // Higher volume
    
    // Try to use a more natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Zira')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('🎤 AI started speaking:', text.substring(0, 50) + '...');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('🎤 AI finished speaking');
    };
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      console.error('🎤 Speech error:', event.error);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Video progress simulation
  useEffect(() => {
    let interval;
    if (isPlaying && !isLoading) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= videoDuration) {
            setIsPlaying(false);
            onVideoComplete && onVideoComplete();
            return videoDuration;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLoading, videoDuration, onVideoComplete]);

  // Auto-play explanations based on video progress - Fixed timing with better logic
  useEffect(() => {
    if (isPlaying && !isMuted && topic) {
      const explanations = generateExplanations(topic);
      const currentExplanation = explanations.find(exp => 
        exp.time <= videoProgress && 
        (explanations[explanations.indexOf(exp) + 1]?.time > videoProgress || 
         explanations.indexOf(exp) === explanations.length - 1)
      );
      
      // Only speak if we have a new explanation and we're not already speaking
      if (currentExplanation && 
          currentExplanation.text !== currentExplanation && 
          !isSpeaking) {
        setCurrentExplanation(currentExplanation.text);
        speakText(currentExplanation.text);
      }
    }
  }, [videoProgress, isPlaying, isMuted, topic, isSpeaking, currentExplanation]);

  // Generate fallback scene config
  const generateFallbackSceneConfig = (topic) => {
    const topicName = topic.title || topic || 'General';
    
    return {
      sceneConfig: {
        lighting: {
          ambient: 0.4,
          directional: 0.8,
          color: '#ffffff'
        },
        materials: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#f59e0b'
        },
        animations: {
          rotation: { speed: 0.5 },
          particles: { speed: 1.0 }
        }
      },
      educationalContent: {
        concepts: [
          `Understanding ${topicName}`,
          'Key principles and applications',
          'Real-world examples',
          'Problem-solving techniques'
        ],
        equations: [
          'Fundamental equations',
          'Derived formulas',
          'Practical applications'
        ],
        applications: [
          'Industry applications',
          'Research applications',
          'Everyday examples'
        ]
      }
    };
  };

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

  // Handle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.pause();
    } else {
      setIsPlaying(true);
      if (!isMuted && topic) {
        const explanations = generateExplanations(topic);
        const currentExplanation = explanations.find(exp => 
          exp.time <= videoProgress && 
          (explanations[explanations.indexOf(exp) + 1]?.time > videoProgress || 
           explanations.indexOf(exp) === explanations.length - 1)
        );
        if (currentExplanation) {
          speakText(currentExplanation.text);
        }
      }
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    setIsMuted(prev => {
      if (!prev) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  };

  // Reset 3D scene
  const reset3DScene = () => {
    setIsPlaying(false);
  };

  if (!isVisible || !topic) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-gray-900 rounded-xl overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'
      }`}
    >
      {/* Loading State (outside Canvas to avoid R3F host DOM) */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-12 h-12 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-red-900 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Generation Failed</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* 3D Canvas Layer */}
      {!isLoading && !error && show3D && sceneConfig && (
        <div className="absolute inset-0 w-full h-full">
          <Canvas
            camera={{ 
              position: sceneConfig.camera?.position || [5, 5, 5], 
              fov: sceneConfig.camera?.fov || 60 
            }}
            style={{ background: 'transparent' }}
          >
            {/* Suspense fallback must not render DOM inside Canvas; use null here */}
            <Suspense fallback={null}>
              <AIScene3D 
                isPlaying={isPlaying} 
                topic={topic} 
                sceneConfig={sceneConfig}
                educationalContent={educationalContent}
              />
            </Suspense>
            {/* OrbitControls removed to prevent R3F errors */}
          </Canvas>
          
          {/* 3D Scene Title Overlay */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
              {topic?.title || topic?.name || '3D Visualization'}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!isLoading && !error && (
        <div className="absolute bottom-16 left-0 right-0 px-4">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(videoProgress / videoDuration) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-white text-xs mt-1">
            <span>{Math.floor(videoProgress / 60)}:{(videoProgress % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {!isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>

              {isSpeaking && (
                <div className="flex items-center space-x-2 text-white text-sm">
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>AI Speaking...</span>
                </div>
              )}

              <button
                onClick={() => setShow3D(!show3D)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Brain className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExplain(!showExplain)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Info className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={reset3DScene}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational Content Sidebar */}
      <AnimatePresence>
        {showExplain && educationalContent && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-0 right-0 w-80 h-full bg-white/95 backdrop-blur-xl overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Educational Content
              </h3>
              <button
                onClick={() => setShowExplain(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Key Concepts */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Key Concepts
                </h4>
                <ul className="space-y-2">
                  {educationalContent.concepts?.map((concept, index) => (
                    <li key={index} className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {concept}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Equations */}
              {educationalContent.equations && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-500" />
                    Important Equations
                  </h4>
                  <ul className="space-y-2">
                    {educationalContent.equations.map((equation, index) => (
                      <li key={index} className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg font-mono">
                        {equation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Applications */}
              {educationalContent.applications && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    Real-World Applications
                  </h4>
                  <ul className="space-y-2">
                    {educationalContent.applications.map((application, index) => (
                      <li key={index} className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                        {application}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generated Badge */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Generated
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AI3DVideoPlayer;
