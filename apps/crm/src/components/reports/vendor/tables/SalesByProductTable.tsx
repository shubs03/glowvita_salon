"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Download, Search, Copy, FileText, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@repo/ui/pagination";
import { useGetSalesByProductReportQuery } from '@repo/store/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FilterModal } from '../../shared/FilterModal';
import { FilterParams } from '../../shared/types';

interface SalesByProductTableProps {
  product?: string;
  category?: string;
  brand?: string;
  status?: string;
  isActive?: boolean;
  onFiltersChange?: (filters: FilterParams) => void;
  triggerRefresh?: number;
}

// Export functionality functions
const exportToExcel = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;

  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;

  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, `${fileName}.csv`);
};

const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, fileName: string) => {
  if (!tableRef.current) return;

  // Get only the table element, not the entire container
  const table = tableRef.current.querySelector('table');
  if (!table) return;

  // Use html2canvas to capture only the table
  const canvas = await html2canvas(table);
  const imgData = canvas.toDataURL('image/png');

  // Create PDF
  const pdf = new jsPDF();
  const imgWidth = pdf.internal.pageSize.getWidth() - 20; // Add some margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight); // Add margins
  pdf.save(`${fileName}.pdf`);
};

const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;

  const table = tableRef.current.querySelector('table');
  if (!table) return;

  // Get table HTML
  const range = document.createRange();
  range.selectNode(table);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);
  document.execCommand('copy');
  window.getSelection()?.removeAllRanges();

  // Show success message (you might want to implement a toast notification)
  alert('Table copied to clipboard!');
};

const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) return;

  // Get only the table element, not the entire container
  const table = tableRef.current.querySelector('table');
  if (!table) return;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Print Report</title>');
    printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
};

export const SalesByProductTable = ({ product, category, brand, status, isActive, onFiltersChange, triggerRefresh }: SalesByProductTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  // Use the RTK Query hook to fetch real data
  const { data, isLoading, isError, refetch } = useGetSalesByProductReportQuery({
    product: product && product !== 'all' ? product : undefined,
    category: category && category !== 'all' ? category : undefined,
    brand: brand && brand !== 'all' ? brand : undefined,
    status: status && status !== 'all' ? status : undefined,
    isActive: isActive !== undefined ? isActive : undefined
  });

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change

    // Notify parent component about filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Export functions
  const handleExport = (format: string) => {
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, 'sales_by_product');
        break;
      case 'csv':
        exportToCSV(tableRef, 'sales_by_product');
        break;
      case 'pdf':
        exportToPDF(tableRef, 'sales_by_product');
        break;
      case 'copy':
        copyToClipboard(tableRef);
        break;
      case 'print':
        printTable(tableRef);
        break;
      default:
        break;
    }
  };

  // Trigger refetch when filter values change or when explicitly triggered
  useEffect(() => {
    refetch();
  }, [refetch, product, category, brand, status, isActive, triggerRefresh]);

  // Extract products from the API response
  const products = data?.data?.salesByProduct || [];

  // Filter data based on search term
  const searchedProducts = useMemo(() => {
    if (!searchTerm) return products;

    return products.filter((product: any) =>
      Object.values(product).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  // Pagination logic
  const totalItems = searchedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = searchedProducts.slice(startIndex, endIndex);

  // Calculate totals
  const totalUnitsSold = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.quantitySold || product.unitsSold || 0), 0);
  const totalGrossSale = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.grossSales || product.grossSale || 0), 0);
  const totalDiscounts = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.discountAmount || product.discounts || 0), 0);
  const totalOffers = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.offers || 0), 0);
  const totalNetSale = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.netSales || product.netSale || 0), 0);
  const totalTax = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.taxAmount || product.tax || 0), 0);
  const totalSales = paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, product: any) => sum + (product.totalSales || 0), 0);

  if (isLoading) {
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
                <DropdownMenuItem onClick={() => handleExport('copy')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('print')}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Product Category</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Gross Sales</TableHead>
                <TableHead>Discount Amount</TableHead>
                <TableHead>Net Sales</TableHead>
                <TableHead>Tax Amount</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Average Selling Price</TableHead>
                <TableHead>COGS</TableHead>
                <TableHead>Gross Profit</TableHead>
                <TableHead>Gross Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
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
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="text-center py-4 text-red-500">
          Failed to load sales by product data. Please try again.
        </div>
      </div>
    );
  }

  if (paginatedProducts.length === 0) {
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
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="text-center py-4 text-gray-500">
          No sales by product data available.
        </div>
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleFilterChange}
          cities={[]}
          initialFilters={filters}
          showProductFilter={true}
          showCategoryFilter={true}
          showBrandFilter={true}
          hideBookingTypeFilter={true}
          hideClientFilter={true}
          hideServiceFilter={true}
          hideStaffFilter={true}
        />
      </div>
    );
  }

  return (
    <div ref={tableRef}>
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
              <DropdownMenuItem onClick={() => handleExport('copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('print')}>
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
        cities={[]}
        initialFilters={filters}
        showProductFilter={true}
        showCategoryFilter={true}
        showBrandFilter={true}
        hideBookingTypeFilter={true}
        hideClientFilter={true}
        hideServiceFilter={true}
        hideStaffFilter={true}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Product Category</TableHead>
              <TableHead>Quantity Sold</TableHead>
              <TableHead>Gross Sales</TableHead>
              <TableHead>Discount Amount</TableHead>
              <TableHead>Net Sales</TableHead>
              <TableHead>Tax Amount</TableHead>
              <TableHead>Total Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((item: any, index: number) => {
              // Only show products with delivered status
              if (item.status !== 'delivered') return null;

              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productId || 'N/A'}</TableCell>
                  <TableCell>{item.productName || item.product || 'Unknown Product'}</TableCell>
                  <TableCell>{item.brand || 'N/A'}</TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>{item.quantitySold || item.unitsSold || 0}</TableCell>
                  <TableCell>₹{typeof item.grossSales === 'number' ? item.grossSales.toFixed(2) : typeof item.grossSale === 'number' ? item.grossSale.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.discountAmount === 'number' ? item.discountAmount.toFixed(2) : typeof item.discounts === 'number' ? item.discounts.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.netSales === 'number' ? item.netSales.toFixed(2) : typeof item.netSale === 'number' ? item.netSale.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.taxAmount === 'number' ? item.taxAmount.toFixed(2) : typeof item.tax === 'number' ? item.tax.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.totalSales === 'number' ? item.totalSales.toFixed(2) : '0.00'}</TableCell>
                </TableRow>
              );
            })}
            {/* Total Row */}
            <TableRow className="font-bold bg-gray-50">
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell>
                {paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, item: any) => sum + (item.quantitySold || item.unitsSold || 0), 0)}
              </TableCell>
              <TableCell>
                ₹{paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, item: any) => sum + (item.grossSales || item.grossSale || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₹{paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, item: any) => sum + (item.discountAmount || item.discounts || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₹{paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, item: any) => sum + (item.netSales || item.netSale || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₹{paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, item: any) => sum + (item.taxAmount || item.tax || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₹{paginatedProducts.filter((item: any) => item.status === 'delivered').reduce((sum: number, item: any) => sum + (item.totalSales || 0), 0).toFixed(2)}
              </TableCell>
            </TableRow>
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
