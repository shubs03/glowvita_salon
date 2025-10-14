"use client";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Footer } from "../../../../../packages/ui/src/footer";
import {
  Video,
  Clock,
  Shield,
  Users,
  Award,
  Heart,
  ArrowRight,
  Activity,
  MapPin,
  Calendar,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "../../components/landing/FeatureCard";
import BlogSectionWithData from "../../components/landing/BlogSection";
import TestimonialsSectionWithData from "../../components/landing/TestimonialsSection";
import SpecialitiesSectionWithData from "../../components/landing/SpecialitiesSection";
import { HeroSection } from "../../components/doctors/HeroSection";
import { ServicesSection } from "../../components/doctors/ServicesSection";
import { CtaSection } from "../../components/CtaSection";

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Clinics Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
              Top-Rated Medical Clinics
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Discover the best medical clinics in your area with verified
              doctors and excellent patient care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Clinic 1 - City Care Medical Center */}
            <FeatureCard
              id="city-care-medical"
              title="City Care Medical Center"
              description="Multi-specialty clinic with modern facilities"
              image="https://placehold.co/400x300/3B82F6/FFFFFF?text=City+Care+Medical"
              icon={Shield}
              iconColor="primary"
              badge="VERIFIED"
              badgeVariant="default"
              features={[
                "15+ specialist doctors available",
                "State-of-the-art diagnostic equipment",
              ]}
              actionText="Book Appointment"
              actionLink="/clinics/city-care-medical"
              stats={[
                { value: "4.8", label: "Rating" },
                { value: "1.2K", label: "Reviews" },
                { value: "15+", label: "Doctors" },
              ]}
            />

            {/* Clinic 2 - Health Plus Clinic */}
            <FeatureCard
              id="health-plus-clinic"
              title="Health Plus Clinic"
              description="Family healthcare with 24/7 emergency services"
              image="https://placehold.co/400x300/10B981/FFFFFF?text=Health+Plus+Clinic"
              icon={Clock}
              iconColor="blue-500"
              badge="24/7"
              badgeVariant="secondary"
              features={[
                "Emergency services available round the clock",
                "Family medicine and pediatric care",
              ]}
              actionText="Visit Clinic"
              actionLink="/clinics/health-plus"
              stats={[
                { value: "4.9", label: "Rating" },
                { value: "850", label: "Reviews" },
                { value: "12", label: "Doctors" },
              ]}
            />

            {/* Clinic 3 - Advanced Wellness Center */}
            <FeatureCard
              id="advanced-wellness"
              title="Advanced Wellness Center"
              description="Specialized in preventive care and wellness"
              image="https://placehold.co/400x300/8B5CF6/FFFFFF?text=Advanced+Wellness"
              icon={Heart}
              iconColor="purple-500"
              badge="WELLNESS"
              badgeVariant="outline"
              features={[
                "Comprehensive health checkups available",
                "Advanced preventive care programs",
              ]}
              actionText="Check Services"
              actionLink="/clinics/advanced-wellness"
              stats={[
                { value: "4.7", label: "Rating" },
                { value: "620", label: "Reviews" },
                { value: "8", label: "Doctors" },
              ]}
            />

            {/* Clinic 4 - Metro Diagnostic Center */}
            <FeatureCard
              id="metro-diagnostic"
              title="Metro Diagnostic Center"
              description="Complete diagnostic and imaging services"
              image="https://placehold.co/400x300/F97316/FFFFFF?text=Metro+Diagnostic"
              icon={Activity}
              iconColor="orange-500"
              badge="DIAGNOSTIC"
              badgeVariant="default"
              features={[
                "Latest imaging technology and lab tests",
                "Same-day results for most tests",
              ]}
              actionText="Book Test"
              actionLink="/clinics/metro-diagnostic"
              stats={[
                { value: "4.6", label: "Rating" },
                { value: "1.8K", label: "Reviews" },
                { value: "20+", label: "Tests" },
              ]}
            />

            {/* Clinic 5 - Women's Care Clinic */}
            <FeatureCard
              id="womens-care-clinic"
              title="Women's Care Clinic"
              description="Specialized women's health and maternity care"
              image="https://placehold.co/400x300/EC4899/FFFFFF?text=Women+Care+Clinic"
              icon={Heart}
              iconColor="pink-500"
              badge="SPECIALIZED"
              badgeVariant="secondary"
              features={[
                "Expert gynecologists and obstetricians",
                "Complete maternity and prenatal care",
              ]}
              actionText="Book Consultation"
              actionLink="/clinics/womens-care"
              stats={[
                { value: "4.9", label: "Rating" },
                { value: "950", label: "Reviews" },
                { value: "6", label: "Specialists" },
              ]}
            />

            {/* Clinic 6 - Pediatric Care Center */}
            <FeatureCard
              id="pediatric-care"
              title="Pediatric Care Center"
              description="Dedicated children's healthcare facility"
              image="https://placehold.co/400x300/06B6D4/FFFFFF?text=Pediatric+Care"
              icon={Users}
              iconColor="cyan-500"
              badge="KIDS"
              badgeVariant="outline"
              features={[
                "Child-friendly environment and care",
                "Pediatric specialists and vaccines",
              ]}
              actionText="Book for Child"
              actionLink="/clinics/pediatric-care"
              stats={[
                { value: "4.8", label: "Rating" },
                { value: "1.1K", label: "Reviews" },
                { value: "8", label: "Pediatricians" },
              ]}
            />

            {/* Clinic 7 - Dental Excellence Clinic */}
            <FeatureCard
              id="dental-excellence"
              title="Dental Excellence Clinic"
              description="Complete dental care and cosmetic dentistry"
              image="https://placehold.co/400x300/8B5CF6/FFFFFF?text=Dental+Excellence"
              icon={Award}
              iconColor="purple-600"
              badge="DENTAL"
              badgeVariant="default"
              features={[
                "Advanced dental procedures and implants",
                "Cosmetic dentistry and orthodontics",
              ]}
              actionText="Book Dental Visit"
              actionLink="/clinics/dental-excellence"
              stats={[
                { value: "4.7", label: "Rating" },
                { value: "780", label: "Reviews" },
                { value: "5", label: "Dentists" },
              ]}
            />

            {/* Clinic 8 - Eye Care Specialists */}
            <FeatureCard
              id="eye-care-specialists"
              title="Eye Care Specialists"
              description="Comprehensive eye care and vision correction"
              image="https://placehold.co/400x300/10B981/FFFFFF?text=Eye+Care+Specialists"
              icon={Activity}
              iconColor="emerald-500"
              badge="VISION"
              badgeVariant="secondary"
              features={[
                "Latest laser surgery and treatments",
                "Complete eye examinations and care",
              ]}
              actionText="Book Eye Test"
              actionLink="/clinics/eye-care-specialists"
              stats={[
                { value: "4.9", label: "Rating" },
                { value: "650", label: "Reviews" },
                { value: "4", label: "Specialists" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Specialities Section */}
      <SpecialitiesSectionWithData />

      {/* Blog Section */}
      <BlogSectionWithData />

      {/* Testimonials Section */}
      <TestimonialsSectionWithData />

      {/* Quick Actions Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
              Get Started Today
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Everything you need for your healthcare journey in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Book Appointment */}
            <Link href="/doctors/appointments" className="group block">
              <div className="relative p-6 rounded-md transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-primary/2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/15 rounded-md flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                    <Calendar className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Schedule with your preferred doctor
                  </p>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-primary mt-3 transition-all duration-300 rounded-full group-hover:w-8" />
                </div>
              </div>
            </Link>

            {/* Browse Specialties */}
            <Link href="/doctors/specialties" className="group block">
              <div className="relative p-6 rounded-md transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-primary/2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/15 rounded-md flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                    <Stethoscope className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    Browse Specialties
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Find doctors by medical expertise
                  </p>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-primary mt-3 transition-all duration-300 rounded-full group-hover:w-8" />
                </div>
              </div>
            </Link>

            {/* Featured Doctors */}
            <Link href="/doctors/featured" className="group block">
              <div className="relative p-6 rounded-md transition-all duration-300 hover:bg-blue-500/5 hover:-translate-y-1 bg-gradient-to-br from-blue-500/5 to-blue-500/2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-500/15 rounded-md flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110">
                    <Award className="h-6 w-6 text-blue-500 group-hover:text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                    Featured Doctors
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Top-rated medical professionals
                  </p>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-blue-500 mt-3 transition-all duration-300 rounded-full group-hover:w-8" />
                </div>
              </div>
            </Link>

            {/* Check Schedule */}
            <Link href="/doctors/schedule" className="group block">
              <div className="relative p-6 rounded-md transition-all duration-300 hover:bg-blue-500/5 hover:-translate-y-1 bg-gradient-to-br from-blue-500/5 to-blue-500/2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-500/15 rounded-md flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110">
                    <Clock className="h-6 w-6 text-blue-500 group-hover:text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                    Check Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    View doctor availability
                  </p>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-blue-500 mt-3 transition-all duration-300 rounded-full group-hover:w-8" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}
