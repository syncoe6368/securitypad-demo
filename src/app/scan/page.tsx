'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, ClipboardList } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import FindingsPanel from '@/components/FindingsPanel';
import VulnerabilityDeepDive from '@/components/VulnerabilityDeepDive';
import SecurityScore from '@/components/SecurityScore';
import AuditChecklist from '@/components/AuditChecklist';
import ImmunefiReadiness from '@/components/ImmunefiReadiness';
import { DEMO_CONTRACTS, DEMO_FINDINGS, DEMO_AUDIT_CHECKLIST, DEMO_IMMUNEFI_READINESS } from '@/lib/demo-data';
import type { Finding } from '@/lib/store';

export default function ScanPage() {
  const [selectedContract, setSelectedContract] = useState(0);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | undefined>();
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'checklist' | 'immunefi'>('checklist');

  const contract = DEMO_CONTRACTS[selectedContract];
  const findings = DEMO_FINDINGS; // Show all findings for demo

  // Calculate score based on findings
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;
  const score = Math.max(0, 100 - criticalCount * 25 - highCount * 10 - lowCount * 3 - infoCount * 0.5);

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
          <span className="text-sm text-muted">Interactive audit workstation</span>
        </div>
      </div>

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
