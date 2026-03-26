const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Scan
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
