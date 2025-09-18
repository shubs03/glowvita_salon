
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
    { author: "Amanda G.", rating: 5, text: "Loved the experience! Will be back soon.", date: '2024-08-20T10:00:00Z' },
    { author: "Robert K.", rating: 4, text: "Great service, but a bit pricey.", date: '2024-08-18T14:30:00Z' },
    { author: "Ikbal Z.", rating: 5, text: "1st time datang potong sini , barber abg kamil mmg sangat profesional dari segi knowledge and skill...", date: '2024-08-15T19:03:00Z' },
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
      <div className="container mx-auto px-4">
        {/* Salon Name and Basic Info - Moved to the top */}
        <section className="py-8 border-b">
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

        {/* Compact Bento Grid Hero Gallery */}
        <section className="py-6">
          <div className="grid grid-cols-6 grid-rows-2 gap-2 h-64 md:h-[450px]">
            {/* Main large image - spans 4 columns and 2 rows */}
            <div className="col-span-6 md:col-span-4 row-span-2 rounded-lg overflow-hidden group cursor-pointer">
              <Image 
                src={mainImage} 
                alt={salon.name} 
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="luxury salon interior main view"
              />
            </div>
            
            {/* Top right image */}
            <div className="hidden md:block col-span-2 row-span-1 rounded-lg overflow-hidden group cursor-pointer" 
                 onClick={() => setMainImage(salon.images[1])}>
              <Image 
                src={salon.images[1]} 
                alt={`${salon.name} view 2`} 
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon detail photo"
              />
            </div>
            
            {/* Bottom right image */}
            <div className="hidden md:block col-span-2 row-span-1 rounded-lg overflow-hidden group cursor-pointer relative" 
                 onClick={() => setMainImage(salon.images[2])}>
              <Image 
                src={salon.images[2]} 
                alt={`${salon.name} view 3`} 
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon detail photo"
              />
              {salon.images.length > 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-semibold text-sm">+{salon.images.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile gallery indicators */}
          <div className="md:hidden flex justify-center mt-4 space-x-2">
            {salon.images.slice(0, 4).map((img, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${mainImage === img ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-500'}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </section>

        {/* Full-width "About" Section */}
        <section className="my-8">
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

        {/* Main Content Grid - Starting from Services Section */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left/Main Column (Scrollable) */}
          <div className="lg:col-span-2 space-y-16">
            
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
              <h2 className="text-3xl font-bold mb-6">Reviews</h2>
              <div className="mb-6 border-b pb-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">{salon.rating}</span>
                  <div className="flex-col">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.floor(salon.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on {salon.reviewCount} reviews</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {salon.reviews.map(review => (
                  <div key={review.author} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                      {review.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{review.author}</p>
                      <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span>·</span>
                        <span>{new Date(review.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">See all reviews</Button>
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
          <div className="lg:sticky top-8 self-start space-y-8">
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
