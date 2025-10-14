"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@repo/ui/cn";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "consultation" | "payment" | "technical";
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>(["1"]); // First item open by default

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How do online consultations work?",
      answer: "Online consultations are conducted through secure video calls with licensed doctors. You can book an appointment, join the video call at the scheduled time, discuss your health concerns, and receive medical advice, prescriptions, and follow-up care instructions.",
      category: "consultation"
    },
    {
      id: "2", 
      question: "Are the doctors licensed and qualified?",
      answer: "Yes, all our doctors are board-certified, licensed medical professionals. We verify their credentials, education, and experience before allowing them to practice on our platform. Each doctor's profile includes their qualifications and specialties.",
      category: "general"
    },
    {
      id: "3",
      question: "What health conditions can be treated online?",
      answer: "We can treat a wide range of non-emergency conditions including cold and flu, skin conditions, mental health concerns, chronic disease management, prescription refills, and preventive care. Emergency situations require immediate in-person medical attention.",
      category: "consultation"
    },
    {
      id: "4",
      question: "How much does a consultation cost?",
      answer: "Consultation fees vary by doctor and specialty, typically ranging from $50-$200. The exact fee is displayed before booking. We accept insurance from major providers and offer transparent pricing with no hidden fees.",
      category: "payment"
    },
    {
      id: "5",
      question: "Is my personal health information secure?",
      answer: "Absolutely. We use end-to-end encryption and are HIPAA compliant. Your medical information is stored securely and only shared with your consent. Our platform meets the highest standards for medical data protection.",
      category: "technical"
    },
    {
      id: "6",
      question: "Can I get prescriptions through online consultations?",
      answer: "Yes, doctors can prescribe medications during online consultations when medically appropriate. Digital prescriptions are sent directly to your preferred pharmacy. Some controlled substances may require in-person visits as per regulations.",
      category: "consultation"
    },
    {
      id: "7",
      question: "What if I need follow-up care?",
      answer: "Follow-up appointments can be easily scheduled with the same doctor or another specialist. Your medical history and previous consultations are saved in your profile for continuity of care. We also offer care coordination services.",
      category: "consultation"
    },
    {
      id: "8",
      question: "What technical requirements do I need?",
      answer: "You need a device with a camera and microphone (smartphone, tablet, or computer), stable internet connection, and a modern web browser. Our platform is optimized for all devices and includes technical support if you encounter issues.",
      category: "technical"
    },
    {
      id: "9",
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule appointments up to 2 hours before the scheduled time without any fees. Last-minute cancellations may incur a small fee. We also offer flexible scheduling for your convenience.",
      category: "general"
    },
    {
      id: "10",
      question: "Do you accept insurance?",
      answer: "We accept insurance from most major providers including Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealth. Check with your insurance provider for telemedicine coverage. We also offer affordable self-pay options.",
      category: "payment"
    }
  ];

  const categories = [
    { id: "general", label: "General", count: faqs.filter(f => f.category === "general").length },
    { id: "consultation", label: "Consultations", count: faqs.filter(f => f.category === "consultation").length },
    { id: "payment", label: "Payments", count: faqs.filter(f => f.category === "payment").length },
    { id: "technical", label: "Technical", count: faqs.filter(f => f.category === "technical").length }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === "general" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Get answers to common questions about our online consultation platform
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory("general")}
            className={cn(
              "px-6 py-3 rounded-md text-sm font-medium transition-all duration-300",
              selectedCategory === "general"
                ? "bg-primary text-white shadow-lg"
                : "bg-white text-muted-foreground border border-border/50 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            All Questions
          </button>
          {categories.slice(1).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2",
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white text-muted-foreground border border-border/50 hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              {category.label}
              <span className={cn(
                "px-2 py-1 rounded-full text-xs",
                selectedCategory === category.id
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary"
              )}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-md border border-border/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-primary/5 transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-md border border-border/50 shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to help you with any questions or concerns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@glowvita.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors duration-300"
              >
                Email Support
              </a>
              <a
                href="tel:+1-800-GLOWVITA"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary/20 text-primary rounded-md font-medium hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}