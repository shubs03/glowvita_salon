
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, TrendingUp, X, Package, Shield, CheckCircle, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { PageContainer } from '@repo/ui/page-container';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Label } from '@repo/ui/label';
import { useGetAllVendorProductsQuery, useGetAdminProductCategoriesQuery } from '@repo/store/services/api';

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
  description?: string;
  category?: string;
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
const ProductHighlightCard = ({ title, products, className, isLarge = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

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
      className={`relative rounded-2xl p-4 flex flex-col justify-between overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/10 border border-border/20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h3 className={`font-bold mb-3 ${isLarge ? 'text-xl' : 'text-lg'}`}>{title}</h3>
        <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
          {products.map((product, index) => (
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h4 className={`font-bold ${isLarge ? 'text-lg' : 'text-base'}`}>{products[currentIndex].name}</h4>
            <p className="text-xs">{products[currentIndex].vendorName}</p>
            <div className="flex justify-between items-center mt-2">
              <p className={`font-bold ${isLarge ? 'text-base' : 'text-sm'}`}>₹{products[currentIndex].price.toFixed(2)}</p>
              <Button size="sm" variant="secondary" className="rounded-full h-7 px-3 text-xs">View</Button>
            </div>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="icon" variant="ghost" className="bg-white/20 text-white rounded-full h-7 w-7 hover:bg-white/30 backdrop-blur-sm" onClick={prevProduct}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="bg-white/20 text-white rounded-full h-7 w-7 hover:bg-white/30 backdrop-blur-sm" onClick={nextProduct}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AllProductsPage() {
  const { data: apiProducts, isLoading: isProductsLoading, isError: isProductsError, error: productsApiError } = useGetAllVendorProductsQuery(undefined);
  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError, error: categoriesError } = useGetAdminProductCategoriesQuery(undefined);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([{ id: 'all', name: 'All Categories' }]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(isProductsLoading || isCategoriesLoading);
    if (isProductsError) {
      let errorMessage = 'Failed to fetch products';
      if (productsApiError) {
        if ('status' in productsApiError) {
          const fetchError = productsApiError as { status: number; data?: any };
          errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || 'Unknown error')}`;
        } else if ('message' in productsApiError) {
          errorMessage = productsApiError.message || errorMessage;
        }
      }
      setErrorState(errorMessage);
    } else if (productsData) {
      const transformedProducts = productsData.map((product: any) => ({
        id: product._id || product.id,
        name: product.productName || product.name || 'Unnamed Product',
        price: product.price || 0,
        image: product.productImage || product.image || '/placeholder-product.jpg',
        hint: product.categoryDescription || product.hint || '',
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || Math.floor(Math.random() * 100),
        vendorName: product.vendorId?.name || product.vendorName || 'Unknown Vendor',
        isNew: product.isNew || product.status === 'pending',
        description: product.description || '',
        category: product.category?.name || product.category || 'Uncategorized'
      }));
      
      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
    }

    if (isCategoriesError) {
      console.error('Error fetching categories:', categoriesError);
      setCategories([{ id: 'all', name: 'All Categories' }]);
    } else if (categoriesData && categoriesData.success) {
      const formattedCategories = categoriesData.data.map((category: any) => ({
        id: category._id || category.id,
        name: category.name
      }));
      setCategories([{ id: 'all', name: 'All Categories' }, ...formattedCategories]);
    }

  }, [productsData, categoriesData, isProductsLoading, isCategoriesLoading, isProductsError, isCategoriesError, productsApiError, categoriesError]);
  
  useEffect(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [searchTerm, products]);

  const bentoGridProducts = {
    newArrivals: products.slice(0, 3),
    topRated: products.slice(3, 6),
    bestSellers: products.slice(6, 9)
  };

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (isAutoPlaying && carouselRef.current) {
      autoPlayRef.current = setInterval(() => {
        if (carouselRef.current) {
          carouselRef.current.scrollLeft += 1;
          const slideIndex = Math.floor(carouselRef.current.scrollLeft / 300) % 6;
          setCurrentSlide(slideIndex);
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
            carouselRef.current.scrollLeft = 0;
          }
        }
      }, 30);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying]);
  
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-2xl mb-8"></div>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-card rounded-xl h-64 shadow-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
          <p className="text-muted-foreground mb-6">{errorState}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer padding="none">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">{products.length}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">{[...new Set(products.map(p => p.vendorName))].length}</p>
              <p className="text-sm text-muted-foreground">Vendors</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">4.9/5</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20">
              <p className="text-3xl font-bold text-primary">Secure</p>
              <p className="text-sm text-muted-foreground">Shopping</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <main className="lg:col-span-12">
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8">Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {bentoGridProducts.newArrivals.length > 0 && (
                    <ProductHighlightCard 
                      title="New Arrivals"
                      products={bentoGridProducts.newArrivals}
                      className="md:col-span-2 md:row-span-1"
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
                      title="Users Choice 2025"
                      products={bentoGridProducts.bestSellers}
                    />
                  )}
                </div>
            </section>
            
            <section>
              <h2 className="text-3xl font-bold text-center mb-8">All Products</h2>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl shadow-lg border border-border/50">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters to see more products</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setPriceRange([0, 200]);
                    }}
                    className="rounded-xl"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
      
      {/* Enhanced Sticky Filter Strip */}
      <div 
        className="group fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-lg border border-border/50 rounded-full shadow-2xl p-2 transition-all duration-300 hover:px-6">
          <div className="flex items-center gap-2 px-3 py-1 cursor-pointer">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Filters & Sorting</span>
          </div>
          
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

