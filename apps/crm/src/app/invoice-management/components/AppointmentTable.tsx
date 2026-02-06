"use client";

import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Eye, Download, Scissors } from "lucide-react";
import { formatDate, formatCurrency } from './utils';

interface AppointmentTableProps {
  appointments: any[];
  onViewInvoice: (appointment: any) => void;
  onDownloadInvoice: (appointment: any) => void;
}

export default function AppointmentTable({ 
  appointments, 
  onViewInvoice, 
  onDownloadInvoice 
}: AppointmentTableProps) {
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
                <TableHead className="font-semibold w-64">Services</TableHead>
                <TableHead className="font-semibold w-32">Paid By</TableHead>
                <TableHead className="font-semibold w-32">Status</TableHead>
                <TableHead className="text-right font-semibold w-28">Amount</TableHead>
                <TableHead className="text-right font-semibold w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <div>No appointment invoices found</div>
                    <div className="text-sm mt-1">Try adjusting your filters</div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((app: any, index) => (
                  <TableRow
                    key={app._id}
                    className="hover:bg-muted/30 transition-colors border-border/30"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="w-32">
                      <div className="font-medium line-clamp-1" title={app.invoiceNumber || "N/A"}>{app.invoiceNumber || "N/A"}</div>
                    </TableCell>
                    <TableCell className="w-28">
                      <div className="line-clamp-1" title={`${formatDate(app.date)} ${app.startTime}`}>{formatDate(app.date)}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {app.startTime}
                      </div>
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="font-medium line-clamp-1" title={app.clientName || app.client?.fullName}>{app.clientName || app.client?.fullName}</div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="text-sm line-clamp-1" title={app.clientPhone || app.client?.phone}>{app.clientPhone || app.client?.phone}</div>
                    </TableCell>
                    <TableCell className="w-64">
                      <div className="space-y-1" title={app.serviceItems?.map((item: any) => item.serviceName).join(', ') || app.serviceName || 'No services'}>
                        {app.serviceItems && app.serviceItems.length > 0 ? (
                          <>
                            {app.serviceItems.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="text-sm flex items-center line-clamp-1">
                                <Scissors className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0" />
                                <span className="truncate">{item.serviceName}</span>
                              </div>
                            ))}
                            {app.serviceItems.length > 2 && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                +{app.serviceItems.length - 2} more services
                              </div>
                            )}
                          </>
                        ) : app.serviceName ? (
                          <div className="text-sm flex items-center line-clamp-1">
                            <Scissors className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0" />
                            <span className="truncate">{app.serviceName}</span>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No services</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="text-sm line-clamp-1" title={app.paymentMethod}>{app.paymentMethod}</div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="text-sm line-clamp-1 uppercase" title={app.status}>{app.status}</div>
                    </TableCell>
                    <TableCell className="text-right w-28">
                      <div className="font-medium">{formatCurrency(app.finalAmount || app.totalAmount)}</div>
                    </TableCell>
                    <TableCell className="text-right w-24">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewInvoice(app)}
                          className="rounded-lg hover:bg-primary/10 hover:border-primary/30 h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadInvoice(app)}
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
        {appointments.map((app: any, index: number) => (
          <Card
            key={app._id}
            className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/20"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-0">
              <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm font-bold text-primary">{app.invoiceNumber || "N/A"}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(app.date).toLocaleDateString()} | {app.startTime}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-2 py-1 rounded-full text-xs font-medium uppercase">
                    {app.status}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex-1">
                  <p className="font-medium">{app.clientName || app.client?.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.clientPhone || app.client?.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid By:</span>
                    <span className="font-medium">{app.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium uppercase">{app.status}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {app.serviceItems && app.serviceItems.length > 0 ? (
                    <>
                      {app.serviceItems.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="text-sm flex items-center">
                          <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                          {item.serviceName}
                        </div>
                      ))}
                      {app.serviceItems.length > 2 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          +{app.serviceItems.length - 2} more
                        </div>
                      )}
                    </>
                  ) : app.serviceName ? (
                    <div className="text-sm flex items-center">
                      <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                      {app.serviceName}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No services</div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/20">
                  <div>
                    <p className="text-xl font-bold text-primary">₹{(app.finalAmount || app.totalAmount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewInvoice(app)}
                      className="rounded-lg"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadInvoice(app)}
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
