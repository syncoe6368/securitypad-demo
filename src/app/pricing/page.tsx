"use client";

import PricingCard from "@/components/PricingCard";
import ComparisonTable from "@/components/ComparisonTable";
import { Shield, Zap, Building2 } from "lucide-react";

const TIERS = [
  {
    tier: "Community",
    price: "Free",
    period: "",
    description: "For individual developers and open-source projects",
    icon: Shield,
    features: [
      { name: "Unlimited public repo scans", included: true },
      { name: "5 private repo scans / month", included: true },
      { name: "AI vulnerability explanations", included: true },
      { name: "Slither integration", included: true },
      { name: "Community support", included: true },
      { name: "PoC generation", included: false },
      { name: "Auto remediation", included: false },
      { name: "CI/CD integration", included: false },
      { name: "Audit report export", included: false },
      { name: "Priority support", included: false },
    ],
    highlighted: false,
    cta: "Get Started Free",
  },
  {
    tier: "Pro",
    price: "$99",
    period: "/mo",
    description: "For professional developers and small teams",
    icon: Zap,
    features: [
      { name: "Unlimited public repo scans", included: true },
      { name: "Unlimited private repo scans", included: true },
      { name: "AI vulnerability explanations", included: true },
      { name: "Slither integration", included: true },
      { name: "Community support", included: true },
      { name: "PoC generation", included: true },
      { name: "Auto remediation", included: true },
      { name: "CI/CD integration (GitHub)", included: true },
      { name: "Audit report export", included: true },
      { name: "Priority support", included: false },
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    tier: "Enterprise",
    price: "$499",
    period: "/mo",
    description: "For audit firms and enterprise teams",
    icon: Building2,
    features: [
      { name: "Unlimited public repo scans", included: true },
      { name: "Unlimited private repo scans", included: true },
      { name: "AI vulnerability explanations", included: true },
      { name: "Slither integration", included: true },
      { name: "Community support", included: true },
      { name: "PoC generation", included: true },
      { name: "Auto remediation", included: true },
      { name: "CI/CD integration (All providers)", included: true },
      { name: "Audit report export", included: true },
      { name: "Priority support + SLA", included: true },
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  const handleSelect = (tier: string) => {
    if (tier === "Community") {
      window.location.href = "/scan";
    } else if (tier === "Enterprise") {
      // Would redirect to contact form
      alert("Contact sales: sales@securitypad.io");
    } else {
      // Would redirect to Stripe checkout
      alert(`Stripe checkout for ${tier}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Start free. Upgrade when you need more. No hidden fees, no surprises.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
        {TIERS.map((tier) => (
          <PricingCard
            key={tier.tier}
            tier={tier.tier}
            price={tier.price}
            period={tier.period}
            description={tier.description}
            features={tier.features}
            highlighted={tier.highlighted}
            cta={tier.cta}
            onSelect={() => handleSelect(tier.tier)}
          />
        ))}
      </div>

      {/* Comparison: SecurityPad vs Slither vs Copilot */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
            Why Not Just Use Slither or Copilot?
          </h2>
          <p className="text-text-muted">
            Different tools for different jobs. SecurityPad fills the gap.
          </p>
        </div>
        <ComparisonTable />
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-text text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "How is SecurityPad different from Slither?",
              a: "Slither is a pattern-matching static analyzer — fast but gives raw output. SecurityPad runs Slither under the hood, then uses AI to explain findings in plain English, generate exploit PoCs, and suggest fixes with code examples.",
            },
            {
              q: "Can I use SecurityPad alongside GitHub Copilot?",
              a: "Absolutely! Copilot helps you write code faster. SecurityPad helps you write safer code. They complement each other perfectly. Many developers use both.",
            },
            {
              q: "What languages are supported?",
              a: "Currently we support Solidity (all versions) with deep DeFi-specific analysis. Vyper support is on our roadmap.",
            },
            {
              q: "Is my code stored on your servers?",
              a: "We only store the code you explicitly save as part of a project. Ephemeral scans are processed in-memory and deleted immediately after analysis.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. All plans are month-to-month with no contracts. Cancel anytime from your settings page.",
            },
          ].map((faq, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-text font-semibold mb-2">{faq.q}</h3>
              <p className="text-text-muted text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
