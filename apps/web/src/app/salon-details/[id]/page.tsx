"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  StarHalf,
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
  Loader2,
  Pin,
  LocateIcon,
  Mail,
  Wallet,
  AlertCircle,
  ChevronDown,
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
  useGetSalonReviewsQuery,
  useAddToClientCartMutation,
  useGetPublicVendorByIdQuery,
  useGetSalonWishlistQuery,
  useAddToSalonWishlistMutation,
  useRemoveFromSalonWishlistMutation,
  SALON_FAVORITES_VERSION,
} from "@repo/store/services/api";
import { useAppDispatch } from "@repo/store/hooks";
import { addToCart, setCurrentUser } from "@repo/store/slices/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import { useCartSync } from "@/hooks/useCartSync";
import { toast } from "sonner";
import ServicesSection from "./components/ServicesSection";
import ProductsSection from "./components/ProductsSection";
import ReviewsSection from "./components/ReviewsSection";
import Link from "next/link";
import { ReviewForm } from '@/components/ReviewForm';
import ServicesOffered from "@/components/salon/ServicesOffered";
import DownloadApp from "@/components/landing/DownloadApp";
import SpecialOffered from "./components/SpecialOffered";

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
      <div className="flex overflow-x-auto gap-6 pb-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 min-w-[140px]">
            <StaffSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!staffData || staffData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-secondary/20 rounded-lg p-8">
          <Users className="h-12 w-12 mx-auto text-black mb-4" />
          <p className="text-black">
            Team information will be displayed here
          </p>
          <p className="text-sm text-black mt-2">
            Meet our talented professionals when available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x">
      {staffData.map((member: any, index: number) => (
        <div key={member.id || index} className="text-center group flex-shrink-0 min-w-[140px] snap-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden shadow-md mb-3 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20 border-2 border-gray-100">
            <Image
              src={
                member.image ||
                `https://placehold.co/128x128/png?text=${(member.name || "Staff").charAt(0)}`
              }
              alt={member.name || "Staff Member"}
              fill
              className="object-cover"
              data-ai-hint={`${member.name || "staff member"} portrait`}
            />
          </div>
          <h4 className="font-bold text-sm md:text-base mb-0.5 text-black">
            {member.name || "Staff Member"}
          </h4>
          <p className="text-xs md:text-sm text-black font-medium capitalize">
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
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        if (rating >= star) {
          return <Star key={star} className="h-3 w-3 text-yellow-400 fill-yellow-400" />;
        } else if (rating >= star - 0.5) {
          return <StarHalf key={star} className="h-3 w-3 text-yellow-400 fill-yellow-400" />;
        } else {
          return <Star key={star} className="h-3 w-3 text-gray-300 fill-gray-300" />;
        }
      })}
    </div>
  );
};

