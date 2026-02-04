"use client";

import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Eye, Download, Scissors, Package } from "lucide-react";
import { Billing, BillingItem } from './types';
import { formatDate, formatCurrency } from './utils';

interface BillingTableProps {
  billings: Billing[];
  onViewInvoice: (billing: Billing) => void;
  onDownloadInvoice: (billing: Billing) => void;
}

// Get item type for display
const getItemTypeDisplay = (itemType: 'Service' | 'Product') => {
  return itemType === 'Service' ? (
    <span className="inline-flex items-center text-blue-600">
      <Scissors className="w-4 h-4 mr-1" />
      Service
    </span>
  ) : (
    <span className="inline-flex items-center text-green-600">
      <Package className="w-4 h-4 mr-1" />
      Product
    </span>
  );
};

export default function BillingTable({ billings, onViewInvoice, onDownloadInvoice }: BillingTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto rounded-2xl border border-border/50 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <Table>
            <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
              <TableRow className="border-border/50">
                <TableHead className="font-semibold w-32">Invoice No</TableHead>
                <TableHead className="font-semibold w-28">Date</TableHead>
                <TableHead className="font-semibold w-40">Client</TableHead>
                <TableHead className="font-semibold w-32">Phone</TableHead>
                <TableHead className="font-semibold w-64">Items</TableHead>
                <TableHead className="font-semibold w-32">Paid By</TableHead>
                <TableHead className="font-semibold w-32">Billing Type</TableHead>
                <TableHead className="text-right font-semibold w-28">Amount</TableHead>
                <TableHead className="text-right font-semibold w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <div>No billing records found</div>
                    <div className="text-sm mt-1">Try adjusting your filters</div>
                  </TableCell>
                </TableRow>
              ) : (
                billings.map((billing: Billing, index) => (
                  <TableRow
                    key={billing._id}
                    className="hover:bg-muted/30 transition-colors border-border/30"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="w-32">
                      <div className="font-medium line-clamp-1" title={billing.invoiceNumber}>{billing.invoiceNumber}</div>
                    </TableCell>
                    <TableCell className="w-28">
                      <div className="line-clamp-1" title={formatDate(billing.createdAt)}>{formatDate(billing.createdAt)}</div>
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="font-medium line-clamp-1" title={billing.clientInfo.fullName}>{billing.clientInfo.fullName}</div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="text-sm line-clamp-1" title={billing.clientInfo.phone}>{billing.clientInfo.phone}</div>
                    </TableCell>
                    <TableCell className="w-64">
                      <div className="space-y-1" title={billing.items.map(item => `${item.itemType}: ${item.name} (x${item.quantity})`).join(', ')}>
                        {billing.items.slice(0, 2).map((item: BillingItem, index: number) => (
                          <div key={index} className="text-sm flex items-center line-clamp-1">
                            <span className="inline-flex items-center text-sm flex-shrink-0">
                              {getItemTypeDisplay(item.itemType)}
                            </span>
                            <span className="ml-1 truncate">: {item.name}</span>
                            <span className="ml-2 text-sm flex-shrink-0">(x{item.quantity})</span>
                          </div>
                        ))}
                        {billing.items.length > 2 && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            +{billing.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="text-sm line-clamp-1" title={billing.paymentMethod}>{billing.paymentMethod}</div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="text-sm line-clamp-1" title={billing.billingType}>{billing.billingType}</div>
                    </TableCell>
                    <TableCell className="text-right w-28">
                      <div className="font-medium">{formatCurrency(billing.totalAmount)}</div>
                    </TableCell>
                    <TableCell className="text-right w-24">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewInvoice(billing)}
                          className="rounded-lg hover:bg-primary/10 hover:border-primary/30 h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadInvoice(billing)}
                          className="rounded-lg hover:bg-primary/10 hover:border-primary/30 h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 scrollbar-hide overflow-y-auto">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {billings.map((billing: Billing, index) => (
          <Card
            key={billing._id}
            className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/20"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-0">
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm font-bold text-primary">{billing.invoiceNumber}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(billing.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-2 py-1 rounded-full text-xs font-medium">
                    {billing.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                {/* Client Info */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{billing.clientInfo.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {billing.clientInfo.phone}
                    </p>
                  </div>
                </div>

                {/* Items and Price */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Billing Type:</span>
                    <span className="font-medium">{billing.billingType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid By:</span>
                    <span className="font-medium">{billing.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{billing.items.length}</span>
                  </div>
                  {/* Display individual items */}
                  <div className="space-y-1">
                    {billing.items.slice(0, 2).map((item: BillingItem, index: number) => (
                      <div key={index} className="text-sm flex items-center">
                        <span className="inline-flex items-center text-sm">
                          {getItemTypeDisplay(item.itemType)}
                        </span>
                        <span className="ml-1">: {item.name}</span>
                        <span className="ml-2 text-sm">(x{item.quantity})</span>
                      </div>
                    ))}
                    {billing.items.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{billing.items.length - 2} more items
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span>{billing.paymentStatus}</span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-border/20">
                  <div>
                    <p className="text-xl font-bold text-primary">₹{billing.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewInvoice(billing)}
                      className="rounded-lg"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadInvoice(billing)}
                      className="rounded-lg"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
