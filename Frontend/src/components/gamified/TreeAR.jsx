import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { XR, ARButton, useXR } from '@react-three/xr'
import * as THREE from 'three'

// Tree model component with trunk and leaves
function TreeModel({ position = [0, 0, -0.5] }) {
  const treeRef = useRef()
  
  useEffect(() => {
    if (!treeRef.current) return
    let animationFrame
    const animate = () => {
      if (treeRef.current) {
        // Gentle swaying animation
        treeRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.05
      }
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <group ref={treeRef} position={position}>
      {/* Tree trunk */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={new THREE.Color('#8B4513')} />
      </mesh>
      
      {/* Tree leaves/crown - bottom layer */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.25, 0.4, 8]} />
        <meshStandardMaterial color={new THREE.Color('#22c55e')} />
      </mesh>
      
      {/* Tree leaves/crown - middle layer */}
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.2, 0.35, 8]} />
        <meshStandardMaterial color={new THREE.Color('#16a34a')} />
      </mesh>
      
      {/* Tree leaves/crown - top layer */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color={new THREE.Color('#15803d')} />
      </mesh>
    </group>
  )
}

// Fallback simple tree for non-AR mode
function SimpleTree() {
  return (
    <group position={[0, 0, -1]}>
      {/* Tree trunk */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={new THREE.Color('#8B4513')} />
      </mesh>
      
      {/* Tree leaves */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.3, 0.5, 8]} />
        <meshStandardMaterial color={new THREE.Color('#22c55e')} />
      </mesh>
    </group>
  )
}

// AR Session tracker component
function ARSessionTracker({ onSessionStart, onSessionEnd }) {
  const { session } = useXR()
  
  useEffect(() => {
    if (!session) return
    
    if (onSessionStart) onSessionStart()
    
    const handleEnd = () => {
      if (onSessionEnd) onSessionEnd()
    }
    
    session.addEventListener('end', handleEnd)
    return () => {
      session.removeEventListener('end', handleEnd)
    }
  }, [session, onSessionStart, onSessionEnd])
  
  return null
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.85)',
  zIndex: 100000,
  display: 'flex',
  flexDirection: 'column',
  visibility: 'visible',
  opacity: 1,
  pointerEvents: 'auto',
}

