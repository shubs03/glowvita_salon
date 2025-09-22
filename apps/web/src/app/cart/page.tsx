
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

const initialCartItems = [
  { id: 1, name: 'Aura Revitalizing Serum', price: 68.00, quantity: 1, image: 'https://picsum.photos/seed/cart1/200/200', hint: 'skincare product' },
  { id: 2, name: 'Chroma Hydrating Balm', price: 24.00, quantity: 2, image: 'https://picsum.photos/seed/cart2/200/200', hint: 'cosmetic balm' },
];

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
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  
  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };
  
  const openRemoveModal = (id: number) => {
    setItemToRemove(id);
    setIsRemoveModalOpen(true);
  };
  
  const handleRemoveItem = () => {
    if (itemToRemove) {
      setCartItems(cartItems.filter(item => item.id !== itemToRemove));
      setIsRemoveModalOpen(false);
      setItemToRemove(null);
    }
  };

  const cancelRemove = () => {
    setIsRemoveModalOpen(false);
    setItemToRemove(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 5.00 : 0;
  const tax = subtotal * 0.08;
  const discount = subtotal * 0.1; // 10% discount
  const total = subtotal + shipping + tax - discount;
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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

        {cartItems.length === 0 ? (
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
                {cartItems.map(item => (
                  <Card key={item.id} className="flex items-center p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50 hover:border-border">
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-md overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={item.hint}
                      />
                    </div>
                    <div className="flex-grow ml-4 lg:ml-6">
                      <h3 className="font-semibold text-base lg:text-lg mb-1">{item.name}</h3>
                      <p className="text-muted-foreground text-sm lg:text-base">Price: ₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg lg:text-xl">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 mt-2" onClick={() => openRemoveModal(item.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* How to Complete Your Order Section */}
              <div className="mt-16 lg:mt-20">
                <div className="text-center mb-10 lg:mb-12 space-y-3">
                  <h2 className="text-2xl lg:text-3xl font-bold font-headline text-foreground">How to Complete Your Order</h2>
                  <p className="text-muted-foreground text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                    Follow these simple steps to securely complete your purchase
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {/* Step 1 */}
                   <Card className="text-center p-6 lg:p-8 border border-border/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-background to-blue-50">
                    {/* Breaking Line Border Effect */}
                    <div className="mb-4 relative z-10">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-xl lg:text-2xl font-bold">1</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2 text-blue-700">Review Cart</h3>
                      <p className="text-sm lg:text-base text-blue-600 leading-relaxed">
                        Check your items, quantities, and pricing before proceeding
                      </p>
                    </div>
                  </Card>

                  {/* Step 2 - Apply Coupon with Breaking Border */}
                  <Card className="text-center p-6 lg:p-8 relative overflow-hidden hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-background to-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-400">
                    {/* Breaking Line Border Effect */}
                    <div className="mb-4 relative z-10">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-xl lg:text-2xl font-bold">2</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2 text-blue-700">Apply Coupon</h3>
                      <p className="text-sm lg:text-base text-blue-600 leading-relaxed">
                        Enter any discount codes you have to save on your order
                      </p>
                    </div>
                  </Card>

                  {/* Step 3 */}
                  <Card className="text-center p-6 lg:p-8 border border-border/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-background to-blue-50">
                    <div className="mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-xl lg:text-2xl font-bold">3</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2 text-blue-700">Checkout</h3>
                      <p className="text-sm lg:text-base text-blue-600 leading-relaxed">
                        Proceed to secure checkout and enter your payment details
                      </p>
                    </div>
                  </Card>

                  {/* Step 4 */}
                  <Card className="text-center p-6 lg:p-8 border border-border/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-background to-blue-50">
                    <div className="mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-xl lg:text-2xl font-bold">4</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2 text-blue-700">Confirmation</h3>
                      <p className="text-sm lg:text-base text-blue-600 leading-relaxed">
                        Receive order confirmation and tracking information via email
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Additional Information */}
                <div className="mt-10 lg:mt-12 text-center">
                  <Card className="bg-primary/5 border border-primary/20 p-6 lg:p-8">
                    <div className="space-y-4">
                      <h3 className="text-lg lg:text-xl font-semibold text-foreground">Need Help?</h3>
                      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Our customer support team is available 24/7 to assist you with your order. 
                        Contact us via chat, email, or phone if you have any questions.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Button variant="outline" size="sm">
                          Live Chat
                        </Button>
                        <Button variant="outline" size="sm">
                          Email Support
                        </Button>
                        <Button variant="outline" size="sm">
                          Call: 1-800-BEAUTY
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
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
                const item = cartItems.find(item => item.id === itemToRemove);
                return item ? (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
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
