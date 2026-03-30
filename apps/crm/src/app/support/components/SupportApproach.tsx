'use client'

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SupportApproach = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      title: 'How do I schedule appointments for my clients?',
      description: 'To schedule appointments, go to the Calendar section from your dashboard. You can book appointments by selecting a date and time slot, choosing the service and staff member, and adding client details. You can also allow clients to book online through the customer portal.',
    },
    {
      title: 'Can I view and manage my client profiles?',
      description: 'Yes, navigate to the Clients section to view all your customer profiles. You can see their appointment history, contact information, preferences, and purchase history. You can also add notes and special requirements for personalized service.',
    },
    {
      title: 'How do I manage my staff schedules?',
      description: 'Go to the Staff Management section to view and manage your team\'s schedules. You can set working hours, assign services to staff members, manage time-offs, and see who is available for upcoming appointments.',
    },
    {
      title: 'How can I track my business performance?',
      description: 'Access the Analytics Dashboard to view detailed reports on revenue, appointments, popular services, client retention, and staff performance. You can filter data by date range and export reports for further analysis.',
    },
    {
      title: 'How do I manage my service catalog?',
      description: 'Navigate to the Services section to add, edit, or remove services from your catalog. You can set prices, durations, staff assignments, and service categories to organize your offerings effectively.',
    },
    {
      title: 'How do I handle customer inquiries about products?',
      description: 'Go to the Product Questions section to manage customer inquiries about your products. You can view unanswered questions, provide detailed answers, and choose whether to publish the Q&A on the product page for other customers.',
    },
  ];

  return (
    <section id="faq-section" className="py-20 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-12 pl-1">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3 mb-2">
          Frequently Asked Questions
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-muted-foreground mt-1 text-[14px] max-w-2xl">
          Find answers to common questions about using GlowVita CRM for your salon business.
        </p>
      </div>

      {/* Minimalist Accordion Layout */}
      <div className="max-w-4xl">
        <div className="border-t border-border/60">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            const number = (index + 1).toString().padStart(2, '0');

            return (
              <div
                key={index}
                className="border-b border-border/60 transition-all duration-300"
              >
                <button
                  className="w-full py-8 text-left flex items-center justify-between group"
                  onClick={() => setActiveIndex(isActive ? null : index)}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-base font-medium text-foreground/40 tabular-nums">
                      {number}.
                    </span>
                    <h3 className={`text-lg font-medium tracking-tight text-foreground/90 transition-colors duration-300 ${isActive ? 'text-primary' : 'group-hover:text-foreground'
                      }`}>
                      {faq.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-500 ease-in-out ${isActive ? 'rotate-180 text-primary' : 'text-foreground/40'
                      }`}
                    strokeWidth={1.5}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-96 pb-8' : 'max-h-0'
                    }`}
                >
                  <div className="pl-14 pr-8">
                    <p className="text-muted-foreground text-base leading-relaxed font-light">
                      {faq.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SupportApproach;