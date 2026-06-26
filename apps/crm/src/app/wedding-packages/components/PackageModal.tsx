import React, { useState, useEffect } from "react";
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
import {
  Plus,
  Minus,
  X,
  Upload,
  Loader2,
  Sparkles,
  Percent,
  Users,
  ClipboardList,
  Info,
  Tag,
  IndianRupee,
  Clock,
  Check,
  HelpCircle,
} from "lucide-react";
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
  // Local state for the percentage discount
  const [discountPercent, setDiscountPercent] = useState<number | "">("");

  // Initialize discountPercent ONLY when the modal first opens (not on every formData change)
  useEffect(() => {
    if (isOpen) {
      if (formData.totalPrice > 0 && formData.discountedPrice !== null) {
        const pct = Math.round(
          ((formData.totalPrice - formData.discountedPrice) / formData.totalPrice) * 100
        );
        setDiscountPercent(Math.min(100, Math.max(0, pct)));
      } else {
        setDiscountPercent("");
      }
    } else {
      // Reset when modal closes
      setDiscountPercent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // When totalPrice changes (due to services being added/removed), recalculate discountedPrice
  // using the current discountPercent — but only if a discount is already active.
  // Uses a ref-based approach to avoid putting discountPercent in deps (which would cause loops).
  const discountPercentRef = React.useRef(discountPercent);
  discountPercentRef.current = discountPercent;

  useEffect(() => {
    if (!isOpen) return;
    const pct = discountPercentRef.current;
    if (pct !== "" && pct > 0) {
      const newDiscountedPrice = Math.round(formData.totalPrice * (1 - (pct as number) / 100));
      onFormDataChange(prev => {
        if (prev.discountedPrice === newDiscountedPrice) return prev;
        return { ...prev, discountedPrice: newDiscountedPrice };
      });
    }
    // Only re-run when totalPrice changes, not discountPercent (avoids the circular loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.totalPrice, isOpen]);

  const handleDiscountPercentChange = (val: string) => {
    if (val === "") {
      setDiscountPercent("");
      onFormDataChange(prev => ({
        ...prev,
        discountedPrice: null,
      }));
      return;
    }

    const numericVal = parseFloat(val);
    if (!isNaN(numericVal)) {
      const clampedVal = Math.min(100, Math.max(0, numericVal));
      setDiscountPercent(clampedVal);
      if (clampedVal > 0) {
        const calculatedDiscountedPrice = Math.round(
          formData.totalPrice * (1 - clampedVal / 100)
        );
        onFormDataChange(prev => ({
          ...prev,
          discountedPrice: calculatedDiscountedPrice,
        }));
      } else {
        onFormDataChange(prev => ({
          ...prev,
          discountedPrice: null,
        }));
      }
    }
  };


  // Helper: Get initials for avatar placeholders
  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "ST";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-full max-h-[90vh] overflow-y-auto my-4 rounded-xl border border-muted p-4 sm:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl transition-all duration-300"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-muted pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
            {modalType === "create" && <Sparkles className="h-5 w-5 text-primary animate-pulse" />}
            {modalType === "edit" && <ClipboardList className="h-5 w-5 text-primary" />}
            {modalType === "view" && <Info className="h-5 w-5 text-primary" />}
            {modalType === "create" ? "Create Wedding Package" :
              modalType === "edit" ? "Edit Wedding Package" : "Wedding Package Details"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm mt-1">
            {modalType === "create" ? "Design an exclusive wedding package with custom services, staffing, and pricing." :
              modalType === "edit" ? "Modify your premium wedding package details and update rates." : "Detailed breakdown of the selected wedding package services, logistics, and pricing."}
          </DialogDescription>
        </DialogHeader>

        {modalType === "view" ? (
          /* ======================================================================= */
          /* PREMIUM READ-ONLY VIEW                                                  */
          /* ======================================================================= */
          <div className="space-y-6 py-4">
            {/* Banner/Hero section */}
            <div className="relative w-full h-[180px] sm:h-[220px] rounded-xl overflow-hidden shadow-inner border border-muted">
              <Image
                src={formData.image || '/images/wedding package placeholder.png'}
                alt={formData.name || "Wedding package preview"}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                <span className="text-white text-xs font-semibold tracking-wider uppercase bg-primary/80 px-2 py-0.5 rounded-full w-fit mb-1">Wedding Collection</span>
                <h3 className="text-white text-lg sm:text-2xl font-bold">{formData.name || "Unnamed Package"}</h3>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/30 border border-muted rounded-xl flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Services</div>
                  <div className="text-sm sm:text-base font-bold text-foreground">{formData.services.length} Added</div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 border border-muted rounded-xl flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</div>
                  <div className="text-sm sm:text-base font-bold text-foreground">
                    {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 border border-muted rounded-xl flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Staff Count</div>
                  <div className="text-sm sm:text-base font-bold text-foreground">
                    {formData.staffCount} {formData.staffCount === 1 ? 'Expert' : 'Experts'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/25 rounded-xl flex items-center gap-3 hover:bg-green-500/10 transition-colors">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-wider">Rate</div>
                  <div className="text-sm sm:text-base font-bold text-green-700 dark:text-green-300">
                    ₹{(formData.discountedPrice || formData.totalPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Description & Staff Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-background border border-muted rounded-xl p-4 sm:p-5 space-y-2">
                  <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" /> Package Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {formData.description || "No description provided for this package."}
                  </p>
                </div>

                <div className="bg-background border border-muted rounded-xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Assigned Professionals
                  </h4>
                  {formData.assignedStaff.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.assignedStaff.map((staffId) => {
                        const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                        const nameStr = staffMember ? (staffMember.fullName || staffMember.name) : "Professional";
                        return staffMember ? (
                          <div key={staffId} className="flex items-center gap-2 bg-muted/40 border border-muted py-1.5 px-3 rounded-full hover:bg-muted transition-colors">
                            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                              {getInitials(nameStr)}
                            </div>
                            <span className="text-xs font-semibold text-foreground">{nameStr}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" /> No specific staff assigned to this package yet.
                    </p>
                  )}
                </div>
              </div>

              {/* pricing details card & services listing */}
              <div className="space-y-4">
                <div className="bg-primary/[0.03] border border-primary/20 rounded-xl p-5 space-y-4 shadow-sm">
                  <h4 className="text-sm font-bold text-foreground tracking-wide uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-primary" /> Billing Breakdown
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Base Services Total:</span>
                      <span className="font-semibold text-foreground">₹{formData.totalPrice.toFixed(2)}</span>
                    </div>

                    {formData.discountedPrice !== null && formData.discountedPrice < formData.totalPrice && (
                      <>
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount Applied:</span>
                          <span className="font-semibold flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {discountPercent}% Off
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Your Savings:</span>
                          <span className="font-semibold">
                            - ₹{(formData.totalPrice - formData.discountedPrice).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="border-t border-dashed border-muted my-2 pt-3 flex justify-between items-center">
                      <span className="font-bold text-foreground text-sm uppercase">Total Package Price</span>
                      <div className="text-right">
                        {formData.discountedPrice !== null && formData.discountedPrice < formData.totalPrice ? (
                          <>
                            <div className="text-xs text-muted-foreground line-through">₹{formData.totalPrice.toFixed(2)}</div>
                            <div className="text-xl sm:text-2xl font-extrabold text-green-600 dark:text-green-400">
                              ₹{formData.discountedPrice.toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-xl sm:text-2xl font-extrabold text-foreground">
                            ₹{formData.totalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List of included services */}
            <div className="bg-background border border-muted rounded-xl p-4 sm:p-5 space-y-3">
              <h4 className="text-sm font-semibold tracking-wide text-foreground uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-primary" /> Package Services Directory
              </h4>
              {formData.services.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {formData.services.map((pkgService: PackageService) => {
                    const service = services.find((s: Service) => s._id === pkgService.serviceId);
                    return (
                      <div
                        key={pkgService.serviceId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-muted hover:border-primary/20 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all gap-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="font-semibold text-sm text-foreground">{service?.name || pkgService.serviceName}</div>
                          <Badge variant="secondary" className="w-fit text-[10px] font-semibold bg-primary/10 text-primary border-none">
                            {service?.categoryName || "Salon"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="text-xs text-muted-foreground flex items-center gap-3">
                            <span className="bg-muted px-2 py-0.5 rounded font-medium border border-muted">Qty: {pkgService.quantity}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {service ? service.duration * pkgService.quantity : 0} min</span>
                          </div>
                          <div className="text-sm font-bold text-foreground min-w-[70px] text-right">
                            ₹{service ? (service.price * pkgService.quantity).toFixed(2) : "0.00"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> No services added to this package yet.
                </p>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-muted">
              <Button type="button" onClick={onClose} className="w-full sm:w-auto font-semibold px-6">
                Close Details
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* ======================================================================= */
          /* PREMIUM EDIT & CREATE FORM                                              */
          /* ======================================================================= */
          <form onSubmit={onSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Package Identity & Images */}
              <div className="space-y-4">
                <div className="bg-background border border-muted rounded-xl p-4 sm:p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold tracking-wide text-foreground uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" /> Package Identity
                  </h4>

                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-foreground">Package Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Ultimate Bridal Glow & Makeup Package"
                      value={formData.name}
                      onChange={(e) => onFormDataChange(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="border-muted focus-visible:ring-primary rounded-lg text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-bold text-foreground">Package Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detail the package contents, who it's for, and the experience they will enjoy..."
                      value={formData.description}
                      onChange={(e) => onFormDataChange(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="min-h-[100px] border-muted focus-visible:ring-primary rounded-lg text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Cover Image</Label>
                    {formData.image ? (
                      <div className="relative w-full h-[140px] rounded-lg overflow-hidden border border-muted">
                        <Image
                          src={formData.image}
                          alt="Package preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-600 hover:bg-red-700 shadow-md transition-all active:scale-95"
                          onClick={() => onFormDataChange(prev => ({ ...prev, image: null }))}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted hover:border-primary/50 rounded-lg p-5 text-center transition-all bg-muted/10 hover:bg-primary/5 cursor-pointer relative">
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-8 w-8 text-muted-foreground/60 mb-2 animate-bounce" />
                          <span className="text-xs font-bold text-primary hover:text-primary/80">Upload Photo</span>
                          <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                          <input
                            id="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={onImageUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Logistics & Staffing */}
              <div className="space-y-4">
                <div className="bg-background border border-muted rounded-xl p-4 sm:p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold tracking-wide text-foreground uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Staffing & Logistics
                  </h4>

                  <div className="space-y-1.5">
                    <Label htmlFor="staffCount" className="text-xs font-bold text-foreground">Professionals Required</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="staffCount"
                        type="number"
                        min="1"
                        placeholder="e.g., 2"
                        value={formData.staffCount}
                        onChange={(e) => onFormDataChange(prev => ({
                          ...prev,
                          staffCount: e.target.value === "" ? "" : (parseInt(e.target.value) || 0)
                        } as any))}
                        onBlur={() => {
                          if (!formData.staffCount || formData.staffCount < 1 || isNaN(Number(formData.staffCount))) {
                            onFormDataChange(prev => ({ ...prev, staffCount: 1 }));
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="pl-9 border-muted focus-visible:ring-primary rounded-lg text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Minimum number of specialists required to execute this wedding package.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Assign Staff Members</Label>
                    {staffLoading ? (
                      <div className="flex items-center justify-center p-3 border border-muted rounded-lg bg-muted/10">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                        <span className="text-xs text-muted-foreground">Fetching professional staff...</span>
                      </div>
                    ) : staffError ? (
                      <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-xs text-red-600">
                        Failed to fetch staff members. Please reload page.
                      </div>
                    ) : staff.length === 0 ? (
                      <div className="p-3 border border-yellow-250 rounded-lg bg-yellow-50 text-xs text-yellow-800">
                        No team members registered. Please create staff profiles.
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedStaffForAdd}
                          onValueChange={(value) => {
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
                          <SelectTrigger className="border-muted focus:ring-primary rounded-lg text-sm bg-background">
                            <SelectValue placeholder="Add professionals to this package" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 rounded-lg border-muted">
                            {staff.map((staffMember: any) => (
                              <SelectItem
                                key={staffMember.id || staffMember._id}
                                value={staffMember.id || staffMember._id}
                                disabled={formData.assignedStaff.includes(staffMember.id || staffMember._id)}
                              >
                                {staffMember.fullName || staffMember.name} {formData.assignedStaff.includes(staffMember.id || staffMember._id) ? '(Selected)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {formData.assignedStaff.length > 0 ? (
                            formData.assignedStaff.map((staffId) => {
                              const staffMember = staff.find((s: any) => (s.id || s._id) === staffId);
                              const nameStr = staffMember ? (staffMember.fullName || staffMember.name) : "Staff";
                              return staffMember ? (
                                <Badge
                                  key={staffId}
                                  variant="secondary"
                                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-muted/80 transition-colors border-muted bg-muted/40 text-foreground text-xs"
                                >
                                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                                    {getInitials(nameStr)}
                                  </div>
                                  <span>{nameStr}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onFormDataChange(prev => ({
                                        ...prev,
                                        assignedStaff: prev.assignedStaff.filter(id => id !== staffId)
                                      }));
                                    }}
                                    className="hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <p className="text-[10px] text-muted-foreground italic">No specific professionals pre-assigned.</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES SELECTOR & INCLUDE WORKBENCH */}
            <div className="bg-background border border-muted rounded-xl p-4 sm:p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <h4 className="text-sm font-bold tracking-wide text-foreground uppercase flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-primary" /> Included Services
                </h4>
                <Badge variant="outline" className="font-semibold text-xs border-primary/20 text-primary bg-primary/5">
                  {formData.services.length} Added
                </Badge>
              </div>

              {/* Service Quick Add Input Row */}
              <div className="p-3 bg-muted/20 border border-muted rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Select Service</Label>
                  <Select
                    value={newService.serviceId}
                    onValueChange={(value) => onNewServiceChange(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger className="border-muted focus:ring-primary rounded-lg text-xs bg-background">
                      <SelectValue placeholder="Pick a service from catalog..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-lg border-muted">
                      {services.map((service: Service) => (
                        <SelectItem key={service._id} value={service._id} disabled={formData.services.some(s => s.serviceId === service._id)}>
                          {service.name} (₹{service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:col-span-2 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-foreground uppercase tracking-wide">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newService.quantity}
                      onChange={(e) => onNewServiceChange(prev => ({
                        ...prev,
                        quantity: e.target.value === "" ? "" : (parseInt(e.target.value) || 0)
                      } as any))}
                      onBlur={() => {
                        if (!newService.quantity || newService.quantity < 1 || isNaN(Number(newService.quantity))) {
                          onNewServiceChange(prev => ({ ...prev, quantity: 1 }));
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="border-muted focus-visible:ring-primary rounded-lg text-xs h-9 bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={onAddService}
                    disabled={!newService.serviceId}
                    className="w-full h-9 rounded-lg font-bold text-xs bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Service
                  </Button>
                </div>
              </div>

              {/* Active Services Listing inside layout */}
              {formData.services.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {formData.services.map((pkgService: PackageService) => {
                    const service = services.find((s: Service) => s._id === pkgService.serviceId);
                    return (
                      <div
                        key={pkgService.serviceId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-muted hover:border-primary/20 rounded-xl bg-background/50 hover:bg-background/95 transition-all gap-3 shadow-inner"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="font-semibold text-sm text-foreground">{service?.name || pkgService.serviceName}</div>
                          <Badge variant="secondary" className="w-fit text-[9px] font-semibold bg-muted text-muted-foreground border-none">
                            {service?.categoryName || "General"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          {/* Quantity control clicks */}
                          <div className="flex items-center border border-muted rounded-lg bg-background shadow-sm overflow-hidden h-8">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-none hover:bg-muted text-muted-foreground active:scale-95"
                              onClick={() => onQuantityChange(pkgService.serviceId, -1)}
                              disabled={pkgService.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 text-xs font-bold min-w-[28px] text-center text-foreground">{pkgService.quantity}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-none hover:bg-muted text-muted-foreground active:scale-95"
                              onClick={() => onQuantityChange(pkgService.serviceId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right min-w-[70px] text-xs">
                            <div className="font-bold text-foreground">
                              ₹{service ? (service.price * pkgService.quantity).toFixed(2) : "0.00"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {service ? `${service.duration * pkgService.quantity} min` : "0 min"}
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg active:scale-95 transition-all"
                            onClick={() => onRemoveService(pkgService.serviceId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-muted rounded-xl bg-muted/5 flex flex-col items-center justify-center p-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-1" />
                  <p className="font-medium">No services assigned to this package.</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Use the catalog workbench above to compile services.</p>
                </div>
              )}
            </div>

            {/* PRICING & DISCOUNTS METRICS WRAPPER */}
            <div className="bg-primary/[0.02] border border-primary/20 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-foreground tracking-wide uppercase border-b border-muted pb-2 flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-primary" /> Pricing Summary
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Total Cost Display */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Catalog Total Price</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-foreground">₹{formData.totalPrice.toFixed(2)}</div>
                </div>

                {/* Percentage Discount Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="discountPercent" className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Percent className="h-3.5 w-3.5 text-primary" /> Discount Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 15 for 15%"
                      value={discountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="pr-8 border-muted focus-visible:ring-primary rounded-lg text-sm h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Dynamic Package Price */}
                <div className="space-y-1 md:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Final Package Price</span>
                  <div className="flex items-baseline md:justify-end gap-1.5">
                    {discountPercent !== "" && discountPercent > 0 ? (
                      <>
                        <span className="text-xs text-muted-foreground line-through">₹{formData.totalPrice.toFixed(2)}</span>
                        <span className="text-xl sm:text-2xl font-black text-green-600 dark:text-green-400">
                          ₹{(formData.discountedPrice || 0).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl sm:text-2xl font-black text-foreground">₹{formData.totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Saving Notification Badge */}
              {discountPercent !== "" && discountPercent > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-700 dark:text-green-400 animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Special Offer Enabled! Clients save ₹{(formData.totalPrice - (formData.discountedPrice || 0)).toFixed(2)} ({discountPercent}% discount).
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-muted">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto font-bold rounded-lg px-5">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating || formData.services.length === 0}
                className="w-full sm:w-auto font-bold rounded-lg px-6 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm"
              >
                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {modalType === "create" ? "Create Package" : "Update Package"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

