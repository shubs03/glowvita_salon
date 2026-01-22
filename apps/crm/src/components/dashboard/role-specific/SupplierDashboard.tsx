'use client';
import { useState, useEffect } from 'react';
import {
  StatCard,
  SalesChart,
  ClientFeedback,
  TopSellingProductsChart,
  DynamicDateFilter
} from '../index';

import {
  FaDollarSign,
  FaBoxOpen,
  FaTruck,
  FaStore,
  FaUsers,
  FaClipboardList,
  FaClock,
  FaBan,
  FaShoppingBag,
  FaSyncAlt
} from "react-icons/fa";

interface SupplierDashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  inventoryValue: number;
  topSellingProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: string;
  }>;
}

interface SupplierDashboardProps {
  metrics: SupplierDashboardMetrics | null;
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

export default function SupplierDashboard({
  metrics,
  loading,
  error,
  filterType,
  presetPeriod,
  startDate,
  endDate,
  onFilterChange
}: SupplierDashboardProps) {

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
                  Supplier Dashboard
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  Overview of your product sales and order management.
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
    metrics.totalOrders === 0 &&
    metrics.totalProducts === 0 &&
    metrics.pendingOrders === 0 &&
    metrics.shippedOrders === 0 &&
    metrics.deliveredOrders === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Supplier Dashboard
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Overview of your product sales and order management.
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
              
            </div>
          </div>
        </div>

      {/* Stats Cards - Arranged in sequence per Supplier Dashboard Metric Definition Standard */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={metrics ? formatCurrency(metrics.totalRevenue) : '₹0'}
          subtitle="Overall earnings"
          change={hasNoData ? "No data" : "+8.5%"}
          icon={FaDollarSign}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Orders"
          value={metrics ? formatNumber(metrics.totalOrders) : '0'}
          subtitle="Order count"
          change={hasNoData ? "No data" : "+12.2%"}
          icon={FaClipboardList}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Products"
          value={metrics ? formatNumber(metrics.totalProducts) : '0'}
          subtitle="Product count"
          change={hasNoData ? "No data" : "+5.7%"}
          icon={FaBoxOpen}
          iconColor="text-primary"
        />
        <StatCard
          title="Pending Orders"
          value={metrics ? formatNumber(metrics.pendingOrders) : '0'}
          subtitle="Waiting orders"
          change={hasNoData ? "No data" : "-2.3%"}
          icon={FaClock}
          iconColor="text-primary"
        />
        <StatCard
          title="Shipped Orders"
          value={metrics ? formatNumber(metrics.shippedOrders) : '0'}
          subtitle="Shipped items"
          change={hasNoData ? "No data" : "+15.7%"}
          icon={FaTruck}
          iconColor="text-primary"
        />
        <StatCard
          title="Delivered Orders"
          value={metrics ? formatNumber(metrics.deliveredOrders) : '0'}
          subtitle="Delivered items"
          change={hasNoData ? "No data" : "+18.2%"}
          icon={FaStore}
          iconColor="text-primary"
        />
        <StatCard
          title="Cancelled Orders"
          value={metrics ? formatNumber(metrics.cancelledOrders) : '0'}
          subtitle="Cancelled items"
          change={hasNoData ? "No data" : "-3.1%"}
          icon={FaBan}
          iconColor="text-primary"
        />
        <StatCard
          title="Avg Order Value"
          value={metrics ? formatCurrency(metrics.avgOrderValue) : '₹0'}
          subtitle="Average value"
          change={hasNoData ? "No data" : "+6.4%"}
          icon={FaShoppingBag}
          iconColor="text-primary"
        />
      </div>

      {/* Charts - Supplier focused */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <TopSellingProductsChart
      filterType={filterType}
      presetPeriod={presetPeriod}
      startDate={startDate}
      endDate={endDate}
    />
    <SalesChart
      filterType={filterType}
      presetPeriod={presetPeriod}
      startDate={startDate}
      endDate={endDate}
    />
  </div>

  {/* Tables - Supplier focused */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <ClientFeedback />
  </div>
</div>
</div>
  );
}