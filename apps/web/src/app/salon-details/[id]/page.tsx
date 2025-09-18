
"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Star, MapPin, Clock, Phone, Globe, Heart, Shield, Check, Award, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@repo/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Badge } from '@repo/ui/badge';

const salon = {
  id: '1',
  name: 'GlowVita Elite Spa',
  rating: 4.9,
  reviewCount: 250,
  address: '123 Luxury Ave, Suite 100, Beverly Hills, CA 90210',
  description: 'An oasis of tranquility and relaxation, offering a wide range of beauty and wellness services. Our expert therapists and state-of-the-art facilities ensure an unparalleled experience. We are dedicated to providing the highest quality of service and care, making every visit a memorable one.',
  images: [
    'https://picsum.photos/seed/salon1/1200/800',
    'https://picsum.photos/seed/salon2/800/600',
    'https://picsum.photos/seed/salon3/800/600',
    'https://picsum.photos/seed/salon4/800/600',
  ],
  services: [
    { name: 'Signature Facial', price: 150, duration: 60, category: 'Skin' },
    { name: 'Deep Tissue Massage', price: 120, duration: 90, category: 'Body' },
    { name: 'Manicure & Pedicure', price: 80, duration: 75, category: 'Nails' },
    { name: 'Hair Styling', price: 75, duration: 45, category: 'Hair' },
    { name: 'Keratin Treatment', price: 250, duration: 120, category: 'Hair' },
    { name: 'HydraFacial', price: 180, duration: 75, category: 'Skin' },
    { name: 'Gel Nails', price: 60, duration: 60, category: 'Nails' },
  ],
  products: [
    { name: 'Revitalizing Serum', brand: 'Aura Skincare', price: 85, image: 'https://picsum.photos/seed/productA/200/200', hint: 'skincare serum' },
    { name: 'Hydrating Shampoo', brand: 'Luxe Hair', price: 40, image: 'https://picsum.photos/seed/productB/200/200', hint: 'shampoo bottle' },
    { name: 'Nourishing Hand Cream', brand: 'Zen Garden', price: 25, image: 'https://picsum.photos/seed/productC/200/200', hint: 'hand cream tube' },
  ],
  staff: [
    { name: 'Jessica Miller', role: 'Lead Stylist', image: 'https://picsum.photos/seed/staff1/200/200', hint: 'female stylist portrait' },
    { name: 'Michael Chen', role: 'Massage Therapist', image: 'https://picsum.photos/seed/staff2/200/200', hint: 'male therapist portrait' },
    { name: 'Emily White', role: 'Esthetician', image: 'https://picsum.photos/seed/staff3/200/200', hint: 'female esthetician portrait' },
  ],
  testimonials: [
    { quote: "The best facial I've ever had. My skin is glowing!", author: "Sarah L." },
    { quote: "An incredibly relaxing and professional atmosphere. Highly recommend the deep tissue massage.", author: "John D." },
  ],
  reviews: [
    { author: "Amanda G.", rating: 5, text: "Loved the experience! Will be back soon." },
    { author: "Robert K.", rating: 4, text: "Great service, but a bit pricey." },
  ],
  workingHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ],
};

const serviceCategories = ['All', 'Hair', 'Skin', 'Nails', 'Body'];

