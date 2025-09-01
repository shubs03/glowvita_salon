
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, FileDown } from 'lucide-react';
import Image from 'next/image';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

type Order = {
  id: string;
  productImage: string;
  productName: string;
  customerName: string;
  date: string;
  price: number;
  quantity: number;
  status: OrderStatus;
};

const mockOrders: Order[] = [
  { id: 'ORD-001', productImage: 'https://placehold.co/400x400.png', productName: 'Organic Face Serum', customerName: 'Alice Johnson', date: '2024-08-25', price: 85.00, quantity: 1, status: 'Delivered' },
  { id: 'ORD-002', productImage: 'https://placehold.co/400x400.png', productName: 'Matte Lipstick', customerName: 'Bob Williams', date: '2024-08-24', price: 25.00, quantity: 2, status: 'Shipped' },
  { id: 'ORD-003', productImage: 'https://placehold.co/400x400.png', productName: 'Keratin Shampoo', customerName: 'Charlie Brown', date: '2024-08-23', price: 45.00, quantity: 1, status: 'Processing' },
  { id: 'ORD-004', productImage: 'https://placehold.co/400x400.png', productName: 'Professional Hair Dryer', customerName: 'Diana Prince', date: '2024-08-22', price: 120.00, quantity: 1, status: 'Pending' },
  { id: 'ORD-005', productImage: 'https://placehold.co/400x400.png', productName: 'Nail Art Kit', customerName: 'Ethan Hunt', date: '2024-08-21', price: 60.00, quantity: 1, status: 'Cancelled' },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order =>
      (order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || order.status === statusFilter)
    );
  }, [searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredOrders.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Product Orders</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Track and manage all product orders.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="w-full md:w-64 pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image src={order.productImage} alt={order.productName} width={40} height={40} className="rounded-md" />
                        <span className="font-medium">{order.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>₹{(order.price * order.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            className="mt-4"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredOrders.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
