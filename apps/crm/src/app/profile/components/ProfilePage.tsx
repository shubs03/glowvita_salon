"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useGetVendorProfileQuery, useGetWorkingHoursQuery, useGetCurrentSupplierProfileQuery, useGetDoctorProfileQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { ProfileTab } from './tabs/ProfileTab';
import { SupplierProfileTab } from './tabs/SupplierProfileTab';
import { SubscriptionTab } from './tabs/SubscriptionTab';
import { GalleryTab } from './tabs/GalleryTab';
import { BankDetailsTab } from './tabs/BankDetailsTab';
import { TravelSettingsTab } from './tabs/TravelSettingsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { OpeningHoursTab } from './tabs/OpeningHoursTab';
import { TaxesTab } from './tabs/TaxesTab';

import { SmsPackagesTab } from '@/components/SmsPackagesTab';
import { QRCodeModal } from './modals/QRCodeModal';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSkeleton } from './ProfileSkeleton';

// TYPES
type SalonCategory = "unisex" | "men" | "women";
type SubCategory = "at-salon" | "at-home" | "custom-location";
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
  vendorType?: 'shop-only' | 'home-only' | 'onsite-only' | 'hybrid' | 'vendor-home-travel';
  travelRadius?: number;
  travelSpeed?: number;
  baseLocation?: {
    lat: number;
    lng: number;
  };
  location?: {
    lat: number;
    lng: number;
  };
  taxes?: {
    taxValue: number;
    taxType: "percentage" | "fixed";
  };
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
  upiId?: string;
}

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

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
  gallery?: string[];
  documents?: Record<string, any>;
  bankDetails?: BankDetails;
  type?: UserType;
  subscription?: Subscription;
  referralCode?: string;
  licenseFiles?: string[];
  taxes?: {
    taxValue: number;
    taxType: "percentage" | "fixed";
  };
}

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
  physicalConsultation?: Record<string, Array<{ startTime: string, endTime: string }>>;
  videoConsultationEnabled?: boolean;
  videoConsultation?: Record<string, Array<{ startTime: string, endTime: string }>>;
}

