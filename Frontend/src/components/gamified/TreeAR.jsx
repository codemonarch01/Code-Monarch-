import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, ARButton } from '@react-three/xr'
import * as THREE from 'three'

function Box() {
  return (
    <mesh position={[0, 0, -0.5]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={new THREE.Color('#22c55e')} />
    </mesh>
  )
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
      <button onClick={onClose} style={closeBtnStyle}>Close AR</button>

      {arSupported === false ? (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#fef3c7', color: '#92400e', padding: '8px 12px', borderRadius: 8, zIndex: 60, fontSize: 14 }}>
          AR not supported on this device/browser. Showing 3D preview.
        </div>
      ) : (
        <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#e5e7eb', color: '#111827', padding: '8px 12px', borderRadius: 8, zIndex: 60, fontSize: 14 }}>
          Checking AR support...
        </div>
      )}

      <Canvas 
        style={{ width: '100%', height: '100%' }} 
        gl={{ antialias: true, alpha: true, xrCompatible: true }} 
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
            <Box />
          </XR>
        ) : (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[1, 2, 1]} intensity={0.8} />
            <Box />
          </>
        )}

        {canvasReady && arSupported && (
          <ARButton 
            style={arButtonStyle}
            sessionInit={{ 
              optionalFeatures: ['hit-test', 'dom-overlay', 'unbounded', 'local-floor'],
              domOverlay: { root: overlayRef.current || document.body }
            }} 
          />
        )}
      </Canvas>
    </div>
  )
}

