import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Badge } from '@repo/ui/badge';
import { Truck, ShoppingCart, Minus, Plus } from 'lucide-react';
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Checkout</DialogTitle>
          <DialogDescription>Complete your purchase in just a few clicks</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
            <Image 
              src={product.productImage || 'https://placehold.co/60x60.png'} 
              alt={product.productName} 
              width={60} 
              height={60} 
              className="rounded-lg object-cover border border-border/20" 
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{product.productName}</h4>
              <p className="text-xs text-muted-foreground truncate">By: {product.supplierName}</p>
              <p className="text-base font-bold text-primary">₹{finalPrice.toFixed(0)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center border border-border/30 rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-none hover:bg-muted" 
                  onClick={() => onQuantityChange(Math.max(1, quantity-1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={e => onQuantityChange(Math.max(1, Number(e.target.value)))} 
                  className="w-16 h-8 text-center border-0 focus-visible:ring-0 font-medium" 
                  min="1"
                  max={product.stock}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-none hover:bg-muted" 
                  onClick={() => onQuantityChange(Math.min(product.stock, quantity+1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-primary">₹{(finalPrice * quantity).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Shipping Address</Label>
            <Input
              value={shippingAddress}
              onChange={(e) => onShippingAddressChange(e.target.value)}
              placeholder="Enter your complete address"
              className="h-9 rounded-md border-border/30 focus-visible:border-primary"
            />
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({quantity} items)</span>
                <span>₹{(finalPrice * quantity).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">₹{(finalPrice * quantity).toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-green-800">Fast Delivery</p>
              <p className="text-green-600">3-5 business days</p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onPlaceOrder} 
            disabled={isCreatingOrder}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCreatingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Placing...
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