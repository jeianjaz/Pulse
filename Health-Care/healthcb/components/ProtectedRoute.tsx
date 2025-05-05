"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  requiredUserType?: number;
}

export default function ProtectedRoute({
  children,
  redirectIfAuthenticated = false,
  requiredUserType
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Don't proceed until auth check is complete
    if (isLoading) return;

    // For login/register pages (redirectIfAuthenticated=true)
    if (redirectIfAuthenticated && user) {
      // If user is logged in, redirect to appropriate dashboard based on role
      const redirects = {
        1: '/patient/',
        2: '/doctor/',
        3: '/admin/'
      };
      router.push(redirects[user.user_type] || '/');
      
      // Even though we're redirecting, we should also mark as ready
      // to avoid showing loading spinner during redirect
      setReady(true);
      return;
    }

    // If a specific user type is required and user is not logged in or has wrong type
    if (requiredUserType && (!user || user.user_type !== requiredUserType)) {
      router.push('/login');
      setReady(true);
      return;
    }
    
    setReady(true);
  }, [user, isLoading, router, redirectIfAuthenticated]);

  // if (isLoading || !ready) {
  //   return (
  //     <Loading />
  //   );
  // }

  return <>{children}</>;
}