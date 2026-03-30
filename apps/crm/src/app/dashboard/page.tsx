'use client';
import { useState } from 'react';
import { 
  VendorDashboard,
  SupplierDashboard,
  DoctorDashboard
} from '@/components/dashboard/role-specific';
import { useRoleSpecificDashboardMetrics } from '@/hooks/useRoleSpecificDashboardMetrics';

export default function DashboardPage() {
  const [filterType, setFilterType] = useState<'preset' | 'custom'>('preset');
  const [presetPeriod, setPresetPeriod] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { metrics, loading, error, role: userRole } = useRoleSpecificDashboardMetrics(filterType, presetPeriod, startDate, endDate);

  // Handle filter change from DynamicDateFilter component
  const handleFilterChange = (
    newFilterType: 'preset' | 'custom', 
    newPresetPeriod?: 'day' | 'month' | 'year' | 'all', 
    newStartDate?: string, 
    newEndDate?: string
  ) => {
    setFilterType(newFilterType);
    if (newPresetPeriod) {
      setPresetPeriod(newPresetPeriod);
    }
    if (newStartDate !== undefined) {
      setStartDate(newStartDate);
    }
    if (newEndDate !== undefined) {
      setEndDate(newEndDate);
    }
    // Note: no manual refresh() call here — the hook's internal useEffect
    // already watches filterType/presetPeriod/startDate/endDate and will
    // re-fetch automatically with the correct updated values.
  };

  // Determine which dashboard to render based on user role
  const renderRoleDashboard = () => {
    // Normalize role to lowercase for comparison
    const normalizedRole = userRole?.toLowerCase();
    
    switch (normalizedRole) {
      case 'vendor':
        return (
          <VendorDashboard
            metrics={metrics as any}
            loading={loading}
            error={error}
            filterType={filterType}
            presetPeriod={presetPeriod}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={handleFilterChange}
          />
        );
      case 'supplier':
        return (
          <SupplierDashboard
            metrics={metrics as any}
            loading={loading}
            error={error}
            filterType={filterType}
            presetPeriod={presetPeriod}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={handleFilterChange}
          />
        );
      case 'doctor':
      case 'dermatologist':
        return (
          <DoctorDashboard
            metrics={metrics as any}
            loading={loading}
            error={error}
            filterType={filterType}
            presetPeriod={presetPeriod}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={handleFilterChange}
          />
        );
      default:
        // Default to vendor dashboard for unrecognized roles
        return (
          <VendorDashboard
            metrics={metrics as any}
            loading={loading}
            error={error}
            filterType={filterType}
            presetPeriod={presetPeriod}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={handleFilterChange}
          />
        );
    }
  };

  // While auth is still resolving and we don't yet know the user's role,
  // show a neutral loading state to prevent a flash of the wrong dashboard.
  if (!userRole && loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {renderRoleDashboard()}
    </div>
  );
}