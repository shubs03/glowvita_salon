
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, TrendingUp, X, Package, Shield, CheckCircle, Users, ArrowRight, ChevronLeft, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { PageContainer } from '@repo/ui/page-container';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Label } from '@repo/ui/label';
import { PlatformFor } from '@/components/landing';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/collapsible';
import { Slider } from '@repo/ui/slider';
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
  description: string;
  category: string;
}

const FilterSidebar = ({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  clearFilters,
}) => (
  <div className="space-y-6">
    {/* Category Filter */}
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        Category
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={cn(
              "w-full text-left text-sm p-2 rounded-md transition-colors",
              selectedCategory === category.id
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
    
    {/* Brand Filter */}
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-primary" />
        Brand
      </h3>
      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
        <SelectTrigger className="w-full rounded-md">
          <SelectValue placeholder="Select Brand" />
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

    {/* Price Range Filter */}
    <div>
      <h3 className="font-semibold mb-3">
        Price Range: <span className="font-bold text-primary">₹{priceRange[0]} - ₹{priceRange[1]}</span>
      </h3>
      <Slider
        defaultValue={priceRange}
        min={0}
        max={200}
        step={10}
        onValueChange={(value) => setPriceRange(value)}
      />
    </div>

    {/* Sort By Filter */}
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Sort By
      </h3>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-full rounded-md">
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

    {/* Clear Filters Button */}
    <div>
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  </div>
);


export default function AllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // New state for filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange([0, 200]);
    setSortBy('featured');
  };

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

  const getDefaultDescription = (productName: string) => {
    return `An exquisite ${productName.toLowerCase()} designed to enhance your natural beauty.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-48 bg-muted rounded-2xl"></div>
          <div className="flex gap-8">
            <div className="w-1/4 bg-card rounded-xl h-96"></div>
            <div className="w-3/4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl h-96"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageContainer padding="none">
      {/* 1. Hero Section */}
      <section className="py-20 text-center bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] animate-pulse-slow" />
        <div className="container mx-auto px-4 z-10 relative">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Marketplace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore a curated selection of premium beauty and wellness products from top-rated vendors.
          </p>
        </div>
      </section>

      {/* Categories Marquee */}
      <PlatformFor />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={cn("lg:w-1/4 xl:w-1/5 hidden lg:block transition-all duration-300", isSidebarOpen ? "lg:w-1/4 xl:w-1/5" : "lg:w-0 overflow-hidden")}>
             <div className="sticky top-24 space-y-8">
               <div className="flex justify-between items-center">
                 <h2 className="text-lg font-semibold">Filters</h2>
                 <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                   <X className="h-4 w-4" />
                 </Button>
               </div>
               <FilterSidebar 
                 categories={categories}
                 brands={brands}
                 selectedCategory={selectedCategory}
                 setSelectedCategory={setSelectedCategory}
                 selectedBrand={selectedBrand}
                 setSelectedBrand={setSelectedBrand}
                 priceRange={priceRange}
                 setPriceRange={setPriceRange}
                 sortBy={sortBy}
                 setSortBy={setSortBy}
                 clearFilters={clearFilters}
               />
             </div>
           </aside>
          
          <main className="flex-1">
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                variant="outline" 
                className="lg:hidden"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products, brands, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="hidden lg:flex"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
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
                <div className="flex items-center border rounded-md p-1 bg-muted">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Products Grid/List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
                <span className="text-muted-foreground text-lg ml-2">({filteredProducts.length})</span>
              </h2>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p>No products found matching your criteria.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-card rounded-lg p-4 shadow-sm border flex gap-4">
                       <div className="relative w-24 h-24 flex-shrink-0">
                         <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
                       </div>
                       <div className="flex-grow">
                         <div className="flex justify-between items-start">
                           <div>
                             <h3 className="text-lg font-semibold">{product.name}</h3>
                             <p className="text-xs text-muted-foreground">{product.vendorName}</p>
                           </div>
                           <p className="text-lg font-bold">₹{product.price.toFixed(2)}</p>
                         </div>
                         <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                        </div>
                         <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                         <div className="mt-2 flex gap-2">
                           <Button size="sm">Add to Cart</Button>
                           <Button variant="outline" size="sm">View Details</Button>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile Filter Modal */}
      <Dialog open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Filters</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterSidebar 
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              clearFilters={clearFilters}
            />
             <Button className="w-full mt-6" onClick={() => setIsMobileFilterOpen(false)}>Apply Filters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

```
- packages/ui/src/collapsible.tsx:
```tsx

"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```
- packages/ui/src/slider.tsx:
```tsx

"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./cn";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    {props.defaultValue && props.defaultValue.length > 1 && (
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
```