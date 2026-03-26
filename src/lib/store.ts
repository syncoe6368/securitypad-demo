'use client';

import { create } from 'zustand';

export type Severity = 'critical' | 'high' | 'low' | 'info';
export type Exploitability = 'trivial' | 'easy' | 'medium' | 'hard' | 'theoretical';
export type BusinessImpact = 'direct-loss' | 'indirect-loss' | 'dos' | 'info-leak';
export type FindingStatus = 'new' | 'confirmed' | 'false-positive' | 'fixed' | 'wont-fix';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ImmunefiStatus = 'go' | 'no-go' | 'conditional';
export type AuditCheckStatus = 'pass' | 'warning' | 'fail' | 'not-checked';

export interface CVSSScore {
  score: number; // 0-10
  attackVector: 'network' | 'adjacent' | 'local' | 'physical';
  attackComplexity: 'low' | 'high';
  privilegesRequired: 'none' | 'low' | 'high';
  userInteraction: 'none' | 'required';
  scope: 'unchanged' | 'changed';
  impact: {
    confidentiality: 'none' | 'low' | 'high';
    integrity: 'none' | 'low' | 'high';
    availability: 'none' | 'low' | 'high';
  };
}

export interface AttackStep {
  step: number;
  description: string;
  code?: string;
}

export interface AttackPath {
  steps: AttackStep[];
  prerequisites: string[];
  expectedOutcome: string;
  estimatedGasCost?: string;
  realWorldParallel?: string;
}

export interface PoCCode {
  language: 'solidity' | 'javascript' | 'python';
  code: string;
  setupInstructions: string[];
  expectedOutput: string;
  runCommand: string;
}

export interface Remediation {
  beforeCode: string;
  afterCode: string;
  openZeppelinRefs: string[];
  gasImpact: string;
  testingRecommendations: string[];
  alternativeMitigations: string[];
}

export interface Reference {
  title: string;
  url: string;
  type: 'exploit' | 'academic' | 'bounty' | 'detector' | 'documentation';
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  line: number;
  endLine?: number;
  functionName?: string;
  description: string;
  technicalExplanation?: string;
  preconditions?: string[];
  
  // New CVSS fields
  cvss: CVSSScore;
  exploitability: Exploitability;
  businessImpact: BusinessImpact;
  status: FindingStatus;
  confidence: ConfidenceLevel;
  
  // Detailed sections
  attackPath: AttackPath;
  poc: PoCCode;
  remediation: Remediation;
  references: Reference[];
  
  // Legacy fields for backward compatibility
  exploitCode: string;
  fixSuggestion: string;
  learnMore: string;
  
  // Notes
  notes?: string[];
}

export interface Contract {
  id: string;
  name: string;
  lastScan: string;
  score: number;
  findings: Finding[];
  code: string;
  
  // Enhanced metrics
  linesOfCode?: number;
  testCoverage?: number;
  daysSinceLastAudit?: number;
  criticalFunctions?: string[];
  auditReadinessScore?: number;
  vulnerabilityDensity?: number;
  immunefiStatus?: ImmunefiStatus;
  auditChecklist?: AuditCheckItem[];
}

export interface AuditCheckItem {
  id: string;
  category: string;
  description: string;
  status: AuditCheckStatus;
  details?: string;
}

export interface AuditChecklistCategory {
  name: string;
  items: AuditCheckItem[];
}

export interface ImmunefiReadiness {
  status: ImmunefiStatus;
  overallScore: number;
  blockingIssues: Finding[];
  recommendedFixes: Finding[];
  estimatedBountyRange: string;
  submissionChecklist: {
    criticalRemediated: boolean;
    highReviewed: boolean;
    testCoverageAbove80: boolean;
    noKnownExploits: boolean;
    documentationComplete: boolean;
    emergencyPauseExists: boolean;
  };
}

export interface RiskMatrixCell {
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely';
  impact: 'low' | 'medium' | 'high' | 'critical';
  findings: Finding[];
}

export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

interface SecurityPadState {
  // Data
  currentContract: Contract | null;
  findings: Finding[];
  selectedFinding: Finding | null;
  securityScore: number;
  scanStatus: ScanStatus;
  riskMatrix: RiskMatrixCell[];
  immunefiReadiness: ImmunefiReadiness | null;

  // Actions
  setContract: (contract: Contract) => void;
  setFindings: (findings: Finding[]) => void;
  selectFinding: (finding: Finding | null) => void;
  startScan: () => void;
  completeScan: (score: number, findings: Finding[]) => void;
  resetScan: () => void;
  updateFindingStatus: (findingId: string, status: FindingStatus) => void;
  addFindingNote: (findingId: string, note: string) => void;
}

export const useSecurityPadStore = create<SecurityPadState>((set) => ({
  currentContract: null,
  findings: [],
  selectedFinding: null,
  securityScore: 0,
  scanStatus: 'idle',
  riskMatrix: [],
  immunefiReadiness: null,

  setContract: (contract) => set({ 
    currentContract: contract, 
    findings: contract.findings, 
    securityScore: contract.score 
  }),
  setFindings: (findings) => set({ findings }),
  selectFinding: (finding) => set({ selectedFinding: finding }),
  startScan: () => set({ scanStatus: 'scanning' }),
  completeScan: (score, findings) => set({ 
    securityScore: score, 
    findings, 
    scanStatus: 'complete' 
  }),
  resetScan: () => set({ 
    scanStatus: 'idle', 
    findings: [], 
    selectedFinding: null, 
    securityScore: 0 
  }),
  updateFindingStatus: (findingId, status) => set((state) => ({
    findings: state.findings.map(f => 
      f.id === findingId ? { ...f, status } : f
    ),
    selectedFinding: state.selectedFinding?.id === findingId 
      ? { ...state.selectedFinding, status } 
      : state.selectedFinding,
  })),
  addFindingNote: (findingId, note) => set((state) => ({
    findings: state.findings.map(f => 
      f.id === findingId ? { ...f, notes: [...(f.notes || []), note] } : f
    ),
  })),
}));
