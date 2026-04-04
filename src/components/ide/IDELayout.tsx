'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Shield,
  Wifi,
  WifiOff,
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/workspace-store';
import { DEMO_CONTRACTS, DEMO_FINDINGS, DEMO_AUDIT_CHECKLIST, DEMO_IMMUNEFI_READINESS } from '@/lib/demo-data';
import type { Finding } from '@/lib/store';
import { api } from '@/lib/api';
import type { ScanResult } from '@/lib/api';
import FileExplorer from './FileExplorer';
import FileTabs from './FileTabs';
import Toolbar from './Toolbar';
import IDEEditor from './IDEEditor';
import OutputPanel from './OutputPanel';
import ShortcutsPanel from './ShortcutsPanel';
import FindingsPanel from '@/components/FindingsPanel';
import VulnerabilityDeepDive from '@/components/VulnerabilityDeepDive';
import SecurityScore from '@/components/SecurityScore';

export default function IDELayout() {
  const {
    initWorkspace,
    files,
    activeFile,
    addOutput,
    clearOutput,
    showExplorer,
    theme,
  } = useWorkspaceStore();

  const [isScanning, setIsScanning] = useState(false);
  const [apiMode, setApiMode] = useState<'demo' | 'live' | 'checking'>('checking');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | undefined>();
  const [showFindings, setShowFindings] = useState(false);
  const [liveFindings, setLiveFindings] = useState<Finding[]>([]);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Init workspace
  useEffect(() => {
    initWorkspace();
  }, [initWorkspace]);

  // Check API availability
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/demo/health`, {
      signal: AbortSignal.timeout(3000),
    })
      .then(res => setApiMode(res.ok ? 'live' : 'demo'))
      .catch(() => setApiMode('demo'));
  }, []);

  // Apply theme class to html
  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  const findings = liveFindings.length > 0 ? liveFindings : DEMO_FINDINGS;
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;
  const score = liveScore !== null ? liveScore : Math.max(0, 100 - criticalCount * 25 - highCount * 10 - lowCount * 3 - infoCount * 0.5);

  const handleRunScan = useCallback(async () => {
    if (!activeFile) {
      addOutput('warning', 'No file open. Open a Solidity file to scan.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    clearOutput();
    addOutput('info', `Starting security scan on ${activeFile}...`);
    addOutput('info', `Mode: ${apiMode === 'live' ? 'Slither + AI Analysis' : 'Demo (sample data)'}`);
    setLiveFindings([]);
    setLiveScore(null);
    setSelectedFinding(null);

    const code = files[activeFile];

    try {
      const result: ScanResult = await api.demoScan(code);
      setLiveScore(result.security_score);
      const converted: Finding[] = result.findings.map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity as Finding['severity'],
        line: parseInt(f.location.split(':').pop() || '0'),
        description: f.description,
        technicalExplanation: f.explanation,
        cvss: {
          score: f.severity === 'critical' ? 9.0 : f.severity === 'high' ? 7.0 : f.severity === 'low' ? 3.0 : 1.0,
          attackVector: 'network',
          attackComplexity: 'low',
          privilegesRequired: 'none',
          userInteraction: 'none',
          scope: 'unchanged',
          impact: { confidentiality: 'none', integrity: 'none', availability: 'none' },
        },
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
      addOutput('success', `Scan complete — ${converted.length} findings detected`);
      addOutput('result', `Security Score: ${result.security_score}/100`);
      converted.forEach((f, i) => {
        addOutput(f.severity === 'critical' ? 'error' : f.severity === 'high' ? 'warning' : 'info',
          `[${f.severity.toUpperCase()}] Line ${f.line}: ${f.title}`
        );
      });
      setShowFindings(true);
    } catch (err: any) {
      if (err.message === 'DEMO_MODE') {
        // Fall back to demo findings
        addOutput('warning', 'Backend API not available — using sample data');
        addOutput('info', `Security Score: ${score}/100`);
        DEMO_FINDINGS.forEach((f) => {
          addOutput(f.severity === 'critical' ? 'error' : f.severity === 'high' ? 'warning' : 'info',
            `[${f.severity.toUpperCase()}] Line ${f.line}: ${f.title}`
          );
        });
        addOutput('success', `Demo scan complete — ${DEMO_FINDINGS.length} sample findings loaded`);
        setShowFindings(true);
      } else {
        addOutput('error', `Scan failed: ${err.message}`);
        setScanError(`Scan failed: ${err.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  }, [activeFile, files, apiMode, addOutput, clearOutput, score]);

  const handleFindingClick = (finding: Finding) => {
    setSelectedFinding(finding);
    setHighlightLine(finding.line);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-text font-bold text-sm">
              Security<span className="text-accent">Pad</span>
            </span>
          </a>
          <span className="text-[11px] text-text-muted bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
            IDE
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* API status */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] border ${
            apiMode === 'live' ? 'bg-green-400/10 border-green-400/30 text-green-400' :
            apiMode === 'demo' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' :
            'bg-[#0d1117] border-[#30363d] text-text-muted'
          }`}>
            {apiMode === 'checking' ? <Loader2 className="w-3 h-3 animate-spin" /> :
             apiMode === 'live' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {apiMode === 'live' ? 'Live' : apiMode === 'demo' ? 'Demo' : '...'}
          </div>

          {/* Scan findings summary */}
          {(liveFindings.length > 0 || showFindings) && (
            <button
              onClick={() => setShowFindings(!showFindings)}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              {findings.length} findings
            </button>
          )}

          <a href="/" className="text-text-muted hover:text-text transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar isScanning={isScanning} onRunScan={handleRunScan} />

      {/* Scan error banner */}
      {scanError && (
        <div className="bg-yellow-400/10 border-b border-yellow-400/30 px-4 py-1.5 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-yellow-400">⚠️ {scanError}</span>
          <button onClick={() => setScanError(null)} className="text-yellow-400 hover:text-yellow-300 text-xs">✕</button>
        </div>
      )}

      {/* Main IDE area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        {showExplorer && (
          <div className="w-56 flex-shrink-0">
            <FileExplorer />
          </div>
        )}

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tabs */}
          <FileTabs />

          {/* Editor + Findings (split) */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Code Editor */}
            <div className={`flex-1 min-w-0 ${showFindings ? '' : ''}`}>
              <IDEEditor />
            </div>

            {/* Findings sidebar (collapsible) */}
            {showFindings && (
              <div className="w-80 flex-shrink-0 border-l border-[#30363d] flex flex-col bg-[#0d1117] overflow-hidden">
                <div className="p-3 border-b border-[#30363d] flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text text-sm">Scan Results</h3>
                    <SecurityScore score={score} size={40} />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {criticalCount > 0 && <span className="badge-critical text-[10px]">{criticalCount} Critical</span>}
                    {highCount > 0 && <span className="badge-high text-[10px]">{highCount} High</span>}
                    {lowCount > 0 && <span className="badge-low text-[10px]">{lowCount} Low</span>}
                    {infoCount > 0 && <span className="badge-info text-[10px]">{infoCount} Info</span>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FindingsPanel
                    findings={findings}
                    selectedId={selectedFinding?.id}
                    onSelect={handleFindingClick}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <OutputPanel />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsPanel />
    </div>
  );
}
