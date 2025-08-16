"use client";

import { useState, useEffect } from 'react';
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
import { useForm } from 'react-hook-form';
import { 
  useGetAdminOffersQuery, 
  useCreateAdminOfferMutation, 
  useUpdateAdminOfferMutation, 
  useDeleteAdminOfferMutation 
} from '@repo/store/services/api';
import { toast } from 'sonner';
import { selectRootState } from '@repo/store/store';

type Coupon = {
  _id: string;
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: string;
  startDate: string;
  expires: string;
  redeemed: number;
  applicableSpecialties: string[];
  applicableCategories: string[];
};

type CouponForm = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  expires: string;
  applicableSpecialties: string; // comma-separated or "all"
  applicableCategories: string; // comma-separated or "all"
};

// Predefined options for specialties and categories
const specialtyOptions = ['Hair Cut', 'Spa', 'Massage', 'Facial', 'Manicure', 'Pedicure'];
const categoryOptions = ['Men', 'Women', 'Unisex'];

export default function OffersCouponsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const dispatch = useAppDispatch();
  const { isOpen, modalType, data } = useAppSelector(
    (state) => selectRootState(state).modal
  );
   
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CouponForm>({
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      startDate: '',
      expires: '',
      applicableSpecialties: 'all',
      applicableCategories: 'all',
    }
  });

  // RTK Query hooks
  const { 
    data: couponsData = [], 
    isLoading, 
    isError, 
    refetch 
  } = useGetAdminOffersQuery(undefined);
  
  const [createOffer, { isLoading: isCreating }] = useCreateAdminOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateAdminOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteAdminOfferMutation();

  // Update form values when editing
  useEffect(() => {
    if (modalType === 'editCoupon' && data) {
      const coupon = data as Coupon;
      setValue('code', coupon.code || '');
      setValue('type', coupon.type || 'percentage');
      setValue('value', coupon.value || 0);
      setValue('startDate', coupon.startDate ? coupon.startDate.split('T')[0] : '');
      setValue('expires', coupon.expires ? coupon.expires.split('T')[0] : '');
      setValue('applicableSpecialties', Array.isArray(coupon.applicableSpecialties) && coupon.applicableSpecialties.length > 0 ? coupon.applicableSpecialties.join(',') : 'all');
      setValue('applicableCategories', Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length > 0 ? coupon.applicableCategories.join(',') : 'all');
    } else {
      reset();
    }
  }, [modalType, data, setValue, reset]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = Array.isArray(couponsData) ? couponsData.slice(firstItemIndex, lastItemIndex) : [];

  const totalPages = Array.isArray(couponsData) ? Math.ceil(couponsData.length / itemsPerPage) : 1;

  const handleOpenModal = (type: 'addCoupon' | 'editCoupon' | 'viewCoupon', coupon?: Coupon) => {
    dispatch(openModal({ modalType: type, data: coupon }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
    reset();
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCoupon) {
      try {
        await deleteOffer(selectedCoupon._id).unwrap();
        toast.success('Coupon deleted successfully');
        setIsDeleteModalOpen(false);
        setSelectedCoupon(null);
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const onSubmit = async (formData: CouponForm) => {
    const processedData = {
      ...formData,
      applicableSpecialties: formData.applicableSpecialties === 'all' ? [] : formData.applicableSpecialties.split(',').map(s => s.trim()).filter(Boolean),
      applicableCategories: formData.applicableCategories === 'all' ? [] : formData.applicableCategories.split(',').map(c => c.trim()).filter(Boolean),
    };

    try {
      if (modalType === 'addCoupon') {
        await createOffer(processedData).unwrap();
        toast.success('Coupon created successfully');
      } else if (modalType === 'editCoupon' && data) {
        await updateOffer({ id: (data as Coupon)._id, ...processedData }).unwrap();
        toast.success('Coupon updated successfully');
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      toast.error(modalType === 'addCoupon' ? 'Failed to create coupon' : 'Failed to update coupon');
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% Off`;
    }
    return `₹${coupon.value} Off`;
  };

  const formatList = (list: string[] | undefined | null): string => {
    if (!Array.isArray(list) || list.length === 0) {
      return 'All';
    }
    return list.join(', ');
  };

  const totalDiscountValue = Array.isArray(couponsData) ? couponsData.reduce((acc, coupon) => {
    if (coupon.type === 'fixed') {
      return acc + coupon.value * coupon.redeemed;
    }
    return acc + (1000 * (coupon.value / 100)) * coupon.redeemed;
  }, 0) : 0;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading coupons. Please try again.</div>;

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
            <div className="text-2xl font-bold">{Array.isArray(couponsData) ? couponsData.length : 0}</div>
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
              {Array.isArray(couponsData) ? couponsData.filter(c => c.status === 'Active').length : 0}
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
              {Array.isArray(couponsData) ? couponsData.reduce((acc, c) => acc + c.redeemed, 0) : 0}
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
            <Button onClick={() => handleOpenModal('addCoupon')} disabled={isCreating}>
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
                  <TableHead>Specialties</TableHead>
                  <TableHead>Categories</TableHead>
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
                    <TableCell>{coupon.startDate.split('T')[0]}</TableCell>
                    <TableCell>{coupon.expires ? coupon.expires.split('T')[0] : 'N/A'}</TableCell>
                    <TableCell>{formatList(coupon.applicableSpecialties)}</TableCell>
                    <TableCell>{formatList(coupon.applicableCategories)}</TableCell>
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteClick(coupon)}
                        disabled={isDeleting}
                      >
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
            totalItems={Array.isArray(couponsData) ? couponsData.length : 0}
          />
        </CardContent>
      </Card>

      <Dialog open={isOpen && (modalType === 'addCoupon' || modalType === 'editCoupon' || modalType === 'viewCoupon')} onOpenChange={handleCloseModal}>
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
                <span className="col-span-2">{(data as Coupon)?.code || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Discount</span>
                <span className="col-span-2">{data ? formatDiscount(data as Coupon) : 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Status</span>
                <span className="col-span-2">{(data as Coupon)?.status || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Starts</span>
                <span className="col-span-2">{(data as Coupon)?.startDate?.split('T')[0] || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Expires</span>
                <span className="col-span-2">{(data as Coupon)?.expires ? (data as Coupon).expires.split('T')[0] : 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Specialties</span>
                <span className="col-span-2">{formatList((data as Coupon)?.applicableSpecialties)}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Categories</span>
                <span className="col-span-2">{formatList((data as Coupon)?.applicableCategories)}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Redeemed</span>
                <span className="col-span-2">{(data as Coupon)?.redeemed || 0}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input 
                  id="code" 
                  {...register('code', { required: 'Coupon code is required' })} 
                />
                {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select 
                  defaultValue={(data as Coupon)?.type || 'percentage'} 
                  onValueChange={(value) => setValue('type', value as 'percentage' | 'fixed')}
                >
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
                <Input 
                  id="value" 
                  type="number" 
                  {...register('value', { 
                    required: 'Discount value is required',
                    min: { value: 1, message: 'Value must be greater than 0' }
                  })} 
                />
                {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Starts On</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    {...register('startDate', { required: 'Start date is required' })} 
                  />
                  {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires On</Label>
                  <Input 
                    id="expires" 
                    type="date" 
                    {...register('expires')} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicableSpecialties">Applicable Specialties (select one, choose 'All' for none)</Label>
                <Select
                  defaultValue={(data as Coupon)?.applicableSpecialties?.length > 0 ? (data as Coupon).applicableSpecialties.join(',') : 'all'}
                  onValueChange={(value) => setValue('applicableSpecialties', value)}
                >
                  <SelectTrigger id="applicableSpecialties">
                    <SelectValue placeholder="Select specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialtyOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicableCategories">Applicable Categories (select one, choose 'All' for none)</Label>
                <Select
                  defaultValue={(data as Coupon)?.applicableCategories?.length > 0 ? (data as Coupon).applicableCategories.join(',') : 'all'}
                  onValueChange={(value) => setValue('applicableCategories', value)}
                >
                  <SelectTrigger id="applicableCategories">
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {modalType === 'addCoupon' ? 'Create Coupon' : 'Update Coupon'}
                </Button>
              </DialogFooter>
            </form>
          )}
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
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}