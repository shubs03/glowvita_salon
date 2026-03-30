"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Pagination } from "@repo/ui/pagination";
import { Download, IndianRupee, ShoppingCart, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
import { useGetSalesByProductsReportQuery } from '@repo/store/api';
import { useReport } from '../hooks/useReport';
import { FilterModal } from '../common/FilterModal';
import { FilterParams, SalesByProductData } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard, printTable } from '../utils/exportFunctions';

export const SalesByProductReportTable = () => {
  const {
    apiFilters,
    filters,
    handleFilterChange,
    isFilterModalOpen,
    setIsFilterModalOpen,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    tableRef,
    filterAndPaginateData
  } = useReport<SalesByProductData>();

  const { data, isLoading, isError, error } = useGetSalesByProductsReportQuery(apiFilters);

  const salesData = data?.salesBySalon || data?.salesByProducts || [];
  const cities = data?.cities || [];
  const categories = data?.categories || [];
  const brands = data?.brands || [];
  const aggregatedTotals = data?.aggregatedTotals;

  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);

  useEffect(() => {
    setAllCities(cities);
    setAllCategories(categories);
    setAllBrands(brands);

    if (salesData.length > 0 && allBusinessNames.length === 0) {
      const nameMap: { [key: string]: boolean } = {};
      const names: string[] = [];

      salesData.forEach((item: any) => {
        const name = item.businessName || item.vendorName || item.vendor;
        if (name && name !== 'N/A' && !nameMap[name]) {
          nameMap[name] = true;
          names.push(name);
        }
      });
      setAllBusinessNames(names);
    }
  }, [salesData, cities, categories, brands, allBusinessNames.length]);

  const businessNames = allBusinessNames;

  const formattedData = salesData.map((item: any) => ({
    product: item.productName || item.product || item.businessName || item._id,
    category: item.category || 'Unknown Category',
    brand: item.brand || 'Unknown Brand',
    vendor: item.vendorName || item.businessName || item.vendor || 'Unknown Vendor',
    city: item.vendorCity || item.city || 'Unknown City',
    sale: item.sale || `₹${(item.totalRevenue || item.revenue || 0).toFixed(2)}`,
    productSold: item.productSold || item.totalQuantity || item.quantity || 0,
    productPlatformFee: item.productPlatformFee || 0,
    productGST: item.productGST || 0,
    onlineSales: item.onlineSales || 0,
    offlineSales: item.offlineSales || 0,
    type: item.type || 'Vendor'
  }));

  const {
    paginatedData,
    totalItems,
    totalPages,
    startIndex
  } = filterAndPaginateData(formattedData, (product: SalesByProductData) =>
    Object.values(product).map(v => v?.toString() || '')
  );

  if (isLoading) {
    return (
      <div>
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

        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Sale (₹)</TableHead>
                <TableHead>Product Sold</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading sales by product report data. Please try again later.
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-2 text-sm text-gray-500">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (formattedData.length === 0) {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Business</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales (₹)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button><Download className="mr-2 h-4 w-4" />Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" />Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_product_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_product_report')}>
                  <FileText className="mr-2 h-4 w-4" />CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_product_report')}>
                  <FileText className="mr-2 h-4 w-4" />PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => printTable(tableRef)}>
                  <Printer className="mr-2 h-4 w-4" />Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleFilterChange}
          cities={allCities}
          categories={allCategories}
          brands={allBrands}
          businessNames={businessNames}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
          showCategoryFilter={true}
          showBrandFilter={true}
        />

        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Sale (₹)</TableHead>
                <TableHead>Product Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No sales by product data available.
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
          <Input type="search" placeholder="Search..." className="pl-8" value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button><Download className="mr-2 h-4 w-4" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                <Copy className="mr-2 h-4 w-4" />Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_product_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_product_report')}>
                <FileText className="mr-2 h-4 w-4" />CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_product_report')}>
                <FileText className="mr-2 h-4 w-4" />PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printTable(tableRef)}>
                <Printer className="mr-2 h-4 w-4" />Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={allCities}
        businessNames={allBusinessNames}
        categories={allCategories}
        brands={allBrands}
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
        showCategoryFilter={true}
        showBrandFilter={true}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data?.aggregatedTotals?.totalBusinessFormatted || '₹0.00')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedTotals?.totalProductsSold || aggregatedTotals?.totalQuantity || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Product Platform Fee (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalProductPlatformFee || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Product GST (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalProductGST || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Product Amount (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalSale || aggregatedTotals?.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Product Amount (₹)</TableHead>
              <TableHead>Product Platform Fee (₹)</TableHead>
              <TableHead>Product GST (₹)</TableHead>
              <TableHead>Product Sold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((product: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{product.product}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>{product.vendor}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.city}</TableCell>
                <TableCell>{product.sale}</TableCell>
                <TableCell>₹{product.productPlatformFee.toFixed(2)}</TableCell>
                <TableCell>₹{product.productGST.toFixed(2)}</TableCell>
                <TableCell>{product.productSold}</TableCell>
              </TableRow>
            ))}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell>TOTAL</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  const saleValue = parseFloat(item.sale.replace('₹', '')) || 0;
                  return sum + saleValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.productPlatformFee || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.productGST || 0), 0).toFixed(2)}</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (parseInt(item.productSold) || 0), 0)}</TableCell>
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
    </div>
  );
};
