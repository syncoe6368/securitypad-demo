'use client';

import { create } from 'zustand';
import { DEFAULT_PROJECT } from './default-project';
import type { ProjectFile } from './default-project';

const STORAGE_KEY = 'securitypad-workspace';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface OutputEntry {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'result';
  message: string;
  timestamp: number;
}

interface WorkspaceState {
  // Files
  files: Record<string, string>;        // path → content
  originalFiles: Record<string, string>; // path → original content (for unsaved tracking)
  openFiles: string[];                   // ordered tab list
  activeFile: string | null;

  // Output/Terminal
  outputEntries: OutputEntry[];
  showOutput: boolean;
  outputHeight: number; // px

  // UI state
  showExplorer: boolean;
  showShortcuts: boolean;
  wordWrap: boolean;
  theme: 'dark' | 'light';

  // Actions — Files
  initWorkspace: () => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  createFile: (path: string, content?: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  saveFile: (path: string) => void;

  // Actions — Output
  addOutput: (type: OutputEntry['type'], message: string) => void;
  clearOutput: () => void;
  toggleOutput: () => void;
  setOutputHeight: (h: number) => void;

  // Actions — UI
  toggleExplorer: () => void;
  toggleShortcuts: () => void;
  toggleWordWrap: () => void;
  toggleTheme: () => void;

  // Helpers
  getFileTree: () => FileNode[];
  isFileUnsaved: (path: string) => boolean;
  hasUnsavedChanges: () => boolean;
}

function buildTree(files: Record<string, string>): FileNode[] {
  const root: FileNode[] = [];

  const paths = Object.keys(files).sort();
  for (const filePath of paths) {
    const parts = filePath.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      const existing = currentLevel.find(n => n.name === part);
      if (existing) {
        if (existing.children) {
          currentLevel = existing.children!;
        }
      } else {
        const node: FileNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        };
        currentLevel.push(node);
        if (!isFile) {
          currentLevel = node.children!;
        }
      }
    }
  }

  return root;
}

function loadFromStorage(): { files: Record<string, string>; originalFiles: Record<string, string> } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { files: parsed.files, originalFiles: { ...parsed.files } };
    }
  } catch {}
  return null;
}

function persistToStorage(files: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ files, version: 1 }));
  } catch {}
}

function getDefaultFiles(): { files: Record<string, string>; originalFiles: Record<string, string> } {
  const files: Record<string, string> = {};
  for (const f of DEFAULT_PROJECT) {
    files[f.path] = f.content;
  }
  return { files, originalFiles: { ...files } };
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  files: {},
  originalFiles: {},
  openFiles: [],
  activeFile: null,
  outputEntries: [],
  showOutput: true,
  outputHeight: 200,
  showExplorer: true,
  showShortcuts: false,
  wordWrap: true,
  theme: 'dark',

  initWorkspace: () => {
    const stored = loadFromStorage();
    const { files, originalFiles } = stored || getDefaultFiles();
    const firstContract = Object.keys(files).find(p => p.endsWith('.sol')) || Object.keys(files)[0];
    set({
      files,
      originalFiles,
      openFiles: firstContract ? [firstContract] : [],
      activeFile: firstContract || null,
    });
  },

  openFile: (path) => {
    const { openFiles, activeFile } = get();
    if (!openFiles.includes(path)) {
      set({ openFiles: [...openFiles, path], activeFile: path });
    } else {
      set({ activeFile: path });
    }
  },

  closeFile: (path) => {
    const { openFiles, activeFile } = get();
    const newOpen = openFiles.filter(p => p !== path);
    let newActive = activeFile;
    if (activeFile === path) {
      const idx = openFiles.indexOf(path);
      newActive = newOpen[Math.min(idx, newOpen.length - 1)] || null;
    }
    set({ openFiles: newOpen, activeFile: newActive });
  },

  setActiveFile: (path) => set({ activeFile: path }),

  updateFileContent: (path, content) => {
    const files = { ...get().files, [path]: content };
    set({ files });
    persistToStorage(files);
  },

  createFile: (path, content = '') => {
    const files = { ...get().files, [path]: content };
    set({ files, openFiles: [...get().openFiles, path], activeFile: path });
    persistToStorage(files);
  },

  deleteFile: (path) => {
    const { [path]: _, ...files } = get().files;
    const openFiles = get().openFiles.filter(p => !p.startsWith(path));
    const activeFile = get().activeFile;
    const newActive = activeFile?.startsWith(path)
      ? openFiles[0] || null
      : activeFile;
    set({ files, openFiles, activeFile: newActive });
    persistToStorage(files);
  },

  renameFile: (oldPath, newPath) => {
    const state = get();
    const files = { ...state.files };
    const originalFiles = { ...state.originalFiles };
    files[newPath] = files[oldPath] || '';
    originalFiles[newPath] = originalFiles[oldPath] || '';
    delete files[oldPath];
    delete originalFiles[oldPath];

    const openFiles = state.openFiles.map(p => p === oldPath ? newPath : p);
    const activeFile = state.activeFile === oldPath ? newPath : state.activeFile;

    set({ files, originalFiles, openFiles, activeFile });
    persistToStorage(files);
  },

  saveFile: (path) => {
    const originalFiles = { ...get().originalFiles, [path]: get().files[path] };
    set({ originalFiles });
  },

  addOutput: (type, message) => {
    const entry: OutputEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      timestamp: Date.now(),
    };
    set({ outputEntries: [...get().outputEntries, entry] });
  },

  clearOutput: () => set({ outputEntries: [] }),
  toggleOutput: () => set({ showOutput: !get().showOutput }),
  setOutputHeight: (h) => set({ outputHeight: Math.max(100, Math.min(600, h)) }),

  toggleExplorer: () => set({ showExplorer: !get().showExplorer }),
  toggleShortcuts: () => set({ showShortcuts: !get().showShortcuts }),
  toggleWordWrap: () => set({ wordWrap: !get().wordWrap }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

  getFileTree: () => buildTree(get().files),

  isFileUnsaved: (path) => {
    const { files, originalFiles } = get();
    return files[path] !== originalFiles[path];
  },

  hasUnsavedChanges: () => {
    const { files, originalFiles } = get();
    return Object.keys(files).some(k => files[k] !== originalFiles[k]);
  },
}));
