'use client';

import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useWorkspaceStore } from '@/lib/workspace-store';

export default function IDEEditor() {
  const {
    files,
    activeFile,
    updateFileContent,
    wordWrap,
    theme,
  } = useWorkspaceStore();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const content = activeFile ? files[activeFile] || '' : '';
  const language = activeFile?.endsWith('.sol') ? 'solidity'
    : activeFile?.endsWith('.md') ? 'markdown'
    : activeFile?.endsWith('.toml') ? 'toml'
    : activeFile?.endsWith('.json') ? 'json'
    : 'plaintext';

  // Breadcrumb path
  const breadcrumb = activeFile || 'No file open';

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define dark theme
    monaco.editor.defineTheme('securitypad-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#30363d',
        'editorLineNumber.activeForeground': '#8b949e',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#e6edf3',
        'editorWidget.background': '#161b22',
        'editorWidget.border': '#30363d',
        'editorSuggestWidget.background': '#161b22',
        'editorSuggestWidget.border': '#30363d',
        'editorSuggestWidget.selectedBackground': '#1c2129',
        'minimap.background': '#0d1117',
        'breadcrumb.background': '#0d1117',
        'breadcrumb.foreground': '#8b949e',
        'breadcrumbPicker.background': '#161b22',
      },
    });

    monaco.editor.defineTheme('securitypad-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd73a49' },
        { token: 'string', foreground: '032f62' },
        { token: 'number', foreground: '005cc5' },
        { token: 'type', foreground: 'e36209' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorLineNumber.foreground': '#959da5',
        'editorLineNumber.activeForeground': '#24292e',
        'editor.selectionBackground': '#b3d7ff',
      },
    });

    monaco.editor.setTheme(theme === 'dark' ? 'securitypad-dark' : 'securitypad-light');

    // Register Solidity language if not already registered
    if (!monaco.languages.getLanguages().find((l: any) => l.id === 'solidity')) {
      monaco.languages.register({ id: 'solidity' });
      monaco.languages.setMonarchTokensProvider('solidity', {
        keywords: [
          'pragma', 'solidity', 'contract', 'library', 'interface', 'function', 'modifier',
          'event', 'struct', 'enum', 'mapping', 'address', 'uint', 'int', 'bool', 'string',
          'bytes', 'memory', 'storage', 'calldata', 'public', 'private', 'internal', 'external',
          'pure', 'view', 'payable', 'returns', 'return', 'if', 'else', 'for', 'while', 'do',
          'break', 'continue', 'throw', 'emit', 'try', 'catch', 'revert', 'require', 'assert',
          'true', 'false', 'import', 'using', 'is', 'new', 'delete', 'constructor', 'fallback',
          'receive', 'abstract', 'virtual', 'override', 'immutable', 'unchecked', 'error',
        ],
        typeKeywords: [
          'uint256', 'uint128', 'uint64', 'uint32', 'uint16', 'uint8',
          'int256', 'int128', 'int64', 'int32', 'int16', 'int8',
          'bytes32', 'bytes16', 'bytes8', 'bytes4', 'bytes1',
          'address payable', 'msg', 'block', 'tx', 'this',
        ],
        tokenizer: {
          root: [
            [/@?[a-zA-Z_]\w*/, { cases: { '@typeKeywords': 'type', '@keywords': 'keyword', '@default': 'identifier' } }],
            [/\d+/, 'number'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
          ],
          comment: [
            [/[^/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[/*]/, 'comment'],
          ],
        },
      });

      // Solidity autocomplete
      monaco.languages.registerCompletionItemProvider('solidity', {
        triggerCharacters: ['.', '@'],
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const keywords = [
            // Keywords
            { label: 'pragma', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'pragma solidity ^0.8.20;' },
            { label: 'contract', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'contract ${1:Name} {\n\t$0\n}' },
            { label: 'function', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'function ${1:name}(${2}) ${3|public,external,internal,private|} ${4|pure,view,payable|} {\n\t$0\n}' },
            { label: 'modifier', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'modifier ${1:name} {\n\t$0\n\t_;\n}' },
            { label: 'event', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'event ${1:Name}(${2});' },
            { label: 'struct', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'struct ${1:Name} {\n\t$0\n}' },
            { label: 'enum', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'enum ${1:Name} { ${2:Value1}, ${3:Value2} }' },
            { label: 'mapping', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'mapping(${1:address} => ${2:uint256}) public ${3:name};' },
            { label: 'require', kind: monaco.languages.CompletionItemKind.Function, insertText: 'require(${1:condition}, "${2:message}");' },
            { label: 'emit', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'emit ${1:EventName}(${2});' },
            { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import "${1:@openzeppelin/contracts/}";' },
            // Types
            { label: 'address', kind: monaco.languages.CompletionItemKind.Class, insertText: 'address' },
            { label: 'uint256', kind: monaco.languages.CompletionItemKind.Class, insertText: 'uint256' },
            { label: 'bool', kind: monaco.languages.CompletionItemKind.Class, insertText: 'bool' },
            { label: 'string', kind: monaco.languages.CompletionItemKind.Class, insertText: 'string' },
            { label: 'bytes32', kind: monaco.languages.CompletionItemKind.Class, insertText: 'bytes32' },
            // Globals
            { label: 'msg.sender', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'msg.sender' },
            { label: 'msg.value', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'msg.value' },
            { label: 'block.timestamp', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'block.timestamp' },
            { label: 'tx.origin', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'tx.origin' },
            // OpenZeppelin
            { label: '@openzeppelin/ReentrancyGuard', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";' },
            { label: '@openzeppelin/Ownable', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import "@openzeppelin/contracts/access/Ownable.sol";' },
            { label: '@openzeppelin/IERC20', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import "@openzeppelin/contracts/token/ERC20/IERC20.sol";' },
            { label: '@openzeppelin/SafeERC20', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";' },
            { label: '@openzeppelin/Pausable', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import "@openzeppelin/contracts/security/Pausable.sol";' },
            { label: '@openzeppelin/AccessControl', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import "@openzeppelin/contracts/access/AccessControl.sol";' },
          ];

          return {
            suggestions: keywords.map(k => ({
              label: k.label,
              kind: k.kind,
              insertText: k.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            })),
          };
        },
      });
    }

    // Register keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      // This is handled by React state
    });

    // Add find/replace actions
    editor.addAction({
      id: 'find',
      label: 'Find',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      run: () => editor.getAction('actions.find')?.run(),
    });

    editor.addAction({
      id: 'replace',
      label: 'Replace',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH],
      run: () => editor.getAction('editor.action.startFindReplaceAction')?.run(),
    });
  };

  // Update theme when it changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'securitypad-dark' : 'securitypad-light');
    }
  }, [theme]);

  if (!activeFile) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0d1117] text-text-muted">
        <div className="text-6xl mb-4 opacity-20">⬡</div>
        <p className="text-lg font-medium mb-1">SecurityPad IDE</p>
        <p className="text-sm opacity-60">Open a file from the explorer to start editing</p>
        <p className="text-xs mt-4 opacity-40">
          <kbd className="px-1.5 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-xs">Ctrl+K</kbd> Keyboard shortcuts
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#0d1117]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-3 py-1 bg-[#0d1117] border-b border-[#30363d]/50 text-xs text-text-muted">
        {breadcrumb.split('/').map((segment, i, arr) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="opacity-40">/</span>}
            <span className={i === arr.length - 1 ? 'text-text' : ''}>{segment}</span>
          </span>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={(v) => updateFileContent(activeFile, v || '')}
          onMount={handleMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 22,
            minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
            scrollBeyondLastLine: false,
            wordWrap: wordWrap ? 'on' : 'off',
            glyphMargin: true,
            folding: true,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
          }}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-[#0d1117] text-text-muted text-sm">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
