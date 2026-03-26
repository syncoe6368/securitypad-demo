'use client';

import { CheckCircle, AlertTriangle, XCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { AuditCheckItem, AuditCheckStatus } from '@/lib/store';

interface AuditChecklistProps {
  categories: Record<string, AuditCheckItem[]>;
  collapsible?: boolean;
}

const statusIcons: Record<AuditCheckStatus, React.ReactNode> = {
  'pass': <CheckCircle className="w-4 h-4 text-green-400" />,
  'warning': <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  'fail': <XCircle className="w-4 h-4 text-red-400" />,
  'not-checked': <Circle className="w-4 h-4 text-gray-500" />,
};

const statusColors: Record<AuditCheckStatus, string> = {
  'pass': 'bg-green-400/10 border-green-400/30',
  'warning': 'bg-yellow-400/10 border-yellow-400/30',
  'fail': 'bg-red-400/10 border-red-400/30',
  'not-checked': 'bg-gray-400/10 border-gray-400/30',
};

export default function AuditChecklist({ categories, collapsible = true }: AuditChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(categories)));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Calculate totals
  const allItems = Object.values(categories).flat();
  const passCount = allItems.filter(i => i.status === 'pass').length;
  const warningCount = allItems.filter(i => i.status === 'warning').length;
  const failCount = allItems.filter(i => i.status === 'fail').length;
  const totalChecked = passCount + warningCount + failCount;
  const passRate = totalChecked > 0 ? Math.round((passCount / totalChecked) * 100) : 0;

  // Category summary
  const categorySummaries = Object.entries(categories).map(([name, items]) => ({
    name,
    pass: items.filter(i => i.status === 'pass').length,
    warning: items.filter(i => i.status === 'warning').length,
    fail: items.filter(i => i.status === 'fail').length,
    total: items.length,
  }));

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">📋</span>
          Audit Checklist
        </h3>
        <div className="text-sm text-muted">
          {passCount}/{totalChecked} passed ({passRate}%)
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-4">
        <div className="bg-green-400" style={{ width: `${(passCount / totalChecked) * 100}%` }} />
        <div className="bg-yellow-400" style={{ width: `${(warningCount / totalChecked) * 100}%` }} />
        <div className="bg-red-400" style={{ width: `${(failCount / totalChecked) * 100}%` }} />
      </div>

      {/* Category Summaries */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {categorySummaries.map(cat => (
          <div key={cat.name} className="text-center p-2 rounded bg-background">
            <div className="text-xs text-muted mb-1">{cat.name}</div>
            <div className="flex justify-center gap-1">
              <span className="text-green-400 text-xs">{cat.pass}</span>
              <span className="text-yellow-400 text-xs">{cat.warning}</span>
              <span className="text-red-400 text-xs">{cat.fail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Checklist */}
      <div className="space-y-2">
        {Object.entries(categories).map(([category, items]) => {
          const isExpanded = expandedCategories.has(category);
          const catPass = items.filter(i => i.status === 'pass').length;
          const catFail = items.filter(i => i.status === 'fail').length;

          return (
            <div key={category} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-card hover:bg-border/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {collapsible && (
                    isExpanded ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />
                  )}
                  <span className="font-medium text-sm">{category}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-400">{catPass}✓</span>
                  <span className="text-red-400">{catFail}✗</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 px-3 py-2 border-b border-border last:border-b-0 ${statusColors[item.status]}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {statusIcons[item.status]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{item.description}</div>
                        {item.details && (
                          <div className="text-xs text-muted mt-0.5">{item.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted">
        <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Pass</div>
        <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-400" /> Warning</div>
        <div className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> Fail</div>
        <div className="flex items-center gap-1"><Circle className="w-3 h-3 text-gray-500" /> Not Checked</div>
      </div>
    </div>
  );
}
