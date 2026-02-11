"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import Image from 'next/image';
import { ArrowRight, Tag, Info, Scissors, User, Calendar, Clock, MapPin, Star, ChevronUp, ChevronDown, Search, X, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { cn } from '@repo/ui/cn';
import { Service, StaffMember, SalonInfo, ServiceStaffAssignment } from '@/hooks/useBookingData';

interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  amountAfterDiscount: number;
  platformFee: number;
  serviceTax: number; // This will be GST
  vendorServiceTax: number;
  totalTax: number;
  finalTotal: number;
  couponCode?: string | null;
}

interface BookingSummaryProps {
  selectedServices: Service[];
  selectedStaff: StaffMember | null;
  selectedDate: Date;
  selectedTime: string | null;
  onNextStep: () => void;
  currentStep: number;
  isMobileFooter?: boolean;
  salonInfo?: SalonInfo | null;
  serviceStaffAssignments?: ServiceStaffAssignment[]; // For multi-service bookings
  priceBreakdown?: PriceBreakdown | null;
  weddingPackage?: any;
  weddingPackageMode?: 'default' | 'customized' | null;
  customizedPackageServices?: Service[];
  onEditPackage?: () => void; // New prop for editing wedding package
  onRemoveAddon?: (serviceId: string, addonId: string) => void; // New prop for removing addons
  couponCode?: string | null;
  isHomeService?: boolean; // New prop to indicate home service booking
  homeServiceLocation?: unknown | null;
}