```
- packages/utils/types.d.ts:
```ts
declare module "@repo/utils/types" {
  // Define types here
  interface User {
    id: string;
    name: string;
    email: string;
  }
}
```
- README.md:
```md
# GlowVita Salon

Welcome to GlowVita Salon, a Next.js 15 monorepo project built with Turborepo. This repository contains a suite of applications designed to work together seamlessly.

## What's inside?

This Turborepo includes the following packages and applications:

### Apps
g 
- `web`: The main public-facing website.
- `crm`: A customer relationship management portal for vendors.
- `admin`: An internal administrative dashboard.

### Packages

- `ui`: A shared UI component library.
- `store`: Shared Redux Toolkit store, slices, and RTK Query APIs.
- `lib`: Shared utilities, constants, and database connection logic.
- `typescript-config`: Shared `tsconfig.json`s used throughout the monorepo.
- `eslint-config-custom`: Shared ESLint configurations.

### Architecture

- **Monorepo**: Turborepo for managing the multi-package/multi-app repository.
- **Framework**: Next.js 15 (App Router).
- **State Management**: Redux Toolkit with RTK Query.
- **Authentication**: JWT-based authentication with roles, using httpOnly cookies.
- **Database**: MongoDB with a shared connection utility.
- **Styling**: Tailwind CSS with a shared, configurable theme.

## Getting Started

To get started with this monorepo, you'll need to have Node.js, npm/yarn/pnpm, and a MongoDB instance available.

### 1. Install Dependencies

From the root of the project, run:

```bash
npm install
```

### 2. Set up Environment Variables

Each application in the `apps` directory requires its own `.env.local` file. You can copy the contents from `.env.local.example` in each app's directory and fill in the required values.

A single `.env` file at the root of the project can also be used to share environment variables across all apps during development.

**Required variables:**

- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secret key for signing JWTs.

### 3. Run Development Servers

To run all applications in development mode, execute the following command from the root directory:

```bash
npm run dev
```

This will start the development servers for `web`, `crm`, and `admin` concurrently.

- **Web App**: `http://localhost:3000`
- **CRM App**: `http://localhost:3001`
- **Admin App**: `http://localhost:3002`

## Building for Production

To build all applications for production, run:

```bash
npm run build
```
