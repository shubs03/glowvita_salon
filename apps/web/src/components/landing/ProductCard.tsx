
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  hint: string;
  new?: boolean;
}

export function ProductCard({ name, price, image, hint, new: isNew = false }: ProductCardProps) {
  return (
    <Card className="w-full max-w-sm rounded-3xl border-none shadow-xl overflow-hidden bg-white group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="relative bg-[#FAEBE5] overflow-hidden">
        {/* Arched background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white" style={{ clipPath: 'ellipse(100% 55% at 50% 100%)' }}></div>
        
        {/* Product Image */}
        <div className="relative z-10 aspect-[4/3] p-6">
          <Image
            src={image}
            alt={name}
            layout="fill"
            className="object-contain group-hover:scale-105 transition-transform duration-500 ease-in-out"
            data-ai-hint={hint}
          />
        </div>

        {/* Icons and Badges */}
        <div className="absolute top-4 right-4 z-20">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm text-[#4A2C2A] hover:bg-white">
            <Heart className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          {isNew && (
            <div className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-[#4A2C2A] shadow-md">
              NEW
            </div>
          )}
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 0V12.5" stroke="white" strokeWidth="4"/>
            <path d="M75 0V12.5" stroke="white" strokeWidth="4"/>
            <path d="M25 100V87.5" stroke="white" strokeWidth="4"/>
            <path d="M75 100V87.5" stroke="white" strokeWidth="4"/>
            <path d="M0 25H12.5" stroke="white" strokeWidth="4"/>
            <path d="M0 75H12.5" stroke="white" strokeWidth="4"/>
            <path d="M100 25H87.5" stroke="white" strokeWidth="4"/>
            <path d="M100 75H87.5" stroke="white" strokeWidth="4"/>
          </svg>
        </div>
      </div>
      
      <CardContent className="p-6 text-center bg-white relative -mt-8">
        <h3 className="text-xl font-bold text-[#4A2C2A] mb-2">{name}</h3>
        <div className="inline-block bg-[#2D2A2A] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-md">
          ${price.toFixed(2)} USD
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
        </p>
      </CardContent>
    </Card>
  );
}
