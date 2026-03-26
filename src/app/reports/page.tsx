'use client';

import { useState } from 'react';
import { FileText, Plus, Download, Share2, Printer, ChevronDown, ChevronUp, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import SecurityScore from '@/components/SecurityScore';
import { DEMO_CONTRACTS, DEMO_FINDINGS } from '@/lib/demo-data';

// Report contract type (simplified for display)
interface ReportContract {
  name: string;
  score: number;
  linesOfCode?: number;
  testCoverage?: number;
  findings: typeof DEMO_FINDINGS;
}

export default function ReportsPage() {
  const [selectedContracts, setSelectedContracts] = useState<string[]>(['1', '2', '3']);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'executive', 'methodology', 'findings', 'detailed', 'risk', 'recommendations'
  ]));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Filter contracts based on selection
  const contracts = DEMO_CONTRACTS.filter(c => selectedContracts.includes(c.id));
  const allFindings = DEMO_FINDINGS;

  // Calculate aggregate metrics
  const totalFindings = allFindings.length;
  const criticalCount = allFindings.filter(f => f.severity === 'critical').length;
  const highCount = allFindings.filter(f => f.severity === 'high').length;
  const lowCount = allFindings.filter(f => f.severity === 'low').length;
  const infoCount = allFindings.filter(f => f.severity === 'info').length;
  const avgScore = Math.round(contracts.reduce((sum, c) => sum + c.score, 0) / (contracts.length || 1));
  const totalLOC = contracts.reduce((sum, c) => sum + (c.linesOfCode || 0), 0);

  // Determine overall assessment
  const overallAssessment = criticalCount === 0 && highCount === 0 
    ? { text: 'READY FOR DEPLOYMENT', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
    : criticalCount === 0 
    ? { text: 'CONDITIONAL — FIXES RECOMMENDED', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' }
    : { text: 'NOT READY — CRITICAL ISSUES FOUND', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' };

  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Report</h1>
          <p className="text-sm text-muted mt-1">SecurityPad Audit — {today}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button 
            onClick={() => window.print()}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Contract selector */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-info" />
          Contracts in Scope
        </h3>
        <div className="flex flex-wrap gap-2">
          {DEMO_CONTRACTS.map((c) => (
            <label key={c.id} className="flex items-center gap-2 px-3 py-1.5 rounded border border-border cursor-pointer hover:border-info/50 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedContracts.includes(c.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedContracts([...selectedContracts, c.id]);
                  } else {
                    setSelectedContracts(selectedContracts.filter(id => id !== c.id));
                  }
                }}
                className="accent-info" 
              />
              <span className="text-sm font-mono">{c.name}</span>
              <span className={`text-xs ${c.score >= 80 ? 'text-green-400' : c.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                ({c.score}/100)
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ═══ Report Content ═══ */}
      <div className="space-y-4">
        {/* Section: Executive Summary */}
        <div className="card overflow-hidden">
          <button 
            onClick={() => toggleSection('executive')}
            className="w-full flex items-center justify-between p-4 hover:bg-border/20 transition-colors"
          >
            <h2 className="text-lg font-semibold">1. Executive Summary</h2>
            {expandedSections.has('executive') ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          
          {expandedSections.has('executive') && (
            <div className="px-4 pb-4 space-y-4">
              {/* Protocol overview */}
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted leading-relaxed">
                  This report presents the findings of a security audit conducted by <strong className="text-text">SecurityPad</strong> 
                  for the <strong className="text-text">{contracts.map(c => c.name).join(', ')}</strong> smart contracts.
                  The audit scope covers {totalLOC.toLocaleString()} lines of Solidity code across {contracts.length} contracts.
                </p>
              </div>

              {/* Overall assessment badge */}
              <div className={`p-4 rounded-lg border ${overallAssessment.bg}`}>
                <div className="flex items-center gap-3">
                  {criticalCount > 0 ? <XCircle className={`w-6 h-6 ${overallAssessment.color}`} /> :
                   highCount > 0 ? <AlertTriangle className={`w-6 h-6 ${overallAssessment.color}`} /> :
                   <CheckCircle className={`w-6 h-6 ${overallAssessment.color}`} />}
                  <div>
                    <div className={`font-bold ${overallAssessment.color}`}>{overallAssessment.text}</div>
                    <div className="text-sm text-muted">Overall Security Assessment</div>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-2xl font-bold text-text">{avgScore}</div>
                  <div className="text-xs text-muted">Avg Security Score</div>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                  <div className="text-xs text-muted">Critical Findings</div>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-400">{highCount}</div>
                  <div className="text-xs text-muted">High Findings</div>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-2xl font-bold text-text">{totalFindings}</div>
                  <div className="text-xs text-muted">Total Findings</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Methodology */}
        <div className="card overflow-hidden">
          <button 
            onClick={() => toggleSection('methodology')}
            className="w-full flex items-center justify-between p-4 hover:bg-border/20 transition-colors"
          >
            <h2 className="text-lg font-semibold">2. Methodology</h2>
            {expandedSections.has('methodology') ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          
          {expandedSections.has('methodology') && (
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">🔍 Automated Analysis</h4>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• Slither static analysis</li>
                    <li>• Mythril symbolic execution</li>
                    <li>• Custom pattern detectors</li>
                  </ul>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">👁️ Manual Review</h4>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• Line-by-line code review</li>
                    <li>• Business logic analysis</li>
                    <li>• Access control verification</li>
                  </ul>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">🧪 Testing</h4>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• Foundry test suite</li>
                    <li>• Exploit PoC development</li>
                    <li>• Edge case verification</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-background rounded-lg text-sm text-muted">
                <strong className="text-text">Lines Analyzed:</strong> {totalLOC.toLocaleString()} lines of Solidity code<br />
                <strong className="text-text">Compiler Version:</strong> Solidity 0.8.20<br />
                <strong className="text-text">Audit Duration:</strong> 5 business days<br />
                <strong className="text-text">Tools Used:</strong> Slither 0.10.0, Foundry, Hardhat, Manual Review
              </div>
            </div>
          )}
        </div>

        {/* Section: Findings Summary */}
        <div className="card overflow-hidden">
          <button 
            onClick={() => toggleSection('findings')}
            className="w-full flex items-center justify-between p-4 hover:bg-border/20 transition-colors"
          >
            <h2 className="text-lg font-semibold">3. Findings Summary</h2>
            {expandedSections.has('findings') ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          
          {expandedSections.has('findings') && (
            <div className="px-4 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-muted font-medium">Severity</th>
                      <th className="text-left py-3 px-4 text-muted font-medium">Title</th>
                      <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-muted font-medium">CVSS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFindings.map((finding, idx) => (
                      <tr key={finding.id} className="border-b border-border hover:bg-border/10">
                        <td className="py-3 px-4 font-mono text-xs">F-{String(idx + 1).padStart(3, '0')}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            finding.severity === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {finding.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">{finding.title}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                            {finding.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{finding.cvss.score.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section: Detailed Findings */}
        <div className="card overflow-hidden">
          <button 
            onClick={() => toggleSection('detailed')}
            className="w-full flex items-center justify-between p-4 hover:bg-border/20 transition-colors"
          >
            <h2 className="text-lg font-semibold">4. Detailed Findings</h2>
            {expandedSections.has('detailed') ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          
          {expandedSections.has('detailed') && (
            <div className="px-4 pb-4 space-y-4">
              {allFindings.map((finding, idx) => (
                <div key={finding.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Finding header */}
                  <div className={`p-4 ${
                    finding.severity === 'critical' ? 'bg-red-500/10' :
                    finding.severity === 'high' ? 'bg-orange-500/10' :
                    finding.severity === 'low' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted">F-{String(idx + 1).padStart(3, '0')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            finding.severity === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {finding.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted">CVSS {finding.cvss.score.toFixed(1)}</span>
                        </div>
                        <h4 className="font-semibold">{finding.title}</h4>
                      </div>
                      <div className="text-xs text-muted text-right">
                        <div>{finding.functionName || 'N/A'}()</div>
                        <div>Line {finding.line}</div>
                      </div>
                    </div>
                  </div>

                  {/* Finding content */}
                  <div className="p-4 space-y-4">
                    {/* Description */}
                    <div>
                      <h5 className="text-xs font-semibold text-muted uppercase mb-2">Description</h5>
                      <p className="text-sm text-muted leading-relaxed">{finding.description}</p>
                    </div>

                    {/* Attack Path Summary */}
                    <div>
                      <h5 className="text-xs font-semibold text-muted uppercase mb-2">Attack Path</h5>
                      <ol className="space-y-1">
                        {finding.attackPath.steps.slice(0, 3).map(step => (
                          <li key={step.step} className="text-sm text-muted flex items-start gap-2">
                            <span className="text-red-400 font-bold">{step.step}.</span>
                            {step.description}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Remediation Summary */}
                    <div>
                      <h5 className="text-xs font-semibold text-muted uppercase mb-2">Remediation</h5>
                      <p className="text-sm text-muted">
                        {finding.remediation.openZeppelinRefs.length > 0 && (
                          <>Use OpenZeppelin library. </>
                        )}
                        {finding.remediation.gasImpact}
                      </p>
                    </div>

                    {/* References */}
                    <div className="flex flex-wrap gap-2">
                      {finding.references.slice(0, 2).map((ref, i) => (
                        <a
                          key={i}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-info hover:underline flex items-center gap-1"
                        >
                          📎 {ref.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Risk Assessment */}
        <div className="card overflow-hidden">
          <button 
            onClick={() => toggleSection('risk')}
            className="w-full flex items-center justify-between p-4 hover:bg-border/20 transition-colors"
          >
            <h2 className="text-lg font-semibold">5. Risk Assessment</h2>
            {expandedSections.has('risk') ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          
          {expandedSections.has('risk') && (
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm font-semibold mb-2">Overall Risk Rating</div>
                  <div className={`text-2xl font-bold ${
                    avgScore >= 80 ? 'text-green-400' : avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {avgScore >= 80 ? 'LOW' : avgScore >= 60 ? 'MEDIUM' : 'HIGH'}
                  </div>
                  <div className="text-xs text-muted mt-1">Based on aggregate findings</div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm font-semibold mb-2">Technical Risk</div>
                  <div className="text-lg text-text">
                    {criticalCount > 0 ? 'Multiple critical vulnerabilities' :
                     highCount > 0 ? 'Several high-severity issues' :
                     'Acceptable security posture'}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm font-semibold mb-2">Business Risk</div>
                  <div className="text-lg text-text">
                    {criticalCount > 0 ? 'High — funds at immediate risk' :
                     highCount > 0 ? 'Medium — potential for exploitation' :
                     'Low — standard DeFi risk'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Justification</h4>
                <p className="text-sm text-muted leading-relaxed">
                  The audit identified {criticalCount} critical and {highCount} high severity vulnerabilities
                  that present immediate risks to user funds. The critical findings include reentrancy and access control
                  vulnerabilities that could lead to direct financial loss. Deployment should not proceed until
                  all critical and high findings are remediated and re-verified.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section: Recommendations */}
        <div className="card overflow-hidden">
          <button 
            onClick={() => toggleSection('recommendations')}
            className="w-full flex items-center justify-between p-4 hover:bg-border/20 transition-colors"
          >
            <h2 className="text-lg font-semibold">6. Recommendations</h2>
            {expandedSections.has('recommendations') ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
          </button>
          
          {expandedSections.has('recommendations') && (
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">1.</span>
                    <div>
                      <div className="font-semibold text-sm text-red-400">Immediate — Fix Critical Findings</div>
                      <p className="text-sm text-muted mt-1">
                        Address reentrancy in buy() and unprotected cancelListing before any deployment.
                        These issues present direct fund loss risk.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">2.</span>
                    <div>
                      <div className="font-semibold text-sm text-orange-400">Short-term — Address High Findings</div>
                      <p className="text-sm text-muted mt-1">
                        Implement TWAP oracle, add flash loan receiver verification, and improve liquidation mechanics.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">3.</span>
                    <div>
                      <div className="font-semibold text-sm text-yellow-400">Recommended — Code Quality</div>
                      <p className="text-sm text-muted mt-1">
                        Lock pragma version, add comprehensive NatSpec documentation, and implement timelock for admin functions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <div>
                      <div className="font-semibold text-sm text-blue-400">Ongoing — Security Best Practices</div>
                      <p className="text-sm text-muted mt-1">
                        Implement bug bounty program, establish emergency response procedures, and schedule regular security audits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="flex gap-3 mt-4">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Submit to Immunefi
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted py-6">
        Generated by SecurityPad • {today}<br />
        This report is confidential and intended for the protocol team only.
      </div>
    </div>
  );
}
