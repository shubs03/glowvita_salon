
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Tag,
  Star,
  BarChart2,
  Eye,
} from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import { Switch } from "@repo/ui/switch";
import { useDispatch, useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from "@repo/ui/badge";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetVendorServicesQuery,
  useCreateVendorServicesMutation,
  useUpdateVendorServicesMutation,
  useDeleteVendorServicesMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useGetStaffQuery,
  useGetAddOnsQuery,
  useGetSuperDataQuery,
  useCreateAddOnMutation
} from "@repo/store/api";
import Image from "next/image";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@repo/ui/pagination";
import { toast } from 'sonner';
import Link from "next/link";
import {
  setSearchTerm,
  setModalOpen,
  setDeleteModalOpen,
} from "@repo/store/slices/serviceSlice";
import { useAppSelector } from '@repo/store/hooks';
import { useCrmAuth } from "@/hooks/useCrmAuth";

// Interface definitions for component props
interface Category {
  _id: string;
  name: string;
}

interface FormData {
  name: string;
  category: Category | {};
  price: string | number;
  discountedPrice: string | number;
  duration: string | number;
  description: string;
  gender: string;
  staff: string[];
  commission: boolean;
  homeService: { available: boolean; charges: number | null };
  weddingService: { available: boolean; charges: number | null };
  bookingInterval: string | number;
  tax: { enabled: boolean; type: string; value: number | null };
  onlineBooking: boolean;
  image: string;
  status: string;
  addOns: string[];
}

interface Service {
  _id: string;
  name: string;
  category?: {
    _id: string;
    name?: string;
  };
  categoryName?: string;
  price?: number;
  discountedPrice?: number;
  duration?: number;
  description?: string;
  gender?: string;
  staff?: string[];
  commission?: boolean;
  homeService?: { available: boolean; charges: number | null };
  weddingService?: { available: boolean; charges: number | null };
  bookingInterval?: number;
  tax?: { enabled: boolean; type: string; value: number | null };
  onlineBooking?: boolean;
  image?: string;
  serviceImage?: string;
  status?: string;
  rejectionReason?: string;
  addOns?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: any) => void;
  itemType: string;
  categoryId?: string;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  type: string;
}

const AddItemModal = ({ isOpen, onClose, onItemCreated, itemType, categoryId }: AddItemModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    image?: string;
    submit?: string;
  }>({});

  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [createService, { isLoading: isCreatingService }] = useCreateServiceMutation();

  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  const { data: allServices = [] } = useGetServicesQuery(undefined);

  const isLoading = isCreatingCategory || isCreatingService;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setErrors(prev => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!image) {
      newErrors.image = `${itemType} image is required`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      let newItem;
      if (itemType === "Category") {
        // Check for duplicate category name
        const isDuplicate = categories.some(
          (cat: Category) => cat.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
          setErrors({ name: "A category with this name already exists" });
          return;
        }

        newItem = await createCategory({ name, description, image }).unwrap();
      } else if (itemType === "Service" && categoryId) {
        // Check for duplicate service name in the same category
        const isDuplicate = allServices.some(
          (service: Service) =>
            service.name.toLowerCase() === name.trim().toLowerCase() &&
            service.category?._id === categoryId
        );

        if (isDuplicate) {
          setErrors({ name: "A service with this name already exists in this category" });
          return;
        }

        newItem = await createService({ name, description, category: categoryId, image }).unwrap();
      } else {
        throw new Error("Invalid item type or missing categoryId");
      }
      setName("");
      setDescription("");
      setImage("");
      setErrors({});
      onItemCreated(newItem);
      onClose();
    } catch (error: any) {
      console.error(`Failed to create ${itemType}`, error);
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || `Failed to create ${itemType}`;
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New {itemType}</DialogTitle>
          <DialogDescription>
            Add a new {itemType.toLowerCase()} to your list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor={`new-${itemType}-name`}>{itemType} Name</Label>
            <Input
              id={`new-${itemType}-name`}
              placeholder={`e.g., Hair Styling`}
              value={name}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setName(val);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`new-${itemType}-description`}>Description</Label>
            <Textarea
              id={`new-${itemType}-description`}
              placeholder="A brief description."
              value={description}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s\.,!\?']+/g, "");
                setDescription(val);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              className={errors.description ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{itemType} Image</Label>
            <Input
              id="image"
              type="file"
              onChange={handleImageChange}
              className={errors.image ? "border-red-500 text-red-500" : ""}
              disabled={isLoading}
            />
            {errors.image && (
              <p className="text-xs text-red-500">{errors.image}</p>
            )}
          </div>
          {errors.submit && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.submit}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AddOnQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  allServices: Service[];
  vendorId: string;
}

