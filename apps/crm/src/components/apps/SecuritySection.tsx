import React from 'react';
import { ShieldCheck, CreditCard, RefreshCw, UserCog } from "lucide-react";
import { cn } from "@repo/ui/cn";

const SecuritySection = () => {
  const securityFeatures = [
    {
      number: "01",
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest using 256-bit SSL technology."
    },
    {
      number: "02",
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
      title: "Secure Payments",
      description: "PCI-compliant payment processing to protect all financial data and transactions."
    },
    {
      number: "03",
      icon: <RefreshCw className="w-5 h-5 text-blue-600" />,
      title: "Regular Backups",
      description: "Your data is backed up automatically every day to prevent any loss or downtime."
    },
    {
      number: "04",
      icon: <UserCog className="w-5 h-5 text-blue-600" />,
      title: "Access Control",
      description: "Granular role-based permissions to control exactly what your staff can see and do."
    }
  ];

  return (
    <section className="py-12 bg-white overflow-hidden">
      {/* Header Section */}
      <div className="px-6 lg:px-24 max-w-[1537px] mx-auto mb-10 text-left">
        <h2 
          className="text-2xl md:text-3xl font-bold text-gray-900 border-b-[2px] border-[#53435c] inline-block pb-1 font-manrope"
          style={{ letterSpacing: '-0.01em' }}
        >
          Security & Reliability
        </h2>
        
        <p className="mt-4 text-gray-400 max-w-2xl text-[16px] font-manrope font-light">
          Enterprise-grade protection for your business and client data.
        </p>
      </div>

      {/* Security Features Box */}
      <div className="px-6 lg:px-24 max-w-[1537px] mx-auto">
        <div className="border border-gray-100 rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index} 
              className={cn(
                "relative flex-1 p-10 flex flex-col items-start gap-4",
                index !== securityFeatures.length - 1 ? "md:border-r border-gray-100" : ""
              )}
            >
              {/* Top Purple Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#53435c] opacity-90 mx-6 rounded-b-md" />

              {/* Numbering - Large and subtle */}
              <span 
                className="text-[48px] font-serif italic text-indigo-100 leading-none select-none"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {feature.number}
              </span>

              {/* Icon Container */}
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                {feature.icon}
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-[18px] font-manrope">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-[14px] leading-relaxed font-manrope">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;