
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  bgColor: string;
  accentColor: string;
  hint: string;
  isNew?: boolean;
}

const ScannerIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 text-white opacity-80 group-hover:opacity-100 transition-opacity">
    <path d="M15 5H5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 5H55V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 55H5V45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 55H55V45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


export function ProductCard({ name, price, image, bgColor, accentColor, hint, isNew = false }: ProductCardProps) {
  return (
    <div className="group w-full aspect-[3/4] relative">
      <div className={`absolute inset-x-0 top-0 h-2/3 ${bgColor} rounded-t-3xl`}>
         <div 
            className="absolute inset-0" 
            style={{
              clipPath: 'path("M 0 30 C 0 13.4315 13.4315 0 30 0 H 250 C 266.569 0 280 13.4315 280 30 V 220 H 0 Z")'
            }}
          >
             <div className={`w-full h-full ${bgColor} rounded-t-3xl`}></div>
         </div>
      </div>
      
      <div className="relative p-4 flex flex-col h-full">
        {/* Top section with image */}
        <div className="relative flex-1 flex items-center justify-center">
            {isNew && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">
                    NEW
                </div>
            )}
            <div className="absolute top-2 right-2 bg-white/50 backdrop-blur-sm p-2 rounded-full z-20">
                <Heart className="w-5 h-5" style={{ color: accentColor }} />
            </div>

            <Image
                src={image}
                alt={name}
                width={200}
                height={200}
                className="w-40 h-40 object-contain drop-shadow-2xl z-10 group-hover:scale-110 transition-transform duration-300"
                data-ai-hint={hint}
            />

            <ScannerIcon />
        </div>

        {/* Content section */}
        <div className="bg-white rounded-2xl p-4 text-center h-1/3 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{name}</h3>
              <div className="inline-block bg-black text-white text-sm font-semibold px-4 py-1 rounded-full my-2">
                  ${price.toFixed(2)} USD
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
            </p>
        </div>
      </div>
    </div>
  );
}
