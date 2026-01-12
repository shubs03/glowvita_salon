import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { ChevronDown } from "lucide-react";
import { cn } from "@repo/ui/cn";
import ProductCard from "./ProductCard"; // Import the ProductCard component

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  image: string;
  vendorId: string;
  vendorName: string;
  category: string;
  stock: number;
  rating: string;
  hint: string;
}

interface ProductsSectionProps {
  vendorId: string;
  vendorData: any;
  productsData: any;
  isLoading: boolean;
  error: any;
  isSubscriptionExpired: boolean;
  onBuyNow: (product: any) => void;
  onAddToCart: (product: any) => void;
}

const FilterDropdown = ({
  showDropdown,
  setShowDropdown,
  filterBy,
  setFilterBy,
}: {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
}) => {
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm"
        className="rounded-lg filter-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        Filter By
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>
      
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-max filter-dropdown">
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filterBy === 'all' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setFilterBy('all');
              setShowDropdown(false);
            }}
          >
            All Products
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filterBy === 'category' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setFilterBy('category');
              setShowDropdown(false);
            }}
          >
            By Category
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filterBy === 'price' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setFilterBy('price');
              setShowDropdown(false);
            }}
          >
            By Price
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filterBy === 'rating' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setFilterBy('rating');
              setShowDropdown(false);
            }}
          >
            By Rating
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filterBy === 'availability' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setFilterBy('availability');
              setShowDropdown(false);
            }}
          >
            In Stock
          </button>
        </div>
      )}
    </div>
  );
};

const SortDropdown = ({
  showDropdown,
  setShowDropdown,
  sortBy,
  setSortBy,
}: {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}) => {
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm"
        className="rounded-lg sort-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        Sort By
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>
      
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-max sort-dropdown">
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'name' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setSortBy('name');
              setShowDropdown(false);
            }}
          >
            Name (A-Z)
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'price-low' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setSortBy('price-low');
              setShowDropdown(false);
            }}
          >
            Price (Low to High)
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'price-high' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setSortBy('price-high');
              setShowDropdown(false);
            }}
          >
            Price (High to Low)
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'rating' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setSortBy('rating');
              setShowDropdown(false);
            }}
          >
            Top Rated
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'newest' ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setSortBy('newest');
              setShowDropdown(false);
            }}
          >
            Newest
          </button>
        </div>
      )}
    </div>
  );
};

const ProductsSection: React.FC<ProductsSectionProps> = ({
  vendorId,
  vendorData,
  productsData,
  isLoading,
  error,
  isSubscriptionExpired,
  onBuyNow,
  onAddToCart,
}) => {
  const [filterBy, setFilterBy] = useState<string>('all'); // Options: 'all', 'category', 'price', 'rating', 'availability'
  const [sortBy, setSortBy] = useState<string>('name'); // Options: 'name', 'price-low', 'price-high', 'rating', 'newest'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Extract products from productsData
  const salonProducts = productsData?.products?.map((p: any) => ({
    id: p.id || p._id,
    name: p.name || p.productName,
    description: p.description || "",
    price: p.price || 0,
    salePrice: p.salePrice || null,
    image:
      p.image ||
      p.productImage ||
      "https://placehold.co/320x224/png?text=Product",
    vendorId: vendorId,
    vendorName: vendorData?.businessName || "Unknown Vendor",
    category: p.category || "Beauty Products",
    stock: p.stock || 0,
    rating: p.rating || (4.2 + Math.random() * 0.8).toFixed(1),
    hint: p.hint || p.description || p.name || p.productName,
  })) || [];

  // Filter and sort products based on filterBy and sortBy states
  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...salonProducts];

    // Apply filtering
    if (filterBy === 'category') {
      // In a real implementation, you'd filter by specific category
      // For now just return all products
    } else if (filterBy === 'price') {
      // Filter by price range - for now just return all products
      // In a real implementation, you'd have price range filters
    } else if (filterBy === 'rating') {
      // Filter by rating - for now just return all products
      // In a real implementation, you'd filter by minimum rating
    } else if (filterBy === 'availability') {
      // Filter by stock availability
      result = result.filter(p => p.stock > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'newest':
        // For this example, we'll sort by ID since we don't have dates
        result.sort((a, b) => (b.id || b._id || '').localeCompare(a.id || a._id || ''));
        break;
      default:
        break;
    }

    return result;
  }, [salonProducts, filterBy, sortBy]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterDropdown || showSortDropdown) {
        const target = event.target as HTMLElement;
        
        // Check if click is outside filter dropdown
        const filterButton = document.querySelector('.filter-button');
        const filterDropdown = document.querySelector('.filter-dropdown');
        
        if (showFilterDropdown && filterDropdown && !filterDropdown.contains(target) && 
            (!filterButton || !filterButton.contains(target))) {
          setShowFilterDropdown(false);
        }
        
        // Check if click is outside sort dropdown
        const sortButton = document.querySelector('.sort-button');
        const sortDropdown = document.querySelector('.sort-dropdown');
        
        if (showSortDropdown && sortDropdown && !sortDropdown.contains(target) && 
            (!sortButton || !sortButton.contains(target))) {
          setShowSortDropdown(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown, showSortDropdown]);

  return (
    <section id="products">

       {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Products We Use & Sell
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          High-quality products available for purchase at our salon, 
          Don't miss out on our high-quality products!
        </p>
      </div>
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            showDropdown={showFilterDropdown}
            setShowDropdown={setShowFilterDropdown}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
          />
          
          <SortDropdown
            showDropdown={showSortDropdown}
            setShowDropdown={setShowSortDropdown}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-lg"
          onClick={() => {
            setFilterBy('all');
            setSortBy('name');
          }}
        >
          View All Products
        </Button>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuyNow={onBuyNow}
              onAddToCart={onAddToCart}
              vendorId={vendorId}
              vendorName={vendorData?.businessName || "Unknown Vendor"}
              isSubscriptionExpired={isSubscriptionExpired}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              No products available for this salon at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;