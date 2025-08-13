
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Eye, CheckCircle, XCircle, Plus, Box, DollarSign, Hourglass } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

const suppliersData = [
  {
    id: "SUP-001",
    name: "Global Beauty Supplies",
    contact: "contact@gbs.com",
    products: 125,
    sales: 25430,
    status: "Approved",
  },
  {
    id: "SUP-002",
    name: "Organic Skincare Inc.",
    contact: "sales@organicskin.com",
    products: 45,
    sales: 12810,
    status: "Pending",
  },
  {
    id: "SUP-003",
    name: "Nail Art Creations",
    contact: "orders@nailart.com",
    products: 210,
    sales: 32050,
    status: "Approved",
  },
  {
    id: "SUP-004",
    name: "Modern Hair Tools",
    contact: "info@modernhair.com",
    products: 80,
    sales: 18900,
    status: "Rejected",
  },
  {
    id: "SUP-005",
    name: "Spa Essentials",
    contact: "support@spaessentials.com",
    products: 60,
    sales: 9500,
    status: "Pending",
  },
];

type Supplier = typeof suppliersData[0];
type ActionType = 'approve' | 'reject';

export default function SupplierManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = suppliersData.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(suppliersData.length / itemsPerPage);

  const handleActionClick = (supplier: Supplier, action: ActionType) => {
    setSelectedSupplier(supplier);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleViewClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedSupplier && actionType) {
        console.log(`Performing ${actionType} on supplier ${selectedSupplier.name}`);
        // API call logic would go here
    }
    setIsActionModalOpen(false);
    setSelectedSupplier(null);
    setActionType(null);
  };

  const getModalContent = () => {
    if (!actionType || !selectedSupplier) return { title: '', description: '', buttonText: '' };
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Supplier?',
          description: `Are you sure you want to approve the supplier "${selectedSupplier.name}"?`,
          buttonText: 'Approve'
        };
      case 'reject':
        return {
          title: 'Reject Supplier?',
          description: `Are you sure you want to reject the supplier "${selectedSupplier.name}"? This action cannot be undone.`,
          buttonText: 'Reject'
        };
      default:
        return { title: '', description: '', buttonText: '' };
    }
  };

  const { title, description, buttonText } = getModalContent();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Supplier Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersData.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersData.reduce((acc, s) => acc + s.products, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${suppliersData.reduce((acc, s) => acc + s.sales, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{suppliersData.filter(s => s.status === 'Pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Suppliers</CardTitle>
                <CardDescription>Manage suppliers and their product listings.</CardDescription>
              </div>
              <Button onClick={() => setIsNewModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Supplier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.products}</TableCell>
                      <TableCell>${supplier.sales.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            supplier.status === "Approved" ? "bg-green-100 text-green-800" :
                            supplier.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                        }`}>
                          {supplier.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(supplier)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                        {supplier.status === "Pending" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'approve')}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleActionClick(supplier, 'reject')}>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
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
                totalItems={suppliersData.length}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Supplier Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Supplier Details: {selectedSupplier?.name}</DialogTitle>
              </DialogHeader>
              {selectedSupplier && (
                  <div className="grid gap-4 py-4 text-sm">
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Supplier ID</span>
                          <span className="col-span-2">{selectedSupplier.id}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Contact</span>
                          <span className="col-span-2">{selectedSupplier.contact}</span>
                      </div>
                       <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Products</span>
                          <span className="col-span-2">{selectedSupplier.products}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Total Sales</span>
                          <span className="col-span-2">${selectedSupplier.sales.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                          <span className="font-semibold text-muted-foreground">Status</span>
                          <span className="col-span-2">{selectedSupplier.status}</span>
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* New Supplier Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the details for the new supplier. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="Supplier Inc." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contact Email
              </Label>
              <Input id="contact" type="email" placeholder="contact@supplier.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="products" className="text-right">
                Products
              </Label>
              <Input id="products" type="number" placeholder="0" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
