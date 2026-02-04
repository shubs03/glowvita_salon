"use client";

import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Label } from "@repo/ui/label";
import { Button } from "@repo/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Search, Calendar, Scissors, Package } from "lucide-react";

interface FilterSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (value: string) => void;
  selectedItemType: 'all' | 'Service' | 'Product';
  setSelectedItemType: (value: 'all' | 'Service' | 'Product') => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  clearDateFilters: () => void;
  paymentMethods: string[];
  activeTab: string;
}

export default function FilterSection({
  searchTerm,
  setSearchTerm,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  selectedItemType,
  setSelectedItemType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  clearDateFilters,
  paymentMethods,
  activeTab
}: FilterSectionProps) {
  return (
    <CardHeader className="pb-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div>
          <CardTitle className="text-2xl mb-2">
            {activeTab === "billing" ? "Billing Records" : "Appointment Invoices"}
          </CardTitle>
          <CardDescription className="text-base">
            {activeTab === "billing"
              ? "Filter billing records by various criteria"
              : "Filter appointment invoices by various criteria"}
          </CardDescription>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices, clients..."
              className="w-full lg:w-80 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="All Payment Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              {paymentMethods.map((method: string) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {activeTab === 'billing' && (
            <Select value={selectedItemType} onValueChange={(value) => setSelectedItemType(value as any)}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="All Item Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Item Types</SelectItem>
                <SelectItem value="Service">
                  <div className="flex items-center">
                    <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                    Services
                  </div>
                </SelectItem>
                <SelectItem value="Product">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-green-600" />
                    Products
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      {/* Date Range Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              id="startDate"
              type="date"
              placeholder="Start Date"
              className="w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              id="endDate"
              type="date"
              placeholder="End Date"
              className="w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        {(startDate || endDate) && (
          <Button variant="outline" onClick={clearDateFilters} className="self-end mb-1">
            Clear Dates
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
