import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useGetPublicAllOffersQuery } from '@repo/store/services/api';
import Link from 'next/link';

const OffersSection2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch all offers using RTK query (no vendor filter to get all offers)
  const { data: offersData, isLoading, error } = useGetPublicAllOffersQuery(undefined);

  // Log the offers data to console
  useEffect(() => {
    if (offersData) {
      console.log('Fetched offers:', offersData);
    }
    if (error) {
      console.error('Error fetching offers:', error);
    }
  }, [offersData, error]);

  // Use the fetched offers data
  const offers = offersData?.data && !isLoading && !error 
    ? offersData.data
        .filter((offer: any) => offer.status === 'Active') // Only show active offers
        .map((offer: any) => ({
          code: offer.code,
          vendorId: offer.businessId || offer.vendorId, // Use businessId or vendorId
          discount: `${offer.type === 'percentage' ? offer.value + '% OFF' : '₹' + offer.value + ' OFF'}`,
          image: offer.offerImage || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
          validTill: offer.expires 
            ? new Date(offer.expires).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) 
            : 'N/A',
        }))
    : [];

  // Log the final offers array to console
  useEffect(() => {
    console.log('Final offers displayed:', offers);
  }, [offers]);

  // Skeleton Loader Component
  const OfferSkeleton = () => (
    <div className="relative flex-shrink-0 animate-pulse">
      {/* Valid Till Badge Skeleton */}
      <div className="absolute -top-1 -right-1 bg-gray-200 h-6 w-16 rounded-full z-20"></div>
      {/* Circle Skeleton */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200"></div>
    </div>
  );

  return (
    <section className="py-8 sm:py-10 lg:py-12 overflow-hidden bg-white">
      {/* Section Header */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-3 sm:pb-4">
          Special Offers
        </h2>
        
        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
            Take advantage of our exclusive salon offers and discounts to pamper yourself without breaking the bank.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 lg:w-48 bg-gradient-to-r from-white via-white/70 to-transparent z-10 pointer-events-none"></div>

        {/* Marquee */}
        {isLoading ? (
          <div className="flex gap-6 sm:gap-8 lg:gap-10 px-4 sm:px-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <OfferSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500 text-sm sm:text-base">Unable to load offers at the moment.</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500 text-sm sm:text-base">No active offers available right now.</p>
          </div>
        ) : (
          <div className="flex gap-6 sm:gap-8 lg:gap-10 animate-marquee hover:[animation-play-state:paused]">
            {[...offers, ...offers].map((offer, index) => (
              <Link
                key={index}
                href={`/book/${offer.vendorId}?offerCode=${offer.code}`}
                className="relative flex-shrink-0"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Valid Till Badge - Top Right */}
                <div className="absolute -top-1 -right-1 bg-white text-primary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-lg z-20 border-2 border-primary">
                  {offer.validTill}
                </div>

                {/* Circle Container */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shadow-xl cursor-pointer group">
                  {/* Background Image */}
                  <img
                    src={offer.image}
                    alt={offer.discount}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Primary Gradient Overlay */}
                  <div className="absolute inset-0 bg-primary/50 group-hover:bg-primary/70 transition-all duration-300"></div>

                  {/* Discount Text - Normal State */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-white font-bold text-base sm:text-xl lg:text-2xl drop-shadow-lg">
                      {offer.discount}
                    </span>
                  </div>

                  {/* Book Now Icon - Hover State */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="relative group/tooltip">
                      <div className="bg-white rounded-full p-1.5 sm:p-2 shadow-xl hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
                      </div>
                      {/* Tooltip */}
                      <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                        Book Now
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 lg:w-48 bg-gradient-to-l from-white via-white/70 to-transparent z-10 pointer-events-none"></div>
      </div>
    </section>
  );
};

export default OffersSection2;