
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { DollarSign, ShoppingCart, Users, CreditCard } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
];

const recentSales = [
    { id: 'ORD-001', product: 'Organic Face Serum', amount: 85.00, customer: 'Alice J.' },
    { id: 'ORD-002', product: 'Matte Lipstick', amount: 25.00, customer: 'Bob W.' },
    { id: 'ORD-003', product: 'Keratin Shampoo', amount: 45.00, customer: 'Charlie B.' },
];

export default function SalesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Sales Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+52</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹120.50</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>A look at your sales over the past months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesData}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{ fill: 'hsl(var(--secondary))' }}/>
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your most recent product sales.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto no-scrollbar rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>
                                        <div className="font-medium">{sale.product}</div>
                                        <div className="text-sm text-muted-foreground">{sale.customer}</div>
                                    </TableCell>
                                    <TableCell className="text-right">₹{sale.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
