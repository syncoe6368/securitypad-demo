'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, hasRole, AUTH_TOKEN_KEY } from '@/lib/auth';

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function AuthWrapper({ 
  children, 
  requiredRole 
}: AuthWrapperProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userAuthorized, setUserAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authenticated = isAuthenticated();
        setUserAuthenticated(authenticated);
        
        let authorized = false;
        
        if (authenticated && requiredRole) {
          authorized = hasRole(requiredRole);
          setUserAuthorized(authorized);
        } else if (!requiredRole) {
          setUserAuthorized(true);
        }
        
        setAuthLoading(false);
        
        // Redirect if not authenticated (and the route requires authentication)
        if (!authenticated && requiredRole) {
          router.push('/');
        }
        
        // Redirect if not authorized (authenticated but missing role)
        if (authenticated && requiredRole && !authorized) {
          router.push('/');
        }
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!userAuthenticated) {
    // In a real app, you'd redirect to login page
    // For now, we'll just show a message
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-center text-muted">
          Please authenticate to access this page.
          <br />
          <button className="btn-primary mt-4" onClick={() => {
            // Mock login - in real app this would go to login page
            localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ 
              role: requiredRole || 'user' 
            }));
            window.location.reload();
          }}>
            Login as {requiredRole || 'user'}
          </button>
        </p>
      </div>
    );
  }

  if (!userAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-center text-muted">
          You don't have permission to access this page.
          <br />
          <button className="btn-secondary mt-4" onClick={() => router.push('/')}>
            Go back to dashboard
          </button>
        </p>
      </div>
    );
  }

  return children;
}