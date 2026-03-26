'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Search, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DEMO_CONTRACTS } from '@/lib/demo-data';
import AuthWrapper from '@/components/AuthWrapper';

export default function ContractsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = DEMO_CONTRACTS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' ||
      (severityFilter === 'critical' && c.findings.critical > 0) ||
      (severityFilter === 'high' && c.findings.high > 0) ||
      (severityFilter === 'clean' && c.findings.critical === 0 && c.findings.high === 0);
    return matchesSearch && matchesSeverity;
  });

  return (
    <AuthWrapper requiredRole="user">
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text">Smart Contracts</h1>
              <p className="text-muted mt-1">Manage and track your audited contracts</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Upload size={18} />
              Upload Contract
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Severities</option>
                <option value="critical">Has Critical</option>
                <option value="high">Has High</option>
                <option value="clean">Clean</option>
              </select>
              <select className="input">
                <option>Name ▲</option>
                <option>Score ▼</option>
                <option>Date ▼</option>
              </select>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted font-medium">Contract Name</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Security Score</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Severity</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border hover:bg-card/50 transition-colors">
                      <td className="py-3 px-4">
                        <Link href="/scan" className="text-blue-400 hover:underline font-mono font-medium">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted">{c.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${c.score >= 80 ? 'bg-green-400' : c.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${c.score}%` }}
                            />
                          </div>
                          <span className={`font-semibold ${c.score >= 80 ? 'text-green-400' : c.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {c.score}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {c.findings.critical > 0 && <span className="badge-critical">{c.findings.critical} Critical</span>}
                          {c.findings.high > 0 && <span className="badge-high">{c.findings.high} High</span>}
                          {c.findings.low > 0 && <span className="badge-low">{c.findings.low} Low</span>}
                          {c.findings.info > 0 && <span className="badge-info">{c.findings.info} Info</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-border rounded-lg transition-colors" title="Rescan">
                            <RefreshCw size={16} className="text-muted" />
                          </button>
                          <button className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted">Page 1 of 1</span>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm" disabled>Previous</button>
                <button className="btn-secondary text-sm" disabled>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