// Default working hours to show when no data is available
const DEFAULT_WORKING_HOURS = [
  { day: "Monday", open: "09:00", close: "20:00", isOpen: true },
  { day: "Tuesday", open: "09:00", close: "20:00", isOpen: true },
  { day: "Wednesday", open: "09:00", close: "20:00", isOpen: true },
  { day: "Thursday", open: "09:00", close: "20:00", isOpen: true },
  { day: "Friday", open: "09:00", close: "20:00", isOpen: true },
  { day: "Saturday", open: "09:00", close: "20:00", isOpen: true },
  { day: "Sunday", open: "09:00", close: "20:00", isOpen: true },
];

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

  // Check if we have working hours data - use workingHoursArray as the primary source (consistent with CRM)
  const workingHours = useMemo(() => {
    const rawData = workingHoursData?.workingHoursArray || workingHoursData?.workingHours;

    // 1. If no data at all, return defaults
    if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
      return DEFAULT_WORKING_HOURS;
    }

    // 2. If it's an array, check if it's "effectively empty" (all days closed or no times)
    if (Array.isArray(rawData)) {
      const anyOpen = rawData.some(d => d.isOpen === true || d.hours || d.open);
      if (!anyOpen) {
        return DEFAULT_WORKING_HOURS;
      }
      return rawData;
    }

    // 3. Handle object format
    if (rawData && typeof rawData === "object") {
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const result = days.map((day) => {
        if (rawData[day]) {
          return {
            day: day.charAt(0).toUpperCase() + day.slice(1),
            ...rawData[day],
          };
        }
        return {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          open: "09:00",
          close: "20:00",
          isOpen: true,
        };
      });

      // Check if the resulting object-based array is also "effectively empty"
      const anyOpen = result.some(d => d.isOpen === true || d.hours || d.open);
      if (!anyOpen) {
        return DEFAULT_WORKING_HOURS;
      }

      return result;
    }

    return DEFAULT_WORKING_HOURS;
  }, [workingHoursData]);

  // Helper function to format time display
  const formatTimeDisplay = (dayData: any) => {
    // 1. If isOpen is explicitly false, it's Closed
    if (dayData.hasOwnProperty("isOpen") && dayData.isOpen === false) {
      return "Closed";
    }

    // 2. Handle direct open/close properties
    if (dayData.open && dayData.close) {
      return `${dayData.open} - ${dayData.close}`;
    }

    // 3. Handle hours array (CRM format)
    if (Array.isArray(dayData.hours) && dayData.hours.length > 0) {
      const h = dayData.hours[0];
      const openTime = h.openTime || h.open;
      const closeTime = h.closeTime || h.close;
      if (openTime && closeTime) {
        return `${openTime} - ${closeTime}`;
      }
    }

    // 4. Handle legacy hours string
    if (typeof dayData.hours === "string" && dayData.hours) {
      return dayData.hours;
    }

    // 5. Default to Open if not explicitly closed
    return dayData.open && dayData.close ? `${dayData.open} - ${dayData.close}` : "09:00 - 20:00";
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
                  ? "text-black"
                  : "text-primary"
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
  images: [
    "/images/1 (6).png",
    "/images/2 (6).png",
    "/images/3 (3).png",
    "/images/4 (2).png",
    "/images/5 (2).png",
  ],
};



