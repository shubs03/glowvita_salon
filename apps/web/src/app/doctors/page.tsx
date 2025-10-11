"use client";

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Footer } from '../../../../../packages/ui/src/footer';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  Stethoscope, 
  Video, 
  Clock, 
  Shield, 
  Users, 
  Award, 
  Heart, 
  Phone, 
  CheckCircle,
  ArrowRight,
  UserCheck,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Stethoscope className="h-4 w-4" />
              India's Leading Healthcare Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Health,{" "}
              <span className="text-primary">Our Priority</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Connect with qualified doctors, book appointments instantly, and get expert medical care from the comfort of your home.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 flex items-center p-1">
                    <div className="flex items-center flex-1 px-4 py-3">
                      <Search className="h-5 w-5 text-muted-foreground mr-3" />
                      <Input
                        placeholder="Search doctors, specialties..."
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex items-center border-t md:border-t-0 md:border-l border-border/30 p-1">
                    <div className="flex items-center flex-1 px-4 py-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                      <Input
                        placeholder="Enter location"
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="p-1">
                    <Button className="w-full md:w-auto px-8 py-3 text-base rounded-xl">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">50,000+</div>
                <div className="text-muted-foreground">Verified Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">1M+</div>
                <div className="text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">200+</div>
                <div className="text-muted-foreground">Specialties</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Healthcare Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive healthcare services designed for your convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Video Consultation */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-white to-primary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Video Consultation</h3>
                    <p className="text-muted-foreground mb-6">
                      Get instant medical advice from certified doctors through secure video calls
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Available 24/7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Instant prescriptions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Secure & private</span>
                      </div>
                    </div>
                    <Button asChild className="group-hover:translate-x-1 transition-transform">
                      <Link href="/doctors/consultations">
                        Start Consultation
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Find Doctor Near Me */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-secondary/30 bg-gradient-to-br from-white to-secondary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Find Doctor Near Me</h3>
                    <p className="text-muted-foreground mb-6">
                      Discover qualified doctors in your area and book appointments instantly
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Real-time availability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Verified profiles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Easy booking</span>
                      </div>
                    </div>
                    <Button asChild variant="secondary" className="group-hover:translate-x-1 transition-transform">
                      <Link href="/doctors/nearby">
                        Find Doctors
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose GlowVita?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience healthcare that puts you first with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Doctors</h3>
              <p className="text-muted-foreground">
                All our doctors are verified and licensed medical professionals with proven expertise
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Availability</h3>
              <p className="text-muted-foreground">
                Get medical consultations anytime, anywhere with our round-the-clock service
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Care</h3>
              <p className="text-muted-foreground">
                Receive tailored treatment plans based on your unique health needs and history
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Prescriptions</h3>
              <p className="text-muted-foreground">
                Get digital prescriptions delivered instantly after your consultation
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Health Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your health progress with our integrated tracking and analytics tools
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Network</h3>
              <p className="text-muted-foreground">
                Access healthcare professionals from around the world for specialized treatments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Millions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join millions of satisfied patients who trust us with their healthcare needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Verified Doctors</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-green-500 mb-2">1M+</div>
              <div className="text-muted-foreground">Happy Patients</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-4xl font-bold text-blue-500 mb-2">5M+</div>
              <div className="text-muted-foreground">Appointments</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">4.9</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Quick Actions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for your healthcare journey in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
              <CardContent className="p-6 text-center">
                <Link href="/doctors/appointments" className="block">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Book Appointment</h3>
                  <p className="text-sm text-muted-foreground">Schedule with your preferred doctor</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
              <CardContent className="p-6 text-center">
                <Link href="/doctors/specialties" className="block">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold mb-2">Browse Specialties</h3>
                  <p className="text-sm text-muted-foreground">Find doctors by medical expertise</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
              <CardContent className="p-6 text-center">
                <Link href="/doctors/featured" className="block">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="font-bold mb-2">Featured Doctors</h3>
                  <p className="text-sm text-muted-foreground">Top-rated medical professionals</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
              <CardContent className="p-6 text-center">
                <Link href="/doctors/schedule" className="block">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-bold mb-2">Check Schedule</h3>
                  <p className="text-sm text-muted-foreground">View doctor availability</p>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join millions who trust GlowVita for their healthcare needs. Get started today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                <Link href="/doctors/appointments" className="flex items-center gap-2">
                  Book Appointment
                  <Calendar className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary">
                <Link href="/doctors/consultations" className="flex items-center gap-2">
                  Start Consultation
                  <Video className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}