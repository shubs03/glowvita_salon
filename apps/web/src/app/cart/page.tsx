
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/card';
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
  
  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };
  
  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 5.00 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <PageContainer>
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <p className="text-muted-foreground mt-2">
              You have {cartItems.length} item(s) in your cart.
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Cart Items List */}
              <div className="space-y-6">
                {cartItems.map(item => (
                  <Card key={item.id} className="flex items-center p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={item.hint}
                      />
                    </div>
                    <div className="flex-grow ml-4">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">Price: ₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 mt-2" onClick={() => handleRemoveItem(item.id)}><X className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* You Might Also Like Section */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8">You Might Also Like</h2>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {suggestedProducts.slice(0,3).map((product, index) => (
                    <ProductCard 
                      key={index} 
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      image={product.image}
                      hint={product.hint}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      vendorName={product.vendorName}
                      isNew={product.isNew}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar with Order Summary */}
            <div className="col-span-12 lg:col-span-4 lg:sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button className="w-full" size="lg">Proceed to Checkout</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Tag className="h-5 w-5" /> Coupon Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input id="coupon" placeholder="Enter coupon code" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5" /> Secure Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Your payment information is encrypted and secure.</p>
                    <div className="flex justify-center items-center gap-4">
                        <Image src="https://www.logo.wine/a/logo/Visa_Inc./Visa_Inc.-Logo.wine.svg" alt="Visa" width={50} height={30} />
                        <Image src="https://www.logo.wine/a/logo/Mastercard/Mastercard-Logo.wine.svg" alt="Mastercard" width={40} height={30} />
                        <Image src="https://www.logo.wine/a/logo/PayPal/PayPal-Logo.wine.svg" alt="PayPal" width={70} height={30} />
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
