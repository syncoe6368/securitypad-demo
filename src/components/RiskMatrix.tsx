'use client';

import { useMemo } from 'react';
import type { Finding } from '@/lib/store';

interface RiskMatrixProps {
  findings: Finding[];
  onCellClick?: (findings: Finding[]) => void;
}

type Likelihood = 'rare' | 'unlikely' | 'possible' | 'likely';
type Impact = 'low' | 'medium' | 'high' | 'critical';

const likelihoods: Likelihood[] = ['likely', 'possible', 'unlikely', 'rare'];
const impacts: Impact[] = ['low', 'medium', 'high', 'critical'];

// Map severity to likelihood/impact
function getRiskPosition(finding: Finding): { likelihood: Likelihood; impact: Impact } {
  // Map based on exploitability and severity
  const likelihoodMap: Record<string, Likelihood> = {
    trivial: 'likely',
    easy: 'possible',
    medium: 'possible',
    hard: 'unlikely',
    theoretical: 'rare',
  };

  const impactMap: Record<string, Impact> = {
    'direct-loss': 'critical',
    'indirect-loss': 'high',
    'dos': 'medium',
    'info-leak': 'low',
  };

  return {
    likelihood: likelihoodMap[finding.exploitability] || 'unlikely',
    impact: impactMap[finding.businessImpact] || 'medium',
  };
}

const cellColors: Record<string, string> = {
  'likely-critical': 'bg-red-500',
  'likely-high': 'bg-orange-500',
  'likely-medium': 'bg-yellow-500',
  'likely-low': 'bg-green-500',
  'possible-critical': 'bg-red-500',
  'possible-high': 'bg-orange-500',
  'possible-medium': 'bg-yellow-400',
  'possible-low': 'bg-green-400',
  'unlikely-critical': 'bg-orange-500',
  'unlikely-high': 'bg-yellow-500',
  'unlikely-medium': 'bg-green-400',
  'unlikely-low': 'bg-green-300',
  'rare-critical': 'bg-yellow-500',
  'rare-high': 'bg-green-400',
  'rare-medium': 'bg-green-300',
  'rare-low': 'bg-green-200',
};

export default function RiskMatrix({ findings, onCellClick }: RiskMatrixProps) {
  // Build matrix
  const matrix = useMemo(() => {
    const cells: Record<string, Finding[]> = {};
    
    findings.forEach(finding => {
      const { likelihood, impact } = getRiskPosition(finding);
      const key = `${likelihood}-${impact}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push(finding);
    });
    
    return cells;
  }, [findings]);

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span>
        Risk Matrix
      </h3>
      
      <div className="flex">
        {/* Y-axis label */}
        <div className="flex items-center justify-center w-8">
          <span className="text-xs text-muted -rotate-90 whitespace-nowrap">Likelihood →</span>
        </div>
        
        {/* Matrix Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-1">
            {/* Impact labels */}
            {impacts.map(impact => (
              <div key={impact} className="text-center text-xs text-muted mb-1 capitalize">
                {impact}
              </div>
            ))}
            
            {/* Matrix cells */}
            {likelihoods.map(likelihood => (
              impacts.map(impact => {
                const key = `${likelihood}-${impact}`;
                const cellFindings = matrix[key] || [];
                const colorClass = cellColors[key] || 'bg-gray-600';
                
                return (
                  <div
                    key={key}
                    onClick={() => cellFindings.length > 0 && onCellClick?.(cellFindings)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center
                      ${cellFindings.length > 0 ? colorClass + ' opacity-80 cursor-pointer hover:opacity-100 transition-opacity' : 'bg-border/30'}
                      ${cellFindings.length > 0 ? 'p-1' : ''}
                    `}
                    title={cellFindings.map(f => f.title).join('\n')}
                  >
                    {cellFindings.length > 0 && (
                      <>
                        <span className="text-lg font-bold text-white">{cellFindings.length}</span>
                        <div className="flex gap-0.5 mt-1">
                          {cellFindings.map(f => (
                            <span
                              key={f.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                f.severity === 'critical' ? 'bg-red-200' :
                                f.severity === 'high' ? 'bg-orange-200' :
                                f.severity === 'low' ? 'bg-yellow-200' : 'bg-blue-200'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )).flat()}
          </div>
          
          {/* X-axis label */}
          <div className="text-center text-xs text-muted mt-2">Impact →</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted">
        <div className="flex items-center gap-3">
          <span>Risk Level:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500" /> Medium-High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" /> Low</span>
        </div>
        <span>{findings.length} total findings</span>
      </div>
    </div>
  );
}
