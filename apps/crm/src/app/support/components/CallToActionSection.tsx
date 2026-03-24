import React from "react";

const CallToActionSection = () => {
  return (
    <section className="container relative w-full py-20 my-6 bg-gradient-to-br from-primary to-primary/80 rounded-3xl rounded-tl-none rounded-br-none overflow-hidden mx-auto">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-6">
          Need Direct Assistance?
        </h2>
        <p className="text-primary-foreground/90 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-8">
          Our dedicated support team is ready to help you resolve any issues and answer your questions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="mailto:glowvitasalon@gmail.com"
            className="bg-white hover:bg-white/90 text-primary px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-3 shadow-sm group"
          >
            <img src="/icons/email (10) 1.png" alt="Email" className="w-6 h-6 object-contain" />
            Email Us
          </a>
          
          <a 
            href="tel:+919075201035"
            className="bg-white hover:bg-white/90 text-primary px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-3 shadow-sm group"
          >
            <img src="/icons/call (1) 1.png" alt="Call" className="w-6 h-6 object-contain" />
            +91 9075201035
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;