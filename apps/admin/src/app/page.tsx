'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { FaRupeeSign, FaShoppingCart } from "react-icons/fa";
import { FiUsers, FiActivity, FiXCircle } from "react-icons/fi";
import { SalesOfServicesChart } from '@/components/charts/SalesOfServicesChart';
import { SalesOfProductsChart } from '@/components/charts/SalesOfProductsChart';
import { CityWiseSalesTable } from '@/components/CityWiseSalesTable';

import { Skeleton } from "@repo/ui/skeleton";
import { useGetAdminDashboardStatsQuery } from '@repo/store/api';
import { useSelector } from 'react-redux';
import { selectSelectedRegion } from '@repo/store/slices/adminAuthSlice';
import { Button } from "@repo/ui/button";
import { Calendar } from "lucide-react";

export default function AdminPage() {
  const [filterType, setFilterType] = useState<string>(''); // 'day', 'month', 'year', or ''
  const [filterValue, setFilterValue] = useState<string>(''); // specific date value
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const selectedRegion = useSelector(selectSelectedRegion);

  // Reset filter value when filter type changes
  useEffect(() => {
    setFilterValue('');
  }, [filterType]);

  // Debounced refetch function
  const debouncedRefetch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      refetch();
    }, 300); // 300ms debounce
  };

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params: any = {};

    if (filterType && filterValue) {
      params.filterType = filterType;
      params.filterValue = filterValue;
    } else if (filterType) {
      return null; // Don't fetch if filter type is selected but no value
    }

    if (selectedRegion && selectedRegion !== 'all') {
      params.regionId = selectedRegion;
    }

    return params;
  }, [filterType, filterValue, selectedRegion]);

  const { data: dashboardData, isLoading: isDashboardLoading, isError, error, refetch } = useGetAdminDashboardStatsQuery(
    queryParams !== null ? queryParams : undefined
  );

  // Show placeholder data when filter is selected but no value chosen
  const showPlaceholder = filterType && !filterValue;

  // Combine loading states
  const isLoading = isDashboardLoading;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Handle filter change with auto-refetch
  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setFilterType(type);
    // Reset filter value when type changes
    setFilterValue('');
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterValue(value);

    // Auto-refetch when filter value changes (with debounce)
    if (filterType && value) {
      debouncedRefetch();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType('');
    setFilterValue('');
    // Small delay to ensure state is updated before refetching
    setTimeout(() => {
      refetch();
    }, 100);
  };


  // Render skeleton loaders when data is loading
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>

          <select
            className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={filterType}
            onChange={handleFilterTypeChange}
          >
            <option value="">All Time</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          {filterType === 'day' && (
            <input
              type="date"
              className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterValue}
              onChange={handleFilterValueChange}
            />
          )}

          {filterType === 'month' && (
            <input
              type="month"
              className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterValue}
              onChange={handleFilterValueChange}
            />
          )}

          {filterType === 'year' && (
            <select
              className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filterValue}
              onChange={handleFilterValueChange}
            >
              <option value="">Select a year</option>
              {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => {
                const year = 2020 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i + 5}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>



        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error message if there was an error
  if (isError) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="text-red-500 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          Error: Failed to fetch dashboard data
        </div>
      </div>
    );
  }

  // Calculate Total Business (Sum of all components across regions)
  const totalBusinessValue = dashboardData?.cityWiseSales?.reduce((acc: number, item: any) => {
    return acc + (item.totalServiceAmount || 0) +
      (item.totalProductAmount || 0) +
      (item.servicePlatformFees || 0) +
      (item.productPlatformFees || 0) +
      (item.serviceTax || 0) +
      (item.productTax || 0) +
      (item.subscriptionAmount || 0) +
      (item.smsAmount || 0);
  }, 0) || 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Date Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>

        <select
          className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px] flex-grow sm:flex-grow-0"
          value={filterType}
          onChange={handleFilterTypeChange}
        >
          <option value="">All Time</option>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        {filterType === 'day' && (
          <input
            type="date"
            className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary flex-grow sm:flex-grow-0"
            value={filterValue}
            onChange={handleFilterValueChange}
          />
        )}

        {filterType === 'month' && (
          <input
            type="month"
            className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary flex-grow sm:flex-grow-0"
            value={filterValue}
            onChange={handleFilterValueChange}
          />
        )}

        {filterType === 'year' && (
          <select
            className="border rounded-lg p-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px] flex-grow sm:flex-grow-0"
            value={filterValue}
            onChange={handleFilterValueChange}
          >
            <option value="">Select a year</option>
            {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => {
              const year = 2020 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="ml-auto sm:ml-0 mt-2 sm:mt-0"
        >
          Reset Filters
        </Button>
      </div>

      {/* First Row: Business & Financial Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Total Business (Sum of all revenue components) */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Business
            </CardTitle>
            <FaRupeeSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "₹0.00"
                : formatCurrency(totalBusinessValue)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
              Includes Service, Product, Fees, Tax, Subs & SMS
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Revenue */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <FaRupeeSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "₹0.00"
                : formatCurrency(dashboardData?.totalRevenue?.current || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Business User (Merged Vendors & Suppliers) */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Business User
            </CardTitle>
            <FiUsers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "0"
                : ((dashboardData?.totalVendors?.current || 0) + (dashboardData?.totalSuppliers?.current || 0)).toLocaleString()}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium">Vendors:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.totalVendors?.current || 0).toLocaleString()}
              </span>
              <span className="font-medium">Suppliers:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.totalSuppliers?.current || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Subscription Amount */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Amount
            </CardTitle>
            <FaRupeeSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "₹0.00"
                : formatCurrency(dashboardData?.subscriptionAmount || 0)}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium text-primary/80">Active:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.subscriptionStats?.active || 0).toLocaleString()}
              </span>
              <span className="font-medium text-muted-foreground">Inactive:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.subscriptionStats?.inactive || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: SMS Amount */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              SMS Amount
            </CardTitle>
            <FaRupeeSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "₹0.00"
                : formatCurrency(dashboardData?.smsAmount || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Detailed Performance Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-4">
        {/* Card 6: Total Service Amount */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Service Amount
            </CardTitle>
            <FaRupeeSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "₹0.00"
                : formatCurrency(dashboardData?.serviceAmount || 0)}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium text-primary/80">Vendor:
                {showPlaceholder
                  ? "₹0.00"
                  : formatCurrency(dashboardData?.vendorServiceAmount || 0)}
              </span>
              <span className="font-medium">Supplier:
                {showPlaceholder
                  ? "₹0.00"
                  : formatCurrency(dashboardData?.supplierServiceAmount || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 7: Total Product Amount */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Product Amount
            </CardTitle>
            <FaRupeeSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "₹0.00"
                : formatCurrency(dashboardData?.productAmount || 0)}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium text-primary/80">Vendor:
                {showPlaceholder
                  ? "₹0.00"
                  : formatCurrency(dashboardData?.vendorProductAmount || 0)}
              </span>
              <span className="font-medium">Supplier:
                {showPlaceholder
                  ? "₹0.00"
                  : formatCurrency(dashboardData?.supplierProductAmount || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 8: Total Bookings */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <FaShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "0"
                : (dashboardData?.totalBookings?.current || 0).toLocaleString()}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium text-primary/80">Online:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.totalBookings?.online || 0).toLocaleString()}
              </span>
              <span className="font-medium text-muted-foreground">Offline:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.totalBookings?.offline || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 9: Completed Appointments */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Appointments
            </CardTitle>
            <FiActivity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "0"
                : (dashboardData?.totalBookings?.completed || 0).toLocaleString()}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium text-primary/80">Online:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.totalBookings?.completedOnline || 0).toLocaleString()}
              </span>
              <span className="font-medium text-muted-foreground">Offline:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.totalBookings?.completedOffline || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 10: Cancelled Bookings */}
        <Card className="transition-all duration-300 hover:shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancelled Bookings
            </CardTitle>
            <FiXCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {showPlaceholder
                ? "0"
                : (dashboardData?.cancelledBookings?.current || 0).toLocaleString()}
            </div>
            <div className="flex text-xs text-muted-foreground mt-1">
              <span className="mr-3 font-medium text-primary/80">Online:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.cancelledBookings?.online || 0).toLocaleString()}
              </span>
              <span className="font-medium text-muted-foreground">Offline:
                {showPlaceholder
                  ? "0"
                  : (dashboardData?.cancelledBookings?.offline || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service sales</CardTitle>
            <CardDescription>Popular services across all salons</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <SalesOfServicesChart servicesData={dashboardData?.services || []} filterType={filterType} filterValue={filterValue} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product sales</CardTitle>
            <CardDescription>Popular products across all vendors</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <SalesOfProductsChart productsData={dashboardData?.products || []} filterType={filterType} filterValue={filterValue} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <CityWiseSalesTable
          data={dashboardData?.cityWiseSales || []}
          isLoading={isLoading}
          filterType={filterType}
          filterValue={filterValue}
        />
      </div>
    </div>
  );
}