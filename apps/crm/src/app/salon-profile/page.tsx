"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetSubscriptionPlansQuery, useGetVendorProfileQuery, useUpdateVendorProfileMutation, useChangePlanMutation, useRenewPlanMutation } from '@repo/store/api';
import { selectVendor, selectVendorLoading, selectVendorError, selectVendorMessage, clearVendorMessage, clearVendorError } from '@repo/store/slices/vendorSlice';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
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
import { Checkbox } from "@repo/ui/checkbox";
import {
  Badge,
  Building,
  MapPin,
  Globe,
  Download,
  Image as ImageIcon,
  Banknote,
  FileText,
  Clock,
  Tags,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Eye,
  X,
  Check,
  Zap,
  RefreshCw,
  History,
  Star
} from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { useMemo } from 'react';

// TYPES
type SalonCategory = "unisex" | "men" | "women";
type SubCategory = "shop" | "shop-at-home" | "onsite";
type UserType = 'vendor' | 'supplier' | 'doctor';

interface VendorProfile {
  _id: string;
  businessName: string;
  description?: string;
  category: SalonCategory;
  subCategories: SubCategory[];
  website?: string;
  address?: string;
  profileImage?: string;
  gallery?: string[];
  documents?: Record<string, string>;
  bankDetails?: BankDetails;
  subscription?: Subscription;
  openingHours?: OpeningHour[];
  type?: UserType;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  duration: number;
  durationType: string;
  price: number;
  discountedPrice?: number;
  features: string[];
  isAvailableForPurchase: boolean;
  planType: 'trial' | 'regular';
  status: 'Active' | 'Inactive';
  isFeatured?: boolean;
  userTypes?: string[];
}

interface Subscription {
  plan: {
    _id: string;
    name: string;
  };
  status: "Active" | "Expired";
  startDate: string;
  endDate: string;
  history: Array<{
    plan: {
      _id: string;
      name: string;
    };
    startDate: string;
    endDate: string;
    status: "Active" | "Expired";
  }>;
}

interface BankDetails {
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
}

interface Document {
  id: string;
  name: string;
  type: "aadhar" | "pan" | "gst" | "license";
  status: "pending" | "approved" | "rejected";
}

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

