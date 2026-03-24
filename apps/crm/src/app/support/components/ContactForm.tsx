"use client"

import React, { useState } from 'react';
import { toast } from 'sonner';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'firstName' || name === 'lastName') {
      // Only allow alphabets and spaces
      if (value !== '' && !/^[a-zA-Z\s]*$/.test(value)) {
        return;
      }
    }

    if (name === 'phone') {
      // Only allow digits and max 10 characters
      if (value !== '' && !/^\d*$/.test(value)) {
        return;
      }
      if (value.length > 10) {
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation: must contain @ and .
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address (e.g., example@domain.com)');
      return;
    }

    // Phone validation: exactly 10 digits if provided
    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        message: `Subject: ${formData.subject}\n\n${formData.message}`,
        source: "crm"
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Thank you for reaching out!  Your message has been received, and our dedicated support team will get back to you shortly.', {
        duration: 5000,
      });

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Oops! We encountered a small issue sending your message. Please try again.', {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8 pl-1">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] relative inline-block pb-3 mb-2">
          Contact Support
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mt-1">
          Fill out the form below and our team will get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-6 bg-card border border-[#00000036] rounded-xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  pattern="[A-Za-z\s]*"
                  title="Only alphabets are allowed"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#A86B99] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  pattern="[A-Za-z\s]*"
                  title="Only alphabets are allowed"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#A86B99] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#A86B99] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  pattern="\d{10}"
                  title="Phone number must be exactly 10 digits"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#A86B99] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-1.5">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#A86B99] focus:border-transparent transition-all duration-300"
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#A86B99] focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Please describe your issue or question in detail..."
              ></textarea>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#422A3C] text-white py-3 px-14 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-[#422A3C]/90 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-[#00000036] rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0 mt-0.5">
                <img src="/icons/letter-i (1) 1.png" alt="Info" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-[16px]">Before You Contact Us</h3>
              </div>
            </div>

            <div className="pl-8">
              <p className="text-muted-foreground text-[13px] leading-relaxed mb-4">
                Check out our knowledge base and FAQ section for quick answers to common questions. Many issues can be resolved instantly without waiting for a response.
              </p>

              <div className="space-y-1.5 text-[13px] text-foreground">
                <button type="button" className="block font-medium text-left hover:text-[#0ED3FF] transition-colors">
                  View Frequently Asked Questions
                </button>
                <button type="button" className="block font-medium text-left hover:text-[#0ED3FF] transition-colors">
                  Watch Video Tutorials
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-[#00000036] rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0 mt-0.5">
                <img src="/icons/customer-service (5) 1.png" alt="Emergency Support" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-[16px]">Emergency Support</h3>
              </div>
            </div>

            <div className="pl-8">
              <p className="text-muted-foreground text-[13px] leading-relaxed mb-4">
                For urgent issues that require immediate attention, please contact our emergency support line.
              </p>

              <div className="space-y-1.5 text-[13px] text-foreground">
                <p className="font-medium">
                  Phone : +91 9412355675
                </p>
                <button type="button" className="block font-medium text-left hover:text-[#0ED3FF] transition-colors">
                  Watch Video Tutorials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;