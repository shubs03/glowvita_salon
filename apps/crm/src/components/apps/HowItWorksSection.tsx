import { cn } from "@repo/ui/cn";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: "/icons/add-user 1.png",
      title: "1. Sign Up & Setup",
      description: "Create your account and set up your salon services, staff, and schedule in minutes.",
    },
    {
      icon: "/icons/appointment (1) 2.png",
      title: "2. Client Bookings",
      description: "Clients book appointments 24/7 through the GlowVita app or your website, with automated reminders.",
    },
    {
      icon: "/icons/Mask group.png",
      title: "3. Manage Operations",
      description: "Track appointments, manage staff schedules and handle payments seamlessly in one place.",
    },
    {
      icon: "/icons/web-design 1.png",
      title: "4. Grow & Analyze",
      description: "Use analytics and marketing tools to grow your business and increase revenue.",
    },
  ];

  return (
    <section className="py-12 overflow-hidden bg-white">
      {/* Header Section */}
      <div className="px-6 lg:px-24 max-w-[1537px] mx-auto mb-16 text-left">
        <h2 
          className="text-2xl md:text-3xl font-bold text-gray-900 border-b-[2px] border-gray-900 inline-block pb-1 font-manrope"
          style={{ letterSpacing: '-0.01em' }}
        >
          How It Works
        </h2>
        
        <p className="mt-4 text-gray-500 max-w-2xl text-[16px] font-manrope font-light">
          Our simple 4-step process to transform your salon business with our CRM platform.
        </p>
      </div>

      {/* Steps Grid - Staggered Layout like the image */}
      <div className="px-6 lg:px-24 max-w-[1537px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 items-start">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={cn(
                "flex flex-col items-center text-center group transition-all duration-700 ease-out",
                // Staggered vertical positioning: 2nd and 4th items are higher
                index % 2 === 1 ? "lg:-mt-20" : "lg:mt-10"
              )}
            >
              {/* Visual Element Container: Circular Frame + Hexagon Icon */}
              <div className="relative w-56 h-56 mb-4 flex items-center justify-center">
                {/* Background Frame: Balloon/Circle shape with vertical line and dot */}
                <img 
                  src="/icons/Group 1000002468.png" 
                  alt="Background frame"
                  className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                />
                
                {/* Hexagon Icon Container: Dark Purple background */}
                <div 
                  className="absolute top-[12%] left-1/2 -translate-x-1/2 flex items-center justify-center w-[78px] h-[88px] bg-[#53435c] shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-[#63536c]"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <img 
                    src={step.icon} 
                    alt={step.title} 
                    className="w-11 h-11 object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" 
                  />
                </div>
              </div>

              {/* Step Content: Title and Description placed below the frame's dot */}
              <div className="max-w-[280px] mt-2">
                <h3 className="font-bold text-gray-900 text-[18px] mb-3 font-manrope tracking-tight">
                  {step.title}
                </h3>
                <p 
                  className="text-gray-500 text-[14px] leading-[1.6] font-manrope font-normal px-2"
                  style={{ textAlign: 'center' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;