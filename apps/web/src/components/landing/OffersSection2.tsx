import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useGetPublicAllOffersQuery } from '@repo/store/services/api';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useSalonFilter } from './SalonFilterContext';

interface SimplifiedOffer {
  code: string;
  vendorId: string;
  discount: string;
  image: string;
  validTill: string;
  salonName: string;
  isVendorOffer: boolean;
}

const OffersSection2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Get region from Search Bar (SalonFilterContext)
  const { selectedRegionId, userLat, userLng, locationLabel } = useSalonFilter();

  // 2. Get region from User Profile (Redux)
  const user = useSelector((state: any) => state.userAuth?.user);
  const profileRegionId = user?.regionId || null;

  // Final region preference: Search > Profile > null (Global)
  const activeRegionId = selectedRegionId || profileRegionId;

  // Fetch all offers using RTK query, passing the resolved regionId
  const { data: offersData, isLoading, error } = useGetPublicAllOffersQuery(
    activeRegionId ? { regionId: activeRegionId } : {}
  );

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
  const offers: SimplifiedOffer[] = offersData?.data && !isLoading && !error
    ? offersData.data
      .filter((offer: any) => offer.status === 'Active') // Only show active offers
      .map((offer: any) => ({
        code: offer.code,
        vendorId: offer.businessId?._id || offer.businessId || offer.vendorId, // Extract ID if populated
        discount: `${offer.type === 'percentage' ? offer.value + '% OFF' : '₹' + offer.value + ' OFF'}`,
        image: offer.offerImage || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
        validTill: offer.expires
          ? new Date(offer.expires).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : '',
        salonName: offer.isVendorOffer && offer.businessId?.businessName
          ? `by ${offer.businessId.businessName}`
          : 'Valid @ All Salons',
        isVendorOffer: offer.isVendorOffer || false,
      }))
    : [];

  // Log the final offers array to console
  useEffect(() => {
    console.log('Final offers displayed:', offers);
  }, [offers]);

  // Ensure we have enough items for a seamless loop on all screen sizes
  // We want at least 10-15 items in the "unit" that gets duplicated for the marquee
  const displayOffersList = React.useMemo(() => {
    if (offers.length === 0) return [];

    // If we have few offers, repeat them to reach a minimum count
    // This ensures the marquee "unit" is wider than the screen
    const minItems = 12;
    const repeatsNeeded = Math.ceil(minItems / offers.length);
    const unit = [];
    for (let i = 0; i < repeatsNeeded; i++) {
      unit.push(...offers);
    }

    // Duplicate for the seamless -50% loop reset
    return [...unit, ...unit];
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

  // Determine if looping is required (only if more than 4 offers)
  const isLoopingRequired = offers.length > 4;

  // Use the appropriate list and container classes based on looping requirement
  const marqueeItems = isLoopingRequired ? displayOffersList : offers;

  return (
    <section className="py-8 sm:py-10 lg:py-12 overflow-hidden bg-white">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-3 sm:pb-4">
            Special Offers
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl">
            Take advantage of our exclusive salon offers and discounts to pamper yourself without breaking the bank.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Left Fade - Only show if looping */}
          {isLoopingRequired && (
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          )}

          {/* Content Area */}
          {isLoading ? (
            <div className="flex gap-6 sm:gap-8 lg:gap-10 justify-start">
              {Array.from({ length: 4 }).map((_, index) => (
                <OfferSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-left py-8">
              <p className="text-gray-500 text-sm sm:text-base">Unable to load offers at the moment.</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-left py-8">
              <p className="text-gray-500 text-sm sm:text-base">No active offers available right now.</p>
            </div>
          ) : (
            <div className="flex overflow-hidden w-full">
              <div className={`flex ${isLoopingRequired ? 'animate-marquee hover:[animation-play-state:paused] w-max' : 'w-full justify-start'} whitespace-nowrap py-4 pr-4 sm:pr-6`}>
                  {marqueeItems.map((offer, index) => {
                    const params = new URLSearchParams();
                    params.append("offerCode", offer.code);
                    if (userLat) params.append("lat", userLat.toString());
                    if (userLng) params.append("lng", userLng.toString());
                    if (locationLabel) params.append("locationLabel", locationLabel);
                    if (selectedRegionId) params.append("regionId", selectedRegionId);
                    
                    const salonsUrl = `/salons?${params.toString()}`;

                    return (
                      <Link
                        key={index}
                        href={offer.isVendorOffer 
                          ? `/book/${offer.vendorId}?offerCode=${offer.code}`
                          : salonsUrl
                        }
                    className="relative flex-shrink-0 inline-block pr-6 sm:pr-8 lg:pr-10"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Valid Till Badge - Top Right */}
                    {offer.validTill && (
                      <div className="absolute top-0 right-4 bg-white text-primary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-lg z-20 border-2 border-primary">
                        {offer.validTill}
                      </div>
                    )}

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

                      {/* Info Overlay (Discount + Salon Name) */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-2 text-center pointer-events-none">
                        {/* Discount Text */}
                        <div className={`transition-all duration-300 ${hoveredIndex === index ? 'opacity-0 scale-90 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
                          <span className="font-bold text-base sm:text-xl lg:text-2xl drop-shadow-lg block">
                            {offer.discount}
                          </span>
                          <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter opacity-90 font-medium block mt-1">
                            {offer.salonName}
                          </span>
                        </div>
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Fade - Only show if looping */}
          {isLoopingRequired && (
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OffersSection2;