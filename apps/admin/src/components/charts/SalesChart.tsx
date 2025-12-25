"use client"

import { useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useGetAdminDashboardStatsQuery } from '@repo/store/api';

export function SalesChart({ filterType, filterValue }: { filterType?: string, filterValue?: string }) {
  const { data: dashboardData, isLoading, isError } = useGetAdminDashboardStatsQuery({
    filterType,
    filterValue
  });

  // Format the data for the chart
  const chartData = dashboardData?.revenueByMonth?.map((item: any) => ({
    name: item.name,
    sales: item.revenue,
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div>Loading sales data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div>Error loading sales data. Please try again later.</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
          cursor={{ fill: 'hsl(var(--secondary))' }}
          formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend iconType="circle" />
        <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}