'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Monaco Editor and localStorage
const IDELayout = dynamic(() => import('@/components/ide/IDELayout'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-[#0d1117] text-text-muted">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">⬡</div>
        <p className="text-sm">Loading SecurityPad IDE...</p>
      </div>
    </div>
  ),
});

export default function ScanPage() {
  return <IDELayout />;
}
