const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Try to detect if we're in demo mode (no backend available)
let isDemoMode = true; // Start in demo mode, switch to live if API responds

async function checkApiHealth(): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/demo/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Check API health on load (client-side only)
if (typeof window !== 'undefined') {
  checkApiHealth().then(available => {
    isDemoMode = !available;
    console.log(`SecurityPad API mode: ${isDemoMode ? 'DEMO' : 'LIVE'}`);
  });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sp_token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface ScanResult {
  scan_id: string;
  security_score: number;
  total_findings: number;
  critical_count: number;
  high_count: number;
  low_count: number;
  info_count: number;
  findings: Array<{
    id: string;
    severity: string;
    title: string;
    location: string;
    description: string;
    explanation?: string;
  }>;
  message: string;
}

export const api = {
  /** Check if backend API is available */
  isLive: () => !isDemoMode,

  /** Scan Solidity code via public demo endpoint (no auth) */
  demoScan: async (code: string): Promise<ScanResult> => {
    if (isDemoMode) {
      throw new Error('DEMO_MODE');
    }
    return request<ScanResult>('/demo/scan', {
      method: 'POST',
      body: JSON.stringify({ code, language: 'solidity' }),
    });
  },

  /** Scan Solidity code via authenticated endpoint */
  scanContract: (code: string, filename: string) =>
    request<{ findings: any[]; score: number }>('/scan', {
      method: 'POST',
      body: JSON.stringify({ code, filename }),
    }),

  // Projects
  getProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (name: string) =>
    request<any>('/projects', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),

  // Findings
  getFindings: (projectId: string) => request<any[]>(`/projects/${projectId}/findings`),

  // PoC generation
  generatePoc: (findingId: string) =>
    request<{ poc: string }>(`/findings/${findingId}/poc`, { method: 'POST' }),

  // Fix suggestion
  suggestFix: (findingId: string) =>
    request<{ fix: string; explanation: string }>(`/findings/${findingId}/fix`, { method: 'POST' }),

  // Reports
  generateReport: (projectIds: string[]) =>
    request<{ reportId: string; url: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    }),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};
