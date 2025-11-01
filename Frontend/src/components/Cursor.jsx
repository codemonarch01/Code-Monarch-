import React, { useEffect, useState, useRef } from 'react';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [magneticTarget, setMagneticTarget] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const requestRef = useRef(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });

  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check if device supports touch
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || reducedMotion) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
  }, [reducedMotion]);

  // Toggle native cursor visibility based on custom cursor visibility
  useEffect(() => {
    if (isVisible) {
      const prevCursor = document.body.style.cursor;
      document.body.dataset.prevCursor = prevCursor;
      document.body.style.cursor = 'none';
      return () => {
        document.body.style.cursor = document.body.dataset.prevCursor || '';
        delete document.body.dataset.prevCursor;
      };
    } else {
      // Ensure cursor is restored when not visible
      document.body.style.cursor = document.body.dataset.prevCursor || '';
    }
  }, [isVisible]);

  // Smooth cursor animation with throttling
  useEffect(() => {
    if (!isVisible) return;

    let lastTime = 0;
    const throttleMs = 16; // ~60fps

    const animate = (currentTime) => {
      if (currentTime - lastTime < throttleMs) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = currentTime;
      
      const dx = targetPosition.current.x - currentPosition.current.x;
      const dy = targetPosition.current.y - currentPosition.current.y;
      
      // Only update if there's significant movement to reduce flickering
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        // Smooth interpolation with different lag for dot and ring
        currentPosition.current.x += dx * 0.15;
        currentPosition.current.y += dy * 0.15;
        
        if (dotRef.current && ringRef.current) {
          // Dot follows more closely
          const dotX = targetPosition.current.x + dx * 0.3;
          const dotY = targetPosition.current.y + dy * 0.3;
          
          dotRef.current.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;
          ringRef.current.style.transform = `translate(${currentPosition.current.x - 20}px, ${currentPosition.current.y - 20}px)`;
        }
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  // Mouse move handler with throttling
  useEffect(() => {
    if (!isVisible) return;

    let lastMoveTime = 0;
    const moveThrottle = 8; // ~120fps for mouse moves

    const handleMouseMove = (e) => {
      const now = performance.now();
      if (now - lastMoveTime < moveThrottle) return;
      lastMoveTime = now;

      let x = e.clientX;
      let y = e.clientY;
      
      // Only check for magnetic elements if cursor is near the viewport edges
      // This reduces expensive DOM queries
      const shouldCheckMagnetic = x < 200 || x > window.innerWidth - 200 || 
                                 y < 200 || y > window.innerHeight - 200;
      
      if (shouldCheckMagnetic) {
        const magneticElements = document.querySelectorAll('[data-magnetic]');
        let closestElement = null;
        let minDistance = Infinity;
        
        magneticElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          // Check if cursor is within magnetic range
          const magneticRange = 100;
          if (distance < magneticRange && distance < minDistance) {
            minDistance = distance;
            closestElement = { element, centerX, centerY, distance };
          }
        });
        
        if (closestElement && closestElement.distance < 80) {
          // Apply magnetic effect
          const strength = Math.max(0, 1 - closestElement.distance / 80);
          x += (closestElement.centerX - x) * strength * 0.3;
          y += (closestElement.centerY - y) * strength * 0.3;
          setMagneticTarget(closestElement.element);
          setIsHovering(true);
        } else {
          setMagneticTarget(null);
          setIsHovering(false);
        }
      } else {
        setMagneticTarget(null);
        setIsHovering(false);
      }
      
      targetPosition.current = { x, y };
      setPosition({ x, y });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Click handlers
  useEffect(() => {
    if (!isVisible) return;

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Cursor Dot */}
      <div
        ref={dotRef}
        className={`fixed w-1.5 h-1.5 rounded-full transition-all duration-150 ${
          isClicking 
            ? 'bg-blue-500 scale-150' 
            : isHovering 
              ? 'bg-purple-500' 
              : 'bg-gray-800'
        }`}
        style={{
          left: 0,
          top: 0,
        }}
      />
      
      
      <div
        ref={ringRef}
        className={`fixed w-10 h-10 border-2 rounded-full transition-all duration-300 ${
          isHovering 
            ? 'border-purple-400 scale-150 shadow-lg shadow-purple-400/50' 
            : 'border-gray-400/50 scale-100'
        } ${
          isClicking ? 'scale-75' : ''
        }`}
        style={{
          left: 0,
          top: 0,
          background: isHovering 
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(156, 163, 175, 0.05) 0%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default Cursor;
