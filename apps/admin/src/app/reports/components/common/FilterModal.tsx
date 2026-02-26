"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Input } from '@repo/ui/input';
import { FilterParams } from '../types';

interface FilterModalProps {
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
}

export const FilterModal = ({
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
}: FilterModalProps) => {
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
                    <SelectItem value="doctor">Doctor</SelectItem>
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
