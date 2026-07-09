"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGetPublicVendorOffersQuery } from "@repo/store/services/api";
import { Gift } from "lucide-react";

interface SpecialOfferedProps {
  vendorId: string;
  isSubscriptionExpired?: boolean;
  onBookNow?: (offer: any) => void;
}

const SpecialOffered = ({ vendorId, isSubscriptionExpired = false, onBookNow }: SpecialOfferedProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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
      .map((offer: any) => {
        console.log("Processing offer in SpecialOffered:", offer);
        return {
          code: offer.code,
          title: offer.type === "percentage" ? `${offer.value}% Special Discount` : `₹${offer.value} Exclusive Off`,
          originalPrice:
            offer.type === "percentage"
              ? "100"
              : String(offer.value * 2), // Mock 2x for fixed
          discountedPrice:
            offer.type === "percentage"
              ? String(Math.round(100 - (100 * (offer.value / 100))))
              : String(offer.value), // Actual price after fixed discount
          discount:
            offer.type === "percentage" ? `${offer.value}%` : `₹${offer.value}`,
          description:
            offer.type === "percentage"
              ? `Get ${offer.value}% off on select services when you apply this code at checkout.`
              : `Enjoy a flat ₹${offer.value} discount on your next service booking.`,
          validity: offer.expires
            ? `Valid until: ${new Date(offer.expires).toLocaleDateString()}`
            : "",
          image:
            offer.offerImage || offer.image ||
            "/images/Offer Placeholder.png",
          applicableServices: offer.applicableServiceNames || [],
        };
      }) || [];

  // Use fetched offers
  const offersToUse = offers;

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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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

  // Show loading state if offers are loading
  if (isLoadingOffers) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2
            className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
            style={{ color: "#252B42" }}
          >
            Offers Available
            <span
              className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
              }}
            />
          </h2>
          <p className="text-base text-black mb-6">
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

  // Hide if error or no offers
  if (offersError || (!isLoadingOffers && offersToUse.length === 0)) {
    return null;
  }

  const currentOffer = offersToUse[currentIndex];
  if (!currentOffer) return null;

  return (
    <section className="max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
          style={{ color: "#252B42" }}
        >
          Offers Available
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
        <p className="text-sm md:text-base text-black mb-2">
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
          <div className="flex-shrink-0 w-full md:w-44">
            <div className="w-full h-[13rem] rounded-[70px_70px_0_0] overflow-hidden shadow-sm">
              <img
                src={currentOffer.image}
                alt={currentOffer.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Description Card with discount badge */}
          <div className="flex-1 w-full bg-[#EBF3FD] border border-gray-200 rounded-2xl p-2 md:p-2 relative flex flex-col justify-center mt-8 md:mt-0 shadow-sm min-h-[9rem]">

            {/* Discount Badge - Circle at top right corner of card */}
            <div
              className="absolute -top-6 -right-4 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg z-10"
              style={{ backgroundColor: "#025508" }}
            >
              <span className="text-lg font-bold leading-tight">{currentOffer.discount}</span>
              <span className="text-sm font-medium leading-tight">Off</span>
            </div>

            {/* Promo Code Tag */}
            <div className="flex items-center gap-2 mb-2 mt-1">
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                USE CODE :
              </span>
              <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden">
                <span className="text-xs font-bold text-black px-3 py-1">
                  {currentOffer.code}
                </span>
                <button
                  onClick={() => handleCopyCode(currentOffer.code)}
                  className="bg-gray-200 hover:bg-gray-300 transition-colors text-[10px] text-black font-bold px-2 py-1 flex items-center gap-1 border-l border-gray-300"
                >
                  {copiedCode === currentOffer.code ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      COPIED
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      COPY
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-black leading-relaxed mb-2">
              {currentOffer.description
                .split(/(₹\d+[+]?)/g)
                .map((part: string, i: number) =>
                  /₹\d+/.test(part)
                    ? <strong key={i} className="font-bold">{part}</strong>
                    : part
                )}
            </p>

            {/* Applicable Services (Transform text) */}
            {currentOffer.applicableServices && currentOffer.applicableServices.length > 0 && (
              <p className="text-sm md:text-base text-black leading-relaxed mb-1">
                Transform your style with our{" "}
                <strong className="font-bold">{currentOffer.applicableServices.join(", ")}</strong>{" "}
                service. Expert stylists, quality service, unbeatable price!
              </p>
            )}

            {/* Validity and Button */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 mt-0">
              <div className="space-y-1">
                {currentOffer.validity && (
                  <p className="text-xs md:text-sm text-black font-medium">
                    *{currentOffer.validity.replace('Valid until:', 'Valid untill')}
                  </p>
                )}
                {isSubscriptionExpired && (
                  <p className="text-[10px] text-red-600 font-medium">
                    This service is temporarily closed
                  </p>
                )}
              </div>
              <button
                className={`text-white px-5 py-2 rounded-lg text-xs font-semibold transition-opacity ${isSubscriptionExpired ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={{ backgroundColor: "#422A3C" }}
                disabled={isSubscriptionExpired}
                onClick={() => onBookNow?.(currentOffer)}
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
