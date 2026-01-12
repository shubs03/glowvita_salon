"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c", "#d0ed57"];

interface TopServiceData {
  service: string;
  serviceSold: number;
  totalSales: number;
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
  const [data, setData] = useState<TopServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopServices = async () => {
      try {
        // Build query params based on filter parameters
        let url = '/api/crm/vendor/reports/sales-by-service';
        const params = new URLSearchParams();
        
        // Handle custom date range
        if (filterType === 'custom' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        } 
        // Handle preset periods
        else if (presetPeriod && presetPeriod !== 'all') {
          params.append('period', presetPeriod);
        }
        
        // Always filter for completed status for sales reports
        params.append('status', 'completed');
        
        // Append query parameters if any exist
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.salesByService) {
            // Get top 5 services by total sales
            const topServices = result.data.salesByService
              .sort((a: any, b: any) => b.totalSales - a.totalSales)
              .slice(0, 5);
            setData(topServices);
          }
        }
      } catch (error) {
        console.error('Error fetching top services:', error);
        // Fallback to mock data on error
        setData([
          { service: 'Haircut', serviceSold: 4, totalSales: 800 },
          { service: 'Manicure', serviceSold: 3, totalSales: 600 },
          { service: 'Facial', serviceSold: 3, totalSales: 900 },
          { service: 'Spa', serviceSold: 2, totalSales: 1200 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopServices();
  }, [filterType, presetPeriod, startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
          <CardDescription>Based on completed appointments and sales data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculation
  const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);

  // Format data with explicit percentages for display
  const formattedData = data.map(item => ({
    ...item,
    percentage: totalSales > 0 ? (item.totalSales / totalSales) * 100 : 0
  }));

  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-semibold">{data.service}</p>
          <p>Services Sold: {data.serviceSold}</p>
          <p>Total Sales: ₹{data.totalSales.toFixed(2)}</p>
          <p>Percentage: {data.percentage.toFixed(1)}%</p>
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
                fill="#8884d8"
                dataKey="totalSales"
                nameKey="service"
                label={({ service, percentage }) => `${service}: ${percentage.toFixed(0)}%`}
              >
                {formattedData.map((entry, index) => (
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