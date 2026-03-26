'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface StatsCardProps {
  label: string;
  value: ReactNode;
  change?: string;
  changePositive?: boolean;
  icon?: ReactNode;
  iconTooltip?: string;
  nextStepsText?: string;
  nextStepsHref?: string;
  valueColorClass?: string;
  subtext?: string;
}

export default function StatsCard({ 
  label, 
  value, 
  change, 
  changePositive, 
  icon, 
  iconTooltip, 
  nextStepsText, 
  nextStepsHref, 
  valueColorClass,
  subtext 
}: StatsCardProps) {
  return (
    <div className="card p-4 flex flex-col justify-between h-full hover:border-info/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
          <div className={`text-2xl font-bold mt-1 ${valueColorClass || ''}`}>
            {value}
          </div>
          {subtext && <p className="text-xs mt-1 text-muted">{subtext}</p>}
          {change && (
            <p className={`text-xs mt-1 ${changePositive ? 'text-green-400' : 'text-red-400'}`}>
              {changePositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        {icon && (
          <div 
            className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info"
            title={iconTooltip}
          >
            {icon}
          </div>
        )}
      </div>
      
      {nextStepsText && nextStepsHref && (
        <div className="mt-auto pt-4 border-t border-border">
          <Link href={nextStepsHref} className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center">
            {nextStepsText} <span className="ml-1">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

