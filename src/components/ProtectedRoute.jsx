'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        // Call Next API route instead of backend
        const res = await axios.get('/api/auth/verify', {
          headers: { Accept: 'application/json' },
        });

        const data = res.data;

        if (cancelled) return;

        if (data?.isAuthenticated) {
          setRole(data.role || null);

          // Role check if needed
          if (requiredRoles.length > 0 && !requiredRoles.includes(data.role)) {
            router.replace('/unauthorized');
            return;
          }

          setReady(true);
        } else {
          const url = new URL('/', window.location.origin);
          url.searchParams.set('callbackUrl', pathname);
          router.replace(url.toString());
        }
      } catch (err) {
        console.error('Auth check error:', err);
        const url = new URL('/', window.location.origin);
        url.searchParams.set('callbackUrl', pathname);
        router.replace(url.toString());
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, [pathname, requiredRoles, router]);

  // if (!ready) return <LoadingOverlay isLoading={true} text="Verifying session..." />;

  return children;
};

export default ProtectedRoute;
