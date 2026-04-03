import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SecurityPad',
  description: 'Terms of Service for SecurityPad AI Smart Contract Security Auditor.',
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text mb-2">Terms of Service</h1>
      <p className="text-text-muted text-sm mb-8">Last updated: April 3, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-text-muted text-sm leading-relaxed">
        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SecurityPad (&quot;the Service&quot;), provided by Syncoe (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">2. Description of Service</h2>
          <p>
            SecurityPad is an AI-powered smart contract security analysis tool that scans Solidity and other EVM-compatible smart contract code for vulnerabilities, generates security reports, and provides remediation guidance. The Service includes:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Static analysis and vulnerability detection</li>
            <li>AI-generated vulnerability explanations</li>
            <li>Proof-of-Concept (PoC) exploit generation</li>
            <li>Security audit reports</li>
            <li>Project management and scan history</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">3. Free Tier &amp; Paid Plans</h2>
          <p>
            <strong>Free Tier:</strong> Limited to 5 scans per month with basic vulnerability detection. Results are for educational and preliminary review purposes only.
          </p>
          <p className="mt-2">
            <strong>Pro Tier ($99/month):</strong> Unlimited scans, AI explanations, PoC generation, and priority analysis.
          </p>
          <p className="mt-2">
            <strong>Enterprise Tier ($499/month):</strong> Team collaboration, custom rules, API access, and dedicated support.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">4. Disclaimer of Warranties</h2>
          <p>
            <strong className="text-amber-400">⚠; IMPORTANT:</strong> SecurityPad is an automated analysis tool and does NOT constitute a professional security audit. Our Service:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>May not detect all vulnerabilities</li>
            <li>May produce false positives or false negatives</li>
            <li>Should NOT be relied upon as the sole basis for smart contract deployment decisions</li>
            <li>Does not replace professional security review by qualified auditors</li>
          </ul>
          <p className="mt-2">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Syncoe shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Loss of funds due to smart contract exploits not detected by the Service</li>
            <li>Financial losses from deployment of code analyzed by the Service</li>
            <li>Any damages arising from reliance on scan results</li>
          </ul>
          <p className="mt-2">
            Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">6. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Not use the Service for malicious purposes or to exploit vulnerabilities in contracts you do not own or have authorization to test</li>
            <li>Not attempt to reverse-engineer, decompile, or disrupt the Service</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Not submit code that contains malware or illegal content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">7. Intellectual Property</h2>
          <p>
            You retain all rights to code you submit for analysis. By using the Service, you grant us a limited, non-exclusive license to process your code for the purpose of providing the analysis.
          </p>
          <p className="mt-2">
            SecurityPad&apos;s analysis methodology, AI models, and generated reports are the intellectual property of Syncoe. You may use reports for your own purposes but may not resell or redistribute them as a competing service.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">8. Payment &amp; Refunds</h2>
          <p>
            Paid plans are billed monthly in advance. You may cancel at any time; access continues through the end of the billing period. Refunds are available within 7 days of initial purchase if the Service has been used for fewer than 10 scans.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">9. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service for violation of these Terms, with notice where practicable. Upon termination, your scan history will be retained for 30 days before deletion.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Malaysia. Any disputes shall be resolved in the courts of Penang, Malaysia.
          </p>
        </section>

        <section>
          <h2 className="text-text text-lg font-semibold mt-8 mb-3">11. Contact</h2>
          <p>
            For questions about these Terms, contact us at:
          </p>
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
