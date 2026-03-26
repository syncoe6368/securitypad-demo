export const AUTH_TOKEN_KEY = 'securitypad_token';

export type UserRole = 'admin' | 'user';

export interface AuthToken {
  role: UserRole;
  // In a real app, you would have more fields like expiry, etc.
}

/**
 * Set the authentication token in localStorage
 */
export const setAuthToken = (token: AuthToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
  }
};

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): AuthToken | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const tokenStr = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!tokenStr) return null;
  try {
    return JSON.parse(tokenStr);
  } catch {
    return null;
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

/**
 * Check if the current user has the required role
 */
export const hasRole = (requiredRole: UserRole): boolean => {
  const token = getAuthToken();
  return token !== null && token.role === requiredRole;
};

/**
 * Check if the user is authenticated (any role)
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};