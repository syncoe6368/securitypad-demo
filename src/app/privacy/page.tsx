'use client';

import { Shield, Lock, Eye, Server, Database, Scale } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-info" />
            <span className="text-lg font-semibold text-text">SecurityPad</span>
          </div>
          <h1 className="text-3xl font-bold text-text">Privacy Policy</h1>
          <p className="text-muted mt-2">Last updated: April 3, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-text mb-3">1. Information We Collect</h2>
          <div className="text-muted leading-relaxed space-y-3">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-info mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-text">Smart Contract Code</h3>
                <p className="text-sm">Code you submit for analysis is processed in memory and not stored permanently, unless you explicitly save a project.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-info mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-text">Account Information</h3>
                <p className="text-sm">Email address, name (optional), and authentication tokens. Passwords are hashed using bcrypt.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-info mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-text">Usage Analytics</h3>
                <p className="text-sm">We collect anonymized usage data (scan counts, feature usage) to improve the Service. No personal data is included.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">2. How We Use Your Information</h2>
          <ul className="text-muted leading-relaxed space-y-1 list-disc pl-6">
            <li>Provide and maintain the SecurityPad Service</li>
            <li>Process smart contract analysis requests</li>
            <li>Send service-related notifications (rarely)</li>
            <li>Improve the Service based on anonymized usage patterns</li>
            <li>Prevent abuse and ensure platform security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">3. Data Sharing</h2>
          <p className="text-muted leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We may share anonymized, 
            aggregated data for analytical purposes. Smart contract code submitted for analysis is sent to our 
            AI provider (Anthropic) for vulnerability explanation generation. Code is not used to train AI models.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">4. Data Security</h2>
          <div className="text-muted leading-relaxed space-y-2">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-info mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-text">Infrastructure</h3>
                <p className="text-sm">Hosted on Vercel (frontend) and Render.com (backend). All data encrypted in transit (TLS 1.3) and at rest.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-info mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-text">Authentication</h3>
                <p className="text-sm">JWT tokens with secure HTTP-only cookies. Passwords hashed with bcrypt (cost factor 12).</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">5. Data Retention</h2>
          <p className="text-muted leading-relaxed">
            Free tier: Projects and scan data retained for 30 days. Pro/Enterprise: Retained for the duration of 
            your subscription plus 30 days. You may request deletion of your data at any time by contacting 
            <a href="mailto:privacy@syncoe.com" className="text-info hover:underline ml-1">privacy@syncoe.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">6. Your Rights</h2>
          <ul className="text-muted leading-relaxed space-y-1 list-disc pl-6">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of analytics tracking</li>
          </ul>
          <p className="text-muted mt-2 text-sm">
            As a service primarily used by developers and businesses, the Personal Data Protection Act 2010 (PDPA) of Malaysia applies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">7. Cookies</h2>
          <p className="text-muted leading-relaxed">
            We use essential cookies for authentication (HTTP-only, secure). No third-party advertising cookies. 
            Analytics cookies (if any) are anonymized and can be disabled in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">8. Changes to This Policy</h2>
          <p className="text-muted leading-relaxed">
            We may update this Privacy Policy periodically. Material changes will be notified via email or in-app 
            notification at least 30 days before taking effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text mb-3">9. Contact</h2>
          <p className="text-muted leading-relaxed">
            Data Protection Officer: <a href="mailto:privacy@syncoe.com" className="text-info hover:underline">privacy@syncoe.com</a>
          </p>
        </section>

        <div className="pt-8 border-t border-border flex justify-between">
          <a href="/terms/" className="text-sm text-info hover:underline">Terms of Service</a>
          <a href="/" className="text-sm text-muted hover:text-text transition-colors">← Back to SecurityPad</a>
        </div>
      </div>
    </div>
  );
}
