
// crm/offers/page.tsx (modified to include advanced features like the admin panel)

"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Checkbox } from '@repo/ui/checkbox';
import { Edit2, Eye, Trash2, Plus, Percent, Tag, CheckSquare, IndianRupee, Upload, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { closeModal, openModal } from '../../../../../packages/store/src/slices/modalSlice.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { useForm } from 'react-hook-form';
import { 
  useGetOffersQuery, 
  useCreateOfferMutation, 
  useUpdateOfferMutation, 
  useDeleteOfferMutation,
  useGetSuperDataQuery
} from '@repo/store/api';
import { toast } from 'sonner';
import { selectRootState } from '@repo/store/store';
import { useCrmAuth } from "@/hooks/useCrmAuth";

type Coupon = {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: string;
  startDate: string;
  expires: string;
  redeemed: number;
  applicableSpecialties: string[];
  applicableCategories: string[];
  applicableDiseases: string[];
  minOrderAmount?: number;
  offerImage?: string;
  isCustomCode?: boolean;
  businessType: string;
  businessId: string;
};

type CouponForm = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  expires: string;
  applicableSpecialties: string[];
  applicableCategories: string[];
  applicableDiseases: string[];
  minOrderAmount?: number;
  offerImage?: string;
  isCustomCode: boolean;
};

// Predefined options for specialties and categories
const specialtyOptions = ['Hair Cut', 'Spa', 'Massage', 'Facial', 'Manicure', 'Pedicure'];
const categoryOptions = ['Men', 'Women', 'Unisex'];

