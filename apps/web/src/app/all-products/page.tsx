
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, TrendingUp, X, Package, Shield, CheckCircle } from 'lucide-react';
import { PageContainer } from '@repo/ui/page-container';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Label } from '@repo/ui/label';
import { NewProductCard } from '@/components/landing/NewProductCard';

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
  salePrice?: number;
}

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
  const [priceRange, setPriceRange] = useState([0, 200]);
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
      salePrice: 39.99,
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
  
  return (
    <PageContainer padding="none">
      {/* 1. Hero Section */}
      <section className="py-20 md:py-28 text-center bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] animate-pulse-slow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50 animate-float-delayed" />
        
        <div className="container mx-auto px-4 z-10 relative">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
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
          {/* Filters Sidebar (Left) */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-8">
               <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Brand Filter */}
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            {/* 5. Product Grid */}
            <section>
              {/* Search Bar - New Design */}
              <div className="mb-8 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/20 rounded-2xl flex flex-col sm:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 rounded-lg w-full bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    <Grid className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    <List className="h-5 w-5" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <NewProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </section>

            {/* Why Shop With Us Section - Redesigned */}
            <section className="mt-20 py-16 bg-secondary/50 rounded-2xl">
              <div className="text-center mb-12 px-4">
                <h2 className="text-3xl font-bold font-headline mb-4">The GlowVita Advantage</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Experience a shopping journey that combines quality, trust, and convenience, designed for beauty lovers like you.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 px-8">
                <div className="text-center p-6 bg-background rounded-xl shadow-md border border-border/20 transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Curated Quality</h3>
                  <p className="text-sm text-muted-foreground">Every product is handpicked and verified by beauty experts to ensure top-tier quality and performance.</p>
                </div>
                <div className="text-center p-6 bg-background rounded-xl shadow-md border border-border/20 transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Secure & Seamless</h3>
                  <p className="text-sm text-muted-foreground">Your transactions are protected with advanced security, ensuring a safe and smooth checkout experience.</p>
                </div>
                <div className="text-center p-6 bg-background rounded-xl shadow-md border border-border/20 transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                    <Truck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Swift Delivery</h3>
                  <p className="text-sm text-muted-foreground">Enjoy fast and reliable shipping, so your favorite beauty essentials arrive at your doorstep in no time.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}

// Separator Component for local use
const Separator = ({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical', className?: string }) => (
  <div className={`bg-border ${orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'} ${className}`} />
);

    