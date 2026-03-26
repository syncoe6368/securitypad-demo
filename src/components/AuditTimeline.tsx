'use client';

import { CheckCircle, AlertTriangle, Clock, FileSearch } from 'lucide-react';

interface ScanHistory {
  date: string;
  contract: string;
  score: number;
  findings: {
    critical: number;
    high: number;
    low: number;
    info: number;
  };
}

interface AuditTimelineProps {
  history: ScanHistory[];
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  if (score >= 40) return 'bg-orange-400';
  return 'bg-red-400';
};

export default function AuditTimeline({ history }: AuditTimelineProps) {
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-xl">📅</span>
        Audit Timeline
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Timeline entries */}
        <div className="space-y-4">
          {history.map((scan, idx) => (
            <div key={idx} className="relative pl-10">
              {/* Timeline dot */}
              <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full ${getScoreBg(scan.score)} border-2 border-background`} />
              
              {/* Content */}
              <div className="p-3 rounded-lg bg-border/20 hover:bg-border/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-info" />
                    <span className="font-medium text-sm">{scan.contract}</span>
                  </div>
                  <span className="text-xs text-muted">{scan.date}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Score */}
                  <div className={`text-lg font-bold ${getScoreColor(scan.score)}`}>
                    {scan.score}
                    <span className="text-xs text-muted font-normal">/100</span>
                  </div>
                  
                  {/* Findings */}
                  <div className="flex gap-2">
                    {scan.findings.critical > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                        {scan.findings.critical}C
                      </span>
                    )}
                    {scan.findings.high > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                        {scan.findings.high}H
                      </span>
                    )}
                    {scan.findings.low > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                        {scan.findings.low}L
                      </span>
                    )}
                    {scan.findings.info > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {scan.findings.info}I
                      </span>
                    )}
                    {scan.findings.critical === 0 && scan.findings.high === 0 && 
                     scan.findings.low === 0 && scan.findings.info === 0 && (
                      <span className="text-xs text-green-400">✓ Clean</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary */}
      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{history.length} scans recorded</span>
            </div>
            <div>
              Trend: {history.length >= 2 && history[0].score > history[history.length - 1].score 
                ? <span className="text-green-400">↑ Improving</span> 
                : <span className="text-yellow-400">→ Stable</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