export default function SalonDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [mainImage, setMainImage] = useState(salon.images[0]);
  const [activeServiceTab, setActiveServiceTab] = useState('All');

  const filteredServices = activeServiceTab === 'All' 
    ? salon.services 
    : salon.services.filter(s => s.category === activeServiceTab);

  return (
    <PageContainer padding="none">
      {/* Section 1: Hero Image Gallery */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-4 gap-2 h-96">
            <div className="col-span-4 lg:col-span-3 rounded-lg overflow-hidden">
                <Image 
                    src={mainImage} 
                    alt={salon.name} 
                    width={1200}
                    height={800}
                    className="w-full h-full object-cover"
                    data-ai-hint="luxury salon interior"
                />
            </div>
            <div className="hidden lg:grid grid-rows-4 gap-2">
                {salon.images.slice(0, 4).map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden cursor-pointer" onClick={() => setMainImage(img)}>
                        <Image 
                            src={img} 
                            alt={`${salon.name} thumbnail ${index + 1}`} 
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                            data-ai-hint="salon detail photo"
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left/Main Column (Scrollable) */}
          <div className="lg:col-span-2 space-y-16">
            {/* Salon Name and Basic Info */}
            <section>
              <h1 className="text-4xl font-bold font-headline mb-4">{salon.name}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{salon.rating}</span>
                  <span>({salon.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{salon.address}</span>
                </div>
              </div>
            </section>
            
            {/* About Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">About the Salon</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">{salon.description}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg">
                      <Award className="mx-auto h-8 w-8 text-primary mb-2" />
                      <p className="font-semibold">Top Rated</p>
                      <p className="text-sm text-muted-foreground">For customer satisfaction</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <Shield className="mx-auto h-8 w-8 text-primary mb-2" />
                      <p className="font-semibold">Health & Safety Certified</p>
                      <p className="text-sm text-muted-foreground">Your well-being is our priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Services Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Services Offered</h2>
              <Card>
                <CardHeader>
                  <Tabs value={activeServiceTab} onValueChange={setActiveServiceTab}>
                    <TabsList>
                      {serviceCategories.map(cat => (
                        <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredServices.map(service => (
                    <div key={service.name} className="flex justify-between items-center p-4 border rounded-lg hover:bg-secondary/50">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration} min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{service.price.toFixed(2)}</p>
                        <Button size="sm" variant="outline" className="mt-1">Book</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
            
            {/* Products Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Products We Use & Sell</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {salon.products.map(product => (
                  <Card key={product.name}>
                    <Image src={product.image} alt={product.name} width={300} height={300} className="w-full h-40 object-cover rounded-t-lg" data-ai-hint={product.hint} />
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="mt-2 font-bold text-primary">₹{product.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Staff Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {salon.staff.map(member => (
                  <Card key={member.name} className="text-center">
                    <CardContent className="p-4">
                      <Image src={member.image} alt={member.name} width={120} height={120} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" data-ai-hint={member.hint} />
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-primary">{member.role}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Testimonials & Reviews */}
            <section>
              <h2 className="text-3xl font-bold mb-6">What Our Clients Say</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {salon.testimonials.map((testimonial, i) => (
                  <blockquote key={i} className="p-6 bg-secondary rounded-lg border-l-4 border-primary">
                    <p className="text-lg italic">"{testimonial.quote}"</p>
                    <footer className="mt-4 font-semibold">- {testimonial.author}</footer>
                  </blockquote>
                ))}
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4">All Reviews</h3>
                <div className="space-y-4">
                  {salon.reviews.map(review => (
                    <Card key={review.author}>
                      <CardContent className="p-4 flex gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-bold">{review.rating}.0</span>
                        </div>
                        <div className="border-l pl-4">
                          <p className="font-semibold">{review.author}</p>
                          <p className="text-sm text-muted-foreground">{review.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Nearby Salons */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Nearby Salons</h2>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d241317.11609822!2d72.8776559!3d19.0759837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1ssalon!5e0!3m2!1sen!2sin!4v1672846875765!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  title="Nearby Salons Map"
                ></iframe>
              </div>
            </section>

          </div>

          {/* Right/Sticky Column */}
          <div className="lg:sticky top-24 self-start space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>Choose your service and book online.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full">Book Now</Button>
                <p className="text-xs text-center mt-2 text-muted-foreground">Instant confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {salon.workingHours.map(wh => (
                    <li key={wh.day} className="flex justify-between text-sm">
                      <span>{wh.day}</span>
                      <span className="font-semibold">{wh.hours}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (234) 567-890</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.glowvitaelitespa.com</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

    