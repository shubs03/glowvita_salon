
"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, MapPin, Clock, Phone, Globe, Heart } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@repo/ui/page-container';

const salon = {
  id: '1',
  name: 'GlowVita Elite Spa',
  rating: 4.9,
  reviews: 250,
  address: '123 Luxury Ave, Suite 100, Beverly Hills, CA 90210',
  description: 'An oasis of tranquility and relaxation, offering a wide range of beauty and wellness services. Our expert therapists and state-of-the-art facilities ensure an unparalleled experience.',
  images: [
    'https://picsum.photos/seed/salon1/1200/800',
    'https://picsum.photos/seed/salon2/800/600',
    'https://picsum.photos/seed/salon3/800/600',
    'https://picsum.photos/seed/salon4/800/600',
  ],
  services: [
    { name: 'Signature Facial', price: 150, duration: 60 },
    { name: 'Deep Tissue Massage', price: 120, duration: 90 },
    { name: 'Manicure & Pedicure', price: 80, duration: 75 },
    { name: 'Hair Styling', price: 75, duration: 45 },
  ],
  workingHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ],
};

export default function SalonDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [mainImage, setMainImage] = useState(salon.images[0]);

  return (
    <PageContainer>
      {/* Section 1: Hero Image */}
      <div className="relative h-96 rounded-lg overflow-hidden -mt-8">
        <Image 
          src={mainImage} 
          alt={salon.name} 
          layout="fill" 
          objectFit="cover"
          data-ai-hint="luxury salon interior"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Section 2: Main Info */}
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold font-headline">{salon.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{salon.rating}</span>
                  <span>({salon.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  <span>{salon.address}</span>
                </div>
              </div>
              <p className="text-lg">{salon.description}</p>
            </div>
            {/* Section 3: Actions */}
            <div className="space-y-4">
              <Button size="lg" className="w-full">Book Appointment</Button>
              <Button size="lg" variant="outline" className="w-full">View on Map</Button>
              <Button size="lg" variant="ghost" className="w-full"><Heart className="mr-2 h-4 w-4" /> Add to Favorites</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Section 4: Services */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">Services Offered</h2>
            <div className="space-y-4">
              {salon.services.map(service => (
                <Card key={service.name}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.duration} min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{service.price.toFixed(2)}</p>
                      <Button size="sm" variant="outline" className="mt-1">Book</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* Section 5: Working Hours & Contact */}
          <div className="space-y-8">
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
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (234) 567-890</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.glowvitaelitespa.com</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* 5 more sections */}
      <section></section><section></section><section></section><section></section><section></section>
    </PageContainer>
  );
}
