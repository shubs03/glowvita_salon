
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
import { SubscriptionPlansDialog } from "@/components/SubscriptionPlansDialog";

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

const SubscriptionTab = ({ subscription, userType = 'vendor' }: { subscription: Subscription; userType?: UserType }) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const isExpired = subscription?.endDate ? new Date(subscription.endDate) < new Date() : true;
  const daysLeft = !isExpired ? Math.ceil((new Date(subscription?.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  
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
                {isExpired ? 'Expired' : `Expires on ${new Date(subscription?.endDate).toLocaleDateString()}`}
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

      <SubscriptionPlansDialog
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
        subscription={subscription}
        userType={userType}
      />
      
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

const OpeningHoursTab = () => {
  // Get the token from Redux store
  const token = useSelector((state) => state.crmAuth?.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState<OpeningHour[]>([
    { day: 'Monday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Tuesday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Wednesday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Thursday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
    { day: 'Saturday', open: '10:00', close: '15:00', isOpen: true },
    { day: 'Sunday', open: '', close: '', isOpen: false },
  ]);

  // Fetch working hours on component mount
  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        if (!token) {
          console.error('No authentication token found in Redux store');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/crm/workinghours', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Debug log
          
          // Check if data is an array or has a workingHours property
          const workingHours = Array.isArray(data) ? data : 
                             (Array.isArray(data.workingHours) ? data.workingHours : null);
          
          if (workingHours) {
            setHours(prevHours => 
              prevHours.map(day => {
                const savedDay = workingHours.find((h: any) => h.day === day.day);
                return {
                  ...day,
                  ...(savedDay || {})
                };
              })
            );
          }
        } else if (response.status === 401) {
          // Handle unauthorized error
          console.error('Unauthorized: Please log in again');
        }
      } catch (error) {
        console.error('Error fetching working hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('/api/crm/workinghours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          workingHours: hours,
          timezone: 'Asia/Kolkata',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save working hours');
      }

      // Show success message
      alert('Working hours saved successfully!');
    } catch (error) {
      console.error('Error saving working hours:', error);
      alert('Failed to save working hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateHours = (index: number, updates: Partial<OpeningHour>) => {
    setHours(prev => {
      const newHours = [...prev];
      newHours[index] = { ...newHours[index], ...updates };
      return newHours;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opening Hours</CardTitle>
        <CardDescription>Set your weekly business hours.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hours.map((hour, index) => (
          <div key={hour.day} className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 flex items-center">
              <Checkbox
                id={hour.day}
                checked={hour.isOpen}
                onCheckedChange={(checked) => {
                  updateHours(index, { isOpen: !!checked });
                }}
                className="mr-2"
              />
              <Label htmlFor={hour.day} className="font-medium">
                {hour.day}
              </Label>
            </div>
            <div className="col-span-1">
              <Input
                type="time"
                value={hour.open}
                disabled={!hour.isOpen}
                onChange={(e) => {
                  updateHours(index, { open: e.target.value });
                }}
              />
            </div>
            <div className="col-span-1">
              <Input
                type="time"
                value={hour.close}
                disabled={!hour.isOpen}
                onChange={(e) => {
                  updateHours(index, { close: e.target.value });
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
    </Card>
  );
};
const OpeningHoursWithPropsTab = ({
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
      {hours &&
        hours.map((hour, index) => (
          <div key={hour.day} className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 flex items-center">
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
          </div>
        ))}
    </CardContent>

    <CardFooter>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Hours"}
      </Button>
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
  // Remove unused state since OpeningHoursTab manages its own state now
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
          <OpeningHoursTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
