'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { X } from 'lucide-react';

export default function ShortcutsPanel() {
  const { showShortcuts, toggleShortcuts } = useWorkspaceStore();

  // Handle Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleShortcuts();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleShortcuts]);

  if (!showShortcuts) return null;

  const shortcuts = [
    { category: 'General', items: [
      { keys: '⌘K', desc: 'Show keyboard shortcuts' },
      { keys: '⌘S', desc: 'Save file' },
      { keys: '⌘P', desc: 'Quick open file' },
    ]},
    { category: 'Editor', items: [
      { keys: '⌘F', desc: 'Find' },
      { keys: '⌘H', desc: 'Find and Replace' },
      { keys: '⌘G', desc: 'Find next occurrence' },
      { keys: '⌥↑ / ⌥↓', desc: 'Move line up/down' },
      { keys: '⇧⌥F', desc: 'Format document' },
      { keys: '⌘/', desc: 'Toggle comment' },
      { keys: '⌘D', desc: 'Add selection to next find match' },
    ]},
    { category: 'Navigation', items: [
      { keys: '⌘⇧E', desc: 'Toggle file explorer' },
      { keys: '⌘`', desc: 'Toggle terminal' },
      { keys: '⌘W', desc: 'Close current tab' },
      { keys: '⌘⇧W', desc: 'Close all tabs' },
    ]},
    { category: 'SecurityPad', items: [
      { keys: '⌘⇧S', desc: 'Run security scan' },
    ]},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleShortcuts}>
      <div
        className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d]">
          <h3 className="text-text font-semibold text-sm">Keyboard Shortcuts</h3>
          <button
            onClick={toggleShortcuts}
            className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[65vh] space-y-4">
          {shortcuts.map((cat) => (
            <div key={cat.category}>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                {cat.category}
              </h4>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <div key={item.keys} className="flex items-center justify-between py-1">
                    <span className="text-sm text-text">{item.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-xs text-text-muted font-mono">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
