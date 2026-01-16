import React from 'react';
import { Star, MapPin, Zap, MessageSquare, ClipboardList } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Star,
      title: 'Trusted & Verified Salons',
      description: 'Customers get access to high-quality, reliable salons they can book with confidence.',
    },
    {
      icon: MapPin,
      title: 'Find Salons Near You',
      description: 'Discover nearby salons instantly with location-based search.',
    },
    {
      icon: Zap,
      title: 'Fast & Easy Booking',
      description: 'A smooth experience that helps users find and book services in just a few taps.',
    },
    {
      icon: MessageSquare,
      title: 'Real Reviews & Ratings',
      description: 'Users can make informed choices based on genuine feedback from other customers.',
    },
    {
      icon: ClipboardList,
      title: 'Detailed Service Information',
      description: 'Everything you need to know, clearly explained.',
    }
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
            Why Customers Choose GlowVita ?
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Discover what makes GlowVita the preferred choice for beauty and wellness enthusiasts.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First Row - 3 Cards */}
        {features.slice(0, 3).map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                {feature.description}
              </p>
            </div>
          );
        })}

        {/* Second Row - 2 Cards Centered */}
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 lg:px-32">
          {features.slice(3, 5).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index + 3}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;