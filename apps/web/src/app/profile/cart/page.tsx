
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { X, Plus, Minus, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { PageContainer } from '@repo/ui/page-container';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  productImage?: string;
}

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: cartData, isLoading } = useGetCartQuery(user?._id, { skip: !isAuthenticated || !user?._id });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const router = useRouter();

  const cartItems: CartItem[] = cartData?.data?.items || [];

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      if (quantity > 0) {
        await updateCartItem({ productId, quantity }).unwrap();
      } else {
        // This case should be handled by the remove button, but as a safeguard:
        await removeFromCart({ productId }).unwrap();
      }
    } catch (error) {
      toast.error('Failed to update quantity.');
    }
  };

  const openRemoveModal = (item: CartItem) => {
    setItemToRemove(item);
    setIsRemoveModalOpen(true);
  };

  const handleRemoveItem = async () => {
    if (itemToRemove) {
      try {
        await removeFromCart({ productId: itemToRemove.productId }).unwrap();
        toast.success("Item removed from cart.");
      } catch (error) {
        toast.error("Failed to remove item.");
      } finally {
        setIsRemoveModalOpen(false);
        setItemToRemove(null);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 50.00 : 0; // Example shipping cost
  const tax = subtotal * 0.05; // Example 5% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    // This assumes the cart contains items from a single vendor for simplicity.
    // A real implementation would group by vendorId or handle multi-vendor checkouts.
    if (cartItems.length > 0) {
      const checkoutProduct = {
        id: cartItems.map(item => item.productId).join(','), // A bit of a hack for multiple items
        name: cartItems.length > 1 ? `${cartItems.length} items` : cartItems[0].productName,
        price: total,
        image: cartItems[0].productImage,
        quantity: 1, // We'll use the total price
        vendorId: (cartItems[0] as any).vendorId,
        vendorName: (cartItems[0] as any).supplierName,
      };
      localStorage.setItem('buyNowProduct', JSON.stringify(checkoutProduct));
      router.push('/checkout');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Cart</CardTitle>
              <CardDescription>You have {cartItems.length} item(s) in your cart.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-10">Loading cart...</div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-md">
                      <Image 
                        src={item.productImage || 'https://placehold.co/80x80.png'} 
                        alt={item.productName} 
                        width={80} 
                        height={80} 
                        className="rounded-md object-cover" 
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-semibold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => openRemoveModal(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled={cartItems.length === 0} onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{itemToRemove?.productName}" from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveItem}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
