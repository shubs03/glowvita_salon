
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Shield,
  Check,
  Award,
  ThumbsUp,
  ArrowRight,
  ShoppingCart,
  Tag,
  Edit,
  Trash2,
  Eye,
  Users,
  UserPlus,
  TrendingUp,
  Sparkles,
  Zap,
  Calendar,
  Gift,
  Percent,
  Share,
  Loader2,
  Pin,
  LocateIcon,
  Mail,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { PageContainer } from "@repo/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/cn";
import {
  useGetPublicVendorsQuery,
  useGetPublicVendorProductsQuery,
  useGetPublicVendorStaffQuery,
  useGetPublicVendorOffersQuery,
  useGetPublicVendorWorkingHoursQuery,
  useGetPublicVendorServicesQuery,
} from "@repo/store/api";
import ServicesSection from "./components/ServicesSection";
import Link from "next/link";

// Skeleton Components
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="relative aspect-square overflow-hidden rounded-md m-3">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="p-3 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  </Card>
);

const StaffSkeleton = () => (
  <div className="text-center">
    <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
    <Skeleton className="h-4 w-24 mx-auto mb-2" />
    <Skeleton className="h-3 w-20 mx-auto" />
  </div>
);

// Staff Display Component
const StaffDisplay = ({
  staffData,
  isLoading,
}: {
  staffData: any[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <StaffSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!staffData || staffData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-secondary/20 rounded-lg p-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Team information will be displayed here
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Meet our talented professionals when available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {staffData.map((member: any, index: number) => (
        <div key={member.id || index} className="text-center group">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg mb-4 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
            <Image
              src={
                member.image ||
                `https://placehold.co/128x128/e2e8f0/64748b?text=${(member.name || "Staff").charAt(0)}`
              }
              alt={member.name || "Staff Member"}
              fill
              className="object-cover"
              data-ai-hint={`${member.name || "staff member"} portrait`}
            />
          </div>
          <h4 className="font-semibold text-lg mb-1">
            {member.name || "Staff Member"}
          </h4>
          <p className="text-sm text-primary font-medium">
            {member.role || "Team Member"}
          </p>
        </div>
      ))}
    </div>
  );
};

const ReviewSkeleton = () => (
  <div className="border-t pt-4 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-12 w-full" />
  </div>
);

const StatSkeleton = () => (
  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
    <Skeleton className="h-8 w-12 mx-auto" />
    <Skeleton className="h-3 w-20 mx-auto" />
  </div>
);

const OfferSkeleton = () => (
  <Card className="p-6 text-center space-y-4">
    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
    <Skeleton className="h-5 w-32 mx-auto" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-8 w-24 mx-auto" />
  </Card>
);

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

// Working Hours Display Component
const WorkingHoursDisplay = ({
  workingHoursData,
  isLoading,
  error,
}: {
  workingHoursData: any;
  isLoading: boolean;
  error: any;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Unable to load working hours</p>
        <p className="text-xs text-muted-foreground mt-1">
          Please try again later
        </p>
      </div>
    );
  }

  // Check if we have working hours data - use workingHoursArray as the primary source (consistent with CRM)
  const workingHours =
    workingHoursData?.workingHoursArray || workingHoursData?.workingHours;

  if (!workingHours || workingHours.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <div className="bg-secondary/20 rounded-lg p-6">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm">Working hours not available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact salon for current hours
          </p>
        </div>
      </div>
    );
  }

  // Helper function to format time display
  const formatTimeDisplay = (dayData: any) => {
    // Handle new format with open/close/isOpen
    if (
      dayData.hasOwnProperty("isOpen") &&
      dayData.hasOwnProperty("open") &&
      dayData.hasOwnProperty("close")
    ) {
      if (!dayData.isOpen) {
        return "Closed";
      }
      if (dayData.open && dayData.close) {
        return `${dayData.open} - ${dayData.close}`;
      }
      return "Open";
    }

    // Handle old format with hours property
    if (dayData.hours) {
      return dayData.hours;
    }

    return "Closed";
  };

  return (
    <ul className="space-y-2">
      {workingHours.map((wh: any) => {
        const timeDisplay = formatTimeDisplay(wh);
        return (
          <li key={wh.day} className="flex justify-between text-sm">
            <span>{wh.day}</span>
            <span
              className={cn(
                "font-semibold",
                timeDisplay === "Closed"
                  ? "text-muted-foreground"
                  : "text-blue-600"
              )}
            >
              {timeDisplay}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

// Minimal default data for loading/fallback
const defaultSalon = {
  id: "",
  name: "Loading...",
  rating: 0,
  reviewCount: 0,
  address: "",
  email: "",
  website: "",
  phone: "",
  description: "",
  mission: "",
  images: ["https://placehold.co/1200x800/e2e8f0/64748b?text=Loading..."],
};

// Function to get the salon data dynamically
export default function SalonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [visibleTab, setVisibleTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState("");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const {
    data: vendorsResponse,
    isLoading,
    error,
  } = useGetPublicVendorsQuery(undefined);

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useGetPublicVendorServicesQuery(id);

  console.log("servicesData:", servicesData);

  const vendorData = useMemo(() => {
    const vendors = vendorsResponse?.vendors || [];
    return vendors.find((v: any) => v._id === id);
  }, [vendorsResponse, id]);

  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetPublicVendorProductsQuery(id, {
    skip: !id,
  });

  // Fetch staff for the specific vendor
  const {
    data: staffData,
    isLoading: isLoadingStaff,
    error: staffError,
  } = useGetPublicVendorStaffQuery(id, {
    skip: !id,
  });

  // Fetch offers for the specific vendor
  const {
    data: offersData,
    isLoading: isLoadingOffers,
    error: offersError,
  } = useGetPublicVendorOffersQuery(id, {
    skip: !id,
  });

  // Fetch working hours for the specific vendor
  const {
    data: workingHoursData,
    isLoading: isLoadingWorkingHours,
    error: workingHoursError,
  } = useGetPublicVendorWorkingHoursQuery(id, {
    skip: !id,
  });

  console.log("workingHoursData:", workingHoursData);

  const salon = useMemo(() => {
    if (vendorData) {
      const salonData = {
        ...defaultSalon,
        id: vendorData._id || defaultSalon.id,
        name: vendorData.businessName || "No Name Available",
        rating: vendorData.rating || 4.8,
        reviewCount: vendorData.clientCount || 250,
        address: `${vendorData.city || ""}, ${vendorData.state || ""}`,
        email: vendorData.email || "",
        website: vendorData.website || "",
        phone: vendorData.phone || "",
        description: vendorData.description || "No description available",
        mission:
          vendorData.description ||
          "To enhance beauty and wellness through personalized care and high-quality services.",
        images:
          vendorData.gallery && vendorData.gallery.length > 0
            ? vendorData.gallery
            : vendorData.profileImage
              ? [vendorData.profileImage, ...defaultSalon.images.slice(1)]
              : defaultSalon.images,
      };

      return salonData;
    }
    return defaultSalon;
  }, [vendorData]);

  const salonProducts = useMemo(() => {
    if (!productsData?.products) return [];

    // Products are already filtered by vendor ID on the server side
    return productsData.products.map((p: any) => ({
      id: p.id || p._id,
      name: p.name || p.productName,
      description: p.description || "",
      price: p.price || 0,
      salePrice: p.salePrice || null,
      image:
        p.image ||
        p.productImage ||
        "https://placehold.co/320x224/e2e8f0/64748b?text=Product",
      category: p.category || "Beauty Products",
      stock: p.stock || 0,
      rating: p.rating || (4.2 + Math.random() * 0.8).toFixed(1),
      hint: p.hint || p.description || p.name || p.productName,
    }));
  }, [productsData]);

  useEffect(() => {
    if (salon.images.length > 0) {
      setMainImage(salon.images[0]);
    }
  }, [salon.images]);

  const handleBookNow = (service?: any) => {
    // Store selected service in sessionStorage for the booking flow
    if (service) {
      sessionStorage.setItem("selectedService", JSON.stringify(service));
    } else {
      sessionStorage.removeItem("selectedService");
    }
    router.push(`/book/${id}`);
  };

  const handleBuyNow = (product: any) => {
    // Store product details in local storage
    try {
      localStorage.setItem('buyNowProduct', JSON.stringify(product));
      // Redirect to checkout page
      router.push('/checkout');
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      // Handle potential storage errors (e.g., private browsing)
      alert('Could not process your request. Please ensure you are not in private browsing mode.');
    }
  };

  const openGalleryModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsGalleryModalOpen(true);
  };

  const closePreview = () => {
    setSelectedImage("");
  };

  if (isLoading) {
    return (
      <>
        <MarketingHeader 
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          isHomePage={false}
        />
        <PageContainer padding="none">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <section className="py-8 border-b">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-80" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </section>

          {/* Gallery Skeleton */}
          <section className="py-8">
            <div className="grid grid-cols-4 gap-4 h-96">
              <div className="col-span-2 row-span-2">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
              <Skeleton className="rounded-lg h-full" />
              <Skeleton className="rounded-lg h-full" />
              <Skeleton className="rounded-lg h-full" />
              <Skeleton className="rounded-lg h-full" />
            </div>
          </section>

          {/* Content Skeleton */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start py-8">
            <div className="lg:col-span-2 space-y-16">
              {/* About Section Skeleton */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="grid sm:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <StatSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Services Skeleton */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>

              {/* Products Skeleton */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-52" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
      <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <MarketingHeader 
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          isHomePage={false}
        />
        <PageContainer padding="none">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't load the salon details. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </PageContainer>
      <Footer />
      </>
    );
  }

  // Vendor not found
  if (!vendorData) {
    return (
      <>
        <MarketingHeader 
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          isHomePage={false}
        />
        <PageContainer padding="none">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Salon Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The salon you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </PageContainer>
      <Footer />
      </>
    );
  }

  interface Service {
    name: string;
    price: number;
    duration: number;
    category: string;
    image: string;
  }

  interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    hint: string;
    stock: number;
    rating: number;
  }

  interface StaffMember {
    name: string;
    role: string;
    image: string;
    hint: string;
  }

  interface Review {
    author: string;
    rating: number;
    date: string;
    text: string;
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  return (
    <>
      <MarketingHeader 
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        isHomePage={false}
      />
      <PageContainer padding="none">
        <div className="container mx-auto px-4">
        {/* Salon Name and Basic Info */}
        <section className="py-8 border-b">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-5xl font-bold font-headline mb-4">
                {salon.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{salon.rating}</span>
                  <span>({salon.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{salon.address}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </section>

        {/* Compact Bento Grid Hero Gallery */}
        <section className="py-6">
          <div className="grid grid-cols-6 grid-rows-2 gap-2 h-40 md:h-64 lg:h-96">
            <div
              className="col-span-4 md:col-span-3 row-span-2 rounded-md overflow-hidden group cursor-pointer"
              onClick={() => openGalleryModal(salon.images[0])}
            >
              <Image
                src={salon.images[0]}
                alt={salon.name}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="luxury salon interior main view"
              />
            </div>
            <div
              className="col-span-2 md:col-span-1 row-span-1 rounded-md overflow-hidden group cursor-pointer"
              onClick={() => openGalleryModal(salon.images[1])}
            >
              <Image
                src={salon.images[1]}
                alt={`${salon.name} view 2`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon detail photo"
              />
            </div>
            <div
              className="hidden md:block col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative"
              onClick={() => openGalleryModal(salon.images[2])}
            >
              <Image
                src={salon.images[2]}
                alt={`${salon.name} view 3`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon treatment room"
              />
            </div>
            <div
              className="col-span-2 md:col-span-1 row-span-1 rounded-md overflow-hidden group cursor-pointer"
              onClick={() => openGalleryModal(salon.images[3])}
            >
              <Image
                src={salon.images[3]}
                alt={`${salon.name} view 4`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon product display"
              />
            </div>
            <div
              className="hidden md:block col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative"
              onClick={() => openGalleryModal(salon.images[0])}
            >
              <Image
                src={salon.images[0]}
                alt={`${salon.name} view 1`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon reception area"
              />
              {salon.images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-semibold text-sm">
                    +{salon.images.length - 4} more
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-12 lg:items-start py-8">
          {/* Left Scrolling Column */}
          <div className="lg:col-span-2 space-y-16">
            {/* About Section */}
            <section id="about">
              <h2 className="text-4xl font-bold mb-2">About {salon.name}</h2>
              <p className="text-muted-foreground mb-6">
                Discover the story and values behind our brand.
              </p>

              <div className="space-y-8">
                <p className="text-muted-foreground leading-relaxed">
                  {salon.mission || salon.description}
                </p>
                {/* Stats section - always show structure with values or defaults */}
                <div className="grid sm:grid-cols-4 gap-6 text-center">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12 mx-auto" />
                      ) : (
                        vendorData?.stats?.find(
                          (s: any) => s.label === "Years Experience"
                        )?.value ||
                        vendorData?.yearsExperience ||
                        0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Years Experience
                    </p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12 mx-auto" />
                      ) : (
                        vendorData?.stats?.find(
                          (s: any) => s.label === "Happy Clients"
                        )?.value ||
                        vendorData?.clientCount ||
                        salon.reviewCount ||
                        0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Happy Clients
                    </p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12 mx-auto" />
                      ) : (
                        vendorData?.stats?.find(
                          (s: any) => s.label === "Services"
                        )?.value ||
                        servicesData?.services?.length ||
                        0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Services
                    </p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12 mx-auto" />
                      ) : (
                        vendorData?.stats?.find(
                          (s: any) => s.label === "Awards"
                        )?.value ||
                        vendorData?.awards?.length ||
                        0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Awards</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="offers">
              <h2 className="text-4xl font-bold mb-2">Offers Available</h2>
              <p className="text-muted-foreground mb-6">
                Take advantage of our special offers and packages.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {isLoadingOffers ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="p-6 text-center space-y-4">
                      <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                      <Skeleton className="h-5 w-32 mx-auto" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-8 w-24 mx-auto" />
                    </Card>
                  ))
                ) : offersData?.data?.length > 0 &&
                  offersData.data.filter(
                    (offer: any) => offer.status === "Active"
                  ).length > 0 ? (
                  offersData.data
                    .filter((offer: any) => offer.status === "Active") // Only show active offers
                    .map((offer: any, index: number) => {
                      const Icon = Gift; // Using Gift as default icon
                      return (
                        <Card
                          key={offer._id || index}
                          className="group flex flex-col p-6 text-center border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-background to-primary/5"
                        >
                          <div className="mx-auto bg-gradient-to-br from-primary/10 to-primary/20 text-primary p-4 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                            {offer.code}
                          </h3>
                          <p className="text-sm text-muted-foreground flex-grow mb-4">
                            {offer.type === "percentage"
                              ? `${offer.value}% discount on selected services`
                              : `$${offer.value} off on selected services`}
                          </p>
                          <div className="text-sm space-y-1 mb-4">
                            {offer.value && (
                              <p className="text-primary font-semibold">
                                {offer.type === "percentage"
                                  ? `${offer.value}% OFF`
                                  : `$${offer.value} OFF`}
                              </p>
                            )}
                            {offer.expires && (
                              <p className="text-xs text-muted-foreground">
                                Valid until:{" "}
                                {new Date(offer.expires).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="link"
                            className="text-primary group-hover:underline"
                          >
                            Claim Offer{" "}
                            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Card>
                      );
                    })
                ) : (
                  // Show placeholder when no offers available
                  <div className="col-span-3 text-center py-12">
                    <div className="bg-secondary/20 rounded-lg p-8">
                      <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No special offers available at the moment
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check back later for exciting deals!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Services Section */}
            <ServicesSection vendorId={id} onBookNow={handleBookNow} />

            <section id="products">
              <h2 className="text-4xl font-bold mb-2">
                Products We Use & Sell
              </h2>
              <p className="text-muted-foreground mb-6">
                High-quality products available for purchase.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {salonProducts.length > 0 ? (
                  salonProducts.map((product: any) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-lg transition-shadow flex flex-col text-left"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-md m-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="group-hover:scale-105 transition-transform duration-300 object-cover"
                          data-ai-hint={product.hint}
                        />
                        <Badge
                          variant={product.stock > 0 ? "secondary" : "default"}
                          className="absolute top-2 right-2 text-xs"
                        >
                          {product.stock > 0 ? `In Stock` : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="p-3 flex flex-col flex-grow">
                        <p className="text-xs font-bold text-primary mb-1">
                          {product.category}
                        </p>
                        <h4 className="text-sm font-semibold flex-grow mb-2">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <p className="font-bold text-primary">
                            ₹{product.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-blue-400 fill-current" />
                            <span className="text-xs text-muted-foreground font-medium">
                              {product.rating}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2 text-xs"
                            onClick={() => handleBuyNow(product)}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">
                      No products available for this salon at the moment.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section id="team">
              <h2 className="text-4xl font-bold mb-2">Meet Our Team</h2>
              <p className="text-muted-foreground mb-6">
                Our talented and experienced professionals.
              </p>
              <StaffDisplay
                staffData={staffData?.staff || []}
                isLoading={isLoadingStaff}
              />
            </section>

            <section id="reviews">
              <h2 className="text-4xl font-bold mb-2">Reviews</h2>
              <p className="text-muted-foreground mb-6">
                What our clients are saying about us.
              </p>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">
                      {salon.rating || 0}
                    </div>
                    <div>
                      <StarRating rating={salon.rating || 0} />
                      <p className="text-sm text-muted-foreground">
                        Based on {salon.reviewCount || 0} reviews
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {vendorData?.reviews?.length > 0 ? (
                    vendorData.reviews.map((review: any, index: number) => (
                      <div key={index} className="border-t pt-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-primary">
                              {review.author?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {review.author || "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {review.date
                                  ? new Date(review.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "Date not available"}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating || 0} />
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          "{review.text || "No review text available"}"
                        </p>
                      </div>
                    ))
                  ) : (
                    // Show placeholder when no reviews available
                    <div className="text-center py-12">
                      <div className="bg-secondary/20 rounded-lg p-8">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No reviews yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Be the first to leave a review!
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    {vendorData?.reviews?.length > 0
                      ? "Read All Reviews"
                      : "Write a Review"}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </div>

          {/* Right Sticky Column */}
          <div className="lg:sticky top-28 self-start space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>
                  Choose your service and book online.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-4xl font-bold mb-2">{salon.name}</h3>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{salon.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({salon.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {vendorData?.services?.length || 15}+ Services
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {vendorData?.yearsExperience || 5}+ Years
                    </Badge>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-sm"
                  onClick={() => handleBookNow()}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>
                  View our working hours and plan your visit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkingHoursDisplay
                  workingHoursData={workingHoursData?.data}
                  isLoading={isLoadingWorkingHours}
                  error={workingHoursError}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>
                  Choose your service and book online.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Link
                    href={`mailto:${salon.email}`}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" /> {salon.email || "N/A"}
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`tel:${salon.phone}`}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" /> {salon.phone || "N/A"}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    className="flex items-center gap-2"
                    href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4" /> <span>{salon.address}</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    className="flex items-center gap-2"
                    href={salon.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  <Globe className="h-4 w-4" /> {salon.website || "N/A"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative aspect-video bg-black">
            <Image
              src={mainImage}
              alt="Gallery View"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex justify-center gap-2 p-4 bg-secondary">
            {salon.images.map((img: string, index: number) => (
              <button key={index} onClick={() => setMainImage(img)}>
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className={`rounded-md object-cover cursor-pointer border-2 transition-all ${mainImage === img ? "border-primary" : "border-transparent hover:border-primary/50"}`}
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
    <Footer />
    </>
  );
}