import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecurityPad — AI Smart Contract Security Auditor',
  description:
    'Copilot helps you code faster. SecurityPad helps you code safer. You need both.',
  openGraph: {
    title: 'SecurityPad — AI Smart Contract Security Auditor',
    description: 'AI-powered smart contract auditing. Catches logic bugs Slither misses, explains them in plain English, generates exploit PoCs.',
    type: 'website',
    // Use the static OG image generator — no API key needed
    images: [{ url: '/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecurityPad — AI Smart Contract Security Auditor',
    description: 'AI-powered smart contract security. Find vulnerabilities, generate PoCs, get AI explanations.',
    images: ['/og'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-text font-bold text-lg group-hover:text-accent transition-colors">
              Security<span className="text-accent">Pad</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-text-muted hover:text-text text-sm transition-colors">
              Home
            </a>
            <a href="/scan" className="text-text-muted hover:text-text text-sm transition-colors">
              Scan
            </a>
            <a href="/dashboard" className="text-text-muted hover:text-text text-sm transition-colors">
              Dashboard
            </a>
            <a href="/pricing" className="text-text-muted hover:text-text text-sm transition-colors">
              Pricing
            </a>
            <a href="/contracts" className="text-text-muted hover:text-text text-sm transition-colors">
              Contracts
            </a>
            <a href="/reports" className="text-text-muted hover:text-text text-sm transition-colors">
              Reports
            </a>
            <a href="/settings" className="text-text-muted hover:text-text text-sm transition-colors">
              Settings
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="/scan"
              className="hidden sm:inline-flex px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Start Scanning
            </a>
            {/* Mobile menu button */}
            <button className="md:hidden text-text-muted hover:text-text">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="text-text font-bold">SecurityPad</span>
            </div>
            <p className="text-text-muted text-sm">
              AI-powered smart contract security. Catch bugs before they cost millions.
            </p>
          </div>
          <div>
            <h4 className="text-text font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="/scan" className="text-text-muted text-sm hover:text-text">Scanner</a></li>
              <li><a href="/dashboard" className="text-text-muted text-sm hover:text-text">Dashboard</a></li>
              <li><a href="/pricing" className="text-text-muted text-sm hover:text-text">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-text font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted text-sm hover:text-text">Documentation</a></li>
              <li><a href="#" className="text-text-muted text-sm hover:text-text">API Reference</a></li>
              <li><a href="#" className="text-text-muted text-sm hover:text-text">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-text font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted text-sm hover:text-text">About</a></li>
              <li><a href="#" className="text-text-muted text-sm hover:text-text">Contact</a></li>
              <li><a href="#" className="text-text-muted text-sm hover:text-text">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-text-muted text-xs">
          © {new Date().getFullYear()} SecurityPad by Syncoe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-text antialiased">
        <Navigation />
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
