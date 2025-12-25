"use client";

import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@repo/ui/select";
import { Button } from "@repo/ui/button";
import { Calendar } from 'lucide-react';

interface DynamicDateFilterProps {
  filterType: 'preset' | 'custom';
  presetPeriod: 'day' | 'month' | 'year' | 'all';
  startDate: string;
  endDate: string;
  onFilterChange: (filterType: 'preset' | 'custom', presetPeriod?: 'day' | 'month' | 'year' | 'all', startDate?: string, endDate?: string) => void;
}

export function DynamicDateFilter({ 
  filterType: initialFilterType, 
  presetPeriod: initialPresetPeriod, 
  startDate: initialStartDate, 
  endDate: initialEndDate,
  onFilterChange 
}: DynamicDateFilterProps) {
  const [filterType, setFilterType] = useState<'preset' | 'custom'>(initialFilterType);
  const [presetPeriod, setPresetPeriod] = useState<'day' | 'month' | 'year' | 'all'>(initialPresetPeriod);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>(initialStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(initialEndDate);

  // Update local state when props change
  useEffect(() => {
    setFilterType(initialFilterType);
    setPresetPeriod(initialPresetPeriod);
    setCustomStartDate(initialStartDate);
    setCustomEndDate(initialEndDate);
    
    // Set the appropriate date values based on the current filter
    if (initialPresetPeriod === 'day' && initialStartDate === initialEndDate && initialStartDate) {
      setSelectedDate(initialStartDate);
    } else if (initialPresetPeriod === 'month' && initialStartDate && initialEndDate) {
      // Extract month from start date (assuming it's the first day of the month)
      const date = new Date(initialStartDate);
      setSelectedMonth((date.getMonth() + 1).toString().padStart(2, '0'));
    } else if (initialPresetPeriod === 'year' && initialStartDate && initialEndDate) {
      // Extract year from start date (assuming it's January 1st)
      const date = new Date(initialStartDate);
      setSelectedYear(date.getFullYear().toString());
    }
  }, [initialFilterType, initialPresetPeriod, initialStartDate, initialEndDate]);

  const handleFilterTypeChange = (value: 'preset' | 'custom') => {
    setFilterType(value);
    // Reset all date selections when changing filter type
    setSelectedDate('');
    setSelectedMonth('');
    setSelectedYear('');
    setCustomStartDate('');
    setCustomEndDate('');
    
    if (value === 'preset') {
      onFilterChange('preset', presetPeriod);
    } else {
      onFilterChange('custom');
    }
  };

  const handlePresetPeriodChange = (value: 'day' | 'month' | 'year' | 'all') => {
    setPresetPeriod(value);
    // Reset date selections when changing period
    setSelectedDate('');
    setSelectedMonth('');
    setSelectedYear('');
    
    if (value === 'all') {
      onFilterChange('preset', value);
    }
  };

  const handleApplyPresetFilter = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentDate.getDate().toString().padStart(2, '0');
    const todayFormatted = `${currentYear}-${currentMonth}-${currentDay}`;
    
    if (presetPeriod === 'day') {
      // If no date selected, use today
      const dateToUse = selectedDate || todayFormatted;
      // For a specific day, both start and end date should be the same
      onFilterChange('custom', undefined, dateToUse, dateToUse);
    } else if (presetPeriod === 'month' && selectedMonth) {
      // Get first and last day of selected month
      const year = selectedYear || currentYear.toString();
      const month = selectedMonth.padStart(2, '0');
      const firstDay = `${year}-${month}-01`;
      // Get last day of the month
      const lastDay = new Date(parseInt(year), parseInt(selectedMonth), 0).toISOString().split('T')[0];
      onFilterChange('custom', undefined, firstDay, lastDay);
    } else if (presetPeriod === 'year' && selectedYear) {
      const firstDay = `${selectedYear}-01-01`;
      const lastDay = `${selectedYear}-12-31`;
      onFilterChange('custom', undefined, firstDay, lastDay);
    } else if (presetPeriod === 'all') {
      // For all time, we don't need specific dates
      onFilterChange('preset', 'all');
    }
  };

  const handleApplyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      onFilterChange('custom', undefined, customStartDate, customEndDate);
    }
  };

  const getCurrentYear = () => new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => getCurrentYear() - i);

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Type Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Filter Type</label>
          <Select value={filterType} onValueChange={handleFilterTypeChange}>
            <SelectTrigger className="w-[180px]" aria-label="Filter type selection">
              <SelectValue placeholder="Select filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preset">Preset Period</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filterType === 'preset' ? (
          <>
            {/* Preset Period Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Period</label>
              <Select value={presetPeriod} onValueChange={handlePresetPeriodChange}>
                <SelectTrigger className="w-[180px]" aria-label="Preset period selection">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional Date Pickers Based on Period Selection */}
            {presetPeriod === 'day' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="selectedDate" className="text-sm font-medium text-gray-700">Select Date</label>
                <div className="relative">
                  <input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select specific date"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            )}

            {presetPeriod === 'month' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="selectedMonth">Select Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]" aria-label="Month selection">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                          {new Date(2023, month - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="selectedYearMonth">Select Year</label>
                  <Select value={selectedYear || getCurrentYear().toString()} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[180px]" aria-label="Year selection for month">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {presetPeriod === 'year' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="selectedYear">Select Year</label>
                <Select value={selectedYear || getCurrentYear().toString()} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]" aria-label="Year selection">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(presetPeriod === 'day' || presetPeriod === 'month' || presetPeriod === 'year' || presetPeriod === 'all') && (
              <div className="flex items-end">
                <Button 
                  onClick={handleApplyPresetFilter}
                  disabled={
                    (presetPeriod === 'day' && !selectedDate) ||
                    (presetPeriod === 'month' && !selectedMonth) ||
                    (presetPeriod === 'year' && !selectedYear)
                  }
                  aria-label="Apply preset filter"
                >
                  Apply
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Custom Date Range Selection */}
            <div className="flex flex-col gap-2">
              <label htmlFor="customStartDate" className="text-sm font-medium text-gray-700">From Date</label>
              <div className="relative">
                <input
                  id="customStartDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Custom start date"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="customEndDate" className="text-sm font-medium text-gray-700">To Date</label>
              <div className="relative">
                <input
                  id="customEndDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Custom end date"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleApplyCustomFilter}
                disabled={!customStartDate || !customEndDate}
                aria-label="Apply custom date range filter"
              >
                Apply
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}