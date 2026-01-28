import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Label } from '@repo/ui/label';
import { Input } from '@repo/ui/input';
import { Star, Building, ShoppingCart, Zap, Minus, Plus } from 'lucide-react';
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

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isAddingToCart: boolean;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  onBuyNow
}: ProductDetailModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.productName}</DialogTitle>
          <DialogDescription>Product details and specifications</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="relative">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
              <Image 
                src={product.productImage || 'https://placehold.co/500x500.png'} 
                alt={product.productName} 
                fill
                className="object-cover" 
              />
            </div>
            <div className="absolute top-3 left-3">
              <Badge variant={product.stock > 10 ? "secondary" : "destructive"} className="rounded-full">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{product.supplierName || 'Supplier'}</p>
                <p className="text-sm text-muted-foreground">Verified Supplier</p>
              </div>
            </div>

            {product.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground text-sm">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <Badge variant="outline" className="mt-1 rounded-full text-xs">
                  {product.category.name}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.5)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-primary">₹{product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)}</p>
                  {product.salePrice && (
                    <p className="text-sm text-muted-foreground line-through">₹{product.price.toFixed(2)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Stock Available</p>
                  <p className="text-lg font-bold">{product.stock}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-semibold">Quantity</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border/30 rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md" 
                    onClick={() => onQuantityChange(Math.max(1, quantity-1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    id="quantity" 
                    type="number" 
                    value={quantity} 
                    onChange={e => onQuantityChange(Math.max(1, Number(e.target.value)))} 
                    className="w-16 h-8 text-center border-0 focus:ring-0 font-bold text-base" 
                    min="1"
                    max={product.stock}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md" 
                    onClick={() => onQuantityChange(Math.min(product.stock, quantity+1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">Total: ₹{(product.price * quantity).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {quantity > 1 && `₹${product.price.toFixed(2)} × ${quantity}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 h-10 rounded-lg" 
                onClick={() => onAddToCart(product, quantity)}
                disabled={product.stock === 0 || isAddingToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button 
                className="flex-1 h-10 rounded-lg bg-green-600 hover:bg-green-700" 
                onClick={() => {
                  onClose();
                  onBuyNow(product);
                }}
                disabled={product.stock === 0}
              >
                <Zap className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};