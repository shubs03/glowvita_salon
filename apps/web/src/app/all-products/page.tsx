
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, TrendingUp, X, Package, Shield, CheckCircle, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { PageContainer } from '@repo/ui/page-container';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Label } from '@repo/ui/label';
import { Skeleton } from '@repo/ui/skeleton';
import Image from 'next/image';
import { cn } from '@repo/ui/cn';

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

// MOCK DATA
const mockProducts: Product[] = [
  { id: '1', name: 'Aura Revitalizing Serum', price: 68.00, image: 'https://picsum.photos/seed/product1/800/600', hint: 'skincare serum', rating: 4.9, reviewCount: 125, vendorName: 'Aura Cosmetics', isNew: true, category: 'Skincare', description: 'A potent serum to restore youthful glow.' },
  { id: '2', name: 'Chroma Hydrating Balm', price: 24.00, image: 'https://picsum.photos/seed/product2/400/400', hint: 'cosmetic balm', rating: 4.7, reviewCount: 88, vendorName: 'Chroma Beauty', category: 'Makeup', description: 'Hydrating lip balm with a hint of color.' },
  { id: '3', name: 'Terra Exfoliating Scrub', price: 48.00, image: 'https://picsum.photos/seed/product3/400/400', hint: 'exfoliating scrub', rating: 4.8, reviewCount: 150, vendorName: 'Earthly Essentials', category: 'Skincare', description: 'Gentle scrub for a fresh and clean feel.' },
  { id: '4', name: 'Luxe Hair Oil', price: 55.00, image: 'https://picsum.photos/seed/product4/400/400', hint: 'hair oil bottle', rating: 4.9, reviewCount: 210, vendorName: 'Luxe Haircare', isNew: true, category: 'Haircare', description: 'Nourishing oil for shiny, healthy hair.' },
  { id: '5', name: 'Matte Finish Foundation', price: 75.00, image: 'https://picsum.photos/seed/product5/400/400', hint: 'foundation bottle', rating: 4.6, reviewCount: 302, vendorName: 'Chroma Beauty', category: 'Makeup', description: 'Long-lasting foundation with a matte finish.' },
  { id: '6', name: 'Deep Cleanse Shampoo', price: 32.00, image: 'https://picsum.photos/seed/product6/400/400', hint: 'shampoo bottle', rating: 4.7, reviewCount: 180, vendorName: 'Luxe Haircare', category: 'Haircare', description: 'A shampoo that cleanses deeply without stripping natural oils.' },
  { id: '7', name: 'Rejuvenating Night Cream', price: 95.00, image: 'https://picsum.photos/seed/product7/400/400', hint: 'night cream jar', rating: 4.9, reviewCount: 450, vendorName: 'Aura Cosmetics', category: 'Skincare', isNew: true, description: 'Wake up to refreshed and rejuvenated skin.' },
  { id: '8', name: 'Vibrant Eyeshadow Palette', price: 62.00, image: 'https://picsum.photos/seed/product8/400/400', hint: 'eyeshadow palette', rating: 4.8, reviewCount: 280, vendorName: 'Chroma Beauty', category: 'Makeup', description: 'A palette with vibrant colors for every occasion.' },
  { id: '9', name: 'Herbal Hair Mask', price: 42.00, image: 'https://picsum.photos/seed/product9/400/400', hint: 'hair mask jar', rating: 4.7, reviewCount: 190, vendorName: 'Earthly Essentials', category: 'Haircare', description: 'An herbal mask to strengthen and nourish your hair.' },
  { id: '10', name: 'Clay Face Mask', price: 38.00, image: 'https://picsum.photos/seed/product10/400/400', hint: 'clay mask', rating: 4.8, reviewCount: 320, vendorName: 'Serenity Skincare', category: 'Skincare', description: 'A detoxifying clay mask for clear skin.' },
];

const mockCategories = [
    { id: 'all', name: 'All Categories' },
    { id: 'skincare', name: 'Skincare' },
    { id: 'makeup', name: 'Makeup' },
    { id: 'haircare', name: 'Haircare' }
];

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(mockCategories);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
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

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

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
  
  useEffect(() => {
    let result = [...products];
    
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory
      );
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);
  
  const brands = useMemo(() => [
    { id: 'all', name: 'All Brands' },
    ...Array.from(new Set(products.map(p => p.vendorName))).map((brand, i) => ({ id: brand.toLowerCase(), name: brand }))
  ], [products]);
  
  const renderCarouselIndicators = () => {
    if (products.length === 0) return null;
    const totalIndicators = Math.min(6, products.length);
    const indicators = [];
    for (let i = 0; i < totalIndicators; i++) {
      indicators.push(
        <button
          key={i}
          className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
            currentSlide === i ? 'bg-primary scale-125' : 'bg-muted'
          }`}
          onClick={() => {
            if (carouselRef.current) {
              carouselRef.current.scrollTo({
                left: i * 300,
                behavior: 'smooth'
              });
            }
          }}
          aria-label={`Go to slide ${i + 1}`}
        />
      );
    }
    return <div className="flex justify-center mt-6">{indicators}</div>;
  };

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
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
            Premium Beauty Products
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover our curated collection of high-quality beauty products from top vendors worldwide. 
            Elevate your beauty routine with our premium selection.
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px] md:h-[500px] lg:h-[600px]">
                  {/* Large Image - Left */}
                  <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden group relative">
                    {mockProducts.length > 0 && (
                        <>
                        <Image
                            src={mockProducts[0].image}
                            alt={mockProducts[0].name}
                            layout="fill"
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            data-ai-hint={mockProducts[0].hint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl font-bold">{mockProducts[0].name}</h3>
                            <p className="mt-1 text-lg">{mockProducts[0].description}</p>
                        </div>
                        </>
                    )}
                  </div>

                  {/* 4 Small Images - Right Column */}
                  <div className="grid grid-cols-2 grid-rows-2 lg:grid-cols-1 lg:grid-rows-4 gap-4 h-full">
                    {mockProducts.slice(1, 5).map((product, index) => (
                      <div key={index} className="h-full rounded-2xl overflow-hidden group relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          layout="fill"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          data-ai-hint={product.hint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="font-semibold">{product.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
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

const Separator = ({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical', className?: string }) => (
  <div className={`bg-border ${orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'} ${className}`} />
);
