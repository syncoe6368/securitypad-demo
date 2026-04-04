'use client';

import {
  Play,
  Loader2,
  Plus,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  WrapText,
  Keyboard,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/workspace-store';

interface ToolbarProps {
  isScanning: boolean;
  onRunScan: () => void;
}

export default function Toolbar({ isScanning, onRunScan }: ToolbarProps) {
  const {
    theme,
    toggleTheme,
    showExplorer,
    toggleExplorer,
    showOutput,
    toggleOutput,
    wordWrap,
    toggleWordWrap,
    toggleShortcuts,
    createFile,
  } = useWorkspaceStore();

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-[#161b22] border-b border-[#30363d]">
      {/* Left side */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleExplorer}
          className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
          title={showExplorer ? 'Hide Explorer' : 'Show Explorer'}
        >
          {showExplorer ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="w-px h-4 bg-[#30363d] mx-1" />

        <button
          onClick={() => createFile(`untitled-${Date.now()}.sol`, '// New file\n')}
          className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
          title="New File"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={toggleWordWrap}
          className={`p-1.5 rounded transition-colors ${
            wordWrap ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-text-muted hover:text-text'
          }`}
          title="Toggle Word Wrap"
        >
          <WrapText className="w-4 h-4" />
        </button>
      </div>

      {/* Center — Run Scan (prominent) */}
      <div className="flex items-center">
        <button
          onClick={onRunScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            isScanning
              ? 'bg-accent/20 text-accent cursor-wait'
              : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 cursor-pointer'
          }`}
        >
          {isScanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isScanning ? 'Scanning...' : 'Run Security Scan'}
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleOutput}
          className={`p-1.5 rounded transition-colors ${
            showOutput ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-text-muted hover:text-text'
          }`}
          title="Toggle Terminal"
        >
          <Terminal className="w-4 h-4" />
        </button>

        <button
          onClick={toggleShortcuts}
          className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
          title="Keyboard Shortcuts (⌘K)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
