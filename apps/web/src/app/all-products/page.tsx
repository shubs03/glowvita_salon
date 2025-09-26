"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, TrendingUp, X, Package, Shield, CheckCircle, Users, ArrowRight, ChevronLeft } from 'lucide-react';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { PageContainer } from '@repo/ui/page-container';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Label } from '@repo/ui/label';

// Product type definition
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  isNew?: boolean;
  description: string;
  category: string;
}

const PlatformForCard = ({
  title,
  imageUrl,
  hint,
}: {
  title: string;
  imageUrl: string;
  hint: string;
}) => (
  <a
    className="relative inline-block h-48 w-72 md:h-56 md:w-80 shrink-0 overflow-hidden rounded-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/25 group border-2 border-border/30 hover:border-primary/50 hover-lift bg-gradient-to-br from-background to-primary/5"
    href="#"
  >
    <img
      className="size-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter group-hover:brightness-110"
      src={imageUrl}
      alt={title}
      width={320}
      height={224}
    />
    <div className="absolute inset-0 z-10 flex w-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 md:p-6">
      <h3 className="text-base md:text-lg font-bold leading-tight text-white group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
    </div>
  </a>
);

const PlatformForMarquee = ({ rtl = false }: { rtl?: boolean }) => {
  const items = [
    { title: "Hair Salons", imageUrl: "https://placehold.co/320x224/6366f1/ffffff?text=Hair", hint: "modern hair salon interior" },
    { title: "Nail Studios", imageUrl: "https://placehold.co/320x224/ec4899/ffffff?text=Nails", hint: "elegant nail salon" },
    { title: "Barber Shops", imageUrl: "https://placehold.co/320x224/475569/ffffff?text=Barber", hint: "contemporary barber shop" },
    { title: "Beauty Spas", imageUrl: "https://placehold.co/320x224/10b981/ffffff?text=Spa", hint: "luxury spa treatment room" },
    { title: "Wellness Centers", imageUrl: "https://placehold.co/320x224/f97316/ffffff?text=Wellness", hint: "modern wellness center" },
    { title: "Bridal Boutiques", imageUrl: "https://placehold.co/320x224/8b5cf6/ffffff?text=Bridal", hint: "bridal makeup studio" },
  ];
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`pt-5 flex w-fit items-start space-x-6 md:space-x-8 ${rtl ? "animate-slide-rtl" : "animate-slide"} hover:[animation-play-state:paused]`}
      >
        {[...items, ...items].map((item, index) => (
          <PlatformForCard
            key={`${item.title}-${index}`}
            title={item.title}
            imageUrl={item.imageUrl}
            hint={item.hint}
          />
        ))}
      </div>
    </div>
  );
};

