"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--secondary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--secondary) / 0.6)",
];

interface BusinessBreakdownProps {
  data: {
    serviceAmount: number;
    productAmount: number;
    platformFees: number;
    taxes: number;
    subscriptionAmount: number;
    smsAmount: number;
  };
}

export function BusinessBreakdownChart({ data }: BusinessBreakdownProps) {
  const chartData = [
    { name: 'Services', value: data.serviceAmount },
    { name: 'Products', value: data.productAmount },
    { name: 'Platform Fees', value: data.platformFees },
    { name: 'Taxes', value: data.taxes },
    { name: 'Subscriptions', value: data.subscriptionAmount },
    { name: 'SMS', value: data.smsAmount },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-foreground mb-1">{entry.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Amount:</span> ₹{entry.value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No business data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