export default function OffersCouponsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user and business info from auth context
  const auth = useCrmAuth();
  const userRole = auth?.role || 'vendor'; // Simplified fallback
  const businessId = auth?.user?._id; // Use user ID as businessId
  
  console.log('Auth Debug:', { auth, userRole, businessId }); // Debug auth values
  
  const dispatch = useAppDispatch();
  const { isOpen, modalType, data } = useAppSelector(
    (state) => selectRootState(state).modal
  );
   
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CouponForm>({
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      startDate: '',
      expires: '',
      applicableSpecialties: [],
      applicableCategories: [],
      applicableDiseases: [],
      minOrderAmount: 0,
      offerImage: '',
      isCustomCode: false,
    }
  });
  
  // Prepare query parameters with memoization to prevent infinite re-renders
  const queryParams = useMemo(() => ({
    businessId: businessId || '',
    businessType: userRole,
    ...(auth?.user?._id && { vendorId: auth.user._id }), // Use consistent user ID
  }), [businessId, userRole, auth?.user?._id]);

  // RTK Query hooks with proper query parameters
  const { 
    data: couponsData = [], 
    isLoading, 
    isError,
    refetch 
  } = useGetOffersQuery(queryParams, {
    skip: !auth || !businessId, // Skip query if not authenticated or no businessId
    refetchOnMountOrArgChange: false, // Disable to prevent infinite loops
  });

  // Removed problematic useEffect that was causing infinite API calls
  // useEffect(() => {
  //   if (auth) {
  //     refetch();
  //   }
  // }, [auth, refetch]);
  
  const { data: superData = [], isLoading: isSuperDataLoading } = useGetSuperDataQuery(undefined);
  
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  // Get diseases from superData for doctors
  const availableDiseases = useMemo(() => {
    return superData?.filter((item: any) => item.type === 'disease') || [];
  }, [superData]);

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setValue('offerImage', base64);
        setPreviewImage(base64);
      } catch (error) {
        toast.error('Error processing image');
      }
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setValue('offerImage', '');
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle specialty selection
  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedSpecialties, specialty]
      : selectedSpecialties.filter(s => s !== specialty);
    setSelectedSpecialties(updated);
    setValue('applicableSpecialties', updated);
  };

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    setSelectedCategories(updated);
    setValue('applicableCategories', updated);
  };

  // Handle disease selection (for doctors)
  const handleDiseaseChange = (diseaseId: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedDiseases, diseaseId]
      : selectedDiseases.filter(d => d !== diseaseId);
    setSelectedDiseases(updated);
    setValue('applicableDiseases', updated);
  };

  // Update form values when editing
  useEffect(() => {
    if (modalType === 'editCoupon' && data) {
      const coupon = data as Coupon;
      setValue('code', coupon.code || '');
      setValue('type', coupon.type || 'percentage');
      setValue('value', coupon.value || 0);
      setValue('startDate', coupon.startDate ? coupon.startDate.split('T')[0] : '');
      setValue('expires', coupon.expires ? coupon.expires.split('T')[0] : '');
      
      const specialties = Array.isArray(coupon.applicableSpecialties) ? coupon.applicableSpecialties : [];
      const categories = Array.isArray(coupon.applicableCategories) ? coupon.applicableCategories : [];
      const diseases = Array.isArray(coupon.applicableDiseases) ? coupon.applicableDiseases : [];
      
      setSelectedSpecialties(specialties);
      setSelectedCategories(categories);
      setSelectedDiseases(diseases);
      setValue('applicableSpecialties', specialties);
      setValue('applicableCategories', categories);
      setValue('applicableDiseases', diseases);
      setValue('minOrderAmount', coupon.minOrderAmount || 0);
      setValue('offerImage', coupon.offerImage || '');
      setPreviewImage(coupon.offerImage || null);
      setUseCustomCode(coupon.isCustomCode || false);
      setValue('isCustomCode', coupon.isCustomCode || false);
    } else {
      reset();
      setSelectedSpecialties([]);
      setSelectedCategories([]);
      setSelectedDiseases([]);
      setPreviewImage(null);
      setUseCustomCode(false);
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
    setSelectedSpecialties([]);
    setSelectedCategories([]);
    setSelectedDiseases([]);
    setPreviewImage(null);
    setUseCustomCode(false);
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
    // Validate required data
    if (!businessId || !userRole) {
      toast.error('Session expired. Please login again.');
      return;
    }

    const processedData = {
      ...formData,
      code: useCustomCode ? formData.code : '', // Send empty if auto-generate
      applicableSpecialties: userRole === 'vendor' ? selectedSpecialties : [],
      applicableCategories: userRole === 'vendor' ? selectedCategories : [],
      applicableDiseases: userRole === 'doctor' ? selectedDiseases : [],
      minOrderAmount: userRole === 'supplier' ? formData.minOrderAmount : undefined,
      isCustomCode: useCustomCode,
      businessType: userRole,
      businessId: businessId,
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

  // Get role-specific page title
  const getPageTitle = () => {
    switch (userRole) {
      case 'doctor':
        return 'Medical Offers & Promotions';
      case 'supplier':
        return 'Supplier Offers & Discounts';
      case 'vendor':
      default:
        return 'Offers & Coupons';
    }
  };

  // Get role-specific button text
  const getCreateButtonText = () => {
    switch (userRole) {
      case 'doctor':
        return 'Create Medical Offer';
      case 'supplier':
        return 'Create Supplier Offer';
      case 'vendor':
      default:
        return 'Create New Coupon';
    }
  };

  // Handle authentication state
  if (!auth) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to view your offers.</p>
      </div>
    );
  }

  // Show loading state while waiting for businessId resolution
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Skeleton className="h-10 w-80" />
                </div>
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Code", "Type", "Value", "Status", "Expiry", "Usage", "Actions"].map((_, i) => (
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
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-12" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Offers</h2>
        <p className="text-muted-foreground mb-4">There was a problem loading your offers.</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Check if we have any offers
  const hasOffers = Array.isArray(couponsData) && couponsData.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">{getPageTitle()}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(couponsData) ? couponsData.length : 0}</div>
            <p className="text-xs text-muted-foreground">Total coupons created</p>
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
                <CardDescription>Create, edit, and manage your promotional coupons.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal('addCoupon')} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              {getCreateButtonText()}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Starts On</TableHead>
                  <TableHead>Expires On</TableHead>
                  {userRole === 'vendor' && <TableHead>Specialties</TableHead>}
                  {userRole === 'vendor' && <TableHead>Categories</TableHead>}
                  {userRole === 'doctor' && <TableHead>Applicable Conditions</TableHead>}
                  {userRole === 'supplier' && <TableHead>Min Order Amount</TableHead>}
                  <TableHead>Image</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {coupon.code}
                        {coupon.isCustomCode && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Custom</span>
                        )}
                      </div>
                    </TableCell>
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
                    <TableCell>{coupon.startDate.split('T')[0]}</TableCell>
                    <TableCell>{coupon.expires ? coupon.expires.split('T')[0] : 'N/A'}</TableCell>
                    {userRole === 'vendor' && <TableCell>{formatList(coupon.applicableSpecialties)}</TableCell>}
                    {userRole === 'vendor' && <TableCell>{formatList(coupon.applicableCategories)}</TableCell>}
                    {userRole === 'doctor' && (
                      <TableCell>
                        {coupon.applicableDiseases && coupon.applicableDiseases.length > 0 
                          ? `${coupon.applicableDiseases.length} condition(s)` 
                          : 'All conditions'
                        }
                      </TableCell>
                    )}
                    {userRole === 'supplier' && (
                      <TableCell>
                        {coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toLocaleString()}` : 'No minimum'}
                      </TableCell>
                    )}
                    <TableCell>
                      {coupon.offerImage ? (
                        <img 
                          src={coupon.offerImage} 
                          alt="Offer" 
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell>{coupon.redeemed}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('viewCoupon', coupon)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('editCoupon', coupon)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(coupon)} disabled={isDeleting}>
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
            totalItems={Array.isArray(couponsData) ? couponsData.length : 0}
          />
        </CardContent>
      </Card>

      <Dialog open={isOpen && (modalType === 'addCoupon' || modalType === 'editCoupon' || modalType === 'viewCoupon')} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'addCoupon' && getCreateButtonText()}
              {modalType === 'editCoupon' && `Edit ${userRole === 'doctor' ? 'Medical Offer' : userRole === 'supplier' ? 'Supplier Offer' : 'Coupon'}`}
              {modalType === 'viewCoupon' && `${userRole === 'doctor' ? 'Medical Offer' : userRole === 'supplier' ? 'Supplier Offer' : 'Coupon'} Details`}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'addCoupon' && `Enter the details for the new ${userRole === 'doctor' ? 'medical offer' : userRole === 'supplier' ? 'supplier offer' : 'coupon'}.`}
              {modalType === 'editCoupon' && `Update the details for this ${userRole === 'doctor' ? 'medical offer' : userRole === 'supplier' ? 'supplier offer' : 'coupon'}.`}
              {modalType === 'viewCoupon' && `Viewing details for this ${userRole === 'doctor' ? 'medical offer' : userRole === 'supplier' ? 'supplier offer' : 'coupon'}.`}
            </DialogDescription>
          </DialogHeader>
          
          {modalType === 'viewCoupon' ? (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Code</span>
                <span className="col-span-2 flex items-center gap-2">
                  {(data as Coupon)?.code || 'N/A'}
                  {(data as Coupon)?.isCustomCode && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Custom</span>
                  )}
                </span>
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
              
              {/* Role-specific view details */}
              {userRole === 'vendor' && (
                <>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Specialties</span>
                    <span className="col-span-2">{formatList((data as Coupon)?.applicableSpecialties)}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">Categories</span>
                    <span className="col-span-2">{formatList((data as Coupon)?.applicableCategories)}</span>
                  </div>
                </>
              )}

              {userRole === 'doctor' && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Applicable Conditions</span>
                  <span className="col-span-2">
                    {(data as Coupon)?.applicableDiseases && (data as Coupon).applicableDiseases.length > 0 
                      ? `${(data as Coupon).applicableDiseases.length} condition(s) selected` 
                      : 'All conditions'
                    }
                  </span>
                </div>
              )}

              {userRole === 'supplier' && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Min Order Amount</span>
                  <span className="col-span-2">
                    {(data as Coupon)?.minOrderAmount ? `₹${(data as Coupon).minOrderAmount?.toLocaleString()}` : 'No minimum'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Image</span>
                <div className="col-span-2">
                  {(data as Coupon)?.offerImage ? (
                    <img 
                      src={(data as Coupon).offerImage} 
                      alt="Offer" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : (
                    <span className="text-gray-400">No image uploaded</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Redeemed</span>
                <span className="col-span-2">{(data as Coupon)?.redeemed || 0}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              {/* Custom Code Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useCustomCode" 
                  checked={useCustomCode}
                  onCheckedChange={(checked) => {
                    setUseCustomCode(!!checked);
                    setValue('isCustomCode', !!checked);
                    if (!checked) {
                      setValue('code', '');
                    }
                  }}
                />
                <Label htmlFor="useCustomCode">Use custom coupon code</Label>
              </div>

              {/* Coupon Code Field */}
              {useCustomCode && (
                <div className="space-y-2">
                  <Label htmlFor="code">Custom Coupon Code</Label>
                  <Input 
                    id="code" 
                    placeholder="Enter custom code (e.g., SAVE20)"
                    {...register('code', { 
                      required: useCustomCode ? 'Custom coupon code is required' : false,
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message: 'Code must contain only uppercase letters and numbers'
                      }
                    })} 
                  />
                  {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
                  <p className="text-sm text-muted-foreground">
                    Leave unchecked to auto-generate a unique code
                  </p>
                </div>
              )}

              {/* Discount Type */}
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

              {/* Discount Value */}
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

              {/* Date Fields */}
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

              {/* Role-specific fields */}
              {userRole === 'vendor' && (
                <>
                  {/* Multiple Specialties Selection for Vendors */}
                  <div className="space-y-2">
                    <Label>Applicable Specialties (Select multiple or none for all)</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                      {specialtyOptions.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={(checked) => handleSpecialtyChange(specialty, !!checked)}
                          />
                          <Label htmlFor={`specialty-${specialty}`} className="text-sm">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedSpecialties.length === 0 ? 'Will apply to all specialties' : `Selected: ${selectedSpecialties.length}`}
                    </p>
                  </div>

                  {/* Multiple Categories Selection for Vendors */}
                  <div className="space-y-2">
                    <Label>Applicable Categories (Select multiple or none for all)</Label>
                    <div className="grid grid-cols-3 gap-2 p-3 border rounded-md">
                      {categoryOptions.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                          />
                          <Label htmlFor={`category-${category}`} className="text-sm">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategories.length === 0 ? 'Will apply to all categories' : `Selected: ${selectedCategories.length}`}
                    </p>
                  </div>
                </>
              )}

              {userRole === 'doctor' && (
                <div className="space-y-2">
                  <Label>Applicable Diseases/Conditions</Label>
                  {isSuperDataLoading ? (
                    <div className="p-3 border rounded-md">Loading diseases...</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                      {availableDiseases.map((disease: any) => (
                        <div key={disease._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`disease-${disease._id}`}
                            checked={selectedDiseases.includes(disease._id)}
                            onCheckedChange={(checked) => handleDiseaseChange(disease._id, !!checked)}
                          />
                          <Label htmlFor={`disease-${disease._id}`} className="text-sm">
                            {disease.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedDiseases.length === 0 ? 'Will apply to all conditions' : `Selected: ${selectedDiseases.length} condition(s)`}
                  </p>
                </div>
              )}

              {userRole === 'supplier' && (
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                  <Input 
                    id="minOrderAmount" 
                    type="number" 
                    step="0.01"
                    placeholder="Enter minimum order amount for this offer"
                    {...register('minOrderAmount', {
                      min: { value: 0, message: 'Amount must be greater than or equal to 0' }
                    })} 
                  />
                  {errors.minOrderAmount && <p className="text-red-500 text-sm">{errors.minOrderAmount.message}</p>}
                  <p className="text-sm text-muted-foreground">
                    Customers must spend at least this amount to use this offer
                  </p>
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Offer Image (Optional)</Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {previewImage ? (
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 border-dashed"
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">Upload Image</span>
                      </div>
                    </Button>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
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
