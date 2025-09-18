
"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Star, MapPin, Clock, Phone, Globe, Heart, Shield, Check, Award, ThumbsUp, ArrowRight, ShoppingCart, Tag, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@repo/ui/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Badge } from '@repo/ui/badge';
import { cn } from '@repo/ui/cn';
import { SalonCard } from '@/components/landing/SalonCard';

const salon = {
  id: '1',
  name: 'GlowVita Elite Spa',
  rating: 4.9,
  reviewCount: 250,
  address: '123 Luxury Ave, Suite 100, Beverly Hills, CA 90210',
  description: 'An oasis of tranquility and relaxation, offering a wide range of beauty and wellness services. Our expert therapists and state-of-the-art facilities ensure an unparalleled experience.',
  mission: 'To enhance beauty and wellness through personalized care and high-quality services, creating a serene escape for every client.',
  whyChooseUs: [
    'Expert & Certified Staff',
    'Premium & Organic Products',
    'State-of-the-Art Equipment',
    'Personalized Client Experience',
    'Hygienic & Luxurious Ambiance',
  ],
  stats: [
    { value: '10+', label: 'Years of Experience' },
    { value: '5k+', label: 'Happy Clients' },
    { value: '15+', label: 'Expert Staff' },
  ],
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
    { id: 'p1', name: 'Revitalizing Serum', brand: 'Aura Skincare', price: 85, image: 'https://picsum.photos/seed/productA/400/400', hint: 'skincare serum', stock: 23, rating: 4.8 },
    { id: 'p2', name: 'Hydrating Shampoo', brand: 'Luxe Hair', price: 40, image: 'https://picsum.photos/seed/productB/400/400', hint: 'shampoo bottle', stock: 50, rating: 4.5 },
    { id: 'p3', name: 'Nourishing Hand Cream', brand: 'Zen Garden', price: 25, image: 'https://picsum.photos/seed/productC/400/400', hint: 'hand cream tube', stock: 0, rating: 4.9 },
    { id: 'p4', name: 'Matte Lipstick', brand: 'Chroma Beauty', price: 30, image: 'https://picsum.photos/seed/productD/400/400', hint: 'lipstick tube', stock: 120, rating: 4.6 },
  ],
  staff: [
    { name: 'Jessica Miller', role: 'Lead Stylist', image: 'https://picsum.photos/seed/staff1/400/400', hint: 'female stylist portrait' },
    { name: 'Michael Chen', role: 'Massage Therapist', image: 'https://picsum.photos/seed/staff2/400/400', hint: 'male therapist portrait' },
    { name: 'Emily White', role: 'Esthetician', image: 'https://picsum.photos/seed/staff3/400/400', hint: 'female esthetician portrait' },
  ],
  testimonials: [
    { quote: "The best facial I've ever had. My skin is glowing!", author: "Sarah L." },
    { quote: "An incredibly relaxing and professional atmosphere. Highly recommend the deep tissue massage.", author: "John D." },
  ],
  reviews: [
    { author: "Amanda G.", rating: 5, date: '2024-08-20T10:00:00Z', text: 'Loved the experience! Will be back soon.' },
    { author: "Robert K.", rating: 4, date: '2024-08-18T14:30:00Z', text: 'Great service, but a bit pricey.' },
    { author: "Ikbal Z.", rating: 5, date: '2025-09-14T19:03:00Z', text: "1st time datang potong sini , barber abg kamil mmg sangat profesional dari segi knowledge and skill..."},
  ],
  workingHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ],
};

const nearbySalons = [
  { name: 'Ethereal Beauty', rating: 4.8, location: 'Santa Monica', image: 'https://picsum.photos/seed/nearby1/600/400', hint: 'modern bright salon', services: ['Organic Facials', 'Aromatherapy'], price: '₹2,200+' },
  { name: 'The Grooming Lounge', rating: 4.9, location: 'Downtown LA', image: 'https://picsum.photos/seed/nearby2/600/400', hint: 'classic barbershop interior', services: ['Hot Towel Shave', 'Classic Haircut'], price: '₹1,800+', topRated: true },
  { name: 'Nail Nirvana', rating: 4.7, location: 'West Hollywood', image: 'https://picsum.photos/seed/nearby3/600/400', hint: 'chic nail art salon', services: ['Gel Manicure', 'Spa Pedicure'], price: '₹1,500+' },
];


const serviceCategories = ['All', 'Hair', 'Skin', 'Nails', 'Body'];

