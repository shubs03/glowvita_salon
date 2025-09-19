
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, Plus, Minus, Heart, Shield, Truck, ThumbsUp, ThumbsDown, Droplets, Leaf, FlaskConical } from 'lucide-react';
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
          
          {/* Section: Specifications */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <p className="font-semibold text-gray-600">{key}</p>
                      <p className="text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Frequently Bought Together */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>
            <Card className="bg-gradient-to-br from-background via-secondary/10 to-background border-border/20 shadow-lg">
              <CardContent className="p-8">
                {/* Product Cards Grid */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
                  {broughtTogether.map((p, index) => (
                    <React.Fragment key={p.id}>
                      {/* Product Card */}
                      <div className="group relative bg-background/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                        {/* Product Image */}
                        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-secondary/10">
                          <Image 
                            src={p.image} 
                            alt={p.name} 
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          {/* Subtle overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                            {p.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">₹{p.price.toFixed(2)}</span>
                          </div>
                            {index === 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                This item
                              </span>
                            )}
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>

                      {/* Plus Icon Connector */}
                      {index < broughtTogether.length - 1 && (
                        <div className="flex justify-center items-center md:justify-center md:items-center">
                          <div className="relative">
                            {/* Animated Plus Icon */}
                            <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full flex items-center justify-center border border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110">
                              <Plus className="h-4 w-4 text-primary" />
                            </div>
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full blur-sm opacity-50" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Total Section */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <div className="space-y-4">                    
                    {/* 2-Column Layout */}
                    <div className="flex items-center justify-between gap-6">
                      {/* Left Column - Text and Button */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <p className="text-3xl font-bold text-foreground">Bundle Price</p>
                          {/* Price Values on same line */}
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-foreground">
                              ₹{(totalBoughtTogetherPrice * 0.95).toFixed(2)}
                            </span>
                            <span className="text-2xl text-muted-foreground line-through">
                              ₹{totalBoughtTogetherPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full px-4 py-2 font-medium"
                        >
                          Add Bundle to Cart
                        </Button>
                      </div>
                      
                    </div>

                    {/* Savings Badge */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                        Save<span className='font-extrabold'>₹{(broughtTogether.reduce((acc, p) => acc + p.price, 0) * 0.05).toFixed(2)}</span>when bought together
                      </div>
                    </div>
                  </div>
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
                <div className="pt-4">
                  <Label htmlFor="ask-question" className="font-semibold">Have a question?</Label>
                  <div className="flex gap-2 mt-2">
                    <Input id="ask-question" placeholder="Ask a question about this product..." />
                    <Button>Submit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* NEW SECTIONS ADDED BELOW */}
      <div className="space-y-16 mt-16">
        {/* Section: Why You'll Love It */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Why You'll Love It</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-6">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                <Droplets className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Intense Hydration</h3>
              <p className="text-muted-foreground mt-2">Hyaluronic Acid provides deep, lasting moisture for plump, supple skin.</p>
            </Card>
            <Card className="p-6">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Brightens Complexion</h3>
              <p className="text-muted-foreground mt-2">Vitamin C works to fade dark spots and even out skin tone for a radiant look.</p>
            </Card>
            <Card className="p-6">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                <FlaskConical className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Fights Aging</h3>
              <p className="text-muted-foreground mt-2">Powerful antioxidants combat free radicals and reduce the appearance of fine lines.</p>
            </Card>
          </div>
        </section>

        {/* Section: How to Use */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">How to Use</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <Card className="flex items-center p-4">
              <div className="bg-secondary text-secondary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">1</div>
              <div>
                <h4 className="font-semibold">Cleanse</h4>
                <p className="text-sm text-muted-foreground">Start with a clean, dry face.</p>
              </div>
            </Card>
            <Card className="flex items-center p-4">
              <div className="bg-secondary text-secondary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">2</div>
              <div>
                <h4 className="font-semibold">Apply Serum</h4>
                <p className="text-sm text-muted-foreground">Apply 2-3 drops of Aura Serum and gently massage into your skin.</p>
              </div>
            </Card>
            <Card className="flex items-center p-4">
              <div className="bg-secondary text-secondary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">3</div>
              <div>
                <h4 className="font-semibold">Moisturize</h4>
                <p className="text-sm text-muted-foreground">Follow up with your favorite moisturizer to lock in the hydration.</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section: From the Brand */}
        <section>
          <Card className="bg-secondary/50">
            <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 text-center">
                <h3 className="text-2xl font-bold font-headline">Aura Cosmetics</h3>
                <p className="text-muted-foreground mt-1">Science-backed skincare</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-lg text-muted-foreground italic">"At Aura, we believe that radiant skin is a reflection of overall wellness. Our mission is to blend cutting-edge science with nature's finest ingredients to create products that not only beautify but also nourish."</p>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* NEW SECTION: Customer Reviews & Q&A */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-8">Customer Reviews & Q&A</h2>
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Reviews */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <div className="flex items-center gap-2">
                      <StarRating rating={product.rating} />
                      <span className="text-muted-foreground text-sm">{product.rating} out of 5</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold">{review.author}</p>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.date}</p>
                        <p>{review.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {/* Q&A */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions & Answers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {qna.map(item => (
                      <div key={item.id} className="border-t pt-4">
                        <p className="font-semibold mb-2">Q: {item.question}</p>
                        <p className="text-muted-foreground text-sm">A: {item.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
        </section>
      </div>
    </PageContainer>
  );
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ))}
  </div>
);
