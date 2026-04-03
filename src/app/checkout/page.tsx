'use client';

import { useState } from 'react';
import { Shield, Check, Loader2, ArrowLeft, Zap, Users, Building2, CreditCard } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Community',
    price: 0,
    period: 'forever',
    icon: <Zap className="w-5 h-5" />,
    features: [
      'Unlimited public repo scans',
      '5 private repo scans / month',
      'Basic Slither analysis',
      'Community support',
      'GitHub integration',
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    period: 'month',
    icon: <Users className="w-5 h-5" />,
    popular: true,
    features: [
      'Everything in Community',
      'Unlimited private scans',
      'AI vulnerability explanations',
      'PoC generation (Foundry)',
      'Auto remediation suggestions',
      'Priority email support',
      'Export audit reports (PDF)',
      'CI/CD integrations',
    ],
    cta: 'Start Pro Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    period: 'month',
    icon: <Building2 className="w-5 h-5" />,
    features: [
      'Everything in Pro',
      'Team management (up to 25)',
      'Custom integration support',
      'SLA (99.9% uptime)',
      'Dedicated account manager',
      'On-premise deployment option',
      'Custom vulnerability detectors',
      'Audit history retention (unlimited)',
      'SSO / SAML authentication',
    ],
    cta: 'Contact Sales',
  },
];

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingEmail, setBillingEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      // Free plan — redirect to signup
      window.location.href = '/login/';
      return;
    }
    setSelectedPlan(planId);
    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // In production, this would call Stripe API
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/10 mb-6">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Welcome to SecurityPad Pro! 🎉</h1>
          <p className="text-muted mb-6">
            Your account has been upgraded. You now have access to unlimited scans, 
            AI explanations, PoC generation, and more.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/scan/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-info hover:bg-info/90 text-white rounded-lg font-medium transition-colors"
            >
              Start Your First Scan <ArrowLeft className="w-4 h-4 rotate-180" />
            </a>
            <a
              href="/dashboard/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-card border border-border text-text rounded-lg font-medium hover:bg-card/80 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-info" />
            <span className="text-lg font-semibold text-text">SecurityPad</span>
          </div>
          <a href="/pricing/" className="text-sm text-muted hover:text-text transition-colors">
            ← View Pricing
          </a>
        </div>
      </div>

      {step === 'select' ? (
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-text mb-2">Choose Your Plan</h1>
            <p className="text-muted">Start free. Upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`relative text-left p-6 rounded-xl border transition-all hover:border-info/50 ${
                  plan.popular
                    ? 'border-info bg-info/5 shadow-lg shadow-info/10'
                    : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-info text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-info">{plan.icon}</span>
                  <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-text">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted">/{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className={`px-4 py-2.5 rounded-lg text-center text-sm font-medium ${
                  plan.popular
                    ? 'bg-info text-white'
                    : 'bg-border/50 text-text'
                }`}>
                  {plan.cta}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-6 py-12">
          <button
            onClick={() => setStep('select')}
            className="text-sm text-muted hover:text-text transition-colors mb-6 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to plans
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text">
              Upgrade to {PLANS.find(p => p.id === selectedPlan)?.name}
            </h2>
            <p className="text-muted mt-1">
              ${PLANS.find(p => p.id === selectedPlan)?.price}/month • Cancel anytime
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Billing Email</label>
              <input
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-info transition-colors"
              />
            </div>

            <div className="p-4 bg-card rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <CreditCard className="w-4 h-4" />
                Payment Details
              </div>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                required
                maxLength={19}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-info transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                  maxLength={5}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-info transition-colors"
                />
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="CVC"
                  required
                  maxLength={4}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-info transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-info hover:bg-info/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Pay ${PLANS.find(p => p.id === selectedPlan)?.price}/month
                </>
              )}
            </button>

            <p className="text-xs text-muted text-center">
              🔒 Secured by Stripe. We never store your card details. Cancel anytime.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