export default function ProfilePage() {
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

  console.log("Doctor Data:", doctorData);

  const { data: workingHoursData, isLoading: isLoadingWorkingHours, refetch: refetchWorkingHours } = useGetWorkingHoursQuery(undefined, {
    skip: !user?._id || role !== 'vendor'
  });

  const [localVendor, setLocalVendor] = useState<VendorProfile | null>(null);
  const [localSupplier, setLocalSupplier] = useState<SupplierProfile | null>(null);
  const [localDoctor, setLocalDoctor] = useState<DoctorProfile | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    if (vendorData?.data) {
      console.log("Vendor data received:", vendorData.data);
      // Ensure bankDetails is properly initialized
      const vendorWithBankDetails = {
        ...vendorData.data,
        bankDetails: vendorData.data.bankDetails || {},
        taxes: vendorData.data.taxes || { taxValue: 0, taxType: 'percentage' }
      };
      setLocalVendor(vendorWithBankDetails);
    }
  }, [vendorData]);

  useEffect(() => {
    if (supplierData) {
      console.log("Supplier data received:", supplierData);
      // Access the actual supplier data from the response
      const supplierInfo = supplierData.data || supplierData;
      setLocalSupplier({
        _id: supplierInfo._id,
        firstName: supplierInfo.firstName || '',
        lastName: supplierInfo.lastName || '',
        shopName: supplierInfo.shopName || '',
        description: supplierInfo.description || '', // Add description field
        email: supplierInfo.email || '',
        mobile: supplierInfo.mobile || '',
        country: supplierInfo.country || '',
        state: supplierInfo.state || '',
        city: supplierInfo.city || '',
        pincode: supplierInfo.pincode || '',
        address: supplierInfo.address || '',
        supplierType: supplierInfo.supplierType || '',
        businessRegistrationNo: supplierInfo.businessRegistrationNo || '',
        profileImage: supplierInfo.profileImage || '',
        gallery: supplierInfo.gallery || [],
        documents: supplierInfo.documents || {},
        bankDetails: supplierInfo.bankDetails || {},
        type: 'supplier',
        subscription: supplierInfo.subscription || undefined,
        referralCode: supplierInfo.referralCode || '',
        licenseFiles: supplierInfo.licenseFiles || [],
        taxes: supplierInfo.taxes || { taxValue: 0, taxType: 'percentage' },
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

  // Use either vendor, supplier, or doctor data based on role
  const profileData = role === 'vendor' ? localVendor : role === 'supplier' ? localSupplier : localDoctor;
  const setProfileData = role === 'vendor' ? setLocalVendor : role === 'supplier' ? setLocalSupplier : setLocalDoctor;

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
    return <ProfileSkeleton />;
  }

  // If we don't have data yet but aren't loading or in error state, show loading
  if ((role === 'vendor' && !localVendor) || (role === 'supplier' && !localSupplier) || (role === 'doctor' && !localDoctor)) {
    return <ProfileSkeleton />;
  }

  // Handler for profile image upload
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

      // This would be handled by the ProfileHeader component, but we need to update the state here
      if (role === 'vendor' && localVendor) {
        setLocalVendor({ ...localVendor, profileImage: base64 });
      } else if (role === 'supplier' && localSupplier) {
        setLocalSupplier({ ...localSupplier, profileImage: base64 });
      } else if (role === 'doctor' && localDoctor) {
        setLocalDoctor({ ...localDoctor, profileImage: base64 });
      }

      toast.success('Profile image updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Salon Profile
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                Manage your salon profile and settings
              </p>
            </div>
          </div>
        </div>

        <ProfileHeader
          role={role}
          profileData={profileData}
          localVendor={localVendor}
          localSupplier={localSupplier}
          localDoctor={localDoctor}
          isUploading={isUploading}
          handleProfileImageUpload={handleProfileImageUpload}
          openProfileImagePreview={() => toast.info('Image preview coming soon')}
          setQrModalOpen={setQrModalOpen}
        />

        <Tabs defaultValue="profile" className="w-full">
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide smooth-scroll">
              <TabsList className="inline-flex h-auto items-center gap-1.5 sm:gap-2 rounded-xl bg-muted/50 p-1 sm:p-1.5 backdrop-blur-sm border border-border/50 shadow-sm w-auto min-w-full">
                <TabsTrigger
                  value="profile"
                  className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                >
                  Profile
                </TabsTrigger>
                {role === 'vendor' && (
                  <>
                    <TabsTrigger
                      value="subscription"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Subscription
                    </TabsTrigger>
                    <TabsTrigger
                      value="gallery"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Gallery
                    </TabsTrigger>
                    <TabsTrigger
                      value="bank"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      <span className="hidden sm:inline">Bank Details</span>
                      <span className="sm:hidden">Bank</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="travel"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      <span className="hidden sm:inline">Travel Settings</span>
                      <span className="sm:hidden">Travel</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Documents
                    </TabsTrigger>
                    <TabsTrigger
                      value="hours"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      <span className="hidden sm:inline">Opening Hours</span>
                      <span className="sm:hidden">Hours</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="sms"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      <span className="hidden sm:inline">SMS Packages</span>
                      <span className="sm:hidden">SMS</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="taxes"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Taxes
                    </TabsTrigger>
                  </>
                )}
                {role === 'supplier' && (
                  <>
                    <TabsTrigger
                      value="subscription"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Subscription
                    </TabsTrigger>
                    <TabsTrigger
                      value="gallery"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Gallery
                    </TabsTrigger>
                    <TabsTrigger
                      value="bank"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Bank Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Documents
                    </TabsTrigger>
                    <TabsTrigger
                      value="sms"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      <span className="hidden sm:inline">SMS Packages</span>
                      <span className="sm:hidden">SMS</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="taxes"
                      className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                    >
                      Taxes
                    </TabsTrigger>
                  </>
                )}
                {role === 'doctor' && (
                  <TabsTrigger
                    value="subscription"
                    className="whitespace-nowrap rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all hover:bg-background/60 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                  >
                    Subscription
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          </div>

          <TabsContent value="profile">
            {role === 'vendor' && localVendor && (
              <ProfileTab vendor={localVendor} setVendor={setLocalVendor} />
            )}
            {role === 'supplier' && localSupplier && (
              <SupplierProfileTab supplier={localSupplier} setSupplier={setLocalSupplier} />
            )}
            {role === 'doctor' && localDoctor && (
              <div className="p-8 text-center bg-card rounded-xl border border-dashed">
                <p className="text-muted-foreground">Doctor Profile Tab - Coming Soon</p>
              </div>
            )}
          </TabsContent>

          {role === 'vendor' && (
            <>
              <TabsContent value="subscription">
                <SubscriptionTab subscription={localVendor?.subscription} userType="vendor" />
              </TabsContent>

              <TabsContent value="gallery">
                <GalleryTab gallery={localVendor?.gallery || []} setVendor={setLocalVendor} />
              </TabsContent>

              <TabsContent value="bank">
                <BankDetailsTab bankDetails={localVendor?.bankDetails || {}} setVendor={setLocalVendor} />
              </TabsContent>

              <TabsContent value="travel">
                <TravelSettingsTab vendor={localVendor} setVendor={setLocalVendor} />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsTab documents={localVendor?.documents} setVendor={setLocalVendor} />
              </TabsContent>

              <TabsContent value="hours">
                <OpeningHoursTab
                  hours={openingHours}
                  setHours={setOpeningHours}
                  setVendor={setLocalVendor}
                  refetchWorkingHours={refetchWorkingHours}
                />
              </TabsContent>

              <TabsContent value="sms">
                <SmsPackagesTab />
              </TabsContent>

              <TabsContent value="taxes">
                <TaxesTab taxes={localVendor?.taxes || { taxValue: 0, taxType: 'percentage' }} setVendor={setLocalVendor} />
              </TabsContent>
            </>
          )}

          {role === 'supplier' && (
            <>
              <TabsContent value="subscription">
                <SubscriptionTab subscription={localSupplier?.subscription} userType="supplier" />
              </TabsContent>

              <TabsContent value="gallery">
                <GalleryTab gallery={localSupplier?.gallery || []} setVendor={setLocalSupplier} />
              </TabsContent>

              <TabsContent value="bank">
                <BankDetailsTab bankDetails={localSupplier?.bankDetails || {}} setVendor={setLocalSupplier} />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsTab documents={localSupplier?.documents} setVendor={setLocalSupplier} />
              </TabsContent>

              <TabsContent value="sms">
                <SmsPackagesTab />
              </TabsContent>

              <TabsContent value="taxes">
                <TaxesTab taxes={localSupplier?.taxes || { taxValue: 0, taxType: 'percentage' }} setVendor={setLocalSupplier} />
              </TabsContent>
            </>
          )}

          {role === 'doctor' && (
            <TabsContent value="subscription">
              <SubscriptionTab subscription={localDoctor?.subscription} userType="doctor" />
            </TabsContent>
          )}
        </Tabs>

        <QRCodeModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          profileData={profileData}
          role={role}
        />
      </div>
    </div>
  );
}