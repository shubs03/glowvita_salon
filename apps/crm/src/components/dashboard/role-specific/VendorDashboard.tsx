'use client';
import { useState, useEffect } from 'react';
import {
  StatCard,
  SalesChart,
  UpcomingAppointments,
  ClientFeedback,
  TopServicesChart,
  TopSellingProductsChart,
  DynamicDateFilter
} from '../index';
import { HierarchicalDateFilter } from '../HierarchicalDateFilter';

import {
  FaDollarSign,
  FaUsers,
  FaCalendarAlt,
  FaShoppingBag,
  FaClock,
  FaBan,
  FaSyncAlt
} from "react-icons/fa";

interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  bookingHours: number;
  sellingServicesRevenue: number;
  sellingProductsRevenue: number;
  cancelledAppointments: {
    count: number;
    revenueLoss: number;
  };
  upcomingAppointments: number;
  totalBusiness: number;
}

interface VendorDashboardProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  filterType: 'preset' | 'custom';
  presetPeriod: 'day' | 'month' | 'year' | 'all';
  startDate: string;
  endDate: string;
  onFilterChange: (
    newFilterType: 'preset' | 'custom',
    newPresetPeriod?: 'day' | 'month' | 'year' | 'all',
    newStartDate?: string,
    newEndDate?: string
  ) => void;
}

export default function VendorDashboard({
  metrics,
  loading,
  error,
  filterType,
  presetPeriod,
  startDate,
  endDate,
  onFilterChange
}: VendorDashboardProps) {

  // State for hierarchical date filtering
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 0-11 representing Jan-Dec
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Format currency for Indian Rupees
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  // Clear custom date range
  const clearCustomDateFilter = () => {
    // This would typically call a parent function to reset filters
    // Refresh functionality has been removed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <div className="h-8 w-64 bg-muted rounded" />
                <div className="h-4 w-80 bg-muted rounded mt-2" />
              </div>
              <div className="w-full md:w-auto">
                <div className="h-12 w-64 bg-muted rounded" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-6">
            <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                  Vendor Dashboard
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  Overview of your business metrics and performance.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <div className="h-12 w-64 bg-muted rounded" />
              </div>
            </div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive font-medium">Error loading dashboard data</p>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have metrics but all values are zero
  const hasNoData = metrics &&
    metrics.totalRevenue === 0 &&
    metrics.totalBookings === 0 &&
    metrics.bookingHours === 0 &&
    metrics.sellingServicesRevenue === 0 &&
    metrics.sellingProductsRevenue === 0 &&
    metrics.cancelledAppointments.count === 0 &&
    metrics.upcomingAppointments === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Vendor Dashboard
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Overview of your business metrics and performance.
              </p>
            </div>
            <div className="w-full md:w-auto space-y-4">
              {/* Dynamic Date Filter Component */}
              <DynamicDateFilter
                filterType={filterType}
                presetPeriod={presetPeriod}
                startDate={startDate}
                endDate={endDate}
                onFilterChange={onFilterChange}
              />
              
              {/* Hierarchical Date Filter */}
              {/* <HierarchicalDateFilter
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                selectedDay={selectedDay}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
                onDayChange={setSelectedDay}
              /> */}
            </div>
          </div>
        </div>

      {/* Stats Cards - Arranged in sequence per Vendor Dashboard Metric Definition Standard */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '₹0'}
          subtitle="Overall earnings"
          change={hasNoData ? "No data" : "+12.5%"}
          icon={FaDollarSign}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Bookings"
          value={metrics ? formatNumber(metrics.totalBookings) : '0'}
          subtitle="Appointment count"
          change={hasNoData ? "No data" : "+15.2%"}
          icon={FaUsers}
          iconColor="text-primary"
        />
        <StatCard
          title="Booking Hours"
          value={metrics ? formatNumber(Math.round(metrics.bookingHours * 100) / 100) : '0'}
          subtitle="Total service hours"
          change={hasNoData ? "No data" : "+8.3%"}
          icon={FaClock}
          iconColor="text-primary"
        />
        <StatCard
          title="Selling Services Revenue"
          value={metrics ? formatCurrency(metrics.sellingServicesRevenue) : '₹0'}
          subtitle="Service earnings"
          change={hasNoData ? "No data" : "+5.7%"}
          icon={FaShoppingBag}
          iconColor="text-primary"
        />
        <StatCard
          title="Selling Products Revenue"
          value={metrics ? formatCurrency(metrics.sellingProductsRevenue) : '₹0'}
          subtitle="Product earnings"
          change={hasNoData ? "No data" : "+5.7%"}
          icon={FaShoppingBag}
          iconColor="text-primary"
        />
        <StatCard
          title="Cancelled Appointments"
          value={metrics ? formatNumber(metrics.cancelledAppointments.count) : '0'}
          subtitle="Missed bookings"
          change={metrics ? `-${formatCurrency(metrics.cancelledAppointments.revenueLoss)}` : '-₹0'}
          icon={FaBan}
          iconColor="text-primary"
        />
        <StatCard
          title="Upcoming Appointments"
          value={metrics ? formatNumber(metrics.upcomingAppointments) : '0'}
          subtitle="Scheduled visits"
          change={hasNoData ? "No data" : "2 today"}
          icon={FaCalendarAlt}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Business"
          value={metrics ? formatCurrency(metrics.totalBusiness) : '₹0'}
          subtitle="Combined revenue"
          change={hasNoData ? "No data" : "+10.2%"}
          icon={FaDollarSign}
          iconColor="text-primary"
        />
      </div>

      {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <UpcomingAppointments
      filterType={filterType}
      presetPeriod={presetPeriod}
      startDate={startDate}
      endDate={endDate}
    />
    <TopServicesChart
      filterType={filterType}
      presetPeriod={presetPeriod}
      startDate={startDate}
      endDate={endDate}
    />
  </div>

  {/* Sales Overview Chart */ }
  <div className="mb-6">
    <SalesChart
      filterType={filterType}
      presetPeriod={presetPeriod}
      startDate={startDate}
      endDate={endDate}
    />
  </div>

  {/* Tables */ }
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <TopSellingProductsChart
      filterType={filterType}
      presetPeriod={presetPeriod}
      startDate={startDate}
      endDate={endDate}
      selectedYear={selectedYear ?? undefined}
      selectedMonth={selectedMonth ?? undefined}
      selectedDay={selectedDay ?? undefined}
    />
    <ClientFeedback />
  </div>
</div>
</div>
  );
}