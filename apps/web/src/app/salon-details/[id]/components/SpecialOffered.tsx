"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGetPublicVendorOffersQuery } from "@repo/store/services/api";
import { Gift } from "lucide-react";

interface SpecialOfferedProps {
  vendorId: string;
  isSubscriptionExpired?: boolean;
}

const SpecialOffered = ({ vendorId, isSubscriptionExpired = false }: SpecialOfferedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic offers for the specific vendor
  const {
    data: offersData,
    isLoading: isLoadingOffers,
    error: offersError,
  } = useGetPublicVendorOffersQuery(vendorId, {
    skip: !vendorId,
  });

  // Filter active offers and map to the format expected by the component
  const offers =
    offersData?.data
      ?.filter((offer: any) => offer.status === "Active")
      .map((offer: any) => ({
        title: offer.code || "Special Offer",
        originalPrice:
          offer.type === "percentage"
            ? String(Math.round(offer.value / (1 - offer.value / 100)))
            : String(offer.value * 2), // Calculate original price based on percentage discount
        discountedPrice:
          offer.type === "percentage"
            ? String(Math.round(offer.value * (1 - offer.value / 100)))
            : String(offer.value), // Calculate discounted price
        discount:
          offer.type === "percentage" ? `${offer.value}%` : `₹${offer.value}`,
        description:
          offer.type === "percentage"
            ? `${offer.value}% discount on selected services`
            : `₹${offer.value} off on selected services`,
        validity: offer.expires
          ? `Valid until: ${new Date(offer.expires).toLocaleDateString()}`
          : "No expiration date",
        image:
          offer.offerImage ||
          "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600", // Use offer image if available
      })) || [];

  // If no offers are available, use the original hardcoded offers as fallback
  const offersToUse =
    offers.length > 0
      ? offers
      : [
        {
          title: "Layer Cut",
          originalPrice: "500",
          discountedPrice: "250",
          discount: "50%",
          description:
            "Transform your style with our premium haircut service. Expert stylists, quality service, unbeatable price!",
          validity: "*Valid until December 31, 2025",
          image:
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600",
        },
        {
          title: "Hair Spa Treatment",
          originalPrice: "1200",
          discountedPrice: "800",
          discount: "33%",
          description:
            "Rejuvenate your hair with our luxurious spa treatment. Deep conditioning, nourishment, and shine restoration!",
          validity: "*Valid until January 15, 2026",
          image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
        },
        {
          title: "Facial & Cleanup",
          originalPrice: "800",
          discountedPrice: "600",
          discount: "25%",
          description:
            "Experience glowing skin with our professional facial service. Deep cleansing, exfoliation, and hydration!",
          validity: "*Valid until December 25, 2025",
          image:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600",
        },
        {
          title: "Manicure & Pedicure",
          originalPrice: "600",
          discountedPrice: "450",
          discount: "25%",
          description:
            "Pamper your hands and feet with our complete nail care service. Professional grooming and relaxation!",
          validity: "*Valid until January 31, 2026",
          image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
        },
      ];

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && offersToUse.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % offersToUse.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [offersToUse.length, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
    const offset = e.clientX - startX;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const threshold = 50; // Minimum distance to trigger slide

      if (dragOffset > threshold) {
        // Swipe right - previous slide
        setCurrentIndex(
          (prev) => (prev - 1 + offersToUse.length) % offersToUse.length
        );
      } else if (dragOffset < -threshold) {
        // Swipe left - next slide
        setCurrentIndex((prev) => (prev + 1) % offersToUse.length);
      }

      setIsDragging(false);
      setDragOffset(0); // Reset drag offset after releasing
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
    const offset = e.touches[0].clientX - startX;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      const threshold = 50; // Minimum distance to trigger slide

      if (dragOffset > threshold) {
        // Swipe right - previous slide
        setCurrentIndex(
          (prev) => (prev - 1 + offersToUse.length) % offersToUse.length
        );
      } else if (dragOffset < -threshold) {
        // Swipe left - next slide
        setCurrentIndex((prev) => (prev + 1) % offersToUse.length);
      }

      setIsDragging(false);
      setDragOffset(0); // Reset drag offset after releasing
    }
  };

  // Add event listeners for mouse and touch events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove as any);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, startX, currentX, dragOffset]);

  const currentOffer = offersToUse[currentIndex];

  // Show loading state if offers are loading
  if (isLoadingOffers) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            Offers Available
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Check out our special offers and treatments available now, Don't
            miss out on our limited-time offers and treatments!
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-lg animate-pulse">
          <div className="w-48 h-60 rounded-lg bg-muted" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (offersError) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
            Offers Available
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Error loading offers
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Offers Available
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Check out our special offers and treatments available now!
        </p>
      </div>

      {/* Single Offer Card with Smooth Transition */}
      <div
        ref={cardRef}
        className="relative"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-2xl overflow-hidden">
              <img
                src={currentOffer.image}
                alt={currentOffer.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Description Card with discount badge */}
          <div className="flex-1 w-full bg-card border rounded-2xl p-4 relative">
            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-1">
              {currentOffer.title}
            </h3>
            {/* Discount Badge - Circle at top right corner of card */}
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {currentOffer.discount}
            </div>

            {/* Mock Description */}
            <p className="text-muted-foreground text-sm mb-2">
              Enjoy premium services with exclusive discounts. Limited time
              offer for our valued customers.
            </p>

            {/* Pricing */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground line-through text-xs">
                ₹{currentOffer.originalPrice}
              </span>
              <span className="font-bold text-base">
                ₹{currentOffer.discountedPrice}
              </span>
            </div>

            {/* Validity and Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {currentOffer.validity}
                </p>
                {isSubscriptionExpired && (
                  <p className="text-[10px] text-red-600 font-medium">
                    This service is temporarily closed
                  </p>
                )}
              </div>
              <button
                className={`bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs transition-opacity ${isSubscriptionExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                disabled={isSubscriptionExpired}
              >
                {isSubscriptionExpired ? 'Unavailable' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {offersToUse.map((_offer: { image: string }, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? "w-6 bg-primary"
                : "w-2 bg-muted hover:bg-primary/50"
                }`}
              aria-label={`Go to offer ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffered;
