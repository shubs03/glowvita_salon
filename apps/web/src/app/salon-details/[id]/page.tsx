
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Shield,
  Check,
  Award,
  ThumbsUp,
  ArrowRight,
  ShoppingCart,
  Tag,
  Edit,
  Trash2,
  Eye,
  Users,
  UserPlus,
  TrendingUp,
  Sparkles,
  Zap,
  Calendar,
  Gift,
  Percent,
  Share,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { PageContainer } from "@repo/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/cn";
import { useGetPublicVendorByIdQuery, useGetPublicProductsQuery } from "@repo/store/api";

// Default fallback data
const defaultSalon = {
  id: "",
  name: "Loading...",
  rating: 0,
  reviewCount: 0,
  address: "",
  description: "",
  mission: "",
  whyChooseUs: [
    "Expert & Certified Staff",
    "Premium & Organic Products",
    "State-of-the-Art Equipment",
    "Personalized Client Experience",
    "Hygienic & Luxurious Ambiance",
  ],
  stats: [
    { value: "10+", label: "Years of Experience" },
    { value: "5k+", label: "Happy Clients" },
    { value: "15+", label: "Services Available" },
    { value: "15+", label: "Expert Staff" },
  ],
  images: [
    "https://picsum.photos/seed/salon1/1200/800",
    "https://picsum.photos/seed/salon2/800/600",
    "https://picsum.photos/seed/salon3/800/600",
    "https://picsum.photos/seed/salon4/800/600",
  ],
  services: [
    { name: "Signature Facial", price: 150, duration: 60, category: "Skin", image: "https://picsum.photos/seed/facial/200/200" },
    { name: "Deep Tissue Massage", price: 120, duration: 90, category: "Body", image: "https://picsum.photos/seed/massage/200/200" },
    { name: "Manicure & Pedicure", price: 80, duration: 75, category: "Nails", image: "https://picsum.photos/seed/manicure/200/200" },
    { name: "Hair Styling", price: 75, duration: 45, category: "Hair", image: "https://picsum.photos/seed/haircut/200/200" },
    { name: "Keratin Treatment", price: 250, duration: 120, category: "Hair", image: "https://picsum.photos/seed/keratin/200/200" },
    { name: "HydraFacial", price: 180, duration: 75, category: "Skin", image: "https://picsum.photos/seed/hydra/200/200" },
    { name: "Gel Nails", price: 60, duration: 60, category: "Nails", image: "https://picsum.photos/seed/gelnails/200/200" },
  ],
  products: [
    {
      id: "p1",
      name: "Revitalizing Serum",
      brand: "Aura Skincare",
      price: 85,
      image: "https://picsum.photos/seed/productA/400/400",
      hint: "skincare serum",
      stock: 23,
      rating: 4.8,
    },
    {
      id: "p2",
      name: "Hydrating Shampoo",
      brand: "Luxe Hair",
      price: 40,
      image: "https://picsum.photos/seed/productB/400/400",
      hint: "shampoo bottle",
      stock: 50,
      rating: 4.5,
    },
    {
      id: "p3",
      name: "Nourishing Hand Cream",
      brand: "Zen Garden",
      price: 25,
      image: "https://picsum.photos/seed/productC/400/400",
      hint: "hand cream tube",
      stock: 0,
      rating: 4.9,
    },
    {
      id: "p4",
      name: "Matte Lipstick",
      brand: "Chroma Beauty",
      price: 30,
      image: "https://picsum.photos/seed/productD/400/400",
      hint: "lipstick tube",
      stock: 120,
      rating: 4.6,
    },
  ],
  staff: [
    {
      name: "Jessica Miller",
      role: "Lead Stylist",
      image: "https://picsum.photos/seed/staff1/400/400",
      hint: "female stylist portrait",
    },
    {
      name: "Michael Chen",
      role: "Massage Therapist",
      image: "https://picsum.photos/seed/staff2/400/400",
      hint: "male therapist portrait",
    },
    {
      name: "Emily White",
      role: "Esthetician",
      image: "https://picsum.photos/seed/staff3/400/400",
      hint: "female esthetician portrait",
    },
  ],
  reviews: [
    {
      author: "Amanda G.",
      rating: 5,
      date: "2024-08-20T10:00:00Z",
      text: "Loved the experience! Will be back soon.",
    },
    {
      author: "Robert K.",
      rating: 4,
      date: "2024-08-18T14:30:00Z",
      text: "Great service, but a bit pricey.",
    },
    {
      author: "Ikbal Z.",
      rating: 5,
      date: "2025-09-14T19:03:00Z",
      text: "1st time datang potong sini , barber abg kamil mmg sangat profesional dari segi knowledge and skill...",
    },
  ],
  workingHours: [
    { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  offers: [
    {
      title: "Weekday Special",
      description: "20% off on all haircuts, Mon-Wed.",
      icon: Tag,
    },
    {
      title: "First-Time Client",
      description: "Get 15% off your first service with us.",
      icon: UserPlus,
    },
    {
      title: "Bundle & Save",
      description: "Book a facial and massage together and save 25%.",
      icon: Gift,
    },
  ],
};

const nearbySalons = [
  {
    icon: Sparkles,
    title: "Luxe Hair Studio",
    location: "Manhattan, NY",
    rating: 4.9,
    clients: "500+",
    specialty: "Premium Hair Styling",
    description:
      "Upscale salon specializing in color correction and luxury treatments",
    growth: "+40% bookings",
    image: "https://placehold.co/400x200/6366f1/ffffff?text=Luxe+Hair+Studio",
  },
  {
    icon: Heart,
    title: "Bella Vista Spa",
    location: "Beverly Hills, CA",
    rating: 5.0,
    clients: "300+",
    specialty: "Full-Service Day Spa",
    description:
      "Award-winning spa with 15 treatment rooms and wellness packages",
    growth: "+60% revenue",
    image: "https://placehold.co/400x200/10b981/ffffff?text=Bella+Vista+Spa",
  },
  {
    icon: Users,
    title: "Modern Cuts Barbershop",
    location: "Austin, TX (3 locations)",
    rating: 4.8,
    clients: "800+",
    specialty: "Traditional & Modern Cuts",
    description:
      "Local barbershop chain known for precision cuts and beard styling",
    growth: "+25% client retention",
    image: "https://placehold.co/400x200/475569/ffffff?text=Modern+Cuts",
  },
  {
    icon: Star,
    title: "Glamour Nails & Beauty",
    location: "Miami, FL",
    rating: 4.9,
    clients: "450+",
    specialty: "Nail Art & Extensions",
    description:
      "Trendy nail salon featuring custom designs and gel treatments",
    growth: "+35% revenue",
    image: "https://placehold.co/400x200/ec4899/ffffff?text=Glamour+Nails",
  },
  {
    icon: Calendar,
    title: "Serenity Wellness Center",
    location: "Portland, OR",
    rating: 4.7,
    clients: "600+",
    specialty: "Massage & Wellness",
    description:
      "Holistic wellness center offering massage, yoga, and beauty services",
    growth: "+50% class bookings",
    image: "https://placehold.co/400x200/059669/ffffff?text=Serenity+Wellness",
  },
  {
    icon: TrendingUp,
    title: "Radiant Skin Clinic",
    location: "Seattle, WA",
    rating: 4.9,
    clients: "350+",
    specialty: "Medical Aesthetics",
    description:
      "Advanced skincare clinic with dermatologist-approved treatments",
    growth: "+45% new clients",
    image: "https://placehold.co/400x200/f97316/ffffff?text=Radiant+Skin",
  },
];

const serviceCategories = ["All", "Hair", "Skin", "Nails", "Body", "Massage", "Waxing", "Specialty"];

// Function to get the salon data dynamically
export default function SalonDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [activeServiceTab, setActiveServiceTab] = useState("All");
  const [visibleTab, setVisibleTab] = useState("overview");
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  
  const { data: vendorData, isLoading, error } = useGetPublicVendorByIdQuery(id, { skip: !id });
  const { data: productsData } = useGetPublicProductsQuery(undefined);
  
  const salon = useMemo(() => {
    if (vendorData) {
      return {
        ...defaultSalon,
        id: vendorData._id || defaultSalon.id,
        name: vendorData.businessName || "No Name Available",
        rating: vendorData.rating || 4.8,
        reviewCount: vendorData.clientCount || 250,
        address: `${vendorData.city || ""}, ${vendorData.state || ""}`,
        description: vendorData.description || "No description available",
        mission: vendorData.description || "To enhance beauty and wellness through personalized care and high-quality services.",
        images: vendorData.gallery && vendorData.gallery.length > 0 
          ? vendorData.gallery 
          : vendorData.profileImage 
            ? [vendorData.profileImage, ...defaultSalon.images.slice(1)] 
            : defaultSalon.images,
        services: vendorData.services?.length > 0 
          ? vendorData.services.map((service: any) => ({
              name: service.name || "",
              price: service.price || 0,
              duration: service.duration || 60,
              category: service.category?.name || "Other",
              image: "https://picsum.photos/seed/" + service.name?.toLowerCase().replace(/\s/g, '') + "/200/200"
            }))
          : defaultSalon.services,
        workingHours: vendorData.workingHours?.length > 0
          ? vendorData.workingHours.map((hours: any) => ({
              day: hours.day || "",
              hours: hours.hours || ""
            }))
          : defaultSalon.workingHours
      };
    }
    return defaultSalon;
  }, [vendorData]);

  const salonProducts = useMemo(() => {
    if (!productsData || !productsData.products) return [];
    return productsData.products.filter((p: any) => p.vendorId === id);
  }, [productsData, id]);
  
  const [mainImage, setMainImage] = useState(salon.images[0]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  
  useEffect(() => {
    if (salon.images.length > 0) {
      setMainImage(salon.images[0]);
    }
  }, [salon.images]);
  
  const handleBookNow = (service?: any) => {
    const query = service ? `?service=${encodeURIComponent(JSON.stringify(service))}` : '';
    console.log('Navigate to booking:', `/book/${id}${query}`);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setTimeout(() => {
      setVisibleTab(value);
    }, 50);
  };
  
  const filteredServices = useMemo(() => {
    return activeServiceTab === "All"
      ? salon.services
      : salon.services.filter((service: any) => service.category === activeServiceTab);
  }, [salon.services, activeServiceTab]);
  
  const openGalleryModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setGalleryModalOpen(true);
  };

interface Service {
    name: string;
    price: number;
    duration: number;
    category: string;
    image: string;
}

interface WorkingHours {
    day: string;
    hours: string;
}

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    hint: string;
    stock: number;
    rating: number;
}

interface StaffMember {
    name: string;
    role: string;
    image: string;
    hint: string;
}

interface Review {
    author: string;
    rating: number;
    date: string;
    text: string;
}

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  return (
    <PageContainer padding="none">
      <div className="container mx-auto px-4">
        {/* Salon Name and Basic Info */}
        <section className="py-8 border-b">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-5xl font-bold font-headline mb-4">
                {salon.name}
              </h1>
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
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </section>

        {/* Compact Bento Grid Hero Gallery */}
        <section className="py-6">
          <div className="grid grid-cols-6 grid-rows-2 gap-2 h-40 md:h-64 lg:h-96">
            <div
              className="col-span-4 md:col-span-3 row-span-2 rounded-md overflow-hidden group cursor-pointer"
              onClick={() => openGalleryModal(salon.images[0])}
            >
              <Image
                src={salon.images[0]}
                alt={salon.name}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="luxury salon interior main view"
              />
            </div>
            <div
              className="col-span-2 md:col-span-1 row-span-1 rounded-md overflow-hidden group cursor-pointer"
              onClick={() => openGalleryModal(salon.images[1])}
            >
              <Image
                src={salon.images[1]}
                alt={`${salon.name} view 2`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon detail photo"
              />
            </div>
            <div
              className="hidden md:block col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative"
              onClick={() => openGalleryModal(salon.images[2])}
            >
              <Image
                src={salon.images[2]}
                alt={`${salon.name} view 3`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon treatment room"
              />
            </div>
             <div
              className="col-span-2 md:col-span-1 row-span-1 rounded-md overflow-hidden group cursor-pointer"
              onClick={() => openGalleryModal(salon.images[3])}
            >
              <Image
                src={salon.images[3]}
                alt={`${salon.name} view 4`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon product display"
              />
            </div>
            <div
              className="hidden md:block col-span-2 row-span-1 rounded-md overflow-hidden group cursor-pointer relative"
              onClick={() => openGalleryModal(salon.images[0])}
            >
              <Image
                src={salon.images[0]}
                alt={`${salon.name} view 1`}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon reception area"
              />
              {salon.images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-semibold text-sm">
                    +{salon.images.length - 4} more
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-12 lg:items-start py-8">
          {/* Left Scrolling Column */}
          <div className="lg:col-span-2 space-y-16">
            {/* About Section */}
            <section id="about">
               
                    <h2 className="text-4xl font-bold mb-2">About {salon.name}</h2>
                     <p className="text-muted-foreground mb-6">
                        Discover the story and values behind our brand.
                     </p>
               
                  <div className="space-y-8">
                     <p className="text-muted-foreground leading-relaxed">
                        {salon.mission}
                     </p>
                     <div className="grid sm:grid-cols-4 gap-6 text-center">
                        {salon.stats.map((stat) => (
                           <div key={stat.label} className="bg-secondary/50 p-4 rounded-lg">
                              <p className="text-4xl font-bold text-primary">{stat.value}</p>
                              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                           </div>
                        ))}
                     </div>
                  </div>
            </section>
            
            <section id="offers">
              <h2 className="text-4xl font-bold mb-2">Offers Available</h2>
              <p className="text-muted-foreground mb-6">
                Take advantage of our special offers and packages.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {salon.offers.map((offer, index) => {
                  const Icon = offer.icon;
                  return (
                    <Card
                      key={index}
                      className="group flex flex-col p-6 text-center border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-background to-primary/5"
                    >
                      <div className="mx-auto bg-gradient-to-br from-primary/10 to-primary/20 text-primary p-4 rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex-grow mb-4">
                        {offer.description}
                      </p>
                      <Button
                        variant="link"
                        className="text-primary group-hover:underline"
                      >
                        Claim Offer <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </section>
            
            <section id="services">
              <h2 className="text-4xl font-bold mb-2">Services Offered</h2>
              <p className="text-muted-foreground mb-6">
                Explore our wide range of professional services.
              </p>
              <Card>
                <CardHeader>
                    <Tabs
                        value={activeServiceTab}
                        onValueChange={setActiveServiceTab}
                        className="w-full"
                    >
                        <div className="relative">
                            <TabsList className="relative flex w-full overflow-x-auto overflow-y-hidden no-scrollbar rounded-lg p-1">
                                {serviceCategories.map((cat) => (
                                <TabsTrigger
                                    key={cat}
                                    value={cat}
                                    className="flex-shrink-0 text-xs sm:text-sm"
                                >
                                    {cat}
                                </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {filteredServices.map((service: any) => (
                    <div
                      key={service.name}
                      className="flex justify-between items-center p-4 border rounded-md hover:bg-secondary/50"
                    >
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{service.price.toFixed(2)}
                        </p>
                        <Button size="sm" variant="outline" className="mt-1" onClick={() => handleBookNow(service)}>
                          Book
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section id="products">
              <h2 className="text-4xl font-bold mb-2">
                Products We Use & Sell
              </h2>
              <p className="text-muted-foreground mb-6">
                High-quality products available for purchase.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {salonProducts.map((product: any) => (
                    <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow flex flex-col text-left">
                        <div className="relative aspect-square overflow-hidden rounded-md m-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="group-hover:scale-105 transition-transform duration-300 object-cover"
                            data-ai-hint={product.hint}
                          />
                           <Badge variant={product.stock > 0 ? "secondary" : "default"} className="absolute top-2 right-2 text-xs">
                              {product.stock > 0 ? `In Stock` : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                          <p className="text-xs font-bold text-primary mb-1">{product.brand}</p>
                          <h4 className="text-sm font-semibold flex-grow mb-2">{product.name}</h4>
                          <div className="flex justify-between items-center mt-auto">
                              <p className="font-bold text-primary">₹{product.price.toFixed(2)}</p>
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
              <h2 className="text-4xl font-bold mb-2">Meet Our Team</h2>
              <p className="text-muted-foreground mb-6">
                Our talented and experienced professionals.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {salon.staff.map((member) => (
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
              <h2 className="text-4xl font-bold mb-2">Reviews</h2>
              <p className="text-muted-foreground mb-6">
                What our clients are saying about us.
              </p>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{salon.rating}</div>
                    <div>
                      <StarRating rating={salon.rating} />
                      <p className="text-sm text-muted-foreground">
                        Based on {salon.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {salon.reviews.map((review, index) => (
                    <div key={index} className="border-t pt-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-primary">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {review.author}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        "{review.text}"
                      </p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Read All Reviews
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </div>

          {/* Right Sticky Column */}
          <div className="lg:sticky top-24 self-start space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>
                  Choose your service and book online.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full rounded-sm" onClick={() => handleBookNow()}>
                  Book Now
                </Button>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Instant confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {salon.workingHours.map((wh: WorkingHours) => (
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
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> +1 (234) 567-890
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> www.glowvitaelitespa.com
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
         {/* Nearby Salons Section - Outside 2-column layout */}
        <section id="nearby-salons" className="py-16">
          <div className="text-start mb-12">
            <h2 className="text-4xl font-bold mb-4">Nearby Salons</h2>
            <p className="text-muted-foreground text-lg">
              Explore other top-rated salons in the area.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-8xl mx-auto">
            {nearbySalons.map((salon, index) => {
              const IconComponent = salon.icon;
              return (
                <div
                  key={index}
                  className="group rounded-md bg-background/30 hover:bg-background/50 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg backdrop-blur-sm hover:-translate-y-1 overflow-hidden max-w-sm mx-auto"
                >
                  {/* Salon Image Header */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      src={salon.image}
                      alt={salon.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                      <span className="font-semibold text-white text-xs">
                        {salon.rating}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Specialty Badge */}
                    <div className="block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 w-fit">
                      {salon.specialty}
                    </div>

                    {/* Salon Title & Location */}
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300 text-left">
                      {salon.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{salon.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-xs mb-3 text-left">
                      {salon.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {salon.clients} clients
                        </span>
                      </div>
                      <div className="text-green-600 font-medium">
                        {salon.growth}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative aspect-video bg-black">
            <Image
              src={mainImage}
              alt="Gallery View"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex justify-center gap-2 p-4 bg-secondary">
            {salon.images.map((img: string, index: number) => (
              <button key={index} onClick={() => setMainImage(img)}>
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className={`rounded-md object-cover cursor-pointer border-2 transition-all ${mainImage === img ? "border-primary" : "border-transparent hover:border-primary/50"}`}
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
