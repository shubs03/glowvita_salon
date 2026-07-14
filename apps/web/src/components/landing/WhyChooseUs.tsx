import React from 'react';

const ICONS = {
  star: "/images/star 7.png",
  pin: "/images/placeholder 7.png",
  bolt: "/images/storm 2.png",
  chat: "/images/speech-bubble 1.png",
  doc: "/images/file 1.png",
  headset: "/images/customer-service (5) 1.png",
  qbubble: "/images/9088d72b-b28a-4c94-989b-1d59377b45f5 1.png",
};

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface CardProps {
  feature: Feature;
  stripeColor: string;
}

const WhyChooseUs = () => {
  const row1Features: Feature[] = [
    {
      icon: ICONS.star,
      title: 'Trusted & Verified Salons',
      description: 'Customers get access to high-quality, reliable salons they can book with confidence.',
    },
    {
      icon: ICONS.pin,
      title: 'Find Salons Near You',
      description: 'Discover nearby salons instantly with location-based search.',
    },
    {
      icon: ICONS.bolt,
      title: 'Fast & Easy Booking',
      description: 'A smooth experience that helps users find and book services in just a few taps.',
    },
  ];

  const row2Features: Feature[] = [
    {
      icon: ICONS.chat,
      title: 'Real Reviews & Ratings',
      description: 'Users can make informed choices based on genuine feedback from other customers.',
    },
    {
      icon: ICONS.doc,
      title: 'Detailed Service Information',
      description: 'Everything you need to know, clearly explained.',
    },
    {
      icon: ICONS.headset,
      title: 'Dedicated Support',
      description: 'Our concierge team is always available to assist with your bookings & Stress free experience.',
    },
  ];

  const Card = ({ feature, stripeColor }: CardProps) => (
    <div
      className="relative flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-5 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {/* colored accent block - full height, but only wide enough to cover about half the icon */}
      <div
        className="absolute left-0 top-0 bottom-0 w-9 rounded-l-2xl"
        style={{ backgroundColor: stripeColor }}
      />
      <img
        src={feature.icon}
        alt={feature.title}
        className="relative w-8 h-8 flex-shrink-0 mt-0.5"
      />
      <div className="relative">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
          {feature.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );

  return (
    <section className="pt-5 pb-0 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src={ICONS.qbubble}
          alt="Question bubbles"
          className="w-12 h-12 flex-shrink-0 object-contain"
        />
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          Why Customers Choose GlowVita ?
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
      </div>

      {/* Row 1 - #FEF0ED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {row1Features.map((feature, index) => (
          <Card key={index} feature={feature} stripeColor="#FEF0ED" />
        ))}
      </div>

      {/* Row 2 - #EBF3FD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {row2Features.map((feature, index) => (
          <Card key={index} feature={feature} stripeColor="#EBF3FD" />
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;