import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Badge } from '@repo/ui/badge';
import { Truck, ShoppingCart, Minus, Plus, Package } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Product {
  _id: string;
  productImage: string;
  productName: string;
  price: number;
  salePrice?: number;
  category: { name: string };
  stock: number;
  vendorId: string;
  supplierName: string;
  supplierEmail: string;
  description: string;
  discount?: number;
  rating?: number;
}

interface BuyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  shippingAddress: string;
  onShippingAddressChange: (address: string) => void;
  onPlaceOrder: () => void;
  isCreatingOrder: boolean;
}

export const BuyNowModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  onQuantityChange,
  shippingAddress,
  onShippingAddressChange,
  onPlaceOrder,
  isCreatingOrder
}: BuyNowModalProps) => {
  if (!product) return null;

  const finalPrice = product.salePrice || product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Quick Checkout</DialogTitle>
          <DialogDescription className="text-sm">
            Complete your purchase securely
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Left Column - Product Info & Quantity */}
          <div className="space-y-4">
            {/* Product Info */}
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <Image 
                  src={product.productImage || 'https://placehold.co/80x80.png'} 
                  alt={product.productName} 
                  fill
                  className="object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-semibold text-sm truncate text-foreground">
                  {product.productName}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {product.supplierName}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-base font-bold text-primary">
                    ₹{finalPrice.toFixed(0)}
                  </span>
                  {product.salePrice && product.price > product.salePrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{product.price.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Quantity</Label>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-none hover:bg-muted" 
                    onClick={() => onQuantityChange(Math.max(1, quantity-1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="w-14 h-9 flex items-center justify-center border-x border-border">
                    <span className="text-sm font-semibold">{quantity}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-none hover:bg-muted" 
                    onClick={() => onQuantityChange(Math.min(product.stock, quantity+1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="text-base font-bold text-primary">
                    ₹{(finalPrice * quantity).toFixed(0)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Package className="h-3 w-3" />
                {product.stock} items available
              </p>
            </div>

            {/* Delivery Info */}
            <div className="flex items-start gap-2 p-3 border border-border rounded-lg">
              <div className="p-1.5 rounded-lg bg-muted">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-xs text-foreground">Fast & Reliable Delivery</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estimated: 3-5 business days
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping & Summary */}
          <div className="space-y-4">
            {/* Shipping Address */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Shipping Address</Label>
              <Input
                value={shippingAddress}
                onChange={(e) => onShippingAddressChange(e.target.value)}
                placeholder="Enter your complete delivery address"
                className="h-10 rounded-lg border-border text-sm"
              />
            </div>

            {/* Order Summary */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <ShoppingCart className="h-3.5 w-3.5" />
                Order Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">
                    Item{quantity > 1 ? 's' : ''} ({quantity})
                  </span>
                  <span className="font-medium text-foreground text-sm">
                    ₹{(finalPrice * quantity).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Shipping Fee</span>
                  <span className="font-semibold text-primary text-sm">FREE</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-foreground">Total Amount</span>
                    <span className="font-bold text-lg text-primary">
                      ₹{(finalPrice * quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={onPlaceOrder} 
            disabled={isCreatingOrder || !shippingAddress.trim()}
            className="flex-1 h-10 bg-primary hover:bg-primary/90"
          >
            {isCreatingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Place Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};