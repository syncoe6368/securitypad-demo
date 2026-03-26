'use client';

import { useState } from 'react';
import { Search, Trash2, Play, ChevronUp, ChevronDown } from 'lucide-react';

interface ContractRow {
  id: string;
  name: string;
  lastScan: string;
  score: number;
  critical: number;
  high: number;
  low: number;
  info: number;
}

interface ContractTableProps {
  contracts: ContractRow[];
  onScan?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

type SortKey = 'name' | 'lastScan' | 'score';
type SortDir = 'asc' | 'desc';

const scoreColor = (s: number) =>
  s >= 80 ? 'text-success' : s >= 60 ? 'text-low' : s >= 40 ? 'text-high' : 'text-critical';

export default function ContractTable({ contracts, onScan, onDelete, onView }: ContractTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('lastScan');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = contracts
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'score') return (a.score - b.score) * dir;
      if (sortKey === 'lastScan') return a.lastScan.localeCompare(b.lastScan) * dir;
      return a.name.localeCompare(b.name) * dir;
    });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-info"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-card/50 border-b border-border text-left">
              {[
                { key: 'name' as SortKey, label: 'Contract' },
                { key: 'lastScan' as SortKey, label: 'Last Scan' },
                { key: 'score' as SortKey, label: 'Score' },
                { key: null, label: 'Findings' },
                { key: null, label: 'Actions' },
              ].map(({ key, label }) => (
                <th
                  key={label}
                  className={`px-4 py-3 font-medium text-muted ${key ? 'cursor-pointer hover:text-text' : ''}`}
                  onClick={() => key && toggleSort(key)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {key && <SortIcon col={key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-card/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <button onClick={() => onView?.(c.id)} className="hover:text-info transition-colors">
                    {c.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted">{c.lastScan}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${scoreColor(c.score)}`}>{c.score}</span>
                  <span className="text-muted">/100</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {c.critical > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-critical/20 text-critical">{c.critical}C</span>
                    )}
                    {c.high > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-high/20 text-high">{c.high}H</span>
                    )}
                    {c.low > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-low/20 text-low">{c.low}L</span>
                    )}
                    {c.info > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/20 text-info">{c.info}I</span>
                    )}
                    {c.critical === 0 && c.high === 0 && c.low === 0 && c.info === 0 && (
                      <span className="text-xs text-success">✓ Clean</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onScan?.(c.id)}
                      className="p-1.5 rounded hover:bg-info/20 text-muted hover:text-info transition-colors"
                      title="Scan"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(c.id)}
                      className="p-1.5 rounded hover:bg-critical/20 text-muted hover:text-critical transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No contracts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
