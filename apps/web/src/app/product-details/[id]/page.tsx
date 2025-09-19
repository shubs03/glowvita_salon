
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, Plus, Minus, Heart, Shield, Truck, ThumbsUp, ThumbsDown, CheckCircle, Droplet, Sun, Leaf } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@repo/ui/page-container';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

const product = {
  id: '1',
  name: 'Aura Revitalizing Serum',
  price: 68.00,
  description: 'A potent, lightweight serum formulated with a blend of antioxidants and hydrating ingredients to combat signs of aging, brighten skin tone, and restore a youthful glow. Perfect for all skin types.',
  images: [
    'https://picsum.photos/seed/product1/800/800',
    'https://picsum.photos/seed/product2/800/800',
    'https://picsum.photos/seed/product3/800/800',
    'https://picsum.photos/seed/product4/800/800',
    'https://picsum.photos/seed/product6/800/800',
    'https://picsum.photos/seed/product7/800/800',
  ],
  rating: 4.5,
  reviews: 120,
  details: [
    { title: 'Size', content: '30ml / 1.0 fl oz' },
    { title: 'Key Ingredients', content: 'Vitamin C, Hyaluronic Acid, Niacinamide' },
    { title: 'Skin Type', content: 'All skin types' },
  ],
  specifications: {
    'Form': 'Serum',
    'Volume': '30 Millilitres',
    'Brand': 'Aura Cosmetics',
    'Scent': 'Light Floral',
    'Item Dimensions': '3 x 3 x 10 cm',
    'Item Weight': '80 Grams',
  },
};

const broughtTogether = [
    { id: '1', name: 'Aura Revitalizing Serum', price: 68.00, image: 'https://picsum.photos/seed/product1/200/200' },
    { id: '2', name: 'Zen Calming Moisturizer', price: 45.00, image: 'https://picsum.photos/seed/product-zen/200/200' },
    { id: '3', name: 'Sol Sunscreen SPF 50', price: 32.00, image: 'https://picsum.photos/seed/product-sol/200/200' },
];

const reviews = [
    { id: 1, author: 'Emily R.', rating: 5, date: '2 weeks ago', text: 'This serum is magic in a bottle! My skin has never looked better. It feels brighter, smoother, and so hydrated. I\'ve gotten so many compliments since I started using it.' },
    { id: 2, author: 'Jessica M.', rating: 4, date: '1 month ago', text: 'I like this serum a lot. It\'s not greasy and absorbs quickly. I\'ve noticed a reduction in my fine lines. The only downside is the price, but a little goes a long way.' },
    { id: 3, author: 'Sarah L.', rating: 5, date: '3 months ago', text: 'Absolutely obsessed! I have sensitive skin and this didn\'t irritate it at all. My dark spots have visibly faded. I will definitely be repurchasing this forever!' },
];

const qna = [
    { id: 1, question: 'Is this product suitable for oily skin?', answer: 'Yes, our serum is formulated to be lightweight and non-comedogenic, making it suitable for all skin types, including oily and acne-prone skin.' },
    { id: 2, question: 'Can I use this with other active ingredients like retinol?', answer: 'Absolutely. The Aura Serum pairs well with most other skincare ingredients. We recommend applying it before heavier creams or oils. If you use retinol at night, you can use our serum in the morning.' },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.images[0]);
  
  const totalBoughtTogetherPrice = broughtTogether.reduce((acc, p) => acc + p.price, 0);

  return (
    <PageContainer className='max-w-7xl'>
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start py-12">
        {/* Left Column: Image Gallery (Sticky) */}
        <div className="lg:sticky top-24">
          <div className="flex gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex flex-col gap-4">
              {product.images.map((img, index) => (
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
            <div className="flex w-full h-auto relative rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={mainImage} 
                alt={product.name} 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="skincare product"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product Details (Scrollable) */}
        <div className="mt-8 lg:mt-0 space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <p className="text-lg text-muted-foreground">{product.description}</p>
            
            <p className="text-4xl font-bold">₹{product.price.toFixed(2)}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border rounded-md p-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="font-semibold w-8 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <Button size="lg" className="flex-grow">Add to Cart</Button>
              <Button variant="outline" size="icon" className="h-12 w-12"><Heart className="h-6 w-6" /></Button>
            </div>

            <div className="space-y-3 pt-4 border-t">
              {product.details.map(detail => (
                <div key={detail.title} className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-semibold text-gray-600">{detail.title}</span>
                  <span className="text-muted-foreground col-span-2">{detail.content}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Free shipping on orders over ₹500</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Sections Added Below */}
      <div className="space-y-16 py-16 border-t">
          {/* Section: Why You'll Love It */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Why You'll Love It</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center p-4">
                    <Droplet className="mx-auto h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Deep Hydration</h3>
                    <p className="text-sm text-muted-foreground">Locks in moisture for supple skin.</p>
                </Card>
                <Card className="text-center p-4">
                    <Sun className="mx-auto h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Brightens Skin</h3>
                    <p className="text-sm text-muted-foreground">Reduces dark spots and evens tone.</p>
                </Card>
                <Card className="text-center p-4">
                    <CheckCircle className="mx-auto h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Reduces Fine Lines</h3>
                    <p className="text-sm text-muted-foreground">Promotes collagen for a youthful look.</p>
                </Card>
                <Card className="text-center p-4">
                    <Leaf className="mx-auto h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Natural Ingredients</h3>
                    <p className="text-sm text-muted-foreground">Gentle, effective, and cruelty-free.</p>
                </Card>
            </div>
          </div>

          {/* Section: How to Use */}
          <div>
            <h2 className="text-2xl font-bold mb-4">How to Use</h2>
            <Card>
                <CardContent className="p-6 grid md:grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg mb-2">1</div>
                        <h3 className="font-semibold">Cleanse</h3>
                        <p className="text-sm text-muted-foreground">Start with a clean, dry face.</p>
                    </div>
                    <div>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg mb-2">2</div>
                        <h3 className="font-semibold">Apply</h3>
                        <p className="text-sm text-muted-foreground">Gently massage a few drops onto your skin.</p>
                    </div>
                    <div>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg mb-2">3</div>
                        <h3 className="font-semibold">Moisturize</h3>
                        <p className="text-sm text-muted-foreground">Follow with your favorite moisturizer.</p>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Section: From the Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">From Aura Cosmetics</h2>
            <Card className="overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/3">
                        <Image src="https://picsum.photos/seed/brand/400/400" alt="Aura Cosmetics" width={400} height={400} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-2/3 p-6">
                        <h3 className="text-xl font-bold mb-2">Pure Ingredients, Radiant Results.</h3>
                        <p className="text-muted-foreground">At Aura Cosmetics, we believe in the power of nature to reveal your inner glow. Our products are crafted with sustainably sourced ingredients and are always free from harsh chemicals. We're committed to creating effective, ethical skincare that you can feel good about.</p>
                        <Button variant="outline" className="mt-4">Learn More</Button>
                    </div>
                </div>
            </Card>
          </div>
      </div>
    </PageContainer>
  );
}
