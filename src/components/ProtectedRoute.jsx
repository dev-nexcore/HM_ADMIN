'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
            setUserRole(data.role);
            
            // Check role-based access
            if (requiredRoles.length > 0 && !requiredRoles.includes(data.role)) {
              router.replace('/unauthorized');
              return;
            }
          } else {
            // Not authenticated, redirect to login
            const callbackUrl = encodeURIComponent(pathname);
            router.replace(`/login?callbackUrl=${callbackUrl}`);
            return;
          }
        } else {
          // API error, redirect to login
          const callbackUrl = encodeURIComponent(pathname);
          router.replace(`/login?callbackUrl=${callbackUrl}`);
          return;
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        if (isMounted) {
          const callbackUrl = encodeURIComponent(pathname);
          router.replace(`/login?error=auth_failed&callbackUrl=${callbackUrl}`);
        }
        return;
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [pathname, requiredRoles, router]);

  // Show loading overlay while checking auth
  if (isLoading) {
    return <LoadingOverlay isLoading={true} text="Verifying session..." />;
  }

  // Only render children if authenticated and has required role
  if (isAuthenticated && (requiredRoles.length === 0 || (userRole && requiredRoles.includes(userRole)))) {
    return children;
  }

  // If not authenticated or unauthorized, don't render anything (will redirect)
  return <LoadingOverlay isLoading={true} text="Redirecting..." />;
};

export default ProtectedRoute;