// crm/offers/page.tsx (modified to include advanced features like the admin panel)

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Edit2,
  Eye,
  Trash2,
  Plus,
  Percent,
  Tag,
  CheckSquare,
  IndianRupee,
  Upload,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import {
  closeModal,
  openModal,
} from "../../../../../packages/store/src/slices/modalSlice.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { useForm } from "react-hook-form";
import {
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useGetSuperDataQuery,
  useGetVendorServicesQuery,
  useGetCategoriesQuery,
} from "@repo/store/api";
import { toast } from "sonner";
import { selectRootState } from "@repo/store/store";
import { useCrmAuth } from "@/hooks/useCrmAuth";

// Import new components
import OffersStatsCards from "./components/OffersStatsCards";
import OffersFiltersToolbar from "./components/OffersFiltersToolbar";
import OffersTable from "./components/OffersTable";
import OffersPaginationControls from "./components/OffersPaginationControls";

type Coupon = {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  status: string;
  startDate: string;
  expires: string;
  redeemed: number;
  applicableSpecialties: string[];
  applicableCategories: string[];
  applicableDiseases: string[];
  applicableServices: string[];
  applicableServiceCategories: string[];
  minOrderAmount?: number;
  offerImage?: string;
  isCustomCode?: boolean;
  businessType: string;
  businessId: string;
};

type CouponForm = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: string;
  expires: string;
  applicableSpecialties: string[];
  applicableCategories: string[];
  applicableDiseases: string[];
  applicableServices: string[];
  applicableServiceCategories: string[];
  minOrderAmount?: number;
  offerImage?: string;
  isCustomCode: boolean;
};

// Predefined options for categories (genders)
const categoryOptions = ["Men", "Women", "Unisex"];

