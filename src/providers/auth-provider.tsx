import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../features/auth/store';
import { syncCatalog } from '../services/sync-service';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      syncCatalog()
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['exercises'] });
        })
        .catch(() => {
          // Silently fail — user can sync manually in Settings
        });
    }
  }, [isAuthenticated, queryClient]);

  return <>{children}</>;
}
