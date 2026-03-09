"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setErrorMessage("");

    if (formData.phone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      setSubmitStatus("error");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Something went wrong. Please try again.");
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "firstName" || name === "lastName") {
      // Only accept alphabets
      const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData({
        ...formData,
        [name]: alphabeticValue,
      });
    } else if (name === "phone") {
      // Only accept numbers and max 10 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
                maxLength={10}
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

              {/* Status messages */}
              {submitStatus === "success" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your message has been sent successfully! We'll get back to you soon.
                </div>
              )}
              {submitStatus === "error" && errorMessage && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-primary-foreground px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
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
              glowvitasalon@gmail.com
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
