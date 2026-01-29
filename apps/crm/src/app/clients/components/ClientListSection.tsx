"use client";

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@repo/ui/dropdown-menu';
import { Input } from '@repo/ui/input';
import { Search, Download, Copy, FileSpreadsheet, FileText, Printer, Plus, Eye, Edit, Trash2, Users, UserPlus, ShoppingBag, UserX } from 'lucide-react';
import { Skeleton } from "@repo/ui/skeleton";
import { toast } from 'sonner';
import { Client } from '../types';
import { formatDateForDisplay } from '../utils';
import * as XLSX from 'xlsx';

interface ClientListSectionProps {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  handleOpenModal: (client?: Client) => void;
  handleNameClick: (client: Client) => void;
  handleDeleteClick: (client: Client) => void;
  bookingsById: Map<string, number>;
  totalsById: Map<string, number>;
  offlineClients: Client[];
  onlineClients: Client[];
  appointments: any[];
  inactiveClients: Client[];
}

export default function ClientListSection({
  clients,
  isLoading,
  searchTerm,
  handleOpenModal,
  handleNameClick,
  handleDeleteClick,
  bookingsById,
  totalsById,
  offlineClients,
  onlineClients,
  appointments,
  inactiveClients
}: ClientListSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableRef = useRef<HTMLDivElement>(null);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter((client: Client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredClients.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Skeleton className="h-10 w-80" />
              </div>
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  {["Client", "Contact", "Last Visit", "Bookings", "Status", "Actions"].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Name</TableHead>
                    <TableHead className="min-w-[150px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Phone</TableHead>
                    <TableHead className="min-w-[100px]">Birthday</TableHead>
                    <TableHead className="min-w-[100px]">Last Visit</TableHead>
                    <TableHead className="min-w-[100px]">Bookings</TableHead>
                    <TableHead className="min-w-[100px]">Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No clients found matching your criteria' : 'No clients added yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((client: Client) => (
                      <TableRow key={client._id}>
                        <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={client.profilePicture || `https://placehold.co/40x40.png?text=${client.fullName[0]}`}
                                alt={client.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />

                            </div>
                            <button
                              onClick={() => handleNameClick(client)}
                              className="font-semibold truncate max-w-[80px] hover:underline cursor-pointer transition-colors"
                            >
                              {client.fullName}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[150px] max-w-[180px] truncate">{client.email}</TableCell>
                        <TableCell className="min-w-[120px] max-w-[150px] truncate">{client.phone}</TableCell>
                        <TableCell className="min-w-[100px] truncate">{formatDateForDisplay(client.birthdayDate)}</TableCell>
                        <TableCell className="min-w-[100px] truncate">{formatDateForDisplay(client.lastVisit)}</TableCell>
                        <TableCell className="min-w-[100px]">
                          <span className="inline-flex items-center text-sm font-medium">
                            {bookingsById.get(String(client._id)) || 0}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-[100px] font-semibold">₹{(
                          totalsById.get(String(client._id)) || 0
                        ).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'Active'
                            ? 'bg-primary text-primary-foreground'
                            : client.status === 'New'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {client.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNameClick(client)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(client)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(client)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    
      <div className="p-6 border-t border-border bg-muted/30">
        <Pagination
          className=""
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={filteredClients.length}
        />
      </div>
    </div>
  );
}