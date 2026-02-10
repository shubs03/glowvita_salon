"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Input } from '@repo/ui/input';
import { FilterParams } from '../types';

interface DateRangeFilterProps {
  onFilterChange: (filters: FilterParams) => void;
  cities?: string[];
  showStatusFilter?: boolean;
  showBookingTypeFilter?: boolean;
  showUserTypeFilter?: boolean;
}

export const DateRangeFilter = ({ 
  onFilterChange,
  cities = [],
  showStatusFilter = false,
  showBookingTypeFilter = true,
  showUserTypeFilter = false
}: DateRangeFilterProps) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saleType, setSaleType] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [userType, setUserType] = useState<string>('all');

  const handleApplyFilters = () => {
    const filters = { startDate, endDate, saleType, city, status, userType };
    console.log("Applying filters:", filters);
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSaleType('all');
    setCity('all');
    setStatus('all');
    setUserType('all');
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
