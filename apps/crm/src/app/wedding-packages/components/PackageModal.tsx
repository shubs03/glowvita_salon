import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Badge } from "@repo/ui/badge";
import { Plus, Minus, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  categoryName?: string;
}

interface NewService {
  serviceId: string;
  quantity: number;
  staffRequired: boolean;
}

interface PackageService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  staffRequired: boolean;
}

interface FormData {
  name: string;
  description: string;
  services: PackageService[];
  totalPrice: number;
  discountedPrice: number | null;
  duration: number;
  staffCount: number;
  assignedStaff: string[];
  image: string | null;
}

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: "create" | "edit" | "view";
  formData: FormData;
  onFormDataChange: (data: FormData | ((prev: FormData) => FormData)) => void;
  services: Service[];
  staff: any[];
  staffLoading: boolean;
  staffError: any;
  newService: NewService;
  onNewServiceChange: (data: NewService | ((prev: NewService) => NewService)) => void;
  selectedStaffForAdd: string;
  onSelectedStaffChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddService: () => void;
  onRemoveService: (serviceId: string) => void;
  onQuantityChange: (serviceId: string, delta: number) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function PackageModal({
  isOpen,
  onClose,
  modalType,
  formData,
  onFormDataChange,
  services,
  staff,
  staffLoading,
  staffError,
  newService,
  onNewServiceChange,
  selectedStaffForAdd,
  onSelectedStaffChange,
  onSubmit,
  onImageUpload,
  onAddService,
  onRemoveService,
  onQuantityChange,
  isCreating,
  isUpdating,
}: PackageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-full max-h-[85vh] overflow-y-auto my-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {modalType === "create" ? "Create Wedding Package" :
              modalType === "edit" ? "Edit Wedding Package" : "View Wedding Package"}
          </DialogTitle>
          <DialogDescription>
            {modalType === "create" ? "Create a new wedding package for your clients" :
              modalType === "edit" ? "Edit the details of your wedding package" : "View package details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Bridal Glam Package"
                  value={formData.name}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, name: e.target.value }))}
                  disabled={modalType === "view"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your wedding package..."
                  value={formData.description}
                  onChange={(e) => onFormDataChange(prev => ({ ...prev, description: e.target.value }))}
                  disabled={modalType === "view"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Package Image</Label>
                {formData.image ? (
                  <div className="relative w-full max-w-[200px]">
                    <Image
                      src={formData.image}
                      alt="Package preview"
                      width={200}
                      height={200}
                      className="rounded-md object-cover w-full h-auto"
                    />
                    {modalType !== "view" && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => onFormDataChange(prev => ({ ...prev, image: null }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : modalType !== "view" ? (
                  <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                    <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                        <span>Upload an image</span>
                        <input
                          id="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={onImageUpload}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No image uploaded</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label>Package Details</Label>
                <div className="space-y-2 p-3 sm:p-4 bg-muted rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span>Total Services:</span>
                    <span className="font-medium">{formData.services.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Duration:</span>
                    <span className="font-medium">
                      {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff Required:</span>
                    <span className="font-medium">
                      {formData.staffCount} {formData.staffCount === 1 ? 'Professional' : 'Professionals'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Price:</span>
                    <span className="font-medium">₹{formData.totalPrice.toFixed(2)}</span>
                  </div>
                  {formData.discountedPrice && (
                    <div className="flex justify-between text-green-600">
                      <span>Discounted Price:</span>
                      <span className="font-medium">₹{formData.discountedPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffCount">Staff Required</Label>
                <Input
                  id="staffCount"
                  type="number"
                  min="1"
                  placeholder="e.g., 2"
                  value={formData.staffCount}
                  onChange={(e) => onFormDataChange(prev => ({
                    ...prev,
                    staffCount: parseInt(e.target.value) || 1
                  }))}
                  disabled={modalType === "view"}
                />
                <p className="text-xs text-muted-foreground">
                  Number of professionals needed to perform this package
                </p>
              </div>

              <div className="space-y-2">
                <Label>Assign Staff (Optional)</Label>
                {staffLoading ? (
                  <div className="flex items-center justify-center p-4 border rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading staff...</span>
                  </div>
                ) : staffError ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-600">Error loading staff. Please try again.</p>
                  </div>
                ) : modalType === "view" ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.assignedStaff.length > 0 ? (
                      formData.assignedStaff.map((staffId) => {
                        const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                        return staffMember ? (
                          <Badge key={staffId} variant="secondary">
                            {staffMember.name}
                          </Badge>
                        ) : null;
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No staff assigned</p>
                    )}
                  </div>
                ) : staff.length === 0 ? (
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-yellow-800">
                      No staff members available. Please add staff members first.
                    </p>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedStaffForAdd}
                      onValueChange={(value) => {
                        console.log('Selected staff value:', value);
                        console.log('Current assignedStaff:', formData.assignedStaff);
                        console.log('All staff:', staff);

                        if (value && value !== "no-staff" && !formData.assignedStaff.includes(value)) {
                          onFormDataChange(prev => ({
                            ...prev,
                            assignedStaff: [...prev.assignedStaff, value]
                          }));
                          setTimeout(() => {
                            onSelectedStaffChange("");
                          }, 100);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff members" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.length > 0 ? (
                          staff.map((staffMember: any) => (
                            <SelectItem
                              key={staffMember.id || staffMember._id}
                              value={staffMember.id || staffMember._id}
                              disabled={formData.assignedStaff.includes(staffMember.id || staffMember._id)}
                            >
                              {staffMember.name} {formData.assignedStaff.includes(staffMember.id || staffMember._id) ? '(Selected)' : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-staff" disabled>
                            No staff available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.assignedStaff.map((staffId) => {
                        const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                        return staffMember ? (
                          <Badge key={staffId} variant="secondary" className="flex items-center gap-1">
                            {staffMember.name}
                            <button
                              type="button"
                              onClick={() => {
                                onFormDataChange(prev => ({
                                  ...prev,
                                  assignedStaff: prev.assignedStaff.filter(id => id !== staffId)
                                }));
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {staff.length} staff member{staff.length !== 1 ? 's' : ''} available. Select those who can perform this package.
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Discounted Price (Optional)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  placeholder="e.g., 4500"
                  value={formData.discountedPrice || ""}
                  onChange={(e) => onFormDataChange(prev => ({
                    ...prev,
                    discountedPrice: e.target.value ? parseFloat(e.target.value) : null
                  }))}
                  disabled={modalType === "view"}
                />
              </div>
            </div>
          </div>

          {/* Add Services Section */}
          {modalType !== "view" && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Label>Add Services to Package</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddService}
                  disabled={!newService.serviceId}
                  className="w-full sm:w-auto"
                >
                  Add Service
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label>Service</Label>
                  <Select
                    value={newService.serviceId}
                    onValueChange={(value) => onNewServiceChange(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service: Service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newService.quantity}
                    onChange={(e) => onNewServiceChange(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="space-y-2 flex items-end sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="staffRequired"
                      checked={newService.staffRequired}
                      onCheckedChange={(checked) =>
                        onNewServiceChange(prev => ({ ...prev, staffRequired: !!checked }))
                      }
                    />
                    <Label htmlFor="staffRequired" className="text-sm">Staff Required</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Package Services List */}
          <div className="space-y-3 sm:space-y-4">
            <Label>Package Services</Label>
            {formData.services.length > 0 ? (
              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {formData.services.map((pkgService: PackageService) => {
                  const service = services.find((s: Service) => s._id === pkgService.serviceId);
                  return (
                    <div
                      key={pkgService.serviceId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="font-medium text-sm sm:text-base">{service?.name || pkgService.serviceName}</div>
                        <Badge variant="secondary" className="w-fit">{service?.categoryName}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
                        {modalType !== "view" && (
                          <div className="flex items-center border rounded-lg">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onQuantityChange(pkgService.serviceId, -1)}
                              disabled={pkgService.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-2 text-sm font-medium min-w-[30px] text-center">{pkgService.quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onQuantityChange(pkgService.serviceId, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {modalType !== "view" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRemoveService(pkgService.serviceId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-semibold">
                            ₹{service ? (service.price * pkgService.quantity).toFixed(2) : "0.00"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {service ? `${service.duration * pkgService.quantity} min` : "0 min"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-sm text-muted-foreground border rounded-lg">
                No services added to this package yet
              </div>
            )}
          </div>

          {modalType !== "view" && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating || formData.services.length === 0}
                className="w-full sm:w-auto"
              >
                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {modalType === "create" ? "Create Package" : "Update Package"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
