
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from '@repo/store/hooks';
import { useGetSubscriptionPlansQuery, useGetVendorProfileQuery, useUpdateVendorProfileMutation, useChangePlanMutation, useRenewPlanMutation, useGetWorkingHoursQuery, useUpdateWorkingHoursMutation, useGetCurrentSupplierProfileQuery, useUpdateSupplierProfileMutation, useGetDoctorProfileQuery, useUpdateDoctorProfileMutation } from '@repo/store/api';
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
import { Switch } from "@repo/ui/switch";
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
import { SubscriptionPlansDialog } from "@/components/SubscriptionPlansDialog";
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { SmsPackagesTab } from '@/components/SmsPackagesTab';

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

// Update SupplierProfile interface to include licenseFiles
interface SupplierProfile {
  _id: string;
  firstName: string;
  lastName: string;
  shopName: string;
  description?: string;
  email: string;
  mobile: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  supplierType: string;
  businessRegistrationNo?: string;
  profileImage?: string;
  type?: UserType;
  subscription?: Subscription;
  referralCode?: string;
  licenseFiles?: string[];
}

// Add DoctorProfile interface
interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  registrationNumber: string;
  doctorType: string;
  specialties: string[];
  diseases: string[];
  experience: string;
  clinicName: string;
  clinicAddress: string;
  state: string;
  city: string;
  pincode: string;
  profileImage?: string;
  subscription?: Subscription;
  type?: UserType;
  qualification?: string;
  registrationYear?: string;
  physicalConsultationStartTime?: string;
  physicalConsultationEndTime?: string;
  faculty?: string;
  assistantName?: string;
  assistantContact?: string;
  doctorAvailability?: string;
  landline?: string;
  workingWithHospital?: boolean;
  referralCode?: string;
  status?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  // New working hours fields
  physicalConsultation?: Record<string, Array<{startTime: string, endTime: string}>>;
  videoConsultationEnabled?: boolean;
  videoConsultation?: Record<string, Array<{startTime: string, endTime: string}>>;
}

// SUB-COMPONENTS FOR TABS
const ProfileTab = ({ vendor, setVendor }: any) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  
  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        _id: vendor._id,
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

