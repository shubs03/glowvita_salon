"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Pagination } from "@repo/ui/pagination";
import { Download, Eye, DollarSign, IndianRupee, Users, UserPlus, ShoppingCart, Search, Calendar, Copy, FileText, FileSpreadsheet, Printer, Filter, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Input } from '@repo/ui/input';
import { Skeleton } from '@repo/ui/skeleton';
// Import the API hooks for reports
import { useGetSellingServicesReportQuery, useGetCancellationReportQuery, useGetTotalBookingsReportQuery, useGetCompletedBookingsReportQuery, useGetSalesByProductsReportQuery, useGetSalesByBrandReportQuery, useGetSalesByCategoryReportQuery, useGetConsolidatedSalesReportQuery, useGetSubscriptionReportQuery, useGetMarketingCampaignReportQuery } from '@repo/store/api';

// Export functionality imports
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Report {
  title: string;
  description: string;
  details: string;
}

interface ReportCategory {
  category: string;
  reports: Report[];
}

interface SellingServiceData {
  service: string;
  vendor: string;
  city: string;
  totalServiceAmount: string;
  rawTotalServiceAmount: number;
  itemsSold: number;
  platformFee: string | null;
  rawPlatformFee: number;
  serviceTax: string | null;
  rawServiceTax: number;
}

interface SalesByBrandData {
  brandName: string;
  totalQuantitySold: number;
  totalRevenue: string;
}

interface SalesByCategoryData {
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: string;
}

interface SubscriptionData {
  purchaseDate: string;
  vendor: string;
  type: string;
  city: string;
  subscription: string;
  startDate: string;
  endDate: string;
  price: number;
  planStatus: string;
  paymentMode: string;
}

interface CampaignData {
  vendor: string;
  type: string;
  city: string;
  packageName: string;
  smsCount: number;
  price: number;
  purchaseDate: string;
  expiryDate: string;
  ticketRaised: number;
  status: string;
}

// Custom hook for common report functionality
const useReport = <T,>(initialItemsPerPage: number = 5) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const filterAndPaginateData = (data: T[], searchFields: (item: T) => string[]) => {
    // Filter data based on search term
    const filteredData = useMemo(() => {
      if (!searchTerm) return data;
      
      return data.filter(item => 
        searchFields(item).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }, [data, searchTerm]);

    // Pagination logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      filteredData,
      paginatedData,
      totalItems,
      totalPages,
      startIndex,
      endIndex
    };
  };

  return {
    // State
    filters,
    isFilterModalOpen,
    currentPage,
    itemsPerPage,
    searchTerm,
    tableRef,
    // Setters
    setFilters,
    setIsFilterModalOpen,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    // Functions
    handleFilterChange,
    filterAndPaginateData
  };
};

