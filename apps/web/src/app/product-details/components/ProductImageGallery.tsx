import React from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  vendorId: string;
  vendorName: string;
  category: string;
  stock: number;
  rating: number;
  hint: string;
  images?: string[];
}

interface ProductImageGalleryProps {
  product: Product;
  mainImage: string;
  setMainImage: (image: string) => void;
  handleWishlistToggle: () => void;
  isWishlisted: boolean;
  isWishlistLoading: boolean;
  handleBuyNow: () => void;
  handleAddToCart: () => void;
  isOutOfStock: boolean;
  isBuyingNow: boolean;
  isAddingToCart: boolean;
  vendorProducts: any[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  product,
  mainImage,
  setMainImage,
  handleWishlistToggle,
  isWishlisted,
  isWishlistLoading,
  handleBuyNow,
  handleAddToCart,
  isOutOfStock,
  isBuyingNow,
  isAddingToCart,
  vendorProducts,
}) => {
  const router = useRouter();
  
  return (
    <div className="lg:sticky top-24">
      <div className="flex gap-4">
        {/* Vertical Thumbnails */}
        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {product.images?.map((img: any, index: any) => (
            <div 
              key={index} 
              className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${mainImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'}`}
              onClick={() => setMainImage(img)}
            >
              <Image 
                src={img} 
                alt={`${product.name} thumbnail ${index + 1}`} 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="product photo"
              />
            </div>
          ))}
        </div>
        
        {/* Main Image */}
        <div className="flex w-full h-96 relative rounded-lg overflow-hidden shadow-lg">
          <Image 
            src={mainImage} 
            alt={product.name} 
            layout="fill" 
            objectFit="cover"
            className="w-full h-full"
            data-ai-hint="skincare product"
          />
        </div>
      </div>
      
      {/* Buttons Below Main Image */}
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current text-primary" : ""}`} />
          </Button>
          
          <Button 
            size="lg" 
            variant="default"
            className="flex-1 bg-primary hover:bg-primary/95" 
            onClick={() => handleBuyNow()}
            disabled={isOutOfStock || isBuyingNow}
          >
            {isBuyingNow ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              'Buy Now'
            )}
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="flex-1 border-2 border-primary hover:border-primary/95" 
            onClick={() => handleAddToCart()}
            disabled={isOutOfStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </Button>
        </div>
      </div>
      
      {/* Other Products from Same Vendor Section */}
      {vendorProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg text-right font-semibold mb-4">More from {product.vendorName}</h3>
          <div className="flex justify-end gap-4">
            {(vendorProducts as any[]).slice(0, 4).map((prod: any) => (
              <div 
                key={prod.id} 
                className="relative group cursor-pointer"
                onClick={() => router.push(`/product-details/${prod.id}`)}
              >
                <div className="w-20 h-20 overflow-hidden rounded-md shadow-sm">
                  <Image 
                    src={Array.isArray(prod.images) && prod.images.length > 0 
                      ? prod.images[0] 
                      : prod.image || "https://placehold.co/80x80/e2e8f0/64748b?text=Product"}
                    alt={prod.name} 
                    width={80}
                    height={80}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  {prod.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;