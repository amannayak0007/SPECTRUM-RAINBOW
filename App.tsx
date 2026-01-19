
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ToolType, Point } from './types';
import Toolbar from './components/Toolbar';

const RAINBOW_COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#8B00FF'  // Violet
];

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 'rainbow' (Magic Cycle) is the 3rd tool in the toolbar list
  const [tool, setTool] = useState<ToolType>('rainbow');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const audio = new Audio('pencil-marking.wav');
    audio.loop = true;
    audioRef.current = audio;

    const resize = () => {
      const tempImage = canvas.toDataURL();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = tempImage;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawPath = useCallback((pts: Point[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!ctx || pts.length < 2) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    
    // Path smoothing using Quadratic Curves
    const p1 = pts[pts.length - 2];
    const p2 = pts[pts.length - 1];
    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const prevMidPoint = pts.length > 2 
      ? { x: (pts[pts.length - 3].x + p1.x) / 2, y: (pts[pts.length - 3].y + p1.y) / 2 }
      : p1;

    if (tool === 'pencil') {
      const count = RAINBOW_COLORS.length;
      const step = brushSize / count;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = len > 0.1 ? -dy / len : 0;
      const ny = len > 0.1 ? dx / len : 0;

      RAINBOW_COLORS.forEach((color, i) => {
        const offset = (i - (count - 1) / 2) * step;
        ctx.strokeStyle = color;
        ctx.lineWidth = step * 1.5;
        ctx.beginPath();
        ctx.moveTo(prevMidPoint.x + nx * offset, prevMidPoint.y + ny * offset);
        ctx.quadraticCurveTo(
          p1.x + nx * offset, p1.y + ny * offset, 
          midPoint.x + nx * offset, midPoint.y + ny * offset
        );
        ctx.stroke();
      });
    } else if (tool === 'rainbow') {
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(prevMidPoint.x, prevMidPoint.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();
      setHue(prev => (prev + 4) % 360);
    } else if (tool === 'multi-rainbow') {
      RAINBOW_COLORS.forEach((color, i) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize / 4;
        const sinOffset = Math.sin(hue / 12) * (brushSize / 2);
        const offset = (i - 3) * (brushSize / 3) + sinOffset;
        ctx.beginPath();
        ctx.moveTo(prevMidPoint.x + offset, prevMidPoint.y + offset);
        ctx.quadraticCurveTo(p1.x + offset, p1.y + offset, midPoint.x + offset, midPoint.y + offset);
        ctx.stroke();
      });
      setHue(prev => (prev + 3) % 360);
    } else if (tool === 'crayon') {
      const colorIndex = Math.floor(hue / 60) % RAINBOW_COLORS.length;
      ctx.strokeStyle = RAINBOW_COLORS[colorIndex];
      ctx.fillStyle = RAINBOW_COLORS[colorIndex];
      ctx.lineWidth = brushSize;
      
      ctx.beginPath();
      ctx.moveTo(prevMidPoint.x, prevMidPoint.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();
      
      // Textured spray
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 5; i++) {
        const rx = (Math.random() - 0.5) * brushSize * 1.2;
        const ry = (Math.random() - 0.5) * brushSize * 1.2;
        ctx.beginPath();
        ctx.arc(p2.x + rx, p2.y + ry, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      setHue(prev => (prev + 2) % 360);
    } else if (tool === 'eraser') {
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(prevMidPoint.x, prevMidPoint.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }
  }, [brushSize, tool, hue]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const p = getCoordinates(e);
    if (p) {
      setIsDrawing(true);
      setPoints([p, p]); // Initial points for curve calculation
      if (tool !== 'eraser' && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const p = getCoordinates(e);
    if (p) {
      const newPoints = [...points, p];
      drawPath(newPoints);
      setPoints(newPoints);
      if (tool !== 'eraser' && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setPoints([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `magic-art-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="relative w-screen h-screen bg-slate-100 overflow-hidden cursor-crosshair touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="block w-full h-full bg-white shadow-inner"
      />

      <Toolbar
        currentTool={tool}
        setTool={setTool}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onClear={clearCanvas}
        onDownload={downloadImage}
      />

      <div className="fixed top-6 left-6 pointer-events-none hidden md:block">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          Magic <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">Canvas</span>
        </h1>
        <p className="text-slate-500 font-medium">Smooth, rounded rainbow strokes</p>
      </div>

      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-slate-400 text-[10px] font-medium tracking-widest uppercase">
        Made with ❤️ for Chiku
      </div>
    </div>
  );
};

export default App;
