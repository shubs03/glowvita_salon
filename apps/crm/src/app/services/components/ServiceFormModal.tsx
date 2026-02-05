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
import { Plus, Edit, Trash2, Search, DollarSign, Tag, Star, BarChart2, Eye, Clock, Users, Home, Globe, Percent, Calendar, Info, Scissors, CheckCircle2, AlertCircle } from "lucide-react";
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
        <DialogContent className="max-w-6xl w-[90vw] h-auto max-h-[82vh] p-0 overflow-hidden flex flex-col rounded-3xl shadow-2xl border-none">
          <DialogHeader className="px-8 py-5 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    Service Details
                  </DialogTitle>
                </div>
              </div>
              <Badge
                variant={
                  service?.status === 'approved' ? 'default' :
                    service?.status === 'disapproved' ? 'destructive' : 'secondary'
                }
                className={`capitalize px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border-0 shadow-sm ${service?.status === 'approved' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                  service?.status === 'disapproved' ? 'bg-rose-500 text-white hover:bg-rose-600' :
                    'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
              >
                {service?.status || 'Pending Review'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            {/* Main Landscape Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

              {/* Col 1: Image - span 3 */}
              <div className="lg:col-span-3">
                {service?.image ? (
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg bg-muted border-4 border-background ring-1 ring-border shadow-primary/5">
                    <Image
                      src={service.image}
                      alt={service?.name || 'Service image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-2xl bg-muted flex flex-col items-center justify-center border border-dashed border-muted-foreground/30 text-muted-foreground">
                    <Scissors className="h-10 w-10 opacity-20 mb-2" />
                    <span className="text-xs font-medium opacity-40">No Image</span>
                  </div>
                )}
              </div>

              {/* Col 2: Primary Info - span 4 */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">{service?.name}</h2>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">{service?.categoryName || "Uncategorized"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1 bg-blue-50/50 text-blue-600 border-blue-100 rounded-lg">
                    <Clock className="h-3 w-3 mr-1.5" /> {service?.duration || 0} mins
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-indigo-50/50 text-indigo-600 border-indigo-100 rounded-lg">
                    <Users className="h-3 w-3 mr-1.5" /> {service?.gender || 'Unisex'}
                  </Badge>
                  {service?.onlineBooking && (
                    <Badge variant="outline" className="px-3 py-1 bg-teal-50/50 text-teal-600 border-teal-100 rounded-lg">
                      <Globe className="h-3 w-3 mr-1.5" /> Online
                    </Badge>
                  )}
                </div>

                <div className="p-4 bg-muted/30 rounded-2xl border border-muted-foreground/5 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">₹{service?.price?.toFixed(2)}</span>
                    {service?.discountedPrice && (
                      <span className="text-lg text-muted-foreground line-through opacity-40 italic">₹{service.discountedPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <Percent className="h-3 w-3" />
                    Tax: {service?.tax?.enabled ? (
                      <span className="text-primary">{service.tax.value}{service.tax.type === 'percentage' ? '%' : ' (Fixed)'}</span>
                    ) : 'Inclusive'}
                  </div>
                </div>
              </div>

              {/* Col 3: Description - span 5 */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-primary" /> Service Overview
                </h3>
                <div className="bg-muted/10 p-5 rounded-2xl text-sm leading-relaxed border-2 border-dashed border-muted text-foreground/70 h-full min-h-[140px]">
                  {service?.description || 'This service doesn\'t have a detailed description yet. Please consult with the salon representative for more information regarding this treatment.'}
                </div>
              </div>
            </div>

            {/* Bottom Grid: Features & Add-ons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Features List */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-background shadow-sm group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block uppercase">Home Visit</span>
                      <span className="text-sm font-semibold">{service?.homeService?.available ? `₹${service.homeService.charges || 0}` : 'Disabled'}</span>
                    </div>
                  </div>
                  {service?.homeService?.available && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-background shadow-sm group hover:border-pink-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-50 text-pink-500 rounded-lg group-hover:bg-pink-100 transition-colors">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block uppercase">Wedding Special</span>
                      <span className="text-sm font-semibold">{service?.weddingService?.available ? `₹${service.weddingService.charges || 0}` : 'Disabled'}</span>
                    </div>
                  </div>
                  {service?.weddingService?.available && <CheckCircle2 className="h-4 w-4 text-pink-500" />}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-background shadow-sm group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-primary/10 transition-colors">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block uppercase">Staff Comm.</span>
                      <span className="text-sm font-semibold">{service?.commission ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  {service?.commission ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-muted-foreground/30" />}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-background shadow-sm group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-primary/10 transition-colors">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block uppercase">Booking Interval</span>
                      <span className="text-sm font-semibold">{service?.bookingInterval || 0} minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add-ons List */}
              <div className="p-5 bg-muted/20 border-2 border-dashed border-muted-foreground/10 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Available Add-ons</h3>
                {service?.addOns && service.addOns.length > 0 ? (
                  <div className="space-y-2">
                    {service.addOns.slice(0, 4).map((addonId: string) => {
                      const addon = availableAddOns.find((a: any) => a._id === addonId);
                      return addon ? (
                        <div key={addonId} className="flex items-center justify-between bg-background p-2.5 rounded-lg border border-muted-foreground/5 shadow-sm">
                          <span className="text-xs font-medium truncate max-w-[120px]">{addon.name}</span>
                          <span className="text-xs font-bold text-primary">₹{addon.price}</span>
                        </div>
                      ) : null;
                    })}
                    {service.addOns.length > 4 && (
                      <p className="text-[10px] text-center text-muted-foreground pt-2 font-medium">
                        + {service.addOns.length - 4} more add-ons
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60 text-center italic py-4">No add-ons selected</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-4 border-t bg-muted/20">
            <Button variant="outline" onClick={onClose} className="border-primary/20 hover:bg-primary/5 px-8 rounded-xl font-bold text-xs uppercase tracking-widest">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl w-[92vw] h-auto max-h-[85vh] p-0 overflow-hidden flex flex-col rounded-2xl shadow-2xl border-none"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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