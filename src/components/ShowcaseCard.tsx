"use client";

import { AlertTriangle, DollarSign, Calendar, ExternalLink } from "lucide-react";

interface ShowcaseCardProps {
  title: string;
  amount: string;
  date: string;
  description: string;
  vulnerability: string;
  howWeCatch: string;
}

export default function ShowcaseCard({
  title,
  amount,
  date,
  description,
  vulnerability,
  howWeCatch,
}: ShowcaseCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden card-hover">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-critical" size={20} />
            <h3 className="text-text font-bold">{title}</h3>
          </div>
          <a
            href="#"
            className="text-text-muted hover:text-accent transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-critical/10 text-critical px-2.5 py-1 rounded-lg text-sm font-semibold">
            <DollarSign size={14} />
            {amount} Lost
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg text-sm text-text-muted">
            <Calendar size={14} />
            {date}
          </div>
        </div>

        <p className="text-text-muted text-sm mb-4">{description}</p>

        <div className="space-y-3">
          <div>
            <h4 className="text-text text-xs font-semibold uppercase tracking-wide mb-1">
              Vulnerability Type
            </h4>
            <code className="text-high text-xs bg-background px-2 py-1 rounded">{vulnerability}</code>
          </div>
          <div>
            <h4 className="text-text text-xs font-semibold uppercase tracking-wide mb-1">
              How SecurityPad Catches This
            </h4>
            <p className="text-text-muted text-sm">{howWeCatch}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
