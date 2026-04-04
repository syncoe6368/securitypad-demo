'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Check, Loader2, ArrowLeft, Zap, Users, Building2, AlertCircle } from 'lucide-react';
import { createCheckoutSession, getPriceId, isStripeConfigured, type PlanTier } from '@/lib/stripe';

interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  period: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  cta: string;
  disabled?: boolean;
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
    disabled: true,
  },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'redirecting' | 'success' | 'cancelled'>('select');
  const stripeReady = isStripeConfigured();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setStep('success');
    } else if (searchParams.get('cancelled') === 'true') {
      setStep('cancelled');
    }
  }, [searchParams]);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.id === 'free') {
      window.location.href = '/login/';
      return;
    }

    if (plan.id === 'enterprise') {
      // Enterprise = contact sales (no self-serve checkout)
      window.location.href = 'mailto:sales@securitypad.io?subject=SecurityPad%20Enterprise%20Inquiry';
      return;
    }

    setSelectedPlan(plan.id);
    setError(null);

    if (!stripeReady) {
      // Demo mode: simulate success
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setStep('success');
      return;
    }

    // Live Stripe flow
    setStep('redirecting');
    try {
      const session = await createCheckoutSession({
        priceId: getPriceId(plan.id),
        tier: plan.id,
        successUrl: `${window.location.origin}/checkout?success=true`,
        cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
      });

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setStep('select');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
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
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              Start Your First Scan →
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

  if (step === 'cancelled') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Checkout Cancelled</h1>
          <p className="text-muted mb-6">
            No worries — your account hasn&apos;t been charged. You can try again anytime.
          </p>
          <a
            href="/pricing/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pricing
          </a>
        </div>
      </div>
    );
  }

  if (step === 'redirecting') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">Redirecting to Stripe...</h2>
          <p className="text-muted text-sm">You&apos;ll be redirected to our secure payment page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text mb-2">Choose Your Plan</h1>
        <p className="text-muted">Start free. Upgrade when you need more power.</p>
        {!stripeReady && (
          <p className="mt-2 text-xs text-yellow-400">
            ⚠️ Stripe not configured — demo mode active
          </p>
        )}
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handleSelectPlan(plan)}
            disabled={isProcessing && selectedPlan === plan.id}
            className={`relative text-left p-6 rounded-xl border transition-all hover:border-accent/50 ${
              plan.popular
                ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                : 'border-border bg-card'
            } ${(isProcessing && selectedPlan === plan.id) ? 'opacity-60 cursor-wait' : ''}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                Most Popular
              </span>
            )}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-accent">{plan.icon}</span>
              <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold text-text">
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
              </span>
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
                ? 'bg-accent text-white'
                : 'bg-border/50 text-text'
            }`}>
              {isProcessing && selectedPlan === plan.id ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                plan.cta
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted">
          🔒 Payments secured by Stripe. We never see your card details. Cancel anytime from your settings.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
