"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  DollarSign,
  RotateCcw,
  Globe,
  Leaf,
  Search,
  Filter,
  Grid,
  List,
  Star,
  TrendingUp,
  X,
  Package,
  Shield,
  CheckCircle,
  Users,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Heart,
} from "lucide-react";
import { ProductCard } from "@repo/ui/components/landing/ProductCard";
import { PageContainer } from "@repo/ui/page-container";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent } from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
import { NewProductCard } from "@/components/landing/NewProductCard";

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
  vendorId: string;
  isNew?: boolean;
  description: string;
  category: string;
}

const ProductHighlightCard = ({
  title,
  products,
  className = "",
  isLarge = false,
}: {
  title: string;
  products: Product[];
  className?: string;
  isLarge?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveblue, setIsHoveblue] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (!isHoveblue) {
      timeoutRef.current = setTimeout(
        () => setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length),
        3000
      );
    }
    return () => resetTimeout();
  }, [currentIndex, isHoveblue, products.length]);

  const nextProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prevProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + products.length) % products.length
    );
  };

  if (!products || products.length === 0) return null;

  return (
    <div
      className={`relative rounded-md md:rounded-2xl flex flex-col justify-between group transition-all duration-300 ease-in-out bg-background/50 backdrop-blur-sm ${className}`}
      onMouseEnter={() => setIsHoveblue(true)}
      onMouseLeave={() => setIsHoveblue(false)}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10 h-full flex flex-col">
        <h3
          className={`font-bold mb-2 md:mb-2 ${isLarge ? "text-xl sm:text-2xl lg:text-3xl" : "text-base sm:text-lg md:text-xl"}`}
        >
          {title}
        </h3>
        <div className="relative flex-1 rounded-lg md:rounded-md overflow-hidden">
          {products.map((product: Product, index: number) => (
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div
            className={`absolute bottom-0 left-0 right-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLarge ? "p-3 md:p-4 lg:p-5" : "p-2 md:p-3"}`}
          >
            <h4
              className={`font-bold truncate ${isLarge ? "text-base sm:text-lg md:text-xl" : "text-sm md:text-base"}`}
            >
              {products[currentIndex].name}
            </h4>
            <p
              className={`truncate opacity-90 ${isLarge ? "text-sm md:text-base" : "text-xs md:text-sm"}`}
            >
              {products[currentIndex].vendorName}
            </p>
            <div className="flex justify-between items-center mt-1 md:mt-2">
              <p
                className={`font-bold ${isLarge ? "text-sm md:text-base lg:text-lg" : "text-xs md:text-sm"}`}
              >
                ₹{products[currentIndex].price.toFixed(2)}
              </p>
              {isLarge && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full text-xs md:text-sm px-3 py-1 md:px-4 md:py-2"
                >
                  View
                </Button>
              )}
            </div>
          </div>

          <div
            className={`absolute flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLarge ? "top-3 right-3 md:top-4 md:right-4" : "top-2 right-2 md:top-3 md:right-3"}`}
          >
            <Button
              size="icon"
              variant="ghost"
              className={`bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-200 ${isLarge ? "h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9" : "h-6 w-6 md:h-7 md:w-7"}`}
              onClick={prevProduct}
            >
              <ChevronLeft
                className={`${isLarge ? "h-3 w-3 md:h-4 md:w-4" : "h-3 w-3"}`}
              />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-200 ${isLarge ? "h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9" : "h-6 w-6 md:h-7 md:w-7"}`}
              onClick={nextProduct}
            >
              <ChevronRight
                className={`${isLarge ? "h-3 w-3 md:h-4 md:w-4" : "h-3 w-3"}`}
              />
            </Button>
          </div>

          {/* Product indicators for mobile */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 md:hidden">
            {products.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteblueProducts, setFilteblueProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // New state for filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("featublue");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Mock categories and brands
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "skincare", name: "Skincare" },
    { id: "cosmetics", name: "Cosmetics" },
    { id: "bodycare", name: "Body Care" },
    { id: "facecare", name: "Face Care" },
    { id: "fragrance", name: "Fragrance" },
  ];
  // Mock brands
  const brands = [
    { id: "all", name: "All Brands" },
    { id: "aura", name: "Aura Cosmetics" },
    { id: "chroma", name: "Chroma Beauty" },
    { id: "serenity", name: "Serenity Skincare" },
    { id: "earthly", name: "Earthly Essentials" },
  ];
  // Mock products data
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Radiant Glow Serum",
      price: 45.99,
      image: "https://placehold.co/320x224.png",
      hint: "Brightening vitamin C serum",
      rating: 4.8,
      reviewCount: 324,
      vendorName: "Aura Cosmetics",
      vendorId: "vendor-1",
      isNew: true,
      description:
        "A powerful vitamin C serum that brightens and evens skin tone",
      category: "skincare",
    },
    {
      id: "2",
      name: "Luxury Face Cream",
      price: 78.5,
      image: "https://placehold.co/320x224.png",
      hint: "Anti-aging moisturizer",
      rating: 4.9,
      reviewCount: 567,
      vendorName: "Serenity Skincare",
      vendorId: "vendor-2",
      description: "Rich anti-aging cream with peptides and hyaluronic acid",
      category: "skincare",
    },
    {
      id: "3",
      name: "Matte Lipstick Set",
      price: 32.0,
      image: "https://placehold.co/320x224.png",
      hint: "Long-lasting matte lipsticks",
      rating: 4.7,
      reviewCount: 892,
      vendorName: "Chroma Beauty",
      vendorId: "vendor-3",
      isNew: true,
      description: "Set of 6 long-lasting matte lipsticks in trending shades",
      category: "cosmetics",
    },
    {
      id: "4",
      name: "Gentle Cleansing Oil",
      price: 28.75,
      image: "https://placehold.co/320x224.png",
      hint: "Removes makeup effortlessly",
      rating: 4.6,
      reviewCount: 445,
      vendorName: "Earthly Essentials",
      vendorId: "vendor-4",
      description: "Natural cleansing oil that removes makeup and impurities",
      category: "facecare",
    },
    {
      id: "5",
      name: "Body Butter Trio",
      price: 56.99,
      image: "https://placehold.co/320x224.png",
      hint: "Nourishing body care set",
      rating: 4.8,
      reviewCount: 234,
      vendorName: "Earthly Essentials",
      vendorId: "vendor-4",
      description: "Set of 3 rich body butters with natural ingredients",
      category: "bodycare",
    },
    {
      id: "6",
      name: "Eye Shadow Palette",
      price: 42.25,
      image: "https://placehold.co/320x224.png",
      hint: "12 versatile shades",
      rating: 4.9,
      reviewCount: 678,
      vendorName: "Chroma Beauty",
      vendorId: "vendor-3",
      description: "Professional eyeshadow palette with 12 blendable shades",
      category: "cosmetics",
    },
    {
      id: "7",
      name: "Hydrating Toner",
      price: 24.5,
      image: "https://placehold.co/320x224.png",
      hint: "Balances and hydrates",
      rating: 4.5,
      reviewCount: 321,
      vendorName: "Serenity Skincare",
      vendorId: "vendor-2",
      description: "Alcohol-free toner that balances and hydrates skin",
      category: "skincare",
    },
    {
      id: "8",
      name: "Floral Perfume",
      price: 89.99,
      image: "https://placehold.co/320x224.png",
      hint: "Elegant floral fragrance",
      rating: 4.7,
      reviewCount: 156,
      vendorName: "Aura Cosmetics",
      vendorId: "vendor-1",
      description:
        "Sophisticated floral fragrance with notes of jasmine and rose",
      category: "fragrance",
    },
    {
      id: "9",
      name: "Exfoliating Scrub",
      price: 19.95,
      image: "https://placehold.co/320x224.png",
      hint: "Gentle face scrub",
      rating: 4.4,
      reviewCount: 289,
      vendorName: "Earthly Essentials",
      vendorId: "vendor-4",
      description: "Natural exfoliating scrub with bamboo particles",
      category: "facecare",
    },
    {
      id: "10",
      name: "Foundation Stick",
      price: 38.0,
      image: "https://placehold.co/320x224.png",
      hint: "Full coverage foundation",
      rating: 4.6,
      reviewCount: 445,
      vendorName: "Chroma Beauty",
      vendorId: "vendor-3",
      description: "Buildable full-coverage foundation stick",
      category: "cosmetics",
    },
    {
      id: "11",
      name: "Night Repair Serum",
      price: 65.0,
      image: "https://placehold.co/320x224.png",
      hint: "Overnight skin renewal",
      rating: 4.8,
      reviewCount: 512,
      vendorName: "Serenity Skincare",
      vendorId: "vendor-2",
      isNew: true,
      description: "Advanced night serum with retinol and peptides",
      category: "skincare",
    },
    {
      id: "12",
      name: "Lip Gloss Collection",
      price: 25.5,
      image: "https://placehold.co/320x224.png",
      hint: "Shimmery lip glosses",
      rating: 4.3,
      reviewCount: 178,
      vendorName: "Aura Cosmetics",
      vendorId: "vendor-1",
      description: "Set of 4 high-shine lip glosses with mirror finish",
      category: "cosmetics",
    },
  ];
  // Initialize products with mock data
  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteblueProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply brand filter
    if (selectedBrand !== "all") {
      const brandMap: { [key: string]: string } = {
        aura: "Aura Cosmetics",
        chroma: "Chroma Beauty",
        serenity: "Serenity Skincare",
        earthly: "Earthly Essentials",
      };
      result = result.filter(
        (product) => product.vendorName === brandMap[selectedBrand]
      );
    }

    // Apply price range filter
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result = result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "price-low":
        result = result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case "featublue":
      default:
        // Keep original order for featublue
        break;
    }

    setFilteblueProducts(result);
  }, [
    searchTerm,
    products,
    selectedCategory,
    selectedBrand,
    priceRange,
    sortBy,
  ]);

  const bentoGridProducts = {
    newArrivals: products.slice(0, 3),
    topRated: products.slice(3, 6),
    bestSellers: products.slice(6, 9),
  };

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
            Explore a curated selection of premium beauty and wellness products
            from top-rated vendors.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mb-12">
            <Badge
              variant="outline"
              className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors"
            >
              Skincare
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors"
            >
              Haircare
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors"
            >
              Cosmetics
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 cursor-pointer hover:bg-muted transition-colors"
            >
              Body Care
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-md border border-border/20">
              <p className="text-3xl font-bold text-primary">1,000+</p>
              <p className="text-sm text-muted-foreground">Verified Vendors</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-md border border-border/20">
              <p className="text-3xl font-bold text-primary">50,000+</p>
              <p className="text-sm text-muted-foreground">Products Listed</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-md border border-border/20">
              <p className="text-3xl font-bold text-primary">4.9/5</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-md border border-border/20">
              <p className="text-3xl font-bold text-primary">Secure</p>
              <p className="text-sm text-muted-foreground">
                Shopping Guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <main className="lg:col-span-12">
            {/* 3. Bento Grid Section */}
            <section className="mb-24 md:mb-24 lg:mb-36">
              <div className="text-center my-8 md:my-12 lg:my-20">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                  Highlights
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover our most popular and trending products curated just
                  for you. Shop now and elevate your beauty routine. It's time
                  to glow!
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-fr min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]">
                {bentoGridProducts.newArrivals.length > 0 && (
                  <ProductHighlightCard
                    title="New Arrivals"
                    products={bentoGridProducts.newArrivals}
                    className="sm:col-span-2 sm:row-span-2 h-full min-h-[280px] sm:min-h-[400px] lg:min-h-[480px]"
                    isLarge={true}
                  />
                )}
                {bentoGridProducts.topRated.length > 0 && (
                  <ProductHighlightCard
                    title="Top Rated"
                    products={bentoGridProducts.topRated}
                    className="h-full min-h-[280px] sm:min-h-[190px] lg:min-h-[230px]"
                  />
                )}
                {bentoGridProducts.bestSellers.length > 0 && (
                  <ProductHighlightCard
                    title="Best Sellers"
                    products={bentoGridProducts.bestSellers}
                    className="h-full min-h-[280px] sm:min-h-[190px] lg:min-h-[230px]"
                  />
                )}
                {products.filter((p) => p.category === "fragrance").length >
                  0 && (
                  <ProductHighlightCard
                    title="Fragrances"
                    products={products.filter(
                      (p) => p.category === "fragrance"
                    )}
                    className="h-full min-h-[280px] sm:min-h-[190px] lg:min-h-[230px]"
                  />
                )}
                {products.filter((p) => p.category === "cosmetics").length >
                  0 && (
                  <ProductHighlightCard
                    title="Cosmetics"
                    products={products.filter(
                      (p) => p.category === "cosmetics"
                    )}
                    className="h-full min-h-[280px] sm:min-h-[190px] lg:min-h-[230px]"
                  />
                )}
              </div>
            </section>

            {/* 5. Product Grid */}
            <section>
              <div className="text-center my-8 md:my-12 lg:my-20">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                  All Products
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Browse our complete collection of premium beauty and wellness
                  products. Discover top-rated skincare, cosmetics, body care,
                  and more from trusted brands.
                </p>
              </div>

              {/* Search Bar - New Design */}

              <div className="mb-8 p-4 rounded-md flex flex-col sm:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                  <Input
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-md w-full bg-background border focus:border-primary transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-md hover:bg-primary/10 transition"
                    aria-label="Grid View"
                  >
                    <Grid className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-md hover:bg-primary/10 transition"
                    aria-label="List View"
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  <span className="hidden sm:block h-8 w-px bg-border mx-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md flex gap-2 items-center hover:bg-primary/10 transition"
                    onClick={() => setIsFilterModalOpen(true)}
                    aria-label="Open Filters"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">Filters</span>
                  </Button>
                </div>
              </div>

              {/* Results count */}
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing {filteblueProducts.length} of {products.length}{" "}
                  products
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>

              {loading ? (
                <p>Loading products...</p>
              ) : error ? (
                <p className="text-blue-500">{error}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {filteblueProducts.map((product) => (
                    <NewProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </section>

            {/* 6. Why Shop With Us Section */}
            <section className="py-10 rounded-md">
              <div className="text-center my-8 md:my-12 lg:my-20">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                  Why Shop With Us?
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover the benefits of choosing our marketplace for all your
                  beauty needs. We prioritize quality, security, and customer
                  satisfaction to provide an unparalleled shopping experience.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative text-center p-8 rounded-md bg-card shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 rounded"></div>
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary relative z-10" />
                  <h3 className="font-bold text-xl mb-2 text-foreground relative z-10">
                    Curated Selection
                  </h3>
                  <p className="text-muted-foreground text-base relative z-10">
                    Only the best products from trusted vendors, carefully
                    selected for quality, authenticity, and the latest trends in
                    beauty.
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                </div>
                <div className="relative text-center p-8 rounded-md bg-card shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 rounded"></div>
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary relative z-10" />
                  <h3 className="font-bold text-xl mb-2 text-foreground relative z-10">
                    Secure Shopping
                  </h3>
                  <p className="text-muted-foreground text-base relative z-10">
                    Your data and payments are always protected with
                    industry-leading security measures, including encryption and
                    fraud detection.
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                </div>
                <div className="relative text-center p-8 rounded-md bg-card shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 rounded"></div>
                  <Package className="h-12 w-12 mx-auto mb-4 text-primary relative z-10" />
                  <h3 className="font-bold text-xl mb-2 text-foreground relative z-10">
                    Fast Shipping
                  </h3>
                  <p className="text-muted-foreground text-base relative z-10">
                    Get your favorite products deliveblue quickly with our
                    reliable shipping partners, offering multiple options
                    including express delivery.
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                </div>
                <div className="relative text-center p-8 rounded-md bg-card shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden md:col-span-3 lg:col-span-1">
                  <div className="absolute inset-0 rounded"></div>
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary relative z-10" />
                  <h3 className="font-bold text-xl mb-2 text-foreground relative z-10">
                    Competitive Prices
                  </h3>
                  <p className="text-muted-foreground text-base relative z-10">
                    Enjoy the best deals with competitive pricing, frequent
                    discounts, and price match guarantees on all beauty
                    products.
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                </div>
                <div className="relative text-center p-8 rounded-md bg-card shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden md:col-span-3 lg:col-span-1">
                  <div className="absolute inset-0 rounded"></div>
                  <RotateCcw className="h-12 w-12 mx-auto mb-4 text-primary relative z-10" />
                  <h3 className="font-bold text-xl mb-2 text-foreground relative z-10">
                    Easy Returns
                  </h3>
                  <p className="text-muted-foreground text-base relative z-10">
                    Hassle-free returns and exchanges within 30 days, ensuring
                    you can shop with confidence and peace of mind.
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                </div>
                <div className="relative text-center p-8 rounded-md bg-card shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden md:col-span-3 lg:col-span-1">
                  <div className="absolute inset-0 bg-primary rounded-md"></div>
                  <Users className="h-12 w-12 mx-auto mb-4 text-white relative z-10" />
                  <h3 className="font-bold text-xl mb-2 text-white relative z-10">
                    Lorem, ipsum dolor.
                  </h3>
                  <p className="text-white text-base relative z-10">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique.
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white"></div>
                </div>
              </div>

              <div className="relative overflow-hidden w-full bg-background lg:py-16">
                {/* Marquee Container */}
                <div className="flex animate-marquee gap-6">
                  {/* Repeat items so marquee looks infinite */}
                  <div className="flex gap-6">
                    {/* Card 1 */}
                    <div className="relative flex items-center justify-center gap-3 p-4 rounded-md bg-card shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
                      <Users className="h-6 w-6 text-primary relative z-10" />
                      <span className="text-sm font-medium text-foreground relative z-10">
                        24/7 Customer Support
                      </span>
                    </div>

                    {/* Card 2 */}
                    <div className="relative flex items-center justify-center gap-3 p-4 rounded-md bg-card shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
                      <TrendingUp className="h-6 w-6 text-primary relative z-10" />
                      <span className="text-sm font-medium text-foreground relative z-10">
                        Exclusive Member Deals
                      </span>
                    </div>

                    {/* Card 3 */}
                    <div className="relative flex items-center justify-center gap-3 p-4 rounded-md bg-card shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
                      <Star className="h-6 w-6 text-primary relative z-10" />
                      <span className="text-sm font-medium text-foreground relative z-10">
                        Personalized Recommendations
                      </span>
                    </div>

                    {/* Card 4 */}
                    <div className="relative flex items-center justify-center gap-3 p-4 rounded-md bg-blue-500 shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
                      <Globe className="h-6 w-6 text-white relative z-10" />
                      <span className="text-sm font-medium text-white relative z-10">
                        Worldwide Shipping
                      </span>
                    </div>

                    {/* Card 5 */}
                    <div className="relative flex items-center justify-center gap-3 p-4 rounded-md bg-card shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
                      <Leaf className="h-6 w-6 text-primary relative z-10" />
                      <span className="text-sm font-medium text-foreground relative z-10">
                        Eco-Friendly Packaging
                      </span>
                    </div>

                    {/* Card 6 */}
                    <div className="relative flex items-center justify-center gap-3 p-4 rounded-md bg-card shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-w-[250px]">
                      <Leaf className="h-6 w-6 text-primary relative z-10" />
                      <span className="text-sm font-medium text-foreground relative z-10">
                        Lorem ipsum dolor sit.
                      </span>
                    </div>
                  </div>

                  {/* Duplicate set for smooth infinite scroll */}
                  <div className="flex gap-6">
                    {/* Same cards repeated */}
                    {/* ... copy the above cards here again */}
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Featublue Brand Section */}
            <section className="py-12 bg-gray-50">
              <div className="text-center my-8 md:my-12 lg:my-20">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                  Featublue Brand: Aura Cosmetics
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover Aura Cosmetics, a top-rated brand offering
                  high-performance, cruelty-free makeup loved by professionals
                  and enthusiasts.
                </p>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col justify-center">
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      Aura Cosmetics is dedicated to empowering your unique
                      beauty with innovative, cruelty-free products. Their
                      best-selling makeup line combines quality and
                      sustainability, making it a favorite among beauty lovers.
                    </p>
                    <a
                      href="#shop-aura"
                      className="inline-block bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 w-fit"
                    >
                      Explore Aura Products
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="rounded-md overflow-hidden aspect-square shadow-md">
                      <img
                        src="https://placehold.co/320x224.png"
                        alt="Aura Product 1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-md overflow-hidden aspect-square shadow-md">
                      <img
                        src="https://placehold.co/320x224.png"
                        alt="Aura Product 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Testimonials Section */}
            <section className="py-12 bg-background">
              <div className="text-center my-8 md:my-12 lg:my-20">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                  What Our Customers Say
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Hear from real customers who love shopping with us. Their
                  experiences speak for our quality, service, and commitment to
                  your beauty journey.
                </p>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Testimonial 1 */}
                  <div className="relative p-8 rounded-md bg-card shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-row items-start text-left overflow-hidden">
                    <div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-primary mr-1"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-base text-muted-foreground mb-2 line-clamp-3">
                        “Absolutely love the curated selection! Every product
                        I’ve tried has exceeded my expectations. Fast shipping
                        and great prices too.”
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div>
                          <p className="font-bold text-foreground">
                            Manish Sonawane
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Navi Mumbai, Maharashtra
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                    </div>
                  </div>
                  {/* Testimonial 2 */}
                  <div className="relative p-8 rounded-md bg-card shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-row items-start text-left overflow-hidden">
                    <div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-primary mr-1"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-base text-muted-foreground mb-4 line-clamp-3">
                        “The customer support is fantastic! They helped me with
                        a return quickly and professionally. Highly recommend
                        this marketplace.”
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <div>
                          <p className="font-bold text-foreground">
                            Shubham Vanarse
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Nashik, Maharashtra
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                    </div>
                  </div>
                  {/* Testimonial 3 */}
                  <div className="relative p-8 rounded-md bg-card shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-row items-start text-left overflow-hidden">
                    <div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-primary mr-1"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-base text-muted-foreground mb-4 line-clamp-3">
                        “I love the eco-friendly packaging and the variety of
                        brands. The site is easy to use and the deals are
                        unbeatable!”
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <div>
                          <p className="font-bold text-foreground">
                            Siddhi Shinde
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Nashik, Maharashtra
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Call to Action */}

            <section className="mt-20 text-center py-12 bg-secondary/20 rounded-lg">
              <div className="my-5 md:my-8 lg:my-12">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                  Ready to Elevate Your Beauty Routine?
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Join our community and get access to exclusive deals and new
                  arrivals. Sign up for our newsletter today!
                </p>
              </div>

              <div className="mt-20 text-start py-16 bg-primary text-primary-foreground rounded-lg">
                <div className=" max-w-7xl mx-auto px-4">
                  <h2 className="text-4xl md:text-4xl font-bold text-white bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 pb-2.5">
                    Join Our Newsletter
                  </h2>
                  <p className="text-xl text-primary-foreground/80 max-w-7xl mx-auto leading-relaxed mb-6">
                    Become part of our vibrant beauty community and unlock
                    exclusive offers and early access to new arrivals. Subscribe to our newsletter for expert tips, special rewards, and the
                    latest updates. Discover a world of beauty, wellness, and
                    inspiration delivered straight to your inbox every week.
                    Join us on this transformative journey of self-care and
                    well-being.
                  </p>
                  <Button variant="secondary" size="lg">
                    Sign Up Now
                  </Button>
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
const Separator = ({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) => (
  <div
    className={`bg-border ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} ${className}`}
  />
);
