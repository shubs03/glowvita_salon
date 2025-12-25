"use client"

import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

interface ServiceData {
  service: string;
  vendor: string;
  city: string;
  totalServiceAmount: string;
  rawTotalServiceAmount: number;
  itemsSold: number;
  platformFee: string | null;
  rawPlatformFee: number;
  serviceTax: string | null;
  rawServiceTax: number;
}

export function SalesOfServicesChart({ servicesData, filterType, filterValue }: { servicesData?: ServiceData[], filterType?: string, filterValue?: string }) {
  // Format the data for the chart - aggregate services data
  const chartData = servicesData?.map((service: ServiceData) => ({
    name: service.service,
    value: service.rawPlatformFee, // Use platform fee instead of total service amount
    bookings: service.itemsSold,
    totalSale: service.rawTotalServiceAmount // Keep total sale for reference
  })) || [];

  // Check if we have services data
  const hasServices = chartData.length > 0;
  
  // Show message when filter is selected but no value chosen
  if (filterType && !filterValue) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center p-4">
          <div className="text-lg font-medium">Please select a {filterType} to view service sales data.</div>
          <div className="text-sm text-gray-500 mt-2">
            Select a specific {filterType} value to see the service sales chart.
          </div>
        </div>
      </div>
    );
  }
  
  if (!hasServices) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center p-4">
          <div className="text-lg font-medium">No service data available yet.</div>
          <div className="text-sm text-gray-500 mt-2">
            Services data will appear once appointments are completed.
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip to show detailed service information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-4 rounded-md shadow-md">
          <p className="font-bold text-lg">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Service Platform Fee:</span> ₹{data.value.toLocaleString('en-IN')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Total Service Amount:</span> ₹{data.totalSale?.toLocaleString('en-IN') || '0.00'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Total Bookings:</span> {data.bookings}
          </p>
        </div>
      );
    }
    return null;
  };

  // Truncate long names for better display
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
          tickFormatter={(value) => truncateName(value, 15)}
          interval={0}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="value" 
          name="Service Platform Fee (₹)"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}