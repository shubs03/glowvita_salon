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
import { Badge } from "@repo/ui/badge";
import { Checkbox } from "@repo/ui/checkbox";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import {
  useCreateAddOnMutation,
  useUpdateVendorServicesMutation,
} from "@repo/store/api";
import { toast } from 'sonner';

// Interface definitions
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

export default AddOnQuickCreateModal;