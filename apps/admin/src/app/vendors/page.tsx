
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Eye, ToggleRight, ToggleLeft, FileDown, X, Edit2, Trash2, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openModal, closeModal } from '@repo/store/slices/modalSlice';

const vendorsData = [
  {
    id: "VEN-001",
    name: "Glamour Salon",
    owner: "Alice Johnson",
    phone: "123-456-7890",
    status: "Active",
  },
  {
    id: "VEN-002",
    name: "Modern Cuts",
    owner: "Bob Williams",
    phone: "234-567-8901",
    status: "Active",
  },
  {
    id: "VEN-003",
    name: "Style Hub",
    owner: "Charlie Brown",
    phone: "345-678-9012",
    status: "Disabled",
  },
  {
    id: "VEN-004",
    name: "Beauty Bliss",
    owner: "Diana Prince",
    phone: "456-789-0123",
    status: "Active",
  },
  {
    id: "VEN-005",
    name: "The Men's Room",
    owner: "Clark Kent",
    phone: "567-890-1234",
    status: "Active",
  },
  {
    id: "VEN-006",
    name: "Nail Envy",
    owner: "Lois Lane",
    phone: "678-901-2345",
    status: "Disabled",
  },
];

type Vendor = typeof vendorsData[0];
type ActionType = 'enable' | 'disable' | 'delete';

export default function VendorManagementPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    
    const dispatch = useAppDispatch();
    const { isOpen, modalType, data } = useAppSelector((state) => state.modal);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = vendorsData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(vendorsData.length / itemsPerPage);

    const selectedVendor = modalType === 'editVendor' || modalType === 'viewVendor' ? data as Vendor : null;
    const selectedActionVendor = data as Vendor;

    const handleOpenModal = (type: 'addVendor' | 'editVendor' | 'viewVendor', vendor?: Vendor) => {
        dispatch(openModal({ modalType: type, data: vendor }));
    };

    const handleCloseModal = () => {
        dispatch(closeModal());
    };
    
    const handleActionClick = (vendor: Vendor, action: ActionType) => {
        dispatch(openModal({ modalType: 'confirmation', data: vendor }));
        setActionType(action);
        setIsActionModalOpen(true);
    };
    
    const handleConfirmAction = () => {
        // Handle API call for enable/disable/delete
        setIsActionModalOpen(false);
        dispatch(closeModal());
    };
    
     const getModalContent = () => {
        if (!actionType || !selectedActionVendor) return { title: '', description: '', buttonText: '' };
        switch (actionType) {
            case 'enable':
                return {
                    title: 'Enable Vendor?',
                    description: `Are you sure you want to enable the vendor "${selectedActionVendor.name}"?`,
                    buttonText: 'Enable'
                };
            case 'disable':
                return {
                    title: 'Disable Vendor?',
                    description: `Are you sure you want to disable the vendor "${selectedActionVendor.name}"?`,
                    buttonText: 'Disable'
                };
            case 'delete':
                return {
                    title: 'Delete Vendor?',
                    description: `Are you sure you want to permanently delete the vendor "${selectedActionVendor.name}"? This action is irreversible.`,
                    buttonText: 'Delete'
                };
            default:
                return { title: '', description: '', buttonText: '' };
        }
    };

    const { title, description, buttonText } = getModalContent();

    const isModalOpen = isOpen && (modalType === 'addVendor' || modalType === 'editVendor' || modalType === 'viewVendor');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Management</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Vendor List</CardTitle>
              <CardDescription>Details about all registered vendors.</CardDescription>
            </div>
             <div className="flex gap-2">
                <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export List
                </Button>
                <Button onClick={() => handleOpenModal('addVendor')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Vendor
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div className="mb-6 p-4 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Input type="text" placeholder="Filter by Salon Name..." />
                    <Input type="text" placeholder="Filter by Owner Name..." />
                    <Input type="text" placeholder="Filter by Phone..." />
                </div>
            </div>

          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((vendor) => (
                    <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.owner}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vendor.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                            {vendor.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('viewVendor', vendor)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('editVendor', vendor)}>
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleActionClick(vendor, vendor.status === 'Active' ? 'disable' : 'enable')}
                            className={vendor.status === 'Active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}>
                            {vendor.status === 'Active' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                            <span className="sr-only">{vendor.status === 'Active' ? 'Disable' : 'Enable'}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleActionClick(vendor, 'delete')}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
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
                totalItems={vendorsData.length}
            />
        </CardContent>
      </Card>

      {/* Add/Edit/View Vendor Modal */}
       <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                    {modalType === 'addVendor' && 'Add New Vendor'}
                    {modalType === 'editVendor' && 'Edit Vendor'}
                    {modalType === 'viewVendor' && 'Vendor Details'}
                </DialogTitle>
                 <DialogDescription>
                    {modalType === 'addVendor' && "Enter details for the new vendor."}
                    {modalType === 'editVendor' && "Update vendor details."}
                </DialogDescription>
            </DialogHeader>
            {modalType === 'viewVendor' ? (
                 <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Salon Name</span>
                        <span className="col-span-2">{selectedVendor?.name}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Owner</span>
                        <span className="col-span-2">{selectedVendor?.owner}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Phone</span>
                        <span className="col-span-2">{selectedVendor?.phone}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="font-semibold text-muted-foreground">Status</span>
                        <span className="col-span-2">{selectedVendor?.status}</span>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Salon Name</Label>
                        <Input id="name" defaultValue={selectedVendor?.name || ''} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="owner" className="text-right">Owner</Label>
                        <Input id="owner" defaultValue={selectedVendor?.owner || ''} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" defaultValue={selectedVendor?.phone || ''} className="col-span-3" />
                    </div>
                </div>
            )}
            <DialogFooter>
                 {modalType === 'viewVendor' ? (
                    <Button onClick={handleCloseModal}>Close</Button>
                 ) : (
                    <>
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Save Vendor</Button>
                    </>
                 )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Confirmation Modal */}
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
                        variant={actionType === 'delete' || actionType === 'disable' ? 'destructive' : 'default'}
                        onClick={handleConfirmAction}
                    >
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
