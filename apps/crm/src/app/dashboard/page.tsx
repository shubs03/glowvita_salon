'use client';
import { useState, useEffect } from 'react';
import { 
  VendorDashboard,
  SupplierDashboard,
  DoctorDashboard
} from '@/components/dashboard/role-specific';
import { useRoleSpecificDashboardMetrics } from '@/hooks/useRoleSpecificDashboardMetrics';
import { useCrmAuth } from '@/hooks/useCrmAuth';

export default function DashboardPage() {
  const { role } = useCrmAuth();
  const [filterType, setFilterType] = useState<'preset' | 'custom'>('preset');
  const [presetPeriod, setPresetPeriod] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { metrics, loading, error, refresh, role: userRole } = useRoleSpecificDashboardMetrics(filterType, presetPeriod, startDate, endDate);

  // Safe type assertion to handle union types
  const vendorMetrics = metrics as any;
  const supplierMetrics = metrics as any;
  const doctorMetrics = metrics as any;

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
    if (newStartDate) {
      setStartDate(newStartDate);
    }
    if (newEndDate) {
      setEndDate(newEndDate);
    }
    refresh();
  };

  // Determine which dashboard to render based on user role
  const renderRoleDashboard = () => {
    // Normalize role to lowercase for comparison
    const normalizedRole = userRole?.toLowerCase();
    
    switch (normalizedRole) {
      case 'vendor':
        return (
          <VendorDashboard
            metrics={vendorMetrics}
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
            metrics={supplierMetrics}
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
            metrics={doctorMetrics}
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
        // Default to vendor dashboard if role is not recognized
        return (
          <VendorDashboard
            metrics={vendorMetrics}
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

  return (
    <div className="min-h-screen bg-background">
      {renderRoleDashboard()}
    </div>
  );
}