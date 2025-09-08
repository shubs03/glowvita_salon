
import { Button } from '@repo/ui/button';
import { SalonCard } from './SalonCard';

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'];

const salons = [
  { name: 'Glamour Salon', rating: 4.8, location: 'Mumbai', image: 'https://placehold.co/600x400.png', hint: 'modern salon interior', topRated: true },
  { name: 'Modern Cuts', rating: 4.9, location: 'Delhi', image: 'https://placehold.co/600x400.png', hint: 'barber shop', topRated: true },
  { name: 'Style Hub', rating: 4.7, location: 'Bangalore', image: 'https://placehold.co/600x400.png', hint: 'luxury spa' },
  { name: 'Beauty Bliss', rating: 4.8, location: 'Pune', image: 'https://placehold.co/600x400.png', hint: 'bright beauty salon' },
];

export function FeaturedSalons() {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_60%)] -z-10"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Salons & Spas</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover top-rated salons and spas near you, curated by our team of experts.</p>
        </div>
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {locations.map(loc => (
            <Button key={loc} variant="outline" className="rounded-full shadow-sm hover:shadow-md hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
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
