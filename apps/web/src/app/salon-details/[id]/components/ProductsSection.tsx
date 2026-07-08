import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  categories,
}: {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
  categories: string[];
}) => {
  const [activeSub, setActiveSub] = useState<'none' | 'category' | 'price' | 'rating' | 'stock'>('none');

  // Reset states when dropdown closes
  useEffect(() => {
    if (!showDropdown) {
      setActiveSub('none');
    }
  }, [showDropdown]);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-black font-medium"
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (showDropdown) setActiveSub('none');
        }}
      >
        <span>
          Filter By
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute z-20 mt-1 flex filter-dropdown-wrapper">
          {/* Main Menu */}
          <div className="w-56 bg-white rounded-md shadow-xl border border-gray-100 py-1 max-h-[400px] overflow-y-auto">
            <button
              className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterBy === 'all' ? 'bg-primary/5 text-primary font-medium' : ''}`}
              onClick={() => {
                setFilterBy('all');
                setShowDropdown(false);
                setActiveSub('none');
              }}
              onMouseEnter={() => setActiveSub('none')}
            >
              All Products
            </button>

            <button
              className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterBy.startsWith('category:') || activeSub === 'category' ? 'bg-primary/5 text-primary font-medium' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSub(activeSub === 'category' ? 'none' : 'category');
              }}
              onMouseEnter={() => setActiveSub('category')}
            >
              By Category
              <ChevronDown className="-rotate-90 h-3 w-3 opacity-50" />
            </button>

            <button
              className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterBy.startsWith('price:') || activeSub === 'price' ? 'bg-primary/5 text-primary font-medium' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSub(activeSub === 'price' ? 'none' : 'price');
              }}
              onMouseEnter={() => setActiveSub('price')}
            >
              By Price
              <ChevronDown className="-rotate-90 h-3 w-3 opacity-50" />
            </button>

            <button
              className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterBy.startsWith('rating:') || activeSub === 'rating' ? 'bg-primary/5 text-primary font-medium' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSub(activeSub === 'rating' ? 'none' : 'rating');
              }}
              onMouseEnter={() => setActiveSub('rating')}
            >
              By Rating
              <ChevronDown className="-rotate-90 h-3 w-3 opacity-50" />
            </button>


          </div>

          {/* Dynamic Side Menu */}
          {activeSub !== 'none' && (
            <div
              className="ml-1 w-64 bg-white rounded-md shadow-xl border border-gray-100 py-1 max-h-[400px] overflow-y-auto"
              onMouseLeave={() => setActiveSub('none')}
            >
              {/* Category Submenu */}
              {activeSub === 'category' && (
                <>
                  <div className="px-4 py-2.5 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 border-b">
                    Select Category
                  </div>
                  <div className="py-1">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <button
                          key={cat}
                          className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${filterBy === `category:${cat}` ? 'bg-primary/5 text-primary font-medium' : ''}`}
                          onClick={() => {
                            setFilterBy(`category:${cat}`);
                            setShowDropdown(false);
                            setActiveSub('none');
                          }}
                        >
                          {cat}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-xs text-muted-foreground italic text-center">No categories found</div>
                    )}
                  </div>
                </>
              )}

              {/* Price Submenu */}
              {activeSub === 'price' && (
                <>
                  <div className="px-4 py-2.5 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 border-b">
                    Select Price Range
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'Under ₹500', value: 'price:under-500' },
                      { label: '₹500 - ₹1000', value: 'price:500-1000' },
                      { label: 'Over ₹1000', value: 'price:over-1000' }
                    ].map((item) => (
                      <button
                        key={item.value}
                        className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${filterBy === item.value ? 'bg-primary/5 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setFilterBy(item.value);
                          setShowDropdown(false);
                          setActiveSub('none');
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Rating Submenu */}
              {activeSub === 'rating' && (
                <>
                  <div className="px-4 py-2.5 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 border-b">
                    Select Minimum Rating
                  </div>
                  <div className="py-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${filterBy === `rating:${star}` ? 'bg-primary/5 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setFilterBy(`rating:${star}`);
                          setShowDropdown(false);
                          setActiveSub('none');
                        }}
                      >
                        {star}+ Stars Rating
                      </button>
                    ))}
                  </div>
                </>
              )}


            </div>
          )}
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
      <button
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-black font-medium"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span>
          Sort By
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

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
  const router = useRouter();
  const [filterBy, setFilterBy] = useState<string>('all'); // Options: 'all', 'category', 'price', 'rating', 'availability'
  const [sortBy, setSortBy] = useState<string>('name'); // Options: 'name', 'price-low', 'price-high', 'rating', 'newest'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  interface SalonProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice: number;
    image: string;
    vendorId: string;
    vendorName: string;
    category: string;
    stock: number;
    rating: string;
    hint: string;
  }

  // Extract products from productsData
  const salonProducts: SalonProduct[] = productsData?.products?.map((p: any) => ({
    id: p.id || p._id,
    name: p.name || p.productName,
    description: p.description || "",
    price: Number(p.price) || 0,
    salePrice: (p.salePrice && Number(p.salePrice) > 0) ? Number(p.salePrice) : 0,
    image:
      p.image ||
      p.productImages?.[0] ||
      p.productImage ||
      "/images/product-placeholder.png",
    vendorId: vendorId,
    vendorName: vendorData?.businessName || "Unknown Vendor",
    category: p.category || "Beauty Products",
    stock: p.stock || 0,
    rating: p.rating || "0.0",
    hint: p.hint || p.description || p.name || p.productName,
  })) || [];

  // Get unique categories for the filter
  const uniqueCategories = React.useMemo(() => {
    const cats = salonProducts.map((p: SalonProduct) => p.category);
    return Array.from(new Set(cats)).sort();
  }, [salonProducts]);

  // Filter and sort products based on filterBy and sortBy states
  const filteredAndSortedProducts = React.useMemo(() => {
    // Global filter: Only show products with stock > 0
    let result = salonProducts.filter(p => p.stock > 0);

    // Apply filtering
    if (filterBy.startsWith('category:')) {
      const category = filterBy.split(':')[1];
      result = result.filter(p => p.category === category);
    } else if (filterBy.startsWith('price:')) {
      const range = filterBy.split(':')[1];
      result = result.filter(p => {
        const price = p.salePrice > 0 ? p.salePrice : p.price;
        if (range === 'under-500') return price < 500;
        if (range === '500-1000') return price >= 500 && price <= 1000;
        if (range === 'over-1000') return price > 1000;
      });
    } else if (filterBy.startsWith('rating:')) {
      const minRating = parseFloat(filterBy.split(':')[1]);
      result = result.filter(p => parseFloat(p.rating) >= minRating);
    } else if (filterBy === 'availability') {
      result = result.filter(p => p.stock > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result.sort((a, b) => {
          const priceA = a.salePrice > 0 ? a.salePrice : a.price;
          const priceB = b.salePrice > 0 ? b.salePrice : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = a.salePrice > 0 ? a.salePrice : a.price;
          const priceB = b.salePrice > 0 ? b.salePrice : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'newest':
        // For this example, we'll sort by ID since we don't have dates
        result.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
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
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
          style={{ color: "#252B42" }}
        >
          The Products We Use & Recommend
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>
        <p className="text-sm md:text-base text-black mb-6">
          High-quality products available for purchase.
        </p>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#EBF3FD] py-4 px-6 rounded mb-8 gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-48">
          <FilterDropdown
            showDropdown={showFilterDropdown}
            setShowDropdown={setShowFilterDropdown}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            categories={uniqueCategories}
          />

          <SortDropdown
            showDropdown={showSortDropdown}
            setShowDropdown={setShowSortDropdown}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
        <button
          className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4 font-medium transition-colors"
          onClick={() => {
            setFilterBy('all');
            setSortBy('name');
            router.push('/all-products');
          }}
        >
          View All Products
        </button>
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