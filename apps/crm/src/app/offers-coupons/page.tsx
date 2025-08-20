
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Plus, Edit2, Eye, Trash2, Percent, Tag, CheckSquare, IndianRupee } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: string;
  startDate: string;
  expires: string;
  redeemed: number;
};

const mockCoupons: Coupon[] = [
  { id: '1', code: 'SUMMER20', type: 'percentage', value: 20, status: 'Active', startDate: '2024-06-01', expires: '2024-08-31', redeemed: 152 },
  { id: '2', code: 'NEWBIE100', type: 'fixed', value: 100, status: 'Active', startDate: '2024-01-01', expires: '2024-12-31', redeemed: 340 },
  { id: '3', code: 'MIDWEEK', type: 'percentage', value: 15, status: 'Inactive', startDate: '2024-05-01', expires: '2024-05-31', redeemed: 88 },
  { id: '4', code: 'LOYALTY50', type: 'fixed', value: 50, status: 'Active', startDate: '2024-01-01', expires: 'N/A', redeemed: 512 },
];


export default function OffersCouponsPage() {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = coupons.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  const handleOpenModal = (type: 'add' | 'edit' | 'view', coupon?: Coupon) => {
    setModalType(type);
    setSelectedCoupon(coupon || null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCoupon) {
      setCoupons(coupons.filter(c => c.id !== selectedCoupon.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedCoupon(null);
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% Off`;
    }
    return `₹${coupon.value} Off`;
  };

  const totalDiscountValue = coupons.reduce((acc, coupon) => {
    if (coupon.type === 'fixed') {
      return acc + coupon.value * coupon.redeemed;
    }
    // Assume average order value of 1000 for percentage discount estimation
    return acc + (1000 * (coupon.value / 100)) * coupon.redeemed;
  }, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Offers & Coupons</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">Total coupons created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{coupons.filter(c => c.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">Currently usable by customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.reduce((acc, c) => acc + c.redeemed, 0)}</div>
            <p className="text-xs text-muted-foreground">Total times coupons were applied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDiscountValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated value of discounts</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Manage Coupons</CardTitle>
                <CardDescription>Create, edit, and manage your promotional coupons.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal('add')}>
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
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {coupon.status}
                      </span>
                    </TableCell>
                    <TableCell>{coupon.startDate}</TableCell>
                    <TableCell>{coupon.expires}</TableCell>
                    <TableCell>{coupon.redeemed}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('view', coupon)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', coupon)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(coupon)}>
                        <Trash2 className="h-4 w-4" />
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
            totalItems={coupons.length}
          />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{modalType === 'add' ? 'Create New Coupon' : 'Edit Coupon'}</DialogTitle>
                <DialogDescription>
                    {modalType === 'add' ? 'Enter the details for the new coupon.' : 'Update the details for this coupon.'}
                </DialogDescription>
            </DialogHeader>
            {/* Form can be added here */}
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Delete Coupon?</DialogTitle>
                  <DialogDescription>
                      Are you sure you want to delete the coupon "{selectedCoupon?.code}"? This action cannot be undone.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
