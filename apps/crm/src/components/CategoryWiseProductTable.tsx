import { useState, useMemo, useEffect, useRef, RefObject } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Button } from "@repo/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Skeleton } from "@repo/ui/skeleton";
import { Search, Filter, Copy, FileSpreadsheet, FileText, Printer, Download } from 'lucide-react';
import { useGetCategoryWiseProductReportQuery } from '@repo/store/api';
import { Pagination } from "@repo/ui/pagination";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FilterParams {
  product?: string;
  category?: string;
  brand?: string;
}

interface CategoryWiseProductTableProps {
  product?: string;
  category?: string;
  brand?: string;
  onFiltersChange?: (filters: FilterParams) => void;
  triggerRefresh?: number;
}

export const CategoryWiseProductTable = ({ 
  product, 
  category, 
  brand, 
  onFiltersChange, 
  triggerRefresh = 0 
}: CategoryWiseProductTableProps) => {
  const [filters, setFilters] = useState<FilterParams>({ product, category, brand });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the RTK Query hook to fetch real data
  const { data, isLoading, isError, refetch } = useGetCategoryWiseProductReportQuery({ 
    product: product && product !== 'all' ? product : undefined,
    category: category && category !== 'all' ? category : undefined,
    brand: brand && brand !== 'all' ? brand : undefined
  });
  
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Notify parent component about filter changes
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };
  
  // Export utility functions
  const exportToExcel = (tableRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (tableRef.current) {
      const table = tableRef.current.querySelector('table');
      if (table) {
        const wb = XLSX.utils.table_to_book(table);
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
    }
  };

  const exportToCSV = (tableRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (tableRef.current) {
      const table = tableRef.current.querySelector('table');
      if (table) {
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets["Sheet1"]);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const exportToPDF = async (tableRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (tableRef.current) {
      const table = tableRef.current.querySelector('table');
      if (table) {
        const canvas = await html2canvas(table);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${filename}.pdf`);
      }
    }
  };

  const copyToClipboard = (tableRef: React.RefObject<HTMLDivElement>) => {
    if (tableRef.current) {
      const table = tableRef.current.querySelector('table');
      if (table) {
        const text = table.innerText;
        navigator.clipboard.writeText(text);
      }
    }
  };

  const printTable = (tableRef: React.RefObject<HTMLDivElement>) => {
    if (tableRef.current) {
      const table = tableRef.current.querySelector('table');
      if (table) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Table</title>
                <style>
                  table { border-collapse: collapse; width: 100%; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                ${table.outerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }
  };

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, 'category_wise_product_report');
        break;
      case 'csv':
        exportToCSV(tableRef, 'category_wise_product_report');
        break;
      case 'pdf':
        exportToPDF(tableRef, 'category_wise_product_report');
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
  }, [refetch, product, category, brand, triggerRefresh]);
  
  // Extract categories from the API response
  const categories = data?.data?.categories || [];
  
  // Filter data based on search term
  const searchedCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter((category: any) => 
      Object.values(category).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [categories, searchTerm]);
  
  // Pagination logic
  const totalItems = searchedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = searchedCategories.slice(startIndex, endIndex);
  
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
                <TableHead>Category Name</TableHead>
                <TableHead>Number of Products</TableHead>
                <TableHead>Active Products</TableHead>
                <TableHead>Average Price</TableHead>
                <TableHead>Average Sale Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
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
          Failed to load category-wise product data. Please try again.
        </div>
      </div>
    );
  }
  
  if (paginatedCategories.length === 0) {
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
          No category data found.
        </div>
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
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Number of Products</TableHead>
              <TableHead>Active Products</TableHead>
              <TableHead>Average Price</TableHead>
              <TableHead>Average Sale Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((item: any, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.categoryName}</TableCell>
                  <TableCell>{item.numberOfProducts}</TableCell>
                  <TableCell>{item.activeProducts}</TableCell>
                  <TableCell>₹{typeof item.averagePrice === 'number' ? item.averagePrice.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>₹{typeof item.averageSalePrice === 'number' ? item.averageSalePrice.toFixed(2) : '0.00'}</TableCell>
                </TableRow>
              );
            })}
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