// SUB-COMPONENTS FOR TABS
const ProfileTab = ({ vendor, setVendor }: any) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  
  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        businessName: vendor.businessName,
        description: vendor.description,
        category: vendor.category,
        subCategories: vendor.subCategories,
        website: vendor.website,
      }).unwrap();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Update your salon's public information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName">Salon Name</Label>
          <Input
            id="businessName"
            value={vendor.businessName || ''}
            onChange={(e) =>
              setVendor({ ...vendor, businessName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={vendor.description || ''}
            onChange={(e) =>
              setVendor({ ...vendor, description: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Salon Category</Label>
          <Select
            value={vendor.category || 'unisex'}
            onValueChange={(value) => setVendor({ ...vendor, category: value })}
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
        <div className="space-y-2">
          <Label>Sub Categories</Label>
          <div className="grid grid-cols-3 gap-4">
            {['shop', 'shop-at-home', 'onsite'].map((subCat: string) => (
              <div key={subCat} className="flex items-center space-x-2">
                <Checkbox
                  id={subCat}
                  checked={vendor.subCategories?.includes(subCat) || false}
                  onCheckedChange={(checked) => {
                    const currentSubCats = vendor.subCategories || [];
                    const newSubCats = checked
                      ? [...currentSubCats, subCat]
                      : currentSubCats.filter((id: string) => id !== subCat);
                    setVendor({ ...vendor, subCategories: newSubCats });
                  }}
                />
                <Label
                  htmlFor={subCat}
                  className="text-sm font-medium leading-none"
                >
                  {subCat.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

// Update the SubscriptionTab component:
const SubscriptionTab = ({ subscription, userType = 'vendor' }: { subscription: Subscription; userType?: UserType }) => {
  const [loading, setLoading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  // Get subscription plans with userType parameter
  const { data: plansResponse, isLoading: plansLoading } = useGetSubscriptionPlansQuery(userType);
  const [changePlan, { isLoading: changingPlan }] = useChangePlanMutation();
  
  // Filter available plans
  const availablePlans = useMemo(() => {
    if (!Array.isArray(plansResponse)) return [];
    
    return plansResponse
      .filter((plan: SubscriptionPlan) => {
        if (!plan) return false;
        
        // Include only paid plans (price > 0) and regular plans
        const isPaidPlan = plan.price > 0;
        const isRegularPlan = plan.planType === 'regular';
        
        // Make sure plan is active and available for purchase
        const isActiveAndAvailable = plan.status === 'Active' && plan.isAvailableForPurchase;
        
        // Check if plan is suitable for current user type
        const isUserTypeCompatible = !plan.userTypes || plan.userTypes.includes(userType);
        
        // Don't show current plan in change plan modal
        const isNotCurrentPlan = plan._id !== subscription?.plan?._id;
        
        return isPaidPlan && isRegularPlan && isActiveAndAvailable && isUserTypeCompatible && isNotCurrentPlan;
      })
      .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.price - b.price);
  }, [plansResponse, userType, subscription?.plan?._id]);

  const isLoading = plansLoading || changingPlan;
  const isExpired = subscription?.endDate ? new Date(subscription.endDate) < new Date() : true;
  const daysLeft = !isExpired ? 
    Math.ceil((new Date(subscription?.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 
    0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Subscription</span>
          {daysLeft > 0 && (
            <Badge variant={daysLeft <= 7 ? "destructive" : "default"} className="text-sm px-3 py-1">
              {daysLeft} days remaining
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Details about your current plan and billing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-primary/10 to-background p-6">
          {/* Current Plan Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold">{subscription?.plan?.name || 'No Active Plan'}</h3>
            <p className="text-muted-foreground">
              {isExpired ? 'Expired' : `Expires on ${new Date(subscription?.endDate).toLocaleDateString()}`}
            </p>
          </div>

          {/* Plan Stats */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="mt-1 font-semibold">
                <Badge variant={isExpired ? "destructive" : "success"}>
                  {isExpired ? 'Expired' : 'Active'}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="mt-1 font-semibold">
                {new Date(subscription?.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="mt-1 font-semibold">
                {new Date(subscription?.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setShowPlansModal(true)}>
              {isExpired ? 'Renew Subscription' : 'Change Plan'}
            </Button>
            <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
              View History
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Plans Modal */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isExpired ? 'Renew Subscription' : 'Change Plan'}</DialogTitle>
            <DialogDescription>Choose a plan that best suits your needs</DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-6 py-6">
            {isLoading ? (
              <div className="col-span-3 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading plans...</p>
              </div>
            ) : availablePlans.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-muted-foreground">
                No plans available at the moment
              </div>
            ) : (
              availablePlans.map((plan: SubscriptionPlan) => (
                <div
                  key={plan._id}
                  className={cn(
                    "relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg",
                    selectedPlan?._id === plan._id 
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-2">₹{plan.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.duration} {plan.durationType}
                  </p>
                  
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlansModal(false)}>Cancel</Button>
            <Button 
              onClick={handlePlanChange} 
              disabled={!selectedPlan || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing...
                </span>
              ) : isExpired ? 'Renew Now' : 'Change Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <HistoryModal 
        showHistoryModal={showHistoryModal}
        setShowHistoryModal={setShowHistoryModal}
        subscription={subscription}
        getStatusColor={getStatusColor}
      />
    </Card>
  );
};

// Plans Modal
const PlansModal = ({ showPlansModal, setShowPlansModal, plansLoading, availablePlans, selectedPlan, setSelectedPlan, isExpired, loading, handlePlanChange, cn }: {
  showPlansModal: boolean;
  setShowPlansModal: (value: boolean) => void;
  plansLoading: boolean;
  availablePlans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  setSelectedPlan: (plan: SubscriptionPlan | null) => void;
  isExpired: boolean;
  loading: boolean;
  handlePlanChange: () => Promise<void>;
  cn: (...classes: (string | false | null | undefined)[]) => string;
}) => (
  <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{isExpired ? 'Renew Subscription' : 'Change Plan'}</DialogTitle>
        <DialogDescription>
          Choose a plan that best suits your needs
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid md:grid-cols-3 gap-6 py-6">
        {plansLoading ? (
          <div className="col-span-3 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading available plans...</p>
          </div>
        ) : availablePlans.length === 0 ? (
          <div className="col-span-3 py-8 text-center text-muted-foreground">
            <p>No plans available for your account type at the moment.</p>
            <p className="text-sm mt-2">Please contact support for assistance.</p>
          </div>
        ) : (
          availablePlans.map((plan: SubscriptionPlan) => (
            <div
              key={plan._id}
              className={cn(
                "relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg",
                selectedPlan?._id === plan._id 
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold">₹{plan.discountedPrice || plan.price}</span>
                  {plan.discountedPrice && (
                    <span className="text-lg text-muted-foreground line-through">₹{plan.price}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  per {plan.durationType.slice(0, -1)}
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {plan.duration} {plan.durationType}
                </div>
              </div>
              
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-3 mt-6 border-t pt-6">
                  {plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedPlan?._id === plan._id && (
                <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none">
                  <div className="absolute top-0 right-0 p-2">
                    <div className="bg-primary text-white p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setShowPlansModal(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handlePlanChange} 
          disabled={!selectedPlan || loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : isExpired ? 'Renew Now' : 'Change Plan'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// History Modal
const HistoryModal = ({ showHistoryModal, setShowHistoryModal, subscription, getStatusColor }: {
  showHistoryModal: boolean;
  setShowHistoryModal: (value: boolean) => void;
  subscription: Subscription;
  getStatusColor: (status: string) => string;
}) => (
  <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Subscription History</DialogTitle>
        <DialogDescription>
          Your complete subscription history
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        {subscription?.history && subscription.history.length > 0 ? (
          <div className="space-y-4">
            {subscription.history.map((entry, index) => (
              <div key={index} className="flex flex-col p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{entry.plan.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.startDate).toLocaleDateString()} - {new Date(entry.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No subscription history available
          </p>
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => setShowHistoryModal(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const GalleryTab = ({ gallery, setVendor }: { gallery: string[]; setVendor: any }) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        gallery: gallery
      }).unwrap();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update gallery');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setVendor((prev: any) => ({ ...prev, gallery: newGallery }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // In a real app, you would upload the files to a server and get URLs
    // For now, we'll convert to base64 strings for demonstration
    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      newImages.push(base64);
    }
    
    setVendor((prev: any) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...newImages]
    }));
  };

  const openPreview = (src: string) => {
    setPreviewImage(src);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Gallery</CardTitle>
        <CardDescription>Manage your salon's photo gallery.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-6 border-2 border-dashed rounded-lg text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag & drop images here or
          </p>
          <Button variant="link" asChild>
            <label htmlFor="gallery-upload" className="cursor-pointer">
              browse to upload
            </label>
          </Button>
          <Input
            id="gallery-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
        {gallery && gallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((src, index) => (
              <div key={index} className="relative group aspect-video">
                <Image
                  src={src}
                  alt={`Salon image ${index + 1}`}
                  layout="fill"
                  className="object-cover rounded-lg cursor-pointer"
                  onClick={() => openPreview(src)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(src);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No images uploaded yet</p>
        )}
        
        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePreview}>
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute -top-12 right-0"
                onClick={closePreview}
              >
                <X className="h-4 w-4" />
              </Button>
              <Image
                src={previewImage}
                alt="Preview"
                width={800}
                height={600}
                className="object-contain max-h-[80vh]"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Gallery</Button>
      </CardFooter>
    </Card>
  );
};

const BankDetailsTab = ({ bankDetails, setVendor }: { bankDetails: BankDetails; setVendor: any }) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  
  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        bankDetails: bankDetails
      }).unwrap();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update bank details');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setVendor((prev: any) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
        <CardDescription>Manage your bank account for payouts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            <Input 
              value={bankDetails?.accountHolder || ''} 
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input 
              value={bankDetails?.accountNumber || ''} 
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input 
              value={bankDetails?.bankName || ''} 
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input 
              value={bankDetails?.ifscCode || ''} 
              onChange={(e) => handleInputChange('ifscCode', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Update Bank Details</Button>
      </CardFooter>
    </Card>
  );
};

const DocumentsTab = ({ documents, setVendor }: { documents: any; setVendor: any }) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [previewDocument, setPreviewDocument] = useState<{ src: string; type: string } | null>(null);
  
  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        documents: documents
      }).unwrap();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update documents');
    }
  };

  const handleDocumentUpload = async (docType: string, file: File | null) => {
    if (!file) return;
    
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
    
    setVendor((prev: any) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: base64
      }
    }));
  };

  const handleRemoveDocument = (docType: string) => {
    setVendor((prev: any) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: null
      }
    }));
  };

  const openDocumentPreview = (src: string, type: string) => {
    setPreviewDocument({ src, type });
  };

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  const documentTypes = [
    { key: 'aadharCard', label: 'Aadhar Card' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'udyogAadhar', label: 'Udyog Aadhar' },
    { key: 'udhayamCert', label: 'Udhayam Certificate' },
    { key: 'shopLicense', label: 'Shop License' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Documents</CardTitle>
        <CardDescription>
          Upload and manage your verification documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documentTypes.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{label}</p>
                  {documents?.[key] ? (
                    <p className="text-sm text-green-600">Uploaded</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not uploaded</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {documents?.[key] ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Uploaded
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDocumentPreview(documents[key], key)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveDocument(key)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <label htmlFor={`doc-upload-${key}`} className="cursor-pointer">
                        Upload
                      </label>
                    </Button>
                    <Input
                      id={`doc-upload-${key}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => handleDocumentUpload(key, e.target.files?.[0] || null)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Document Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeDocumentPreview}>
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute -top-12 right-0"
                onClick={closeDocumentPreview}
              >
                <X className="h-4 w-4" />
              </Button>
              {previewDocument.src.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDocument.src}
                  className="w-full h-[80vh]"
                  title="Document Preview"
                />
              ) : (
                <Image
                  src={previewDocument.src}
                  alt="Document Preview"
                  width={800}
                  height={600}
                  className="object-contain max-h-[80vh] mx-auto"
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Documents</Button>
      </CardFooter>
    </Card>
  );
};

const OpeningHoursTab = ({
  hours,
  setHours,
}: {
  hours: OpeningHour[];
  setHours: any;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Opening Hours</CardTitle>
      <CardDescription>Set your weekly business hours.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {hours && hours.map((hour, index) => (
        <div key={hour.day} className="grid grid-cols-4 items-center gap-4">
          <div className="col-span-1">
            <Checkbox
              id={hour.day}
              checked={hour.isOpen}
              onCheckedChange={(checked) => {
                const newHours = [...hours];
                newHours[index].isOpen = !!checked;
                setHours(newHours);
              }}
            />
            <Label htmlFor={hour.day} className="ml-2 font-medium">
              {hour.day}
            </Label>
          </div>
          <div className="col-span-1">
            <Input
              type="time"
              value={hour.open}
              disabled={!hour.isOpen}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[index].open = e.target.value;
                setHours(newHours);
              }}
            />
          </div>
          <div className="col-span-1">
            <Input
              type="time"
              value={hour.close}
              disabled={!hour.isOpen}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[index].close = e.target.value;
                setHours(newHours);
              }}
            />
          </div>
          <div className="col-span-1 text-right">
            {hour.isOpen ? (
              <span className="text-green-600">Open</span>
            ) : (
              <span className="text-red-600">Closed</span>
            )}
          </div>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button>Save Hours</Button>
    </CardFooter>
  </Card>
);

const CategoriesTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Service Categories</CardTitle>
      <CardDescription>
        Manage the categories for your services and products.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Category management UI would go here */}
      <p>Category management functionality coming soon.</p>
    </CardContent>
  </Card>
);

// MAIN PAGE COMPONENT
export default function SalonProfilePage() {
  const dispatch = useDispatch();
  const vendor = useSelector(selectVendor);
  const loading = useSelector(selectVendorLoading);
  const error = useSelector(selectVendorError);
  const message = useSelector(selectVendorMessage);
  
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const { data: vendorData, isLoading, isError } = useGetVendorProfileQuery(void 0);
  
  const [localVendor, setLocalVendor] = useState<VendorProfile>({
    _id: '',
    businessName: '',
    category: 'unisex',
    subCategories: []
  });
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    Array.from({ length: 7 }, (_, i) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return {
        day: days[i],
        open: '09:00',
        close: '18:00',
        isOpen: i < 5 // Monday to Friday open by default
      };
    })
  );
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (vendorData?.data) {
      setLocalVendor(vendorData.data);
      // Initialize opening hours if they exist in the vendor data
      if (vendorData.data.openingHours) {
        setOpeningHours(vendorData.data.openingHours);
      }
    }
  }, [vendorData]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearVendorMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearVendorError());
    }
  }, [error, dispatch]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // Update vendor profile with new profile image
      const result = await updateVendorProfile({
        profileImage: base64
      }).unwrap();

      if (result.success) {
        setLocalVendor((prev: any) => ({
          ...prev,
          profileImage: base64
        }));
        toast.success('Profile image updated successfully');
      } else {
        toast.error(result.message || 'Failed to update profile image');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile image');
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const openProfileImagePreview = () => {
    if (localVendor.profileImage) {
      setPreviewImage(localVendor.profileImage);
    }
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !localVendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading vendor profile</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-lg flex-shrink-0 group">
              <Image
                src={localVendor.profileImage || "https://placehold.co/200x200.png"}
                alt="Salon Logo"
                layout="fill"
                className="object-cover cursor-pointer"
                onClick={openProfileImagePreview}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfileImagePreview();
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full"
                        asChild
                      >
                        <label className="cursor-pointer">
                          <UploadCloud className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-grow">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {localVendor.businessName || 'Your Salon'}
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" /> {localVendor.address || 'Address not set'}
              </CardDescription>
              <div className="text-sm text-muted-foreground mt-2">
                Vendor ID:{" "}
                <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">
                  {localVendor._id?.substring(0, 8) || 'N/A'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {localVendor.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={localVendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" /> Website
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href="/apps">
                    <Download className="mr-2 h-4 w-4" /> Download App
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute -top-12 right-0"
              onClick={closePreview}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={previewImage}
              alt="Profile Preview"
              width={800}
              height={600}
              className="object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="opening-hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileTab
            vendor={localVendor}
            setVendor={setLocalVendor}
          />
        </TabsContent>
        <TabsContent value="subscription" className="mt-4">
          <SubscriptionTab 
            subscription={localVendor.subscription} 
            userType={localVendor.type || 'vendor'}
          />
        </TabsContent>
        <TabsContent value="gallery" className="mt-4">
          <GalleryTab 
            gallery={localVendor.gallery || []} 
            setVendor={setLocalVendor} 
          />
        </TabsContent>
        <TabsContent value="bank-details" className="mt-4">
          <BankDetailsTab 
            bankDetails={localVendor.bankDetails || {}} 
            setVendor={setLocalVendor} 
          />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab 
            documents={localVendor.documents || {}} 
            setVendor={setLocalVendor} 
          />
        </TabsContent>
        <TabsContent value="opening-hours" className="mt-4">
          <OpeningHoursTab hours={openingHours} setHours={setOpeningHours} />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}