
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
import { X, Plus, Minus, Heart, Tag } from 'lucide-react';
import { PageContainer } from '@repo/ui/page-container';

const initialCartItems = [
  { id: 1, name: 'Aura Revitalizing Serum', price: 68.00, quantity: 1, image: 'https://picsum.photos/seed/cart1/200/200', hint: 'skincare product' },
  { id: 2, name: 'Chroma Hydrating Balm', price: 24.00, quantity: 2, image: 'https://picsum.photos/seed/cart2/200/200', hint: 'cosmetic balm' },
  { id: 3, name: 'Terra Exfoliating Scrub', price: 48.00, quantity: 1, image: 'https://picsum.photos/seed/cart3/200/200', hint: 'cosmetic jar' },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  
  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };
  
  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 5.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <PageContainer>
      {/* Section 1: Hero */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold font-headline mb-2">Your Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items and proceed to checkout.</p>
        </div>
      </section>

      {/* Section 2: Cart Items & Summary */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Section 3: Cart Items List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-6">Cart Items ({cartItems.length})</h2>
              <div className="space-y-6">
                {cartItems.length > 0 ? (
                  cartItems.map(item => (
                    <Card key={item.id} className="flex items-center p-4">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={100} 
                        height={100} 
                        className="rounded-md object-cover"
                        data-ai-hint={item.hint}
                      />
                      <div className="flex-grow ml-4">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-muted-foreground text-sm">Price: ₹{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                          <span>{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <div className="mt-2">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleRemoveItem(item.id)}><X className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-8 w-8"><Heart className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p>Your cart is empty.</p>
                )}
              </div>
            </div>

            {/* Section 4: Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  {/* Section 5: Coupon Code */}
                  <div className="w-full">
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="coupon" placeholder="Enter coupon" />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>
                  <Button className="w-full" size="lg">Proceed to Checkout</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: You Might Also Like */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">You Might Also Like</h2>
          {/* Add product cards here */}
          <p className="text-center text-muted-foreground">Product recommendation section.</p>
        </div>
      </section>

      {/* Section 7: Secure Checkout Info */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Shield size={48} className="mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold">Secure Checkout</h3>
          <p className="text-muted-foreground max-w-md mx-auto mt-2">
            Your payment information is encrypted and secure. We support all major payment methods.
          </p>
        </div>
      </section>

      {/* Section 8: Shipping Information */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold">Shipping Information</h3>
          <p className="text-muted-foreground max-w-md mx-auto mt-2">
            Standard shipping takes 3-5 business days. Express shipping is available at checkout.
          </p>
        </div>
      </section>

      {/* Section 9: Return Policy Snippet */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold">Our Return Policy</h3>
          <p className="text-muted-foreground max-w-md mx-auto mt-2">
            Not satisfied? We offer a 30-day money-back guarantee on all products.
          </p>
        </div>
      </section>

      {/* Section 10: Contact Support Link */}
      <section className="py-16 bg-secondary/50 text-center">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Have questions? <a href="/contact" className="text-primary underline">Contact our support team</a>.</p>
        </div>
      </section>
    </PageContainer>
  );
}
