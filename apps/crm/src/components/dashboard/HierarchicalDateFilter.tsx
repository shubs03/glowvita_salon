'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";

interface HierarchicalDateFilterProps {
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void; // 0-11 representing Jan-Dec
  onDayChange: (day: number | null) => void;
  selectedYear: number | null;
  selectedMonth: number | null;
  selectedDay: number | null;
}

export function HierarchicalDateFilter({
  onYearChange,
  onMonthChange,
  onDayChange,
  selectedYear,
  selectedMonth,
  selectedDay
}: HierarchicalDateFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i + i); // Last 10 years

  // Months array (0-11)
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  // Days array (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Reset month and day when year changes
  useEffect(() => {
    if (selectedYear === null) {
      onMonthChange(null);
      onDayChange(null);
    }
  }, [selectedYear, onMonthChange, onDayChange]);

  // Reset day when month changes
  useEffect(() => {
    if (selectedMonth === null) {
      onDayChange(null);
    }
  }, [selectedMonth, onDayChange]);

  // Get number of days in the selected month/year
  const getMaxDaysInMonth = () => {
    if (selectedYear === null || selectedMonth === null) return 31;
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };

  const filteredDays = Array.from({ length: getMaxDaysInMonth() }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Year</label>
        <Select 
          value={selectedYear?.toString() || ''} 
          onValueChange={(value) => onYearChange(value ? parseInt(value) : null)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Month</label>
        <Select 
          value={selectedMonth?.toString() || ''} 
          onValueChange={(value) => onMonthChange(value ? parseInt(value) : null)}
          disabled={selectedYear === null}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map(month => (
              <SelectItem 
                key={month.value} 
                value={month.value.toString()}
              >
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Day</label>
        <Select 
          value={selectedDay?.toString() || ''} 
          onValueChange={(value) => onDayChange(value ? parseInt(value) : null)}
          disabled={selectedYear === null || selectedMonth === null}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Day" />
          </SelectTrigger>
          <SelectContent>
            {filteredDays.map(day => (
              <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}