
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, Plus, Minus, Heart, Shield, Truck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@repo/ui/page-container';

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
          <div className="aspect-square max-w-96 max-h-96 relative rounded-lg overflow-hidden mb-4 shadow-lg">
            <Image 
              src={mainImage} 
              alt={product.name} 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="skincare product"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, index) => (
              <div 
                key={index} 
                className={`aspect-square relative rounded-md overflow-hidden cursor-pointer border-2 transition-all ${mainImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'}`}
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

            <div className="space-y-2">
              {product.details.map(detail => (
                <div key={detail.title} className="flex">
                  <span className="font-semibold w-32">{detail.title}</span>
                  <span className="text-muted-foreground">{detail.content}</span>
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
          
          {/* Section: Specifications */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4 text-sm border rounded-lg p-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <p className="font-semibold">{key}</p>
                  <p className="text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Frequently Bought Together */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Frequently Bought Together</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  {broughtTogether.map((p, index) => (
                    <React.Fragment key={p.id}>
                      <div className="flex flex-col items-center text-center">
                        <Image src={p.image} alt={p.name} width={80} height={80} className="rounded-md" />
                        <p className="text-xs mt-2 max-w-[80px] truncate">{p.name}</p>
                      </div>
                      {index < broughtTogether.length - 1 && <Plus className="text-muted-foreground" />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-6 text-center">
                    <p className="text-lg">Total Price: <span className="font-bold">₹{totalBoughtTogetherPrice.toFixed(2)}</span></p>
                    <Button className="mt-2">Add all three to cart</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Ratings & Reviews */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Ratings & Reviews</h2>
            <Card>
              <CardContent className="p-6 space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section: Questions & Answers */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Questions & Answers</h2>
            <Card>
              <CardContent className="p-6 space-y-6">
                {qna.map(item => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0">
                    <p className="font-semibold">Q: {item.question}</p>
                    <p className="text-sm text-muted-foreground mt-2">A: {item.answer}</p>
                     <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">Was this helpful?</span>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs h-auto p-1"><ThumbsUp className="h-3 w-3" /> Yes</Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs h-auto p-1"><ThumbsDown className="h-3 w-3" /> No</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
