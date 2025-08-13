
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Edit2, Eye, Trash2, Plus, Percent, Tag, CheckSquare, IndianRupee } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openModal, closeModal } from '@repo/store/slices/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';

const couponsData = [
    {
        id: "coupon_1",
        code: "SUMMER24",
        type: "percentage",
        value: 20,
        status: "Active",
        startDate: "2024-06-01",
        expires: "2024-08-31",
        redeemed: 150,
    },
    {
        id: "coupon_2",
        code: "NEWUSER10",
        type: "fixed",
        value: 100,
        status: "Active",
        startDate: "2024-01-01",
        expires: "N/A",
        redeemed: 230,
    },
    {
        id: "coupon_3",
        code: "EXPIRED01",
        type: "percentage",
        value: 15,
        status: "Expired",
        startDate: "2023-12-01",
        expires: "2023-12-31",
        redeemed: 50,
    },
    {
        id: "coupon_4",
        code: "HOLIDAYFUN",
        type: "percentage",
        value: 25,
        status: "Active",
        startDate: "2024-07-01",
        expires: "2024-07-31",
        redeemed: 75,
    },
    {
        id: "coupon_5",
        code: "FLASH30",
        type: "fixed",
        value: 300,
        status: "Expired",
        startDate: "2023-12-25",
        expires: "2024-01-01",
        redeemed: 25,
    },
    {
        id: "coupon_6",
        code: "WINTER25",
        type: "percentage",
        value: 15,
        status: "Scheduled",
        startDate: "2024-12-01",
        expires: "2025-01-31",
        redeemed: 0,
    }
];

type Coupon = typeof couponsData[0];
type DiscountType = 'percentage' | 'fixed';

export default function OffersCouponsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    const dispatch = useAppDispatch();
    const { isOpen, modalType, data } = useAppSelector((state) => state.modal);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = couponsData.slice(firstItemIndex, lastItemIndex);

    const totalPages = Math.ceil(couponsData.length / itemsPerPage);

    const handleOpenModal = (type: 'addCoupon' | 'editCoupon' | 'viewCoupon', coupon?: Coupon) => {
        dispatch(openModal({ modalType: type, data: coupon }));
    };

    const handleCloseModal = () => {
        dispatch(closeModal());
    };

    const handleDeleteClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        // API logic to delete
        setIsDeleteModalOpen(false);
        setSelectedCoupon(null);
    };
    
    const formatDiscount = (coupon: Coupon) => {
        if (coupon.type === 'percentage') {
            return `${coupon.value}% Off`;
        }
        return `₹${coupon.value} Off`;
    }

    const isModalOpen = isOpen && (modalType === 'addCoupon' || modalType === 'editCoupon' || modalType === 'viewCoupon');
    const modalCoupon = data as Coupon;

    const totalDiscountValue = couponsData.reduce((acc, coupon) => {
        if (coupon.type === 'fixed') {
            return acc + coupon.value * coupon.redeemed;
        }
        // Assuming an average order value of ₹1000 for percentage discounts
        return acc + (1000 * (coupon.value / 100)) * coupon.redeemed;
    }, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Offers & Coupons Management</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{couponsData.length}</div>
                <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">
                    {couponsData.filter(c => c.status === 'Active').length}
                </div>
                <p className="text-xs text-muted-foreground">Currently usable by customers</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {couponsData.reduce((acc, c) => acc + c.redeemed, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total times coupons were applied</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Discount Value</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    ₹{totalDiscountValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Estimated value of discounts</p>
            </CardContent>
            </Card>
        </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manage Coupons</CardTitle>
              <CardDescription>Manage and create new promotional coupons.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal('addCoupon')}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Coupon
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Starts On</TableHead>
                  <TableHead>Expires On</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((coupon) => (
                    <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{formatDiscount(coupon)}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            coupon.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : coupon.status === "Scheduled"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                        {coupon.status}
                        </span>
                    </TableCell>
                    <TableCell>{coupon.startDate}</TableCell>
                    <TableCell>{coupon.expires}</TableCell>
                    <TableCell>{coupon.redeemed}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('viewCoupon', coupon)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal('editCoupon', coupon)}>
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(coupon)}>
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
                totalItems={couponsData.length}
            />
        </CardContent>
      </Card>

      {/* Add/Edit/View Modals */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
                {modalType === 'addCoupon' && 'Create New Coupon'}
                {modalType === 'editCoupon' && 'Edit Coupon'}
                {modalType === 'viewCoupon' && 'Coupon Details'}
            </DialogTitle>
            <DialogDescription>
                {modalType === 'addCoupon' && "Enter the details for the new coupon."}
                {modalType === 'editCoupon' && "Update the details for this coupon."}
                {modalType === 'viewCoupon' && "Viewing details for this coupon."}
            </DialogDescription>
          </DialogHeader>
          
          {modalType === 'viewCoupon' ? (
             <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Code</span>
                    <span className="col-span-2">{modalCoupon?.code}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Discount</span>
                    <span className="col-span-2">{modalCoupon ? formatDiscount(modalCoupon) : ''}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Status</span>
                    <span className="col-span-2">{modalCoupon?.status}</span>
                </div>
                 <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Starts</span>
                    <span className="col-span-2">{modalCoupon?.startDate}</span>
                </div>
                 <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Expires</span>
                    <span className="col-span-2">{modalCoupon?.expires}</span>
                </div>
                 <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Redeemed</span>
                    <span className="col-span-2">{modalCoupon?.redeemed}</span>
                </div>
             </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" defaultValue={modalCoupon?.code || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select defaultValue={modalCoupon?.type || 'percentage'}>
                    <SelectTrigger id="type">
                        <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Discount Value</Label>
                <Input id="value" type="number" defaultValue={modalCoupon?.value || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Starts On</Label>
                  <Input id="startDate" type="date" defaultValue={modalCoupon?.startDate || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires On</Label>
                  <Input id="expires" type="date" defaultValue={modalCoupon?.expires || ''} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {modalType === 'viewCoupon' ? (
                <Button onClick={handleCloseModal}>Close</Button>
            ) : (
              <>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit">Save Coupon</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Delete Confirmation Modal */}
       <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Coupon?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the coupon "{selectedCoupon?.code}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={handleConfirmDelete}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    
