import React from 'react';

const ExperienceSection = () => {
  return (
    <section className="w-full py-20 px-6 lg:px-8 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-6">
          Thoughtfully Crafted Experience
        </h2>
        
        <p className="text-base md:text-lg text-muted-foreground/90 leading-loose max-w-2xl mx-auto">
          GlowVita delivers a smooth, reliable experience thoughtfully designed for both customers and salon owners. 
          Every interaction is crafted to feel effortless and intuitive, connecting you with exceptional beauty 
          experiences while empowering salon professionals to thrive in the digital age.
        </p>
      </div>
    </section>
  );
};

export default ExperienceSection;