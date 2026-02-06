"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Download, Eye, Search } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { Report } from '../shared/types';

// Import table components
import { AllAppointmentsTable } from './tables/AllAppointmentsTable';
import { SummaryByServiceTable } from './tables/SummaryByServiceTable';
import { CompletedAppointmentsTable } from './tables/CompletedAppointmentsTable';
import { CancelledAppointmentsTable } from './tables/CancelledAppointmentsTable';
import { SalesByServiceTable } from './tables/SalesByServiceTable';
import { SalesByCustomerTable } from './tables/SalesByCustomerTable';
import { ProductSummaryTable } from './tables/ProductSummaryTable';
import { InventoryStockTable } from './tables/InventoryStockTable';
import { CategoryWiseProductTable } from './tables/CategoryWiseProductTable';
import { SalesByProductTable } from './tables/SalesByProductTable';
import { AllAppointmentsByStaffTable } from './tables/AllAppointmentsByStaffTable';
import { SettlementSummaryTable } from './tables/SettlementSummaryTable';

// Import constants, hooks, and modal wrapper
import { VENDOR_REPORTS_DATA } from './constants';
import { useVendorFilters } from './hooks/useVendorFilters';
import { ReportModal } from './modals/ReportModal';

export default function VendorReports() {
  // Use the custom hook for managing all filter states
  const { filters, updateFilter } = useVendorFilters();
  
  // Single modal state - tracks which report is currently open
  const [openReportTitle, setOpenReportTitle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Refresh states for each report
  const [allAppointmentsRefresh, setAllAppointmentsRefresh] = useState(0);
  const [salesByServiceRefresh, setSalesByServiceRefresh] = useState(0);
  const [salesByCustomerRefresh, setSalesByCustomerRefresh] = useState(0);
  const [productSummaryRefresh, setProductSummaryRefresh] = useState(0);
  const [salesByProductRefresh, setSalesByProductRefresh] = useState(0);
  const [summaryByServiceRefresh, setSummaryByServiceRefresh] = useState(0);
  const [completedAppointmentsRefresh, setCompletedAppointmentsRefresh] = useState(0);
  const [cancelledAppointmentsRefresh, setCancelledAppointmentsRefresh] = useState(0);
  const [settlementSummaryRefresh, setSettlementSummaryRefresh] = useState(0);

  // Report registry - maps report titles to their configuration
  const reportRegistry: Record<string, {
    title: string;
    description: string;
    component: React.ReactNode;
  }> = {
    "All Appointments Report": {
      title: "All Appointments",
      description: "Complete record of all appointments with detailed information.",
      component: (
        <AllAppointmentsTable
          startDate={filters.allAppointments.startDate || undefined}
          endDate={filters.allAppointments.endDate || undefined}
          client={filters.allAppointments.client || undefined}
          service={filters.allAppointments.service || undefined}
          staff={filters.allAppointments.staff || undefined}
          status={filters.allAppointments.status || undefined}
          bookingType={filters.allAppointments.bookingType || undefined}
          triggerRefresh={allAppointmentsRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('allAppointments', newFilters)}
        />
      )
    },
    "Appointment Summary by Service": {
      title: "Appointment Summary by Service",
      description: "Aggregated view showing appointment counts, revenue, and popularity by service type.",
      component: (
        <SummaryByServiceTable
          startDate={filters.summaryByService.startDate || undefined}
          endDate={filters.summaryByService.endDate || undefined}
          client={filters.summaryByService.client || undefined}
          service={filters.summaryByService.service || undefined}
          staff={filters.summaryByService.staff || undefined}
          status={filters.summaryByService.status || undefined}
          bookingType={filters.summaryByService.bookingType || undefined}
          triggerRefresh={summaryByServiceRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('summaryByService', newFilters)}
        />
      )
    },
    "Completed Appointments Report": {
      title: "Completed Appointments Report",
      description: "Detailed listing of all successfully completed appointments.",
      component: (
        <CompletedAppointmentsTable
          startDate={filters.completedAppointments.startDate || undefined}
          endDate={filters.completedAppointments.endDate || undefined}
          client={filters.completedAppointments.client || undefined}
          service={filters.completedAppointments.service || undefined}
          staff={filters.completedAppointments.staff || undefined}
          bookingType={filters.completedAppointments.bookingType || undefined}
          triggerRefresh={completedAppointmentsRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('completedAppointments', newFilters)}
        />
      )
    },
    "Cancelled Appointments Report": {
      title: "Cancelled Appointments Report",
      description: "Comprehensive analysis of cancelled appointments with reasons and impact.",
      component: (
        <CancelledAppointmentsTable
          startDate={filters.cancelledAppointments.startDate || undefined}
          endDate={filters.cancelledAppointments.endDate || undefined}
          client={filters.cancelledAppointments.client || undefined}
          service={filters.cancelledAppointments.service || undefined}
          staff={filters.cancelledAppointments.staff || undefined}
          status={filters.cancelledAppointments.status || undefined}
          bookingType={filters.cancelledAppointments.bookingType || undefined}
          triggerRefresh={cancelledAppointmentsRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('cancelledAppointments', newFilters)}
        />
      )
    },
    "All Appointments by Staff": {
      title: "All Appointments by Staff",
      description: "Detailed report showing appointment statistics aggregated by staff member.",
      component: (
        <AllAppointmentsByStaffTable
          startDate={filters.allAppointments.startDate || undefined}
          endDate={filters.allAppointments.endDate || undefined}
          client={filters.allAppointments.client || undefined}
          service={filters.allAppointments.service || undefined}
          staff={filters.allAppointments.staff || undefined}
          status={filters.allAppointments.status || undefined}
          bookingType={filters.allAppointments.bookingType || undefined}
          triggerRefresh={allAppointmentsRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('allAppointments', newFilters)}
        />
      )
    },
    "Settlement Summary Report": {
      title: "Settlement Summary Report",
      description: "Detailed report of all settlements, payouts, and financial transactions.",
      component: (
        <SettlementSummaryTable
          startDate={filters.settlementSummary.startDate as any}
          endDate={filters.settlementSummary.endDate as any}
          triggerRefresh={settlementSummaryRefresh}
        />
      )
    },
    "Sales by Service": {
      title: "Sales by Service",
      description: "Detailed report showing revenue generated by each service type (only completed appointments).",
      component: (
        <SalesByServiceTable
          startDate={filters.salesByService.startDate || undefined}
          endDate={filters.salesByService.endDate || undefined}
          client={filters.salesByService.client || undefined}
          service={filters.salesByService.service || undefined}
          staff={filters.salesByService.staff || undefined}
          bookingType={filters.salesByService.bookingType || undefined}
          triggerRefresh={salesByServiceRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('salesByService', newFilters)}
        />
      )
    },
    "Sales by Customer": {
      title: "Sales by Customer",
      description: "Analysis of revenue generated by individual customers.",
      component: (
        <SalesByCustomerTable
          startDate={filters.salesByCustomer.startDate || undefined}
          endDate={filters.salesByCustomer.endDate || undefined}
          client={filters.salesByCustomer.client || undefined}
          service={filters.salesByCustomer.service || undefined}
          staff={filters.salesByCustomer.staff || undefined}
          bookingType={filters.salesByCustomer.bookingType || undefined}
          triggerRefresh={salesByCustomerRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('salesByCustomer', newFilters)}
        />
      )
    },
    "Sales by Product": {
      title: "Sales by Product Report",
      description: "Detailed report showing revenue generated by each product type (only completed orders).",
      component: (
        <SalesByProductTable
          product={filters.salesByProduct.product || undefined}
          category={filters.salesByProduct.category || undefined}
          brand={filters.salesByProduct.brand || undefined}
          status={filters.salesByProduct.status || undefined}
          isActive={filters.salesByProduct.isActive || undefined}
          triggerRefresh={salesByProductRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('salesByProduct', newFilters)}
        />
      )
    },
    "All Products Report": {
      title: "All Products Report",
      description: "Complete record of all products with detailed information.",
      component: (
        <ProductSummaryTable
          product={filters.productSummary.product || undefined}
          category={filters.productSummary.category || undefined}
          brand={filters.productSummary.brand || undefined}
          status={filters.productSummary.status || undefined}
          isActive={filters.productSummary.isActive || undefined}
          triggerRefresh={productSummaryRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('productSummary', newFilters)}
        />
      )
    },
    "Inventory / Stock Report": {
      title: "Inventory / Stock Report",
      description: "Detailed analysis of product inventory and stock levels.",
      component: (
        <InventoryStockTable
          product={filters.productSummary.product || undefined}
          category={filters.productSummary.category || undefined}
          brand={filters.productSummary.brand || undefined}
          triggerRefresh={productSummaryRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('productSummary', newFilters)}
        />
      )
    },
    "Category-wise Product Report": {
      title: "Category-wise Product Report",
      description: "Aggregated view showing product counts and sales by category.",
      component: (
        <CategoryWiseProductTable
          product={filters.productSummary.product || undefined}
          category={filters.productSummary.category || undefined}
          brand={filters.productSummary.brand || undefined}
          triggerRefresh={productSummaryRefresh}
          onFiltersChange={(newFilters: any) => updateFilter('productSummary', newFilters)}
        />
      )
    }
  };

  // Simulate loading for 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleViewClick = (report: Report) => {
    setOpenReportTitle(report.title);
  };

  const filteredReportsData = useMemo(() => {
    if (!searchTerm) return VENDOR_REPORTS_DATA;

    return VENDOR_REPORTS_DATA
      .map(category => ({
        ...category,
        reports: category.reports.filter(report =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter(category => category.reports.length > 0);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="relative">
            <Skeleton className="h-10 w-80" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-8">
          {[...Array(3)].map((_, categoryIndex) => (
            <div key={categoryIndex}>
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, reportIndex) => (
                  <Card key={reportIndex}>
                    <CardHeader>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">Reports</h1>
          <p className="text-lg text-muted-foreground">
            Generate and download detailed reports for various components of the platform.
          </p>
        </div>
        <div className="relative mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="w-full md:w-80 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-10">
        {filteredReportsData
          .filter(category =>
            category.category !== "Marketing & Engagement Reports" &&
            category.category !== "User & Vendor Reports" &&
            category.category !== "Financial Reports"
          )
          .length > 0 ?
          filteredReportsData
            .filter(category =>
              category.category !== "Marketing & Engagement Reports" &&
              category.category !== "User & Vendor Reports" &&
              category.category !== "Financial Reports"
            )
            .map((category) => (
              <div key={category.category}>
                <h2 className="text-xl font-semibold font-headline mb-4 pb-2 border-b">{category.category}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.reports.map((report, index) => (
                    <Card key={index} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {report.points.map((point, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2 mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewClick(report)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No reports found matching your search.</p>
            </div>
          )}
      </div>

      {/* Unified Report Modal - Single modal for all reports */}
      {openReportTitle && reportRegistry[openReportTitle] && (
        <ReportModal
          isOpen={true}
          onClose={() => setOpenReportTitle(null)}
          title={reportRegistry[openReportTitle].title}
          description={reportRegistry[openReportTitle].description}
        >
          {reportRegistry[openReportTitle].component}
        </ReportModal>
      )}
    </div>
  );
}
