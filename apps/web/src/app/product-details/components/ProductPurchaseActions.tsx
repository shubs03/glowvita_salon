'use client';

import React from 'react';
import { Button } from '@repo/ui/button';
import { cn } from "@repo/ui/cn";
import { Loader2, AlertCircle, ShoppingCart, ChevronsRight } from 'lucide-react';

interface ProductPurchaseActionsProps {
  handleWishlistToggle: () => void;
  isWishlisted: boolean;
  isWishlistLoading: boolean;
  handleBuyNow: () => void;
  handleAddToCart: () => void;
  isOutOfStock: boolean;
  isBuyingNow: boolean;
  isAddingToCart: boolean;
  isSubscriptionExpired?: boolean;
}

const ProductPurchaseActions: React.FC<ProductPurchaseActionsProps> = ({
  handleBuyNow,
  handleAddToCart,
  isOutOfStock,
  isBuyingNow,
  isAddingToCart,
  isSubscriptionExpired = false,
}) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center w-full">
      {isSubscriptionExpired && (
        <div className="w-full mb-4 bg-red-50 border border-red-100 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            Purchases are temporarily disabled for this salon.
          </p>
        </div>
      )}
      
      {!isSubscriptionExpired && (
        <div className="flex items-center justify-center gap-4 w-full px-4">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 max-w-[200px] border-[#8c828c] text-[#493c4e] hover:bg-gray-50 hover:text-[#493c4e] font-semibold rounded-md h-12"
            onClick={() => handleAddToCart()}
            disabled={isOutOfStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            Add to cart
          </Button>

          <Button
            size="lg"
            className="flex-1 max-w-[200px] bg-[#3e2a3e] hover:bg-[#2c1d2c] text-white font-semibold rounded-md h-12"
            onClick={() => handleBuyNow()}
            disabled={isOutOfStock || isBuyingNow}
          >
            {isBuyingNow ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ChevronsRight className="mr-2 h-5 w-5" />
            )}
            Buy Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductPurchaseActions;