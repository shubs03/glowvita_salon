import React from 'react';

const AudienceSection = () => {
  const audiences = [
    'Beauty Enthusiasts',
    'Salon Professionals',
    'Wellness Seekers',
    'Busy Professionals',
    'Style Conscious Individuals',
    'Self-Care Advocates',
  ];

  return (
    <section className="py-8 sm:py-10 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Section Header */}
      <div className="mb-6 md:mb-8">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          Who We Serve
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>

        <p
          className="text-muted-foreground mt-3"
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "160%",
            letterSpacing: "0%",
          }}
        >
          GlowVita is designed for anyone who values quality, convenience, and exceptional beauty experiences, bringing together a diverse community united by self-care.
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
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '17px',
                  lineHeight: '24px',
                  letterSpacing: '0.1px',
                }}
                className="text-card-foreground"
              >
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