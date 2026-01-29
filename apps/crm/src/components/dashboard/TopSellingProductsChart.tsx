"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useGetSalesByProductReportQuery } from "@repo/store/services/api";

interface TopProductData {
  productName: string;
  quantitySold: number;
  totalSales: number;
}

interface TopSellingProductsChartProps {
  filterType?: 'preset' | 'custom';
  presetPeriod?: 'day' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
  // Hierarchical date filter props - Updated to accept both null and undefined
  selectedYear?: number | null | undefined;
  selectedMonth?: number | null | undefined; // 0-11 representing Jan-Dec
  selectedDay?: number | null | undefined;
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

export function TopSellingProductsChart({ 
  filterType = 'preset', 
  presetPeriod = 'all', 
  startDate = '', 
  endDate = '',
  selectedYear,
  selectedMonth,
  selectedDay
}: TopSellingProductsChartProps) {
  // Prepare query parameters for RTK Query
  // If hierarchical filtering is active, build date range from selected values
  let queryParams: any = {
    period: filterType === 'custom' ? 'custom' : presetPeriod,
  };

  // Use hierarchical dates if provided, otherwise use standard date range
  if (selectedYear != null) {
    if (selectedMonth != null) {
      if (selectedDay != null) {
        // Specific day selected: YYYY-MM-DD to YYYY-MM-DD
        const start = new Date(selectedYear, selectedMonth, selectedDay);
        const end = new Date(selectedYear, selectedMonth, selectedDay);
        queryParams.startDate = start.toISOString().split('T')[0];
        queryParams.endDate = end.toISOString().split('T')[0];
      } else {
        // Month selected: YYYY-MM-01 to YYYY-MM-lastDay
        const start = new Date(selectedYear, selectedMonth, 1);
        const end = new Date(selectedYear, selectedMonth + 1, 0);
        queryParams.startDate = start.toISOString().split('T')[0];
        queryParams.endDate = end.toISOString().split('T')[0];
      }
    } else {
      // Year selected: YYYY-01-01 to YYYY-12-31
      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31);
      queryParams.startDate = start.toISOString().split('T')[0];
      queryParams.endDate = end.toISOString().split('T')[0];
    }
  } else if (filterType === 'custom' && startDate && endDate) {
    // Use standard date range if no hierarchical filtering
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
  }

  // Use RTK Query to fetch data
  const { data: apiResponse, isLoading, isError } = useGetSalesByProductReportQuery(queryParams);

  // Process the data to get top 5 products
  let topProducts: TopProductData[] = [];
  
  if (apiResponse?.success && apiResponse.data?.salesByProduct) {
    topProducts = apiResponse.data.salesByProduct
      .sort((a: any, b: any) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Based on delivered products and sales data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-destructive">
            Failed to load product data
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculation
  const totalQuantity = topProducts.reduce((sum, item) => sum + item.quantitySold, 0);

  // Format data with explicit percentages for display
  const formattedData = topProducts.map(item => ({
    ...item,
    percentage: totalQuantity > 0 ? (item.quantitySold / totalQuantity) * 100 : 0
  }));

  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-foreground">{data.productName}</p>
          <p className="text-sm text-muted-foreground">Quantity Sold: {data.quantitySold}</p>
          <p className="text-sm text-muted-foreground">Total Sales: ₹{data.totalSales.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>
          {filterType === 'custom' 
            ? `Top selling products from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`
            : presetPeriod === 'day' 
              ? "Top selling products today."
              : presetPeriod === 'month' 
                ? "Top selling products this month."
                : presetPeriod === 'year' ? "Top selling products this year."
                  : "Top selling products. All time."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="productName" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey="quantitySold" 
                label={{ value: 'Quantity Sold', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="quantitySold" 
                name="Quantity Sold" 
                fill="hsl(var(--primary))" 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No product sales data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}