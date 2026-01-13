'use client'

import React, { useState } from 'react';
import { CircleHelp, Info, FileQuestion, ChevronDown } from 'lucide-react';

const SupportApproach = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const faqs = [
    {
      icon: CircleHelp,
      title: 'How do I reset my password?',
      description: 'To reset your password, go to the login page and click on "Forgot Password". Enter your email address and follow the instructions sent to your inbox.',
    },
    {
      icon: Info,
      title: 'Can I customize my dashboard?',
      description: 'Yes, you can customize your dashboard by clicking on the settings icon in the top right corner. From there, you can select which widgets to display and rearrange them according to your preference.',
    },
    {
      icon: FileQuestion,
      title: 'How do I add new staff members?',
      description: 'To add new staff members, navigate to the Staff Management section from your dashboard. Click on "Add New Staff", fill in the required information, and assign appropriate permissions.',
    },
    {
      icon: CircleHelp,
      title: 'What payment methods are supported?',
      description: 'GlowVita CRM supports multiple payment methods including credit cards, debit cards, PayPal, and bank transfers. You can set your preferred payment gateways in the Settings section.',
    },
    {
      icon: Info,
      title: 'How do I backup my data?',
      description: 'Your data is automatically backed up daily. However, you can also manually export your data by going to Settings > Data Export. Select the data types you want to export and choose your preferred format.',
    },
    {
      icon: FileQuestion,
      title: 'Can I integrate with third-party tools?',
      description: 'Yes, GlowVita CRM offers integrations with popular tools like QuickBooks, Google Calendar, and Mailchimp. Visit the Integrations section in your dashboard to explore available options.',
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
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