
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Edit2, Eye, Trash2, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openModal, closeModal } from '@repo/store/slices/modal';


const couponsData = [
    {
        id: "coupon_1",
        code: "SUMMER24",
        discount: "20% Off",
        status: "Active",
        expires: "2024-08-31",
    },
    {
        id: "coupon_2",
        code: "NEWUSER10",
        discount: "$10 Off",
        status: "Active",
        expires: "N/A",
    },
    {
        id: "coupon_3",
        code: "EXPIRED01",
        discount: "15% Off",
        status: "Expired",
        expires: "2023-12-31",
    },
    {
        id: "coupon_4",
        code: "HOLIDAYFUN",
        discount: "25% Off",
        status: "Active",
        expires: "2024-07-31",
    },
    {
        id: "coupon_5",
        code: "FLASH30",
        discount: "30% Off",
        status: "Expired",
        expires: "2024-01-01",
    },
];

type Coupon = typeof couponsData[0];

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

    const isModalOpen = isOpen && (modalType === 'addCoupon' || modalType === 'editCoupon' || modalType === 'viewCoupon');
    const modalCoupon = data as Coupon;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Offers & Coupons Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Coupons</CardTitle>
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
                  <TableHead>Expires On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((coupon) => (
                    <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.discount}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            coupon.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                        {coupon.status}
                        </span>
                    </TableCell>
                    <TableCell>{coupon.expires}</TableCell>
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
        <DialogContent className="sm:max-w-[425px]">
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
                    <span className="col-span-2">{modalCoupon?.discount}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Status</span>
                    <span className="col-span-2">{modalCoupon?.status}</span>
                </div>
                 <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Expires</span>
                    <span className="col-span-2">{modalCoupon?.expires}</span>
                </div>
             </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" defaultValue={modalCoupon?.code || ''} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">Discount</Label>
                <Input id="discount" defaultValue={modalCoupon?.discount || ''} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expires" className="text-right">Expires On</Label>
                <Input id="expires" type="date" defaultValue={modalCoupon?.expires || ''} className="col-span-3" />
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
