import { useState, useEffect, useCallback } from 'react';
import { useCrmAuth } from './useCrmAuth';

interface CancelledAppointments {
  count: number;
  revenueLoss: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  bookingHours: number;
  sellingServicesRevenue: number;
  sellingProductsRevenue: number;
  cancelledAppointments: CancelledAppointments;
  upcomingAppointments: number;
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Updated to accept custom date range parameters
export const useDashboardMetrics = (
  filterType?: 'preset' | 'custom',
  presetPeriod?: 'day' | 'month' | 'year' | 'all',
  startDate?: string,
  endDate?: string
): UseDashboardMetricsReturn => {
  const { isCrmAuthenticated, isLoading: authLoading, user } = useCrmAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      // Don't fetch if user is not authenticated
      if (!isCrmAuthenticated) {
        console.log("User not authenticated, skipping metrics fetch");
        return;
      }

      console.log("Fetching dashboard metrics for user:", user);
      setLoading(true);
      setError(null);
      
      // Build query params
      let url = '/api/crm/vendor/metrics';
      
      // Handle custom date range
      if (filterType === 'custom' && startDate && endDate) {
        // For custom date ranges, we need to pass the dates as query parameters
        url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      } 
      // Handle preset periods
      else if (presetPeriod && presetPeriod !== 'all') {
        url += `?period=${presetPeriod}`;
      }
      
      const response = await fetch(url);
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API response data:", result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard metrics');
      }
      
      setMetrics(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard metrics';
      setError(errorMessage);
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [isCrmAuthenticated, user, filterType, presetPeriod, startDate, endDate]);

  useEffect(() => {
    // Only fetch metrics when authentication state is determined and user is authenticated
    if (!authLoading && isCrmAuthenticated) {
      fetchMetrics();
    } else if (!authLoading && !isCrmAuthenticated) {
      // If user is not authenticated, stop loading
      setLoading(false);
    }
  }, [isCrmAuthenticated, authLoading, fetchMetrics]);

  const refresh = () => {
    fetchMetrics();
  };

  // Combine auth loading state with our own loading state
  const combinedLoading = authLoading || loading;

  return {
    metrics,
    loading: combinedLoading,
    error,
    refresh
  };
};