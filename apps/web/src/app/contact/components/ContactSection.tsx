"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Contact Us
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          We'd love to hear from you. Send us a message and we'll respond as
          soon as possible.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left - Contact Form */}
        <div className="order-2 lg:order-1">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name*"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-primary/30 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name*"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number*"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />

              {/* Message */}
              <textarea
                name="message"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Right - Illustration and Social Media */}
        <div className="order-1 lg:order-2 relative h-full flex flex-col justify-center">
          {/* Illustration Placeholder */}
          <div className="relative flex justify-start items-center mb-8 md:pl-8 h-full">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600"
              alt="Contact Us"
              className="w-full rounded-2xl max-w-md h-full object-cover"
            />
          </div>

        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {/* Phone */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-foreground font-semibold">+91 9075201035</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-foreground font-semibold">
              info@paarshinfotech.com
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm">
              Office No. 1, Bhakti Apartment, near Hotel Rasoi, Suchita Nagar,
              Mumbai Naka, Nashik, Maharashtra, India
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
