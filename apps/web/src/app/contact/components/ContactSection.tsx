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
      const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData({ ...formData, [name]: alphabeticValue });
    } else if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left - Contact Form */}
        <div className="order-2 lg:order-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
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
                  style={{
                    backgroundColor: formData.firstName ? "#FFFFFF" : "#F9F9F9",
                    borderColor: formData.firstName ? "#000000" : "#F9F9F9",
                  }}
                  className="w-full px-4 py-3 sm:py-3.5 border rounded-lg text-sm text-foreground placeholder-gray-400 transition-all"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name*"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    backgroundColor: formData.lastName ? "#FFFFFF" : "#F9F9F9",
                    borderColor: formData.lastName ? "#000000" : "#F9F9F9",
                  }}
                  className="w-full px-4 py-3 sm:py-3.5 border rounded-lg text-sm text-foreground placeholder-gray-400 transition-all"
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
                style={{
                  backgroundColor: formData.email ? "#FFFFFF" : "#F9F9F9",
                  borderColor: formData.email ? "#000000" : "#F9F9F9",
                }}
                className="w-full px-4 py-3 sm:py-3.5 border rounded-lg text-sm text-foreground placeholder-gray-400 transition-all"
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
                style={{
                  backgroundColor: formData.phone ? "#FFFFFF" : "#F9F9F9",
                  borderColor: formData.phone ? "#000000" : "#F9F9F9",
                }}
                className="w-full px-4 py-3 sm:py-3.5 border rounded-lg text-sm text-foreground placeholder-gray-400 transition-all"
              />

              {/* Message */}
              <textarea
                name="message"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
                style={{
                  backgroundColor: formData.message ? "#FFFFFF" : "#F9F9F9",
                  borderColor: formData.message ? "#000000" : "#F9F9F9",
                }}
                className="w-full px-4 py-3 sm:py-3.5 border rounded-lg text-sm text-foreground placeholder-gray-400 transition-all resize-none"
              />

              {/* Status messages */}
              {submitStatus === "success" && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your message has been sent successfully! We'll get back to you soon.
                </div>
              )}
              {submitStatus === "error" && errorMessage && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white px-6 py-3 sm:py-3.5 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(360deg, #422A3C 0%, #A86B99 100%)" }}
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

        {/* Right - Illustration */}
        <div className="order-1 lg:order-2 flex items-center justify-center">
          <img
            src="/images/Contact us 1.png"
            alt="Contact Us"
            className="w-full max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-14 lg:mt-16">
        {/* Phone */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm sm:text-base">+91 9075201035</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm sm:text-base break-all">
              glowvitasalon@gmail.com
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 sm:gap-4 sm:col-span-2 md:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-xs sm:text-sm leading-relaxed">
              Corporate Office : Business Plus, A Wing, 5th Floor, Office No. 505, 506, Near Sai Square, Mumbai Naka, Nashik, Maharashtra, India PIN - 422009
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;