'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/verify`,
          { withCredentials: true }
        );

        if (!isMounted) return;

        const data = res.data;

        if (data?.isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(data.user?.role);

          // Role-based gate
          if (requiredRoles.length > 0 && !requiredRoles.includes(data.user?.role)) {
            router.replace('/unauthorized');
            return;
          }
        } else {
          // Not authenticated
          router.replace(`/admin-login?callbackUrl=${encodeURIComponent(pathname)}`);
          return;
        }
      } catch (err) {
        // API or network error -> treat as unauthenticated
        router.replace(`/admin-login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [pathname, requiredRoles, router]);

  if (isLoading) {
    return <LoadingOverlay isLoading={true} text="Verifying session..." />;
  }

  if (isAuthenticated && (requiredRoles.length === 0 || (userRole && requiredRoles.includes(userRole)))) {
    return children;
  }

  return <LoadingOverlay isLoading={true} text="Redirecting..." />;
};

export default ProtectedRoute;
