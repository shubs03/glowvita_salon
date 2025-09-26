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
  images: string[];
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
  { id: '1', name: 'Aura Revitalizing Serum', price: 68.00, image: 'https://picsum.photos/seed/product1/800/600', images: ['https://picsum.photos/seed/product1/800/600', 'https://picsum.photos/seed/product1-2/800/600'], hint: 'skincare serum', rating: 4.9, reviewCount: 125, vendorName: 'Aura Cosmetics', isNew: true, category: 'Skincare', description: 'A potent serum to restore youthful glow.' },
  { id: '2', name: 'Chroma Hydrating Balm', price: 24.00, image: 'https://picsum.photos/seed/product2/400/400', images: ['https://picsum.photos/seed/product2/400/400', 'https://picsum.photos/seed/product2-2/400/400'], hint: 'cosmetic balm', rating: 4.7, reviewCount: 88, vendorName: 'Chroma Beauty', category: 'Makeup', description: 'Hydrating lip balm with a hint of color.' },
  { id: '3', name: 'Terra Exfoliating Scrub', price: 48.00, image: 'https://picsum.photos/seed/product3/400/400', images: ['https://picsum.photos/seed/product3/400/400', 'https://picsum.photos/seed/product3-2/400/400'], hint: 'exfoliating scrub', rating: 4.8, reviewCount: 150, vendorName: 'Earthly Essentials', category: 'Skincare', description: 'Gentle scrub for a fresh and clean feel.' },
  { id: '4', name: 'Luxe Hair Oil', price: 55.00, image: 'https://picsum.photos/seed/product4/400/400', images: ['https://picsum.photos/seed/product4/400/400', 'https://picsum.photos/seed/product4-2/400/400'], hint: 'hair oil bottle', rating: 4.9, reviewCount: 210, vendorName: 'Luxe Haircare', isNew: true, category: 'Haircare', description: 'Nourishing oil for shiny, healthy hair.' },
  { id: '5', name: 'Matte Finish Foundation', price: 75.00, image: 'https://picsum.photos/seed/product5/400/400', images: ['https://picsum.photos/seed/product5/400/400', 'https://picsum.photos/seed/product5-2/400/400'], hint: 'foundation bottle', rating: 4.6, reviewCount: 302, vendorName: 'Chroma Beauty', category: 'Makeup', description: 'Long-lasting foundation with a matte finish.' },
  { id: '6', name: 'Deep Cleanse Shampoo', price: 32.00, image: 'https://picsum.photos/seed/product6/400/400', images: ['https://picsum.photos/seed/product6/400/400', 'https://picsum.photos/seed/product6-2/400/400'], hint: 'shampoo bottle', rating: 4.7, reviewCount: 180, vendorName: 'Luxe Haircare', category: 'Haircare', description: 'A shampoo that cleanses deeply without stripping natural oils.' },
  { id: '7', name: 'Rejuvenating Night Cream', price: 95.00, image: 'https://picsum.photos/seed/product7/400/400', images: ['https://picsum.photos/seed/product7/400/400', 'https://picsum.photos/seed/product7-2/400/400'], hint: 'night cream jar', rating: 4.9, reviewCount: 450, vendorName: 'Aura Cosmetics', category: 'Skincare', isNew: true, description: 'Wake up to refreshed and rejuvenated skin.' },
  { id: '8', name: 'Vibrant Eyeshadow Palette', price: 62.00, image: 'https://picsum.photos/seed/product8/400/400', images: ['https://picsum.photos/seed/product8/400/400', 'https://picsum.photos/seed/product8-2/400/400'], hint: 'eyeshadow palette', rating: 4.8, reviewCount: 280, vendorName: 'Chroma Beauty', category: 'Makeup', description: 'A palette with vibrant colors for every occasion.' },
  { id: '9', name: 'Herbal Hair Mask', price: 42.00, image: 'https://picsum.photos/seed/product9/400/400', images: ['https://picsum.photos/seed/product9/400/400', 'https://picsum.photos/seed/product9-2/400/400'], hint: 'hair mask jar', rating: 4.7, reviewCount: 190, vendorName: 'Earthly Essentials', category: 'Haircare', description: 'An herbal mask to strengthen and nourish your hair.' },
  { id: '10', name: 'Clay Face Mask', price: 38.00, image: 'https://picsum.photos/seed/product10/400/400', images: ['https://picsum.photos/seed/product10/400/400', 'https://picsum.photos/seed/product10-2/400/400'], hint: 'clay mask', rating: 4.8, reviewCount: 320, vendorName: 'Serenity Skincare', category: 'Skincare', description: 'A detoxifying clay mask for clear skin.' },
];

const mockCategories = [
    { id: 'all', name: 'All Categories' },
    { id: 'skincare', name: 'Skincare' },
    { id: 'makeup', name: 'Makeup' },
    { id: 'haircare', name: 'Haircare' }
];

const ProductHighlightCard = ({
  title,
  products,
  className,
  isLarge = false,
}: {
  title: string;
  products: Product[];
  className?: string;
  isLarge?: boolean;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlider = () => {
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000 + Math.random() * 2000); // Random interval for variety
  };

  useEffect(() => {
    if (!isHovered) {
      startSlider();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, products.length]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
  };

  const product = products[currentImageIndex];
  if (!product) return null;

  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20',
        isLarge ? 'aspect-[4/3]' : 'aspect-square',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={product.image}
        alt={product.name}
        layout="fill"
        className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
        data-ai-hint={product.hint}
      />
      {/* Details on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
        <p className="text-sm text-white/80 line-clamp-2 mb-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-white">₹{product.price.toFixed(2)}</p>
          <Button size="sm" className="bg-white text-black hover:bg-gray-200">
            View
          </Button>
        </div>
      </div>
      {/* Slider Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button size="icon" variant="ghost" className="bg-black/20 text-white hover:bg-black/50" onClick={prevImage}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="bg-black/20 text-white hover:bg-black/50" onClick={nextImage}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
       {/* Static Title When Not Hovered */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    </div>
  );
};


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

  const bentoGridProducts = useMemo(() => ({
    newArrivals: products.filter(p => p.isNew).slice(0, 4),
    topRated: products.sort((a, b) => b.rating - a.rating).slice(0, 2),
    bestSellers: products.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 2),
  }), [products]);
  
  if (loading) {
    // Skeleton loading state
  }

  if (errorState) {
    // Error state
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {bentoGridProducts.newArrivals.length > 0 && (
                  <ProductHighlightCard title="New Arrivals" products={bentoGridProducts.newArrivals} className="lg:col-span-3 lg:row-span-2" isLarge={true} />
                )}
                {bentoGridProducts.topRated.length > 0 && (
                  <ProductHighlightCard title="Top Rated" products={bentoGridProducts.topRated} className="lg:col-span-2" />
                )}
                {bentoGridProducts.bestSellers.length > 0 && (
                  <ProductHighlightCard title="Best Sellers" products={bentoGridProducts.bestSellers} className="lg:col-span-2" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="group">
                      <ProductCard 
                        name={product.name}
                        description={product.description || product.hint}
                        price={product.price}
                        image={product.image}
                        hint={product.hint}
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        vendorName={product.vendorName}
                        isNew={product.isNew}
                      />
                    </div>
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
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-lg border border-border/50 rounded-full shadow-2xl p-2 transition-all duration-300 group-hover:px-6">
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
    
