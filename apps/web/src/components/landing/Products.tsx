
"use client";

import { ProductCard } from './ProductCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui/button';

const products = [
  { name: "Radiant Glow Serum", price: 41.00, image: 'https://picsum.photos/400/400', hint: 'serum bottle', new: false },
  { name: "Hydrating Facial Cleanser", price: 41.00, image: 'https://picsum.photos/400/400', hint: 'lotion bottle', new: true },
  { name: "Nourishing Night Cream", price: 41.00, image: 'https://picsum.photos/400/400', hint: 'skincare products', new: false },
];

export function Products() {
  return (
    <section className="relative py-20 overflow-hidden bg-[#FEF5F2]">
      <div className="absolute -left-20 -top-20">
        <svg width="343" height="342" viewBox="0 0 343 342" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-11.5 341.5C102.833 301.5 285.5 204.5 342.5 0.5" stroke="#F5C9B3" strokeOpacity="0.5"/>
        </svg>
      </div>
      <div className="absolute -right-20 -bottom-20">
        <svg width="342" height="342" viewBox="0 0 342 342" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M354 -10.5C240.167 29.5 57.5 126.5 0.5 326.5" stroke="#F5C9B3" strokeOpacity="0.5"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline text-[#4A2C2A]">Featured Products</h2>
          <p className="text-[#8B5E3C] mt-2 max-w-xl mx-auto">
            Discover our curated selection of premium skincare products, crafted to bring out your natural radiance.
          </p>
        </div>
        <div className="flex items-center justify-center gap-8">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/50 border-[#F5C9B3] shadow-md hover:bg-white">
            <ArrowLeft className="h-6 w-6 text-[#4A2C2A]" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/50 border-[#F5C9B3] shadow-md hover:bg-white">
            <ArrowRight className="h-6 w-6 text-[#4A2C2A]" />
          </Button>
        </div>
      </div>
    </section>
  );
}
