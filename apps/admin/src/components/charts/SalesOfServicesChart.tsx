"use client"

import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

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
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
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
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="value" 
          name="Sale (₹)"
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