'use client';

import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language?: string;
  highlightLine?: number;
  highlightSeverity?: 'critical' | 'high' | 'low' | 'info';
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  code,
  language = 'solidity',
  highlightLine,
  highlightSeverity,
  onCodeChange,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

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
      },
    });
    monaco.editor.setTheme('securitypad-dark');

    // Register Solidity language
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
    }
  };

  // Highlight line effect
  const decorationsRef = useRef<string[]>([]);
  if (editorRef.current && highlightLine) {
    const editor = editorRef.current;
    const severityColor: Record<string, string> = {
      critical: 'line-highlight-critical',
      high: 'line-highlight-high',
      low: 'line-highlight-low',
      info: 'line-highlight-info',
    };
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: { startLineNumber: highlightLine, startColumn: 1, endLineNumber: highlightLine, endColumn: 1 },
        options: {
          isWholeLine: true,
          className: severityColor[highlightSeverity || 'info'] || '',
          glyphMarginClassName: `severity-dot-${highlightSeverity || 'info'}`,
        },
      },
    ]);
    editor.revealLineInCenter(highlightLine);
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(v) => onCodeChange?.(v || '')}
        onMount={handleMount}
        options={{
          readOnly,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          glyphMargin: true,
          folding: true,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          automaticLayout: true,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
}
