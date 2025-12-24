import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const OffersSection2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const offers = [
    {
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      validTill: '21st Dec',
    },
    {
      discount: '50% OFF',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      validTill: 'Weekend',
    },
    {
      discount: '10% OFF',
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
      validTill: '25th Dec',
    },
    {
      discount: '40% OFF',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      validTill: '27th Dec',
    },
    {
      discount: '30% OFF',
      image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400',
      validTill: '30th Dec',
    },
    {
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      validTill: '31st Dec',
    }
  ];

  return (
    <section className="py-20 overflow-hidden bg-white">
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-600 border-b-2 border-gray-900 inline-block pb-4">
          Special Offers
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
            Take advantage of our exclusive salon offers and discounts to pamper yourself without breaking the bank.
        </p>

      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white via-white/70 to-transparent z-10 pointer-events-none"></div>

        {/* Marquee */}
        <div className="flex gap-10 animate-marquee hover:[animation-play-state:paused]">
          {[...offers, ...offers].map((offer, index) => (
            <div
              key={index}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Valid Till Badge - Top Right */}
              <div className="absolute -top-1 -right-1 bg-white text-purple-500 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg z-20 border-2 border-purple-700">
                {offer.validTill}
              </div>

              {/* Circle Container */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-xl cursor-pointer group">
                {/* Background Image */}
                <img
                  src={offer.image}
                  alt={offer.discount}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Purple Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-purple-700/50 group-hover:from-purple-500/70 group-hover:to-purple-700/70 transition-all duration-300"></div>

                {/* Discount Text - Normal State */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-white font-bold text-xl drop-shadow-lg">
                    {offer.discount}
                  </span>
                </div>

                {/* Book Now Icon - Hover State */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="relative group/tooltip">
                    <div className="bg-white rounded-full p-2 shadow-xl hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-4 h-4 text-gray-900" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      Book Now
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-white via-white/70 to-transparent z-10 pointer-events-none"></div>
      </div>
    </section>
  );
};

export default OffersSection2;