import React, { useEffect, useRef, useState } from 'react'
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
  inset: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.02)',
  zIndex: 9999,
}

const closeBtnStyle = {
  position: 'fixed',
  top: 12,
  right: 12,
  zIndex: 60,
  background: '#111827',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: 8,
  fontSize: 14,
}

export default function TreeAR({ onClose }) {
  const overlayRef = useRef(null)
  const [arSupported, setArSupported] = useState(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [arSessionActive, setArSessionActive] = useState(false)

  useEffect(() => {
    let mounted = true
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const check = async () => {
      try {
        if (navigator.xr && navigator.xr.isSessionSupported) {
          const ok = await navigator.xr.isSessionSupported('immersive-ar')
          if (mounted) setArSupported(ok)
        } else {
          if (mounted) setArSupported(false)
        }
      } catch {
        if (mounted) setArSupported(false)
      }
    }
    check()
    return () => { 
      mounted = false 
      document.body.style.overflow = prevOverflow
    }
  }, [])

  const arButtonStyle = {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10010,
  }

  return (
    <div ref={overlayRef} style={overlayStyle}>
      <button onClick={onClose} style={closeBtnStyle}>✕ Close AR</button>

      {arSupported === false ? (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: 8, zIndex: 60, fontSize: 14, maxWidth: '90%', textAlign: 'center' }}>
          ⚠️ AR not supported on this device/browser. Showing 3D preview instead.
        </div>
      ) : arSupported === null ? (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#e5e7eb', color: '#111827', padding: '8px 16px', borderRadius: 8, zIndex: 60, fontSize: 14 }}>
          Checking AR support...
        </div>
      ) : (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#d1fae5', color: '#065f46', padding: '8px 16px', borderRadius: 8, zIndex: 60, fontSize: 14, maxWidth: '90%', textAlign: 'center' }}>
          ✅ AR Ready! Tap the button below to start planting your virtual tree.
        </div>
      )}

      <Canvas 
        style={{ width: '100%', height: '100%' }} 
        gl={{ antialias: true, alpha: true, xrCompatible: true }} 
        camera={{ position: [0, 0, 2], fov: 75 }}
        onCreated={({ gl }) => { 
          gl.setClearAlpha(0);
          if (gl.xr) {
            gl.xr.enabled = true;
          }
          setCanvasReady(true);
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
            style={arButtonStyle}
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
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, zIndex: 60, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          onClick={() => {
            // Award points for 3D preview completion
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('ar-task-completed', { detail: { type: 'tree_planting', points: 20 } }));
            }
            onClose();
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
}