const SubscriptionTab = ({ subscription, userType = 'vendor' }: { subscription?: Subscription; userType?: UserType }) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const isExpired = subscription?.endDate ? new Date(subscription.endDate) < new Date() : true;
  const daysLeft = !isExpired && subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Subscription</CardTitle>
          <CardDescription>
            Details about your current plan and billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">{subscription?.plan?.name || 'No Active Plan'}</h3>
              <p className="text-muted-foreground">
                {isExpired ? 'Expired' : `Expires on ${subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Unknown'}`}
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    <p className="font-semibold">{isExpired ? 'Expired' : 'Active'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="mt-1 font-semibold">
                  {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="mt-1 font-semibold">
                  {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
             {daysLeft > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
                    <div 
                        className={`h-2.5 rounded-full ${daysLeft <= 7 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${(daysLeft/30) * 100}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1">{daysLeft} days left</p>
                </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setShowPlansModal(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {isExpired ? 'Renew Subscription' : 'Change Plan'}
              </Button>
              <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {subscription && (
        <SubscriptionPlansDialog
          open={showPlansModal}
          onOpenChange={setShowPlansModal}
          subscription={subscription}
          userType={userType}
        />
      )}
      
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
    </>
  );
};

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
            <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
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
                className="object-contain max-h-[80vh] mx-auto"
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
            <Label htmlFor="accountHolder">Account Holder Name</Label>
            <Input 
              id="accountHolder"
              placeholder="Enter account holder name"
              value={bankDetails?.accountHolder || ''} 
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input 
              id="accountNumber"
              placeholder="Enter account number"
              value={bankDetails?.accountNumber || ''} 
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input 
              id="bankName"
              placeholder="Enter bank name"
              value={bankDetails?.bankName || ''} 
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input 
              id="ifscCode"
              placeholder="Enter IFSC code"
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

const OpeningHoursWithPropsTab = ({
  hours,
  setHours,
  setVendor,
  refetchWorkingHours,
}: {
  hours: OpeningHour[];
  setHours: any;
  setVendor: any;
  refetchWorkingHours: () => void;
}) => {
  const [updateWorkingHours, { isLoading: isSaving }] = useUpdateWorkingHoursMutation();

  const handleSave = async () => {
    try {
      // Transform hours array to the expected object format
      const workingHoursObject: Record<string, any> = {};
      const dayMapping: Record<string, string> = {
        'Monday': 'monday',
        'Tuesday': 'tuesday', 
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday',
        'Sunday': 'sunday'
      };

      hours.forEach(hour => {
        const dayKey = dayMapping[hour.day];
        if (dayKey) {
          workingHoursObject[dayKey] = {
            isOpen: hour.isOpen,
            hours: hour.isOpen && hour.open && hour.close ? [
              {
                openTime: hour.open,
                closeTime: hour.close
              }
            ] : []
          };
        }
      });

      const result = await updateWorkingHours({
        workingHours: workingHoursObject,
        timezone: 'Asia/Kolkata',
      }).unwrap();

      // Refetch working hours data to get the updated values
      refetchWorkingHours();

      // Update the vendor profile with the new opening hours
      setVendor((prev: any) => ({
        ...prev,
        openingHours: hours
      }));

      // Show success message
      toast.success('Working hours saved successfully!');
    } catch (error: any) {
      console.error('Error saving working hours:', error);
      toast.error(error?.data?.message || 'Failed to save working hours. Please try again.');
    }
  };

  const updateHours = (index: number, updates: Partial<OpeningHour>) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], ...updates };
    setHours(newHours);
  };

  // Function to apply the first open day's hours to all other open days
  const applyTimeForAll = async () => {
    // Find the first open day
    const firstOpenDay = hours.find(hour => hour.isOpen);
    
    // If no day is open, show a message and return
    if (!firstOpenDay) {
      toast.info('No open days found. Please open at least one day.');
      return;
    }
    
    // Apply the hours from the first open day to all other open days
    const newHours = hours.map(hour => {
      // Only update days that are open
      if (hour.isOpen) {
        return {
          ...hour,
          open: firstOpenDay.open,
          close: firstOpenDay.close
        };
      }
      // Return closed days unchanged
      return hour;
    });
    
    setHours(newHours);
    toast.success(`Applied ${firstOpenDay.open} to ${firstOpenDay.close} to all open days`);
    
    // Automatically save the changes
    try {
      // Transform hours array to the expected object format
      const workingHoursObject: Record<string, any> = {};
      const dayMapping: Record<string, string> = {
        'Monday': 'monday',
        'Tuesday': 'tuesday', 
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday',
        'Sunday': 'sunday'
      };

      newHours.forEach(hour => {
        const dayKey = dayMapping[hour.day];
        if (dayKey) {
          workingHoursObject[dayKey] = {
            isOpen: hour.isOpen,
            hours: hour.isOpen && hour.open && hour.close ? [
              {
                openTime: hour.open,
                closeTime: hour.close
              }
            ] : []
          };
        }
      });

      const result = await updateWorkingHours({
        workingHours: workingHoursObject,
        timezone: 'Asia/Kolkata',
      }).unwrap();

      // Refetch working hours data to get the updated values
      refetchWorkingHours();

      // Update the vendor profile with the new opening hours
      setVendor((prev: any) => ({
        ...prev,
        openingHours: newHours
      }));

      // Show success message
      toast.success('Working hours applied and saved successfully!');
    } catch (error: any) {
      console.error('Error saving working hours:', error);
      toast.error(error?.data?.message || 'Failed to save working hours. Please try again.');
    }
  };

  const {data : workingHoursData} = useGetWorkingHoursQuery(undefined);
  console.log("workingHoursData", workingHoursData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Opening Hours</CardTitle>
        <CardDescription>Set your weekly business hours</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b bg-muted/50">
            <div className="col-span-3">Day</div>
            <div className="col-span-3">Open Time</div>
            <div className="col-span-3">Close Time</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">Open</div>
          </div>
          
          {hours &&
            hours.map((hour, index) => (
              <div 
                key={hour.day} 
                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-muted/30 ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
              >
                <div className="col-span-3 font-medium flex items-center gap-2">
                  {hour.day}
                  {index === 0 && (
                    <Button
                      onClick={applyTimeForAll}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs rounded-full hover:scale-105 transition-transform"
                      disabled={isSaving}
                    >
                      Apply to All
                    </Button>
                  )}
                </div>
                <div className="col-span-3">
                  <Input
                    type="time"
                    value={hour.open}
                    disabled={!hour.isOpen}
                    onChange={(e) => {
                      updateHours(index, { open: e.target.value });
                    }}
                    className="h-9 border-muted-foreground/20"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="time"
                    value={hour.close}
                    disabled={!hour.isOpen}
                    onChange={(e) => {
                      updateHours(index, { close: e.target.value });
                    }}
                    className="h-9 border-muted-foreground/20"
                  />
                </div>
                <div className="col-span-2">
                  {hour.isOpen ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
                      Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      <div className="mr-1.5 h-2 w-2 rounded-full bg-red-500"></div>
                      Closed
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex justify-center">
                  <div 
                    onClick={() => updateHours(index, { isOpen: !hour.isOpen })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                      hour.isOpen ? 'bg-blue-400' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hour.isOpen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            className="px-6"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving Changes
              </>
            ) : (
              "Save Hours"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


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

// Add Doctor Profile Tab Component
const DoctorProfileTab = ({ doctor, setDoctor }: { doctor: DoctorProfile; setDoctor: any }) => {
  return (
    <Tabs defaultValue="basic-info" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
        <TabsTrigger value="professional">Professional</TabsTrigger>
        <TabsTrigger value="clinic">Clinic Details</TabsTrigger>
        <TabsTrigger value="assistant">Assistant</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="basic-info" className="mt-4">
        <DoctorBasicInfoTab doctor={doctor} setDoctor={setDoctor} />
      </TabsContent>
      <TabsContent value="professional" className="mt-4">
        <DoctorProfessionalDetailsTab doctor={doctor} setDoctor={setDoctor} />
      </TabsContent>
      <TabsContent value="clinic" className="mt-4">
        <DoctorClinicDetailsTab doctor={doctor} setDoctor={setDoctor} />
      </TabsContent>
      <TabsContent value="assistant" className="mt-4">
        <DoctorAssistantInfoTab doctor={doctor} setDoctor={setDoctor} />
      </TabsContent>
      <TabsContent value="documents" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Upload and manage your professional documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Document management functionality coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
};

const DoctorBasicInfoTab = ({ doctor, setDoctor }: { doctor: DoctorProfile; setDoctor: any }) => {
  const [updateDoctorProfile] = useUpdateDoctorProfileMutation();
  
  const handleSave = async () => {
    try {
      const updateData: any = {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        gender: doctor.gender,
        registrationNumber: doctor.registrationNumber,
        doctorType: doctor.doctorType,
        experience: doctor.experience,
        status: doctor.status,
        referralCode: doctor.referralCode,
      };

      const result: any = await updateDoctorProfile(updateData).unwrap();
      
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
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Manage your basic doctor profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Doctor Name</Label>
            <Input
              id="name"
              value={doctor.name || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={doctor.gender || ''}
              onValueChange={(value) => setDoctor({ ...doctor, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              type="tel"
              value={doctor.phone || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={doctor.email || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              value={doctor.registrationNumber || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, registrationNumber: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctorType">Doctor Type</Label>
            <Select
              value={doctor.doctorType || ''}
              onValueChange={(value) => setDoctor({ ...doctor, doctorType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Physician">Physician</SelectItem>
                <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                <SelectItem value="Surgeon">Surgeon</SelectItem>
                <SelectItem value="Trichologist">Trichologist</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              value={doctor.experience || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, experience: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={doctor.status || ''}
              onValueChange={(value) => setDoctor({ ...doctor, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <Input
              id="referralCode"
              value={doctor.referralCode || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, referralCode: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

const DoctorProfessionalDetailsTab = ({ doctor, setDoctor }: { doctor: DoctorProfile; setDoctor: any }) => {
  const [updateDoctorProfile] = useUpdateDoctorProfileMutation();
  
  const handleSave = async () => {
    try {
      const updateData: any = {
        _id: doctor._id,
        qualification: doctor.qualification,
        registrationYear: doctor.registrationYear,
        faculty: doctor.faculty,
        specialties: doctor.specialties,
        diseases: doctor.diseases,
        workingWithHospital: doctor.workingWithHospital,
        doctorAvailability: doctor.doctorAvailability,
      };

      const result: any = await updateDoctorProfile(updateData).unwrap();
      
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
        <CardTitle>Professional Details</CardTitle>
        <CardDescription>Manage your professional qualifications and specialties.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={doctor.qualification || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, qualification: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationYear">Registration Year</Label>
            <Input
              id="registrationYear"
              value={doctor.registrationYear || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, registrationYear: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty / Institution</Label>
            <Input
              id="faculty"
              value={doctor.faculty || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, faculty: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties</Label>
            <Textarea
              id="specialties"
              placeholder="Enter specialties separated by commas"
              value={doctor.specialties?.join(', ') || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diseases">Diseases Treated</Label>
            <Textarea
              id="diseases"
              placeholder="Enter diseases treated separated by commas"
              value={doctor.diseases?.join(', ') || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, diseases: e.target.value.split(',').map(d => d.trim()).filter(d => d) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Working With Hospital</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="workingWithHospital"
                checked={doctor.workingWithHospital || false}
                onCheckedChange={(checked: boolean) => setDoctor({ ...doctor, workingWithHospital: checked })}
              />
              <Label htmlFor="workingWithHospital">Yes</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctorAvailability">Doctor Availability</Label>
            <Select
              value={doctor.doctorAvailability || ''}
              onValueChange={(value) => setDoctor({ ...doctor, doctorAvailability: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

const DoctorClinicDetailsTab = ({ doctor, setDoctor }: { doctor: DoctorProfile; setDoctor: any }) => {
  const [updateDoctorProfile] = useUpdateDoctorProfileMutation();
  
  const handleSave = async () => {
    try {
      const updateData: any = {
        _id: doctor._id,
        clinicName: doctor.clinicName,
        clinicAddress: doctor.clinicAddress,
        state: doctor.state,
        city: doctor.city,
        pincode: doctor.pincode,
        landline: doctor.landline,
        // Removed physicalConsultationStartTime, physicalConsultationEndTime, and videoConsultation
        // as these are now managed in the Working Hours tab
      };

      const result: any = await updateDoctorProfile(updateData).unwrap();
      
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
        <CardTitle>Clinic / Hospital Details</CardTitle>
        <CardDescription>Manage your clinic information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              value={doctor.clinicName || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, clinicName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">Clinic Address</Label>
            <Textarea
              id="clinicAddress"
              value={doctor.clinicAddress || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, clinicAddress: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={doctor.state || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, state: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={doctor.city || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, city: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={doctor.pincode || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, pincode: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landline">Landline Number</Label>
            <Input
              id="landline"
              value={doctor.landline || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, landline: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

// Add Supplier Profile Tab Component
const SupplierProfileTab = ({ supplier, setSupplier }: { supplier: SupplierProfile; setSupplier: any }) => {
  const [updateSupplierProfile] = useUpdateSupplierProfileMutation();
  
  const handleSave = async () => {
    try {
      const updateData: any = {
        _id: supplier._id,
        firstName: supplier.firstName,
        lastName: supplier.lastName,
        shopName: supplier.shopName,
        description: supplier.description,
        email: supplier.email,
        mobile: supplier.mobile,
        country: supplier.country,
        state: supplier.state,
        city: supplier.city,
        pincode: supplier.pincode,
        address: supplier.address,
        supplierType: supplier.supplierType,
        businessRegistrationNo: supplier.businessRegistrationNo,
        referralCode: supplier.referralCode,
      };

      const result: any = await updateSupplierProfile(updateData).unwrap();
      
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
        <CardTitle>Supplier Profile</CardTitle>
        <CardDescription>Manage your supplier information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              placeholder="Enter your shop name"
              value={supplier.shopName || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, shopName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierType">Supplier Type</Label>
            <Input
              id="supplierType"
              placeholder="Supplier type"
              value={supplier.supplierType || ''}
              disabled
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={supplier.description || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, description: e.target.value })
              }
              placeholder="Describe your business..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              value={supplier.firstName || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, firstName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              value={supplier.lastName || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, lastName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              value={supplier.shopName || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, shopName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={supplier.description || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={supplier.email || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              value={supplier.mobile || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, mobile: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={supplier.country || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, country: e.target.value })
              id="businessRegistrationNo"
              placeholder="Enter business registration number"
              value={supplier.businessRegistrationNo || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, businessRegistrationNo: e.target.value })
              }
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter your full address"
            value={supplier.address || ''}
            onChange={(e) =>
              setSupplier({ ...supplier, address: e.target.value })
            }
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={supplier.city || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, city: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="Enter state"
              value={supplier.state || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, state: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={supplier.city || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, city: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              placeholder="Enter pincode"
              value={supplier.pincode || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, pincode: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={supplier.address || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, address: e.target.value })
              }
            />
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Enter country"
              value={supplier.country || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierType">Supplier Type</Label>
            <Input
              id="supplierType"
              value={supplier.supplierType || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, supplierType: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessRegistrationNo">Business Registration No</Label>
            <Input
              id="businessRegistrationNo"
              value={supplier.businessRegistrationNo || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, businessRegistrationNo: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code</Label>
            <Input
              id="referralCode"
              placeholder="Referral code"
              value={supplier.referralCode || ''}
              onChange={(e) =>
                setSupplier({ ...supplier, referralCode: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

const DoctorAssistantInfoTab = ({ doctor, setDoctor }: { doctor: DoctorProfile; setDoctor: any }) => {
  const [updateDoctorProfile] = useUpdateDoctorProfileMutation();
  
  const handleSave = async () => {
    try {
      const updateData: any = {
        _id: doctor._id,
        assistantName: doctor.assistantName,
        assistantContact: doctor.assistantContact,
      };

      const result: any = await updateDoctorProfile(updateData).unwrap();
      
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
        <CardTitle>Assistant Information</CardTitle>
        <CardDescription>Manage your assistant or receptionist information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="assistantName">Assistant Name</Label>
            <Input
              id="assistantName"
              value={doctor.assistantName || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, assistantName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assistantContact">Assistant Contact Number</Label>
            <Input
              id="assistantContact"
              value={doctor.assistantContact || ''}
              onChange={(e) =>
                setDoctor({ ...doctor, assistantContact: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};



// Add Supplier Documents Tab Component
const SupplierDocumentsTab = ({ supplier, setSupplier }: { supplier: SupplierProfile; setSupplier: any }) => {
  const [updateSupplierProfile] = useUpdateSupplierProfileMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Add state for preview image

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Convert files to base64 strings
      const base64Files: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        base64Files.push(base64);
      }

      // Update supplier profile with new license files
      const updatedLicenseFiles = [...(supplier.licenseFiles || []), ...base64Files];
      
      const result: any = await updateSupplierProfile({
        _id: supplier._id,
        licenseFiles: updatedLicenseFiles
      }).unwrap();

      if (result.success) {
        // Update local state with new license files
        setSupplier((prev: SupplierProfile) => ({
          ...prev,
          licenseFiles: updatedLicenseFiles
        }));
        toast.success('Documents uploaded successfully');
      } else {
        toast.error(result.message || 'Failed to upload documents');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleRemoveDocument = async (index: number) => {
    try {
      const updatedLicenseFiles = [...(supplier.licenseFiles || [])];
      updatedLicenseFiles.splice(index, 1);
      
      const result: any = await updateSupplierProfile({
        _id: supplier._id,
        licenseFiles: updatedLicenseFiles
      }).unwrap();

      if (result.success) {
        // Update local state
        setSupplier((prev: SupplierProfile) => ({
          ...prev,
          licenseFiles: updatedLicenseFiles
        }));
        toast.success('Document removed successfully');
      } else {
        toast.error(result.message || 'Failed to remove document');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to remove document');
    }
  };

  // Function to open image preview
  const openImagePreview = (imageSrc: string) => {
    setPreviewImage(imageSrc);
  };

  // Function to close image preview
  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Documents</CardTitle>
        <CardDescription>
          Upload and manage your business documents and licenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-6 border-2 border-dashed rounded-lg text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag & drop documents here or
          </p>
          <Button variant="link" asChild disabled={isUploading}>
            <label htmlFor="document-upload" className="cursor-pointer">
              {isUploading ? 'Uploading...' : 'browse to upload'}
            </label>
          </Button>
          <Input
            id="document-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf"
            onChange={handleDocumentUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="mt-2">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
          )}
        </div>
        
        {supplier.licenseFiles && supplier.licenseFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {supplier.licenseFiles.map((file, index) => (
              <div key={index} className="border rounded-lg overflow-hidden relative group">
                <div className="aspect-video relative">
                  <Image
                    src={file}
                    alt={`License document ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="cursor-pointer"
                    onClick={() => openImagePreview(file)}
                  />
                </div>
                <div className="p-2 bg-muted text-center text-sm">
                  License Document {index + 1}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                    onClick={() => openImagePreview(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleRemoveDocument(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12" />
            <p className="mt-2">No documents uploaded yet</p>
          </div>
        )}
      </CardContent>
      
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeImagePreview}>
          <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute -top-12 right-0"
              onClick={closeImagePreview}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={previewImage}
              alt="Document Preview"
              width={800}
              height={600}
              className="object-contain max-h-[80vh] mx-auto"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

// MAIN PAGE COMPONENT
export default function SalonProfilePage() {
  const { user, role } = useCrmAuth();
  
  // Vendor profile data
  const { data: vendorData, isLoading: isVendorLoading, isError: isVendorError, refetch: refetchVendor, error: vendorError } = useGetVendorProfileQuery(undefined, {
    skip: !user?._id || role !== 'vendor'
  });
  
  // Supplier profile data (current supplier's profile)
  const { data: supplierData, isLoading: isSupplierLoading, isError: isSupplierError, refetch: refetchSupplier, error: supplierError } = useGetCurrentSupplierProfileQuery(undefined, {
    skip: !user?._id || role !== 'supplier'
  });
  
  // Doctor profile data (current doctor's profile)
  const { data: doctorData, isLoading: isDoctorLoading, isError: isDoctorError, refetch: refetchDoctor, error: doctorError } = useGetDoctorProfileQuery(undefined, {
    skip: !user?._id || role !== 'doctor'
  });
  
  const { data: workingHoursData, isLoading: isLoadingWorkingHours, refetch: refetchWorkingHours } = useGetWorkingHoursQuery(undefined, {
    skip: !user?._id || role !== 'vendor'
  });
  
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [updateSupplierProfile] = useUpdateSupplierProfileMutation();
  const [updateDoctorProfile] = useUpdateDoctorProfileMutation();
  
  const [localVendor, setLocalVendor] = useState<VendorProfile | null>(null);
  const [localSupplier, setLocalSupplier] = useState<SupplierProfile | null>(null);
  const [localDoctor, setLocalDoctor] = useState<DoctorProfile | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (vendorData?.data) {
      setLocalVendor(vendorData.data);
    }
  }, [vendorData]);

  useEffect(() => {
    if (supplierData) {
      console.log("Supplier data received:", supplierData);
      setLocalSupplier({
        _id: supplierData._id,
        firstName: supplierData.firstName || '',
        lastName: supplierData.lastName || '',
        shopName: supplierData.shopName || '',
        description: supplierData.description || '', // Add description field
        email: supplierData.email || '',
        mobile: supplierData.mobile || '',
        country: supplierData.country || '',
        state: supplierData.state || '',
        city: supplierData.city || '',
        pincode: supplierData.pincode || '',
        address: supplierData.address || '',
        supplierType: supplierData.supplierType || '',
        businessRegistrationNo: supplierData.businessRegistrationNo || '',
        profileImage: supplierData.profileImage || '',
        type: 'supplier',
        referralCode: supplierData.referralCode || '',
        licenseFiles: supplierData.licenseFiles || [],
      });
    }
  }, [supplierData]);

  useEffect(() => {
    if (doctorData?.data) {
      console.log("Doctor data received:", doctorData.data);
      setLocalDoctor({
        _id: doctorData.data._id,
        name: doctorData.data.name || '',
        email: doctorData.data.email || '',
        phone: doctorData.data.phone || '',
        gender: doctorData.data.gender || '',
        registrationNumber: doctorData.data.registrationNumber || '',
        doctorType: doctorData.data.doctorType || '',
        specialties: doctorData.data.specialties || [],
        diseases: doctorData.data.diseases || [],
        experience: doctorData.data.experience || '',
        clinicName: doctorData.data.clinicName || '',
        clinicAddress: doctorData.data.clinicAddress || '',
        state: doctorData.data.state || '',
        city: doctorData.data.city || '',
        pincode: doctorData.data.pincode || '',
        profileImage: doctorData.data.profileImage || '',
        subscription: doctorData.data.subscription || undefined,
        type: 'doctor',
        qualification: doctorData.data.qualification || '',
        registrationYear: doctorData.data.registrationYear || '',
        faculty: doctorData.data.faculty || '',
        assistantName: doctorData.data.assistantName || '',
        assistantContact: doctorData.data.assistantContact || '',
        doctorAvailability: doctorData.data.doctorAvailability || '',
        landline: doctorData.data.landline || '',
        workingWithHospital: doctorData.data.workingWithHospital || false,
        referralCode: doctorData.data.referralCode || '',
        // New consultation fields
        physicalConsultation: doctorData.data.physicalConsultation || {
          startTime: doctorData.data.physicalConsultationStartTime || '',
          endTime: doctorData.data.physicalConsultationEndTime || '',
          days: doctorData.data.physicalConsultationDays || []
        },
        videoConsultationEnabled: doctorData.data.videoConsultationEnabled || false,
        videoConsultation: doctorData.data.videoConsultation || {
          startTime: '',
          endTime: '',
          days: []
        }
      });
    }
  }, [doctorData]);

  useEffect(() => {
    if (workingHoursData?.workingHoursArray && workingHoursData.workingHoursArray.length > 0) {
      setOpeningHours(workingHoursData.workingHoursArray);
    } else {
      // Initialize with default opening hours if none exist
      setOpeningHours([
        { day: 'Monday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Tuesday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Wednesday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Thursday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Saturday', open: '10:00', close: '15:00', isOpen: true },
        { day: 'Sunday', open: '', close: '', isOpen: false },
      ]);
    }
  }, [workingHoursData]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // Use the appropriate update function based on role
      if (role === 'vendor') {
        const result: any = await updateVendorProfile({
          _id: localVendor?._id,
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
      } else if (role === 'supplier') {
        // For suppliers, use the supplier update function
        const result: any = await updateSupplierProfile({
          _id: localSupplier?._id,
          profileImage: base64
        }).unwrap();

        if (result.success) {
          setLocalSupplier((prev: any) => ({
            ...prev,
            profileImage: base64
          }));
          toast.success('Profile image updated successfully');
        } else {
          toast.error(result.message || 'Failed to update profile image');
        }
      } else {
        // For doctors, use the doctor update function
        const result: any = await updateDoctorProfile({
          _id: localDoctor?._id,
          profileImage: base64
        }).unwrap();

        if (result.success) {
          setLocalDoctor((prev: any) => ({
            ...prev,
            profileImage: base64
          }));
          toast.success('Profile image updated successfully');
        } else {
          toast.error(result.message || 'Failed to update profile image');
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const openProfileImagePreview = () => {
    if (role === 'vendor' && localVendor?.profileImage) {
      setPreviewImage(localVendor.profileImage);
    } else if (role === 'supplier' && localSupplier?.profileImage) {
      setPreviewImage(localSupplier.profileImage);
    } else if (role === 'doctor' && localDoctor?.profileImage) {
      setPreviewImage(localDoctor.profileImage);
    }
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  // Auto-retry on error (up to 3 times)
  useEffect(() => {
    const hasError = (role === 'vendor' && isVendorError) || (role === 'supplier' && isSupplierError) || (role === 'doctor' && isDoctorError);
    if (hasError && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        if (role === 'vendor') {
          refetchVendor();
          refetchWorkingHours();
        } else if (role === 'supplier') {
          refetchSupplier();
        } else {
          refetchDoctor();
        }
        setRetryCount(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [isVendorError, isSupplierError, isDoctorError, retryCount, refetchVendor, refetchWorkingHours, refetchSupplier, refetchDoctor, role]);

  // Update the loading state to handle doctor profile
  if ((role === 'vendor' && isVendorLoading) || (role === 'supplier' && isSupplierLoading) || (role === 'doctor' && isDoctorLoading) || (role === 'vendor' && isLoadingWorkingHours)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Update the error state to handle doctor profile
  if ((role === 'vendor' && isVendorError && retryCount >= 3) || 
      (role === 'supplier' && isSupplierError && retryCount >= 3) || 
      (role === 'doctor' && isDoctorError && retryCount >= 3) ||
      (role === 'vendor' && !isVendorLoading && !localVendor && !isVendorError) ||
      (role === 'supplier' && !isSupplierLoading && !localSupplier && !isSupplierError) ||
      (role === 'doctor' && !isDoctorLoading && !localDoctor && !isDoctorError)) {
    // Extract error message safely
    let errorMessage = 'No profile data available';
    const error = role === 'vendor' ? vendorError : role === 'supplier' ? supplierError : doctorError;
    if (error) {
      try {
        errorMessage = `Error: ${JSON.stringify(error)}`;
      } catch (e) {
        errorMessage = 'Error: Unknown error occurred';
      }
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading profile</p>
          <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
          <Button 
            onClick={() => {
              if (role === 'vendor') {
                refetchVendor();
                refetchWorkingHours();
              } else if (role === 'supplier') {
                refetchSupplier();
              } else {
                refetchDoctor();
              }
              setRetryCount(0);
            }} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state if we have an error but are still retrying
  if (((role === 'vendor' && isVendorError) || (role === 'supplier' && isSupplierError) || (role === 'doctor' && isDoctorError)) && retryCount < 3) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Retrying to load profile...</p>
          <p className="text-sm text-muted-foreground mt-2">Attempt {retryCount + 1} of 3</p>
        </div>
      </div>
    );
  }

  // If we don't have data yet but aren't loading or in error state, show loading
  if ((role === 'vendor' && !localVendor) || (role === 'supplier' && !localSupplier) || (role === 'doctor' && !localDoctor)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Use either vendor, supplier, or doctor data based on role
  const profileData = role === 'vendor' ? localVendor : role === 'supplier' ? localSupplier : localDoctor;
  const setProfileData = role === 'vendor' ? setLocalVendor : role === 'supplier' ? setLocalSupplier : setLocalDoctor;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-lg flex-shrink-0 group">
              <Image
                src={profileData?.profileImage || "https://placehold.co/200x200.png"}
                alt={role === 'vendor' ? "Salon Logo" : role === 'supplier' ? "Supplier Logo" : "Doctor Profile"}
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
                      {profileData?.profileImage && (
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
                      )}
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full"
                        asChild
                      >
                        <label className="cursor-pointer">
                          <UploadCloud className="h-4 w-4" />
                          <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageUpload}
                            disabled={isUploading}
                            aria-label="Upload profile image"
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
                {role === 'vendor' ? (localVendor?.businessName || 'Your Salon') : 
                 role === 'supplier' ? (localSupplier?.shopName || `${localSupplier?.firstName} ${localSupplier?.lastName}`) : 
                 (localDoctor?.name || 'Doctor Profile')}
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" /> 
                {role === 'vendor' ? (localVendor?.address || 'Address not set') : 
                 role === 'supplier' ? (localSupplier?.address || `${localSupplier?.city || ''}, ${localSupplier?.state || ''}, ${localSupplier?.country || ''}`) :
                 (localDoctor?.clinicAddress || `${localDoctor?.city || ''}, ${localDoctor?.state || ''}`)}
              </CardDescription>
              <div className="text-sm text-muted-foreground mt-2">
                {role === 'vendor' ? 'Vendor' : role === 'supplier' ? 'Supplier' : 'Doctor'} ID:{" "}
                <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">
                  {profileData?._id?.substring(0, 8) || 'N/A'}
                </span>
              </div>
              {role === 'vendor' && localVendor?.website && (
                <div className="flex flex-wrap gap-4 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={localVendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" /> Website
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/apps">
                      <Download className="mr-2 h-4 w-4" /> Download App
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
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
              className="object-contain max-h-[80vh] mx-auto"
            />
          </div>
        </div>
      )}

      {role === 'vendor' ? (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="opening-hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="sms-packages">SMS Packages</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <ProfileTab
              vendor={localVendor as VendorProfile}
              setVendor={setLocalVendor}
            />
          </TabsContent>
          <TabsContent value="subscription" className="mt-4">
            <SubscriptionTab 
              subscription={localVendor?.subscription} 
              userType={localVendor?.type || 'vendor'}
            />
          </TabsContent>
          <TabsContent value="gallery" className="mt-4">
            <GalleryTab 
              gallery={localVendor?.gallery || []} 
              setVendor={setLocalVendor} 
            />
          </TabsContent>
          <TabsContent value="bank-details" className="mt-4">
            <BankDetailsTab 
              bankDetails={localVendor?.bankDetails || {}} 
              setVendor={setLocalVendor} 
            />
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <DocumentsTab 
              documents={localVendor?.documents || {}} 
              setVendor={setLocalVendor} 
            />
          </TabsContent>
          <TabsContent value="opening-hours" className="mt-4">
            <OpeningHoursWithPropsTab 
              hours={openingHours} 
              setHours={setOpeningHours}
              setVendor={setLocalVendor}
              refetchWorkingHours={refetchWorkingHours}
            />
          </TabsContent>
        <TabsContent value="sms-packages" className="mt-4">
          <SmsPackagesTab />
        </TabsContent>
          <TabsContent value="categories" className="mt-4">
            <CategoriesTab />
          </TabsContent>
        </Tabs>
      ) : role === 'supplier' && localSupplier ? (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <SupplierProfileTab
              supplier={localSupplier}
              setSupplier={setLocalSupplier}
            />
          </TabsContent>
          <TabsContent value="subscription" className="mt-4">
            <SubscriptionTab 
              subscription={localSupplier.subscription} 
              userType={localSupplier.type || 'supplier'}
            />
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <SupplierDocumentsTab 
              supplier={localSupplier}
              setSupplier={setLocalSupplier}
            />
          </TabsContent>
        </Tabs>
      ) : role === 'doctor' && localDoctor ? (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="clinic">Clinic Details</TabsTrigger>
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <DoctorBasicInfoTab
              doctor={localDoctor}
              setDoctor={setLocalDoctor}
            />
          </TabsContent>
          <TabsContent value="subscription" className="mt-4">
            <SubscriptionTab 
              subscription={localDoctor.subscription} 
              userType={localDoctor.type || 'doctor'}
            />
          </TabsContent>
          <TabsContent value="professional" className="mt-4">
            <DoctorProfessionalDetailsTab 
              doctor={localDoctor}
              setDoctor={setLocalDoctor}
            />
          </TabsContent>
          <TabsContent value="clinic" className="mt-4">
            <DoctorClinicDetailsTab 
              doctor={localDoctor}
              setDoctor={setLocalDoctor}
            />
          </TabsContent>
          <TabsContent value="assistant" className="mt-4">
            <DoctorAssistantInfoTab 
              doctor={localDoctor}
              setDoctor={setLocalDoctor}
            />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}

