import React from "react";
import ProductCard from "@/components/ProductCard";
import { useGetPublicVendorProductsQuery, useGetPublicProductsQuery } from "@repo/store/api";
import { useSalonFilter } from "@/components/landing/SalonFilterContext";

interface Product {
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
  rating: number;
  hint: string;
}

interface RelevantProductsProps {
  currentProductId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  categoryId: string;
  onBuyNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isSubscriptionExpired?: boolean;
}

const RelevantProducts: React.FC<RelevantProductsProps> = ({
  currentProductId,
  vendorId,
  vendorName,
  category,
  categoryId,
  onBuyNow,
  onAddToCart,
  isSubscriptionExpired = false,
}) => {
  const { userLat, userLng } = useSalonFilter();

  // 1. Fetch products by vendor
  const {
    data: vendorProductsResponse,
    isLoading: vendorProductsLoading,
  } = useGetPublicVendorProductsQuery(vendorId, {
    skip: !vendorId,
  });

  // 2. Fetch products by category (as fallback/supplement)
  const {
    data: categoryProductsResponse,
    isLoading: categoryProductsLoading,
  } = useGetPublicProductsQuery({
    categoryId,
    lat: userLat || undefined,
    lng: userLng || undefined,
  }, {
    skip: !categoryId,
  });

  const vendorProducts: any[] = vendorProductsResponse?.products || [];
  const categoryProducts: any[] = categoryProductsResponse?.products || [];

  // Merge and deduplicate products
  const combinedProductsMap = new Map();

  // Helper to format product
  const formatProduct = (product: any) => {
    if ((product.stock || 0) <= 0) return null;

    return {
      id: product.id || product._id,
      name: product.name,
      description: product.description || "",
      price: Number(product.price) || 0,
      salePrice: product.salePrice && Number(product.salePrice) > 0 ? Number(product.salePrice) : 0,
      image:
        product.image ||
        (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) ||
        product.productImage ||
        "/images/product-placeholder.png",
      vendorId: product.vendorId || vendorId,
      vendorName: product.vendorName || vendorName,
      category: product.category || category,
      stock: product.stock || 0,
      rating: product.rating || 0,
      hint: product.hint || product.description || product.name,
    };
  };

  // Add vendor products first
  vendorProducts.forEach(p => {
    const formatted = formatProduct(p);
    if (formatted && formatted.id !== currentProductId) {
      combinedProductsMap.set(formatted.id, formatted);
    }
  });

  // Supplement with category products if needed
  categoryProducts.forEach(p => {
    const formatted = formatProduct(p);
    if (formatted && formatted.id !== currentProductId && !combinedProductsMap.has(formatted.id)) {
      combinedProductsMap.set(formatted.id, formatted);
    }
  });

  const relevantProducts: Product[] = Array.from(combinedProductsMap.values()).slice(0, 8);

  if (vendorProductsLoading || categoryProductsLoading) {
    return (
      <section className="py-12">
        <div className="h-8 w-48 bg-gray-200 animate-pulse mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (relevantProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Relevant Products
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          These awards are a testament to our commitment to excellence and our
          dedication to providing the best salon software solutions to our
          customers.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {relevantProducts.map((product: Product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            hint={product.hint}
            rating={product.rating}
            reviewCount={0}
            vendorName={product.vendorName}
            vendorId={product.vendorId}
            description={product.description}
            category={product.category}
            salePrice={product.salePrice}
            stock={product.stock}
            onBuyNow={() => onBuyNow(product)}
            onAddToCart={() => onAddToCart(product)}
          />
        ))}
      </div>
    </section>
  );
};

export default RelevantProducts;