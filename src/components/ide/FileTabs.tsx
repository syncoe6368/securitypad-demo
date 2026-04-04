'use client';

import { useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/workspace-store';

function getFileLabel(path: string) {
  return path.split('/').pop() || path;
}

function getFileIcon(name: string) {
  if (name.endsWith('.sol')) return '⟐';
  if (name.endsWith('.md')) return '📄';
  if (name.endsWith('.toml')) return '⚙';
  return '📄';
}

export default function FileTabs() {
  const { openFiles, activeFile, setActiveFile, closeFile, isFileUnsaved } = useWorkspaceStore();

  const handleMiddleClick = useCallback((e: React.MouseEvent, path: string) => {
    if (e.button === 1) { // middle click
      e.preventDefault();
      closeFile(path);
    }
  }, [closeFile]);

  if (openFiles.length === 0) return null;

  return (
    <div className="flex items-center bg-[#161b22] border-b border-[#30363d] overflow-x-auto scrollbar-none">
      {openFiles.map((path) => {
        const isActive = path === activeFile;
        const unsaved = isFileUnsaved(path);
        const label = getFileLabel(path);

        return (
          <div
            key={path}
            className={`group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-[#30363d] transition-colors min-w-0 flex-shrink-0 ${
              isActive
                ? 'bg-[#0d1117] text-text border-b-2 border-b-accent'
                : 'text-text-muted hover:bg-white/5 hover:text-text border-b-2 border-b-transparent'
            }`}
            onClick={() => setActiveFile(path)}
            onMouseDown={(e) => handleMiddleClick(e, path)}
            title={path}
          >
            <span className="text-[10px] opacity-60">{getFileIcon(path)}</span>
            <span className="truncate max-w-[120px]">{label}</span>
            {unsaved && (
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" title="Unsaved changes" />
            )}
            <button
              className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
              title="Close (middle-click also works)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