// Function to get the salon data dynamically
export default function SalonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [visibleTab, setVisibleTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isWorkingHoursExpanded, setIsWorkingHoursExpanded] = useState(false);

  const teamSectionRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarOffset, setSidebarOffset] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        if (!teamSectionRef.current || !sidebarRef.current) return;

        if (window.innerWidth < 1024) {
          setSidebarOffset(0);
          return;
        }

        const teamRect = teamSectionRef.current.getBoundingClientRect();
        const sidebarRect = sidebarRef.current.getBoundingClientRect();

        const overlap = sidebarRect.bottom - (teamRect.top - 24);

        if (overlap > 0) {
          setSidebarOffset(overlap);
        } else {
          setSidebarOffset(0);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [now, setNow] = useState(() => new Date());

  const {
    data: vendorsResponse,
    isLoading,
    error,
  } = useGetPublicVendorByIdQuery(id, {
    skip: !id,
    pollingInterval: 60 * 1000, // Auto-refresh from DB every 60s (picks up subscription transitions)
  });

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useGetPublicVendorServicesQuery(id);

  const vendorData = useMemo(() => {
    const vendor = vendorsResponse?.vendor
    return vendor
  }, [vendorsResponse, id]);

  useEffect(() => {
    // Adaptive tick: every 30s normally, every 1s only when a plan is within 5 min of expiring.
    // This prevents unnecessary re-renders when subscription transition is hours away.
    let timer: NodeJS.Timeout;

    const schedule = () => {
      const currentNow = Date.now();
      const sub = (vendorData as any)?.subscription;
      const endTime = sub?.endDate ? new Date(sub.endDate).getTime() : 0;
      const msUntilExpiry = endTime - currentNow;

      // Use 1s precision only when within 5 minutes of a plan expiry
      const interval = (msUntilExpiry > 0 && msUntilExpiry <= 5 * 60 * 1000) ? 1000 : 30_000;

      timer = setTimeout(() => {
        setNow(new Date());
        schedule(); // reschedule adaptively
      }, interval);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [vendorData]);

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

  // Fetch salon reviews
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useGetSalonReviewsQuery(id, {
    skip: !id,
  });

  // Salon Wishlist hooks
  const { data: wishlistData } = useGetSalonWishlistQuery(undefined, {
    skip: !isAuthenticated
  });
  const [addToWishlist] = useAddToSalonWishlistMutation();
  const [removeFromWishlist] = useRemoveFromSalonWishlistMutation();

  const isFavorited = useMemo(() => {
    if (!wishlistData?.data?.items) return false;
    return wishlistData.data.items.some((item: any) => item.salonId === id);
  }, [wishlistData, id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add salons to your favorites", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    try {
      if (isFavorited) {
        await removeFromWishlist(id).unwrap();
        toast.success("Removed from Wishlist");
      } else {
        await addToWishlist(id).unwrap();
        toast.success("Added to Wishlist");
      }
    } catch (err) {
      toast.error("Failed to update Wishlist");
    }
  };

  // Cart mutation for authenticated users
  const [addToCartAPI] = useAddToClientCartMutation();

  // Initialize cart sync
  useCartSync();

  // Get salon reviews and calculate metrics
  const salonReviews = useMemo(() => {
    return reviewsData?.reviews || [];
  }, [reviewsData]);

  const reviewMetrics = useMemo(() => {
    if (salonReviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = salonReviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / salonReviews.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: salonReviews.length
    };
  }, [salonReviews]);

  const salon = useMemo(() => {
    if (vendorData) {
      // Filter out standard grey/placeholder images from gallery
      const actualUploaded = (vendorData.gallery || []).filter(
        (img: string) => img && !img.includes("placehold.co") && !img.includes("placeholder")
      );

      // Add profile image if it is uploaded and not a placeholder
      if (
        vendorData.profileImage &&
        !vendorData.profileImage.includes("placehold.co") &&
        !vendorData.profileImage.includes("placeholder")
      ) {
        if (!actualUploaded.includes(vendorData.profileImage)) {
          actualUploaded.unshift(vendorData.profileImage);
        }
      }

      // Merge with static fallbacks (direct slot mapping)
      const STATIC_IMAGES = [
        "/images/1 (6).png",
        "/images/2 (6).png",
        "/images/3 (3).png",
        "/images/4 (2).png",
        "/images/5 (2).png",
      ];

      const galleryImages = [];
      for (let i = 0; i < 5; i++) {
        if (i < actualUploaded.length) {
          galleryImages.push(actualUploaded[i]);
        } else {
          galleryImages.push(STATIC_IMAGES[i]);
        }
      }

      if (actualUploaded.length > 5) {
        galleryImages.push(...actualUploaded.slice(5));
      }

      const salonData = {
        ...defaultSalon,
        id: vendorData._id || defaultSalon.id,
        name: vendorData.businessName || "No Name Available",
        rating: reviewMetrics.averageRating || vendorData.rating || 0,
        reviewCount: reviewMetrics.totalReviews || vendorData.clientCount || 0,
        address: vendorData.address || `${vendorData.city || ""}, ${vendorData.state || ""}`,
        email: vendorData.email || "",
        website: vendorData.website || "",
        phone: vendorData.phone || "",
        description: vendorData.description || "No description available",
        mission:
          vendorData.description ||
          "To enhance beauty and wellness through personalized care and high-quality services.",
        images: galleryImages,
      };

      return salonData;
    }
    return defaultSalon;
  }, [vendorData, reviewMetrics]);

  // Check if vendor's subscription is expired.
  // Rules:
  //   - Show banner ONLY when there is NO active plan AND NO scheduled future plan
  //   - If the DB status is "scheduled" the vendor has a queued plan → not expired
  //   - Uses multi-entry history scan (same logic as CRM useSubscriptionCheck)
  //   - Re-evaluates every second via `now` state so no manual reload is needed
  const isSubscriptionExpired = useMemo(() => {
    if (!vendorData) return false;

    const subscription = vendorData.subscription;
    // Public API may not include subscription info — assume active if missing
    if (!subscription) return false;

    const nowTime = now.getTime();

    const getEntryTime = (dateStr?: string) => {
      if (!dateStr) return 0;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const getPlanId = (plan: any): string => {
      if (!plan) return '';
      if (typeof plan === 'string') return plan;
      return plan._id || plan.$oid || '';
    };

    // Build unified entry list: history entries + the top-level current subscription slot
    const allEntries: any[] = [
      ...(Array.isArray(subscription.history) ? subscription.history : []),
      {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
      },
    ];

    // Deduplicate by plan+startDate+endDate
    const uniqueEntries = allEntries.filter((entry, index, arr) => {
      const key = `${getPlanId(entry.plan)}-${entry.startDate}-${entry.endDate}`;
      return arr.findIndex(item =>
        `${getPlanId(item.plan)}-${item.startDate}-${item.endDate}` === key
      ) === index;
    });

    uniqueEntries.sort((a, b) => getEntryTime(a.startDate) - getEntryTime(b.startDate));

    let hasActivePlan = false;
    let hasScheduledPlan = false;

    for (const entry of uniqueEntries) {
      const startTime = getEntryTime(entry.startDate);
      const endTime = getEntryTime(entry.endDate);
      const dbStatus = (entry.status || '').toLowerCase().trim();

      if (endTime > nowTime) {
        // Future-end entry: check if active or scheduled
        if (!hasActivePlan && startTime <= nowTime) {
          hasActivePlan = true;
        } else {
          // Starts in the future → scheduled
          hasScheduledPlan = true;
        }
      } else if (dbStatus === 'scheduled') {
        // DB says "Scheduled" even if time math says otherwise
        // (e.g. public API history absent — fall back to DB status)
        hasScheduledPlan = true;
      }
    }

    // Also check top-level DB status as final safety net
    // (handles case where public API omits history array entirely)
    const topStatus = (subscription.status || '').toLowerCase().trim();
    if (topStatus === 'scheduled') hasScheduledPlan = true;
    if (topStatus === 'active' && getEntryTime(subscription.endDate) > nowTime) hasActivePlan = true;

    // Show banner only when nothing is active AND nothing is scheduled
    return !hasActivePlan && !hasScheduledPlan;
  }, [vendorData, now]);

  useEffect(() => {
    if (salon.images.length > 0) {
      setMainImage(salon.images[0]);
    }
  }, [salon.images]);



  const handleBookNow = (service?: any, offerCode?: string) => {
    // Check if subscription is expired
    if (isSubscriptionExpired) {
      toast.error('Booking Unavailable', {
        description: 'This salon is currently not available for bookings. Please check back later.',
      });
      return;
    }

    // Store selected service or wedding package in sessionStorage for the booking flow
    if (service) {
      if (service.isWeddingPackage) {
        // Save wedding package separately so the booking page can init the correct flow
        sessionStorage.setItem("selectedWeddingPackage", JSON.stringify(service));
        sessionStorage.removeItem("selectedService"); // clear any stale service key
      } else {
        sessionStorage.setItem("selectedService", JSON.stringify(service));
        sessionStorage.removeItem("selectedWeddingPackage"); // clear any stale package key
      }
    } else {
      sessionStorage.removeItem("selectedService");
      sessionStorage.removeItem("selectedWeddingPackage");
    }

    // Build booking URL with offer code if provided
    let bookingUrl = `/book/${id}`;
    if (offerCode) {
      bookingUrl += `?offerCode=${offerCode}`;
    }

    router.push(bookingUrl);
  };



  const openGalleryModal = (imageUrl: string) => {
    setMainImage(imageUrl);
    setIsGalleryModalOpen(true);
  };

  const handleBuyNow = (product: any) => {
    // Check if subscription is expired
    if (isSubscriptionExpired) {
      toast.error('Purchase Unavailable', {
        description: 'This salon is currently not available for product purchases. Please check back later.',
      });
      return;
    }

    // Store product details in local storage
    try {
      const effectivePrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
      const productWithVendor = {
        ...product,
        price: effectivePrice,
        originalPrice: product.price,
        hasSale: product.salePrice > 0,
        vendorId: id, // Always use the salon ID from URL params
        vendorName: vendorData?.businessName || "Unknown Vendor",
        quantity: 1, // Add default quantity
      };
      localStorage.setItem("buyNowProduct", JSON.stringify(productWithVendor));
      // Redirect to checkout page
      router.push("/checkout");
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      // Handle potential storage errors (e.g., private browsing)
      alert(
        "Could not process your request. Please ensure you are not in private browsing mode."
      );
    }
  };

  const handleAddToCart = async (product: any) => {
    // Check if subscription is expired
    if (isSubscriptionExpired) {
      toast.error('Cart Unavailable', {
        description: 'This salon is currently not available for product purchases. Please check back later.',
      });
      return;
    }

    try {
      if (isAuthenticated && user?._id) {
        // User is authenticated - use API
        const effectivePrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
        const cartItem = {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          quantity: 1,
          price: effectivePrice,
          originalPrice: product.price, // Optional for API cart metadata
          hasSale: product.salePrice > 0, // Optional for API cart metadata
          vendorId: id,
          supplierName: vendorData?.businessName || "Unknown Vendor",
        };

        await addToCartAPI(cartItem).unwrap();

        // Show success toast
        toast.success(`${product.name} added to cart!`, {
          description: `You can view all items in your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      } else {
        // User is not authenticated - use local storage
        const effectivePrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
        const cartItem = {
          _id: product.id,
          productName: product.name,
          price: effectivePrice,
          originalPrice: product.price,
          hasSale: product.salePrice > 0,
          quantity: 1,
          productImage: product.image,
          vendorId: id,
          supplierName: vendorData?.businessName || "Unknown Vendor",
          // Additional details for better cart management
          category: product.category,
          stock: product.stock,
          hint: product.hint,
        };

        // Dispatch to Redux store (will also save to localStorage)
        dispatch(addToCart(cartItem));

        // Show success toast
        toast.success(`${product.name} added to cart!`, {
          description: `You can view all items in your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
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
            <p className="text-black mb-6">
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
            <p className="text-black mb-6">
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

  return (
    <>
      <MarketingHeader
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        isHomePage={false}
      />

      {/* Breadcrumbs Banner (Sticky Full Width) */}
      <div className="w-full sticky top-16 sm:top-20 z-30 shadow-md" style={{ backgroundColor: "#422A3C" }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <div className="flex items-center text-white min-w-0 flex-1">
            <span className="font-normal text-base sm:text-lg truncate" title={salon.name}>
              {salon.name}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 bg-transparent text-white border-white hover:bg-white hover:text-black transition-colors rounded-lg flex-shrink-0 text-xs h-7 px-2"
            onClick={toggleFavorite}
          >
            <Heart className={cn("h-3 w-3", isFavorited && "fill-red-500 text-red-500")} />
            {isFavorited ? "Wishlisted" : "Wishlist"}
          </Button>
        </div>
      </div>

      <PageContainer padding="none">
        <div className="container mx-auto px-4">
          {/* Subscription Expired Banner */}
          {isSubscriptionExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Salon Currently Unavailable</h3>
                <p className="text-sm text-red-700 mt-1">
                  This salon is not accepting bookings or product orders at the moment. Please check back later.
                </p>
              </div>
            </div>
          )}



          {/* Compact Bento Grid Hero Gallery */}
          <section className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-fr h-[500px] md:h-[480px] lg:h-[560px]">
              {/* Box 1 (Main Square) */}
              <div
                className="col-span-2 md:col-span-2 lg:col-span-2 row-span-2 rounded-md overflow-hidden group cursor-pointer"

                onClick={() => openGalleryModal(salon.images[0] || "/images/1 (6).png")}
              >
                <Image
                  src={salon.images[0] || "/images/1 (6).png"}
                  alt={salon.name}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="luxury salon interior main view"
                />
              </div>
              {/* Box 2 (Top Mid) */}
              <div
                className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer"
                onClick={() => openGalleryModal(salon.images[1] || "/images/2 (6).png")}
              >
                <Image
                  src={salon.images[1] || "/images/2 (6).png"}
                  alt={`${salon.name} view 2`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="salon detail photo"
                />
              </div>
              {/* Box 3 (Top Right) */}
              <div
                className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative"
                onClick={() => openGalleryModal(salon.images[2] || "/images/3 (3).png")}
              >
                <Image
                  src={salon.images[2] || "/images/3 (3).png"}
                  alt={`${salon.name} view 3`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="salon treatment room"
                />
              </div>
              {/* Box 4 (Bottom Mid) */}
              <div
                className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer"
                onClick={() => openGalleryModal(salon.images[3] || "/images/4 (2).png")}
              >
                <Image
                  src={salon.images[3] || "/images/4 (2).png"}
                  alt={`${salon.name} view 4`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="salon product display"
                />
              </div>
              {/* Box 5 (Bottom Right) */}
              <div
                className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative"
                onClick={() => openGalleryModal(salon.images[4] || "/images/5 (2).png")}
              >
                <Image
                  src={salon.images[4] || "/images/5 (2).png"}
                  alt={`${salon.name} view 5`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="salon reception area"
                />
                <div className="absolute bottom-3 right-3">
                  <div className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2">
                    See all Images
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-12 lg:items-start py-8 relative">
            {/* Left Scrolling Column */}
            <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1 space-y-8">
              <SpecialOffered
                vendorId={id}
                isSubscriptionExpired={isSubscriptionExpired}
                onBookNow={(offer) => handleBookNow(null, offer.code)}
              />

              <ServicesSection
                vendorId={id}
                onBookNow={handleBookNow}
                isSubscriptionExpired={isSubscriptionExpired}
              />

              <ProductsSection
                vendorId={id}
                vendorData={vendorData}
                productsData={productsData}
                isLoading={productsLoading}
                error={productsError}
                isSubscriptionExpired={isSubscriptionExpired}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
              />

              {/* About Section - moved after Products */}
              <section id="about">
                <h2
                  className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
                  style={{ color: "#252B42" }}
                >
                  About {salon.name}
                  <span
                    className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
                    }}
                  />
                </h2>
                <p className="text-sm md:text-base text-black mb-2">
                  Discover the story and values behind our brand.
                </p>

                <div className="space-y-4">
                  <p className="text-xl text-black leading-relaxed">
                    {salon.mission || salon.description || "This salon is providing you all kind of service's this is unisex salon"}
                  </p>
                  {/* Stats section - always show structure with values or defaults */}
                  <div className="flex justify-start">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl w-full">
                      <div className="py-3 px-4 rounded-2xl border border-gray-300 flex items-center gap-3 justify-start">
                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <img
                            src="/images/Group 1000002792 (1).png"
                            alt="Happy Clients"
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-3xl font-bold text-primary">
                            {isLoading ? (
                              <Skeleton className="h-8 w-14" />
                            ) : (
                              vendorData?.dynamicClientCount ||
                              vendorData?.stats?.find(
                                (s: any) => s.label === "Happy Clients"
                              )?.value ||
                              vendorData?.clientCount ||
                              salon.reviewCount ||
                              0
                            )}
                          </p>
                          <p className="text-base font-medium text-black mt-1">
                            Happy Clients
                          </p>
                        </div>
                      </div>
                      <div className="py-3 px-4 rounded-2xl border border-gray-300 flex items-center gap-3 justify-start">
                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <img
                            src="/images/Group 1000002854.png"
                            alt="Services"
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-3xl font-bold text-primary">
                            {isLoading ? (
                              <Skeleton className="h-8 w-14" />
                            ) : (
                              vendorData?.stats?.find(
                                (s: any) => s.label === "Services"
                              )?.value ||
                              servicesData?.services?.length ||
                              0
                            )}
                          </p>
                          <p className="text-base font-medium text-black mt-1">
                            Services
                          </p>
                        </div>
                      </div>
                      <div className="py-3 px-4 rounded-2xl border border-gray-300 flex items-center gap-3 justify-start">
                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                          <img
                            src="/images/Group 1000002797 (3).png"
                            alt="Products"
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-3xl font-bold text-primary">
                            {isLoading ? (
                              <Skeleton className="h-8 w-14" />
                            ) : (
                              vendorData?.stats?.find(
                                (s: any) => s.label === "Products Sold"
                              )?.value ||
                              productsData?.products?.length ||
                              0
                            )}
                          </p>
                          <p className="text-base font-medium text-black mt-1">
                            Products
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>


            </div>

            {/* Right Sticky Column */}
            <div ref={sidebarRef} className="lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-2 lg:sticky top-28 self-start space-y-2 pt-10 z-0">
              <div
                className="w-full shadow-lg rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col"
                style={{ clipPath: sidebarOffset > 0 ? `inset(0 0 ${sidebarOffset}px 0)` : 'none' }}
              >
                {/* Gradient Header */}
                <div
                  className="pt-4 px-4 pb-4 text-white flex flex-col relative flex-shrink-0"
                  style={{ background: 'linear-gradient(179.56deg, #422A3C 0.38%, #A86B99 131.62%)' }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="text-lg font-bold border-b border-white pb-0.5 inline-block">
                      Book an Appointment
                    </div>
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {vendorData?.profileImage && !vendorData.profileImage.includes('placehold') ? (
                          <Image
                            src={vendorData.profileImage}
                            alt="Logo"
                            width={40}
                            height={40}
                            className="object-cover h-full w-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/salon-placeholder.png'; }}
                          />
                        ) : (
                          <Image
                            src="/images/salon-placeholder.png"
                            alt={salon.name || 'Salon'}
                            width={40}
                            height={40}
                            className="object-cover h-full w-full"
                          />
                        )}
                      </div>
                      <h3 className="font-bold text-xl truncate flex-1 text-left">{salon.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0 ml-[50px]">
                      {salon.reviewCount > 0 && (
                        <>
                          <StarRating rating={salon.rating || 0} />
                          <span className="text-sm font-bold">{salon.rating}</span>
                        </>
                      )}
                      <span className="text-sm opacity-90">({salon.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* White Body */}
                <div className="p-3 space-y-2.5 pb-4">

                  {/* Working Hours Block */}
                  <div
                    className="bg-[#EBF3FD] rounded-xl p-3 cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => setIsWorkingHoursExpanded(!isWorkingHoursExpanded)}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <Image src="/images/clock (20).png" alt="Clock" width={16} height={16} />
                        <span className="text-base font-semibold text-green-700">
                          {(() => {
                            const getTodayClosing = () => {
                              try {
                                const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                                const rawData = workingHoursData?.data?.workingHoursArray || workingHoursData?.data?.workingHours || workingHoursData?.data;
                                if (!rawData) return "until 5:00 pm";
                                let todayData;
                                if (Array.isArray(rawData)) {
                                  todayData = rawData.find((d: any) => d.day?.toLowerCase() === currentDayName.toLowerCase());
                                } else if (typeof rawData === 'object') {
                                  todayData = rawData[currentDayName.toLowerCase()];
                                }
                                if (!todayData || todayData.isOpen === false) return "Closed";

                                let closeTime = todayData.close;
                                if (Array.isArray(todayData.hours) && todayData.hours.length > 0) {
                                  closeTime = todayData.hours[0].closeTime || todayData.hours[0].close;
                                } else if (typeof todayData.hours === "string") {
                                  const parts = todayData.hours.split("-");
                                  if (parts.length === 2) closeTime = parts[1].trim();
                                }
                                if (!closeTime) return "until 5:00 pm";

                                const [h, m] = closeTime.split(":");
                                let hours = parseInt(h, 10);
                                if (isNaN(hours)) return "until " + closeTime;
                                const ampm = hours >= 12 ? 'pm' : 'am';
                                hours = hours % 12 || 12;
                                return `until ${hours}:${m} ${ampm}`;
                              } catch (e) {
                                return "until 5:00 pm";
                              }
                            };
                            const todayClosing = getTodayClosing();
                            if (todayClosing === "Closed") {
                              return <span className="text-red-600">Closed Today</span>;
                            }
                            return <>Open <span className="text-black font-normal">{todayClosing}</span></>;
                          })()}
                        </span>
                      </div>
                      <Image
                        src="/images/down-arrow 1.png"
                        alt="Arrow Down"
                        width={12}
                        height={12}
                        className={`transition-transform duration-200 ${isWorkingHoursExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {!isWorkingHoursExpanded && (
                      <div className="text-sm text-black pl-7 mt-0.5">
                        Book your slot today!
                      </div>
                    )}
                    {isWorkingHoursExpanded && (
                      <div className="mt-2 pt-2 border-t border-blue-100/50">
                        <WorkingHoursDisplay
                          workingHoursData={workingHoursData?.data}
                          isLoading={isLoadingWorkingHours}
                          error={workingHoursError}
                        />
                      </div>
                    )}
                  </div>

                  {/* Contact Info Block */}
                  <div className="bg-[#EBF3FD] rounded-xl p-3 space-y-2.5">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <Image src="/images/placeholder (12).png" alt="Location" width={20} height={20} className="mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-base text-black leading-relaxed">
                          {salon.address}
                        </p>
                        <Link
                          href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`}
                          target="_blank"
                          className="text-sm text-blue-600 flex items-center gap-1 mt-1 hover:underline font-medium"
                        >
                          Get Directions <Image src="/images/right-arrow 1.png" alt="Arrow Right" width={10} height={10} />
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-0">
                      <Image src="/images/phone (7).png" alt="Phone" width={20} height={20} className="flex-shrink-0" />
                      <span className="text-base text-black">{salon.phone || "+91 9363653563"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Image src="/images/gmail 1.png" alt="Email" width={20} height={20} className="flex-shrink-0" />
                      <span className="text-base text-black truncate">{salon.email || "nidhisalon@gmail.com"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Image src="/images/global (2).png" alt="Website" width={20} height={20} className="flex-shrink-0" />
                      <span className="text-base text-black truncate">{salon.website || "www.glowvitasalon.com"}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="flex justify-center px-1">
                    <button
                      onClick={() => handleBookNow()}
                      disabled={isSubscriptionExpired}
                      className="w-[85%] text-white text-sm font-semibold py-2.5 rounded-xl mt-1 transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#422A3C' }}
                    >
                      {isSubscriptionExpired ? 'Salon Unavailable' : 'Book Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Sections (Overlapping right column on scroll) */}
            <div className="lg:col-start-1 lg:col-span-3 lg:row-start-2 space-y-8 pt-0 pb-12 relative">
              <section id="team" ref={teamSectionRef}>
                <h2
                  className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
                  style={{ color: "#252B42" }}
                >
                  Our Skilled Specialists
                  <span
                    className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
                    }}
                  />
                </h2>
                <p className="text-sm md:text-base text-black mb-6">
                  Experienced artists providing personalized care for every client.
                </p>
                <StaffDisplay
                  staffData={staffData?.staff || []}
                  isLoading={isLoadingStaff}
                />
              </section>

              <ReviewsSection
                vendorId={id}
                vendorData={vendorData}
                reviewsData={reviewsData}
                isLoading={isLoadingReviews}
                error={reviewsError}
                refetchReviews={refetchReviews}
              />
            </div>
          </div>
        </div>
        <DownloadApp />
      </PageContainer>

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
      <Footer />
    </>
  );
}
