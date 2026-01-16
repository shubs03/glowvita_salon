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
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>Loading...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7 mb-6">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Dashboard</h1>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">Error loading dashboard data</p>
          <p className="text-muted-foreground mt-2">{error}</p>
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

  // Check if we have bookings but no revenue (new vendor)
  const isNewVendor = metrics && 
    metrics.totalBookings > 0 && 
    metrics.totalRevenue === 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Dashboard</h1>
        <div className="flex flex-col gap-4">
          {/* Dynamic Date Filter Component */}
          <DynamicDateFilter 
            filterType={filterType}
            presetPeriod={presetPeriod}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={onFilterChange}
          />
          
        </div>
      </div>
      
      {/* Stats Cards - Arranged in sequence per Vendor Dashboard Metric Definition Standard */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '₹0'}
          change={hasNoData ? "No data" : "+12.5%"}
          icon={FaDollarSign}
          iconColor="text-green-500"
        />
        <StatCard
          title="Total Bookings"
          value={metrics ? formatNumber(metrics.totalBookings) : '0'}
          change={hasNoData ? "No data" : "+15.2%"}
          icon={FaUsers}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Booking Hours"
          value={metrics ? formatNumber(Math.round(metrics.bookingHours * 100) / 100) : '0'}
          change={hasNoData ? "No data" : "+8.3%"}
          icon={FaClock}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Selling Services Revenue"
          value={metrics ? formatCurrency(metrics.sellingServicesRevenue) : '₹0'}
          change={hasNoData ? "No data" : "+5.7%"}
          icon={FaShoppingBag}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Selling Products Revenue"
          value={metrics ? formatCurrency(metrics.sellingProductsRevenue) : '₹0'}
          change={hasNoData ? "No data" : "+5.7%"}
          icon={FaShoppingBag}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Cancelled Appointments"
          value={metrics ? formatNumber(metrics.cancelledAppointments.count) : '0'}
          change={metrics ? `-${formatCurrency(metrics.cancelledAppointments.revenueLoss)}` : '-₹0'}
          icon={FaBan}
          iconColor="text-red-500"
        />
        <StatCard
          title="Upcoming Appointments"
          value={metrics ? formatNumber(metrics.upcomingAppointments) : '0'}
          change={hasNoData ? "No data" : "2 today"}
          icon={FaCalendarAlt}
          iconColor="text-teal-500"
        />
        <StatCard
          title="Total Business"
          value={metrics ? formatCurrency(metrics.totalBusiness) : '₹0'}
          change={hasNoData ? "No data" : "+10.2%"}
          icon={FaDollarSign}
          iconColor="text-indigo-500"
        />
      </div>

      {/* Show a message if there's no data */}
      {hasNoData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No appointment data found for your vendor account. This could be because:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>You haven't received any appointments yet</li>
                  <li>Your vendor account might not be properly set up</li>
                  <li>There might be an issue with data filtering</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show a message for new vendors with bookings but no revenue */}
      {isNewVendor && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You have {metrics?.totalBookings} bookings but no revenue yet. This is normal for new vendors. 
                Revenue will appear here once appointments are marked as completed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart 
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
      
      {/* Top Selling Products Chart */}
      <div className="mb-6">
        <TopSellingProductsChart
          filterType={filterType}
          presetPeriod={presetPeriod}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <UpcomingAppointments 
          filterType={filterType}
          presetPeriod={presetPeriod}
          startDate={startDate}
          endDate={endDate}
        />
        <ClientFeedback />
      </div>
    </div>
  );
}