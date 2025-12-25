"use client"

import { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetAdminDashboardStatsQuery } from '@repo/store/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export function SalesBySalonChart({ filterType, filterValue }: { filterType?: string, filterValue?: string }) {
  const { data: dashboardData, isLoading, isError } = useGetAdminDashboardStatsQuery({
    filterType,
    filterValue
  });
  
  // Debugging: log the raw data
  useEffect(() => {
    if (dashboardData) {
      console.log('Dashboard Data:', dashboardData);
    }
  }, [dashboardData]);
  
  // Format the data for the chart - include all vendors, even those with zero revenue
  const chartData = dashboardData?.salesBySalon?.map((salon: any) => ({
    name: salon.businessName,
    value: salon.totalRevenue,
    profit: salon.totalProfit,
    bookings: salon.totalBookings,
    onlineBookings: salon.onlineBookings,
    offlineBookings: salon.offlineBookings,
    cancelledBookings: salon.cancelledBookings
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

  // Check if we have vendors - improved check
  const totalVendors = dashboardData?.totalVendors?.current || 0;
  const hasVendors = totalVendors > 0;
  
  // Debugging: log vendor count
  console.log('Total Vendors:', totalVendors, 'Has Vendors:', hasVendors);
  
  if (!hasVendors) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center p-4">
          <div className="text-lg font-medium">No vendors registered yet.</div>
          <div className="text-sm text-gray-500 mt-2">
            Sales data will appear once vendors are added.
          </div>
        </div>
      </div>
    );
  }

  // If we have vendors but no sales data, show a message
  if (!chartData.length && hasVendors) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center p-4">
          <div className="text-lg font-medium">No sales data available yet.</div>
          <div className="text-sm text-gray-500 mt-2">
            Complete appointments to see sales data here.
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip to show detailed salon information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-4 rounded-md shadow-md">
          <p className="font-bold text-lg">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Revenue:</span> ₹{data.value.toLocaleString('en-IN')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Profit:</span> ₹{data.profit.toLocaleString('en-IN')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Total Bookings:</span> {data.bookings}
          </p>
          <p className="text-sm ml-4">
            - Online: {data.onlineBookings}
          </p>
          <p className="text-sm ml-4">
            - Offline: {data.offlineBookings}
          </p>
          <p className="text-sm ml-4">
            - Cancelled: {data.cancelledBookings}
          </p>
        </div>
      );
    }
    return null;
  };

  // Truncate long names for the legend
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
            data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100} // Reduced radius to give more space for labels
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${truncateName(name, 15)} ${(percent * 100).toFixed(0)}%`} // Truncate names in labels
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle" 
          layout="horizontal" // Changed to horizontal layout
          align="center"
          verticalAlign="bottom"
          wrapperStyle={{ paddingTop: '20px' }}
          payload={chartData.map((entry: any, index: number) => ({
            id: entry.name,
            type: 'circle',
            value: `${truncateName(entry.name, 25)} (₹${entry.value.toLocaleString('en-IN')} revenue)`, // Truncate names in legend
            color: COLORS[index % COLORS.length]
          }))}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}