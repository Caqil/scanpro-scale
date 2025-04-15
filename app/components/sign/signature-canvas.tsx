"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface Point {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

interface SignatureCanvasProps {
  penColor?: string;
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  clearOnResize?: boolean;
  minWidth?: number;
  maxWidth?: number;
  velocityFilterWeight?: number;
  backgroundColor?: string; // Already included, but we'll use it dynamically
  dotSize?: number;
}

export const SignatureCanvas = forwardRef<any, SignatureCanvasProps>((props, ref) => {
  const {
    penColor = 'black',
    canvasProps,
    clearOnResize = false,
    minWidth = 0.5,
    maxWidth = 2.5,
    velocityFilterWeight = 0.7,
    backgroundColor = 'rgba(0,0,0,0)', // Default transparent
    dotSize = 2,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const points = useRef<Point[]>([]);
  const lastVelocity = useRef<number>(0);
  const lastWidth = useRef<number>(0);
  const isDrawing = useRef<boolean>(false);
  const prevPoint = useRef<Point | null>(null);

  // Initialize canvas
  const initCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas styles
    ctx.fillStyle = backgroundColor; // Use prop value
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;

    contextRef.current = ctx;
  };

  // Handle window resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current || !contextRef.current) return;

      // Store current drawing
      let imageData: ImageData | null = null;
      if (!clearOnResize) {
        imageData = contextRef.current.getImageData(
          0, 0, canvasRef.current.width, canvasRef.current.height
        );
      }

      // Resize canvas
      initCanvas();

      // Restore drawing
      if (imageData && contextRef.current) {
        contextRef.current.putImageData(imageData, 0, 0);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [clearOnResize, backgroundColor, penColor]); // Add dependencies

  // Initialize canvas on mount and update on prop changes
  useEffect(() => {
    initCanvas();
  }, [backgroundColor, penColor]);
  
  // Get point from event
  const getPointFromEvent = (event: MouseEvent | TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let x: number, y: number;
    
    if ('touches' in event) {
      // Touch event
      if (event.touches.length < 1) return null;
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
    
    return {
        x,
        y,
        time: Date.now(),
        pressure: (event as PointerEvent).pressure
      };
      
  };
  
  // Calculate curve control points
  const calculateCurveControlPoints = (p1: Point, p2: Point, p3: Point): { c1: Point; c2: Point } => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p2.x - p3.x;
    const dy2 = p2.y - p3.y;
    
    const m1 = { x: (p1.x + p2.x) / 2.0, y: (p1.y + p2.y) / 2.0 };
    const m2 = { x: (p2.x + p3.x) / 2.0, y: (p2.y + p3.y) / 2.0 };
    
    const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    const dxm = (m1.x - m2.x);
    const dym = (m1.y - m2.y);
    
    const k = l2 / (l1 + l2);
    const cm = { x: m2.x + dxm * k, y: m2.y + dym * k };
    
    const tx = p2.x - cm.x;
    const ty = p2.y - cm.y;
    
    return {
      c1: { x: m1.x + tx, y: m1.y + ty, time: p1.time },
      c2: { x: m2.x + tx, y: m2.y + ty, time: p3.time }
    };
  };
  
  // Calculate stroke width based on velocity
  const getStrokeWidth = (velocity: number, minWidth: number, maxWidth: number): number => {
    return Math.max(minWidth, Math.min(maxWidth, maxWidth - (velocity * (maxWidth - minWidth))));
  };
  
  // Calculate point velocity
  const getVelocity = (p1: Point, p2: Point): number => {
    const timeDelta = p2.time - p1.time;
    if (timeDelta <= 0) return 0;
    
    const distance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
    
    return Math.min(distance / timeDelta, 4); // Cap velocity
  };
  
  // Draw a curve segment
  const drawCurve = (p1: Point, p2: Point) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const velocity = getVelocity(p1, p2);
    const newWidth = getStrokeWidth(
      velocity,
      minWidth,
      maxWidth
    );
    
    // Apply velocity filter
    lastWidth.current = (
      lastWidth.current * velocityFilterWeight +
      newWidth * (1 - velocityFilterWeight)
    );
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(p1.x, p1.y);
    contextRef.current.lineTo(p2.x, p2.y);
    contextRef.current.lineWidth = lastWidth.current;
    contextRef.current.stroke();
    contextRef.current.closePath();
  };
  
  // Draw a dot (for single points)
  const drawDot = (point: Point) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.beginPath();
    contextRef.current.arc(point.x, point.y, dotSize, 0, 2 * Math.PI, false);
    contextRef.current.fillStyle = penColor;
    contextRef.current.fill();
    contextRef.current.closePath();
  };
  
  // Handle pointer down
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    canvasRef.current?.focus();
    isDrawing.current = true;
    points.current = [];
    lastWidth.current = minWidth;
    prevPoint.current = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      time: Date.now(),
      pressure: event.pressure
    };
    
    // Add initial dot
    drawDot(prevPoint.current);
  };
  
  // Handle pointer move
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !contextRef.current || !prevPoint.current) return;
    
    event.preventDefault();
    
    const currentPoint = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      time: Date.now(),
      pressure: event.pressure
    };
    
    // Draw line between points
    drawCurve(prevPoint.current, currentPoint);
    
    prevPoint.current = currentPoint;
  };
  
  // Handle pointer up
  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    
    event.preventDefault();
    isDrawing.current = false;
    
    // Add final point
    const finalPoint = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      time: Date.now(),
      pressure: event.pressure
    };
    
    if (prevPoint.current) {
      drawCurve(prevPoint.current, finalPoint);
    }
  };
  
  // Handle pointer leave
  const handlePointerLeave = (event: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp(event);
  };
  const clear = () => {
    if (!contextRef.current || !canvasRef.current) return;

    contextRef.current.fillStyle = backgroundColor; // Use current background color
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    contextRef.current.strokeStyle = penColor; // Reset stroke color
    isDrawing.current = false;
    points.current = [];
    prevPoint.current = null;
    lastWidth.current = minWidth;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clear,
    toDataURL: (type = 'image/png', encoderOptions = 1) =>
      canvasRef.current?.toDataURL(type, encoderOptions) || '',
    getCanvas: () => canvasRef.current,
  }));

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{ 
        touchAction: 'none',
        cursor: 'crosshair',
      }}
      {...canvasProps}
    />
  );
});

SignatureCanvas.displayName = 'SignatureCanvas';