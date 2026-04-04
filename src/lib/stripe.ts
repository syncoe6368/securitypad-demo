/**
 * Stripe integration layer for SecurityPad.
 *
 * Architecture:
 * - Frontend: Redirects to Stripe Checkout (no card data touches our servers)
 * - Backend: Handles webhooks (checkout.session.completed, customer.subscription.*)
 * - Pricing IDs stored in env vars, with fallback to hardcoded test-mode IDs
 *
 * Setup:
 * 1. Create products + prices in Stripe Dashboard (or via CLI)
 * 2. Set STRIPE_PRO_PRICE_ID and STRIPE_ENTERPRISE_PRICE_ID env vars
 * 3. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for client-side
 * 4. Backend handles webhook at /api/stripe/webhook
 */

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  proPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprisePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
  apiBase: process.env.NEXT_PUBLIC_API_URL || '',
} as const;

export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface CheckoutSessionRequest {
  priceId: string;
  tier: PlanTier;
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalRequest {
  customerId: string;
  returnUrl?: string;
}

export interface CustomerPortalResponse {
  url: string;
}

/**
 * Create a Stripe Checkout session via backend API.
 * Redirects user to Stripe-hosted payment page.
 */
export async function createCheckoutSession(
  params: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sp_token') : null;

  const res = await fetch(`${STRIPE_CONFIG.apiBase}/api/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      priceId: params.priceId,
      tier: params.tier,
      email: params.email,
      successUrl: params.successUrl || `${window.location.origin}/checkout?success=true`,
      cancelUrl: params.cancelUrl || `${window.location.origin}/pricing`,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create checkout session');
  }

  return res.json();
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 */
export async function createCustomerPortalSession(
  params: CustomerPortalRequest
): Promise<CustomerPortalResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sp_token') : null;

  const res = await fetch(`${STRIPE_CONFIG.apiBase}/api/stripe/portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      customerId: params.customerId,
      returnUrl: params.returnUrl || `${window.location.origin}/settings`,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create portal session');
  }

  return res.json();
}

/**
 * Get the price ID for a given tier.
 */
export function getPriceId(tier: PlanTier): string {
  switch (tier) {
    case 'pro':
      return STRIPE_CONFIG.proPriceId;
    case 'enterprise':
      return STRIPE_CONFIG.enterprisePriceId;
    default:
      throw new Error(`No price ID for tier: ${tier}`);
  }
}

/**
 * Check if Stripe is configured (publishable key present and not placeholder).
 */
export function isStripeConfigured(): boolean {
  return (
    !!STRIPE_CONFIG.publishableKey &&
    STRIPE_CONFIG.publishableKey !== 'pk_test_placeholder' &&
    STRIPE_CONFIG.publishableKey.startsWith('pk_')
  );
}