const closeBtnStyle = {
  position: 'fixed',
  top: 12,
  right: 12,
  zIndex: 1000010,
  background: '#111827',
  color: '#fff',
  padding: '10px 18px',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
  border: 'none',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  pointerEvents: 'auto',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

export default function TreeAR({ onClose }) {
  const overlayRef = useRef(null)
  const containerRef = useRef(null)
  const [arSupported, setArSupported] = useState(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [arSessionActive, setArSessionActive] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Create portal container
  useEffect(() => {
    console.log('🌲 TreeAR component mounted')
    const container = document.createElement('div')
    container.id = 'ar-modal-container'
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.zIndex = '100000'
    document.body.appendChild(container)
    containerRef.current = container
    setMounted(true)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    const check = async () => {
      try {
        console.log('🔍 Checking AR support...')
        if (navigator.xr && navigator.xr.isSessionSupported) {
          const ok = await navigator.xr.isSessionSupported('immersive-ar')
          console.log('📱 AR supported:', ok)
          setArSupported(ok)
        } else {
          console.log('❌ navigator.xr not available')
          setArSupported(false)
        }
      } catch (error) {
        console.error('⚠️ AR check error:', error)
        setArSupported(false)
      }
    }
    check()
    
    return () => { 
      console.log('🧹 TreeAR component unmounting')
      document.body.style.overflow = prevOverflow
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current)
      }
    }
  }, [])

  const arButtonStyle = {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10010,
  }

  console.log('🎨 Rendering TreeAR - arSupported:', arSupported, 'canvasReady:', canvasReady, 'mounted:', mounted)

  const modalContent = (
    <div 
      ref={overlayRef} 
      style={overlayStyle}
      onClick={(e) => {
        // Prevent canvas from capturing clicks on overlay
        if (e.target === overlayRef.current) {
          e.stopPropagation()
        }
      }}
    >
      <button 
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('❌ Close AR clicked')
          if (onClose && typeof onClose === 'function') {
            onClose()
          } else {
            console.error('⚠️ onClose is not a function:', onClose)
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        style={closeBtnStyle}
        type="button"
        aria-label="Close AR"
      >
        ✕ Close AR
      </button>

      {arSupported === false ? (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#fef3c7', color: '#92400e', padding: '12px 20px', borderRadius: 8, zIndex: 100002, fontSize: 14, maxWidth: '90%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          ⚠️ AR not supported on this device/browser. Showing 3D preview instead.
        </div>
      ) : arSupported === null ? (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#e5e7eb', color: '#111827', padding: '12px 20px', borderRadius: 8, zIndex: 100002, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          🔍 Checking AR support...
        </div>
      ) : (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: 8, zIndex: 100002, fontSize: 14, maxWidth: '90%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          ✅ AR Ready! Tap the button below to start planting your virtual tree.
        </div>
      )}

      <Canvas 
        style={{ 
          width: '100%', 
          height: '100%', 
          flex: 1, 
          zIndex: 100001, 
          pointerEvents: 'auto',
          position: 'relative'
        }} 
        gl={{ antialias: true, alpha: true, xrCompatible: true }} 
        camera={{ position: [0, 0, 2], fov: 75 }}
        raycaster={{ computeOffsets: ({ clientX, clientY }) => ({ offsetX: clientX, offsetY: clientY }) }}
        onCreated={({ gl }) => { 
          console.log('🎬 Canvas created, setting up WebGL...')
          gl.setClearAlpha(0);
          if (gl.xr) {
            gl.xr.enabled = true;
            console.log('✅ WebXR enabled')
          }
          setCanvasReady(true);
          console.log('✅ Canvas ready')
        }}
      >
        {canvasReady && arSupported ? (
          <XR referenceSpace="local-floor">
            <ambientLight intensity={0.6} />
            <directionalLight position={[1, 2, 1]} intensity={0.8} />
            <TreeModel position={[0, 0, -0.8]} />
            <ARSessionTracker onSessionEnd={() => {
              setArSessionActive(false)
              // Award points when AR session ends
              if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('ar-task-completed', { 
                  detail: { type: 'tree_planting', points: 20 } 
                }));
              }
              onClose()
            }} onSessionStart={() => setArSessionActive(true)} />
          </XR>
        ) : (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[1, 2, 1]} intensity={0.8} />
            <SimpleTree />
          </>
        )}

        {canvasReady && arSupported && (
          <ARButton 
            style={{
              ...arButtonStyle,
              zIndex: 1000020,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
            sessionInit={{ 
              optionalFeatures: ['hit-test', 'dom-overlay', 'local-floor'],
              domOverlay: { root: overlayRef.current || document.body }
            }}
          >
            🌱 Start AR Planting
          </ARButton>
        )}
      </Canvas>
      
      {canvasReady && !arSupported && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: '#10b981', 
            color: '#fff', 
            padding: '12px 24px', 
            borderRadius: 8, 
            zIndex: 1000020, 
            fontSize: 16, 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            pointerEvents: 'auto',
            userSelect: 'none'
          }}
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('✅ Complete 3D Preview clicked - Awarding points')
            
            try {
              // Award points for 3D preview completion
              const event = new CustomEvent('ar-task-completed', { 
                detail: { type: 'tree_planting', points: 20 },
                bubbles: true,
                cancelable: true
              })
              
              console.log('📤 Dispatching ar-task-completed event:', event.detail)
              
              // Dispatch on window
              window.dispatchEvent(event)
              
              // Also dispatch on document for broader reach
              document.dispatchEvent(event)
              
              // Small delay to ensure event is processed
              await new Promise(resolve => setTimeout(resolve, 100))
              
              console.log('✅ Points event dispatched, closing modal')
              
              // Close modal after awarding points
              if (onClose && typeof onClose === 'function') {
                onClose();
              }
            } catch (error) {
              console.error('❌ Error in Complete 3D Preview:', error)
              // Still close the modal even if there's an error
              if (onClose && typeof onClose === 'function') {
                onClose();
              }
            }
          }}
        >
          ✓ Complete 3D Preview (+20 Points)
        </div>
      )}
      
      {/* AR Session completion handler */}
      {arSessionActive && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(16, 185, 129, 0.9)', color: '#fff', padding: '10px 20px', borderRadius: 8, zIndex: 60, fontSize: 14, textAlign: 'center' }}>
          AR Session Active - Tap to place tree in your space
        </div>
      )}
    </div>
  )

  // Use portal to render directly to body
  if (!mounted || !containerRef.current) {
    return null
  }

  return createPortal(modalContent, containerRef.current)
}

