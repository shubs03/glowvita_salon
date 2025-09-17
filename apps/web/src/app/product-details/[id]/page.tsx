

"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, Plus, Minus, Heart, Shield, Truck } from 'lucide-react';
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
};

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.images[0]);

  return (
    <PageContainer>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 py-12">
        {/* Section 1: Image Gallery */}
        <div>
          <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
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
                className={`aspect-square relative rounded-md overflow-hidden cursor-pointer border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
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

        {/* Section 2: Product Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
          
          {/* Section 3: Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <p className="text-lg text-muted-foreground">{product.description}</p>
          
          {/* Section 4: Price */}
          <p className="text-4xl font-bold">₹{product.price.toFixed(2)}</p>

          {/* Section 5: Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-md p-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="font-semibold w-8 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button size="lg" className="flex-grow">Add to Cart</Button>
            <Button variant="outline" size="icon" className="h-12 w-12"><Heart className="h-6 w-6" /></Button>
          </div>

          {/* Section 6: Details */}
          <div className="space-y-2">
            {product.details.map(detail => (
              <div key={detail.title} className="flex">
                <span className="font-semibold w-32">{detail.title}</span>
                <span className="text-muted-foreground">{detail.content}</span>
              </div>
            ))}
          </div>

          {/* Section 7: Shipping & Returns */}
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

      {/* Section 8: Full Description */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">About the Product</h2>
          <p className="text-muted-foreground leading-loose">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
          </p>
        </div>
      </section>

      {/* Section 9: Customer Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Customer Reviews</h2>
          {/* Review components would go here */}
          <p className="text-center text-muted-foreground">Review section coming soon.</p>
        </div>
      </section>

      {/* Section 10: Related Products */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Related Products</h2>
          {/* Product cards would go here */}
          <p className="text-center text-muted-foreground">Related products section coming soon.</p>
        </div>
      </section>
    </PageContainer>
  );
}
