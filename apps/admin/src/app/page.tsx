
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
// import { DollarSign, Users, CreditCard, Activity, ShoppingCart, UserX } from 'lucide-react';
import { FaDollarSign, FaUsers, FaCreditCard, FaShoppingCart } from "react-icons/fa";
import {FiUsers, FiActivity} from "react-icons/fi";
import { SalesChart } from "@/components/charts/SalesChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { SalesBySalonChart } from "@/components/charts/SalesBySalonChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";

const cancelledBookings = [
  { id: 'BK1023', customer: 'Alex Johnson', salon: 'Modern Cuts', date: '2023-10-28', amount: '$45.00' },
  { id: 'BK1021', customer: 'Maria Garcia', salon: 'Glamour Salon', date: '2023-10-27', amount: '$120.00' },
  { id: 'BK1019', customer: 'David Smith', salon: 'The Barber Shop', date: '2023-10-27', amount: '$35.00' },
  { id: 'BK1015', customer: 'Emily White', salon: 'Style Hub', date: '2023-10-26', amount: '$75.00' },
];

export default function AdminPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <FaDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <FaShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <FaUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vendors
            </CardTitle>
            <FiActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +2 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>A summary of your sales for the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue By Month</CardTitle>
            <CardDescription>Your revenue generated per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Sales by Salon</CardTitle>
                <CardDescription>A breakdown of sales by individual salon.</CardDescription>
            </CardHeader>
            <CardContent>
                <SalesBySalonChart />
            </CardContent>
        </Card>
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Recent Cancellations</CardTitle>
                <CardDescription>An overview of recently cancelled bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Salon</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cancelledBookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>
                            <div className="font-medium">{booking.customer}</div>
                            <div className="text-sm text-muted-foreground">{booking.id}</div>
                            </TableCell>
                            <TableCell>{booking.salon}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell className="text-right">{booking.amount}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