// Unified Filter Modal Component
const FilterModal = ({ 
  isOpen, 
  onClose, 
  onApplyFilters,
  cities = [],
  vendors = [],
  services = [],
  businessNames = [],
  packageNames = [],
  planStatuses = [],
  categories = [],
  brands = [],
  initialFilters = {},
  showStatusFilter = false,
  showBookingTypeFilter = true,
  showUserTypeFilter = false,
  showBusinessNameFilter = false,
  showVendorFilter = false,
  showServiceFilter = false,
  showPackageNameFilter = false,
  showPlanStatusFilter = false,
  showCategoryFilter = false,
  showBrandFilter = false
}: { 
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterParams) => void;
  cities?: string[];
  vendors?: string[];
  services?: string[];
  businessNames?: string[];
  packageNames?: string[];
  planStatuses?: string[];
  categories?: string[];
  brands?: string[];
  initialFilters?: FilterParams;
  showStatusFilter?: boolean;
  showBookingTypeFilter?: boolean;
  showUserTypeFilter?: boolean;
  showBusinessNameFilter?: boolean;
  showVendorFilter?: boolean;
  showServiceFilter?: boolean;
  showPackageNameFilter?: boolean;
  showPlanStatusFilter?: boolean;
  showCategoryFilter?: boolean;
  showBrandFilter?: boolean;
}) => {
  const [startDate, setStartDate] = useState<string>(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState<string>(initialFilters.endDate || '');
  const [saleType, setSaleType] = useState<string>(initialFilters.saleType || 'all');
  const [city, setCity] = useState<string>(initialFilters.city || 'all');
  const [status, setStatus] = useState<string>(initialFilters.status || 'all');
  const [userType, setUserType] = useState<string>(initialFilters.userType || 'all');
  const [businessName, setBusinessName] = useState<string>(initialFilters.businessName || 'all');
  const [packageName, setPackageName] = useState<string>(initialFilters.packageName || 'all');
  const [planStatus, setPlanStatus] = useState<string>(initialFilters.planStatus || 'all');
  const [vendor, setVendor] = useState<string>(initialFilters.vendor || 'all');
  const [service, setService] = useState<string>(initialFilters.service || 'all');
  const [category, setCategory] = useState<string>(initialFilters.category || 'all');
  const [brand, setBrand] = useState<string>(initialFilters.brand || 'all');

  // Update state when initialFilters change
  useEffect(() => {
    setStartDate(initialFilters.startDate || '');
    setEndDate(initialFilters.endDate || '');
    setSaleType(initialFilters.saleType || 'all');
    setCity(initialFilters.city || 'all');
    setStatus(initialFilters.status || 'all');
    setUserType(initialFilters.userType || 'all');
    setBusinessName(initialFilters.businessName || 'all');
    setPackageName(initialFilters.packageName || 'all');
    setPlanStatus(initialFilters.planStatus || 'all');
    setVendor(initialFilters.vendor || 'all');
    setService(initialFilters.service || 'all');
    // Ensure category and brand are properly set, defaulting to 'all' if not present or invalid
    setCategory(initialFilters.category && initialFilters.category !== '' ? initialFilters.category : 'all');
    setBrand(initialFilters.brand && initialFilters.brand !== '' ? initialFilters.brand : 'all');
  }, [initialFilters]);

  const handleApply = () => {
    const filters = { startDate, endDate, saleType, city, status, userType, businessName, packageName, planStatus, vendor, service, category, brand };
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setSaleType('all');
    setCity('all');
    setStatus('all');
    setUserType('all');
    setBusinessName('all');
    setPackageName('all');
    setPlanStatus('all');
    setVendor('all');
    setService('all');
    setCategory('all');
    setBrand('all');
  };

  // Limit displayed filter options to 5 with scroll for the rest
  const renderFilterOptions = (options: string[], showAll: boolean = false) => {
    // Ensure options is an array and not a single value
    const validOptions = Array.isArray(options) ? options.filter(opt => typeof opt === 'string' && opt) : [];
    
    if (showAll || validOptions.length <= 5) {
      return validOptions.map((option, index) => (
        <SelectItem key={index} value={option}>{option}</SelectItem>
      ));
    }
    
    return (
      <div className="max-h-40 overflow-y-auto">
        {validOptions.map((option, index) => (
          <SelectItem key={index} value={option}>{option}</SelectItem>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>
            Apply filters to refine your report data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Filter by Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Filter by End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            {showVendorFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Vendor</label>
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {renderFilterOptions(vendors)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Filter by City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {renderFilterOptions(cities)}
                </SelectContent>
              </Select>
            </div>
            
            {showBookingTypeFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Booking Type</label>
                <Select value={saleType} onValueChange={setSaleType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showServiceFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Service</label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {renderFilterOptions(services)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showUserTypeFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by User Type</label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showBusinessNameFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Business Name</label>
                <Select value={businessName} onValueChange={setBusinessName}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Businesses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Businesses</SelectItem>
                    {renderFilterOptions(businessNames)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showPackageNameFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Package Name</label>
                <Select value={packageName} onValueChange={setPackageName}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {renderFilterOptions(packageNames)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showStatusFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {renderFilterOptions(['active', 'expired', 'used'])}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showPlanStatusFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Plan Status</label>
                <Select value={planStatus} onValueChange={setPlanStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Plan Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plan Statuses</SelectItem>
                    {renderFilterOptions(planStatuses)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Category Filter */}
            {showCategoryFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {renderFilterOptions(categories)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Brand Filter */}
            {showBrandFilter && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Filter by Brand</label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {renderFilterOptions(brands)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CancelledBookingData {
  vendor: string;
  booking: {
    clientName: string;
    serviceName: string;
    date: Date;
    time: string;
    status: string;
    createdAt: Date;
    mode: string; // Add mode property
  };
}

interface TotalBookingsData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  onlineBookings: number;
  offlineBookings: number;
  totalRevenue: number;
  filter: string;
}

interface CompletedBookingsData {
  totalCompletedBookings: number;
  completedOnlineBookings: number;
  completedOfflineBookings: number;
  revenueFromCompletedBookings: number;
  filter: string;
}

interface BookingData {
  clientName: string;
  serviceName: string;
  vendorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  mode: string;
  finalAmount: number;
}

interface VendorStat {
  vendorId: string;
  vendor: string;
  city: string;
  totalBookings: number;
  totalRevenue: number;
  totalPlatformFees: number;
  totalServiceTax: number;
  onlineBookings: number;
  offlineBookings: number;
  onlinePayments: number;
  offlinePayments: number;
}

interface VendorCancellationStat {
  vendorId: string;
  vendor: string;
  city: string;
  totalCancellations: number;
  onlineCancellations: number;
  offlineCancellations: number;
}

interface ServiceStat {
  _id: string;
  count: number;
  revenue?: number;
}

const reportsData: ReportCategory[] = [
    {
        category: "Financial Reports",
        reports: [
            {
                title: "Sales Report",
                description: "Consolidated report of service and product sales.",
                details: "Combined revenue breakdown for services and products."
            },
            {
                title: "Subscription Report",
                description: "Detailed report on subscription revenue and user churn.",
                details: "Monitor the health of your subscription business."
            },
            {
                title: "Sales by Product",
                description: "Revenue breakdown by individual products/services.",
                details: "Compare performance across different products/services."
            },
            {
                title: "Sales by Category",
                description: "Aggregated product sales grouped by category.",
                details: "Identify top-performing product categories and sales trends."
            },
            {
                title: "Sales by Brand",
                description: "Aggregated product sales grouped by brand.",
                details: "Track which brands generate the most revenue and items sold."
            }
        ]
    },

    {
        category: "Booking Summary",
        reports: [
            {
                title: "Sales by Services",
                description: "Overview of services sold and their performance metrics.",
                details: "Track which services are most popular and profitable."
            },
            {
                title: "Total Bookings",
                description: "Complete report of all bookings made on the platform.",
                details: "Comprehensive view of booking volume and trends."
            },
            {
                title: "Completed Bookings",
                description: "Detailed report of successfully completed bookings.",
                details: "Track service fulfillment and customer satisfaction."
            },
            {
                title: "Cancellations",
                description: "Analysis of cancelled bookings and reasons.",
                details: "Identify patterns and reduce cancellation rates."
            }
        ]
    },
    {
        category: "Marketing & Engagement Reports",
        reports: [
            {
                title: "Marketing Campaign Report",
                description: "Performance metrics for all marketing campaigns.",
                details: "Includes SMS, social media, and digital marketing."
            }
        ]
    }
];

interface FilterParams {
  startDate?: string;
  endDate?: string;
  saleType?: string;
  city?: string;
  status?: string;
  userType?: string;
  businessName?: string;
  packageName?: string;
  planStatus?: string;
  vendor?: string;
  service?: string;
  category?: string;
  brand?: string;
}

// Reusable Date Range Filter Component

const DateRangeFilter = ({ 
  onFilterChange,
  cities = [], // Add cities prop
  showStatusFilter = false, // Add status filter prop
  showBookingTypeFilter = true, // Add booking type filter prop
  showUserTypeFilter = false // Add user type filter prop
}: { 
  onFilterChange: (filters: FilterParams) => void;
  cities?: string[]; // Add cities prop
  showStatusFilter?: boolean; // Add status filter prop
  showBookingTypeFilter?: boolean; // Add booking type filter prop
  showUserTypeFilter?: boolean; // Add user type filter prop
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saleType, setSaleType] = useState<string>('all');
  const [city, setCity] = useState<string>('all'); // Add city state
  const [status, setStatus] = useState<string>('all'); // Add status state
  const [userType, setUserType] = useState<string>('all'); // Add user type state

  const handleApplyFilters = () => {
    const filters = { startDate, endDate, saleType, city, status, userType };
    console.log("Applying filters:", filters);
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSaleType('all');
    setCity('all'); // Reset city filter
    setStatus('all'); // Reset status filter
    setUserType('all'); // Reset user type filter
    const filters = { startDate: '', endDate: '', saleType: 'all', city: 'all', status: 'all', userType: 'all' };
    console.log("Clearing filters:", filters);
    onFilterChange(filters);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">End Date</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full"
        />
      </div>
      
      {showBookingTypeFilter && (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Booking Type</label>
          <Select value={saleType} onValueChange={setSaleType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select booking type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* User Type Filter */}
      {showUserTypeFilter && (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">User Type</label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* City Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">City</label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((cityName, index) => (
              <SelectItem key={index} value={cityName}>{cityName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Status Filter */}
      {showStatusFilter && (
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Button onClick={handleApplyFilters} className="mt-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleClearFilters} className="mt-1">
          Clear
        </Button>
      </div>
    </div>
  );
};

// Component to display Selling Services report data in a table
const SellingServicesReportTable = () => {
  const {
    filters,
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
  } = useReport<SellingServiceData>(5);
  
  // Use the API hook to fetch selling services report data with filters
  const apiFilters = filters;
  
  console.log("Selling Services API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetSellingServicesReportQuery(apiFilters);
  
  // Define data variables after API call
  const sellingServicesData = data?.services || [];
  const cities = data?.cities || []; // Get cities from API response
  const vendors = data?.vendors || []; // Get vendors from API response
  const servicesList = data?.servicesList || []; // Get services from API response
  const uniqueVendors = data?.uniqueVendors || 0; // Get unique vendors count from API response
  
  // Filter and paginate data
  const {
    paginatedData,
    totalItems,
    totalPages,
    startIndex
  } = filterAndPaginateData(sellingServicesData, (service) => Object.values(service));

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
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'selling_services_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'selling_services_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'selling_services_report')}>
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
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Sale </TableHead>
                <TableHead>Items Sold</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error fetching selling services report:", error);
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
        <div className="p-4 text-center text-red-500">
          Error loading selling services report data. Please try again later.
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
  if (sellingServicesData.length === 0) {
    return (
      <div>
        {/* Metrics Cards - show with 0 values when no data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'selling_services_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'selling_services_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'selling_services_report')}>
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
          cities={cities || []}
          vendors={vendors || []}
          services={servicesList || []}
          showVendorFilter={true}
          showServiceFilter={true}
          initialFilters={filters}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Service Amount</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Service Tax</TableHead>
                <TableHead>Items Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No selling services data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'selling_services_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'selling_services_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'selling_services_report')}>
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
      
      {/* Metrics Cards - always show, display 0 when no data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Service Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.aggregatedTotals?.totalServiceAmountFormatted || '₹0.00')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.aggregatedTotals?.totalItemsSold || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.aggregatedTotals?.totalPlatformFeeFormatted || '-'}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Service Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.aggregatedTotals?.totalServiceTaxFormatted || '-'}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.uniqueVendors || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.uniqueServices || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={cities}
        vendors={vendors}
        services={servicesList}
        showVendorFilter={true}
        showServiceFilter={true}
        initialFilters={filters}
      />
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Service Amount</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Service Tax</TableHead>
              <TableHead>Items Sold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((service: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{service.service}</TableCell>
                <TableCell>{service.vendor}</TableCell>
                <TableCell>{service.city}</TableCell>
                <TableCell>{service.totalServiceAmount}</TableCell>
                <TableCell>{service.platformFee || '-'}</TableCell>
                <TableCell>{service.serviceTax || '-'}</TableCell>
                <TableCell>{service.itemsSold}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum, service: any) => sum + (service.rawTotalServiceAmount || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum, service: any) => sum + (service.rawPlatformFee || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum, service: any) => sum + (service.rawServiceTax || 0), 0).toFixed(2)}</TableCell>
                <TableCell>{paginatedData.reduce((sum, service: any) => sum + (parseInt(service.itemsSold) || 0), 0)}</TableCell>
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

// Component to display Cancellation report data in a table
const CancellationReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch cancellation report data with filters
  const apiFilters = filters;
  
  console.log("Cancellation API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetCancellationReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Cancellation filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Debug: Log the actual data structure
  console.log('Cancellation raw data:', data);
  
  // Define data variables after API call
  // The API returns an object with vendorCancellations array
  const rawData = data && Array.isArray(data.vendorCancellations) ? data.vendorCancellations : [];
  const cities = data?.cities || [];
  const vendors = data?.vendors || [];
  
  // Handle case where data structure is unexpected
  if (!data || !Array.isArray(data.vendorCancellations)) {
    console.warn('Cancellation data structure is unexpected:', data);
  }
  
  // Transform and aggregate the raw data by vendor
  const aggregatedData: Record<string, VendorCancellationStat> = rawData.reduce((acc: Record<string, VendorCancellationStat>, item: any) => {
    const vendor = item.vendor || item.businessName || 'Unknown Vendor';
    const city = item.city || 'Unknown City';
    const key = `${vendor}-${city}`;
    
    if (!acc[key]) {
      acc[key] = {
        vendorId: '',
        vendor,
        city,
        totalCancellations: 0,
        onlineCancellations: 0,
        offlineCancellations: 0
      };
    }
    
    acc[key].totalCancellations += item.totalCancellations || 1;
    acc[key].onlineCancellations += item.onlineCancellations || 0;
    acc[key].offlineCancellations += item.offlineCancellations || 0;
    return acc;
  }, {});
  
  const finalCancellationData: VendorCancellationStat[] = Object.values(aggregatedData);
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return finalCancellationData;
    
    return finalCancellationData.filter((item: VendorCancellationStat) => 
      Object.values(item).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [finalCancellationData, searchTerm]);
  
  // Debug: Log the processed data
  console.log('Processed cancellation data:', finalCancellationData);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
                <DropdownMenuItem onClick={() => copyToClipboard(tableRef)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'cancellation_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'cancellation_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'cancellation_report')}>
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
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Cancellations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
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
    console.error("Error fetching cancellation report:", error);
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
        <div className="p-4 text-center text-red-500">
          Error loading cancellation report data. Please try again later.
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
  if (finalCancellationData.length === 0) {
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'cancellation_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'cancellation_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'cancellation_report')}>
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
          vendors={vendors}
          showVendorFilter={true}
          initialFilters={filters}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Cancellations</TableHead>
                <TableHead>Online Cancellations</TableHead>
                <TableHead>Offline Cancellations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No cancellation data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'cancellation_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'cancellation_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'cancellation_report')}>
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
      
      {/* Total Cancellations Card */}
      <div className="flex justify-start mb-6">
        <Card className="w-fit min-w-[200px]">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium">Total Cancellations</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold">{data?.totalCancelled || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleFilterChange}
        cities={cities}
        vendors={vendors}
        showVendorFilter={true}
        initialFilters={filters}
      />
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Cancellations</TableHead>
              <TableHead>Online Cancellations</TableHead>
              <TableHead>Offline Cancellations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((vendorData: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{vendorData.vendor}</TableCell>
                <TableCell>{vendorData.city}</TableCell>
                <TableCell>{vendorData.totalCancellations}</TableCell>
                <TableCell>{vendorData.onlineCancellations}</TableCell>
                <TableCell>{vendorData.offlineCancellations}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (item.totalCancellations || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (item.onlineCancellations || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (item.offlineCancellations || 0), 0)}</TableCell>
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

// Component to display Total Bookings report data in a table
const TotalBookingsReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch total bookings report data with filters
  const apiFilters = filters;
  
  console.log("Total Bookings API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetTotalBookingsReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Total Bookings filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Define data variables after API call
  const vendorBookingsData = data?.vendorBookings || [];
  const cities = data?.cities || []; // Get cities from API response
  const vendors = data?.vendors || []; // Get vendors from API response
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return vendorBookingsData;
    
    return vendorBookingsData.filter((booking: any) => 
      Object.values(booking).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [vendorBookingsData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (isLoading) {
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'total_bookings_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'total_bookings_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'total_bookings_report')}>
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
        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Online Appointments</TableHead>
                <TableHead>Offline Appointments</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error fetching total bookings report:", error);
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'total_bookings_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'total_bookings_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'total_bookings_report')}>
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
          Error loading total bookings report data. Please try again later.
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
  if (vendorBookingsData.length === 0) {
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'total_bookings_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'total_bookings_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'total_bookings_report')}>
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
          vendors={vendors}
          showVendorFilter={true}
          initialFilters={filters}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Online Appointments</TableHead>
                <TableHead>Offline Appointments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No total bookings data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'total_bookings_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'total_bookings_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'total_bookings_report')}>
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
        vendors={vendors}
        showVendorFilter={true}
        initialFilters={filters}
      />
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Online Appointments</TableHead>
              <TableHead>Offline Appointments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((vendorData: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{vendorData.vendor}</TableCell>
                <TableCell>{vendorData.city}</TableCell>
                <TableCell>{vendorData.totalBookings}</TableCell>
                <TableCell>{vendorData.onlineBookings}</TableCell>
                <TableCell>{vendorData.offlineBookings}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (item.totalBookings || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (item.onlineBookings || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (item.offlineBookings || 0), 0)}</TableCell>
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

// Component to display Completed Bookings report data in a table
const CompletedBookingsReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch completed bookings report data with filters
  const apiFilters = filters;
  
  console.log("Completed Bookings API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetCompletedBookingsReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Completed Bookings filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Define data variables after API call
  const vendorBookingsData = data?.vendorStats || [];
  const cities = data?.cities || []; // Get cities from API response
  const vendors = data?.vendors || []; // Get vendors from API response
  const aggregatedTotals = data?.aggregatedTotals;
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return vendorBookingsData;
    
    return vendorBookingsData.filter((booking: any) => 
      Object.values(booking).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [vendorBookingsData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
        
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Online Appointments</TableHead>
                <TableHead>Offline Appointments</TableHead>
                <TableHead>Online Payments (₹)</TableHead>
                <TableHead>Offline Payments (₹)</TableHead>
                <TableHead>Platform Fees (₹)</TableHead>
                <TableHead>Service Tax (₹)</TableHead>
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
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error fetching completed bookings report:", error);
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading completed bookings report data. Please try again later.
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
  if (vendorBookingsData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Online Appointments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offline Appointments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Platform Fees (₹)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Service Tax (₹)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'completed_bookings_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'completed_bookings_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'completed_bookings_report')}>
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
          vendors={vendors}
          showVendorFilter={true}
          initialFilters={filters}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Online Appointments</TableHead>
                <TableHead>Offline Appointments</TableHead>
                <TableHead>Online Payments (₹)</TableHead>
                <TableHead>Offline Payments (₹)</TableHead>
                <TableHead>Platform Fees (₹)</TableHead>
                <TableHead>Service Tax (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No completed bookings data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'completed_bookings_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'completed_bookings_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'completed_bookings_report')}>
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
        vendors={vendors}
        showVendorFilter={true}
        initialFilters={filters}
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Online Appointments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedTotals?.onlineBookings || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offline Appointments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedTotals?.offlineBookings || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Fees (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalPlatformFees || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Online Appointments</TableHead>
              <TableHead>Offline Appointments</TableHead>
              <TableHead>Online Payments (₹)</TableHead>
              <TableHead>Offline Payments (₹)</TableHead>
              <TableHead>Platform Fees (₹)</TableHead>
              <TableHead>Service Tax (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((vendorData: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{vendorData.vendor}</TableCell>
                <TableCell>{vendorData.city}</TableCell>
                <TableCell>{vendorData.totalBookings}</TableCell>
                <TableCell>{vendorData.onlineBookings}</TableCell>
                <TableCell>{vendorData.offlineBookings}</TableCell>
                <TableCell>₹{vendorData.onlinePayments.toFixed(2)}</TableCell>
                <TableCell>₹{vendorData.offlinePayments.toFixed(2)}</TableCell>
                <TableCell>₹{vendorData.totalPlatformFees.toFixed(2)}</TableCell>
                <TableCell>₹{vendorData.totalServiceTax.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (item.totalBookings || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (item.onlineBookings || 0), 0)}</TableCell>
                <TableCell>{paginatedData.reduce((sum: number, item: any) => sum + (item.offlineBookings || 0), 0)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.onlinePayments || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.offlinePayments || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.totalPlatformFees || 0), 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => sum + (item.totalServiceTax || 0), 0).toFixed(2)}</TableCell>
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

// Component to display Sales by Salon report data in a table


// Component for Report Detail Modal
const ReportDetailModal = ({ isOpen, onClose, report }: { isOpen: boolean; onClose: () => void; report: Report | null }) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>
            {report.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {report.details}
          </p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component for Selling Services report dialog
const SellingServicesReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'selling_services_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selling Services</DialogTitle>
          <DialogDescription>
            Overview of services sold and their performance metrics.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SellingServicesReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component for Total Bookings report dialog
const TotalBookingsReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'total_bookings_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Total Bookings</DialogTitle>
          <DialogDescription>
            Overview of all bookings made on the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <TotalBookingsReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component for Completed Bookings report dialog
const CompletedBookingsReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'completed_bookings_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completed Bookings Report</DialogTitle>
          <DialogDescription>
            Overview of successfully completed bookings.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <CompletedBookingsReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component for Cancellation report dialog
const CancellationReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'cancellations_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancellations Report</DialogTitle>
          <DialogDescription>
            Overview of cancelled appointments by vendor.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <CancellationReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component to display Consolidated Sales Report data in a table
const ConsolidatedSalesReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch consolidated sales report data with filters
  const apiFilters = filters;
  
  console.log("Consolidated Sales Report API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetConsolidatedSalesReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Consolidated Sales Report filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const salesData = data?.salesReport || [];
  const cities = data?.cities || []; // Get cities from the data
  const aggregatedTotals = data?.aggregatedTotals;
  
  // Store complete list of business names
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);
  
  // Extract business names from data when there are no filters applied
  // This assumes that when no filters are applied, we get the complete dataset
  useEffect(() => {
    // Only update the complete list if no filters are applied or if the list is empty
    if ((Object.keys(apiFilters).length === 0 || allBusinessNames.length === 0) && salesData.length > 0) {
      const nameMap: { [key: string]: boolean } = {};
      const names: string[] = [];
      
      salesData.forEach((item: any) => {
        const name = item['Business Name'];
        if (name && name !== 'N/A' && !nameMap[name]) {
          nameMap[name] = true;
          names.push(name);
        }
      });
      setAllBusinessNames(names);
    }
  }, [salesData, apiFilters, allBusinessNames.length]);
  
  // Use the complete list for filter options
  const businessNames = allBusinessNames;
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return salesData;
    
    return salesData.filter((sale: any) =>
      Object.values(sale).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [salesData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div>
        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">          {[...Array(6)].map((_, i) => (
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
        
        <div className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Service Amount (₹)</TableHead>
                <TableHead>Total Product Amount (₹)</TableHead>
                <TableHead>Product Platform Fee (₹)</TableHead>
                <TableHead>Service Platform Fees (₹)</TableHead>
                <TableHead>Subscription Amount (₹)</TableHead>
                <TableHead>SMS Amount (₹)</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error fetching consolidated sales report:", error);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading consolidated sales report data. Please try again later.
        {/* Display error details in development */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-2 text-sm text-gray-500">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
      </div>
    );
  }
  
  // Show table structure even when there's no data
  if (salesData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
              <CardTitle className="text-sm font-medium">Total Service Amount</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Product Amount</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Platform Fees</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscription Amount</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SMS Amount</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'consolidated_sales_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'consolidated_sales_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'consolidated_sales_report')}>
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
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Total Service Amount (₹)</TableHead>
                <TableHead>Total Product Amount (₹)</TableHead>
                <TableHead>Product Platform Fee (₹)</TableHead>
                <TableHead>Service Platform Fees (₹)</TableHead>
                <TableHead>Subscription Amount (₹)</TableHead>
                <TableHead>SMS Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No consolidated sales report data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'consolidated_sales_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'consolidated_sales_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'consolidated_sales_report')}>
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
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Service Platform Fees (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalPlatformFees || 0).toFixed(2)}
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
            <CardTitle className="text-sm font-medium">Total Subscription Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.subscriptionAmount || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.smsAmount || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Service Amount (₹)</TableHead>
              <TableHead>Total Product Amount (₹)</TableHead>
              <TableHead>Product Platform Fee (₹)</TableHead>
              <TableHead>Service Platform Fees (₹)</TableHead>
              <TableHead>Subscription Amount (₹)</TableHead>
              <TableHead>SMS Amount (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((vendor: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{vendor["Business Name"]}</TableCell>
                <TableCell>{vendor.Type}</TableCell>
                <TableCell>{vendor.City}</TableCell>
                <TableCell>{vendor["Total Service Amount (₹)"]}</TableCell>
                <TableCell>{vendor["Total Product Amount (₹)"]}</TableCell>
                <TableCell>{vendor["Product Platform Fee (₹)"]}</TableCell>
                <TableCell>{vendor["Service Platform Fees (₹)"]}</TableCell>
                <TableCell>{vendor["Subscription Amount (₹)"]}</TableCell>
                <TableCell>{vendor["SMS Amount (₹)"]}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from "Total Service Amount (₹)" field
                  const rawValue = item["Total Service Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from "Total Product Amount (₹)" field
                  const rawValue = item["Total Product Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from "Product Platform Fee (₹)" field
                  const rawValue = item["Product Platform Fee (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from "Service Platform Fees (₹)" field
                  const rawValue = item["Service Platform Fees (₹)"] || '0';
                  // If the value is '-', treat it as 0 for total calculation
                  if (rawValue === '-') {
                    return sum + 0;
                  }
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from "Subscription Amount (₹)" field
                  const rawValue = item["Subscription Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from "SMS Amount (₹)" field
                  const rawValue = item["SMS Amount (₹)"] || '0';
                  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString().replace(/[₹,]/g, '')) || 0;
                  return sum + numericValue;
                }, 0).toFixed(2)}</TableCell>
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

// Component for Consolidated Sales Report dialog
const ConsolidatedSalesReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'consolidated_sales_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consolidated Sales Report</DialogTitle>
          <DialogDescription>
            Complete overview of total platform revenue across vendors and suppliers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <ConsolidatedSalesReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component to display Sales by Product report data in a table
const SalesByProductReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch sales by product report data with filters
  const apiFilters = filters;
  
  console.log("Sales by Product API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetSalesByProductsReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Sales by Product filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // For the Sales by Product report, we need to adapt the data structure
  // We'll use the salesBySalon data but treat it as salesByProducts
  const salesData = data?.salesBySalon || data?.salesByProducts || [];
  const cities = data?.cities || []; // Get cities from the data
  const categories = data?.categories || []; // Get categories from the data
  const brands = data?.brands || []; // Get brands from the data
  const aggregatedTotals = data?.aggregatedTotals;
  
  // Store complete lists of filter options
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  
  // Extract filter options from data - always populate complete lists from API response
  useEffect(() => {
    // Always populate the complete lists from API response data to ensure filter options remain available
    // even when filters result in no data
    if (cities.length > 0) {
      setAllCities(cities);
    }
    
    if (categories.length > 0) {
      setAllCategories(categories);
    }
    
    if (brands.length > 0) {
      setAllBrands(brands);
    }
    
    // Also extract business names from sales data
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
  
  // Use the complete list for filter options
  const businessNames = allBusinessNames;
  
  // Format the data to match our expected structure
  const formattedData = salesData.map((item: any) => ({
    product: item.productName || item.product || item.businessName || item._id,
    category: item.category || 'Unknown Category', // Add category
    brand: item.brand || 'Unknown Brand', // Add brand
    vendor: item.vendorName || item.businessName || item.vendor || 'Unknown Vendor',
    city: item.vendorCity || item.city || 'Unknown City',
    sale: item.sale || `₹${(item.totalRevenue || item.revenue || 0).toFixed(2)}`,
    productSold: item.productSold || item.totalQuantity || item.quantity || 0,
    productPlatformFee: item.productPlatformFee || 0,
    productGST: item.productGST || 0,
    onlineSales: item.onlineSales || 0,
    offlineSales: item.offlineSales || 0,
    type: item.type || 'Vendor' // Add type field
  }));
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return formattedData;
    
    return formattedData.filter((product: any) =>
      Object.values(product).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [formattedData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
    console.error("Error fetching sales by product report:", error);
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
  if (formattedData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_product_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_product_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_product_report')}>
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
          cities={allCities}
          categories={allCategories}
          brands={allBrands}
          businessNames={businessNames}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_product_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_product_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_product_report')}>
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
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        
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
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell>TOTAL</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: any) => {
                  // Extract numeric value from sale string (e.g., "₹700.00" -> 700.00)
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

// Component for Sales by Product report dialog
const SalesByProductReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'sales_by_product_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales by Product</DialogTitle>
          <DialogDescription>
            Revenue breakdown by individual products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SalesByProductReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component to display Sales by Brand report data in a table
const SalesByBrandReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch sales by brand report data with filters
  const apiFilters = filters;
  
  console.log("Sales by Brand API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetSalesByBrandReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Sales by Brand filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // For the Sales by Brand report, we need to adapt the data structure
  const salesData = data?.salesByBrand || [];
  const cities = data?.cities || []; // Get cities from the data
  const businessNames = data?.businessNames || []; // Get business names from the API response
  const brands = data?.brands || []; // Get brands from the API response
  const aggregatedTotals = data?.aggregatedTotals;
  
  // Store complete list of business names
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>(businessNames);
  
  // Format the data to match our expected structure
  const formattedData: SalesByBrandData[] = salesData.map((item: any) => ({
    brandName: item.brandName || item._id,
    totalQuantitySold: item.totalQuantitySold || 0,
    totalRevenue: item.totalRevenue || '₹0.00'
  }));
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return formattedData;
    
    return formattedData.filter((brand: SalesByBrandData) => 
      Object.values(brand).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [formattedData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
                <TableHead>Brand Name</TableHead>
                <TableHead>Total Quantity Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
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
    console.error("Error fetching sales by brand report:", error);
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading sales by brand report data. Please try again later.
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
  if (formattedData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (₹)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity Sold</CardTitle>
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_brand_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_brand_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_brand_report')}>
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
          businessNames={allBusinessNames}
          brands={brands}
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
          showCategoryFilter={false}
          showBrandFilter={true}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Total Quantity Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No sales by brand data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_brand_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_brand_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_brand_report')}>
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
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedTotals?.totalQuantitySold || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Total Quantity Sold</TableHead>
              <TableHead>Total Revenue (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((brand: SalesByBrandData, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{brand.brandName}</TableCell>
                <TableCell>{brand.totalQuantitySold}</TableCell>
                <TableCell>{brand.totalRevenue}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (parseInt(item.totalQuantitySold) || 0), 0)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum, item: any) => sum + (parseFloat(item.totalRevenue.replace('₹', '')) || 0), 0).toFixed(2)}</TableCell>
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

// Component for Sales by Brand report dialog
const SalesByBrandReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'sales_by_brand_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales by Brand</DialogTitle>
          <DialogDescription>
            Aggregated product sales by brand.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SalesByBrandReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component to display Sales by Category report data in a table
const SalesByCategoryReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch sales by category report data with filters
  const apiFilters = filters;
  
  console.log("Sales by Category API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetSalesByCategoryReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Sales by Category filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // For the Sales by Category report, we need to adapt the data structure
  const salesData = data?.salesByCategory || [];
  const cities = data?.cities || []; // Get cities from the data
  const businessNames = data?.businessNames || []; // Get business names from the API response
  const aggregatedTotals = data?.aggregatedTotals;
  
  // Store complete list of business names
  const [allBusinessNames, setAllBusinessNames] = useState<string[]>(businessNames);
  
  // Format the data to match our expected structure
  const formattedData: SalesByCategoryData[] = salesData.map((item: any) => ({
    categoryName: item.categoryName || item._id,
    totalQuantitySold: item.totalQuantitySold || 0,
    totalRevenue: item.totalRevenue || '₹0.00'
  }));
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return formattedData;
    
    return formattedData.filter((category: SalesByCategoryData) => 
      Object.values(category).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [formattedData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
                <TableHead>Category Name</TableHead>
                <TableHead>Total Quantity Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
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
    console.error("Error fetching sales by category report:", error);
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading sales by category report data. Please try again later.
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
  if (formattedData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (₹)</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity Sold</CardTitle>
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_category_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_category_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_category_report')}>
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
          initialFilters={filters}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
          showCategoryFilter={true}
          showBrandFilter={false}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Total Quantity Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No sales by category data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'sales_by_category_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'sales_by_category_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'sales_by_category_report')}>
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
        initialFilters={filters}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (₹)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(aggregatedTotals?.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedTotals?.totalQuantitySold || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Total Quantity Sold</TableHead>
              <TableHead>Total Revenue (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((category: any, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{category.categoryName}</TableCell>
                <TableCell>{category.totalQuantitySold}</TableCell>
                <TableCell>{category.totalRevenue}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Totals Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell>TOTAL</TableCell>
                <TableCell>{paginatedData.reduce((sum, item: any) => sum + (parseInt(item.totalQuantitySold) || 0), 0)}</TableCell>
                <TableCell>₹{paginatedData.reduce((sum, item: any) => sum + (parseFloat(item.totalRevenue.replace('₹', '')) || 0), 0).toFixed(2)}</TableCell>
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

// Component for Sales by Category report dialog
const SalesByCategoryReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'sales_by_category_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales by Category</DialogTitle>
          <DialogDescription>
            Aggregated product sales by category.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SalesByCategoryReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component to display Subscription Report data in a table
const SubscriptionReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch subscription report data with filters
  const apiFilters = filters;
  
  console.log("Subscription Report API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetSubscriptionReportQuery(apiFilters);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Subscription Report filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Define data variables after API call
  const subscriptionData: SubscriptionData[] = (data?.subscriptions || []) as SubscriptionData[];
  const cities = data?.cities || []; // Get cities from API response
  
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
  
  // Filter data based on search term
  const filteredData = useMemo((): SubscriptionData[] => {
    if (!searchTerm) return subscriptionData;
    
    return subscriptionData.filter((subscription: SubscriptionData) => 
      Object.values(subscription).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [subscriptionData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
  
  const totalSubscriptions = data?.totalSubscriptions || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const activePlans = data?.activePlans || 0;
  const inactivePlans = data?.inactivePlans || 0;
  
  // Calculate total price of all subscriptions
  const totalPrice = subscriptionData.reduce((sum: number, subscription: any) => sum + subscription.price, 0);
  
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
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
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
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {activePlans}
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
              {inactivePlans}
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.planStatus === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.planStatus}
                  </span>
                </TableCell>
                <TableCell>{subscription.paymentMode}</TableCell>
              </TableRow>
            ))}
            {/* Current Page Total Price Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={7}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: SubscriptionData) => sum + (item.price || 0), 0).toFixed(2)}</TableCell>
                <TableCell colSpan={2}></TableCell>
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

// Component to display Marketing Campaign Report data in a table
const MarketingCampaignReportTable = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 entries by default
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook to fetch marketing campaign report data with filters
  const apiFilters = filters;
  
  console.log("Marketing Campaign Report API filters:", apiFilters);
  
  const { data, isLoading, isError, error } = useGetMarketingCampaignReportQuery(apiFilters);
  
  // Extract data
  const campaignData = data?.campaigns || [];
  const cities = data?.cities || [];
  const apiPackageNames = data?.packageNames || [];
  
  // Use business names and package names from API response
  const businessNames = data?.businessNames || [];
  const packageNames = data?.packageNames || [];
  
  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Marketing Campaign Report filter change:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return campaignData;
    
    return campaignData.filter((campaign: CampaignData) => 
      Object.values(campaign).some((value: any) => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [campaignData, searchTerm]);
  
  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Package Name</TableHead>
                <TableHead>SMS Count</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Ticket Raised</TableHead>
                <TableHead>Status</TableHead>
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
                <TableCell colSpan={5}><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error fetching marketing campaign report:", error);
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="p-4 text-center text-red-500">
          Error loading marketing campaign report data. Please try again later.
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
  if (campaignData.length === 0) {
    return (
      <div>
        {/* Summary Cards - show with 0 values when no data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
              {packageNames.length}
            </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Packages</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
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
                <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'marketing_campaign_report')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'marketing_campaign_report')}>
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'marketing_campaign_report')}>
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
          packageNames={packageNames}
          initialFilters={filters}
          showStatusFilter={true}
          showBookingTypeFilter={false}
          showUserTypeFilter={true}
          showBusinessNameFilter={true}
          showPackageNameFilter={true}
        />
        
        <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Package Name</TableHead>
                <TableHead>SMS Count</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Ticket Raised</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No marketing campaign data available.
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
              <DropdownMenuItem onClick={() => exportToExcel(tableRef, 'marketing_campaign_report')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(tableRef, 'marketing_campaign_report')}>
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(tableRef, 'marketing_campaign_report')}>
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
        packageNames={packageNames}
        initialFilters={filters}
        showStatusFilter={true}
        showBookingTypeFilter={false}
        showUserTypeFilter={true}
        showBusinessNameFilter={true}
        showPackageNameFilter={true}
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{campaignData.reduce((sum: number, campaign: any) => sum + (campaign.price || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packageNames.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignData.filter((campaign: any) => campaign.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Packages</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignData.filter((campaign: any) => campaign.status === 'expired').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto no-scrollbar rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Package Name</TableHead>
              <TableHead>SMS Count</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Ticket Raised</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((campaign: CampaignData, index: number) => (
              <TableRow key={startIndex + index}>
                <TableCell className="font-medium">{campaign.vendor}</TableCell>
                <TableCell>{campaign.type}</TableCell>
                <TableCell>{campaign.city}</TableCell>
                <TableCell>{campaign.packageName}</TableCell>
                <TableCell>{campaign.smsCount}</TableCell>
                <TableCell>₹{campaign.price.toFixed(2)}</TableCell>
                <TableCell>{new Date(campaign.purchaseDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(campaign.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>{campaign.ticketRaised}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : campaign.status === 'expired'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {/* Current Page Total Price Row */}
            {paginatedData.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell colSpan={5}>TOTAL</TableCell>
                <TableCell>₹{paginatedData.reduce((sum: number, item: CampaignData) => sum + (item.price || 0), 0).toFixed(2)}</TableCell>
                <TableCell colSpan={4}></TableCell>
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

// Component for Marketing Campaign report dialog
const MarketingCampaignReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'marketing_campaign_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Marketing Campaign Report</DialogTitle>
          <DialogDescription>
            Performance metrics for all marketing campaigns.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <MarketingCampaignReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Component for Subscription report dialog
const SubscriptionReportDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleExport = (format: string) => {
    const fileName = 'subscription_report';
    switch (format) {
      case 'excel':
        exportToExcel(tableRef, fileName);
        break;
      case 'csv':
        exportToCSV(tableRef, fileName);
        break;
      case 'pdf':
        exportToPDF(tableRef, fileName);
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscription Report</DialogTitle>
          <DialogDescription>
            Track purchases, renewals, expiries, and overall subscription revenue.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div ref={tableRef}>
            <SubscriptionReportTable />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state for skeleton demo
  const [isSellingServicesDialogOpen, setIsSellingServicesDialogOpen] = useState(false);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);
  const [isTotalBookingsDialogOpen, setIsTotalBookingsDialogOpen] = useState(false);
  const [isCompletedBookingsDialogOpen, setIsCompletedBookingsDialogOpen] = useState(false);
  const [isSalesByProductDialogOpen, setIsSalesByProductDialogOpen] = useState(false);
  const [isConsolidatedSalesReportDialogOpen, setIsConsolidatedSalesReportDialogOpen] = useState(false);
  const [isSubscriptionReportDialogOpen, setIsSubscriptionReportDialogOpen] = useState(false);
  const [isMarketingCampaignReportDialogOpen, setIsMarketingCampaignReportDialogOpen] = useState(false);
  const [isSalesByBrandReportDialogOpen, setIsSalesByBrandReportDialogOpen] = useState(false);
  const [isSalesByCategoryReportDialogOpen, setIsSalesByCategoryReportDialogOpen] = useState(false);
  
  const handleViewClick = (report: Report) => {
    setSelectedReport(report);
    
    // Special handling for Selling Services report
    if (report.title === "Sales by Services") {
      setIsSellingServicesDialogOpen(true);
    } 
    // Special handling for Cancellation report
    else if (report.title === "Cancellations") {
      setIsCancellationDialogOpen(true);
    }
    // Special handling for Total Bookings report
    else if (report.title === "Total Bookings") {
      setIsTotalBookingsDialogOpen(true);
    }
    // Special handling for Completed Bookings report
    else if (report.title === "Completed Bookings") {
      setIsCompletedBookingsDialogOpen(true);
    }
    // Special handling for Sales by Product report
    else if (report.title === "Sales by Product") {
      setIsSalesByProductDialogOpen(true);
    }
    // Special handling for Consolidated Sales Report
    else if (report.title === "Sales Report") {
      setIsConsolidatedSalesReportDialogOpen(true);
    }
    // Special handling for Subscription Report
    else if (report.title === "Subscription Report") {
      setIsSubscriptionReportDialogOpen(true);
    }
    // Special handling for Marketing Campaign Report
    else if (report.title === "Marketing Campaign Report") {
      setIsMarketingCampaignReportDialogOpen(true);
    }
    // Special handling for Sales by Brand Report
    else if (report.title === "Sales by Brand") {
      setIsSalesByBrandReportDialogOpen(true);
    }
    // Special handling for Sales by Category Report
    else if (report.title === "Sales by Category") {
      setIsSalesByCategoryReportDialogOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };
  
  const filteredReportsData = useMemo(() => {
    if (!searchTerm) return reportsData;

    return reportsData
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
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="relative mt-4 md:mt-0">
            <Skeleton className="h-10 w-80" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports sections skeleton */}
        <div className="space-y-10">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, cardIndex) => (
                  <Card key={cardIndex} className="flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-24" />
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your business.
          </p>
        </div>
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reports grid */}
      <div className="space-y-8">
        {filteredReportsData.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-lg font-semibold mb-4">{category.category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.reports.map((report, reportIndex) => (
                <Card 
                  key={reportIndex} 
                  className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                  onClick={() => handleViewClick(report)}
                >
                  <CardHeader>
                    <CardTitle>
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      {report.details}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-[45%]">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-[55%] bg-blue-50 hover:bg-blue-100">
                      <Download className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Download</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      <ReportDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        report={selectedReport} 
      />

      {/* Report Dialogs */}
      <SellingServicesReportDialog 
        isOpen={isSellingServicesDialogOpen} 
        onClose={() => setIsSellingServicesDialogOpen(false)} 
      />
      
      <CancellationReportDialog 
        isOpen={isCancellationDialogOpen} 
        onClose={() => setIsCancellationDialogOpen(false)} 
      />
      
      <TotalBookingsReportDialog 
        isOpen={isTotalBookingsDialogOpen} 
        onClose={() => setIsTotalBookingsDialogOpen(false)} 
      />
      
      <CompletedBookingsReportDialog 
        isOpen={isCompletedBookingsDialogOpen} 
        onClose={() => setIsCompletedBookingsDialogOpen(false)} 
      />
      
      <SalesByProductReportDialog 
        isOpen={isSalesByProductDialogOpen} 
        onClose={() => setIsSalesByProductDialogOpen(false)} 
      />
      
      <ConsolidatedSalesReportDialog 
        isOpen={isConsolidatedSalesReportDialogOpen} 
        onClose={() => setIsConsolidatedSalesReportDialogOpen(false)} 
      />
      
      <SubscriptionReportDialog 
        isOpen={isSubscriptionReportDialogOpen} 
        onClose={() => setIsSubscriptionReportDialogOpen(false)} 
      />
      
      <MarketingCampaignReportDialog 
        isOpen={isMarketingCampaignReportDialogOpen} 
        onClose={() => setIsMarketingCampaignReportDialogOpen(false)} 
      />
      
      <SalesByBrandReportDialog 
        isOpen={isSalesByBrandReportDialogOpen} 
        onClose={() => setIsSalesByBrandReportDialogOpen(false)} 
      />
      
      <SalesByCategoryReportDialog 
        isOpen={isSalesByCategoryReportDialogOpen} 
        onClose={() => setIsSalesByCategoryReportDialogOpen(false)} 
      />
      
      {/* Unified Filter Modal Component */}
      {/* Placeholder for FilterModal - instances are rendered where needed */}
      <div style={{ display: 'none' }}>
        <FilterModal 
          isOpen={false}
          onClose={() => {}}
          onApplyFilters={() => {}}
          cities={[]}
          initialFilters={{}}
          showStatusFilter={false}
          showBookingTypeFilter={true}
          showUserTypeFilter={false}
        />
      </div>
    </div>
  );
}