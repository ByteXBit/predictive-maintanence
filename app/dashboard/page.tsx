'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import OperatorDashboard from '@/app/components/dashboard/OperatorDashboard';
import MaintenanceDashboard from '@/app/components/dashboard/MaintenanceDashboard';
import ManagerDashboard from '@/app/components/dashboard/ManagerDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'OPERATOR':
        return <OperatorDashboard user={user} />;
      case 'MAINTENANCE':
        return <MaintenanceDashboard user={user} />;
      case 'MANAGER':
        return <ManagerDashboard user={user} />;
      default:
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Unknown role. Please contact support.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardByRole()}
    </DashboardLayout>
  );
}

