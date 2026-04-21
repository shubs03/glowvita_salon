"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, IndianRupee, Users, UserPlus, ShoppingCart, Search, Copy, FileText, FileSpreadsheet, Printer, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
import { Calendar } from 'lucide-react';
import { useGetSubscriptionReportQuery, useGetSubscriptionPlansQuery } from '@repo/store/api';
import { SubscriptionData, CampaignData, VendorPayoutSettlementData, VendorPayoutSettlementProductData, VendorPayableProductData, FilterParams } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';
import { FilterModal } from '../common';
import { useReport } from '../hooks/useReport';

export const SubscriptionReportTable = () => {
  const {
    filters,
    apiFilters,
    isFilterModalOpen,
    currentPage,
    itemsPerPage,
    searchTerm,
    tableRef,
    setFilters,
    setIsFilterModalOpen,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    handleFilterChange,
    filterAndPaginateData
  } = useReport<SubscriptionData>(5);

  console.log("Subscription Report API filters:", apiFilters);

  const { data, isLoading, isError, error } = useGetSubscriptionReportQuery(apiFilters);
  const { data: allPlansRaw = [] } = useGetSubscriptionPlansQuery(undefined);
  const allPlans: any[] = Array.isArray(allPlansRaw) ? allPlansRaw : (allPlansRaw as any)?.data || [];

  // Define data variables after API call
  const subscriptionData: SubscriptionData[] = (data?.subscriptions || []) as SubscriptionData[];
  const cities = data?.cities || []; // Get cities from API response

  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Helper to extract date string from MongoDB $date object or raw string
  const getDateValue = (dateInput: any) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string') return dateInput;
    if (typeof dateInput === 'object' && dateInput.$date) return dateInput.$date;
    return dateInput.toString();
  };

  // Helper to safely parse date without timezone shifts for calendar comparisons
  const getSafeDate = (dateInput: any) => {
    const val = getDateValue(dateInput);
    if (!val) return null;
    const date = new Date(val);
    if (isNaN(date.getTime())) return null;

    if (typeof val === 'string' && val.includes('-')) {
      const parts = val.split('T')[0].split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        return new Date(y, m - 1, d);
      }
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Helper to determine real-time subscription status
  const getDerivedStatus = (status: string, endDate: any) => {
    const rawStatus = (status || 'Pending').toString().trim();
    const normalizedStatus = rawStatus.toLowerCase();

    const endDateVal = getDateValue(endDate);
    if (endDateVal) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const expiryDate = getSafeDate(endDateVal);

      if (expiryDate && today > expiryDate) {
        return 'Expired';
      }
    }

    if (normalizedStatus === 'active') return 'Active';
    if (normalizedStatus === 'expired') return 'Expired';
    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
  };

  // Store complete lists of business names and plan statuses
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);
  const [allPlanStatuses, setAllPlanStatuses] = useState<string[]>([]);

  // Extract business names and plan statuses from data when there are no filters applied
  // This assumes that when no filters are applied, we get the complete dataset
  useEffect(() => {
    // Only update the complete lists if no filters are applied or if the lists are empty
    if ((Object.keys(apiFilters).length === 0 || allBusinessNames.length === 0) && subscriptionData.length > 0) {
      const names: string[] = Array.from(new Set<string>(subscriptionData.map((item: SubscriptionData) => item.vendor))).filter(name => name && name !== 'N/A');
      setAllBusinessNames(names);
    }

    if ((Object.keys(apiFilters).length === 0 || allPlanStatuses.length === 0) && subscriptionData.length > 0) {
      const statuses: string[] = Array.from(new Set<string>(subscriptionData.map((item: SubscriptionData) => item.planStatus))).filter(status => status);
      setAllPlanStatuses(statuses);
    }
  }, [subscriptionData, apiFilters, allBusinessNames.length, allPlanStatuses.length]);

  // Use the complete lists for filter options
  const businessNames = allBusinessNames;
  const planStatuses = allPlanStatuses;

  // Use memo to get unique subscriptions per vendor (most recent first)
  const uniqueSubscriptionData = useMemo(() => {
    const vendorMap = new Map<string, SubscriptionData>();
    
    subscriptionData.forEach((sub) => {
      // Normalize status based on end date (consistent with management page)
      const normalizedStatus = getDerivedStatus(sub.planStatus, sub.endDate);
      const normalizedSub = { ...sub, planStatus: normalizedStatus };

      const existing = vendorMap.get(normalizedSub.vendor);
      // Keep the one with the latest purchase date
      if (!existing || new Date(normalizedSub.purchaseDate) > new Date(existing.purchaseDate)) {
        vendorMap.set(normalizedSub.vendor, normalizedSub);
      }
    });
    
    return Array.from(vendorMap.values());
  }, [subscriptionData]);

  // Recalculate summary counts based on unique vendors
  const totalSubscriptions = uniqueSubscriptionData.length;
  const activePlansCount = uniqueSubscriptionData.filter(s => s.planStatus === 'Active').length;
  const inactivePlansCount = totalSubscriptions - activePlansCount;
  
  // Total Revenue = SUM of all PAID subscriptions (excluding Trial ₹0)
  const calculatedTotalRevenue = subscriptionData
    .filter(s => (s.price || 0) > 0)
    .reduce((sum: number, sub) => sum + (sub.price || 0), 0);

  // Filter unique data based on search term
  const filteredData = useMemo((): SubscriptionData[] => {
    if (!searchTerm) return uniqueSubscriptionData;

    return uniqueSubscriptionData.filter((subscription: SubscriptionData) =>
      Object.values(subscription).some((value: any) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [uniqueSubscriptionData, searchTerm]);

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Use calculated totals for UI consistency
  const displayTotalRevenue = calculatedTotalRevenue;
  const displayActivePlans = activePlansCount;
  const displayInactivePlans = inactivePlansCount;

  if (isLoading) {
    return (
      <div>
        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mb-4 gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'subscription_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'subscription_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'subscription_report')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Plan Status</TableHead>
                <TableHead>Payment Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))}
              {/* Total Price Row Skeleton */}
              <TableRow className="bg-muted">
                <TableCell colSpan={7}><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell colSpan={2}><Skeleton className="h-4 w-full" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("Error fetching subscription report:", error);
    return (
      <div>
        <div className="flex justify-end mb-4 gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'subscription_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'subscription_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'subscription_report')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading subscription report data. Please try again later.
          {/* Display error details in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-2 text-sm text-gray-500">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show table structure even when there's no data
  if (subscriptionData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Plans</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when search term changes
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'subscription_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'subscription_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'subscription_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => printTable(tableRef)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleFilterChange}
          cities={cities}
          businessNames={businessNames}
          planStatuses={planStatuses}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
          showPlanStatusFilter={true}
        />

        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Plan Status</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  No subscription report data available.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when search term changes
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'subscription_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'subscription_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'subscription_report')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={cities}
        businessNames={businessNames}
        planStatuses={planStatuses}
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
        showPlanStatusFilter={true}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSubscriptions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{displayTotalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayActivePlans}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Plans</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayInactivePlans}
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Plan Status</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((subscription: SubscriptionData, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell>{new Date(subscription.purchaseDate).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{subscription.vendor}</TableCell>
                <TableCell>{subscription.type || 'vendor'}</TableCell>
                <TableCell>{subscription.city}</TableCell>
                <TableCell>{subscription.subscription}</TableCell>
                <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                <TableCell>₹{subscription.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.planStatus === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {subscription.planStatus}
                  </span>
                </TableCell>
                <TableCell>{subscription.paymentMode}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setSelectedSubscription(subscription);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {/* Current Page Total Price Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={7}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: SubscriptionData) => sum + (item.price || 0), 0).toFixed(2)}</TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        className="mt-4"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={totalItems}
      />

      {/* Subscription Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold">Subscription Details</DialogTitle>
            <DialogDescription>
              View complete subscription information and history for {selectedSubscription?.vendor}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6 py-4">
              {/* Current Plan Section */}
              <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    Current Status
                  </h3>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight
                    ${selectedSubscription.planStatus === 'Active'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : selectedSubscription.planStatus === 'Expired'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }
                  `}>
                    {selectedSubscription.planStatus || 'Unknown'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Business Name</Label>
                    <p className="font-bold text-sm">{selectedSubscription.vendor}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Plan Name</Label>
                    <p className="font-bold text-sm text-primary">{selectedSubscription.subscription || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Plan Price</Label>
                    <p className="font-black text-sm">₹{(selectedSubscription.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Start Date</Label>
                    <p className="font-semibold text-sm">
                      {selectedSubscription.startDate
                        ? new Date(selectedSubscription.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">End Date</Label>
                    <p className="font-semibold text-sm">
                      {selectedSubscription.endDate
                        ? new Date(selectedSubscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Role Type</Label>
                    <p className="font-semibold text-sm capitalize bg-muted/50 px-2 py-0.5 rounded w-fit">{selectedSubscription.type || 'N/A'}</p>
                  </div>
                </div>

                {/* Days Remaining/Expired */}
                {selectedSubscription.endDate && (
                  <div className="pt-3 border-t">
                    {(() => {
                      const now = new Date();
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const expiryDate = getSafeDate(selectedSubscription.endDate);

                      if (!expiryDate) return null;

                      const diffTime = expiryDate.getTime() - today.getTime();
                      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays > 0) {
                        return (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Valid for the next <span className="font-black text-green-600">{diffDays} days</span></span>
                          </div>
                        );
                      } else if (diffDays === 0) {
                        return (
                          <div className="flex items-center gap-2 text-sm text-orange-600 font-bold">
                            <Filter className="h-4 w-4" />
                            <span>Expires today</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>Expired <span className="font-black text-red-600">{Math.abs(diffDays)} days ago</span></span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>

              {/* History Section from RAW object */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Subscription History
                </h3>

                {selectedSubscription.rawSubscription?.history?.length > 0 ? (
                  <div className="relative space-y-6 pl-8 border-l-2 border-muted-foreground/20 ml-2">
                    {[...selectedSubscription.rawSubscription.history].reverse().map((historyItem: any, index: number) => {
                      const hPlanId = typeof historyItem.plan === 'object' ? (historyItem.plan?.$oid || historyItem.plan?._id) : historyItem.plan;
                      const hPlan = allPlans.find(p => p._id === hPlanId || p.name === historyItem.plan?.name);
                      const hPrice = (hPlan?.discountedPrice && hPlan.discountedPrice > 0) ? hPlan.discountedPrice : (hPlan?.price || 0);
                      const hStatus = getDerivedStatus(historyItem.status, historyItem.endDate);

                      return (
                        <div key={index} className="relative">
                          <div className="absolute -left-[2.6rem] top-1.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary pulse-subtle"></div>
                          </div>

                          <div className="bg-muted/30 rounded-xl p-4 border transition-all hover:shadow-md">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-black text-sm text-foreground">
                                    {hPlan?.name || historyItem.plan?.name || 'Unknown Plan'}
                                  </h4>
                                  <span className="text-sm font-black text-primary">₹{hPrice.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Start</span>
                                    <span className="text-xs font-semibold">
                                      {new Date(getDateValue(historyItem.startDate)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">End</span>
                                    <span className="text-xs font-semibold">
                                      {new Date(getDateValue(historyItem.endDate)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                hStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {hStatus}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                    <p className="text-sm text-muted-foreground font-medium">No historical records found for this subscriber.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
