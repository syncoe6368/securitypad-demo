/**
 * Usage tracking for SecurityPad scan limits per tier.
 *
 * Tiers:
 * - Free: 5 private scans/month, unlimited public
 * - Pro: Unlimited scans
 * - Enterprise: Unlimited scans + team
 *
 * Usage is tracked via backend API; falls back to localStorage in demo mode.
 */

export type TierLevel = 'free' | 'pro' | 'enterprise';

export interface UsageData {
  tier: TierLevel;
  privateScansUsed: number;
  privateScansLimit: number | null; // null = unlimited
  publicScansUsed: number;
  publicScansLimit: number | null; // null = unlimited
  periodStart: string; // ISO date
  periodEnd: string;   // ISO date
}

export const TIER_LIMITS: Record<TierLevel, { privateScans: number | null; publicScans: number | null }> = {
  free: { privateScans: 5, publicScans: null },
  pro: { privateScans: null, publicScans: null },
  enterprise: { privateScans: null, publicScans: null },
};

export const TIER_NAMES: Record<TierLevel, string> = {
  free: 'Community',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const USAGE_CACHE_KEY = 'sp_usage_cache';
const USAGE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedUsage {
  data: UsageData;
  timestamp: number;
}

/**
 * Fetch current usage data from backend API.
 * Falls back to localStorage cache in demo mode.
 */
export async function getUsage(): Promise<UsageData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sp_token') : null;

  // Try cached data first (avoid excessive API calls)
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(USAGE_CACHE_KEY);
    if (cached) {
      try {
        const parsed: CachedUsage = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < USAGE_CACHE_TTL_MS) {
          return parsed.data;
        }
      } catch { /* invalid cache */ }
    }
  }

  // If no API or no token, return free tier defaults
  if (!API_BASE || !token) {
    const usage = getDemoModeUsage();
    cacheUsage(usage);
    return usage;
  }

  try {
    const res = await fetch(`${API_BASE}/api/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Usage fetch failed');

    const data: UsageData = await res.json();
    cacheUsage(data);
    return data;
  } catch {
    // Return cached or default
    const cached = getCachedUsage();
    return cached || getDemoModeUsage();
  }
}

/**
 * Check if a scan is allowed based on current usage and tier.
 */
export function canScan(usage: UsageData, isPrivate: boolean): boolean {
  if (isPrivate) {
    if (usage.privateScansLimit === null) return true; // unlimited
    return usage.privateScansUsed < usage.privateScansLimit;
  }
  if (usage.publicScansLimit === null) return true;
  return usage.publicScansUsed < usage.publicScansLimit;
}

/**
 * Get remaining scans for the current period.
 */
export function getRemainingScans(usage: UsageData, isPrivate: boolean): number | null {
  if (isPrivate) {
    if (usage.privateScansLimit === null) return null;
    return Math.max(0, usage.privateScansLimit - usage.privateScansUsed);
  }
  if (usage.publicScansLimit === null) return null;
  return Math.max(0, usage.publicScansLimit - usage.publicScansUsed);
}

/**
 * Get human-readable scan limit text for UI display.
 */
export function getScanLimitText(usage: UsageData, isPrivate: boolean): string {
  const remaining = getRemainingScans(usage, isPrivate);
  if (remaining === null) return 'Unlimited';
  return `${remaining} remaining`;
}

/** Cache usage data to localStorage */
function cacheUsage(data: UsageData): void {
  if (typeof window === 'undefined') return;
  const cached: CachedUsage = { data, timestamp: Date.now() };
  localStorage.setItem(USAGE_CACHE_KEY, JSON.stringify(cached));
}

/** Get cached usage from localStorage */
function getCachedUsage(): UsageData | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(USAGE_CACHE_KEY);
  if (!cached) return null;
  try {
    return JSON.parse(cached).data;
  } catch {
    return null;
  }
}

/** Generate demo mode usage data (free tier with 2 demo scans used) */
function getDemoModeUsage(): UsageData {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    tier: 'free',
    privateScansUsed: 2,
    privateScansLimit: 5,
    publicScansUsed: 0,
    publicScansLimit: null,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };
}
