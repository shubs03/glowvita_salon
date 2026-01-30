import { useState, useEffect, useMemo } from "react";
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
import { Checkbox } from "@repo/ui/checkbox";
import { Switch } from "@repo/ui/switch";
import { Plus, Edit, Trash2, Search, DollarSign, Tag, Star, BarChart2, Eye } from "lucide-react";
import { useDispatch } from 'react-redux';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetVendorServicesQuery,
  useCreateVendorServicesMutation,
  useUpdateVendorServicesMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useGetStaffQuery,
  useGetAddOnsQuery,
  useGetSuperDataQuery,
} from "@repo/store/api";
import Image from "next/image";
import Link from "next/link";
import { toast } from 'sonner';
import { useCrmAuth } from "@/hooks/useCrmAuth";
import AddItemModal from './AddItemModal';

// Interface definitions
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
  addOns?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  type: string;
}

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
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c: Category) => c._id === categoryId);
    setFormData((prev) => ({ ...prev, category: category || {}, name: "" }));
  };

  const handleCheckboxChange = (name: string, id: string, checked: boolean) => {
    const currentValues = (formData as any)[name] || [];
    const newValues = checked ? [...currentValues, id] : currentValues.filter((val: string) => val !== id);
    setFormData((prev) => ({ ...prev, [name]: newValues }));
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

    const payload = {
      ...formData,
      category: (formData.category as any)?._id || undefined,
      price: Number(formData.price) || 0,
      discountedPrice: formData.discountedPrice === "" ? null : Number(formData.discountedPrice),
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
      setActiveTab("advanced");
    } else if (activeTab === "advanced") {
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
          />
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
        <Button onClick={handleNextTab} disabled={!formData.name}>
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
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-lg sm:text-xl">
              {service?.name || 'Service Details'}
            </DialogTitle>
            <DialogDescription>
              {service?.description || 'No description available'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-1">
            <div className="grid gap-4 py-4 text-sm pr-1">
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
                <div>
                  <span className="font-semibold">Created At:</span>{" "}
                  {service?.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Updated At:</span>{" "}
                  {service?.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : 'N/A'}
                </div>
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
          <DialogFooter className="px-6 pb-6">
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
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-lg sm:text-xl">
            {type === "add" ? "New Service" : type === "edit" ? "Edit Service" : "Service Details"}
          </DialogTitle>
          <DialogDescription>
            {type === "add"
              ? "Create a new service for your salon"
              : type === "edit"
                ? "Edit service details"
                : "View service information"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-grow flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6 sticky top-0 bg-background z-10 pt-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced" disabled={!formData.name}>
                Advanced
              </TabsTrigger>
              <TabsTrigger value="booking" disabled={!formData.name}>
                Booking & Tax
              </TabsTrigger>
            </TabsList>
            <div className="pr-1">
              <TabsContent value="basic">{renderBasicInfoTab()}</TabsContent>
              <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
              <TabsContent value="booking">{renderBookingTab()}</TabsContent>
            </div>
          </Tabs>
        </div>
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

export default ServiceFormModal;