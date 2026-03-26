'use client';

import { Shield, AlertOctagon, AlertTriangle, CheckCircle, DollarSign, Clock, BookOpen } from 'lucide-react';
import type { ImmunefiReadiness as ImmunefiReadinessType, Finding, ImmunefiStatus } from '@/lib/store';

interface ImmunefiReadinessProps {
  readiness: ImmunefiReadinessType;
}

const statusConfig: Record<ImmunefiStatus, { label: string; description: string; color: string; bg: string; icon: React.ReactNode }> = {
  'go': {
    label: 'READY FOR SUBMISSION',
    description: 'All critical/high issues resolved. Documentation and test coverage meet Immunefi minimum requirements.',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
  },
  'conditional': {
    label: 'CONDITIONAL — FIXES NEEDED',
    description: 'Minor issues remain. Can be submitted, but fixing these will maximize your bounty potential.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  },
  'no-go': {
    label: 'NOT READY — CRITICAL ISSUES',
    description: 'Critical vulnerabilities present. Do not submit until blocking issues are fully remediated.',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
  },
};

export default function ImmunefiReadiness({ readiness }: ImmunefiReadinessProps) {
  const config = statusConfig[readiness.status];
  const checklist = readiness.submissionChecklist;
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;

  const checklistLabels: Record<string, string> = {
    criticalRemediated: 'All critical findings remediated',
    highReviewed: 'All high findings reviewed',
    testCoverageAbove80: 'Test coverage >80%',
    noKnownExploits: 'No known exploits in similar protocols',
    documentationComplete: 'Documentation complete',
    emergencyPauseExists: 'Emergency pause mechanism exists',
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-info" />
        <h3 className="text-lg font-semibold">Immunefi Readiness</h3>
      </div>

      {/* Status Badge */}
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} mb-4`} title={config.description}>
        <div className="mt-0.5">{config.icon}</div>
        <div>
          <div className={`font-bold ${config.color}`}>{config.label}</div>
          <div className={`text-xs mt-1 ${config.color} opacity-80`}>
            {config.description}
          </div>
          <div className="text-sm text-muted mt-2 pt-2 border-t border-current/10">
            Overall Score: {readiness.overallScore}/100
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Readiness Score</span>
          <span>{readiness.overallScore}/100</span>
        </div>
        <div className="h-2 rounded-full bg-background overflow-hidden">
          <div
            className={`h-full transition-all ${
              readiness.overallScore >= 80 ? 'bg-green-400' :
              readiness.overallScore >= 60 ? 'bg-yellow-400' :
              readiness.overallScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${readiness.overallScore}%` }}
          />
        </div>
      </div>

      {/* Submission Checklist */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted" />
            Submission Checklist
          </h4>
          <span className="text-xs text-muted">{checkedCount}/{totalChecks} complete</span>
        </div>
        <div className="space-y-2">
          {Object.entries(checklistLabels).map(([key, label]) => {
            const isChecked = checklist[key as keyof typeof checklist];
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                {isChecked ? (
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-red-400 shrink-0" />
                )}
                <span className={isChecked ? 'text-muted' : 'text-text'}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocking Issues */}
      {readiness.blockingIssues.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
            <AlertOctagon className="w-4 h-4" />
            Blocking Issues ({readiness.blockingIssues.length})
          </h4>
          <div className="space-y-2">
            {readiness.blockingIssues.map(finding => (
              <div key={finding.id} className="p-2 bg-red-400/10 border border-red-400/20 rounded text-sm">
                <div className="font-medium">{finding.title}</div>
                <div className="text-xs text-muted mt-1">
                  Line {finding.line} • {finding.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Fixes */}
      {readiness.recommendedFixes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Recommended Fixes ({readiness.recommendedFixes.length})
          </h4>
          <div className="space-y-2">
            {readiness.recommendedFixes.map(finding => (
              <div key={finding.id} className="p-2 bg-yellow-400/10 border border-yellow-400/20 rounded text-sm">
                <div className="font-medium">{finding.title}</div>
                <div className="text-xs text-muted mt-1">
                  Line {finding.line} • {finding.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Bounty */}
      <div className="flex items-center gap-3 p-3 bg-info/10 border border-info/20 rounded-lg">
        <DollarSign className="w-5 h-5 text-info shrink-0" />
        <div>
          <div className="text-sm font-medium">Estimated Bounty Range</div>
          <div className="text-lg font-bold text-info">{readiness.estimatedBountyRange}</div>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={readiness.status === 'no-go'}
        className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
          readiness.status === 'go'
            ? 'bg-green-400/20 text-green-400 hover:bg-green-400/30 border border-green-400/30'
            : readiness.status === 'conditional'
            ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/30'
            : 'bg-gray-400/10 text-gray-500 cursor-not-allowed border border-gray-400/20'
        }`}
      >
        {readiness.status === 'go' ? 'Submit to Immunefi →' : readiness.status === 'conditional' ? 'Review Fixes First' : 'Fix Critical Issues First'}
      </button>
    </div>
  );
}
