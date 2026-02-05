import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useGetPublicProductsQuery } from '@repo/store/api';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch product data to show stats
  const { data: productsApiData, isLoading } = useGetPublicProductsQuery(undefined);

  // Calculate stats
  const uniqueVendors = productsApiData?.products ? new Set(productsApiData.products.map((p: any) => p.vendorId)).size : 0;
  const totalProducts = productsApiData?.products ? productsApiData.products.length : 0;
  const averageRating = productsApiData?.products && productsApiData.products.length > 0
    ? (
        productsApiData.products.reduce((acc: any, p: any) => acc + p.rating, 0) / productsApiData.products.length
      ).toFixed(1)
    : "0.0";
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="relative w-full min-h-[500px] h-[615px] md:h-[615px] overflow-hidden bg-background">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl py-8 md:py-0">
        {/* Logo/Brand Name */}
        <div className="mb-4 md:mb-8">
          <h3 className="text-amber-100 text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-amber-50 mb-4 md:mb-6 max-w-2xl leading-tight">
          Choose the Best<br />for Your Routine
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-6 md:mb-10">
          Explore high-quality beauty products crafted to elevate your daily self-care with trusted formulas and reliable performance.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mb-8 md:mb-12">
          <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-3 md:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 sm:px-6 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm w-full"
            />
            <button 
              type="submit"
              className="bg-primary text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg flex-shrink-0 w-full sm:w-auto"
            >
              Search
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl">
          <div className="text-center p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
            <p className="text-xl sm:text-2xl font-bold text-amber-50/90">
              {isLoading
                ? "..."
                : uniqueVendors > 0
                  ? `${uniqueVendors}+`
                  : "0"}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/80 mt-1">Verified Vendors</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">
              {isLoading
                ? "..."
                : totalProducts > 0
                  ? `${totalProducts.toLocaleString()}+`
                  : "0"}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/80 mt-1">Products Listed</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">
              {isLoading ? "..." : averageRating}/5
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/80 mt-1">Average Rating</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
            <p className="text-xl sm:text-2xl font-bold text-amber-50">Secure</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/80 mt-1">
              Shopping Guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;