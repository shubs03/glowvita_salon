"use client"

import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
];

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
    value: service.rawTotalServiceAmount, // Use total service amount instead of platform fee
    bookings: service.itemsSold,
    platformFee: service.rawPlatformFee // Keep platform fee for reference
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
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-foreground mb-1">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Sale:</span> ₹{data.value.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Platform Fee:</span> ₹{data.platformFee?.toLocaleString('en-IN') || '0.00'}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Bookings:</span> {data.bookings}
            </p>
          </div>
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
    <ResponsiveContainer width="100%" height={350} className="min-w-max">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 20,
          right: 30,
          left: 60,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} vertical={true} />
        <XAxis
          type="number"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
          tickFormatter={(value) => truncateName(value, 15)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '30px' }} />
        <Bar 
          dataKey="value" 
          name="Sale (₹)"
          radius={[0, 4, 4, 0]}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}