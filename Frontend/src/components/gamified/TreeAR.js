import React from 'react'
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
  zIndex: 50,
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
  return (
    <div style={overlayStyle}>
      <button onClick={onClose} style={closeBtnStyle}>Close AR</button>
      <ARButton sessionInit={{ requiredFeatures: ['hit-test'] }} />
      <Canvas
        gl={{ antialias: true, alpha: true, xrCompatible: true }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0)
          if (gl.xr) gl.xr.enabled = true
        }}
      >
        <XR>
          <ambientLight intensity={0.6} />
          <directionalLight position={[1, 2, 1]} intensity={0.8} />
          <Box />
        </XR>
      </Canvas>
    </div>
  )
}
