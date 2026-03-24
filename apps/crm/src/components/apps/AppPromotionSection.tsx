import { cn } from "@repo/ui/cn";

interface AppPromotionSectionProps {
  title: string;
  description: string;
  images?: { src: string; hint: string }[];
  reverse?: boolean;
}

const AppPromotionSection = ({
  title,
  description,
  images,
  reverse = false,
}: AppPromotionSectionProps) => {
  const points = [
    { number: "01", text: "Easy to use" },
    { number: "02", text: "Real-time updates" },
    { number: "03", text: "Secure payments" },
    { number: "04", text: "24/7 support" }
  ];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-[1537px] mx-auto px-6 lg:px-24">
        
        {/* Top Header with Single Line - Left Aligned */}
        <div className="flex items-center gap-8 mb-12 text-left">
          <span 
            className="text-[#53435c] text-sm md:text-md uppercase tracking-[0.3em] whitespace-nowrap"
            style={{ fontFamily: 'Luxurious Roman, serif' }}
          >
            VENDOR CRM APP
          </span>
          <div className="h-[1px] bg-gray-200 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Information */}
          <div className="flex flex-col">
            <h2 
              className="text-gray-900 mb-6 italic"
              style={{ 
                fontFamily: 'Luxurious Roman, serif',
                fontSize: '51px',
                fontWeight: 400,
                lineHeight: '91px'
              }}
            >
              For Your Business
            </h2>
            
            <p 
              className="text-gray-500 mb-12 max-w-[500px]"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '100%'
              }}
            >
              Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time.
            </p>

            {/* Feature Points with Dividers */}
            <div className="flex flex-col mb-16 max-w-[450px]">
              {points.map((point, index) => (
                <div key={index}>
                  <div className="py-5 flex items-center gap-4 group">
                    <span 
                      className="text-gray-300 text-lg font-medium w-8"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {point.number}.
                    </span>
                    <span 
                      className="text-gray-800 flex-grow transition-colors group-hover:text-indigo-900"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '18px',
                        fontWeight: 400,
                        lineHeight: '100%',
                        textAlign: 'justify'
                      }}
                    >
                      {point.text}
                    </span>
                  </div>
                  {index < points.length - 1 && <div className="h-[1px] bg-gray-200 w-full" />}
                </div>
              ))}
              <div className="h-[1px] bg-gray-200 w-full" />
            </div>

            {/* Bottom Stats and Google Play - All in one row */}
            <div className="flex flex-wrap items-center gap-12">
              <div className="flex items-start gap-10">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 font-manrope">4.9/5</span>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-manrope">Rating</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 font-manrope">20k+</span>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-manrope">Downloads</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 font-manrope">24/7</span>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-manrope">Support</span>
                </div>
              </div>

              <div className="flex">
                <a href="#" className="hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Get it on Google Play"
                    className="h-[52px]"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Large App Image */}
          <div className="relative flex justify-center lg:justify-end items-center">
            {/* Soft Blue Glow Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-3xl -z-10" />
            
            <div className="relative max-w-[500px] w-full transform lg:translate-x-10">
              <img 
                src="/icons/AppImage.png" 
                alt="Vendor App Mockup" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AppPromotionSection;