'use client';

import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import type { Finding, Severity } from '@/lib/store';

const severityOrder: Record<Severity, number> = { critical: 0, high: 1, low: 2, info: 3 };
const severityColor: Record<Severity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// Exploitability color for mini badge
const exploitColor: Record<string, string> = {
  trivial: 'bg-red-500',
  easy: 'bg-orange-500',
  medium: 'bg-yellow-500',
  hard: 'bg-blue-500',
  theoretical: 'bg-gray-500',
};

// Status color
const statusColor: Record<string, string> = {
  new: 'bg-blue-500',
  confirmed: 'bg-orange-500',
  'false-positive': 'bg-gray-500',
  fixed: 'bg-green-500',
  'wont-fix': 'bg-purple-500',
};

interface FindingsPanelProps {
  findings: Finding[];
  selectedId?: string;
  onSelect: (finding: Finding) => void;
}

export default function FindingsPanel({ findings, selectedId, onSelect }: FindingsPanelProps) {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = findings
    .filter((f) => filter === 'all' || f.severity === filter)
    .filter((f) => 
      !searchTerm || 
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.functionName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const counts = {
    all: findings.length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    low: findings.filter((f) => f.severity === 'low').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filters */}
      <div className="p-3 border-b border-border space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded text-text placeholder:text-muted focus:outline-none focus:border-info"
          />
        </div>
        
        {/* Severity filters */}
        <div className="flex gap-1 flex-wrap">
          {(['all', 'critical', 'high', 'low', 'info'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                filter === s
                  ? 'bg-info/20 border-info/30 text-info'
                  : 'bg-card border-border text-muted hover:text-text'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-muted text-sm">No findings match your filters</div>
        ) : (
          filtered.map((finding) => (
            <button
              key={finding.id}
              onClick={() => onSelect(finding)}
              className={`w-full text-left p-3 border-b border-border transition-colors hover:bg-border/30 ${
                selectedId === finding.id ? 'bg-info/10 border-l-2 border-l-info' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Severity dot */}
                <span
                  className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    finding.severity === 'critical'
                      ? 'bg-red-500'
                      : finding.severity === 'high'
                      ? 'bg-orange-500'
                      : finding.severity === 'low'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <div className="text-sm font-medium truncate">{finding.title}</div>
                  
                  {/* Metadata row */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Severity badge */}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${severityColor[finding.severity]}`}
                    >
                      {finding.severity.toUpperCase()}
                    </span>
                    
                    {/* CVSS Score */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      finding.cvss.score >= 9 ? 'bg-red-500/20 text-red-400' :
                      finding.cvss.score >= 7 ? 'bg-orange-500/20 text-orange-400' :
                      finding.cvss.score >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      CVSS {finding.cvss.score.toFixed(1)}
                    </span>
                    
                    {/* Exploitability indicator */}
                    <span className={`text-[10px] w-1.5 h-1.5 rounded-full ${exploitColor[finding.exploitability]} shrink-0`}
                      title={`Exploitability: ${finding.exploitability}`}
                    />
                    
                    {/* Status indicator */}
                    <span className={`text-[10px] w-1.5 h-1.5 rounded-full ${statusColor[finding.status]} shrink-0`}
                      title={`Status: ${finding.status}`}
                    />
                  </div>
                  
                  {/* Line and function info */}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                    <span>Line {finding.line}</span>
                    {finding.functionName && (
                      <>
                        <span>•</span>
                        <code className="font-mono">{finding.functionName}()</code>
                      </>
                    )}
                    <span className="ml-auto">
                      {finding.exploitability === 'trivial' ? '⚡' : 
                       finding.exploitability === 'easy' ? '🔴' :
                       finding.exploitability === 'medium' ? '🟡' : '🟢'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* Footer stats */}
      <div className="p-2 border-t border-border bg-card/50 text-[10px] text-muted flex items-center justify-between">
        <span>{filtered.length} of {findings.length} findings</span>
        <span>
          {counts.critical + counts.high} critical/high
        </span>
      </div>
    </div>
  );
}
