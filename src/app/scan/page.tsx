'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Shield, ClipboardList, Play, Loader2, Wifi, WifiOff } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import FindingsPanel from '@/components/FindingsPanel';
import VulnerabilityDeepDive from '@/components/VulnerabilityDeepDive';
import SecurityScore from '@/components/SecurityScore';
import AuditChecklist from '@/components/AuditChecklist';
import ImmunefiReadiness from '@/components/ImmunefiReadiness';
import { DEMO_CONTRACTS, DEMO_FINDINGS, DEMO_AUDIT_CHECKLIST, DEMO_IMMUNEFI_READINESS } from '@/lib/demo-data';
import type { Finding } from '@/lib/store';
import { api } from '@/lib/api';
import type { ScanResult } from '@/lib/api';

export default function ScanPage() {
  const [selectedContract, setSelectedContract] = useState(0);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | undefined>();
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'checklist' | 'immunefi'>('checklist');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<'demo' | 'live' | 'checking'>('checking');
  const [liveFindings, setLiveFindings] = useState<Finding[]>([]);
  const [liveScore, setLiveScore] = useState<number | null>(null);

  // Check API availability on mount
  useEffect(() => {
    setApiMode('checking');
    api.demoScan('').catch(() => {
      // Health check — expect error, we just care if API is reachable
    });
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/demo/health`, {
      signal: AbortSignal.timeout(3000),
    })
      .then(res => setApiMode(res.ok ? 'live' : 'demo'))
      .catch(() => setApiMode('demo'));
  }, []);

  const contract = DEMO_CONTRACTS[selectedContract];
  const findings = liveFindings.length > 0 ? liveFindings : DEMO_FINDINGS;

  // Calculate score based on findings
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;
  const score = liveScore !== null ? liveScore : Math.max(0, 100 - criticalCount * 25 - highCount * 10 - lowCount * 3 - infoCount * 0.5);

  const handleRunScan = useCallback(async () => {
    setIsScanning(true);
    setScanError(null);
    setLiveFindings([]);
    setLiveScore(null);
    setSelectedFinding(null);

    try {
      const result: ScanResult = await api.demoScan(contract.code);
      setLiveScore(result.security_score);
      // Convert API findings to Finding type
      const converted: Finding[] = result.findings.map((f, i) => ({
        id: f.id,
        title: f.title,
        severity: f.severity as Finding['severity'],
        line: parseInt(f.location.split(':').pop() || '0'),
        description: f.description,
        technicalExplanation: f.explanation,
        cvss: { score: f.severity === 'critical' ? 9.0 : f.severity === 'high' ? 7.0 : f.severity === 'low' ? 3.0 : 1.0, attackVector: 'network', attackComplexity: 'low', privilegesRequired: 'none', userInteraction: 'none', scope: 'unchanged', impact: { confidentiality: 'none', integrity: 'none', availability: 'none' } },
        exploitability: 'medium',
        businessImpact: 'direct-loss',
        status: 'new',
        confidence: 'high',
        attackPath: { steps: [{ step: 1, description: 'Exploit the vulnerability' }], prerequisites: [], expectedOutcome: 'Funds stolen' },
        poc: { language: 'solidity', code: '// PoC not available in demo mode', setupInstructions: [], expectedOutput: '', runCommand: 'forge test' },
        remediation: { beforeCode: f.description, afterCode: 'See Pro tier for AI-generated fixes', openZeppelinRefs: [], gasImpact: 'Unknown', testingRecommendations: [], alternativeMitigations: [] },
        references: [],
        exploitCode: '',
        fixSuggestion: f.explanation || 'Upgrade to Pro for AI-powered fix suggestions',
        learnMore: '',
      }));
      setLiveFindings(converted);
    } catch (err: any) {
      if (err.message === 'DEMO_MODE') {
        setScanError('Backend API not available. Running in demo mode with sample data.');
      } else {
        setScanError(`Scan failed: ${err.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  }, [contract.code]);

  const handleFindingClick = (finding: Finding) => {
    setSelectedFinding(finding);
    setHighlightLine(finding.line);
  };

  // Calculate audit readiness
  const passCount = Object.values(DEMO_AUDIT_CHECKLIST).flat().filter(i => i.status === 'pass').length;
  const totalChecks = Object.values(DEMO_AUDIT_CHECKLIST).flat().length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-text">Audit Workstation</h1>
          <select
            value={selectedContract}
            onChange={(e) => { setSelectedContract(Number(e.target.value)); setSelectedFinding(null); }}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-text text-sm"
          >
            {DEMO_CONTRACTS.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          {/* API status indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
            apiMode === 'live' ? 'bg-green-400/10 border-green-400/30 text-green-400' :
            apiMode === 'demo' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' :
            'bg-card border-border text-muted'
          }`}>
            {apiMode === 'checking' ? <Loader2 className="w-3 h-3 animate-spin" /> :
             apiMode === 'live' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {apiMode === 'live' ? 'Live API' : apiMode === 'demo' ? 'Demo Mode' : 'Checking...'}
          </div>

          {/* Run Scan button */}
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isScanning
                ? 'bg-info/20 border border-info/30 text-info cursor-wait'
                : 'bg-info hover:bg-info/90 text-white cursor-pointer'
            }`}
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </button>

          {/* Sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              showSidebar ? 'bg-info/20 border-info/30 text-info' : 'bg-card border-border text-muted'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Audit Tools
          </button>
        </div>
      </div>

      {/* Scan error/success banner */}
      {scanError && (
        <div className="bg-yellow-400/10 border-b border-yellow-400/30 px-6 py-2 flex items-center justify-between">
          <span className="text-sm text-yellow-400">⚠️ {scanError}</span>
          <button onClick={() => setScanError(null)} className="text-yellow-400 hover:text-yellow-300 text-sm">✕</button>
        </div>
      )}
      {liveFindings.length > 0 && !scanError && (
        <div className="bg-green-400/10 border-b border-green-400/30 px-6 py-2">
          <span className="text-sm text-green-400">✅ Scan complete — {liveFindings.length} findings detected using {apiMode === 'live' ? 'Slither + AI' : 'demo data'}</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Code Editor (45% or 50% depending on sidebar) */}
        <div className={`${showSidebar ? 'w-[45%]' : 'w-1/2'} border-r border-border transition-all duration-300`}>
          <CodeEditor
            code={contract.code}
            language="solidity"
            highlightLine={highlightLine}
          />
        </div>

        {/* Findings Panel (25%) */}
        <div className={`${showSidebar ? 'w-[25%]' : 'w-1/4'} border-r border-border flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-text">Scan Results</h3>
              <SecurityScore score={score} size={48} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {criticalCount > 0 && <span className="badge-critical">{criticalCount} Critical</span>}
              {highCount > 0 && <span className="badge-high">{highCount} High</span>}
              {lowCount > 0 && <span className="badge-low">{lowCount} Low</span>}
              {infoCount > 0 && <span className="badge-info">{infoCount} Info</span>}
            </div>
          </div>
          <FindingsPanel
            findings={findings}
            selectedId={selectedFinding?.id}
            onSelect={handleFindingClick}
          />
        </div>

        {/* Deep Dive Panel (25%) */}
        <div className={`${showSidebar ? 'w-[25%]' : 'w-1/4'} border-r border-border overflow-auto transition-all duration-300`}>
          <VulnerabilityDeepDive finding={selectedFinding} />
        </div>

        {/* Audit Sidebar (Collapsible) */}
        {showSidebar && (
          <div className="w-[30%] overflow-y-auto bg-card/30">
            {/* Sidebar tabs */}
            <div className="flex border-b border-border sticky top-0 bg-background z-10">
              <button
                onClick={() => setSidebarTab('checklist')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  sidebarTab === 'checklist'
                    ? 'border-info text-info'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Audit Checklist
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/20 text-green-400">
                  {passCount}/{totalChecks}
                </span>
              </button>
              <button
                onClick={() => setSidebarTab('immunefi')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  sidebarTab === 'immunefi'
                    ? 'border-info text-info'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                <Shield className="w-4 h-4" />
                Immunefi
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  DEMO_IMMUNEFI_READINESS.status === 'go' ? 'bg-green-400/20 text-green-400' :
                  DEMO_IMMUNEFI_READINESS.status === 'conditional' ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-red-400/20 text-red-400'
                }`}>
                  {DEMO_IMMUNEFI_READINESS.status.toUpperCase()}
                </span>
              </button>
            </div>

            {/* Sidebar content */}
            <div className="p-4">
              {sidebarTab === 'checklist' ? (
                <AuditChecklist categories={DEMO_AUDIT_CHECKLIST} />
              ) : (
                <ImmunefiReadiness readiness={DEMO_IMMUNEFI_READINESS} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
