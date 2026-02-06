"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Download, Eye, Search } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { Report } from '../shared/types';

// Import table components
import { ProductSummaryTable } from './tables/ProductSummaryTable';
import { InventoryStockTable } from './tables/InventoryStockTable';
import { CategoryWiseProductTable } from './tables/CategoryWiseProductTable';
import { SalesByProductTable } from './tables/SalesByProductTable';

// Import constants, hooks, and modal wrapper
import { SUPPLIER_REPORTS_DATA } from './constants';
import { useSupplierFilters } from './hooks/useSupplierFilters';
import { ReportModal } from './modals/ReportModal';

export default function SupplierReports() {
  // Use the custom hook for managing all filter states
  const { filters, updateFilter } = useSupplierFilters();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductSummaryModalOpen, setIsProductSummaryModalOpen] = useState(false);
  const [isSalesByProductModalOpen, setIsSalesByProductModalOpen] = useState(false);
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Refresh states for each report
  const [productSummaryRefresh, setProductSummaryRefresh] = useState(0);
  const [salesByProductRefresh, setSalesByProductRefresh] = useState(0);

  // Simulate loading for 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleViewClick = (report: Report) => {
    setSelectedReport(report);

    if (report.title === "Sales by Product") {
      setIsSalesByProductModalOpen(true);
    } else if (report.title === "All Products Report" || report.title === "Inventory / Stock Report" || report.title === "Category-wise Product Report") {
      setIsProductSummaryModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredReportsData = useMemo(() => {
    if (!searchTerm) return SUPPLIER_REPORTS_DATA;

    return SUPPLIER_REPORTS_DATA
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
        <div className="space-y-8">
          {[...Array(2)].map((_, categoryIndex) => (
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
          <h1 className="text-3xl font-bold font-headline mb-2">Supplier Reports</h1>
          <p className="text-lg text-muted-foreground">
            Generate and download detailed product and sales reports.
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
        {filteredReportsData.length > 0 ?
          filteredReportsData.map((category) => (
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
                      <p className="text-sm text-muted-foreground">{report.details}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(report)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" className='h-12 px-6 rounded-lg'>
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

      {/* Generic Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              A preview of the "{selectedReport?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Summary Modal - handles All Products, Inventory/Stock, Category-wise reports */}
      <ReportModal
        isOpen={isProductSummaryModalOpen}
        onClose={() => setIsProductSummaryModalOpen(false)}
        title={selectedReport?.title || "Product Report"}
        description={selectedReport?.description || "Detailed product information"}
      >
        {selectedReport?.title === "All Products Report" && (
          <ProductSummaryTable
            product={filters.productSummary.product}
            category={filters.productSummary.category}
            brand={filters.productSummary.brand}
            status={filters.productSummary.status}
            isActive={filters.productSummary.isActive}
            region={filters.productSummary.region}
            triggerRefresh={productSummaryRefresh}
            onFiltersChange={(newFilters: any) => {
              updateFilter('productSummary', newFilters);
            }}
          />
        )}
        {selectedReport?.title === "Inventory / Stock Report" && (
          <InventoryStockTable
            product={filters.productSummary.product}
            category={filters.productSummary.category}
            brand={filters.productSummary.brand}
            triggerRefresh={productSummaryRefresh}
            onFiltersChange={(newFilters: any) => {
              updateFilter('productSummary', newFilters);
            }}
          />
        )}
        {selectedReport?.title === "Category-wise Product Report" && (
          <CategoryWiseProductTable
            product={filters.productSummary.product}
            category={filters.productSummary.category}
            brand={filters.productSummary.brand}
            triggerRefresh={productSummaryRefresh}
            onFiltersChange={(newFilters: any) => {
              updateFilter('productSummary', newFilters);
            }}
          />
        )}
      </ReportModal>

      {/* Sales by Product Report Modal */}
      <ReportModal
        isOpen={isSalesByProductModalOpen}
        onClose={() => setIsSalesByProductModalOpen(false)}
        title="Sales by Product Report"
        description="Detailed report showing revenue generated by each product type (only completed orders)."
      >
        <SalesByProductTable
          product={filters.salesByProduct.product}
          category={filters.salesByProduct.category}
          brand={filters.salesByProduct.brand}
          status={filters.salesByProduct.status}
          isActive={filters.salesByProduct.isActive}
          triggerRefresh={salesByProductRefresh}
          onFiltersChange={(newFilters: any) => {
            updateFilter('salesByProduct', newFilters);
          }}
        />
      </ReportModal>
    </div>
  );
}
