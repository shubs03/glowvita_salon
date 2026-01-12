import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useGetPublicProductsQuery } from '@repo/store/api';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch product data to show stats
  const { data: productsApiData, isLoading } = useGetPublicProductsQuery(undefined);

  console.log("product data on hero section : ", productsApiData);

  // Calculate stats
  const uniqueVendors = productsApiData?.products ? new Set(productsApiData.products.map((p: any) => p.vendorId)).size : 0;
  const totalProducts = productsApiData?.products ? productsApiData.products.length : 0;
  const averageRating = productsApiData?.products && productsApiData.products.length > 0
    ? (
        productsApiData.products.reduce((acc: any, p: any) => acc + p.rating, 0) / productsApiData.products.length
      ).toFixed(1)
    : "0.0";

  console.log("unique vendors: ", uniqueVendors);
  console.log("total products: ", totalProducts);
  console.log("average rating: ", averageRating);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="relative w-full h-[615px] overflow-hidden bg-background">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl">
        {/* Logo/Brand Name */}
        <div className="mb-8">
          <h3 className="text-amber-100 text-sm font-light tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-50 mb-6 max-w-2xl leading-tight">
          Choose the Best<br />for Your Routine
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-base md:text-lg max-w-xl leading-relaxed mb-10">
          Explore high-quality beauty products crafted to elevate your daily self-care with trusted formulas and reliable performance.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl">
          <div className="bg-white rounded-full shadow-2xl p-2 flex items-center gap-3">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
            <button 
              type="submit"
              className="bg-primary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-lg flex-shrink-0"
            >
              Search
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mt-12">
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-2xl font-bold text-amber-50/90">
              {isLoading
                ? "..."
                : uniqueVendors > 0
                  ? `${uniqueVendors}+`
                  : "0"}
            </p>
            <p className="text-xs md:text-sm text-amber-100/80">Verified Vendors</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-2xl font-bold text-amber-50">
              {isLoading
                ? "..."
                : totalProducts > 0
                  ? `${totalProducts.toLocaleString()}+`
                  : "0"}
            </p>
            <p className="text-xs md:text-sm text-amber-100/80">Products Listed</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-2xl font-bold text-amber-50">
              {isLoading ? "..." : averageRating}/5
            </p>
            <p className="text-xs md:text-sm text-amber-100/80">Average Rating</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-2xl font-bold text-amber-50">Secure</p>
            <p className="text-xs md:text-sm text-amber-100/80">
              Shopping Guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;