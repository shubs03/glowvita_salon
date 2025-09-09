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
    <Card className="group relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <CardContent className="p-0">
        <div className="relative aspect-[4/5]">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-[#fde9df]"
            style={{ clipPath: 'ellipse(130% 100% at 50% 0%)' }}
          ></div>

          {/* Icons on top of the image */}
          <div className="absolute top-4 right-4 z-20">
              <Button size="icon" className="bg-[#e4b8a2]/80 hover:bg-[#d59a78] text-white rounded-full h-10 w-10 shadow-sm backdrop-blur-sm">
                <Heart className="h-5 w-5" />
              </Button>
          </div>

          {isNew && (
             <div className="absolute top-4 left-4 z-20">
              <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-[#c88e6e] shadow">
                NEW
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={name}
                layout="fill"
                className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                data-ai-hint={hint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
          
           {hasFocus && (
            <div className="absolute inset-1/4 flex items-center justify-center pointer-events-none z-20 opacity-80">
                <div className="w-2/3 h-2/3 relative">
                    <div className="absolute -top-1 -left-1 w-6 h-1 bg-white"></div>
                    <div className="absolute -top-1 -left-1 w-1 h-6 bg-white"></div>

                    <div className="absolute -top-1 -right-1 w-6 h-1 bg-white"></div>
                    <div className="absolute -top-1 -right-1 w-1 h-6 bg-white"></div>

                    <div className="absolute -bottom-1 -left-1 w-6 h-1 bg-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-1 h-6 bg-white"></div>

                    <div className="absolute -bottom-1 -right-1 w-6 h-1 bg-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-1 h-6 bg-white"></div>
                </div>
            </div>
          )}

        </div>
        <div className="p-6 pt-2 text-center bg-white">
          <h3 className="font-bold text-xl text-[#c88e6e] mb-3">{name}</h3>
          <div className="inline-block px-4 py-2 bg-black rounded-full text-white font-semibold text-lg mb-3 shadow-md">
            ${price.toFixed(2)} USD
          </div>
          <p className="text-sm text-gray-500 h-10 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
