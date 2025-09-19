"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@repo/ui/components/landing/ProductCard';
import { Button } from '@repo/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=4');
        const data = await response.json();
        
        if (data.success) {
          // Take only the first 4 products for the featured section
          setProducts(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to mock data if API fails
        setProducts([
          {
            name: 'Aura Serum',
            description: 'Revitalizing serum for a radiant glow.',
            price: 68.00,
            image: 'https://picsum.photos/id/1027/400/400',
            hint: 'skincare product bottle',
            rating: 4.5,
            reviewCount: 812,
            vendorName: 'Aura Cosmetics',
            isNew: true,
          },
          {
            name: 'Chroma Balm',
            description: 'Hydrating lip balm with a hint of color.',
            price: 24.00,
            image: 'https://picsum.photos/id/1028/400/400',
            hint: 'cosmetic balm',
            rating: 4.8,
            reviewCount: 1254,
            vendorName: 'Chroma Beauty',
          },
          {
            name: 'Zen Mist',
            description: 'Calming facial mist for instant hydration.',
            price: 35.00,
            image: 'https://picsum.photos/id/1029/400/400',
            hint: 'spray bottle',
            rating: 4.7,
            reviewCount: 987,
            vendorName: 'Serenity Skincare',
          },
          {
            name: 'Terra Scrub',
            description: 'Exfoliating body scrub with natural minerals.',
            price: 48.00,
            image: 'https://picsum.photos/id/1031/400/400',
            hint: 'cosmetic jar',
            rating: 4.9,
            reviewCount: 2310,
            vendorName: 'Earthly Essentials',
            isNew: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Featured Products</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Discover our curated selection of high-quality products from top vendors.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-2xl p-4 shadow-lg animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-4 w-1/2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of high-quality products from top vendors.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={index} className="group">
              <ProductCard 
                name={product.name}
                price={product.price}
                image={product.image}
                hint={product.hint}
                rating={product.rating}
                reviewCount={product.reviewCount}
                vendorName={product.vendorName}
                isNew={product.isNew}
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button 
            asChild
            className="rounded-xl px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}