"use client";

import { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Search, Filter, Grid, List, Star, Tag, TrendingUp, X } from 'lucide-react';
import { useGetAllVendorProductsQuery, useGetAdminProductCategoriesQuery } from '@repo/store/services/api'; // Added useGetAdminProductCategoriesQuery

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

// Mock brands
const brands = [
  { id: 'all', name: 'All Brands' },
  { id: 'aura', name: 'Aura Cosmetics' },
  { id: 'chroma', name: 'Chroma Beauty' },
  { id: 'serenity', name: 'Serenity Skincare' },
  { id: 'earthly', name: 'Earthly Essentials' },
];

export default function ProductsPage() {
  const { data: productsData, isLoading, isError, error: apiError } = useGetAllVendorProductsQuery(undefined);
  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError, error: categoriesError } = useGetAdminProductCategoriesQuery(undefined); // Added categories API hook
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([{ id: 'all', name: 'All Categories' }]); // State for categories
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null); // Renamed from error to errorState
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Add state for carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hover to pause autoplay
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Format categories from API response
  useEffect(() => {
    if (isCategoriesLoading) {
      // Keep default "All Categories" while loading
      setCategories([{ id: 'all', name: 'All Categories' }]);
    } else if (isCategoriesError) {
      console.error('Error fetching categories:', categoriesError);
      // Keep default "All Categories" on error
      setCategories([{ id: 'all', name: 'All Categories' }]);
    } else if (categoriesData && categoriesData.success) {
      // Transform API data to match component's expected structure
      const formattedCategories = categoriesData.data.map((category: any) => ({
        id: category._id || category.id,
        name: category.name
      }));
      
      // Add "All Categories" at the beginning
      setCategories([{ id: 'all', name: 'All Categories' }, ...formattedCategories]);
    }
  }, [categoriesData, isCategoriesLoading, isCategoriesError, categoriesError]);

  // Auto-scroll carousel with indicator update
  const startAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    
    if (isAutoPlaying && carouselRef.current) {
      autoPlayRef.current = setInterval(() => {
        if (carouselRef.current) {
          carouselRef.current.scrollLeft += 1;
          
          // Update indicator based on scroll position
          const slideIndex = Math.floor(carouselRef.current.scrollLeft / 300) % 6;
          setCurrentSlide(slideIndex);
          
          // Reset to beginning when we've scrolled past the original items
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
            carouselRef.current.scrollLeft = 0;
          }
        }
      }, 30);
    }
  };

  // Initialize and clean up autoplay
  useEffect(() => {
    startAutoPlay();
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  // Sliding Carousel Section - New Addition
  const renderCarouselIndicators = () => {
    if (products.length === 0) return null;
    
    const indicators = [];
    const totalIndicators = Math.min(6, products.length);
    
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
    
    return (
      <div className="flex justify-center mt-6">
        {indicators}
      </div>
    );
  };

  // Fetch products from API - Modified to use RTK Query
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (isError) {
      // Handle different error types
      let errorMessage = 'Failed to fetch products';
      if (apiError) {
        if ('status' in apiError) {
          // FetchBaseQueryError
          const fetchError = apiError as { status: number; data?: any };
          errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || 'Unknown error')}`;
        } else if ('message' in apiError) {
          // SerializedError
          errorMessage = apiError.message || errorMessage;
        }
      }
      setErrorState(errorMessage);
      setLoading(false);
    } else if (productsData) {
      // Transform API data to match component's expected structure
      const transformedProducts = productsData.map((product: any) => ({
        id: product._id || product.id,
        name: product.productName || product.name || 'Unnamed Product',
        price: product.price || 0,
        image: product.productImage || product.image || '/placeholder-product.jpg',
        hint: product.categoryDescription || product.hint || '',
        rating: product.rating || 4.5, // Use product rating or default to 4.5
        reviewCount: product.reviewCount || Math.floor(Math.random() * 100), // Use product reviewCount or generate random
        vendorName: product.vendorId?.name || product.vendorName || 'Unknown Vendor',
        isNew: product.isNew || product.status === 'pending',
        description: product.description || '',
        category: product.category?.name || product.category || 'Uncategorized'
      }));
      
      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
      setLoading(false);
    }
  }, [productsData, isLoading, isError, apiError]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory
      );
    }
    
    // Apply brand filter
    if (selectedBrand !== 'all') {
      result = result.filter(product => 
        product.vendorName.toLowerCase().includes(selectedBrand)
      );
    }
    
    // Apply price filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // In a real app, you would sort by date
        break;
      default:
        // Default sorting (featured)
        break;
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-2xl mb-8"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/4">
                <div className="bg-card rounded-xl p-6 shadow-lg h-96"></div>
              </div>
              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-16">
      <style jsx>{`
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
      
      {/* Hero Section with Enhanced Design */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 py-12 md:py-16 lg:py-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
            Premium Beauty Products
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover our curated collection of high-quality beauty products from top vendors worldwide. 
            Elevate your beauty routine with our premium selection.
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, categories..."
                className="pl-12 pr-4 py-5 text-base rounded-2xl shadow-xl border-border/50 focus:ring-4 focus:ring-primary/30 transition-all duration-300 bg-card/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Quick Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {categories.slice(1, 5).map((category) => (
              <button
                key={category.id}
                className="px-4 py-2 rounded-full text-sm font-medium bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {/* Large Item */}
          <div className="sm:col-span-2 md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-5 md:p-6 shadow-xl border border-border/50 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Featured Product</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Discover our most popular beauty item</p>
              </div>
              <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold animate-pulse shadow-lg whitespace-nowrap">
                Popular
              </div>
            </div>
            {products.length > 0 && (
              <div className="flex flex-col gap-4 md:gap-5">
                {/* Main Featured Product - Show only photo, details on hover */}
                <div className="bg-card rounded-2xl p-4 md:p-5 shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 relative z-10 overflow-hidden">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 w-full h-48 md:h-56 rounded-2xl flex items-center justify-center overflow-hidden shadow-md transform transition-transform duration-500">
                      <img 
                        src={products[0].image} 
                        alt={products[0].name} 
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Details overlay - hidden by default, shown on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl flex flex-col justify-end p-4 md:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="font-bold text-lg md:text-xl text-white group-hover:text-white transition-colors duration-300 truncate">{products[0].name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 md:h-5 md:w-5 ${i < Math.floor(products[0].rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs md:text-sm text-gray-200">({products[0].reviewCount} reviews)</span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-white mt-2 md:mt-3">₹{products[0].price.toFixed(2)}</p>
                      <Button className="mt-3 md:mt-4 rounded-xl px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm hover:scale-105 transition-transform duration-300 bg-white text-primary hover:bg-gray-100">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Trending Product - Show only photo, details on hover */}
                {products.length > 3 && (
                  <div className="bg-card rounded-2xl p-4 md:p-5 shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 relative z-10 overflow-hidden">
                    <div className="relative">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Trending Now</h3>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-orange-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                          Hot
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-full h-36 md:h-40 rounded-2xl flex items-center justify-center overflow-hidden shadow-md transform transition-transform duration-500">
                        <img 
                          src={products[3].image} 
                          alt={products[3].name} 
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {/* Details overlay - hidden by default, shown on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl flex flex-col justify-end p-4 md:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="font-bold text-lg md:text-xl text-white group-hover:text-white transition-colors duration-300 truncate">{products[3].name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3.5 w-3.5 md:h-4 md:w-4 ${i < Math.floor(products[3].rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs md:text-sm text-gray-200">({products[3].reviewCount} reviews)</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold text-white mt-2">₹{products[3].price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                          <span className="text-xs md:text-sm font-bold text-green-400">+{Math.floor(Math.random() * 50) + 10}% this week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Medium Item 1 - New Arrivals */}
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">New Arrivals</h3>
                <p className="text-muted-foreground text-xs">Check out our latest products</p>
              </div>
              <div className="bg-gradient-to-r from-secondary to-primary text-secondary-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                New
              </div>
            </div>
            <div className="flex flex-col gap-3 md:gap-4 mt-3">
              {products.slice(0, 2).map((product, i) => (
                <div key={i} className="bg-card rounded-xl p-3 shadow-md border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative z-10 overflow-hidden">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-secondary/20 to-primary/20 w-full h-24 md:h-28 rounded-lg flex items-center justify-center overflow-hidden transform transition-transform duration-500 group-hover:-rotate-1">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Details overlay - hidden by default, shown on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="font-semibold text-sm text-white truncate group-hover:text-white">{product.name}</h4>
                      <p className="text-sm font-bold text-white mt-1">₹{product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 rounded-xl text-xs md:text-sm hover:scale-[1.02] transition-transform duration-300">
              View All New
            </Button>
          </div>
          
          {/* Promotional Card - Special Deal */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
              <div>
                <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Special Deal</h3>
                <p className="text-muted-foreground text-xs">Limited time offer</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-indigo-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap animate-pulse">
                Deal
              </div>
            </div>
            <div className="mt-auto flex flex-col items-center justify-center text-center md:mb-20">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
                30% OFF
              </div>
              <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">On selected beauty products</p>
              <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:scale-105 transition-transform duration-300 text-xs md:text-sm py-2 md:py-2.5">
                Shop Now
              </Button>
            </div>
          </div>
          
          {/* Small Item 1 - Top Rated */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
              <div>
                <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Top Rated</h3>
                <p className="text-muted-foreground text-xs">Highest customer satisfaction</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                ★
              </div>
            </div>
            {products.length > 1 && (
              <div className="mt-auto relative">
                <div className="relative bg-card rounded-xl p-3 md:p-4 shadow-md border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative z-10 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 w-full h-48 md:h-80 rounded-xl flex items-center justify-center mb-3 md:mb-4 overflow-hidden transform transition-transform duration-500 group-hover:scale-105 mx-auto">
                    <img 
                      src={products[1].image} 
                      alt={products[1].name} 
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Details overlay - hidden by default, shown on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl flex flex-col justify-end p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h4 className="font-bold text-sm md:text-base text-white group-hover:text-white truncate">{products[1].name}</h4>
                    <div className="flex justify-center items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 md:h-4 md:w-4 ${i < Math.floor(products[1].rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-white">{products[1].rating}</span>
                    </div>
                    <p className="text-base md:text-lg font-bold text-white mt-1">₹{products[1].price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Small Item 2 - Special Offers */}
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
              <div>
                <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Special Offers</h3>
                <p className="text-muted-foreground text-xs">Limited time discounts</p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-red-foreground px-2 py-1 rounded-full text-xs font-semibold animate-pulse shadow-md whitespace-nowrap">
                Sale
              </div>
            </div>
            {products.length > 2 && (
              <div className="mt-auto relative">
                <div className="relative bg-card rounded-xl p-3 md:p-4 shadow-md border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative z-10 overflow-hidden">
                  <div className="bg-gradient-to-br from-secondary/20 to-primary/20 w-full h-32 md:h-36 rounded-full flex items-center justify-center mb-3 md:mb-4 overflow-hidden transform transition-transform duration-500 group-hover:scale-105 mx-auto">
                    <img 
                      src={products[2].image} 
                      alt={products[2].name} 
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Details overlay - hidden by default, shown on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl flex flex-col justify-end p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h4 className="font-bold text-sm md:text-base text-white group-hover:text-white truncate">{products[2].name}</h4>
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-1">
                      <span className="text-base md:text-lg font-bold text-white">₹{products[2].price.toFixed(2)}</span>
                      <span className="text-xs text-gray-200 line-through">₹{(products[2].price * 1.2).toFixed(2)}</span>
                      <span className="text-xs font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded shadow-sm">
                        20% OFF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Medium Item 2 - Brand Spotlight */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Brand Spotlight</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Featured brands this month</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-purple-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                Brand
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3">
              {products.slice(0, 3).map((product, i) => (
                <div key={i} className="bg-card rounded-xl p-3 md:p-4 shadow-md border border-border/50 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative z-10 overflow-hidden">
                  <div className="relative w-full">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 w-full aspect-square rounded-xl flex items-center justify-center mb-0 overflow-hidden transform transition-transform duration-500 group-hover:scale-105">
                      <img 
                        src={product.image} 
                        alt={product.vendorName} 
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Details overlay - hidden by default, shown on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl flex flex-col justify-end p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <h4 className="font-bold text-center text-white text-xs truncate w-full">{product.vendorName}</h4>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-white">{product.rating}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 rounded-lg text-xs hover:scale-105 transition-transform duration-300 px-2 py-1 text-white border-white hover:bg-white hover:text-primary mx-2 mb-2">
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Customer Reviews Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Customer Reviews</h3>
                <p className="text-muted-foreground text-xs">What our customers say</p>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-amber-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                Reviews
              </div>
            </div>
            <div className="flex flex-col gap-3 md:gap-4 mt-3">
              {products.slice(0, 2).map((product, i) => (
                <div key={i} className="bg-card rounded-xl p-3 md:p-4 shadow-md border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative z-10 overflow-hidden group">
                  <div className="relative">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="font-bold text-amber-700 text-xs md:text-sm">{product.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0 relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, starIndex) => (
                              <Star 
                                key={starIndex} 
                                className={`h-3 w-3 md:h-3.5 md:w-3.5 ${starIndex < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {/* Details overlay - hidden by default, shown on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center">
                          <p className="text-xs text-amber-800 mt-1 line-clamp-3">"This product has completely transformed my skincare routine. Highly recommended for anyone looking for quality beauty products!"</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs font-bold text-amber-700">₹{product.price.toFixed(2)}</span>
                            <span className="text-xs text-amber-600">verified purchase</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 rounded-xl text-xs md:text-sm hover:scale-[1.02] transition-transform duration-300 border-amber-200 text-amber-700 hover:bg-amber-50 py-2 md:py-2.5">
              View All Reviews
            </Button>
          </div>
          
          {/* Decorative Element to Fill Empty Space */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col items-center justify-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">★</span>
              </div>
              <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1 md:mb-2">Premium Quality</h3>
              <p className="text-muted-foreground text-xs">Discover our curated selection of beauty products</p>
            </div>
          </div>

          {/* Beauty Tips Element to Fill Remaining Space */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col items-center justify-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">✨</span>
              </div>
              <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1 md:mb-2">Beauty Tips</h3>
              <p className="text-muted-foreground text-xs">Expert advice for your skincare routine</p>
            </div>
          </div>

          {/* New Arrivals Element to Completely Fill Grid */}
          <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-3xl p-4 md:p-5 shadow-xl border border-border/50 flex flex-col items-center justify-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="bg-gradient-to-br from-cyan-100 to-sky-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">+</span>
              </div>
              <h3 className="font-bold text-sm md:text-base bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent mb-1 md:mb-2">New Arrivals</h3>
              <p className="text-muted-foreground text-xs">Fresh products added weekly</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Filter Modal - keep at top level */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-xl">
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
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Brand
                  </h3>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="rounded-xl">
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
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </h3>
                  <div className="space-y-4">
                    <label className="sr-only">Price range slider</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      aria-label="Price range slider"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$0</span>
                      <span>$200</span>
                    </div>
                  </div>
                </div>
                
                {/* Sort By */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="rounded-xl">
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
                
                {/* View Mode Toggle */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">View</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'outline'} 
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'} 
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
                
                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl mb-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setPriceRange([0, 200]);
                    setSortBy('featured');
                  }}
                >
                  Clear All Filters
                </Button>
                
                <Button 
                  className="w-full rounded-xl"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Products Grid/List - Removed sidebar filter */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Products <span className="text-muted-foreground text-lg">({filteredProducts.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">View:</span>
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
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
            ) : viewMode === 'grid' ? (
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
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-card rounded-2xl p-4 shadow-md border border-border/50 flex flex-col sm:flex-row gap-4 group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square w-full sm:w-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="text-muted-foreground text-xs">{product.vendorName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">₹{product.price.toFixed(2)}</div>
                          {product.isNew && (
                            <span className="inline-block bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full mt-1">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                      </div>
                      
                      <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">{product.description}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Button className="rounded-lg text-xs py-1.5 px-3">
                          View Details
                        </Button>
                        <Button variant="outline" className="rounded-lg text-xs py-1.5 px-3">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sliding Carousel Section - New Addition */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Trending Now</h2>
          <Button variant="outline" className="rounded-full">
            View All Products
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 to-secondary/5 p-8 shadow-xl border border-border/50">
          <div 
            ref={carouselRef}
            className="flex space-x-6 overflow-x-hidden pb-4 scrollbar-hide"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Product items - duplicated for seamless looping */}
            {[...Array(2)].map((_, loopIndex) => (
              <div key={loopIndex} className="flex space-x-6">
                {products.slice(0, Math.min(6, products.length)).map((product) => (
                  <div key={`${product.id}-${loopIndex}`} className="flex-shrink-0 w-64 md:w-72 bg-card rounded-2xl p-6 shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 w-full h-48 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      {product.isNew && (
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                          NEW
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 truncate">{product.name}</h3>
                    <p className="text-muted-foreground text-xs mb-3">{product.vendorName}</p>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description || 'Premium beauty product with exceptional quality and results.'}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <Button className="rounded-xl" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </Button>
                        <Button variant="outline" className="rounded-xl" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-card transition-all duration-300 z-10"
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-card transition-all duration-300 z-10"
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Carousel Indicators */}
          {renderCarouselIndicators()}
        </div>
      </div>
      
      {/* Enhanced Sticky Filter Strip with improved design and positioning */}
      <div className="sticky bottom-6 z-50 mt-4 pb-6 flex justify-center">
        <Button 
          onClick={() => setIsFilterModalOpen(true)}
          className="w-auto py-3 px-5 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
        >
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Filters & Sorting</span>
          <span className="text-muted-foreground text-xs bg-muted/50 px-2.5 py-0.5 rounded-full">
            {selectedCategory !== 'all' ? 1 : 0}
            {selectedBrand !== 'all' ? (selectedCategory !== 'all' ? 1 : 1) : 0}
            {priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0}
            {sortBy !== 'featured' ? 1 : 0} active
          </span>
        </Button>
      </div>
    </div>
  );
}
