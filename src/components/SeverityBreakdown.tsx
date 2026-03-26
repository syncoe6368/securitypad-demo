'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Finding, Severity } from '@/lib/store';

interface SeverityBreakdownProps {
  findings: Finding[];
  size?: number;
}

const severityConfig: Record<Severity, { color: string; label: string; bgOpacity: string }> = {
  critical: { color: '#ef4444', label: 'Critical', bgOpacity: 'bg-red-500/20' },
  high: { color: '#f97316', label: 'High', bgOpacity: 'bg-orange-500/20' },
  low: { color: '#fbbf24', label: 'Low', bgOpacity: 'bg-yellow-500/20' },
  info: { color: '#60a5fa', label: 'Info', bgOpacity: 'bg-blue-500/20' },
};

export default function SeverityBreakdown({ findings, size = 180 }: SeverityBreakdownProps) {
  const counts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  const total = findings.length;
  const data = [
    { name: 'Critical', value: counts.critical, color: severityConfig.critical.color },
    { name: 'High', value: counts.high, color: severityConfig.high.color },
    { name: 'Low', value: counts.low, color: severityConfig.low.color },
    { name: 'Info', value: counts.info, color: severityConfig.info.color },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.payload.color }} />
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          <div className="text-xs text-muted mt-1">
            {item.value} finding{item.value !== 1 ? 's' : ''} ({Math.round((item.value / total) * 100)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-xl">🔍</span>
        Severity Breakdown
      </h3>
      
      <div className="flex items-center justify-center gap-6">
        {/* Donut Chart */}
        <div style={{ width: size, height: size }} className="relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="90%"
                dataKey="value"
                strokeWidth={2}
                stroke="#0d1117"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-muted">Findings</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {(Object.keys(counts) as Severity[]).map(severity => {
            const config = severityConfig[severity];
            const count = counts[severity];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            
            return (
              <div key={severity} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm w-16">{config.label}</span>
                <span className="text-sm font-bold w-6">{count}</span>
                <span className="text-xs text-muted w-12">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted">
          {counts.critical + counts.high} critical/high findings
        </span>
        <span className={counts.critical > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>
          {counts.critical > 0 ? '⚠️ Action required' : '✓ No critical findings'}
        </span>
      </div>
    </div>
  );
}
