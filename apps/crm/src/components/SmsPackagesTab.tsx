'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  IndianRupee
} from 'lucide-react';
import { useGetSmsPurchaseHistoryQuery } from '@repo/store/services/api';
import { toast } from 'sonner';

interface PurchaseHistory {
  _id: string;
  packageName: string;
  smsCount: number;
  price: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
}

export function SmsPackagesTab() {
  const [page, setPage] = useState(1);
  const { 
    data: purchaseHistoryData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGetSmsPurchaseHistoryQuery({ page, limit: 5 });

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load SMS purchase history');
      console.error('SMS Purchase History Error:', error);
    }
  }, [isError, error]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1 inline" /> Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1 inline" /> Expired</Badge>;
      case 'used':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1 inline" /> Used</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 capitalize">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const currentBalance = purchaseHistoryData?.data?.currentBalance || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>SMS Packages</CardTitle>
            <CardDescription>Manage your SMS credits and purchase history</CardDescription>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{currentBalance.toLocaleString()} SMS</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Purchase History</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <p className="text-red-500">Failed to load purchase history</p>
                <Button onClick={() => refetch()} className="mt-2">Retry</Button>
              </div>
            ) : purchaseHistoryData?.data?.purchases && purchaseHistoryData.data.purchases.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Package</TableHead>
                        <TableHead>SMS Count</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistoryData.data.purchases.map((purchase: PurchaseHistory) => (
                        <TableRow key={purchase._id}>
                          <TableCell className="font-medium">{purchase.packageName}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
                              {purchase.smsCount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                              {purchase.price.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              {formatDate(purchase.expiryDate)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {purchaseHistoryData.data.pagination && purchaseHistoryData.data.pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {purchaseHistoryData.data.pagination.page} of {purchaseHistoryData.data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.min(prev + 1, purchaseHistoryData.data.pagination.totalPages))}
                      disabled={page === purchaseHistoryData.data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No purchases yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You haven't purchased any SMS packages yet.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/marketing/message-blast'}>
                  Buy SMS Packages
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}