"use client"

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useGetConsolidatedSalesReportQuery } from '@repo/store/api';

export function RevenueChart({ filterType, filterValue }: { filterType?: string, filterValue?: string }) {
  // For yearly filter, we need to fetch data for each month
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  
  const { data: salesReportData, isLoading, isError } = useGetConsolidatedSalesReportQuery({
    filterType,
    filterValue
  });

  // Format data for the bar chart based on filter type
  let chartData = [];
  
  // Calculate total revenue from aggregated totals
  const calculateTotalRevenue = (aggregatedTotals: any) => {
    return (aggregatedTotals?.totalPlatformFees || 0) + 
           (aggregatedTotals?.subscriptionAmount || 0) + 
           (aggregatedTotals?.smsAmount || 0) +
           (aggregatedTotals?.totalServiceAmount || 0) +
           (aggregatedTotals?.totalProductAmount || 0);
  };
  
  // Fetch monthly data when year filter is selected
  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (filterType === 'year' && filterValue) {
        setIsLoadingMonthly(true);
        const monthlyChartData = [];
        
        // Create an array of month names
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        // Array to hold all the promises
        const promises = [];
        
        // Create a function to fetch data for a specific month
        const fetchMonthData = async (month: number) => {
          const monthStr = month.toString().padStart(2, '0');
          const monthQueryParam = `${filterValue}-${monthStr}`;
          
          // Make a direct fetch request to the API
          try {
            const response = await fetch(`/api/admin/reports/Financial-Reports/salesreport?filterType=month&filterValue=${monthQueryParam}`);
            const result = await response.json();
            
            if (result.success && result.data?.aggregatedTotals) {
              return {
                name: monthNames[month - 1],
                revenue: calculateTotalRevenue(result.data.aggregatedTotals)
              };
            } else {
              return {
                name: monthNames[month - 1],
                revenue: 0
              };
            }
          } catch (error) {
            console.error(`Error fetching data for ${filterValue}-${monthStr}:`, error);
            return {
              name: monthNames[month - 1],
              revenue: 0
            };
          }
        };
        
        // Create promises for all months
        for (let month = 1; month <= 12; month++) {
          promises.push(fetchMonthData(month));
        }
        
        // Wait for all promises to resolve
        try {
          const results = await Promise.all(promises);
          setMonthlyData(results);
        } catch (error) {
          console.error('Error fetching monthly data:', error);
          // Fallback to empty data
          const fallbackData = monthNames.map((name, index) => ({
            name,
            revenue: 0
          }));
          setMonthlyData(fallbackData);
        }
        
        setIsLoadingMonthly(false);
      }
    };
    
    fetchMonthlyData();
  }, [filterType, filterValue]);
  
  if (filterType === 'year' && filterValue) {
    // For yearly filter, show monthly breakdown
    // Use the monthly data we fetched
    chartData = monthlyData.length > 0 ? monthlyData : [
      { name: 'Jan', revenue: 0 },
      { name: 'Feb', revenue: 0 },
      { name: 'Mar', revenue: 0 },
      { name: 'Apr', revenue: 0 },
      { name: 'May', revenue: 0 },
      { name: 'Jun', revenue: 0 },
      { name: 'Jul', revenue: 0 },
      { name: 'Aug', revenue: 0 },
      { name: 'Sep', revenue: 0 },
      { name: 'Oct', revenue: 0 },
      { name: 'Nov', revenue: 0 },
      { name: 'Dec', revenue: 0 }
    ];
  } else if (salesReportData?.data?.aggregatedTotals) {
    if (filterType === 'month' && filterValue) {
      // For monthly filter, show that specific month
      chartData = [{
        name: `Month ${salesReportData.data.filter || filterValue || 'Selected Month'}`,
        revenue: calculateTotalRevenue(salesReportData.data.aggregatedTotals)
      }];
    } else if (filterType === 'day' && filterValue) {
      // For daily filter, show that specific day
      chartData = [{
        name: `Day ${salesReportData.data.filter || filterValue || 'Selected Day'}`,
        revenue: calculateTotalRevenue(salesReportData.data.aggregatedTotals)
      }];
    } else {
      // For other filters or no filter, show the aggregated data
      chartData = [{
        name: salesReportData.data.filter || 'All Time',
        revenue: calculateTotalRevenue(salesReportData.data.aggregatedTotals)
      }];
    }
  }

  // Show loading state
  if (isLoading || isLoadingMonthly) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div>Loading current period data...</div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div>Error loading current period data. Please try again later.</div>
      </div>
    );
  }

  // If no data, show a message
  if ((!salesReportData?.aggregatedTotals || !salesReportData.data) && monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center">
          <div className="text-lg font-medium">No revenue data available</div>
          <div className="text-sm text-gray-500 mt-2">Revenue data will appear as transactions are completed</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="number"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
          cursor={{ fill: 'hsl(var(--secondary))' }}
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
          labelFormatter={(label) => `Period: ${label}`}
        />
        <Legend iconType="circle" />
        <Bar 
          dataKey="revenue" 
          name="Total Revenue" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}