import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { Heart, Scan } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  hint: string;
  isNew?: boolean;
  hasFocus?: boolean;
}

export function ProductCard({ name, price, image, hint, isNew, hasFocus }: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <CardContent className="p-0">
        <div className="relative aspect-[4/5]">
          <div className="absolute top-0 left-0 w-full h-2/3 bg-[#fde9df] rounded-b-none rounded-t-2xl"></div>
          <div 
            className="absolute top-0 left-0 w-full h-2/3 bg-white"
            style={{ clipPath: 'ellipse(120% 100% at 50% 0%)' }}
          ></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              {isNew ? (
                <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-[#c88e6e] shadow">
                  NEW
                </div>
              ) : <div></div>}
              <Button size="icon" className="bg-[#e4b8a2] hover:bg-[#d59a78] text-white rounded-full h-10 w-10 shadow-sm">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative flex-grow flex items-center justify-center -mt-8">
              <div className="relative w-48 h-48">
                <Image
                  src={image}
                  alt={name}
                  layout="fill"
                  className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={hint}
                />
              </div>
              {hasFocus && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 border-2 border-white/80 rounded-lg relative">
                      <div className="absolute -top-1 -left-1 w-5 h-1 bg-white"></div>
                      <div className="absolute -top-1 -left-1 w-1 h-5 bg-white"></div>
                      <div className="absolute -top-1 -right-1 w-5 h-1 bg-white"></div>
                      <div className="absolute -top-1 -right-1 w-1 h-5 bg-white"></div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-1 bg-white"></div>
                      <div className="absolute -bottom-1 -left-1 w-1 h-5 bg-white"></div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-1 bg-white"></div>
                      <div className="absolute -bottom-1 -right-1 w-1 h-5 bg-white"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 text-center -mt-2 bg-white">
          <h3 className="font-bold text-xl text-[#c88e6e] mb-2">{name}</h3>
          <div className="inline-block px-4 py-2 bg-black rounded-full text-white font-semibold text-lg mb-3">
            ${price.toFixed(2)} USD
          </div>
          <p className="text-sm text-gray-500 h-10">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
