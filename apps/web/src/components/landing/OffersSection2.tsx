import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGetPublicAllOffersQuery } from '@repo/store/services/api';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useSalonFilter } from './SalonFilterContext';

interface SimplifiedOffer {
  code: string;
  title: string; // <-- NEW: short description shown on the circle (e.g. "Free Skin Prep with any Makeup Service")
  discount: string;
  image: string;
  validTill: string;
  salonName: string;
  services: string[];
}

const PortalTooltip = ({
  left,
  top,
  services,
}: {
  left: number;
  top: number;
  services: string[];
}) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        // Left edge anchored to circle's left edge; only move up 100%
        transform: 'translateY(-100%)',
        backgroundColor: '#EBF3FD',
        borderColor: '#c8dff7',
        zIndex: 9999,
      }}
      className="border rounded-xl shadow-xl p-3 w-fit pointer-events-none"
    >
      {/* Arrow at fixed offset pointing down on the left side of the tooltip */}
      <div
        className="absolute -bottom-2 left-6 -translate-x-1/2 border-8 border-transparent"
        style={{ borderTopColor: '#EBF3FD' }}
      />
      <div
        className="absolute -bottom-[10px] left-6 -translate-x-1/2 border-[9px] border-transparent -z-10"
        style={{ borderTopColor: '#c8dff7' }}
      />

      {services.length > 0 ? (
        <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1.5">
          {services.map((service, sIdx) => (
            <div key={sIdx} className="flex items-center gap-1.5 text-sm text-black-800 whitespace-nowrap">
              <span className="text-[#422A3C] font-bold leading-none">•</span>
              <span>{service}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">Applicable on all services</p>
      )}
    </div>,
    document.body
  );
};

const OfferCircleItem = ({ offer, salonsUrl }: { offer: SimplifiedOffer; salonsUrl: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState<{ left: number; top: number; } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const validTillRef = useRef<HTMLDivElement>(null);
  const discountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered) {
      const circleEl = elementRef.current;
      const pillEl = validTillRef.current ?? discountRef.current ?? elementRef.current;
      if (circleEl && pillEl) {
        const circleRect = circleEl.getBoundingClientRect();
        const pillRect = pillEl.getBoundingClientRect();
        const scrollX = window.scrollX ?? window.pageXOffset ?? 0;
        const scrollY = window.scrollY ?? window.pageYOffset ?? 0;

        // Tooltip left edge = circle's left edge + small rightward nudge
        const left = circleRect.left + scrollX + 100;
        // Tooltip bottom touches the top of the validity pill
        const top = pillRect.top + scrollY;

        setTooltipCoords({ left, top });
      }
    } else {
      setTooltipCoords(null);
    }
  }, [isHovered]);

  const services = offer.services || [];
  let displayText = offer.title;

  if (services.length > 0) {
    if (services.length <= 2) {
      displayText = services.join(' + ');
    } else {
      displayText = `${services.slice(0, 2).join(' + ')} + ...`;
    }
  }

  return (
    <div
      ref={elementRef}
      className="relative flex flex-col items-center flex-shrink-0 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={salonsUrl}
        className="flex flex-col items-center"
      >
        {/* Circle with image + overlay text */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-lg">
          <img
            src={offer.image}
            alt={offer.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/45"></div>
          <div className="absolute inset-0 flex items-center justify-center px-2.5 text-center">
            <span className="text-white text-[10px] sm:text-[11px] lg:text-xs font-bold leading-tight drop-shadow-md">
              {displayText}
            </span>
          </div>
        </div>

        {/* Discount pill - overlaps circle bottom */}
        <div
          ref={discountRef}
          className="relative z-10 -mt-3 bg-green-600 text-white text-[10px] sm:text-[12px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap"
        >
          {offer.discount}
        </div>

        {/* Valid till pill */}
        {offer.validTill && (
          <div
            ref={validTillRef}
            className="relative z-10 -mt-1 bg-red-900 text-white text-[9px] sm:text-[13px] font-semibold px-3 py-1 rounded-full shadow-md whitespace-nowrap"
          >
            Valid till : {offer.validTill}
          </div>
        )}
      </Link>

      {/* Tooltip Portal: left edge = circle left, arrow points at the pill center */}
      {tooltipCoords && (
        <PortalTooltip
          left={tooltipCoords.left}
          top={tooltipCoords.top}
          services={services}
        />
      )}
    </div>
  );
};

const OffersSection2 = () => {
  const { selectedRegionId, userLat, userLng, locationLabel } = useSalonFilter();
  const user = useSelector((state: any) => state.userAuth?.user);
  const profileRegionId = user?.regionId || null;
  const activeRegionId = selectedRegionId || profileRegionId;

  const { data: offersData, isLoading, error } = useGetPublicAllOffersQuery(
    activeRegionId ? { regionId: activeRegionId } : {}
  );

  useEffect(() => {
    if (offersData) console.log('Fetched offers:', offersData);
    if (error) console.error('Error fetching offers:', error);
  }, [offersData, error]);

  const offers: SimplifiedOffer[] = offersData?.data && !isLoading && !error
    ? offersData.data
      .filter((offer: any) => offer.status === 'Active')
      .map((offer: any) => ({
        code: offer.code,
        // Adjust this to whatever field your API actually returns for the description text
        title: offer.title || offer.description || offer.name || 'Special Offer',
        discount: `${offer.type === 'percentage' ? offer.value + '% OFF' : '₹' + offer.value + ' OFF'}`,
        image: offer.offerImage || '/images/Offer Placeholder.png',
        validTill: offer.expires
          ? new Date(offer.expires).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : '',
        salonName: 'Valid @ All Salons',
        services: offer.applicableSpecialties || [],
      }))
    : [];

  useEffect(() => {
    console.log('Final offers displayed:', offers);
  }, [offers]);

  const displayOffersList = React.useMemo(() => {
    if (offers.length === 0) return [];
    const minItems = 12;
    const repeatsNeeded = Math.ceil(minItems / offers.length);
    const unit = [];
    for (let i = 0; i < repeatsNeeded; i++) unit.push(...offers);
    return [...unit, ...unit];
  }, [offers]);

  const OfferSkeleton = () => (
    <div className="flex flex-col items-center flex-shrink-0 animate-pulse">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200"></div>
      <div className="-mt-3 h-5 w-16 rounded-full bg-gray-300"></div>
      <div className="-mt-1 h-5 w-20 rounded-full bg-gray-300"></div>
    </div>
  );

  const isLoopingRequired = offers.length > 4;
  const marqueeItems = isLoopingRequired ? displayOffersList : offers;

  return (
    <section className="pt-5 pb-0 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          Special Offers
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100% )",
            }}
          />
        </h2>
      </div>

      <div className="relative">
        {isLoopingRequired && (
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        )}

        {isLoading ? (
          <div className="flex gap-6 sm:gap-8 lg:gap-10 justify-start pt-1 pb-3">
            {Array.from({ length: 6 }).map((_, index) => (
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
            <div className={`flex items-start ${isLoopingRequired ? 'animate-marquee hover:[animation-play-state:paused] w-max' : 'w-full justify-start'} pt-1 pb-3 pr-4 sm:pr-6 gap-6 sm:gap-8 lg:gap-10`}>
              {marqueeItems.map((offer, index) => {
                const params = new URLSearchParams();
                params.append("offerCode", offer.code);
                if (userLat) params.append("lat", userLat.toString());
                if (userLng) params.append("lng", userLng.toString());
                if (locationLabel) params.append("locationLabel", locationLabel);
                if (selectedRegionId) params.append("regionId", selectedRegionId);

                const salonsUrl = `/salons?${params.toString()}`;

                return (
                  <OfferCircleItem
                    key={index}
                    offer={offer}
                    salonsUrl={salonsUrl}
                  />
                );
              })}
            </div>
          </div>
        )}

        {isLoopingRequired && (
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        )}
      </div>
    </section>
  );
};

export default OffersSection2;