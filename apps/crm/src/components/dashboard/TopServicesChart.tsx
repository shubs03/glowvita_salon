"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useGetSummaryByServiceReportQuery } from "@repo/store/api";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-10))",
];

interface TopServiceData {
  service?: string;
  serviceName?: string;
  serviceSold?: number;
  count?: number;
  totalSales?: number;
  totalAmount?: number;
  bookingCount?: number;
}

interface TopServicesChartProps {
  filterType?: 'preset' | 'custom';
  presetPeriod?: 'day' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

// Helper function to format date for display
const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export function TopServicesChart({ 
  filterType = 'preset', 
  presetPeriod = 'all', 
  startDate = '', 
  endDate = '' 
}: TopServicesChartProps) {
  // Use RTK Query to fetch summary by service report
  const { data: reportData, isLoading, isError, error } = useGetSummaryByServiceReportQuery({
    period: filterType === 'preset' ? presetPeriod : 'custom',
    startDate: filterType === 'custom' && startDate ? new Date(startDate) : undefined,
    endDate: filterType === 'custom' && endDate ? new Date(endDate) : undefined,
    status: 'completed', // Always filter for completed status for reports
  });

  // Extract and format the summary by service data
  // The summary report might have different property names, try common variations
  const rawData = reportData?.summaryByService || 
                  reportData?.data?.summaryByService ||
                  reportData?.serviceSummary || 
                  reportData?.services || 
                  (Array.isArray(reportData?.data) ? reportData.data : []) || 
                  [];
  
  // Ensure rawData is an array before sorting
  const dataArray = Array.isArray(rawData) ? rawData : [];
  
  // Get top 5 services by usage count (count, bookingCount, or serviceSold)
  const data = [...dataArray]
    .sort((a: TopServiceData, b: TopServiceData) => {
      // Prioritize count or booking count to represent "mostly used"
      const aCount = a.count || a.bookingCount || a.serviceSold || a.totalAmount || a.totalSales || 0;
      const bCount = b.count || b.bookingCount || b.serviceSold || b.totalAmount || b.totalSales || 0;
      return bCount - aCount;
    })
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
          <CardDescription>Based on completed appointments and booking counts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
          <CardDescription>Based on completed appointments and booking counts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-destructive">
            <div className="text-center">
              <p>Error loading data</p>
              <p className="text-sm mt-2">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculation
  const totalValue = data.reduce((sum: number, item: TopServiceData) => {
    return sum + (item.count || item.bookingCount || item.serviceSold || item.totalAmount || item.totalSales || 0);
  }, 0);

  // Format data with explicit percentages for display and a consistent chartValue for Recharts
  const formattedData = data.map((item: TopServiceData) => {
    const value = item.count || item.bookingCount || item.serviceSold || item.totalAmount || item.totalSales || 0;
    const name = item.serviceName || item.service || 'Unknown Service';
    return {
      ...item,
      normalizedService: name,
      chartValue: value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    };
  });

  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Determine the primary metric to display
      const isCountBased = data.count || data.bookingCount || data.serviceSold;
      const primaryMetric = data.chartValue;
      const metricLabel = data.count ? 'Usage Count' : data.bookingCount ? 'Bookings' : 
                         data.serviceSold ? 'Services Sold' : 'Total Sales';
      const currencyPrefix = isCountBased ? '' : '₹';
      
      const salesMetric = data.totalAmount || data.totalSales || 0;
      
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-foreground">{data.normalizedService}</p>
          <p className="text-sm text-muted-foreground">{metricLabel}: {currencyPrefix}{primaryMetric.toFixed(isCountBased ? 0 : 2)}</p>
          {salesMetric > 0 && (
            <p className="text-sm text-muted-foreground">Sales Amount: ₹{salesMetric.toFixed(2)}</p>
          )}
          <p className="text-sm text-muted-foreground">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Services</CardTitle>
        <CardDescription>
          {filterType === 'custom' 
            ? `Top services from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`
            : presetPeriod === 'day' 
              ? "Top services today."
              : presetPeriod === 'month' 
                ? "Top services this month."
                : presetPeriod === 'year' ? "Top services this year."
                  : "Top services. All time."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="hsl(var(--primary))"
                dataKey="chartValue"
                nameKey="normalizedService"
                label={({ normalizedService, percentage }) => `${normalizedService}: ${percentage.toFixed(0)}%`}
              >
                {formattedData.map((entry: TopServiceData, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No service data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}