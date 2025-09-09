
import { Card, CardContent } from '@repo/ui/card';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  theme?: 'orange' | 'pink' | 'blue';
}

const themeClasses = {
  orange: {
    bg: 'bg-[#FF9F2D]',
    border: 'border-[#FF9F2D]',
    priceBg: 'bg-[#FF9F2D]/20',
    priceText: 'text-[#9B5B00]',
    wavyBg: 'text-[#FFE8CC]',
  },
  pink: {
    bg: 'bg-[#FF7A92]',
    border: 'border-[#FF7A92]',
    priceBg: 'bg-[#FF7A92]/20',
    priceText: 'text-[#C73C58]',
    wavyBg: 'text-[#FFDCE3]',
  },
  blue: {
    bg: 'bg-[#00BCD4]',
    border: 'border-[#00BCD4]',
    priceBg: 'bg-[#00BCD4]/20',
    priceText: 'text-[#007A8A]',
    wavyBg: 'text-[#B2EBF2]',
  },
};

const SparkleIcon = ({ className }: { className?: string }) => (
    <svg 
        className={cn("absolute w-4 h-4 text-yellow-300", className)}
        viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0L9.34315 6.65685L16 8L9.34315 9.34315L8 16L6.65685 9.34315L0 8L6.65685 6.65685L8 0Z" fill="currentColor"/>
    </svg>
);


export function ProductCard({ name, price, image, hint, rating, reviewCount, theme = 'orange' }: ProductCardProps) {
  const currentTheme = themeClasses[theme];

  return (
    <div className="relative pt-16">
      <Card className="relative group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 pt-12 pb-6 px-6">
        {/* Wavy Background SVG */}
        <div className="absolute inset-0 z-0 opacity-50">
            <svg className={`w-full h-full ${currentTheme.wavyBg}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,20 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="1" />
                <path d="M0,70 Q25,100 50,70 T100,70" stroke="currentColor" fill="none" strokeWidth="1" />
            </svg>
        </div>

        {/* Sparkles */}
        <SparkleIcon className="top-1/2 left-4 transform -translate-y-1/2" />
        <SparkleIcon className="top-1/3 right-8 w-3 h-3" />
        <SparkleIcon className="bottom-24 left-12 w-2 h-2" />
        <SparkleIcon className="bottom-1/3 right-4 w-3 h-3" />


        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 z-20">
          <div className={`relative w-full h-full rounded-full p-1.5 ${currentTheme.border} border-2 bg-white`}>
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner">
              <Image
                src={image}
                alt={name}
                layout="fill"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                data-ai-hint={hint}
              />
            </div>
          </div>
        </div>

        <CardContent className="relative z-10 flex flex-col items-center text-center h-full pt-4">
          <h3 className="font-bold text-xl text-[#0D1B34] uppercase">{name}</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4 h-10">Write description product here, 140ml.</p>
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center my-4 ${currentTheme.priceBg}`}>
             <span className={`text-2xl font-bold ${currentTheme.priceText}`}>${price}</span>
          </div>

          <Button size="lg" className={`w-full mt-auto rounded-xl h-12 text-base font-semibold ${currentTheme.bg} hover:opacity-90`}>
            <ShoppingCart className="mr-2 h-5 w-5" /> ADD TO CART
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

