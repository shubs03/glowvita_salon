
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { X, Plus, Minus, Heart, Shield, Tag, ShoppingCart, ArrowLeft } from 'lucide-react';
import { PageContainer } from '@repo/ui/page-container';
import Link from 'next/link';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';

const suggestedProducts = [
  {
    name: 'Terra Exfoliating Scrub',
    description: 'A gentle scrub for a fresh look.',
    price: 48.00,
    image: 'https://picsum.photos/id/1031/400/400',
    hint: 'cosmetic jar',
    rating: 4.9,
    reviewCount: 2310,
    vendorName: 'Earthly Essentials',
    isNew: true,
  },
  {
    name: 'Zen Calming Moisturizer',
    description: 'Soothe your skin with our calming moisturizer.',
    price: 45.00,
    image: 'https://picsum.photos/id/1029/400/400',
    hint: 'moisturizer bottle',
    rating: 4.7,
    reviewCount: 987,
    vendorName: 'Serenity Skincare',
  },
  {
    name: 'Sol Sunscreen SPF 50',
    description: 'Broad-spectrum protection from the sun.',
    price: 32.00,
    image: 'https://picsum.photos/seed/product-sol/400/400',
    hint: 'sunscreen tube',
    rating: 4.8,
    reviewCount: 1543,
    vendorName: 'SunCare Co.',
  },
  {
    name: 'Luxe Gold Peel-Off Mask',
    description: 'Indulgent peel-off mask for radiant skin.',
    price: 55.00,
    image: 'https://picsum.photos/seed/product-mask/400/400',
    hint: 'face mask application',
    rating: 4.6,
    reviewCount: 750,
    vendorName: 'Golden Beauty',
  },
];

export default function CartPage() {
  const { user, isCrmAuthenticated } = useCrmAuth();
  const { data: cartData, isLoading } = useGetCartQuery(user?._id, { skip: !isCrmAuthenticated || !user?._id });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const cartItems = cartData?.data?.items || [];
  
  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateCartItem({ productId, quantity }).unwrap();
    } catch (error) {
      toast.error('Failed to update quantity.');
    }
  };
  
  const openRemoveModal = (productId: string) => {
    setItemToRemove(productId);
    setIsRemoveModalOpen(true);
  };
  
  const handleRemoveItem = async () => {
    if (itemToRemove) {
      try {
        await removeFromCart({ productId: itemToRemove }).unwrap();
        setIsRemoveModalOpen(false);
        setItemToRemove(null);
        toast.success("Item removed from cart.");
      } catch (error) {
        toast.error("Failed to remove item.");
      }
    }
  };

  const cancelRemove = () => {
    setIsRemoveModalOpen(false);
    setItemToRemove(null);
  };

  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 5.00 : 0;
  const tax = subtotal * 0.08;
  const discount = subtotal * 0.1; // 10% discount
  const total = subtotal + shipping + tax - discount;
  const itemCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <PageContainer className="max-w-7xl">
      <div className="py-8 lg:py-12">
        <div className="text-center mb-8 lg:mb-12 space-y-2 lg:space-y-3">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-headline text-foreground">
            Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
              You have <span className="font-semibold text-foreground">{cartItems.length}</span> item(s) in your cart.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16 lg:py-20">Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16 lg:py-20 space-y-6">
            <ShoppingCart className="mx-auto h-16 w-16 lg:h-20 lg:w-20 text-muted-foreground" />
            <div className="space-y-3">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground">Your cart is empty</h2>
              <p className="text-muted-foreground text-base lg:text-lg max-w-md mx-auto leading-relaxed">
                Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products.
              </p>
            </div>
            <Button asChild size="lg" className="mt-8">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
              {/* Cart Items List */}
              <div className="space-y-4 lg:space-y-6">
                {cartItems.map((item: any) => (
                  <Card key={item.productId} className="flex items-center p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50 hover:border-border">
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-md overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.productImage || 'https://placehold.co/100x100.png'} 
                        alt={item.productName} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={item.productName}
                      />
                    </div>
                    <div className="flex-grow ml-4 lg:ml-6">
                      <h3 className="font-semibold text-base lg:text-lg mb-1">{item.productName}</h3>
                      <p className="text-muted-foreground text-sm lg:text-base">Price: ₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg lg:text-xl">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 mt-2" onClick={() => openRemoveModal(item.productId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Other sections can be added here if needed */}
            </div>

            {/* Sidebar with Order Summary */}
            <div className="col-span-12 lg:col-span-4 lg:sticky top-24 space-y-4 lg:space-y-6">
              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl lg:text-2xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Items ({itemCount})</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-blue-600">-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Est. Shipping</span>
                    <span className="font-medium">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">Est. Tax</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 lg:pt-4 flex justify-between font-bold text-lg lg:text-xl">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3 lg:gap-4 pt-4">
                  <Button className="w-full" size="lg">Proceed to Checkout</Button>
                  {discount > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-blue-600 font-medium">
                        You saved ₹{discount.toFixed(2)} on this order!
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg"><Tag className="h-5 w-5" /> Coupon Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input id="coupon" placeholder="Enter coupon code" className="flex-1" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Secure Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Your payment information is encrypted and secure.</p>
                    <div className="flex justify-center items-center gap-4">
                        <Image src="https://www.logo.wine/a/logo/Visa_Inc./Visa_Inc.-Logo.wine.svg" alt="Visa" width={50} height={30} className="opacity-80" />
                        <Image src="https://www.logo.wine/a/logo/Mastercard/Mastercard-Logo.wine.svg" alt="Mastercard" width={40} height={30} className="opacity-80" />
                        <Image src="https://www.logo.wine/a/logo/PayPal/PayPal-Logo.wine.svg" alt="PayPal" width={70} height={30} className="opacity-80" />
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Remove Item Confirmation Modal */}
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold">Remove Item from Cart</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Are you sure you want to remove this item from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {itemToRemove && (
            <div className="py-4">
              {(() => {
                const item = cartItems.find((i: any) => i.productId === itemToRemove);
                return item ? (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.productImage || 'https://placehold.co/80x80.png'} 
                        alt={item.productName} 
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                      <p className="text-sm font-medium">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={cancelRemove} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveItem} className="flex-1">
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
