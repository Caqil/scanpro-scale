import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/auth-context';

interface ProtectedRouteOptions {
  adminOnly?: boolean;
  redirectTo?: string;
}

export function useProtectedRoute(options: ProtectedRouteOptions = {}) {
  const { adminOnly = false, redirectTo = '/en/login' } = options;
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (adminOnly && user?.role !== 'admin') {
        router.push('/en/dashboard');
      }
    }
  }, [isAuthenticated, user, loading, adminOnly, redirectTo, router]);

  return { isAuthenticated, user, loading };
}