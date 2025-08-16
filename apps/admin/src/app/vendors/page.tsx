
"use client";

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Eye, ToggleRight, ToggleLeft, FileDown, X, Trash2, Plus, FilePenIcon, Users, UserCheck, BarChart, UserX } from 'lucide-react';
import { VendorForm } from "../../components/VendorForm";
import { VendorEditForm } from "../../components/VendorEditForm";
import { useAppSelector } from '@repo/store/hooks';
import { selectRootState } from '@repo/store/store';

export interface Vendor {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  businessCategory: string;
  businessEmail: string;
  businessDescription: string;
  profileImage?: string;
  website?: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  category?: string;
  subCategories?: string[];
  serviceCategories?: string[];
  status?: 'Active' | 'Disabled';
  [key: string]: any; // For dynamic access
}

type ActionType = 'enable' | 'disable' | 'delete';

export default function VendorManagementPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const vendors = useAppSelector((state) => selectRootState(state).vendors);
    

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = vendors.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(vendors.length / itemsPerPage);
    
    const handleOpenCreateModal = () => {
        setSelectedVendor(null);
        setCreateModalOpen(true);
    };

    const handleOpenEditModal = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setEditModalOpen(true);
    };

    const handleOpenRegistrationModal = () => {
        setSelectedVendor(null);
        setIsRegistrationModalOpen(true);
    };

    const handleRegistrationSuccess = () => {
        // Refresh the vendors list or show success message
        console.log('Vendor registered successfully');
    };

    const handleActionClick = (vendor: Vendor, action: ActionType) => {
        setSelectedVendor(vendor);
        setActionType(action);
        setIsActionModalOpen(true);
    };
    
    const handleConfirmAction = () => {
        // Handle API call for enable/disable/delete
        setIsActionModalOpen(false);
        setSelectedVendor(null);
    };

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setEditModalOpen(false);
        setSelectedVendor(null);
    };

    const getModalContent = () => {
        if (!actionType || !selectedVendor) return { title: '', description: '', buttonText: '' };
        switch (actionType) {
            case 'enable':
                return {
                    title: 'Enable Vendor?',
                    description: `Are you sure you want to enable the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"?`,
                    buttonText: 'Enable'
                };
            case 'disable':
                return {
                    title: 'Disable Vendor?',
                    description: `Are you sure you want to disable the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"?`,
                    buttonText: 'Disable'
                };
            case 'delete':
                return {
                    title: 'Delete Vendor?',
                    description: `Are you sure you want to permanently delete the vendor "${selectedVendor.firstName} ${selectedVendor.lastName}"? This action is irreversible.`,
                    buttonText: 'Delete'
                };
            default:
                return { title: '', description: '', buttonText: '' };
        }
    };

    const { title, description, buttonText } = getModalContent();

    const activeVendors = vendors.filter((v: Vendor) => v.status === 'Active').length;
    const disabledVendors = vendors.filter((v: Vendor) => v.status !== 'Active').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled Vendors</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{disabledVendors}</div>
            <p className="text-xs text-muted-foreground">Temporarily inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Business</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+12.1% from last month</p>
          </CardContent>
        </Card>
      </div>

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
                <Button onClick={handleOpenCreateModal}>Add Vendor</Button>
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
                {currentItems.length > 0 ? (
                 currentItems.map((vendor: Vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.salonName}</TableCell>
                      <TableCell>{`${vendor.firstName} ${vendor.lastName}`}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vendor.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                        }`}>
                          {vendor.status || 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(vendor)}>
                          <FilePenIcon className="h-4 w-4" />
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                )}
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
                totalItems={vendors.length}
            />
        </CardContent>
      </Card>
      
      <VendorForm 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal} 
        vendor={null}
        isEditMode={false}
      />
      {selectedVendor && (
        <VendorEditForm 
          isOpen={isEditModalOpen} 
          onClose={handleCloseModal} 
          vendor={selectedVendor}
        />
      )}
      
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
