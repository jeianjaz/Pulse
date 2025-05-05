"use client";

import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ProtectedRoute requiredUserType={1} redirectIfAuthenticated={false}>
      <DashboardLayout userType="patient" onLogout={handleLogout}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
