"use client";

import Image from "next/image";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { useRouter } from "next/navigation";

const IntroductionSection = () => {
  const { isCrmAuthenticated } = useCrmAuth();
  const router = useRouter();

  const handleAccessDashboard = () => {
    if (isCrmAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/register");
    }
  };

  const handleJoinAsVendor = () => {
    router.push("/auth/register");
  };
  return (
    <section className="relative w-full py-6 md:py-10 px-6 lg:px-16 bg-[#F1F3F2] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left Content */}
          <div className="relative z-10">
            {/* Tagline Badge - Styled */}
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-[#DEE5FF36] border border-black/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#1C1C1C]"></span>
              <p className="text-[#433D48] text-xs font-semibold tracking-wider uppercase">
                Welcome to GlowVita CRM
              </p>
            </div>

            {/* Main Headline - Sized Down & Corrected Accent */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4 leading-[1.2]">
              Grow Your Salon<br />
              <span className="text-[#302131]">Business</span> Success
            </h1>

            {/* Descriptive Content */}
            <div className="space-y-4 max-w-xl mb-6">
              <p className="text-[17px] text-[#1C1C1C] leading-relaxed">
                GlowVita CRM is your comprehensive business management platform for running
                your salon operations. Manage appointments, track customer relationships,
                handle payments, and grow your business—all in one powerful solution.
              </p>
              <p className="text-[15px] text-[#433D48]/70 leading-relaxed font-light">
                From appointment scheduling to customer analytics, managing your salon business has never
                been more efficient.
              </p>
            </div>

            {/* Action Buttons - Pill Shaped */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={handleAccessDashboard}
                className="bg-[#302131] text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center min-w-[180px] text-sm md:text-base"
              >
                Access Dashboard
              </button>
              <button
                onClick={handleJoinAsVendor}
                className="bg-white border border-[#1C1C1C]/10 text-[#1C1C1C] px-8 py-3.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:bg-white/95 flex items-center justify-center min-w-[180px] text-sm md:text-base"
              >
                Join as Vendor
              </button>
            </div>

            {/* Bottom Stats Section */}
            <div className="flex items-center gap-12 md:gap-16 pt-4 border-t border-black/5">
              <div>
                <h4 className="text-4xl font-bold text-[#1C1C1C] tracking-tight">500k+</h4>
                <p className="text-[11px] text-[#433D48]/60 mt-1.5 uppercase tracking-widest font-bold">Salons Managed</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-[#1C1C1C] tracking-tight">99.9%</h4>
                <p className="text-[11px] text-[#433D48]/60 mt-1.5 uppercase tracking-widest font-bold">Platform Uptime</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-[#1C1C1C] tracking-tight">500+</h4>
                <p className="text-[11px] text-[#433D48]/60 mt-1.5 uppercase tracking-widest font-bold">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Section */}
          <div className="relative lg:ml-auto mt-12 lg:mt-0">
            <div className="relative w-full aspect-[1/1.1] md:aspect-square lg:w-[480px] lg:h-[480px]">

              {/* Outer Decorative Shape (Optional, matches screenshot's subtle depth) */}
              <div className="absolute inset-x-0 bottom-0 top-12 bg-black/5 rounded-[0px_80px_0px_80px] -z-10 translate-x-6"></div>

              {/* Main Image with large custom corners */}
              <div className="relative w-full h-full overflow-hidden rounded-[0px_80px_0px_80px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)]">
                <Image
                  src="/icons/Rectangle 4678.png"
                  alt="GlowVita Salon Professional"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Cards - Refined sizing and spacing */}
              <div className="absolute top-[20%] right-[-8%] md:right-[-12%] bg-white p-2.5 pr-5 rounded-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] flex items-center gap-3 z-20 min-w-[170px]">
                <div className="w-9 h-9 bg-[#F1F3F2] rounded-lg flex items-center justify-center p-2">
                  <Image
                    src="/icons/customer-service (4) 2.png"
                    alt="Success rate"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1C1C1C] leading-none">98%</p>
                  <p className="text-[11px] text-[#433D48]/60 font-medium mt-1">Client Satisfaction</p>
                </div>
              </div>

              <div className="absolute top-[36%] right-[-12%] md:right-[-16%] bg-white p-2.5 pr-5 rounded-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] flex items-center gap-3 z-20 min-w-[170px]">
                <div className="w-9 h-9 bg-[#F1F3F2] rounded-lg flex items-center justify-center p-2">
                  <Image
                    src="/icons/customer-service (5) 2.png"
                    alt="Support"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1C1C1C] leading-none">24/7</p>
                  <p className="text-[11px] text-[#433D48]/60 font-medium mt-1">Support Available</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
