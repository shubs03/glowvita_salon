
"use client";

import { ProductCard } from './ProductCard';

const products = [
  { 
    name: 'Product name', 
    price: 41.00, 
    image: 'https://picsum.photos/id/1027/400/400',
    bgColor: 'bg-pink-100',
    accentColor: '#E6A4B4',
    hint: 'cosmetic bottle',
    isNew: true,
  },
  { 
    name: 'Product name', 
    price: 35.00, 
    image: 'https://picsum.photos/id/106/400/400',
    bgColor: 'bg-orange-100',
    accentColor: '#F2C18D',
    hint: 'serum bottle',
    isNew: false,
  },
  { 
    name: 'Product name', 
    price: 52.00, 
    image: 'https://picsum.photos/id/177/400/400',
    bgColor: 'bg-blue-100',
    accentColor: '#A0BFE0',
    hint: 'cream jar',
    isNew: false,
  },
  { 
    name: 'Product name', 
    price: 48.00, 
    image: 'https://picsum.photos/id/225/400/400',
    bgColor: 'bg-teal-100',
    accentColor: '#78C1F3',
    hint: 'lotion dispenser',
    isNew: false,
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="leafPattern" patternUnits="userSpaceOnUse" width="100" height="100">
                    <path d="M50 0 C-10 50, 60 110, 50 100 C110 40, -10 60, 50 0 Z" fill="hsl(var(--primary) / 0.05)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#leafPattern)" />
            </svg>
        </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Featured Products</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover our best-selling products, curated just for you.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
