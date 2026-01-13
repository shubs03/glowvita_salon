import React from 'react';

const AudienceSection = () => {
  const audiences = [
    'Salon Owners',
    'Spa Managers',
    'Beauty Business Entrepreneurs',
    'Wellness Center Directors',
    'Independent Beauty Professionals',
    'Multi-location Business Owners',
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          For Salon Business Owners
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
          GlowVita CRM is designed for salon business owners who value efficiency, 
          comprehensive management tools, and data-driven growth strategies.
        </p>
      </div>

      {/* Audience Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {audiences.map((audience, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                {audience}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AudienceSection;