'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { useState } from "react";

interface CitySalesData {
  city: string;
  totalBusinesses: number;
  servicePlatformFees: number;
  productPlatformFees: number;
  subscriptionAmount: number;
  smsAmount: number;
  totalRevenue: number;
}

interface CityWiseSalesTableProps {
  data: CitySalesData[];
  isLoading?: boolean;
  filterType?: string;
  filterValue?: string;
}

export function CityWiseSalesTable({ data, isLoading, filterType, filterValue }: CityWiseSalesTableProps) {
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 5;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CityWise Sales</CardTitle>
          <CardDescription>Loading city-wise sales data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filterType && !filterValue) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CityWise Sales</CardTitle>
          <CardDescription>Please select a {filterType} to view city-wise sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">
              Select a specific {filterType} value to see the city-wise sales data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const displayData = data && data.length > itemsPerPage && !showAll 
    ? data.slice(0, itemsPerPage) 
    : data || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>CityWise Sales</CardTitle>
            <CardDescription>Detailed breakdown of sales by city</CardDescription>
          </div>
          {data && data.length > itemsPerPage && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">City</TableHead>
                <TableHead className="whitespace-nowrap">Total Businesses</TableHead>
                <TableHead className="whitespace-nowrap">Service Platform Fees (₹)</TableHead>
                <TableHead className="whitespace-nowrap">Product Platform Fees (₹)</TableHead>
                <TableHead className="whitespace-nowrap">Subscription Amount (₹)</TableHead>
                <TableHead className="whitespace-nowrap">SMS Amount (₹)</TableHead>
                <TableHead className="whitespace-nowrap">Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData && displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.city}</TableCell>
                    <TableCell>{item.totalBusinesses}</TableCell>
                    <TableCell>{formatCurrency(item.servicePlatformFees)}</TableCell>
                    <TableCell>{formatCurrency(item.productPlatformFees)}</TableCell>
                    <TableCell>{formatCurrency(item.subscriptionAmount)}</TableCell>
                    <TableCell>{formatCurrency(item.smsAmount)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(item.totalRevenue)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No city-wise sales data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}