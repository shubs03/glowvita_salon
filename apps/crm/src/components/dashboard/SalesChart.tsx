
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
  { name: "Jan", sales: 4000, },
  { name: "Feb", sales: 3000, },
  { name: "Mar", sales: 2000, },
  { name: "Apr", sales: 2780, },
  { name: "May", sales: 1890, },
  { name: "Jun", sales: 2390, },
  { name: "Jul", sales: 3490, },
];

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>A summary of your sales for the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
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
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                cursor={{ fill: 'hsl(var(--secondary))' }}
            />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