export default function OffersCouponsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<
    string[]
  >([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user and business info from auth context
  const auth = useCrmAuth();
  const userRole = auth?.role || "vendor"; // Simplified fallback
  const businessId = auth?.user?._id; // Use user ID as businessId

  console.log("Auth Debug:", { auth, userRole, businessId }); // Debug auth values

  const dispatch = useAppDispatch();
  const { isOpen, modalType, data } = useAppSelector(
    (state) => selectRootState(state).modal
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponForm>({
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      startDate: "",
      expires: "",
      applicableSpecialties: [], // Keep for API compatibility but don't use in UI
      applicableCategories: [],
      applicableDiseases: [],
      applicableServices: [],
      applicableServiceCategories: [],
      minOrderAmount: 0,
      offerImage: "",
      isCustomCode: false,
    },
  });

  // Prepare query parameters with memoization to prevent infinite re-renders
  const queryParams = useMemo(
    () => ({
      businessId: businessId || "",
      businessType: userRole,
      ...(auth?.user?._id && { vendorId: auth.user._id }), // Use consistent user ID
    }),
    [businessId, userRole, auth?.user?._id]
  );

  // RTK Query hooks with proper query parameters
  const {
    data: couponsData = [],
    isLoading,
    isError,
    refetch,
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

  const { data: superData = [], isLoading: isSuperDataLoading } =
    useGetSuperDataQuery(undefined);

  // Fetch vendor services and categories
  const { data: vendorServicesData, isLoading: isServicesLoading } =
    useGetVendorServicesQuery(
      { vendorId: businessId, page: 1, limit: 1000 },
      { skip: !businessId || userRole !== "vendor" }
    );
  const { data: categoriesData = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery(undefined, {
      skip: userRole !== "vendor",
    });

  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  // Get diseases from superData for doctors
  const availableDiseases = useMemo(() => {
    return superData?.filter((item: any) => item.type === "disease") || [];
  }, [superData]);

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setValue("offerImage", base64);
        setPreviewImage(base64);
      } catch (error) {
        toast.error("Error processing image");
      }
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setValue("offerImage", "");
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle category selection (for genders)
  const handleCategoryChange = (category: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);
    setSelectedCategories(updated);
    setValue("applicableCategories", updated);
  };

  // Handle disease selection (for doctors)
  const handleDiseaseChange = (diseaseId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedDiseases, diseaseId]
      : selectedDiseases.filter((d) => d !== diseaseId);
    setSelectedDiseases(updated);
    setValue("applicableDiseases", updated);
  };

  // Handle service selection
  const handleServiceChange = (serviceId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedServices, serviceId]
      : selectedServices.filter((s) => s !== serviceId);

    setSelectedServices(updated);
    setValue("applicableServices", updated);

    // Automatically update service categories based on selected services
    const autoCategories = getAutoCategoriesFromServices(updated);

    // Merge auto-detected categories with manually selected ones
    // Keep manually selected categories that don't conflict with auto-detected ones
    const currentManualCategories = selectedServiceCategories.filter(
      (catId) => !autoCategories.includes(catId)
    );

    const finalCategories = Array.from(
      new Set([...autoCategories, ...currentManualCategories])
    );

    setSelectedServiceCategories(finalCategories);
    setValue("applicableServiceCategories", finalCategories);
  };

  // Handle service category selection
  const handleServiceCategoryChange = (
    categoryId: string,
    checked: boolean
  ) => {
    // Get auto-detected categories from currently selected services
    const autoCategories = getAutoCategoriesFromServices(selectedServices);

    // If this is an auto-detected category, don't allow manual deselection
    if (autoCategories.includes(categoryId) && !checked) {
      // Show a message or just return without changing
      return;
    }

    const updated = checked
      ? [...selectedServiceCategories, categoryId]
      : selectedServiceCategories.filter((c) => c !== categoryId);

    setSelectedServiceCategories(updated);
    setValue("applicableServiceCategories", updated);
  };

  // Update form values when editing
  useEffect(() => {
    if (modalType === "editCoupon" && data) {
      const coupon = data as Coupon;
      setValue("code", coupon.code || "");
      setValue("type", coupon.type || "percentage");
      setValue("value", coupon.value || 0);
      setValue(
        "startDate",
        coupon.startDate ? coupon.startDate.split("T")[0] : ""
      );
      setValue("expires", coupon.expires ? coupon.expires.split("T")[0] : "");

      const categories = Array.isArray(coupon.applicableCategories)
        ? coupon.applicableCategories
        : [];
      const diseases = Array.isArray(coupon.applicableDiseases)
        ? coupon.applicableDiseases
        : [];
      const services = Array.isArray(coupon.applicableServices)
        ? coupon.applicableServices
        : [];
      const serviceCategories = Array.isArray(
        coupon.applicableServiceCategories
      )
        ? coupon.applicableServiceCategories
        : [];

      setSelectedCategories(categories);
      setSelectedDiseases(diseases);
      setSelectedServices(services);

      // When editing, apply auto-selection logic to existing services
      const autoCategories = getAutoCategoriesFromServices(services);
      const mergedServiceCategories = Array.from(
        new Set([...autoCategories, ...serviceCategories])
      );
      setSelectedServiceCategories(mergedServiceCategories);

      setValue("applicableCategories", categories);
      setValue("applicableDiseases", diseases);
      setValue("applicableServices", services);
      setValue("applicableServiceCategories", mergedServiceCategories);
      setValue("minOrderAmount", coupon.minOrderAmount || 0);
      setValue("offerImage", coupon.offerImage || "");
      setPreviewImage(coupon.offerImage || null);
      setUseCustomCode(coupon.isCustomCode || false);
      setValue("isCustomCode", coupon.isCustomCode || false);
    } else {
      reset();
      setSelectedCategories([]);
      setSelectedDiseases([]);
      setSelectedServices([]);
      setSelectedServiceCategories([]);
      setPreviewImage(null);
      setUseCustomCode(false);
    }
  }, [modalType, data, setValue, reset, vendorServicesData]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = Array.isArray(couponsData)
    ? couponsData.slice(firstItemIndex, lastItemIndex)
    : [];

  const totalPages = Array.isArray(couponsData)
    ? Math.ceil(couponsData.length / itemsPerPage)
    : 1;

  const handleOpenModal = (
    type: "addCoupon" | "editCoupon" | "viewCoupon",
    coupon?: Coupon
  ) => {
    dispatch(openModal({ modalType: type, data: coupon }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
    reset();
    setSelectedCategories([]);
    setSelectedDiseases([]);
    setSelectedServices([]);
    setSelectedServiceCategories([]);
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
        toast.success("Coupon deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedCoupon(null);
      } catch (error) {
        toast.error("Failed to delete coupon");
      }
    }
  };

  const onSubmit = async (formData: CouponForm) => {
    // Validate required data
    if (!businessId || !userRole) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const processedData = {
      ...formData,
      code: useCustomCode ? formData.code : "", // Send empty if auto-generate
      applicableSpecialties: [], // Empty array since we removed specialties
      applicableCategories: userRole === "vendor" ? selectedCategories : [],
      applicableDiseases: userRole === "doctor" ? selectedDiseases : [],
      applicableServices: userRole === "vendor" ? selectedServices : [],
      applicableServiceCategories:
        userRole === "vendor" ? selectedServiceCategories : [],
      minOrderAmount:
        userRole === "supplier" ? formData.minOrderAmount : undefined,
      isCustomCode: useCustomCode,
      businessType: userRole,
      businessId: businessId,
    };

    try {
      if (modalType === "addCoupon") {
        await createOffer(processedData).unwrap();
        toast.success("Coupon created successfully");
      } else if (modalType === "editCoupon" && data) {
        await updateOffer({
          id: (data as Coupon)._id,
          ...processedData,
        }).unwrap();
        toast.success("Coupon updated successfully");
      }
      handleCloseModal();
    } catch (error) {
      toast.error(
        modalType === "addCoupon"
          ? "Failed to create coupon"
          : "Failed to update coupon"
      );
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "percentage") {
      return `${coupon.value}% Off`;
    }
    return `₹${coupon.value} Off`;
  };

  const formatList = (list: string[] | undefined | null): string => {
    if (!Array.isArray(list) || list.length === 0) {
      return "All";
    }
    return list.join(", ");
  };

  // Helper function to get service names from IDs
  const getServiceNames = (serviceIds: string[]): string => {
    if (!Array.isArray(serviceIds) || serviceIds.length === 0)
      return "All services";
    if (!vendorServicesData?.services) return `${serviceIds.length} service(s)`;

    const serviceNames = serviceIds
      .map(
        (id) => vendorServicesData.services.find((s: any) => s._id === id)?.name
      )
      .filter((name) => name);

    return serviceNames.length > 0
      ? serviceNames.join(", ")
      : `${serviceIds.length} service(s)`;
  };

  // Helper function to get category names from IDs
  const getCategoryNames = (categoryIds: string[]): string => {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0)
      return "All categories";
    if (!categoriesData || categoriesData.length === 0)
      return `${categoryIds.length} category(ies)`;

    const categoryNames = categoryIds
      .map((id) => categoriesData.find((c: any) => c._id === id)?.name)
      .filter((name) => name);

    return categoryNames.length > 0
      ? categoryNames.join(", ")
      : `${categoryIds.length} category(ies)`;
  };

  // Helper function to automatically detect categories from selected services
  const getAutoCategoriesFromServices = (serviceIds: string[]): string[] => {
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) return [];
    if (!vendorServicesData?.services) return [];

    const selectedServiceObjects = serviceIds
      .map((id) => vendorServicesData.services.find((s: any) => s._id === id))
      .filter((service) => service);

    // Extract unique category IDs from selected services
    const categoryIds = Array.from(
      new Set(
        selectedServiceObjects
          .map((service: any) => service.category)
          .filter((categoryId) => categoryId)
      )
    );

    return categoryIds;
  };

  const totalDiscountValue = Array.isArray(couponsData)
    ? couponsData.reduce((acc, coupon) => {
        if (coupon.type === "fixed") {
          return acc + coupon.value * coupon.redeemed;
        }
        return acc + 1000 * (coupon.value / 100) * coupon.redeemed;
      }, 0)
    : 0;

  // Get role-specific page title
  const getPageTitle = () => {
    switch (userRole) {
      case "doctor":
        return "Medical Offers & Promotions";
      case "supplier":
        return "Supplier Offers & Discounts";
      case "vendor":
      default:
        return "Offers & Coupons";
    }
  };

  // Get role-specific button text
  const getCreateButtonText = () => {
    switch (userRole) {
      case "doctor":
        return "Create Medical Offer";
      case "supplier":
        return "Create Supplier Offer";
      case "vendor":
      default:
        return "Create New Coupon";
    }
  };

  // Handle authentication state
  if (!auth) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground">
          Please log in to view your offers.
        </p>
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
                    {[
                      "Code",
                      "Type",
                      "Value",
                      "Status",
                      "Expiry",
                      "Usage",
                      "Actions",
                    ].map((_, i) => (
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
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Error Loading Offers
        </h2>
        <p className="text-muted-foreground mb-4">
          There was a problem loading your offers.
        </p>
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
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              {userRole === "doctor"
                ? "Manage your medical offers and promotions"
                : userRole === "supplier"
                  ? "Manage your supplier offers and discounts"
                  : "Manage your coupons and offers and discounts"}
            </p>
          </div>
        </div>
      </div>

      {/* Offers Stats Cards */}
      <OffersStatsCards couponsData={couponsData} />

      <Card>
        <CardHeader>
          <OffersFiltersToolbar
            onAddCoupon={() => handleOpenModal("addCoupon")}
            getCreateButtonText={getCreateButtonText}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar">
            <OffersTable
              currentItems={currentItems}
              userRole={userRole}
              onOpenModal={handleOpenModal}
              onDeleteClick={handleDeleteClick}
              formatDiscount={formatDiscount}
              formatList={formatList}
              getServiceNames={getServiceNames}
              getCategoryNames={getCategoryNames}
              getAutoCategoriesFromServices={getAutoCategoriesFromServices}
              isDeleting={isDeleting}
            />
          </div>
          <OffersPaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={Array.isArray(couponsData) ? couponsData.length : 0}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      <Dialog
        open={
          isOpen &&
          (modalType === "addCoupon" ||
            modalType === "editCoupon" ||
            modalType === "viewCoupon")
        }
        onOpenChange={handleCloseModal}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>
              {modalType === "addCoupon" && getCreateButtonText()}
              {modalType === "editCoupon" &&
                `Edit ${userRole === "doctor" ? "Medical Offer" : userRole === "supplier" ? "Supplier Offer" : "Coupon"}`}
              {modalType === "viewCoupon" &&
                `${userRole === "doctor" ? "Medical Offer" : userRole === "supplier" ? "Supplier Offer" : "Coupon"} Details`}
            </DialogTitle>
            <DialogDescription>
              {modalType === "addCoupon" &&
                `Enter the details for the new ${userRole === "doctor" ? "medical offer" : userRole === "supplier" ? "supplier offer" : "coupon"}.`}
              {modalType === "editCoupon" &&
                `Update the details for this ${userRole === "doctor" ? "medical offer" : userRole === "supplier" ? "supplier offer" : "coupon"}.`}
              {modalType === "viewCoupon" &&
                `Viewing details for this ${userRole === "doctor" ? "medical offer" : userRole === "supplier" ? "supplier offer" : "coupon"}.`}
            </DialogDescription>
          </DialogHeader>

          {modalType === "viewCoupon" ? (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Code
                </span>
                <span className="col-span-2">
                  {(data as Coupon)?.code || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Code Type
                </span>
                <span className="col-span-2">
                  {(data as Coupon)?.isCustomCode ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      <span className="text-primary font-medium">
                        Custom Code
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      <span className="text-primary font-medium">
                        Auto-generated
                      </span>
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Discount
                </span>
                <span className="col-span-2">
                  {data ? formatDiscount(data as Coupon) : "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Status
                </span>
                <span className="col-span-2">
                  {(data as Coupon)?.status || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Starts
                </span>
                <span className="col-span-2">
                  {(data as Coupon)?.startDate?.split("T")[0] || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Expires
                </span>
                <span className="col-span-2">
                  {(data as Coupon)?.expires
                    ? (data as Coupon).expires.split("T")[0]
                    : "N/A"}
                </span>
              </div>

              {/* Role-specific view details */}
              {userRole === "vendor" && (
                <>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">
                      Services
                    </span>
                    <span className="col-span-2">
                      {(data as Coupon)?.applicableServices &&
                      (data as Coupon).applicableServices.length > 0
                        ? getServiceNames((data as Coupon).applicableServices)
                        : "All services"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">
                      Service Categories
                    </span>
                    <span className="col-span-2">
                      {(data as Coupon)?.applicableServiceCategories &&
                      (data as Coupon).applicableServiceCategories.length > 0
                        ? (() => {
                            const allCategories = (data as Coupon)
                              .applicableServiceCategories;
                            const autoCategories =
                              getAutoCategoriesFromServices(
                                (data as Coupon).applicableServices || []
                              );
                            const manualCategories = allCategories.filter(
                              (id) => !autoCategories.includes(id)
                            );

                            const autoCategoryNames =
                              getCategoryNames(autoCategories);
                            const manualCategoryNames =
                              getCategoryNames(manualCategories);

                            return (
                              <div>
                                {autoCategories.length > 0 && (
                                  <div className="text-blue-600">
                                    Auto: {autoCategoryNames}
                                  </div>
                                )}
                                {manualCategories.length > 0 && (
                                  <div>Manual: {manualCategoryNames}</div>
                                )}
                                {autoCategories.length === 0 &&
                                  manualCategories.length === 0 &&
                                  "All categories"}
                              </div>
                            );
                          })()
                        : "All categories"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold text-muted-foreground">
                      Applicable Genders
                    </span>
                    <span className="col-span-2">
                      {(data as Coupon)?.applicableCategories &&
                      (data as Coupon).applicableCategories.length > 0
                        ? formatList((data as Coupon)?.applicableCategories)
                        : "All genders"}
                    </span>
                  </div>
                </>
              )}

              {userRole === "doctor" && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">
                    Applicable Conditions
                  </span>
                  <span className="col-span-2">
                    {(data as Coupon)?.applicableDiseases &&
                    (data as Coupon).applicableDiseases.length > 0
                      ? `${(data as Coupon).applicableDiseases.length} condition(s) selected`
                      : "All conditions"}
                  </span>
                </div>
              )}

              {userRole === "supplier" && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">
                    Min Order Amount
                  </span>
                  <span className="col-span-2">
                    {(data as Coupon)?.minOrderAmount
                      ? `₹${(data as Coupon).minOrderAmount?.toLocaleString()}`
                      : "No minimum"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">
                  Image
                </span>
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
                <span className="font-semibold text-muted-foreground">
                  Redeemed
                </span>
                <span className="col-span-2">
                  {(data as Coupon)?.redeemed || 0}
                </span>
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
                    setValue("isCustomCode", !!checked);
                    if (!checked) {
                      setValue("code", "");
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
                    {...register("code", {
                      required: useCustomCode
                        ? "Custom coupon code is required"
                        : false,
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message:
                          "Code must contain only uppercase letters and numbers",
                      },
                    })}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm">
                      {errors.code.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Leave unchecked to auto-generate a unique code
                  </p>
                </div>
              )}

              {/* Discount Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select
                  defaultValue={(data as Coupon)?.type || "percentage"}
                  onValueChange={(value) =>
                    setValue("type", value as "percentage" | "fixed")
                  }
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
                  {...register("value", {
                    required: "Discount value is required",
                    min: { value: 1, message: "Value must be greater than 0" },
                  })}
                />
                {errors.value && (
                  <p className="text-red-500 text-sm">{errors.value.message}</p>
                )}
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Starts On</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate", {
                      required: "Start date is required",
                    })}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires On</Label>
                  <Input id="expires" type="date" {...register("expires")} />
                </div>
              </div>

              {/* Role-specific fields */}
              {userRole === "vendor" && (
                <>
                  {/* Services Selection */}
                  <div className="space-y-2">
                    <Label>
                      Applicable Services (Select specific services or leave
                      empty for all)
                    </Label>
                    {isServicesLoading ? (
                      <div className="p-3 border rounded-md">
                        Loading services...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                        {vendorServicesData?.services
                          ?.filter(
                            (service: any) => service.status === "approved"
                          )
                          .map((service: any) => (
                            <div
                              key={service._id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`service-${service._id}`}
                                checked={selectedServices.includes(service._id)}
                                onCheckedChange={(checked) =>
                                  handleServiceChange(service._id, !!checked)
                                }
                              />
                              <Label
                                htmlFor={`service-${service._id}`}
                                className="text-sm"
                              >
                                {service.name} - ₹{service.price} (
                                {service.categoryName})
                              </Label>
                            </div>
                          )) || (
                          <div className="text-sm text-muted-foreground">
                            No approved services found
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {selectedServices.length === 0 ? (
                        "Will apply to all services"
                      ) : (
                        <>
                          Selected: {selectedServices.length} service(s)
                          {selectedServices.length > 0 && (
                            <span className="block text-blue-600">
                              Auto-selecting{" "}
                              {
                                getAutoCategoriesFromServices(selectedServices)
                                  .length
                              }{" "}
                              category(ies) from these services
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Service Categories Selection */}
                  <div className="space-y-2">
                    <Label>
                      Applicable Service Categories (Auto-selected based on
                      services + manual selection)
                    </Label>
                    {isCategoriesLoading ? (
                      <div className="p-3 border rounded-md">
                        Loading categories...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                        {categoriesData.map((category: any) => {
                          const autoCategories =
                            getAutoCategoriesFromServices(selectedServices);
                          const isAutoSelected = autoCategories.includes(
                            category._id
                          );
                          const isSelected = selectedServiceCategories.includes(
                            category._id
                          );

                          return (
                            <div
                              key={category._id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`service-category-${category._id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleServiceCategoryChange(
                                    category._id,
                                    !!checked
                                  )
                                }
                                disabled={isAutoSelected}
                              />
                              <Label
                                htmlFor={`service-category-${category._id}`}
                                className={`text-sm ${isAutoSelected ? "text-blue-600 font-medium" : ""}`}
                              >
                                {category.name}
                                {isAutoSelected && (
                                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                    Auto
                                  </span>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {selectedServiceCategories.length === 0
                        ? "Will apply to all categories"
                        : `Selected: ${selectedServiceCategories.length} category(ies)`}
                      {getAutoCategoriesFromServices(selectedServices).length >
                        0 && (
                        <span className="block text-blue-600">
                          {
                            getAutoCategoriesFromServices(selectedServices)
                              .length
                          }{" "}
                          category(ies) auto-selected from services
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                    <strong>How it works:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      <li>
                        When you select specific services, their categories are
                        automatically selected
                      </li>
                      <li>
                        Auto-selected categories (marked with "Auto") cannot be
                        manually deselected
                      </li>
                      <li>
                        You can manually select additional categories beyond
                        those auto-selected
                      </li>
                      <li>
                        If you select both services and additional categories,
                        the offer applies to:
                      </li>
                      <ul className="ml-4 list-disc list-inside">
                        <li>All selected services</li>
                        <li>All services in auto-selected categories</li>
                        <li>All services in manually selected categories</li>
                      </ul>
                      <li>
                        If you select neither services nor categories, the offer
                        applies to all your services
                      </li>
                    </ul>
                  </div>

                  {/* Legacy fields for backward compatibility */}
                  <details className="border rounded-md p-2">
                    <summary className="text-sm font-medium cursor-pointer">
                      Legacy Compatibility Settings
                    </summary>
                    <div className="mt-2 space-y-2">
                      {/* Multiple Genders Selection for Vendors */}
                      <div className="space-y-2">
                        <Label>
                          Applicable Genders (for backward compatibility)
                        </Label>
                        <div className="grid grid-cols-3 gap-2 p-3 border rounded-md">
                          {categoryOptions.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`category-${category}`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) =>
                                  handleCategoryChange(category, !!checked)
                                }
                              />
                              <Label
                                htmlFor={`category-${category}`}
                                className="text-sm"
                              >
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedCategories.length === 0
                            ? "Will apply to all genders"
                            : `Selected: ${selectedCategories.length}`}
                        </p>
                      </div>
                    </div>
                  </details>
                </>
              )}

              {userRole === "doctor" && (
                <div className="space-y-2">
                  <Label>Applicable Diseases/Conditions</Label>
                  {isSuperDataLoading ? (
                    <div className="p-3 border rounded-md">
                      Loading diseases...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                      {availableDiseases.map((disease: any) => (
                        <div
                          key={disease._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`disease-${disease._id}`}
                            checked={selectedDiseases.includes(disease._id)}
                            onCheckedChange={(checked) =>
                              handleDiseaseChange(disease._id, !!checked)
                            }
                          />
                          <Label
                            htmlFor={`disease-${disease._id}`}
                            className="text-sm"
                          >
                            {disease.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedDiseases.length === 0
                      ? "Will apply to all conditions"
                      : `Selected: ${selectedDiseases.length} condition(s)`}
                  </p>
                </div>
              )}

              {userRole === "supplier" && (
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">
                    Minimum Order Amount (₹)
                  </Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter minimum order amount for this offer"
                    {...register("minOrderAmount", {
                      min: {
                        value: 0,
                        message: "Amount must be greater than or equal to 0",
                      },
                    })}
                  />
                  {errors.minOrderAmount && (
                    <p className="text-red-500 text-sm">
                      {errors.minOrderAmount.message}
                    </p>
                  )}
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {modalType === "addCoupon"
                    ? "Create Coupon"
                    : "Update Coupon"}
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
              Are you sure you want to delete the coupon "{selectedCoupon?.code}
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
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
