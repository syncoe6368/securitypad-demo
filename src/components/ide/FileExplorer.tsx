'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Settings,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useWorkspaceStore, type FileNode } from '@/lib/workspace-store';

function getFileIcon(name: string) {
  if (name.endsWith('.sol')) return <FileCode className="w-4 h-4 text-orange-400" />;
  if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-blue-400" />;
  if (name.endsWith('.toml') || name.endsWith('.json')) return <Settings className="w-4 h-4 text-yellow-400" />;
  return <File className="w-4 h-4 text-muted" />;
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  activeFile: string | null;
  onFileClick: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}

function TreeNode({ node, depth, activeFile, onFileClick, onContextMenu }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = node.type === 'folder';
  const isActive = node.path === activeFile;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-[3px] px-2 cursor-pointer text-sm select-none transition-colors ${
          isActive
            ? 'bg-accent/20 text-text'
            : 'text-text-muted hover:bg-white/5 hover:text-text'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          else onFileClick(node.path);
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        {isFolder ? (
          <>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            )}
            {expanded ? (
              <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 flex-shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate ml-0.5">{node.name}</span>
      </div>
      {isFolder && expanded && node.children?.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          activeFile={activeFile}
          onFileClick={onFileClick}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: FileNode | null;
}

export default function FileExplorer() {
  const {
    getFileTree,
    activeFile,
    openFile,
    createFile,
    deleteFile,
    renameFile,
  } = useWorkspaceStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const tree = getFileTree();

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    if (creatingIn && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creatingIn]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, node });
  }, []);

  const handleFileClick = useCallback((path: string) => {
    openFile(path);
  }, [openFile]);

  const handleCreateFile = useCallback(() => {
    if (!newItemName.trim()) return;
    const parentPath = creatingIn || '';
    const path = parentPath ? `${parentPath}/${newItemName}` : newItemName;
    createFile(path);
    setCreatingIn(null);
    setNewItemName('');
  }, [newItemName, creatingIn, createFile]);

  const handleRename = useCallback(() => {
    if (!renaming || !newFileName.trim() || !contextMenu.node) return;
    const dir = renaming.includes('/') ? renaming.substring(0, renaming.lastIndexOf('/') + 1) : '';
    const newPath = dir + newFileName;
    renameFile(renaming, newPath);
    setRenaming(null);
    setNewFileName('');
  }, [renaming, newFileName, contextMenu.node, renameFile]);

  const getNodePath = (node: FileNode): string => {
    return node.path;
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-r border-[#30363d] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted border-b border-[#30363d]">
        <span>Explorer</span>
        <button
          onClick={() => {
            setCreatingIn('');
            setNewItemName('');
          }}
          className="p-0.5 rounded hover:bg-white/10 transition-colors"
          title="New File"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* New file at root */}
        {creatingIn === '' && (
          <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: '20px' }}>
            <File className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              ref={createInputRef}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile();
                if (e.key === 'Escape') setCreatingIn(null);
              }}
              onBlur={() => { if (!newItemName.trim()) setCreatingIn(null); }}
              placeholder="filename.sol"
              className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-xs text-text outline-none focus:border-accent"
            />
          </div>
        )}

        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            onFileClick={handleFileClick}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.node && (
        <div
          className="fixed z-50 bg-[#1c2129] border border-[#30363d] rounded-lg shadow-xl py-1 min-w-[160px] text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.node.type === 'folder' && (
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-text-muted hover:bg-white/5 hover:text-text transition-colors"
              onClick={() => {
                setCreatingIn(contextMenu.node!.path);
                setNewItemName('');
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
            >
              <Plus className="w-3.5 h-3.5" /> New File
            </button>
          )}
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-text-muted hover:bg-white/5 hover:text-text transition-colors"
            onClick={() => {
              const node = contextMenu.node!;
              setRenaming(getNodePath(node));
              setNewFileName(node.name);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
          >
            <Pencil className="w-3.5 h-3.5" /> Rename
          </button>
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-400/10 transition-colors"
            onClick={() => {
              deleteFile(getNodePath(contextMenu.node!));
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