// New Component for the Highlight Card with Carousel
const ProductHighlightCard = ({ 
  title, 
  products, 
  className = "", 
  isLarge = false 
}: {
  title: string;
  products: Product[];
  className?: string;
  isLarge?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (!isHovered) {
      timeoutRef.current = setTimeout(
        () => setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length),
        3000
      );
    }
    return () => resetTimeout();
  }, [currentIndex, isHovered, products.length]);

  const nextProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prevProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
  };
  
  if (!products || products.length === 0) return null;

  return (
    <div 
      className={`relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/10 border border-border/20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
          {products.map((product: Product, index: number) => (
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h4 className={`font-bold ${isLarge ? 'text-xl' : 'text-lg'}`}>{products[currentIndex].name}</h4>
            <p className="text-sm">{products[currentIndex].vendorName}</p>
            <div className="flex justify-between items-center mt-2">
              <p className={`font-bold ${isLarge ? 'text-lg' : 'text-base'}`}>₹{products[currentIndex].price.toFixed(2)}</p>
              <Button size="sm" variant="secondary" className="rounded-full">View</Button>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="icon" variant="ghost" className="bg-white/20 text-white rounded-full h-8 w-8 hover:bg-white/30 backdrop-blur-sm" onClick={prevProduct}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="bg-white/20 text-white rounded-full h-8 w-8 hover:bg-white/30 backdrop-blur-sm" onClick={nextProduct}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // New state for filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Mock categories and brands
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'skincare', name: 'Skincare' },
    { id: 'cosmetics', name: 'Cosmetics' },
    { id: 'bodycare', name: 'Body Care' },
    { id: 'facecare', name: 'Face Care' },
    { id: 'fragrance', name: 'Fragrance' },
  ];
  const brands = [
    { id: 'all', name: 'All Brands' },
    { id: 'aura', name: 'Aura Cosmetics' },
    { id: 'chroma', name: 'Chroma Beauty' },
    { id: 'serenity', name: 'Serenity Skincare' },
    { id: 'earthly', name: 'Earthly Essentials' },
  ];

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Radiant Glow Serum',
      price: 45.99,
      image: 'https://picsum.photos/id/1027/300/300',
      hint: 'Brightening vitamin C serum',
      rating: 4.8,
      reviewCount: 324,
      vendorName: 'Aura Cosmetics',
      isNew: true,
      description: 'A powerful vitamin C serum that brightens and evens skin tone',
      category: 'skincare'
    },
    {
      id: '2',
      name: 'Luxury Face Cream',
      price: 78.50,
      image: 'https://picsum.photos/id/1028/300/300',
      hint: 'Anti-aging moisturizer',
      rating: 4.9,
      reviewCount: 567,
      vendorName: 'Serenity Skincare',
      description: 'Rich anti-aging cream with peptides and hyaluronic acid',
      category: 'skincare'
    },
    {
      id: '3',
      name: 'Matte Lipstick Set',
      price: 32.00,
      image: 'https://picsum.photos/id/1029/300/300',
      hint: 'Long-lasting matte lipsticks',
      rating: 4.7,
      reviewCount: 892,
      vendorName: 'Chroma Beauty',
      isNew: true,
      description: 'Set of 6 long-lasting matte lipsticks in trending shades',
      category: 'cosmetics'
    },
    {
      id: '4',
      name: 'Gentle Cleansing Oil',
      price: 28.75,
      image: 'https://picsum.photos/id/1030/300/300',
      hint: 'Removes makeup effortlessly',
      rating: 4.6,
      reviewCount: 445,
      vendorName: 'Earthly Essentials',
      description: 'Natural cleansing oil that removes makeup and impurities',
      category: 'facecare'
    },
    {
      id: '5',
      name: 'Body Butter Trio',
      price: 56.99,
      image: 'https://picsum.photos/id/1031/300/300',
      hint: 'Nourishing body care set',
      rating: 4.8,
      reviewCount: 234,
      vendorName: 'Earthly Essentials',
      description: 'Set of 3 rich body butters with natural ingredients',
      category: 'bodycare'
    },
    {
      id: '6',
      name: 'Eye Shadow Palette',
      price: 42.25,
      image: 'https://picsum.photos/id/1032/300/300',
      hint: '12 versatile shades',
      rating: 4.9,
      reviewCount: 678,
      vendorName: 'Chroma Beauty',
      description: 'Professional eyeshadow palette with 12 blendable shades',
      category: 'cosmetics'
    },
    {
      id: '7',
      name: 'Hydrating Toner',
      price: 24.50,
      image: 'https://picsum.photos/id/1033/300/300',
      hint: 'Balances and hydrates',
      rating: 4.5,
      reviewCount: 321,
      vendorName: 'Serenity Skincare',
      description: 'Alcohol-free toner that balances and hydrates skin',
      category: 'skincare'
    },
    {
      id: '8',
      name: 'Floral Perfume',
      price: 89.99,
      image: 'https://picsum.photos/id/1034/300/300',
      hint: 'Elegant floral fragrance',
      rating: 4.7,
      reviewCount: 156,
      vendorName: 'Aura Cosmetics',
      description: 'Sophisticated floral fragrance with notes of jasmine and rose',
      category: 'fragrance'
    },
    {
      id: '9',
      name: 'Exfoliating Scrub',
      price: 19.95,
      image: 'https://picsum.photos/id/1035/300/300',
      hint: 'Gentle face scrub',
      rating: 4.4,
      reviewCount: 289,
      vendorName: 'Earthly Essentials',
      description: 'Natural exfoliating scrub with bamboo particles',
      category: 'facecare'
    },
    {
      id: '10',
      name: 'Foundation Stick',
      price: 38.00,
      image: 'https://picsum.photos/id/1036/300/300',
      hint: 'Full coverage foundation',
      rating: 4.6,
      reviewCount: 445,
      vendorName: 'Chroma Beauty',
      description: 'Buildable full-coverage foundation stick',
      category: 'cosmetics'
    },
    {
      id: '11',
      name: 'Night Repair Serum',
      price: 65.00,
      image: 'https://picsum.photos/id/1037/300/300',
      hint: 'Overnight skin renewal',
      rating: 4.8,
      reviewCount: 512,
      vendorName: 'Serenity Skincare',
      isNew: true,
      description: 'Advanced night serum with retinol and peptides',
      category: 'skincare'
    },
    {
      id: '12',
      name: 'Lip Gloss Collection',
      price: 25.50,
      image: 'https://picsum.photos/id/1038/300/300',
      hint: 'Shimmery lip glosses',
      rating: 4.3,
      reviewCount: 178,
      vendorName: 'Aura Cosmetics',
      description: 'Set of 4 high-shine lip glosses with mirror finish',
      category: 'cosmetics'
    }
  ];

  // Initialize products with mock data
  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply brand filter
    if (selectedBrand !== 'all') {
      const brandMap: { [key: string]: string } = {
        'aura': 'Aura Cosmetics',
        'chroma': 'Chroma Beauty',
        'serenity': 'Serenity Skincare',
        'earthly': 'Earthly Essentials'
      };
      result = result.filter(product => product.vendorName === brandMap[selectedBrand]);
    }
    
    // Apply price range filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result = result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-low':
        result = result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        // Keep original order for featured
        break;
    }
    
    setFilteredProducts(result);
  }, [searchTerm, products, selectedCategory, selectedBrand, priceRange, sortBy]);
  
  const bentoGridProducts = {
    newArrivals: products.slice(0, 3),
    topRated: products.slice(3, 6),
    bestSellers: products.slice(6, 9)
  };

  return (
    <PageContainer padding="none">
      {/* 1. Hero Section */}
      <section className="py-20 md:py-28 text-center bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] animate-pulse-slow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50 animate-float-delayed" />
        
        <div className="container mx-auto px-4 z-10 relative">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Our Marketplace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore a curated selection of premium beauty and wellness products from top-rated vendors.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mb-12">
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors">Skincare</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors">Haircare</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors">Cosmetics</Badge>
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors">Body Care</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">1,000+</p>
              <p className="text-sm text-muted-foreground">Verified Vendors</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">50,000+</p>
              <p className="text-sm text-muted-foreground">Products Listed</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">4.9/5</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">Secure</p>
              <p className="text-sm text-muted-foreground">Shopping Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <main className="lg:col-span-12">
            {/* 3. Bento Grid Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8">Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bentoGridProducts.newArrivals.length > 0 && (
                    <ProductHighlightCard 
                      title="New Arrivals"
                      products={bentoGridProducts.newArrivals}
                      className="md:col-span-2 md:row-span-2"
                      isLarge={true}
                    />
                  )}
                  {bentoGridProducts.topRated.length > 0 && (
                    <ProductHighlightCard 
                      title="Top Rated"
                      products={bentoGridProducts.topRated}
                    />
                  )}
                  {bentoGridProducts.bestSellers.length > 0 && (
                    <ProductHighlightCard 
                      title="Best Sellers"
                      products={bentoGridProducts.bestSellers}
                    />
                  )}
                  {bentoGridProducts.bestSellers.length > 0 && (
                    <ProductHighlightCard 
                      title="Best Sellers"
                      products={bentoGridProducts.bestSellers}
                    />
                  )}
                  {bentoGridProducts.bestSellers.length > 0 && (
                    <ProductHighlightCard 
                      title="Best Sellers"
                      products={bentoGridProducts.bestSellers}
                    />
                  )}
                </div>
            </section>

            {/* 4. Categories Marquee */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
                <PlatformForMarquee />
            </section>

            {/* 5. Product Grid */}
            <section>
              <h2 className="text-3xl font-bold text-center mb-8">All Products</h2>
              
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products, brands, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Results count */}
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
              
              {loading ? (
                <p>Loading products...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </section>

            {/* 6. Why Shop With Us Section */}
            <section className="mt-20 py-16 bg-secondary/50 rounded-lg">
                <h2 className="text-3xl font-bold text-center mb-8">Why Shop With Us?</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <h3 className="font-semibold text-lg">Curated Selection</h3>
                        <p className="text-muted-foreground">Only the best products from trusted vendors.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Secure Shopping</h3>
                        <p className="text-muted-foreground">Your data and payments are always safe.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Fast Shipping</h3>
                        <p className="text-muted-foreground">Get your favorite products delivered quickly.</p>
                    </div>
                </div>
            </section>
            
            {/* 7. Featured Brand Section */}
            <section className="mt-20">
                <h2 className="text-3xl font-bold text-center mb-8">Featured Brand: Aura Cosmetics</h2>
                <div className="grid md:grid-cols-2 items-center gap-8">
                    <p className="text-muted-foreground text-lg leading-relaxed">Aura Cosmetics is dedicated to creating high-performance, cruelty-free makeup that empowers you to express your unique beauty. Discover their best-selling products loved by professionals and enthusiasts alike.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg overflow-hidden aspect-square"><img src="https://picsum.photos/id/1027/200/200" alt="Aura Product 1" className="w-full h-full object-cover" /></div>
                        <div className="rounded-lg overflow-hidden aspect-square"><img src="https://picsum.photos/id/1028/200/200" alt="Aura Product 2" className="w-full h-full object-cover" /></div>
                    </div>
                </div>
            </section>
            
            {/* 8. Customer Testimonials */}
            <section className="mt-20">
              <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <blockquote className="p-6 bg-secondary/50 rounded-lg">"Amazing quality and fast delivery. Will definitely shop again!" - Sarah L.</blockquote>
                <blockquote className="p-6 bg-secondary/50 rounded-lg">"Found my new favorite serum here. The selection is fantastic." - Mark T.</blockquote>
                <blockquote className="p-6 bg-secondary/50 rounded-lg">"A great marketplace for discovering new beauty brands." - Emily C.</blockquote>
              </div>
            </section>
            
            {/* 9. Shopping Guide */}
            <section className="mt-20">
              <h2 className="text-3xl font-bold text-center mb-8">Your Guide to Better Shopping</h2>
              <p className="text-center max-w-2xl mx-auto text-muted-foreground">Use our filters to narrow down your search by brand, price, and category. Read reviews from other customers to make informed decisions and find the perfect products for your needs.</p>
            </section>
            
            {/* 10. Call to Action */}
            <section className="mt-20 text-center py-16 bg-primary text-primary-foreground rounded-lg">
                <h2 className="text-3xl font-bold">Ready to Elevate Your Beauty Routine?</h2>
                <p className="mt-2 mb-6">Join our community and get access to exclusive deals and new arrivals.</p>
                <Button variant="secondary" size="lg">Sign Up Now</Button>
            </section>

          </main>
        </div>
      </div>
      
      {/* Sticky Filter Pill */}
      <div 
        className="group fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-lg border border-border/50 rounded-full shadow-2xl p-2 transition-all duration-300 group-hover:px-6">
          {/* Default Visible Pill */}
          <div className="flex items-center gap-2 px-3 py-1 cursor-pointer">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Filters & Sorting</span>
          </div>
          
          {/* Expanded Content */}
          <div className="flex items-center gap-4 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
            <Separator orientation="vertical" className="h-6" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 rounded-full border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-40 rounded-full border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 rounded-full border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// Separator Component for local use
const Separator = ({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical', className?: string }) => (
  <div className={`bg-border ${orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'} ${className}`} />
);
