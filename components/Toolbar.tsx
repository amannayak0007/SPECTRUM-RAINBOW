
import React from 'react';
import { ToolType } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (tool: ToolType) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onClear: () => void;
  onDownload: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setTool,
  brushSize,
  setBrushSize,
  onClear,
  onDownload
}) => {
  const tools: { id: ToolType; label: string; icon: string; description: string }[] = [
    { id: 'crayon', label: 'Rainbow Crayon', icon: '🖍️', description: 'Textured rainbow crayon style' },
    { id: 'multi-rainbow', label: 'Rainbow Pencil', icon: '🌈', description: 'Multi-color parallel lines' },
    { id: 'rainbow', label: 'Magic Cycle', icon: '✨', description: 'Cycles colors as you draw' },
    { id: 'pencil', label: 'Classic Pencil', icon: '✏️', description: 'Standard black pencil' },
    { id: 'eraser', label: 'Eraser', icon: '🧹', description: 'Clear parts of your work' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-4 flex flex-wrap items-center gap-4 border border-slate-200 z-50 transition-all hover:bg-white/95">
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            title={tool.description}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 group ${
              currentTool === tool.id 
              ? 'bg-indigo-600 text-white shadow-lg scale-105' 
              : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <span className="text-2xl mb-1">{tool.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{tool.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="h-10 w-px bg-slate-200 mx-2" />

      <div className="flex flex-col items-center gap-1 min-w-[120px]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Brush Size</span>
        <input
          type="range"
          min="2"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <span className="text-[10px] font-mono font-medium text-slate-600">{brushSize}px</span>
      </div>

      <div className="h-10 w-px bg-slate-200 mx-2" />

      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
          title="Clear Canvas"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={onDownload}
          className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl transition-colors"
          title="Download Art"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
