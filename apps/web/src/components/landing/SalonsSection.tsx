"use client";

import React from "react";
import {
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Zap,
  LucideProps,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@repo/ui/cn";
import { useGetPublicVendorsQuery, useGetPublicCategoriesQuery, useGetPublicServicesQuery } from "@repo/store/services/api";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { useSalonFilter } from "./SalonFilterContext";
import { SalonCard } from "./SalonCard";

// Types for vendor data
interface VendorData {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  description?: string;
  category: "unisex" | "men" | "women";
  subCategories: string[];
  profileImage?: string;
  gallery?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  vendorType?: string;
  services?: Array<{
    _id: string;
    name: string;
    category: {
      _id: string;
      name: string;
    } | null;
    price: number;
    duration: number;
    description: string;
  }>;
}

interface TransformedSalon {
  id: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  title: string;
  location: string;
  rating: string | number;
  clients: string;
  specialty: string;
  description: string;
  growth: string;
  image: string;
}

const keyFeatures = [
  {
    id: "1",
    icon: Sparkles,
    title: "Luxe Hair Studio",
    location: "Manhattan, NY",
    rating: 4.9,
    clients: "500+",
    specialty: "Premium Hair Styling",
    description:
      "Upscale salon specializing in color correction and luxury treatments",
    growth: "+42% revenue",
    image: "/images/salon-placeholder.png",
  },
  {
    id: "2",
    icon: Heart,
    title: "Bellezza Spa",
    location: "Beverly Hills, CA",
    rating: 4.8,
    clients: "750+",
    specialty: "Luxury Facials & Body Treatments",
    description:
      "Award-winning spa offering premium skincare and wellness services",
    growth: "+38% bookings",
    image: "/images/salon-placeholder.png",
  },
  {
    id: "3",
    icon: Zap,
    title: "Urban Barber Co.",
    location: "Brooklyn, NY",
    rating: 4.9,
    clients: "900+",
    specialty: "Modern Men's Grooming",
    description:
      "Trendsetting barbershop with master stylists and premium products",
    growth: "+55% client retention",
    image: "/images/salon-placeholder.png",
  },
  {
    id: "4",
    icon: Star,
    title: "Glamour Nails",
    location: "Miami, FL",
    rating: 4.7,
    clients: "400+",
    specialty: "Artistic Nail Design",
    description:
      "Trendy nail salon featuring custom designs and gel treatments",
    growth: "+35% revenue",
    image: "/images/salon-placeholder.png",
  },
  {
    id: "5",
    icon: Calendar,
    title: "Serenity Wellness Center",
    location: "Portland, OR",
    rating: 4.7,
    clients: "600+",
    specialty: "Massage & Wellness",
    description:
      "Holistic wellness center offering massage, yoga, and beauty services",
    growth: "+50% class bookings",
    image: "/images/salon-placeholder.png",
  },
  {
    id: "6",
    icon: TrendingUp,
    title: "Radiant Skin Clinic",
    location: "Seattle, WA",
    rating: 4.9,
    clients: "350+",
    specialty: "Medical Aesthetics",
    description:
      "Advanced skincare clinic with dermatologist-approved treatments",
    growth: "+45% new clients",
    image: "/images/salon-placeholder.png",
  },
];

export function SalonsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Use shared filter context for filtering salons based on PlatformFor selections
  const {
    selectedCategories,
    selectedServices,
    removeCategory,
    removeService,
    clearFilters
  } = useSalonFilter();

  // Fetch vendors and categories/services for filter display
  const { data: VendorsData, isLoading, error } = useGetPublicVendorsQuery({
    categoryIds: selectedCategories.join(','),
    serviceIds: selectedServices.join(',')
  });
  const { data: CategoriesData } = useGetPublicCategoriesQuery(undefined);
  const { data: ServicesData } = useGetPublicServicesQuery({});

  // Transform vendor data to match the card structure, with fallbacks
  const transformedSalons: TransformedSalon[] = React.useMemo(() => {
    // Check for the correct API response structure
    let vendorsArray = VendorsData?.vendors;

    // Filtering is now handled by the API itself!
    // No fallback to mock data anymore - show empty state instead
    if (!vendorsArray || !Array.isArray(vendorsArray) || vendorsArray.length === 0) {
      return []; // Return empty array instead of mock data
    }

    console.log("Using dynamic vendor data:", vendorsArray.length, "vendors");
    return vendorsArray.map((vendor: VendorData, index: number) => {
      // Map vendor category to appropriate icon
      const getIconForCategory = (category: string, subCategories: string[]) => {
        if (subCategories?.includes('at-home')) return Calendar;
        if (category === 'unisex') return Users;
        if (category === 'women') return Heart;
        if (category === 'men') return Star;
        return Sparkles;
      };

      // Generate specialty text based on category and subcategories
      const getSpecialty = (category: string, subCategories: string[]) => {
        const categoryText = category === 'unisex' ? 'Full-Service Salon' :
          category === 'women' ? 'Women\'s Beauty Salon' :
            category === 'men' ? 'Men\'s Grooming' : 'Beauty Services';
        const serviceType = subCategories?.includes('at-home') ? ' & Home Service' : '';
        return categoryText + serviceType;
      };

      // Generate location string
      const location = `${vendor.city || 'Unknown City'}, ${vendor.state || 'Unknown State'}`;

      // Generate placeholder image URL based on business name
      const imageUrl = vendor.profileImage || "/images/salon-placeholder.png";

      return {
        id: vendor._id,
        icon: getIconForCategory(vendor.category, vendor.subCategories),
        title: vendor.businessName || 'Beauty Salon',
        location: location,
        rating: (4.7 + Math.random() * 0.3).toFixed(1), // Generate realistic ratings between 4.7-5.0
        clients: `${Math.floor(200 + Math.random() * 600)}+`, // Generate client count
        specialty: getSpecialty(vendor.category, vendor.subCategories),
        description: vendor.description || 'Professional beauty services with experienced staff and premium treatments',
        growth: `+${Math.floor(25 + Math.random() * 40)}% ${Math.random() > 0.5 ? 'bookings' : 'revenue'}`, // Generate growth metrics
        image: imageUrl,
      };
    }).slice(0, 6); // Limit to 6 cards to match original design
  }, [VendorsData, selectedCategories, selectedServices]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("salons-section");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Render the salon cards
  const renderSalonCards = () => {
    // Check if we have vendors data and if filtering resulted in no matches
    const vendorsArray = VendorsData?.vendors;
    const hasFilters = selectedCategories.length > 0 || selectedServices.length > 0;
    const noMatchingVendors = hasFilters && transformedSalons && transformedSalons.length === 0 &&
      vendorsArray && Array.isArray(vendorsArray) && vendorsArray.length > 0;

    if (isLoading) {
      // Loading skeleton cards
      return Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="w-full h-[420px] rounded-md bg-background/30 border border-border/50 overflow-hidden animate-pulse"
        >
          <div className="h-52 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
            <div className="h-5 bg-gray-200 rounded mb-1 w-32"></div>
            <div className="h-3 bg-gray-200 rounded mb-2 w-24"></div>
            <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ));
    }

    // Show error state if there's an error
    if (error) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block p-4 bg-destructive/10 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Unable to Load Salons</h3>
          <p className="text-muted-foreground mb-4">There was an error loading salon data. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      );
    }

    // Show message when no vendors match the filters
    if (noMatchingVendors) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Filter className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Matching Salons Found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results.</p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      );
    }

    // Show message when no vendors are available at all
    if (transformedSalons.length === 0 && !hasFilters) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Salons Available</h3>
          <p className="text-muted-foreground">We don't have any salons to display right now. Please check back later.</p>
        </div>
      );
    }

    return transformedSalons.map((salon: TransformedSalon, index: number) => {
      return (
        <SalonCard
          key={`salon-${index}`}
          id={salon.id}
          title={salon.title}
          location={salon.location}
          rating={salon.rating}
          clients={salon.clients}
          specialty={salon.specialty}
          description={salon.description}
          growth={salon.growth}
          image={salon.image}
        />
      );
    });
  };

  return (
    <section
      id="salons-section"
      className="py-20 md:py-28 bg-gradient-to-br from-background via-primary/3 to-secondary/5 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,hsl(var(--primary))_0%,transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Key Features Section */}
        <div
          className={`transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div
            className={cn(
              "text-center mb-16 transition-all duration-1000",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            )}
          >
            <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
              Success Stories from Our Partners
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how leading beauty businesses have transformed their
              operations and achieved remarkable growth with GlowVita&apos;s
              comprehensive platform
            </p>

            {/* Selected Filters Display - Moved here as requested */}
            {(selectedCategories.length > 0 || selectedServices.length > 0) && (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {selectedCategories.map((categoryId) => {
                  // Find category name from categories data
                  const category = CategoriesData?.categories?.find((cat: { _id: string; name: string; }) => cat._id === categoryId);

                  return (
                    <div
                      key={`cat-${categoryId}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-sm rounded-md"
                    >
                      <span>{category?.name || categoryId}</span>
                      <button
                        onClick={() => removeCategory(categoryId)}
                        className="ml-1 hover:bg-primary/20 rounded-md w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {selectedServices.map((serviceId) => {
                  // Find service name from services data
                  const service = ServicesData?.services?.find((svc: { _id: string; name: string; }) => svc._id === serviceId);

                  return (
                    <div
                      key={`svc-${serviceId}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary-foreground border border-secondary/20 text-sm rounded-md"
                    >
                      <span>{service?.name || serviceId}</span>
                      <button
                        onClick={() => removeService(serviceId)}
                        className="ml-1 hover:bg-secondary/20 rounded-md w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-sm rounded-md hover:bg-primary/20 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {renderSalonCards()}
          </div>
        </div>

        {/* Platform Benefits */}
        <div className="mt-20 max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background/30 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
              </div>
              <p className="text-muted-foreground">
                Instant booking with real-time availability and seamless payment processing
              </p>
            </div>

            <div className="bg-background/30 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                </div>
                <h3 className="text-xl font-semibold">Verified Quality</h3>
              </div>
              <p className="text-muted-foreground">
                All partners undergo rigorous vetting to ensure exceptional service standards
              </p>
            </div>

            <div className="bg-background/30 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Trusted Community</h3>
              </div>
              <p className="text-muted-foreground">
                Join thousands of satisfied customers who trust our platform for their beauty needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}