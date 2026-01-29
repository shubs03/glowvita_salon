"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface SalesData {
  name: string;
  sales: number;
  appointments: number;
}

interface SalesChartProps {
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

export function SalesChart({ 
  filterType = 'preset', 
  presetPeriod = 'all', 
  startDate = '', 
  endDate = '' 
}: SalesChartProps) {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // Build query params based on filter parameters
        let url = '/api/crm/vendor/metrics/sales';
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
        
        // Append query parameters if any exist
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Fallback to mock data on error
        setData([
          { name: "Jan", sales: 4000, appointments: 24 },
          { name: "Feb", sales: 3000, appointments: 13 },
          { name: "Mar", sales: 2000, appointments: 8 },
          { name: "Apr", sales: 2780, appointments: 19 },
          { name: "May", sales: 1890, appointments: 12 },
          { name: "Jun", sales: 2390, appointments: 15 },
          { name: "Jul", sales: 3490, appointments: 21 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [filterType, presetPeriod, startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>A summary of your sales for the last 7 months.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>
          {filterType === 'custom' 
            ? `A summary of your sales from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`
            : presetPeriod === 'day' 
              ? "A summary of your sales for today."
              : presetPeriod === 'month' 
                ? "A summary of your sales for this month."
                : presetPeriod === 'year' 
                  ? "A summary of your sales for this year."
                  : "A summary of your sales for the last 7 months."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                cursor={{ fill: 'hsl(var(--secondary)/0.1)', stroke: 'hsl(var(--border))' }}
                formatter={(value, name) => {
                  if (name === 'sales') {
                    return [`₹${Number(value).toLocaleString()}`, 'Sales'];
                  }
                  return [value, name === 'appointments' ? 'Appointments' : name];
                }}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4, fill: 'hsl(var(--background))' }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--primary)/0.1)' }}
                name="Sales (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No sales data available
          </div>
        )}
      </CardContent>
    </Card>
  );

}
