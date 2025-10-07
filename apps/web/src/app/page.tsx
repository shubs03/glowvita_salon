"use client";

import { cn } from "@repo/ui/cn";
import {
  HeroSection,
  AppCTA,
  HowItWorks,
  PlatformFor,
  Testimonials,
  Offers,
  FAQ,
  AdvantageCard,
  VideoTestimonialSection,
  SecuritySection,
  Integrations,
  Blog,
  Services,
  BentoGrid,
  SalonsSection,
} from "@/components/landing";

import { Award, Users, LineChart, Clock, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useGetAdminProductCategoriesQuery, useGetPublicProductsQuery } from "@repo/store/api";
import { useState, useEffect } from "react";

// Inline ProductCard component
function ProductCard({
  id,
  _id,
  productName,
  name,
  price = 0,
  salePrice,
  productImage,
  image,
  description,
  vendorName,
  businessName,
  category,
  categoryName,
  status,
}: {
  id?: string;
  _id?: string;
  productName?: string;
  name?: string;
  price?: number;
  salePrice?: number;
  productImage?: string;
  image?: string;
  description?: string;
  vendorName?: string;
  businessName?: string;
  category?: string;
  categoryName?: string;
  status?: string;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use the available product name field
  const displayName = productName || name || "Product";
  
  // Use the available image field with fallback to Unsplash
  const displayImage = productImage || image;
  const fallbackImage = "https://images.unsplash.com/photo-1526947425969-2c925c7fcc39?w=320&h=224&fit=crop";
  
  // Use the available vendor name field
  const displayVendor = vendorName || businessName || "Vendor";
  
  // Use the available category name field
  const displayCategory = categoryName || category || "";
  
  // Product ID for navigation
  const productId = _id || id || "unknown";

  // Handle click to navigate to product details
  const handleClick = () => {
    if (productId !== "unknown") {
      window.location.href = `/product-details/${productId}`;
    }
  };

  // Format price display
  const displayPrice = price !== undefined ? price.toFixed(2) : "0.00";
  const displaySalePrice = salePrice !== undefined ? salePrice.toFixed(2) : null;

  // Process image source
  const processImageSrc = (imgSrc: string) => {
    if (!imgSrc) return fallbackImage;
    
    // If it's already a complete URL, return as is
    if (imgSrc.startsWith('http') || imgSrc.startsWith('https')) {
      return imgSrc;
    }
    
    // If it's base64 data, ensure it has the proper data URI prefix
    if (imgSrc.startsWith('data:image')) {
      return imgSrc;
    }
    
    // Handle base64 strings without the data URI prefix
    if (imgSrc.startsWith('/9j/') || imgSrc.startsWith('iVBOR')) {
      return `data:image/jpeg;base64,${imgSrc}`;
    }
    
    // For relative paths or other formats, use fallback
    return fallbackImage;
  };

  // Create a state for the final image source to handle dynamic updates
  const [finalImageSrc, setFinalImageSrc] = useState(
    imageError ? fallbackImage : processImageSrc(displayImage || "")
  );

  // Update image source when displayImage changes
  useEffect(() => {
    if (!imageError) {
      setFinalImageSrc(processImageSrc(displayImage || ""));
    }
  }, [displayImage, imageError]);

  return (
    <div 
      className="group relative overflow-hidden rounded-md hover:shadow-md border bg-card transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={handleClick}
    >
      {/* Upper Half: Image */}
      <div className="aspect-[4/3] relative w-full overflow-hidden">
        <img
          src={finalImageSrc}
          alt={displayName}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            setImageError(true);
            setFinalImageSrc(fallbackImage);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        {status === "approved" && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none text-xs py-0.5 px-2 rounded-full font-bold shadow-lg">
            APPROVED
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 text-blue-500 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={cn("h-4 w-4", isLiked && "fill-current text-blue-500")}
          />
        </Button>
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {displayVendor}
          </p>
          <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
            {displayName}
          </h3>

          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
            {description || displayCategory || "No description available"}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-foreground">
                4.5
              </span>
              <span className="text-xs text-muted-foreground">
                (128)
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              {displaySalePrice && (
                <span className="text-lg font-bold text-primary">
                  ₹{displaySalePrice}
                </span>
              )}
              <span
                className={cn(
                  "font-bold",
                  displaySalePrice
                    ? "text-sm text-muted-foreground line-through"
                    : "text-lg text-foreground"
                )}
              >
                ₹{displayPrice}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
            onClick={(e) => {
              e.stopPropagation();
              alert("Added to cart!");
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  const { data: ProductCategoryData } =
    useGetAdminProductCategoriesQuery(undefined);
  
  // Fetch public products from CRM instead of using mock data
  const { data: products = [], isLoading, isError, error } =
    useGetPublicProductsQuery(undefined);

  console.log("Product Category Data : ", ProductCategoryData);
  console.log("Products Data:", products);
  console.log("Loading:", isLoading);
  console.log("Error:", isError, error);

  // Add effect to log when products change
  useEffect(() => {
    if (products && products.length > 0) {
      console.log("Products loaded:", products.length);
      console.log("First product details:", products[0]);
      // Log the image data specifically to debug image issues
      console.log("First product image data:", products[0].productImage || products[0].image);
    } else if (isError) {
      console.error("Error loading products:", error);
    } else if (isLoading) {
      console.log("Loading products...");
    } else {
      console.log("No products available");
    }
  }, [products, isLoading, isError, error]);

  const scrollAdvantages = (direction: "left" | "right") => {
    const container = document.getElementById("advantages-container");
    if (container) {
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("platform-for");
    if (element) observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <HeroSection />
        <SalonsSection />
        <Offers />
        {/* <BentoGrid/> */}
        <PlatformFor />
        {/* <HowItWorks /> */}
        {/* <FeaturedProducts /> */}
        {/* Replace FeaturedProducts with ProductCard grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div
              className={cn(
                "text-center space-y-6 transition-all duration-1000 lg:py-16 md:py-16 py-8",
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3">
                Our Featured Products
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Discover our premium selection of salon products, carefully curated for professionals and enthusiasts alike.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {isLoading ? (
                <p className="col-span-full text-center py-8">Loading products...</p>
              ) : isError ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-red-500 font-medium">Error loading products. Please try again later.</p>
                  {error && <p className="text-sm text-muted-foreground mt-2">Error details: {JSON.stringify(error)}</p>}
                </div>
              ) : products && products.length > 0 ? (
                products.map((product: any) => (
                  <ProductCard key={product._id || product.id} {...product} />
                ))
              ) : (
                <p className="col-span-full text-center py-8 text-muted-foreground">No products available at the moment.</p>
              )}
            </div>
            {products && products.length > 0 && (
              <div className="text-center mt-8">
                <Button 
                  variant="default" 
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => window.location.href = '/products'}
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </section>
        <Services />

        <section className="py-20 md:py-28 bg-gradient-to-br from-background via-primary/8 to-secondary/8 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>
            <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/15 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-secondary/15 to-transparent rounded-full blur-3xl animate-float-delayed"></div>

            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Unlock Your Salon's Full Potential
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                See the real-world impact of using our comprehensive salon
                management platform. These metrics represent actual improvements
                from our satisfied clients across the globe.
              </p>
            </div>

            <div
              id="advantages-container"
              className="flex gap-6 md:gap-8 pb-8 overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              <AdvantageCard
                stat="40%"
                title="Increase in Bookings"
                description="Clients booking through our platform are more likely to commit and show up for their appointments with automated reminders and seamless experience."
                icon={<Users />}
              />
              <AdvantageCard
                stat="25%"
                title="More Repeat Clients"
                description="Build lasting loyalty with detailed client profiles, service history, and personalized experiences that keep customers coming back."
                icon={<Users />}
              />
              <AdvantageCard
                stat="15%"
                title="Higher Average Spend"
                description="Intelligently upsell services and products by understanding complete client history, preferences, and targeted recommendations."
                icon={<LineChart />}
              />
              <AdvantageCard
                stat="50%"
                title="Less Admin Time"
                description="Automate appointment reminders, payment processing, and administrative tasks so you can focus on your craft and clients."
                icon={<Clock />}
              />
              <AdvantageCard
                stat="50%"
                title="Less Admin Time"
                description="Automate appointment reminders, payment processing, and administrative tasks so you can focus on your craft and clients."
                icon={<Clock />}
              />
            </div>

            <div className="flex justify-start mt-12">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-background hover:bg-primary hover:text-white border-2 hover:border-primary group"
                  onClick={() => scrollAdvantages("left")}
                >
                  <ArrowRight className="h-4 w-4 transform rotate-180 group-hover:scale-110 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-background hover:bg-primary hover:text-white border-2 hover:border-primary group"
                  onClick={() => scrollAdvantages("right")}
                >
                  <ArrowRight className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <VideoTestimonialSection />
        <Testimonials />
        {/* <SecuritySection /> */}
        {/* <Integrations /> */}
        {/* <Blog /> */}
        <FAQ />
        <AppCTA />
      </main>
    </div>
  );
}