export function BookingSummary({
  selectedServices,
  selectedStaff,
  selectedDate,
  selectedTime,
  onNextStep,
  currentStep,
  isMobileFooter = false,
  salonInfo,
  serviceStaffAssignments = [],
  priceBreakdown,
  weddingPackage,
  weddingPackageMode,
  customizedPackageServices,
  onEditPackage,
  onRemoveAddon,
  couponCode: propCouponCode,
  isHomeService = false,
  homeServiceLocation = null
}: BookingSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate totals - handle wedding package pricing
  const subtotal = weddingPackage
    ? (weddingPackage.discountedPrice || weddingPackage.totalPrice || 0)
    : (priceBreakdown?.subtotal ?? selectedServices.reduce((acc, service) => {
      const servicePrice = service.discountedPrice !== null && service.discountedPrice !== undefined ?
        parseFloat(String(service.discountedPrice)) :
        parseFloat(String(service.price || '0'));

      const addonsPrice = service.selectedAddons
        ? service.selectedAddons.reduce((sum, addon) => {
          const price = typeof addon.price === 'string' ? parseFloat(addon.price) : (addon.price || 0);
          return sum + price;
        }, 0)
        : 0;

      return acc + servicePrice + addonsPrice;
    }, 0));

  const total = priceBreakdown?.finalTotal ?? subtotal;

  // Use provided salon info or fallback
  const currentSalonInfo = salonInfo || {
    name: "Salon",
    rating: "4.5",
    reviews: 0,
    address: "Loading address...",
    image: "https://picsum.photos/seed/salon/400/400"
  };

  const stepDetails = isHomeService ? [
    {
      step: 1,
      label: 'Select Staff',
      enabled: selectedServices.length > 0 || !!weddingPackage
    },
    {
      step: 2,
      label: 'Select Location',
      enabled: serviceStaffAssignments && serviceStaffAssignments.length > 0
        ? serviceStaffAssignments.every(a => a.staff !== undefined)
        : (weddingPackage ? true : !!selectedStaff)
    },
    { 
      step: 3, 
      label: 'Select Time Slot', 
      enabled: !!homeServiceLocation
    },
    { 
      step: 4, 
      label: 'Confirm Booking Details', 
      enabled: !!selectedTime
    }
  ] : [
    {
      step: 1,
      label: 'Select Staff',
      enabled: selectedServices.length > 0 || !!weddingPackage
    },
    {
      step: 2,
      label: 'Select Time Slot',
      enabled: serviceStaffAssignments && serviceStaffAssignments.length > 0
        ? serviceStaffAssignments.every(a => a.staff !== undefined)
        : (weddingPackage ? true : !!selectedStaff)
    },
    { step: 3, label: 'Confirm Booking Details', enabled: !!selectedTime }
  ];

  const nextStepInfo = stepDetails.find(s => s.step === currentStep);
  const buttonLabel = nextStepInfo?.label || 'Continue';

  if (isMobileFooter) {
    return (
      <div className={cn(
        "bg-background/80 backdrop-blur-sm border-t transition-all duration-300",
        isExpanded ? "h-96" : "h-24"
      )}>
        <div className="p-4 flex flex-col h-full">
          {isExpanded && (
            <div className="overflow-y-auto no-scrollbar flex-grow space-y-3 pb-4">
              <div className="flex items-center gap-4">
                <Image
                  src={currentSalonInfo.image || "https://picsum.photos/seed/salon/400/400"}
                  alt={currentSalonInfo.name}
                  width={48}
                  height={48}
                  className="rounded-lg shadow-md"
                  data-ai-hint="salon exterior"
                />
                <div>
                  <h4 className="font-bold text-base">{currentSalonInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">{currentSalonInfo.address}</p>
                </div>
              </div>
              <Separator />
              {serviceStaffAssignments && serviceStaffAssignments.length > 0 ? (
                serviceStaffAssignments.map((assignment: ServiceStaffAssignment) => (
                  <div key={assignment.service.id} className="flex justify-between items-center text-sm">
                    <span className="line-clamp-2">{assignment.service.name}</span>
                    <span className="font-medium">₹{assignment.service.price}</span>
                  </div>
                ))
              ) : (
                selectedServices.map((service: Service) => (
                  <div key={service.id} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="line-clamp-2">{service.name}</span>
                      <span className="font-medium">₹{service.price}</span>
                    </div>
                    {/* Display Add-ons */}
                    {service.selectedAddons && service.selectedAddons.length > 0 && (
                      <div className="pl-3 border-l-2 border-primary/20 space-y-1">
                        {service.selectedAddons.map((addon) => (
                          <div key={addon._id} className="flex justify-between items-center text-xs text-muted-foreground group">
                            <span>+ {addon.name}</span>
                            <div className="flex items-center gap-1">
                              <span>₹{addon.price}</span>
                              {onRemoveAddon && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveAddon(service.id, addon._id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
                                  title="Remove addon"
                                >
                                  <X className="h-3 w-3 text-destructive" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              {serviceStaffAssignments && serviceStaffAssignments.length > 0 ? (
                serviceStaffAssignments.map((assignment: ServiceStaffAssignment) => (
                  <p key={assignment.service.id} className="text-sm">With: <span className="font-medium">{assignment.staff?.name || 'Any Professional'}</span></p>
                ))
              ) : (
                selectedStaff && <p className="text-sm">With: <span className="font-medium">{selectedStaff.name}</span></p>
              )}
              {selectedTime && <p className="text-sm">On: <span className="font-medium">{format(selectedDate, 'MMM d')} at {selectedTime}</span></p>}
            </div>
          )}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1">
                <span className="text-lg font-bold">₹{Math.round(total)}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              <p className="text-xs text-muted-foreground">Total (incl. tax)</p>
            </div>
            <Button
              className="w-40 h-12"
              size="lg"
              disabled={!nextStepInfo?.enabled}
              onClick={onNextStep}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-2xl shadow-primary/10 border-border/50 bg-background rounded-2xl flex flex-col max-h-[calc(100vh-8rem)]">
      <CardHeader className="p-6 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={currentSalonInfo.image || "https://picsum.photos/seed/salon/400/400"}
              alt={currentSalonInfo.name}
              width={64}
              height={64}
              className="rounded-lg shadow-md border-2 border-background"
              data-ai-hint="salon exterior"
            />
          </div>
          <div>
            <CardTitle className="font-bold text-lg">{currentSalonInfo.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{currentSalonInfo.rating} ({currentSalonInfo.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4 flex-grow overflow-y-auto no-scrollbar">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2"><Info className="h-4 w-4" />Your Booking Details</h4>

          {/* Show Wedding Package or Regular Services */}
          {weddingPackage ? (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-rose-100 rounded-md"><Heart className="h-5 w-5 text-rose-600" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-rose-600 font-medium uppercase tracking-wide">Wedding Package</p>
                    {weddingPackageMode === 'customized' && (
                      <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-medium">Customized</span>
                    )}
                  </div>
                  <p className="font-bold text-rose-900">{weddingPackage.name}</p>
                  <p className="text-xs text-rose-700 mt-1">{weddingPackage.description}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-rose-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-rose-700">Services Included:</span>
                  <span className="font-semibold text-rose-900">
                    {weddingPackageMode === 'customized' && customizedPackageServices
                      ? customizedPackageServices.length
                      : weddingPackage.services?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rose-700">Total Duration:</span>
                  <span className="font-semibold text-rose-900">{weddingPackage.duration} min</span>
                </div>
                {weddingPackage.staffCount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-700">Staff Required:</span>
                    <span className="font-semibold text-rose-900">
                      {weddingPackage.staffCount} {weddingPackage.staffCount === 1 ? 'Professional' : 'Professionals'}
                    </span>
                  </div>
                )}
                {weddingPackage.assignedStaff && weddingPackage.assignedStaff.length > 0 && (
                  <div className="text-sm">
                    <span className="text-rose-700">Available Staff:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {weddingPackage.assignedStaff.slice(0, 3).map((staff: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700">
                          {typeof staff === 'string' ? staff : staff.name}
                        </span>
                      ))}
                      {weddingPackage.assignedStaff.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700">
                          +{weddingPackage.assignedStaff.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-rose-200 pt-2 mt-2">
                  <span className="text-rose-800">Package Price:</span>
                  <span className="text-rose-900">₹{weddingPackage.discountedPrice || weddingPackage.totalPrice}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-secondary/50 rounded-md">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md"><Scissors className="h-4 w-4 text-primary" /></div>
                <div className="w-full">
                  <p className="text-xs text-muted-foreground mb-1">Services</p>
                  {selectedServices.length > 0 ? (
                    <div className="space-y-3">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm">{service.name}</p>
                            <span className="text-sm">₹{service.discountedPrice || service.price}</span>
                          </div>
                          {service.selectedAddons && service.selectedAddons.length > 0 && (
                            <div className="pl-3 border-l-2 border-primary/20 space-y-1">
                              {service.selectedAddons.map((addon) => (
                                <div key={addon._id} className="flex justify-between items-center text-xs text-muted-foreground group">
                                  <span>+ {addon.name}</span>
                                  <div className="flex items-center gap-1">
                                    <span>₹{addon.price}</span>
                                    {onRemoveAddon && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveAddon(service.id, addon._id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
                                        title="Remove addon"
                                      >
                                        <X className="h-3 w-3 text-destructive" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium text-sm">No services selected</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md"><User className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Professional(s)</p>
                {serviceStaffAssignments && serviceStaffAssignments.length > 0 ? (
                  <div className="space-y-1">
                    {serviceStaffAssignments.map((assignment: ServiceStaffAssignment) => (
                      <p key={assignment.service.id} className="font-medium text-sm">
                        {assignment.service.name}: {assignment.staff?.name || 'Any Professional'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-sm">{selectedStaff?.name || 'Any Professional'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-secondary/50 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md"><Calendar className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="font-medium text-sm">
                  {format(selectedDate, 'EEEE, MMM d')}
                  {selectedTime ? ` at ${selectedTime}` : ', no time selected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Price Breakdown Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />Price Breakdown
          </h4>

          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            {/* Itemized Services and Addons */}
            {!weddingPackage && selectedServices.length > 0 && (
              <div className="space-y-2 pb-2 border-b border-border/50">
                {selectedServices.map((service) => {
                  const servicePrice = service.discountedPrice !== null && service.discountedPrice !== undefined
                    ? parseFloat(String(service.discountedPrice))
                    : parseFloat(String(service.price || '0'));

                  return (
                    <div key={service.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{service.name}</span>
                        <span className="font-medium">₹{Math.round(servicePrice)}</span>
                      </div>
                      {service.selectedAddons && service.selectedAddons.length > 0 && (
                        <div className="pl-3 space-y-1">
                          {service.selectedAddons.map((addon) => (
                            <div key={addon._id} className="flex justify-between text-xs text-muted-foreground">
                              <span>+ {addon.name}</span>
                              <span>₹{Math.round(typeof addon.price === 'string' ? parseFloat(addon.price) : (addon.price || 0))}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{Math.round(subtotal)}</span>
            </div>

            {priceBreakdown && priceBreakdown.platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>₹{priceBreakdown.platformFee.toFixed(2)}</span>
              </div>
            )}

            {priceBreakdown && priceBreakdown.serviceTax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST</span>
                <span>₹{priceBreakdown.serviceTax.toFixed(2)}</span>
              </div>
            )}

            {priceBreakdown && priceBreakdown.vendorServiceTax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendor Service Tax</span>
                <span>₹{priceBreakdown.vendorServiceTax.toFixed(2)}</span>
              </div>
            )}

            {priceBreakdown && priceBreakdown.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="text-muted-foreground">
                  Discount {propCouponCode || priceBreakdown.couponCode ? `(${propCouponCode || priceBreakdown.couponCode})` : ''}
                </span>
                <span>-₹{priceBreakdown.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <Separator className="my-2" />

            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-primary">₹{Math.round(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 flex-shrink-0">
        {weddingPackage && currentStep === 1 ? (
          <div className="w-full space-y-3">
            {onEditPackage && (
              <Button
                className="w-full h-12 text-base"
                size="lg"
                variant="outline"
                onClick={onEditPackage}
              >
                <Scissors className="mr-2 h-5 w-5" />
                Edit Package
              </Button>
            )}
            <Button
              className="w-full h-12 text-base group"
              size="lg"
              disabled={!nextStepInfo?.enabled}
              onClick={onNextStep}
            >
              {buttonLabel}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-12 text-base group"
            size="lg"
            disabled={!nextStepInfo?.enabled}
            onClick={onNextStep}
          >
            {buttonLabel}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}