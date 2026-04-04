'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Terminal as TerminalIcon, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/workspace-store';

export default function OutputPanel() {
  const { outputEntries, showOutput, outputHeight, toggleOutput, setOutputHeight, clearOutput } = useWorkspaceStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [outputEntries]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startHeight: outputHeight };

    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      setOutputHeight(dragRef.current.startHeight + delta);
    };

    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [outputHeight, setOutputHeight]);

  if (!showOutput) return null;

  const typeColors: Record<string, string> = {
    info: 'text-text-muted',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    result: 'text-cyan-400',
  };

  const typePrefix: Record<string, string> = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
    result: '→',
  };

  return (
    <div
      ref={panelRef}
      className="flex flex-col border-t border-[#30363d] bg-[#0a0e14]"
      style={{ height: `${outputHeight}px` }}
    >
      {/* Drag handle */}
      <div
        className="h-1.5 cursor-ns-resize hover:bg-accent/30 transition-colors flex-shrink-0"
        onMouseDown={handleDragStart}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            SecurityPad Terminal
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearOutput}
            className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleOutput}
            className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
            title="Close Panel"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-5">
        {outputEntries.length === 0 ? (
          <div className="text-text-muted/50 italic">
            Ready. Run a security scan or type a command.
          </div>
        ) : (
          outputEntries.map((entry) => (
            <div key={entry.id} className={`flex gap-2 ${typeColors[entry.type] || 'text-text'}`}>
              <span className="flex-shrink-0 opacity-60">{typePrefix[entry.type] || '>'}</span>
              <span className="whitespace-pre-wrap break-all">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
