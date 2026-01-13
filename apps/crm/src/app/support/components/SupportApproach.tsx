'use client'

import React, { useState } from 'react';
import { CircleHelp, Info, FileQuestion, ChevronDown } from 'lucide-react';

const SupportApproach = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const faqs = [
    {
      icon: CircleHelp,
      title: 'How do I schedule appointments for my clients?',
      description: 'To schedule appointments, go to the Calendar section from your dashboard. You can book appointments by selecting a date and time slot, choosing the service and staff member, and adding client details. You can also allow clients to book online through the customer portal.',
    },
    {
      icon: Info,
      title: 'Can I view and manage my client profiles?',
      description: 'Yes, navigate to the Clients section to view all your customer profiles. You can see their appointment history, contact information, preferences, and purchase history. You can also add notes and special requirements for personalized service.',
    },
    {
      icon: FileQuestion,
      title: 'How do I manage my staff schedules?',
      description: 'Go to the Staff Management section to view and manage your team\'s schedules. You can set working hours, assign services to staff members, manage time-offs, and see who is available for upcoming appointments.',
    },
    {
      icon: CircleHelp,
      title: 'How can I track my business performance?',
      description: 'Access the Analytics Dashboard to view detailed reports on revenue, appointments, popular services, client retention, and staff performance. You can filter data by date range and export reports for further analysis.',
    },
    {
      icon: Info,
      title: 'How do I manage my service catalog?',
      description: 'Navigate to the Services section to add, edit, or remove services from your catalog. You can set prices, durations, staff assignments, and service categories to organize your offerings effectively.',
    },
    {
      icon: FileQuestion,
      title: 'How do I handle customer inquiries about products?',
      description: 'Go to the Product Questions section to manage customer inquiries about your products. You can view unanswered questions, provide detailed answers, and choose whether to publish the Q&A on the product page for other customers.',
    },
  ];

  return (
    <section id="faq-section" className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4 mx-auto">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mt-4 text-base max-w-2xl">
          Find answers to common questions about using GlowVita CRM for your salon business.
        </p>
      </div>

      {/* Interactive Accordion Layout */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {faqs.map((faq, index) => {
          const Icon = faq.icon;
          const isActive = activeIndex === index;
          
          return (
            <div 
              key={index} 
              className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                className={`w-full p-4 text-left flex items-center justify-between ${
                  isActive ? 'bg-primary/5' : 'hover:bg-accent/30'
                }`}
                onClick={() => setActiveIndex(isActive ? -1 : index)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  } transition-all duration-300`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-lg ${
                    isActive ? 'text-primary' : 'text-card-foreground'
                  }`}>
                    {faq.title}
                  </h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'rotate-180 text-primary' : 'text-muted-foreground'
                  }`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isActive ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 border-t border-border">
                  <p className="text-muted-foreground text-sm">
                    {faq.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SupportApproach;