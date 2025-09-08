
"use client";

import { Button } from '@repo/ui/button';
import { SalonCard } from './SalonCard';

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'];

const salons = [
  { name: 'Cybernetic Styles', rating: 4.8, location: 'Neo Mumbai', image: 'https://placehold.co/600x400.png', hint: 'futuristic salon interior', topRated: true },
  { name: 'Chrome & Cuts', rating: 4.9, location: 'Tech Delhi', image: 'https://placehold.co/600x400.png', hint: 'cyberpunk barber shop', topRated: true },
  { name: 'Aether Spa', rating: 4.7, location: 'Bangalore', image: 'https://placehold.co/600x400.png', hint: 'zen spa with neon lights' },
  { name: 'Quantum Quarters', rating: 4.8, location: 'Pune', image: 'https://placehold.co/600x400.png', hint: 'minimalist beauty salon' },
];

export function FeaturedSalons() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] -z-10"></div>
        <div className="absolute inset-0 bg-dots-grid -z-10 [mask-image:radial-gradient(white,transparent_70%)]"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Featured Holo-Salons</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover elite cyber-stylists and bio-spas in your sector.</p>
        </div>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {locations.map(loc => (
            <Button key={loc} variant="outline" className="rounded-full shadow-sm hover:shadow-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm bg-background/50">
                {loc}
            </Button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {salons.map((salon, index) => (
            <SalonCard key={index} {...salon} />
          ))}
        </div>
      </div>
    </section>
  );
}