export default function SalonDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [mainImage, setMainImage] = useState(salon.images[0]);
  const [activeServiceTab, setActiveServiceTab] = useState('All');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const filteredServices = activeServiceTab === 'All' 
    ? salon.services 
    : salon.services.filter(s => s.category === activeServiceTab);

  const openGalleryModal = (image: string) => {
    setMainImage(image);
    setIsGalleryModalOpen(true);
  };
  
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <PageContainer padding="none">
      <div className="container mx-auto px-4">
        {/* Salon Name and Basic Info */}
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
          <div className="grid grid-cols-6 grid-rows-2 gap-2 h-40 md:h-56">
            <div className="col-span-6 md:col-span-4 row-span-2 rounded-md overflow-hidden group cursor-pointer" onClick={() => openGalleryModal(salon.images[0])}>
              <Image 
                src={salon.images[0]} 
                alt={salon.name} 
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="luxury salon interior main view"
              />
            </div>
            <div className="hidden md:block col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer" onClick={() => openGalleryModal(salon.images[1])}>
              <Image 
                src={salon.images[1]} 
                alt={`${salon.name} view 2`} 
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon detail photo"
              />
            </div>
            <div className="hidden md:block col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative" onClick={() => openGalleryModal(salon.images[2])}>
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
        </section>

        <section id="about" className="py-8">
          <Card className="bg-secondary/50">
              <CardContent className="p-6">
                  <div className="max-w-4xl mx-auto p-4 md:p-8">
                    <div className="relative border-4 border-primary/20 rounded-lg p-2">
                      <div className="relative border-2 border-primary/20 rounded-lg p-2">
                        <div className="relative border border-primary/20 rounded-lg p-8 text-center bg-background">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
                                <h2 className="text-2xl font-bold font-headline text-primary">About the Salon</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mt-4 mb-8">
                                {salon.mission}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {salon.stats.map(stat => (
                                    <div key={stat.label} className="border-t-2 border-primary/20 pt-3">
                                        <p className="text-3xl font-bold text-primary">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </CardContent>
          </Card>
        </section>
        
        {/* Main Content Area */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-12 lg:items-start py-8">
          {/* Left Scrolling Column */}
          <div className="lg:col-span-2 space-y-16">
            
            <section id="about">
              <h2 className="text-3xl font-bold mb-2">About the Salon</h2>
              <p className="text-muted-foreground mb-6">Discover the story and values behind our brand.</p>

              <p className='text-muted-foreground text-lg mb-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut possimus, asperiores, eos exercitationem molestiae deserunt doloremque laudantium quaerat cupiditate nostrum pariatur itaque temporibus veniam quam commodi voluptate praesentium quis aliquid! Velit, ipsam laboriosam quam porro cum alias maxime tenetur illo accusamus quaerat, eaque debitis doloremque sequi molestias aperiam veritatis ipsum! Soluta distinctio earum a in quam blanditiis exercitationem odio ducimus officia alias minus quae quod, laborum perspiciatis, ipsa accusantium molestiae expedita, numquam tenetur consequuntur voluptatibus! Expedita laborum quo ipsam quia repudiandae unde eaque minus veniam, quod tempora, delectus reprehenderit illo dicta maxime quaerat vitae ab quam eligendi ducimus totam voluptatum.</p>

              <Card>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-3 gap-6 text-center">
                    {salon.stats.map(stat => (
                      <div key={stat.label}>
                        <p className="text-3xl font-bold text-primary">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="services">
              <h2 className="text-3xl font-bold mb-2">Services Offered</h2>
              <p className="text-muted-foreground mb-6">Explore our wide range of professional services.</p>
              <Card>
                <CardHeader>
                  <Tabs value={activeServiceTab} onValueChange={setActiveServiceTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-secondary/50 rounded-lg p-1">
                      {serviceCategories.map(cat => (
                        <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">{cat}</TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredServices.map(service => (
                    <div key={service.name} className="flex justify-between items-center p-4 border rounded-md hover:bg-secondary/50">
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
            
            <section id="products">
              <h2 className="text-3xl font-bold mb-2">Products We Use & Sell</h2>
              <p className="text-muted-foreground mb-6">High-quality products available for purchase.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {salon.products.map(product => (
                  <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow flex flex-col text-left">
                    <div className="relative aspect-square bg-gray-100">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={product.hint} 
                      />
                       <Badge variant={product.stock > 0 ? "secondary" : "default"} className="absolute top-2 right-2 text-xs">
                          {product.stock > 0 ? `In Stock` : 'Out of Stock'}
                        </Badge>
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <p className="text-xs font-bold bg-black/80 text-blue-300 rounded-full mb-2 px-2 py-0.5 text-center items-center w-fit">{product.brand}</p>
                      <h4 className=" text-sm font-semibold flex-grow mb-1">{product.name}</h4>

                      <div className="flex justify-between items-center">
                        <p className="font-bold text-primary text-sm">₹{product.price.toFixed(2)}</p>
                         <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section id="team">
              <h2 className="text-3xl font-bold mb-2">Meet Our Team</h2>
              <p className="text-muted-foreground mb-6">Our talented and experienced professionals.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {salon.staff.map(member => (
                  <div key={member.name} className="text-center group">
                    <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg mb-4 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        layout="fill" 
                        className="object-cover" 
                        data-ai-hint={member.hint} 
                      />
                    </div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-primary">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="reviews">
                <h2 className="text-3xl font-bold mb-2">Reviews</h2>
                <p className="text-muted-foreground mb-6">What our clients are saying about us.</p>
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-semibold">Client Reviews</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-2xl font-bold">{salon.rating}</span>
                                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Based on {salon.reviewCount} reviews</p>
                                </div>
                            </div>
                            <Button variant="outline">Write a Review</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {salon.reviews.map(review => (
                        <div key={review.author} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-primary">
                                    {review.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold">{review.author}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(review.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                              </div>
                              <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm text-muted-foreground italic">"{review.text}"</p>
                        </div>
                      ))}
                    </CardContent>
                </Card>
            </section>

            <section id="nearby-salons">
                <h2 className="text-3xl font-bold mb-2">Nearby Salons</h2>
                <p className="text-muted-foreground mb-6">Explore other top-rated salons in the area.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {nearbySalons.map((salon, index) => (
                    <SalonCard key={index} {...salon} />
                ))}
                </div>
            </section>

          </div>

          {/* Right Sticky Column */}
          <div className="lg:sticky top-24 self-start space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>Choose your service and book online.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full rounded-sm">Book Now</Button>
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

      {isGalleryModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
          onClick={() => setIsGalleryModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <Image 
                src={mainImage} 
                alt="Gallery View" 
                fill 
                className="object-contain"
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {salon.images.map((img, index) => (
                <button key={index} onClick={() => setMainImage(img)}>
                  <Image 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    width={80} 
                    height={60} 
                    className={`rounded-md object-cover cursor-pointer border-2 transition-all ${mainImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
