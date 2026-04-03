import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SecurityPad',
  description: 'Privacy Policy for SecurityPad AI Smart Contract Security Auditor.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text mb-2">Privacy Policy</h1>
      <p className="text-text-muted text-sm mb-8">Last updated: April 3, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-text-muted text-sm leading-relaxed">
        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">1. Overview</h2>
          <p>
            Syncoe (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates SecurityPad, an AI-powered smart contract security analysis tool. This Privacy Policy explains how we collect, use, and protect your information when you use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">2. Information We Collect</h2>

          <h3 className="text-text font-medium mt-4 mb-2">2.1 Code You Submit</h3>
          <p>
            When you use our scanner, we temporarily process the smart contract code you submit for analysis purposes only. We:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Process your code in memory to generate vulnerability analysis</li>
            <li>Store scan results in your project history for your review</li>
            <li>Do NOT train AI models on your code</li>
            <li>Do NOT share your code with third parties</li>
          </ul>

          <h3 className="text-text font-medium mt-4 mb-2">2.2 Account Information</h3>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Email address (for account creation and notifications)</li>
            <li>GitHub username (if using GitHub OAuth)</li>
            <li>Display name and avatar (optional)</li>
          </ul>

          <h3 className="text-text font-medium mt-4 mb-2">2.3 Usage Data</h3>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Number of scans performed and plan usage</li>
            <li>Features used and pages visited</li>
            <li>Browser type and device information</li>
            <li>Errors and performance metrics</li>
          </ul>

          <h3 className="text-text font-medium mt-4 mb-2">2.4 Payment Information</h3>
          <p>
            Payment processing is handled by Stripe. We do not store credit card numbers on our servers. We retain only transaction records and billing status.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Service delivery:</strong> Process scans, generate reports, manage your account</li>
            <li><strong>Communication:</strong> Send security alerts, billing notices, and product updates</li>
            <li><strong>Improvement:</strong> Analyze usage patterns to improve features and performance</li>
            <li><strong>Security:</strong> Detect abuse, enforce rate limits, and protect the platform</li>
            <li><strong>Legal compliance:</strong> Respond to lawful requests where required</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">4. Data Storage &amp; Retention</h2>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Scan results:</strong> Retained for the lifetime of your account</li>
            <li><strong>Submitted code:</strong> Processed in transit; not stored in raw form after analysis</li>
            <li><strong>Account data:</strong> Retained until account deletion is requested</li>
            <li><strong>Usage logs:</strong> Automatically purged after 90 days</li>
          </ul>
          <p className="mt-2">
            Data is stored on servers in the United States (Vercel) and/or Singapore (Render), depending on deployment configuration.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">5. Data Sharing</h2>
          <p>We do NOT sell, rent, or trade your personal information. We share data only with:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Service providers:</strong> Vercel (hosting), Stripe (payments), and AI analysis providers (for scan processing only)</li>
            <li><strong>Legal requirements:</strong> When required by law, court order, or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">6. Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>HTTPS/TLS encryption for all data in transit</li>
            <li>Encrypted storage for sensitive data at rest</li>
            <li>Regular security assessments of our infrastructure</li>
            <li>Access controls limiting data access to authorized personnel</li>
          </ul>
          <p className="mt-2">
            No system is 100% secure. We encourage responsible disclosure of any vulnerabilities found in our platform.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">7. Your Rights</h2>
          <p>You may:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correct:</strong> Update your account information at any time</li>
            <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
            <li><strong>Export:</strong> Download your scan history and reports</li>
            <li><strong>Opt out:</strong> Unsubscribe from non-essential communications</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, contact us via GitHub or email.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">8. Cookies &amp; Local Storage</h2>
          <p>We use minimal client-side storage:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Authentication tokens:</strong> Secure, HttpOnly cookies for session management</li>
            <li><strong>Preferences:</strong> LocalStorage for UI preferences (theme, editor settings)</li>
            <li><strong>No tracking cookies:</strong> We do not use third-party analytics cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">9. Children&apos;s Privacy</h2>
          <p>
            SecurityPad is not intended for use by individuals under 18 years of age. We do not knowingly collect data from minors.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Significant changes will be communicated via the Service or by email. Continued use of the Service after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">11. Contact</h2>
          <p>For privacy-related inquiries:</p>
          <ul className="list-none pl-0 space-y-1 mt-2">
            <li><strong>Company:</strong> Syncoe</li>
            <li><strong>Location:</strong> Bayan Lepas, Penang, Malaysia</li>
            <li><strong>GitHub:</strong> <a href="https://github.com/syncoe6368/securitypad-demo" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">syncoe6368/securitypad-demo</a></li>
          </ul>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <a href="/" className="text-accent hover:underline text-sm">&larr; Back to SecurityPad</a>
      </div>
    </div>
  );
}
