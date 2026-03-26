'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, FileText, TrendingUp, Plus, Activity, Clock, Target } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import SecurityScore from '@/components/SecurityScore';
import SeverityBreakdown from '@/components/SeverityBreakdown';
import RiskMatrix from '@/components/RiskMatrix';
import AuditTimeline from '@/components/AuditTimeline';
import { DEMO_STATS, DEMO_CONTRACTS, DEMO_FINDINGS } from '@/lib/demo-data';
import Link from 'next/link';

export default function Dashboard() {
  const contracts = DEMO_CONTRACTS;
  const stats = DEMO_STATS;
  const findings = DEMO_FINDINGS;

  // Calculate aggregate metrics
  const avgReadinessScore = Math.round(
    contracts.reduce((sum, c) => sum + (c.auditReadinessScore || 0), 0) / contracts.length
  );
  
  const totalLOC = contracts.reduce((sum, c) => sum + (c.linesOfCode || 0), 0);
  const totalFindings = findings.length;
  const vulnDensity = totalLOC > 0 ? (totalFindings / (totalLOC / 100)).toFixed(2) : '0';
  
  const avgTestCoverage = Math.round(
    contracts.reduce((sum, c) => sum + (c.testCoverage || 0), 0) / contracts.length
  );

  const oldestAudit = Math.max(...contracts.map(c => c.daysSinceLastAudit || 0));
  
  const criticalPathClean = contracts.every(c => 
    (c.criticalFunctions || []).every(fn => 
      !findings.some(f => f.functionName === fn && f.severity === 'critical')
    )
  );

  // Determine Immunefi badge
  const readyContracts = contracts.filter(c => c.immunefiStatus === 'go').length;
  const immunefiBadge = readyContracts === contracts.length 
    ? { text: 'All Contracts Ready', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
    : readyContracts > 0
    ? { text: `${readyContracts}/${contracts.length} Ready`, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' }
    : { text: 'Needs Remediation', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-text">Security Dashboard</h1>
              <span className="px-3 py-1 bg-card border border-border rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-card/80">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Project: Alpha
                <span className="text-muted text-xs ml-1">▼</span>
              </span>
            </div>
            <p className="text-muted mt-1">Audit-grade metrics for smart contract security</p>
          </div>
          <Link href="/scan" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Start New Scan
          </Link>
        </div>

        {/* ═══ Top Row: Key Metrics ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            label="Audit Readiness"
            value={<>40-50<span className="text-sm font-normal text-muted">/100</span></>}
            valueColorClass='text-yellow-400'
            subtext="Weighted composite score"
            icon={<Shield className="w-5 h-5 text-green-400" />}
            iconTooltip="Overall readiness score for mainnet deployment based on critical metrics."
            nextStepsText="Review vulnerabilities"
            nextStepsHref="/scan"
          />

          <StatsCard
            label="Vuln Density"
            value={<>2-4<span className="text-sm font-normal text-muted">/ 100 LOC</span></>}
            valueColorClass='text-yellow-400'
            subtext="Industry benchmark: <2"
            icon={<Target className="w-5 h-5 text-blue-400" />}
            iconTooltip="Vulnerabilities per 100 Lines of Code."
            nextStepsText="View findings"
            nextStepsHref="/scan"
          />

          <StatsCard
            label="Test Coverage"
            value={"60-70%"}
            valueColorClass='text-yellow-400'
            subtext="Code paths analyzed"
            icon={<Activity className="w-5 h-5 text-purple-400" />}
            iconTooltip="Percentage of source code covered by tests."
            nextStepsText="Generate Missing Tests"
            nextStepsHref="/scan"
          />

          <StatsCard
            label="Last Audit"
            value={<>7-30<span className="text-sm font-normal text-muted"> days ago</span></>}
            valueColorClass='text-yellow-400'
            subtext="Audit freshness indicator"
            icon={<Clock className="w-5 h-5 text-orange-400" />}
            iconTooltip="Days since the most recent audit was performed."
            nextStepsText="Schedule new scan"
            nextStepsHref="/scan"
          />
        </div>

        {/* ═══ Second Row: Immunefi Badge + Critical Path ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Immunefi Readiness Badge */}
          <div className={`card p-4 border ${immunefiBadge.bg}`}>
            <div className="flex items-center gap-3">
              <Shield className={`w-6 h-6 ${immunefiBadge.color}`} />
              <div>
                <p className="text-xs text-muted uppercase">Immunefi Status</p>
                <p className={`font-bold ${immunefiBadge.color}`}>{immunefiBadge.text}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {contracts.map(c => (
                <div key={c.id} className="p-2 rounded bg-background/50">
                  <div className="font-medium truncate">{c.name.replace('.sol', '')}</div>
                  <div className={c.immunefiStatus === 'go' ? 'text-green-400' : c.immunefiStatus === 'conditional' ? 'text-yellow-400' : 'text-red-400'}>
                    {c.immunefiStatus === 'go' ? '✓ GO' : c.immunefiStatus === 'conditional' ? '⚠ CONDITIONAL' : '✗ NO-GO'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Path Analysis */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-info" />
              Critical Path Analysis
            </h3>
            <div className="space-y-2">
              {['deposit', 'withdraw', 'transfer', 'approve', 'liquidate', 'buy'].map(fn => {
                const hasIssue = findings.some(f => f.functionName === fn && (f.severity === 'critical' || f.severity === 'high'));
                return (
                  <div key={fn} className="flex items-center justify-between text-sm">
                    <code className="font-mono text-xs">{fn}()</code>
                    <span className={hasIssue ? 'text-red-400' : 'text-green-400'}>
                      {hasIssue ? '⚠ Issues' : '✓ Clean'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-info" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Total Contracts</span>
                <span className="font-bold">{stats.totalContracts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Total Scans</span>
                <span className="font-bold">{stats.totalScans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Critical Findings</span>
                <span className="font-bold text-red-400">{stats.criticalFindings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Lines of Code</span>
                <span className="font-bold">{totalLOC.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Third Row: Charts ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Risk Matrix */}
          <div className="lg:col-span-1">
            <RiskMatrix findings={findings} />
          </div>

          {/* Severity Breakdown */}
          <div className="lg:col-span-1">
            <SeverityBreakdown findings={findings} />
          </div>

          {/* Audit Timeline */}
          <div className="lg:col-span-1">
            <AuditTimeline history={stats.scanHistory} />
          </div>
        </div>

        {/* ═══ Fourth Row: Activity Chart ═══ */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-text mb-4">Audit Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="month" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#e6edf3'
                  }}
                />
                <Legend />
                <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high" name="High" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" name="Low" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="info" name="Info" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ═══ Fifth Row: Contracts Table ═══ */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Contract Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium">Contract</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Readiness</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Coverage</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Vuln/100 LOC</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Immunefi</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Findings</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4">
                      <Link href="/scan" className="text-blue-400 hover:underline font-mono">
                        {c.name}
                      </Link>
                      <div className="text-xs text-muted">{c.linesOfCode} LOC • {c.daysSinceLastAudit}d since audit</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${c.score >= 80 ? 'text-green-400' : c.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {c.score}
                      </span>
                      <span className="text-muted">/100</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={c.auditReadinessScore && c.auditReadinessScore >= 80 ? 'text-green-400' : c.auditReadinessScore && c.auditReadinessScore >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {c.auditReadinessScore || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={c.testCoverage && c.testCoverage >= 80 ? 'text-green-400' : c.testCoverage && c.testCoverage >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {c.testCoverage || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={c.vulnerabilityDensity && c.vulnerabilityDensity < 2 ? 'text-green-400' : 'text-yellow-400'}>
                        {c.vulnerabilityDensity?.toFixed(2) || '0'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        c.immunefiStatus === 'go' ? 'bg-green-400/20 text-green-400' :
                        c.immunefiStatus === 'conditional' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {c.immunefiStatus?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.findings.critical > 0 && <span className="badge-critical">{c.findings.critical}C</span>}
                        {c.findings.high > 0 && <span className="badge-high">{c.findings.high}H</span>}
                        {c.findings.low > 0 && <span className="badge-low">{c.findings.low}L</span>}
                        {c.findings.info > 0 && <span className="badge-info">{c.findings.info}I</span>}
                        {c.findings.critical === 0 && c.findings.high === 0 && c.findings.low === 0 && c.findings.info === 0 && (
                          <span className="text-green-400 text-sm">✓ Clean</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
