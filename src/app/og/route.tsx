// app/og/route.tsx
// Generates a static OG image at build time using SVG → PNG
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛡️</div>
        <div style={{ fontSize: '72px', fontWeight: 800, marginBottom: '16px' }}>SecurityPad</div>
        <div style={{ fontSize: '32px', color: '#94a3b8', textAlign: 'center', maxWidth: '800px' }}>
          AI-Powered Smart Contract Security Auditing
        </div>
        <div style={{ fontSize: '24px', color: '#38bdf8', marginTop: '48px' }}>
          Find vulnerabilities • Generate PoCs • Get AI explanations
        </div>
        <div style={{ fontSize: '18px', color: '#64748b', marginTop: 'auto' }}>
          syncoe.com/securitypad
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
