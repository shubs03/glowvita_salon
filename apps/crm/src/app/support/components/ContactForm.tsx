"use client"

import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Simulate form submission
    try {
      // In a real application, you would send the form data to your backend here
      console.log('Form data:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSubmitMessage('Your message has been sent successfully! Our support team will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitMessage('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Contact Support
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
          Fill out the form below and our team will get back to you as soon as possible
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="Enter your phone number (optional)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Please describe your issue or question in detail..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {submitMessage && (
              <div className={`p-4 rounded-xl text-center ${submitMessage.includes('error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {submitMessage}
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6 sticky top-6 h-full">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-card-foreground text-xl mb-2">Before You Contact Us</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Check out our knowledge base and FAQ section for quick answers to common questions. 
                  Many issues can be resolved instantly without waiting for a response.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <a href="/support/faq" className="block text-primary hover:underline font-medium">
                View Frequently Asked Questions
              </a>
              <a href="/support/tutorials" className="block text-primary hover:underline font-medium">
                Watch Video Tutorials
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-card-foreground text-xl mb-2">Emergency Support</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  For urgent issues that require immediate attention, please contact our emergency support line.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-muted-foreground">
                <span className="font-medium">Phone:</span> <a href="tel:+18001234567" className="text-primary hover:underline">+1 (800) 123-4567</a>
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Hours:</span> 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;