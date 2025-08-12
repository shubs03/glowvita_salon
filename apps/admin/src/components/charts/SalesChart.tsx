
"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
  { name: "Jan", sales: 4000, },
  { name: "Feb", sales: 3000, },
  { name: "Mar", sales: 2000, },
  { name: "Apr", sales: 2780, },
  { name: "May", sales: 1890, },
  { name: "Jun", sales: 2390, },
  { name: "Jul", sales: 3490, },
  { name: "Aug", sales: 2490, },
  { name: "Sep", sales: 3190, },
  { name: "Oct", sales: 2890, },
  { name: "Nov", sales: 3990, },
  { name: "Dec", sales: 4300, },
];

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            cursor={{ fill: 'hsl(var(--secondary))' }}
        />
        <Legend iconType="circle" />
        <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