const AddOnQuickCreateModal = ({ isOpen, onClose, serviceId, serviceName, allServices, vendorId }: AddOnQuickCreateModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    status: "active",
    selectedServices: [serviceId],
  });
  const [serviceSearch, setServiceSearch] = useState("");

  const [createAddOn, { isLoading: isCreating }] = useCreateAddOnMutation();
  const [updateVendorServices, { isLoading: isUpdating }] = useUpdateVendorServicesMutation();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        price: "",
        duration: "",
        status: "active",
        selectedServices: [serviceId],
      });
      setServiceSearch("");
    }
  }, [isOpen, serviceId]);

  const filteredServices = useMemo(() => {
    return allServices.filter((service: Service) =>
      service.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [allServices, serviceSearch]);

  const handleServiceToggle = (svcId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(svcId)
        ? prev.selectedServices.filter(id => id !== svcId)
        : [...prev.selectedServices, svcId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.selectedServices.length === allServices.length) {
      setFormData(prev => ({ ...prev, selectedServices: [serviceId] }));
    } else {
      setFormData(prev => ({ ...prev, selectedServices: allServices.map(s => s._id) }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter addon name");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!formData.duration || Number(formData.duration) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    if (formData.selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    try {
      // Step 1: Create the addon with selected services
      const addonPayload = {
        name: formData.name,
        price: Number(formData.price),
        duration: Number(formData.duration),
        status: formData.status,
        services: formData.selectedServices,
      };

      const createdAddOn = await createAddOn(addonPayload).unwrap();
      const newAddonId = createdAddOn._id || createdAddOn.addOn?._id;

      if (!newAddonId) {
        throw new Error("Failed to get addon ID from response");
      }

      // Step 2: Update each selected service to include this addon
      const servicesToUpdate = allServices
        .filter(service => formData.selectedServices.includes(service._id))
        .map(service => ({
          ...service,
          _id: service._id,
          category: service.category?._id || service.category,
          addOns: [...(service.addOns || []), newAddonId],
        }));

      if (servicesToUpdate.length > 0) {
        await updateVendorServices({
          vendor: vendorId,
          services: servicesToUpdate,
        }).unwrap();
      }

      const serviceCount = formData.selectedServices.length;
      toast.success(
        `Add-on "${formData.name}" created and linked to ${serviceCount} service${serviceCount > 1 ? 's' : ''}!`
      );
      onClose();
    } catch (error: any) {
      console.error("Failed to create add-on", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to create add-on";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Add-On</DialogTitle>
          <DialogDescription>
            Create a new add-on and select which services it applies to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          {/* Addon Details */}
          <div className="space-y-4 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="addon-name">Add-On Name *</Label>
              <Input
                id="addon-name"
                placeholder="e.g., Hair Wash, Deep Conditioning"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addon-price">Price (₹) *</Label>
                <Input
                  id="addon-price"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addon-duration">Duration (min) *</Label>
                <Input
                  id="addon-duration"
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Apply to Services *</Label>
              <Badge variant="secondary">
                {formData.selectedServices.length} selected
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-8"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="border rounded-md">
              <div className="p-3 border-b bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-services"
                    checked={formData.selectedServices.length === allServices.length}
                    onCheckedChange={handleSelectAll}
                    disabled={isSaving}
                  />
                  <Label htmlFor="select-all-services" className="font-semibold cursor-pointer">
                    Select All Services
                  </Label>
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto p-3 space-y-2">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service: Service) => (
                    <div key={service._id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md">
                      <Checkbox
                        id={`service-${service._id}`}
                        checked={formData.selectedServices.includes(service._id)}
                        onCheckedChange={() => handleServiceToggle(service._id)}
                        disabled={isSaving}
                      />
                      <Label htmlFor={`service-${service._id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{service.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {service.categoryName || "Uncategorized"}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No services found
                  </p>
                )}
              </div>
            </div>

            {serviceId && formData.selectedServices.includes(serviceId) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">{serviceName}</span> is pre-selected
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
            {isSaving ? "Creating..." : "Create & Link Add-On"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ServiceFormModal = ({ isOpen, onClose, service, type }: ServiceFormModalProps) => {
  const { user } = useCrmAuth();
  const VENDOR_ID = user?._id;

  const [activeTab, setActiveTab] = useState("basic");
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useGetCategoriesQuery(undefined);
  const {
    data: allServices = [],
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useGetServicesQuery(undefined);

  const { data: staffList = [], isLoading: staffLoading } = useGetStaffQuery(VENDOR_ID, { skip: !VENDOR_ID });

  // Fetch duration values from dropdown management
  const { data: superData = [] } = useGetSuperDataQuery(undefined);
  const durationValues = useMemo(() => {
    return superData.filter((item: any) => item.type === 'duration').map((item: any) => ({
      value: item.name,
      label: `${item.name} minutes`
    }));
  }, [superData]);

  const [createVendorServices, { isLoading: isCreating }] = useCreateVendorServicesMutation();
  const [updateVendorServices, { isLoading: isUpdating }] = useUpdateVendorServicesMutation();

  const { data: addOnsData, isLoading: addOnsLoading } = useGetAddOnsQuery(undefined);
  const availableAddOns = useMemo(() => {
    const allAddOns = addOnsData?.addOns || [];
    if (!service?._id) return [];
    return allAddOns.filter((addon: any) => {
      const services = addon.services || [];
      const serviceId = String(service._id);
      return services.some((id: any) => String(id) === serviceId) || String(addon.service) === serviceId;
    });
  }, [addOnsData, service]);

  const isSaving = isCreating || isUpdating;

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: {},
    price: '',
    discountedPrice: '',
    duration: '',
    description: '',
    gender: 'unisex',
    staff: [],
    commission: false,
    homeService: { available: false, charges: null },
    weddingService: { available: false, charges: null },
    bookingInterval: '',
    tax: { enabled: false, type: 'percentage', value: null },
    onlineBooking: true,
    image: '',
    status: 'pending',
    addOns: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service && type === "edit") {
      setFormData({
        name: service.name || '',
        category: service.category || {},
        price: String(service.price || ''),
        discountedPrice: String(service.discountedPrice || ''),
        duration: String(service.duration || ''),
        description: service.description || '',
        gender: service.gender || 'unisex',
        staff: service.staff || [],
        commission: service.commission || false,
        homeService: service.homeService || { available: false, charges: null },
        weddingService: service.weddingService || { available: false, charges: null },
        bookingInterval: String(service.bookingInterval || ''),
        tax: service.tax || { enabled: false, type: 'percentage', value: null },
        onlineBooking: service.onlineBooking !== undefined ? service.onlineBooking : true,
        image: service.image || '',
        status: service.status || 'pending',
        addOns: service.addOns || [],
      });
      setActiveTab("basic");
    } else {
      setFormData({
        name: '',
        category: {},
        price: '',
        discountedPrice: '',
        duration: '',
        description: '',
        gender: 'unisex',
        staff: [],
        commission: false,
        homeService: { available: false, charges: null },
        weddingService: { available: false, charges: null },
        bookingInterval: '',
        tax: { enabled: false, type: 'percentage', value: null },
        onlineBooking: true,
        image: '',
        status: 'pending',
        addOns: [],
      });
      setActiveTab("basic");
    }
  }, [service, isOpen, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Sanitize based on field type requirements
    if (name === "name" || name === "description") {
      // Name and Description: Alphabets and spaces only (allowing some punctuation for description)
      const regex = name === "name" ? /[^a-zA-Z\s]/g : /[^a-zA-Z\s\.,!\?']+/g;
      value = value.replace(regex, "");
    } else if (name === "price" || name === "discountedPrice" || name === "bookingInterval") {
      // Numeric fields: Digits only
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };


  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      // If the service name is being changed, sync image and description from master service
      if (name === "name") {
        const selectedService = servicesForCategory.find((s: Service) => s.name === value);
        if (selectedService) {
          newState.image = selectedService.serviceImage || selectedService.image || "";
          newState.description = selectedService.description || "";
        }
      }

      return newState;
    });

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c: Category) => c._id === categoryId);
    setFormData((prev) => ({ ...prev, category: category || {}, name: "" }));
  };

  const handleCheckboxChange = (name: string, id: string, checked: boolean) => {
    const currentValues = (formData as any)[name] || [];
    const newValues = checked ? [...currentValues, id] : currentValues.filter((val: string) => val !== id);
    setFormData((prev) => ({ ...prev, [name]: newValues }));

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (parent: string, child: string, value: any) => {
    let sanitizedValue = value;
    if (child === "charges" && typeof value === "string") {
      sanitizedValue = value.replace(/[^0-9]/g, "");
    }
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent] || {},
        [child]: sanitizedValue,
      },
    }));
  };

  const handleCategoryCreated = (newCategory: Category) => {
    refetchCategories();
    setFormData((prev) => ({ ...prev, category: newCategory }));
  };

  const handleServiceCreated = (newService: any) => {
    refetchServices();
    setFormData((prev) => ({
      ...prev,
      name: newService.name || "",
      description: newService.description || "",
      image: newService.serviceImage || newService.image || ""
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!VENDOR_ID) {
      console.error("Vendor ID is missing");
      return;
    }

    if (!formData.staff || formData.staff.length === 0) {
      setFormErrors(prev => ({ ...prev, staff: "Please select at least one staff member" }));
      toast.error("Please select at least one staff member");
      setActiveTab("advanced");
      return;
    }

    const payload = {
      ...formData,
      category: (formData.category as any)?._id || undefined,
      price: Number(formData.price) || 0,
      discountedPrice: Number(formData.discountedPrice) || 0,
      duration: Number(formData.duration) || 0,
      homeService: formData.homeService ? {
        ...formData.homeService,
        charges: Number(formData.homeService.charges) || null,
      } : { available: false, charges: null },
      weddingService: formData.weddingService ? {
        ...formData.weddingService,
        charges: Number(formData.weddingService.charges) || null,
      } : { available: false, charges: null },
      tax: formData.tax ? {
        ...formData.tax,
        value: Number(formData.tax.value) || null,
      } : { enabled: false, type: 'percentage', value: null },
      bookingInterval: Number(formData.bookingInterval) || 0,
      image: formData.image,
      status: service?._id ? formData.status : 'pending',
    };

    try {
      if (type === "add") {
        await createVendorServices({ vendor: VENDOR_ID, services: [payload] }).unwrap();
      } else if (type === "edit" && service?._id) {
        if (service.status === 'disapproved') {
          payload.status = 'pending';
        }
        await updateVendorServices({ vendor: VENDOR_ID, services: [{ ...payload, _id: service._id }] }).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save service", error);
    }
  };

  const servicesForCategory = useMemo(() => {
    const categoryId = (formData.category as any)?._id;
    return categoryId ? allServices.filter((s: Service) => s.category?._id === categoryId) : [];
  }, [allServices, formData.category]);

  const selectedCategoryId = (formData.category as any)?._id || '';

  const handleNextTab = () => {
    if (activeTab === "basic") {
      const errors: Record<string, string> = {};
      if (!(formData.category as any)?._id) errors.category = "Please select a category";
      if (!formData.name) errors.name = "Please select or create a service name";
      if (!formData.price || Number(formData.price) <= 0) errors.price = "Price is required and must be greater than 0";
      if (!formData.duration) errors.duration = "Please select service duration";

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }
      setFormErrors({});
      setActiveTab("advanced");
    } else if (activeTab === "advanced") {
      if (!formData.staff || formData.staff.length === 0) {
        setFormErrors(prev => ({ ...prev, staff: "Please select at least one staff member" }));
        toast.error("Please select at least one staff member");
        return;
      }
      setFormErrors({});
      setActiveTab("booking");
    }
  };

  const renderBasicInfoTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Service Category</Label>
          <div className="flex gap-2">
            <Select
              onValueChange={handleCategoryChange}
              value={selectedCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  categories.map((cat: Category) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <div className="flex gap-2">
            <Select
              value={formData.name || ""}
              onValueChange={(value) => handleSelectChange("name", value)}
              disabled={!('_id' in formData.category && formData.category._id)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (formData.category as any)?._id
                      ? "Select Service"
                      : "Select Category First"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {servicesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : servicesForCategory.length > 0 ? (
                  servicesForCategory.map((s: Service) => (
                    <SelectItem key={s._id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-services" disabled>
                    No service added
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsServiceModalOpen(true)}
              disabled={!('_id' in formData.category && formData.category._id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleInputChange}
          placeholder="e.g., A premium haircut experience..."
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            placeholder="e.g., 500"
            value={formData.price || ""}
            onChange={handleInputChange}
            className={formErrors.price ? "border-red-500" : ""}
          />
          {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
          <Input
            id="discountedPrice"
            name="discountedPrice"
            type="number"
            placeholder="e.g., 450"
            value={formData.discountedPrice || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select
            value={String(formData.duration || "")}
            onValueChange={(value) => handleSelectChange("duration", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationValues.length > 0 ? (
                durationValues.map((duration: any) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="60">60 minutes (default)</SelectItem>
              )}
            </SelectContent>
          </Select>
          {formErrors.duration && <p className="text-xs text-red-500 mt-1">{formErrors.duration}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender || "unisex"}
            onValueChange={(value) => handleSelectChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unisex">Unisex</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Service Image</Label>
        {formData.image && (
          <div className="relative w-24 h-24 mb-2 border rounded overflow-hidden">
            <Image
              src={formData.image}
              alt="Service Preview"
              fill
              className="object-cover"
            />
          </div>
        )}
        <Input id="image" type="file" onChange={handleImageChange} />
        {formData.image && (
          <p className="text-xs text-muted-foreground mt-1">
            Current image selected (upload another to change)
          </p>
        )}
      </div>
      <DialogFooter className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleNextTab}>
          Next
        </Button>
      </DialogFooter>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Staff</Label>
        <div className="p-4 border rounded-md max-h-48 overflow-y-auto space-y-2">
          {staffLoading ? <p>Loading staff...</p> : staffList.length > 0 ? (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="staff-all"
                  checked={formData.staff?.length === staffList.length}
                  onCheckedChange={(checked) =>
                    handleSelectChange("staff", checked ? staffList.map((s: any) => s._id) : [])
                  }
                />
                <Label htmlFor="staff-all" className="font-semibold">
                  Select All Staff
                </Label>
              </div>
              {staffList.map((staff: any) => (
                <div key={staff._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`staff-${staff._id}`}
                    checked={(formData.staff as string[])?.includes(staff._id) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("staff", staff._id, !!checked)
                    }
                  />
                  <Label htmlFor={`staff-${staff._id}`}>{staff.fullName}</Label>
                </div>
              ))}
            </>
          ) : <p>No staff found. Please add staff members first.</p>}
        </div>
        {formErrors.staff && <p className="text-xs text-red-500 mt-1">{formErrors.staff}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="commission"
          checked={formData.commission || false}
          onCheckedChange={(checked) => handleSelectChange("commission", checked)}
        />
        <Label htmlFor="commission">Enable Staff Commission</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-md space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="home-service"
              checked={formData.homeService?.available || false}
              onCheckedChange={(checked) =>
                handleNestedChange("homeService", "available", checked)
              }
            />
            <Label htmlFor="home-service">Home Service</Label>
          </div>
          {formData.homeService?.available && (
            <Input
              placeholder="Additional Charges (₹)"
              type="number"
              value={formData.homeService?.charges || ""}
              onChange={(e) =>
                handleNestedChange("homeService", "charges", Number(e.target.value))
              }
            />
          )}
        </div>
        <div className="p-4 border rounded-md space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="wedding-service"
              checked={formData.weddingService?.available || false}
              onCheckedChange={(checked) =>
                handleNestedChange("weddingService", "available", checked)
              }
            />
            <Label htmlFor="wedding-service">Wedding Service</Label>
          </div>
          {formData.weddingService?.available && (
            <Input
              placeholder="Additional Charges (₹)"
              type="number"
              value={formData.weddingService?.charges || ""}
              onChange={(e) =>
                handleNestedChange("weddingService", "charges", Number(e.target.value))
              }
            />
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Add-ons</Label>
        <div className="p-4 border rounded-md max-h-48 overflow-y-auto space-y-2">
          {addOnsLoading ? <p>Loading add-ons...</p> : availableAddOns.length > 0 ? (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addons-all"
                  checked={formData.addOns?.length === availableAddOns.length}
                  onCheckedChange={(checked) =>
                    handleSelectChange("addOns", checked ? availableAddOns.map((a: any) => a._id) : [])
                  }
                />
                <Label htmlFor="addons-all" className="font-semibold">
                  Select All Add-ons
                </Label>
              </div>
              {availableAddOns.map((addon: any) => (
                <div key={addon._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`addon-${addon._id}`}
                    checked={(formData.addOns as string[])?.includes(addon._id) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("addOns", addon._id, !!checked)
                    }
                  />
                  <Label htmlFor={`addon-${addon._id}`}>
                    {addon.name} (₹{addon.price})
                  </Label>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">No add-ons found.</p>
              <Link href="/add-ons">
                <Button variant="outline" size="sm">Create Add-ons</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <DialogFooter className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleNextTab}>
          Next
        </Button>
      </DialogFooter>
    </div>
  );

  const renderBookingTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookingInterval">Booking Interval</Label>
        <Select
          value={String(formData.bookingInterval || "")}
          onValueChange={(value) => handleSelectChange("bookingInterval", Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((i) => (
              <SelectItem key={i} value={String(i)}>
                {i} minutes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="tax-enabled"
          checked={formData.tax?.enabled || false}
          onCheckedChange={(checked) => handleNestedChange("tax", "enabled", checked)}
        />
        <Label htmlFor="tax-enabled">Enable Service Tax</Label>
      </div>
      {formData.tax?.enabled && (
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={formData.tax?.type || ""}
            onValueChange={(value) => handleNestedChange("tax", "type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tax type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Tax Value"
            value={formData.tax?.value || ""}
            onChange={(e) => handleNestedChange("tax", "value", Number(e.target.value))}
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch
          id="onlineBooking"
          checked={formData.onlineBooking || false}
          onCheckedChange={(checked) => handleSelectChange("onlineBooking", checked)}
        />
        <Label htmlFor="onlineBooking">Enable Online Booking</Label>
      </div>
      <DialogFooter className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !formData.name}>
          {isSaving ? "Saving..." : "Save Service"}
        </Button>
      </DialogFooter>
    </div>
  );

  if (type === "view") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>{service?.name || 'Service Details'}</DialogTitle>
            <DialogDescription>{service?.description || 'No description available'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Category:</span>{" "}
                {service?.categoryName || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Price:</span> ₹
                {service?.price?.toFixed(2) || 0}
              </div>
              <div>
                <span className="font-semibold">Discounted Price:</span> ₹
                {service?.discountedPrice ? service.discountedPrice.toFixed(2) : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Duration:</span>{" "}
                {service?.duration || 0} mins
              </div>
              <div>
                <span className="font-semibold">Booking Interval:</span>{" "}
                {service?.bookingInterval || 0} mins
              </div>
              <div>
                <span className="font-semibold">Gender:</span> {service?.gender || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Commission:</span>{" "}
                {service?.commission ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <span className="font-semibold">Online Booking:</span>{" "}
                {service?.onlineBooking ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <span className="font-semibold">Home Service:</span>{" "}
                {service?.homeService?.available ? `Available (₹${service.homeService.charges || 0})` : 'Not Available'}
              </div>
              <div>
                <span className="font-semibold">Wedding Service:</span>{" "}
                {service?.weddingService?.available ? `Available (₹${service.weddingService.charges || 0})` : 'Not Available'}
              </div>
              <div>
                <span className="font-semibold">Tax:</span>{" "}
                {service?.tax?.enabled ? `${service.tax.type === 'percentage' ? `${service.tax.value}%` : `₹${service.tax.value}`}` : 'Not Enabled'}
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <Badge
                  variant={
                    service?.status === 'approved' ? 'default' :
                      service?.status === 'disapproved' ? 'destructive' : 'secondary'
                  }
                  className={
                    service?.status === 'approved' ? 'bg-green-100 text-green-800' :
                      service?.status === 'disapproved' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                  }
                >
                  {service?.status || 'N/A'}
                </Badge>
              </div>
              {service?.status === 'disapproved' && service?.rejectionReason && (
                <div className="col-span-1 md:col-span-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <span className="font-semibold text-red-700 block mb-1">Rejection Reason:</span>
                  <p className="text-red-600">{service.rejectionReason}</p>
                </div>
              )}
              <div>
                <span className="font-semibold">Created At:</span>{" "}
                {service?.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Updated At:</span>{" "}
                {service?.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            {service?.addOns && service.addOns.length > 0 && (
              <div className="mt-4">
                <span className="font-semibold block mb-2">Selected Add-ons:</span>
                <div className="flex flex-wrap gap-2">
                  {service.addOns.map((addonId: string) => {
                    const addon = availableAddOns.find((a: any) => a._id === addonId);
                    return addon ? (
                      <Badge key={addonId} variant="secondary">
                        {addon.name} (₹{addon.price})
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {service?.image && (
              <div className="mt-4">
                <span className="font-semibold">Image:</span>
                <Image src={service.image} alt={service.name} width={200} height={200} className="mt-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {type === "add" ? "Add New Service" : "Edit Service"}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-grow flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced" disabled={!formData.name}>
              Advanced
            </TabsTrigger>
            <TabsTrigger value="booking" disabled={!formData.name}>
              Booking & Tax
            </TabsTrigger>
          </TabsList>
          <div className="py-4 flex-grow overflow-y-auto">
            <TabsContent value="basic">{renderBasicInfoTab()}</TabsContent>
            <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
            <TabsContent value="booking">{renderBookingTab()}</TabsContent>
          </div>
        </Tabs>
        <AddItemModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onItemCreated={handleCategoryCreated}
          itemType="Category"
        />
        <AddItemModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onItemCreated={handleServiceCreated}
          itemType="Service"
          categoryId={selectedCategoryId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function ServicesPage() {
  const { user } = useCrmAuth();
  const dispatch = useDispatch();
  const serviceState = useAppSelector((state: any) => state.service || {
    searchTerm: '',
    isModalOpen: false,
    isDeleteModalOpen: false,
    selectedService: null,
    modalType: 'add',
  });

  const {
    searchTerm,
    isModalOpen,
    isDeleteModalOpen,
    selectedService,
    modalType,
  } = serviceState;

  const {
    data = {},
    isLoading,
    isError,
    error,
    refetch,
  } = useGetVendorServicesQuery({ vendorId: user?._id }, { skip: !user?._id });


  const services = data.services || [];

  console.log("Services Data on Services page : ", services)

  const [deleteVendorServices] = useDeleteVendorServicesMutation();
  const [updateVendorServices] = useUpdateVendorServicesMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [selectedServiceForAddOn, setSelectedServiceForAddOn] = useState<Service | null>(null);

  const filteredServices = useMemo(() => {
    return services.filter(
      (service: Service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.categoryName &&
          service.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [services, searchTerm]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredServices.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handleOpenModal = (type: string, service: Service | null = null) => {
    dispatch(setModalOpen({ isOpen: true, modalType: type, selectedService: service }));
  };

  const handleCloseModal = () => {
    dispatch(setModalOpen({ isOpen: false, modalType: 'add', selectedService: null }));
    refetch();
  };

  const handleDeleteClick = (service: Service) => {
    dispatch(setDeleteModalOpen({ isOpen: true, selectedService: service }));
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteVendorServices({
        vendorId: user?._id,
        serviceId: selectedService?._id,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete service", error);
    }
    dispatch(setDeleteModalOpen({ isOpen: false, selectedService: null }));
  };

  const handleAddOnClick = (service: Service) => {
    setSelectedServiceForAddOn(service);
    setIsAddOnModalOpen(true);
  };

  const handleAddOnModalClose = () => {
    setIsAddOnModalOpen(false);
    setSelectedServiceForAddOn(null);
    refetch();
  };

  const handleVisibilityToggle = async (service: any) => {
    try {
      const updatedService = { ...service, onlineBooking: !service.onlineBooking };
      await updateVendorServices({
        vendor: user?._id,
        services: [updatedService],
      }).unwrap();
      refetch();
      toast.success(`Service visibility updated successfully!`);
    } catch (error) {
      console.error("Failed to toggle service visibility", error);
      toast.error("Failed to update service visibility.");
    }
  };

  const isNoServicesError = isError && (error as any)?.data?.message === "No services found for this vendor";

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Service", "Category", "Duration", "Price", "Status", "Active", "Actions"].map((_, i) => (
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
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </TableCell>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Service Management</h1>
          <p className="text-muted-foreground">Manage the services your salon offers.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>
          <Button onClick={() => handleOpenModal("add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Total services offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length > 0 ? services[0].name : "N/A"}</div>
            <p className="text-xs text-muted-foreground">Top-selling service</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Service Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(services.length > 0 ? services.reduce((acc: number, s: Service) => acc + (s.price || 0), 0) / services.length : 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Average across all services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0 ? new Set(services.map((s: Service) => s.categoryName)).size : 0}
            </div>
            <p className="text-xs text-muted-foreground">Unique service categories</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isError && !isNoServicesError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Failed to load services. Please try again later.
                      <Button onClick={() => refetch()} className="ml-4">
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((service: Service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={service.image || "https://placehold.co/40x40.png"}
                            alt={service.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {service.categoryName || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>{service.duration} mins</TableCell>
                      <TableCell>₹{service.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            service.status === 'approved' ? 'default' :
                              service.status === 'disapproved' ? 'destructive' : 'secondary'
                          }
                          className={
                            service.status === 'approved' ? 'bg-green-100 text-green-800' :
                              service.status === 'disapproved' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {service.status}
                        </Badge>
                        {service.status === 'disapproved' && service.rejectionReason && (
                          <p className="text-[10px] text-red-500 mt-1 max-w-[150px] leading-tight" title={service.rejectionReason}>
                            Reason: {service.rejectionReason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.onlineBooking}
                          onCheckedChange={() => handleVisibilityToggle(service)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {service.status === 'disapproved' && (
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal("edit", service)}>
                            <span className="text-xs">Resubmit</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal("view", service)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal("edit", service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleAddOnClick(service)} title="Add Addon">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(service)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      {isNoServicesError ? "No services found. Add your first service to get started!" : "No matching services found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredServices.length > 0 && (
            <Pagination
              className="mt-4 p-4 border-t"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredServices.length}
            />
          )}
        </CardContent>
      </Card>

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        type={modalType}
      />

      <AddOnQuickCreateModal
        isOpen={isAddOnModalOpen}
        onClose={handleAddOnModalClose}
        serviceId={selectedServiceForAddOn?._id || ""}
        serviceName={selectedServiceForAddOn?.name || ""}
        allServices={services}
        vendorId={user?._id || ""}
      />

      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) =>
          dispatch(setDeleteModalOpen({ isOpen: open, selectedService }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(setDeleteModalOpen({ isOpen: false, selectedService: null }))
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}

