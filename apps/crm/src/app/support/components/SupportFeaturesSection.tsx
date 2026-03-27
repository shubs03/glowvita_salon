import React from "react";
import { PlayCircle, Phone, ArrowRight } from "lucide-react";

const SupportFeaturesSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8 pl-1">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3 mb-2">
          Support Resources
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-muted-foreground text-[14px] max-w-2xl mt-1">
          Comprehensive tools to help you succeed
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 w-full">
        <div className="bg-white border border-[#00000036] rounded-3xl rounded-tl-none rounded-br-none p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start gap-5">
          <div className="bg-[#EEF2FC] text-primary p-4 rounded-[14px] w-16 h-16 flex items-center justify-center flex-shrink-0 transition-transform duration-300">
            <img src="/icons/communication (2) (1).png" alt="Email Support" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-[#1C1C1C] text-[18px] mb-2">Email Support</h3>
            <p className="text-[#6B6B6B] text-[14px] mb-6 leading-relaxed">
              Reach out to our support team via email and get detailed solutions to your queries within a short time.
            </p>
            <a href="mailto:glowvitasalon@gmail.com" className="bg-[#F0F7FF] border border-[#00000036] rounded-2xl px-6 py-2.5 text-[#1C1C1C] hover:bg-[#E5EEFA] font-medium inline-flex items-center gap-3 transition-colors text-[14px]">
              Email
              <img src="/icons/right 1.png" alt="Right" className="w-3.5 h-3.5 object-contain" />
            </a>
          </div>
        </div>

        <div className="bg-white border border-[#00000036] rounded-3xl rounded-tl-none rounded-br-none p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start gap-5">
          <div className="bg-[#EEF2FC] text-primary p-4 rounded-[14px] w-16 h-16 flex items-center justify-center flex-shrink-0 transition-transform duration-300">
            <img src="/icons/phone (3) 1.png" alt="Phone Support" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-[#1C1C1C] text-[18px] mb-2">Phone Support</h3>
            <p className="text-[#6B6B6B] text-[14px] mb-6 leading-relaxed">
              Connect with our support team via phone for immediate assistance with any questions or issues.
            </p>
            <a href="/support/phone" className="bg-[#F0F7FF] border border-[#00000036] rounded-2xl px-6 py-2.5 text-[#1C1C1C] hover:bg-[#E5EEFA] font-medium inline-flex items-center gap-3 transition-colors text-[14px]">
              Call Now
              <img src="/icons/right 1.png" alt="Right" className="w-3.5 h-3.5 object-contain" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportFeaturesSection;