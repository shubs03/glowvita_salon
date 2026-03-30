import { cn } from "@repo/ui/cn";

const FeatureComparisonSection = () => {
  const features = [
    "Manage Calendar & Staff",
    "Process Payments & Invoicing",
    "Client Profiles & History",
    "Inventory Management",
    "Business Analytics & Reports",
    "Marketing & Promotions",
  ];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-[1537px] mx-auto px-6 lg:px-24">
        
        {/* Top Header with Lines */}
        <div className="flex items-center justify-center gap-6 mb-14">
          <div className="h-[1px] bg-gray-200 w-1/4 max-w-[300px]"></div>
          <span className="text-gray-400 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase whitespace-nowrap font-manrope">
            VENDOR APP FEATURES
          </span>
          <div className="h-[1px] bg-gray-200 w-1/4 max-w-[300px]"></div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-32 xl:gap-40">
          
          {/* Left Side: Heading and description */}
          <div className="w-full max-w-[465px] flex flex-col pt-2 h-[186px] justify-start">
            <h2 
              className="font-manrope text-gray-900 tracking-normal"
              style={{ 
                fontSize: '51px', 
                fontWeight: 400, 
                lineHeight: '91px',
                fontStyle: 'normal'
              }}
            >
              Powerful Built-in <br />
              <span className="text-indigo-950/90">Features</span>
            </h2>
            <p 
              className="text-gray-500 max-w-[360px] mt-4"
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '100%',
                fontStyle: 'normal'
              }}
            >
              Everything your vendor business needs — beautifully unified in one app.
            </p>
          </div>

          {/* Right Side: Feature List */}
          <div className="flex flex-col gap-6 lg:pt-4 w-full max-w-[246px]">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 group"
                style={{ height: '27px' }}
              >
                <span className="text-indigo-900/40 text-[14px] font-bold font-manrope w-6 text-right">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                <span 
                  className="text-gray-700 group-hover:text-indigo-900 transition-colors"
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: '100%',
                    fontStyle: 'normal',
                    textAlign: 'justify'
                  }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeatureComparisonSection;